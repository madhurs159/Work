#!/usr/bin/env python3
"""Beat grid of a music track, for cutting on the beat.

  beats.py <music> [--out beats.json] [--bpm 128]      --bpm forces the tempo when the guess is half or double

Writes bpm, beats (seconds), bars (bar starts: a 4/4 guess that can sit 2 beats off), energy per beat (0-1),
sections (low / mid / high), drops (where the energy jumps) and hits (the strongest accents).
Needs ffmpeg on PATH and numpy.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR, HOP, NFFT = 22050, 441, 1024
FPS = SR / HOP              # 50 analysis frames per second


def load(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                       capture_output=True)
    if r.returncode or not r.stdout:
        sys.exit(f'ffmpeg could not read {path}: {r.stderr.decode(errors="replace")[:300]}')
    return np.frombuffer(r.stdout, dtype=np.float32)


def onsets(y):
    """Per analysis frame: accent strength over all bands, accent strength in the bass, and the level in dB of
    the 3-10 kHz band (hiss, air, cymbals, whooshes). Frame i is centred on sample i*HOP."""
    pad = np.zeros(NFFT // 2, np.float32)
    y = np.concatenate([pad, y, pad])
    n = 1 + (len(y) - NFFT) // HOP
    win = np.hanning(NFFT).astype(np.float32)
    edges = np.unique(np.geomspace(1, NFFT // 2, 41).astype(int))       # ~40 log-spaced bands
    bands = np.empty((n, len(edges) - 1), np.float32)
    bass = np.empty(n, np.float32)
    air = np.empty(n, np.float32)
    for a in range(0, n, 4096):
        rows = np.arange(a, min(n, a + 4096))
        S = np.abs(np.fft.rfft(y[np.arange(NFFT)[None, :] + HOP * rows[:, None]] * win, axis=1))
        bands[rows] = np.log1p(10 * np.add.reduceat(S, edges[:-1], axis=1))
        bass[rows] = np.log1p(10 * S[:, 1:8].sum(axis=1))               # below ~150 Hz
        air[rows] = 10 * np.log10((S[:, 140:465] ** 2).sum(axis=1) + 1e-9)

    def flux(x):
        d = np.maximum(0, np.diff(x, axis=0, prepend=x[:1]))
        d = d.sum(axis=1) if d.ndim > 1 else d
        d = np.maximum(0, d - np.convolve(d, np.ones(50) / 50, 'same'))  # minus a 1 s running mean
        return d / (d.std() + 1e-9)

    return flux(bands), flux(bass), air


def tempo(env, lo=60.0, hi=200.0):
    x = np.convolve(env - env.mean(), [0.25, 0.5, 0.25], 'same')
    ac = np.fft.irfft(np.abs(np.fft.rfft(x, 2 * len(x))) ** 2)[:len(x)]
    lags = np.arange(FPS * 60 / hi, FPS * 60 / lo, 0.05)        # finer than one frame: a frame is ~5 BPM at 120
    lags = lags[4 * lags < len(ac) - 4]
    if not len(lags):
        sys.exit('track too short to find a tempo')
    at = lambda l: np.interp(l, np.arange(len(ac)), ac)
    comb = at(lags) + 0.5 * at(2 * lags) + 0.33 * at(3 * lags) + 0.25 * at(4 * lags)   # a beat also repeats at 2x, 3x
    prior = np.exp(-0.5 * np.log2(60 * FPS / lags / 140) ** 2)     # mild pull towards 140: a fast grid can be thinned
    lag = float(lags[np.argmax(comb * prior)])
    for k in (2, 4, 8, 16):                                     # sharpen the period on its multiples
        c = int(round(k * lag))
        if c + 4 >= len(ac):
            break
        j = c - 2 + int(np.argmax(ac[c - 2:c + 3]))
        a, b, d = ac[j - 1], ac[j], ac[j + 1]
        lag = (j + (0.5 * (a - d) / (a - 2 * b + d) if a - 2 * b + d else 0.0)) / k
    return 60 * FPS / lag


def track(env, period, tight=100.0):
    """Dynamic-programming beat tracker (Ellis 2007): strong accents, spaced close to one period apart."""
    g = np.exp(-0.5 * (np.arange(-int(period), int(period) + 1) * 32 / period) ** 2)
    local = np.convolve(env, g, 'same')
    win = np.arange(-int(round(2 * period)), -int(round(period / 2)) + 1)
    cost = -tight * np.log(-win / period) ** 2
    cum, back = local.copy(), np.full(len(env), -1)
    for i in range(len(env)):
        w = i + win
        ok = w >= 0
        if not ok.any():
            continue
        cand = cost[ok] + cum[w[ok]]
        j = int(np.argmax(cand))
        if cand[j] > 0:                     # otherwise the chain of beats starts here
            cum[i] += cand[j]
            back[i] = w[ok][j]
    peaks = np.flatnonzero((cum[1:-1] > cum[:-2]) & (cum[1:-1] >= cum[2:])) + 1
    if not len(peaks):
        return np.array([], int)
    strong = peaks[cum[peaks] * 2 > np.median(cum[peaks])]
    i, beats = int(strong[-1] if len(strong) else peaks[-1]), []
    while i >= 0:
        beats.append(i)
        i = int(back[i])
    return np.array(beats[::-1])


def sections(sm, times, end):
    """Runs of low / mid / high energy, with runs shorter than 8 beats folded into the one before."""
    lvl = np.digitize(sm, [0.4, 0.7])
    runs = [[0, 0, int(lvl[0])]]
    for i, v in enumerate(lvl):
        if v == runs[-1][2]:
            runs[-1][1] = i + 1
        else:
            runs.append([i, i + 1, int(v)])
    k = 0
    while k < len(runs):
        if len(runs) > 1 and runs[k][1] - runs[k][0] < 8:
            if k:
                runs[k - 1][1] = runs.pop(k)[1]
            else:
                runs[1][0] = runs.pop(0)[0]
            while k and k < len(runs) and runs[k - 1][2] == runs[k][2]:
                runs[k - 1][1] = runs.pop(k)[1]
            k = max(0, k - 1)
        else:
            k += 1
    edge = list(times) + [end]
    return [{'start': round(float(edge[a]), 3), 'end': round(float(edge[b]), 3), 'level': ('low', 'mid', 'high')[v]}
            for a, b, v in runs]


def analyse(path, bpm=None):
    y = load(path)
    dur = len(y) / SR
    env, bass, _ = onsets(y)
    bpm = bpm or tempo(env)
    period = 60 * FPS / bpm
    idx = track(env, period)
    if len(idx) < 8:
        sys.exit('no steady beat found; pass --bpm')
    step = float(np.polyfit(np.arange(len(idx)), idx, 1)[0])        # frames per beat, averaged over the track
    idx = np.concatenate([np.arange(idx[0] - step, 0, -step)[::-1], idx, np.arange(idx[-1] + step, len(env), step)])
    idx = idx[idx / FPS < dur - 0.05]                               # the grid covers the whole track
    times = idx / FPS

    fi = np.clip(np.round(idx).astype(int), 2, len(bass) - 3)
    kick = np.array([bass[i - 2:i + 3].max() for i in fi])
    bars = times[int(np.argmax([kick[p::4].sum() for p in range(4)]))::4]

    cut = np.concatenate([times, [min(dur, times[-1] + step / FPS)]])
    rms = np.array([np.sqrt(np.mean(y[int(a * SR):max(int(a * SR) + 1, int(b * SR))] ** 2) + 1e-12)
                    for a, b in zip(cut[:-1], cut[1:])])
    db = 20 * np.log10(rms)
    p5, p95 = np.percentile(db, [5, 95])
    energy = np.clip((db - p5) / max(1e-6, p95 - p5), 0, 1)
    sm = np.median(np.lib.stride_tricks.sliding_window_view(np.pad(energy, 2, mode='edge'), 5), axis=1)

    rise = np.array([energy[i:i + 8].mean() - energy[i - 8:i].mean() if 8 <= i <= len(sm) - 8 else 0
                     for i in range(len(sm))])
    drops = []
    for i in np.flatnonzero(rise > 0.25):
        if rise[i] == rise[max(0, i - 8):i + 9].max():              # then the exact moment: the biggest accent nearby
            a, b = int(max(0, idx[i] - step)), int(min(len(env), idx[i] + step))
            drops.append(round(float((a + np.argmax(env[a:b])) / FPS), 3))

    pk = np.flatnonzero((env[1:-1] > env[:-2]) & (env[1:-1] >= env[2:]) & (env[1:-1] > 2.5)) + 1
    hits = []
    for i in pk[np.argsort(-env[pk])]:
        if len(hits) < 30 and all(abs(i - h) > 0.3 * FPS for h in hits):
            hits.append(int(i))
    r3 = lambda v: [round(float(x), 3) for x in v]
    return {'file': Path(path).name, 'duration': round(dur, 2), 'bpm': round(60 * FPS / step, 2),
            'beats': r3(times), 'bars': r3(bars), 'energy': [round(float(e), 2) for e in energy],
            'sections': sections(sm, times, dur), 'drops': drops,
            'hits': [[round(h / FPS, 3), round(float(env[h]), 1)] for h in sorted(hits)]}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('music')
    ap.add_argument('--out')
    ap.add_argument('--bpm', type=float)
    a = ap.parse_args()
    res = analyse(a.music, a.bpm)
    out = Path(a.out) if a.out else Path(a.music).with_suffix('.beats.json')
    out.write_text('{\n' + ',\n'.join(f' {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}'
                                      for k, v in res.items()) + '\n}\n', encoding='utf-8')
    print(f"{res['bpm']} BPM, {len(res['beats'])} beats, {len(res['bars'])} bars, {res['duration']} s -> {out}")
    print(f"  if the feel is half or double time, rerun with --bpm {res['bpm'] / 2:g} or --bpm {res['bpm'] * 2:g}")
    for s in res['sections']:
        print(f"  {s['start']:7.2f} - {s['end']:7.2f}  {s['level']}")
    print('  drops:', res['drops'])


if __name__ == '__main__':
    main()
