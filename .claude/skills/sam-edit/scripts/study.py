#!/usr/bin/env python3
"""Reads a finished edit (the exported video file) and measures how it was cut.

  study.py <video> [--out DIR] [--bpm N]

Writes <video stem>.study/ next to the video (or --out):
  summary.txt     pace, cuts against the beat, transitions, speed changes, sound cues. Read this first.
  shots.tsv       one line per shot
  report.json     the same numbers for other tools
  shots_NNN.jpg   one frame per shot (three for a shot of 3 s or more); label '#shot start length'
  cuts_NNN.jpg    six frames across every boundary that is not a plain cut, and across a few plain cuts
  sound_NNN.jpg   the soundtrack as a picture (spectrogram, 15 s a row, low notes at the bottom) with the boundaries
                  ticked along the top (white cut, yellow trans, blue soft) and beats along the bottom (long = bar).
                  This is how to "hear" it: a whoosh or riser is a smear of noise sweeping up before a tick, an
                  impact is a full-height stripe with a bright foot, speech is wavy stacked lines in the middle.

Boundary kinds: cut (between two frames), trans (several frames of fast change: whip, zoom, glitch ...),
soft (gradual: a dissolve, or heavy camera motion; look at the strip). 'flash' is added when bright frames sit on it.
Flags on shot cells: T / S the shot is entered through a trans / soft boundary, F flash, R speed changes inside the
shot, D repeated frames (slow motion made by repeating frames, a freeze, or a still).
All of this is measured from the picture and the mixed sound, so transitions, speed and sound cues are "probably".
The Premiere XML of the same sequence is the exact record where there is one.
Needs ffmpeg + ffprobe on PATH, numpy, Pillow. Assumes a constant frame rate, as editors export.
"""
import argparse
import io
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
import beats as B                                   # noqa: E402
from scan import SHEET_W, clock, font, sheets       # noqa: E402

LUMA = np.array([0.299, 0.587, 0.114], np.float32)


def probe(video):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,r_frame_rate:format=duration',
                        '-of', 'json', str(video)], capture_output=True, text=True)
    try:
        j = json.loads(r.stdout)
        v = next(s for s in j['streams'] if s['codec_type'] == 'video')
        num, den = (float(x) for x in v['r_frame_rate'].split('/'))
        png = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(video), '-frames:v', '1', '-f', 'image2pipe',
                              '-vcodec', 'png', '-'], capture_output=True).stdout
        w, h = Image.open(io.BytesIO(png)).size      # as displayed, after any rotation
        return {'fps': num / den, 'w': w, 'h': h, 'dur': float(j['format']['duration']),
                'audio': any(s['codec_type'] == 'audio' for s in j['streams'])}
    except (ValueError, KeyError, StopIteration, OSError):
        sys.exit(f'cannot read {video}')


def decode(video, w, h, keep=None):
    """Every frame at w x h as one uint8 array, or only the frame numbers in keep as PIL images."""
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(video), '-map', '0:v:0', '-vf',
                          f'scale={w}:{h}:flags=area', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
                         stdout=subprocess.PIPE)
    size = w * h * 3
    if keep is None:
        buf = p.stdout.read()
        p.wait()
        return np.frombuffer(buf, np.uint8)[:len(buf) // size * size].reshape(-1, h, w, 3)
    out = {}
    for i in range(max(keep) + 1):
        b = p.stdout.read(size)
        if len(b) < size:
            break
        if i in keep:
            out[i] = Image.frombytes('RGB', (w, h), b)
    p.kill()
    p.wait()
    return out


def unit(v):
    """Rows as zero-mean unit vectors, and which rows are blank frames (under 2 grey levels of contrast)."""
    v = v - v.mean(axis=1, keepdims=True)
    n = np.linalg.norm(v, axis=1, keepdims=True)
    return v / np.maximum(n, 1e-6), n[:, 0] < 2.0 * np.sqrt(v.shape[1])


def change(u, flat, mean, k=1):
    """1 - correlation of frame i with frame i-k: 0 the same picture, about 1 an unrelated one.
    Correlation ignores overall brightness, so stage lights flashing do not read as a new shot."""
    q = np.zeros(len(u), np.float32)
    q[k:] = 1 - np.einsum('ij,ij->i', u[k:], u[:-k])
    a, b = flat[k:], flat[:-k]
    q[k:][a ^ b] = 1.0
    q[k:][a & b] = np.minimum(1, np.abs(mean[k:] - mean[:-k])[a & b] / 64)
    return q


def measure(small):
    """Per frame: brightness, plain difference from the frame before, change in detail (64x36 grey), the coarse
    picture (16x9 colour blocks, which small movements barely alter) and where its edges are (32x18), which stays
    put when only the lighting changes."""
    n = len(small)
    y = np.empty((n, 36 * 64), np.float32)
    c = np.empty((n, 9 * 16 * 3), np.float32)
    e = np.zeros((n, 18 * 32), np.float32)
    dabs = np.zeros(n, np.float32)
    for a in range(0, n, 2000):
        s = small[a:a + 2000].astype(np.float32)
        g = s @ LUMA
        y[a:a + len(s)] = g.reshape(len(s), -1)
        c[a:a + len(s)] = s.reshape(len(s), 9, 4, 16, 4, 3).mean(axis=(2, 4)).reshape(len(s), -1)
        edge = np.zeros_like(g)
        edge[:, 1:-1, 1:-1] = np.abs(g[:, 1:-1, 2:] - g[:, 1:-1, :-2]) + np.abs(g[:, 2:, 1:-1] - g[:, :-2, 1:-1])
        e[a:a + len(s)] = edge.reshape(len(s), 18, 2, 32, 2).mean(axis=(2, 4)).reshape(len(s), -1)
    for a in range(1, n, 2000):
        dabs[a:a + 2000] = np.abs(y[a:a + 2000] - y[a - 1:a + 1999][:len(y[a:a + 2000])]).mean(axis=1)
    mean = y.mean(axis=1)
    uf, ff = unit(y)
    uc, fc = unit(c)
    ue, fe = unit(e)
    return mean, dabs, change(uf, ff, mean), uc, fc, ue, fe


def rolling_median(x, w):
    return np.median(np.lib.stride_tricks.sliding_window_view(np.pad(x, w, mode='edge'), 2 * w + 1), axis=1)


def find_boundaries(qc, qf, uc, flat, ue, noedge, mean, fps):
    """Shot boundaries, and short disturbances inside a shot (camera flash, strobe, glitch) that are not boundaries."""
    n = len(qc)
    hot = qc >= np.clip(4 * rolling_median(qc, max(3, round(fps * 0.5))) + 0.1, 0.25, 0.8)
    spike = np.zeros(n, bool)       # a one-frame jump in detail: a cut between two shots that look alike from afar
    spike[1:-1] = (qf[1:-1] >= 0.35) & (qf[1:-1] >= 3 * np.maximum(qf[:-2], qf[2:]) + 0.05)
    hot |= spike
    hot[0] = False
    zones = []
    for i in np.flatnonzero(hot):
        if zones and i - zones[-1][1] <= 2:
            zones[-1][1] = int(i)
        else:
            zones.append([int(i), int(i)])

    def same(i, j):
        if flat[i] or flat[j]:
            return bool(flat[i] and flat[j] and abs(mean[i] - mean[j]) < 16)
        if float(uc[i] @ uc[j]) >= 0.85:
            return True
        return bool(not noedge[i] and not noedge[j] and float(ue[i] @ ue[j]) >= 0.8)   # same picture, other light

    med = rolling_median(mean, max(4, round(fps * 0.3)))
    bright = (mean - med >= 45) & (mean >= 150)
    bounds, blips = [], []
    for a, b in zones:
        score = qc[a:b + 1] + 0.3 * qf[a:b + 1]
        f = a + int(np.argmax(score))
        if b > a and same(a - 1, min(n - 1, b + 1)):
            blips.append({'f': f, 'a': a, 'b': b, 'kind': 'flash' if bright[max(0, a - 1):b + 2].any() else 'blip'})
            continue
        rest = np.delete(score, f - a)
        plain = b == a or (b - a <= 2 and score[f - a] >= 2.5 * rest.max())
        bounds.append({'f': f, 'a': a, 'b': b, 'kind': 'cut' if plain else 'trans'})

    k = max(2, round(fps * 0.3))                    # gradual changes: frame i-k against frame i+k
    lr = np.zeros(n, np.float32)
    if n > 4 * k:
        lr[k:n - k] = change(uc, flat, mean, 2 * k)[2 * k:]
        taken = np.zeros(n, bool)
        for a, b in zones:
            taken[max(0, a - k - 2):b + k + 3] = True
        run = []
        for i in list(np.flatnonzero((lr >= 0.5) & ~taken)) + [n + 9]:
            if run and i - run[-1] > 1:
                p = run[int(np.argmax(lr[run]))]
                left, right = lr[max(0, p - 3 * k):max(1, p - k)], lr[p + k:p + 3 * k]
                calm = len(right) and left.min() <= 0.25 and right.min() <= 0.25      # a steady picture either side
                if calm and not same(p - k, p + k):
                    bounds.append({'f': int(p), 'a': int(p - k), 'b': int(p + k), 'kind': 'soft'})
                run = []
            run.append(int(i))
    bounds.sort(key=lambda x: x['f'])
    for x in bounds:
        x['flash'] = bool(bright[max(0, x['a'] - 2):x['b'] + 3].any())
    return bounds, blips, hot


def make_shots(bounds, n, fps, qf, dabs, hot):
    edges = [0] + [b['f'] for b in bounds] + [n]
    hot = hot.copy()
    for b in bounds:                                # a boundary's own frames are not part of either shot's motion
        hot[max(0, b['a']):b['b'] + 1] = True
    shots = []
    for k, (f0, f1) in enumerate(zip(edges[:-1], edges[1:])):
        inner = np.arange(f0 + 1, f1)
        inner = inner[~hot[inner]]
        m = qf[inner]
        moving = m[dabs[inner] >= 0.03]             # repeated frames say nothing about speed
        speed = ''
        if len(moving) >= 12 and len(moving) >= 0.4 * len(m):
            t = [float(np.median(x)) + 0.003 for x in np.array_split(moving, 3)]
            speed = ('fast>slow' if t[0] >= 3 * t[2] else 'slow>fast' if t[2] >= 3 * t[0]
                     else 'slow>fast>slow' if t[1] >= 3 * max(t[0], t[2])
                     else 'fast>slow>fast' if min(t[0], t[2]) >= 3 * t[1] else '')
        shots.append({'n': k + 1, 'f0': int(f0), 'f1': int(f1), 'start': round(f0 / fps, 3),
                      'sec': round((f1 - f0) / fps, 3), 'in': bounds[k - 1]['kind'] if k else 'start',
                      'flash': bool(k and bounds[k - 1]['flash']),
                      'motion': round(float(np.median(m)) * 1000, 1) if len(m) else 0.0, 'speed': speed,
                      'dup': round(float((dabs[inner] < 0.03).mean()), 2) if len(inner) else 0.0})
    return shots


def sound(video, bounds, fps, bpm):
    """Beat grid of the soundtrack, each boundary against the beat, and sound cues around each boundary."""
    try:
        music = B.analyse(video, bpm)
    except SystemExit as e:
        return None, str(e), B.load(video)
    y = B.load(video)
    env, _, air = B.onsets(y)
    beats = np.array(music['beats'])
    period = 60 / music['bpm']

    def pre(t):                                     # the sustained level of hiss / air in the 0.3 s before time t
        i = int(t * B.FPS)
        return float(np.median(air[max(0, i - 17):max(1, i - 2)]))

    usual = rolling_median(np.array([pre(t) for t in beats]), 8)      # the same, before the beats around
    for x in bounds:
        t = x['f'] / fps
        j = int(np.clip(np.searchsorted(beats, t), 1, len(beats) - 1))
        x['off'] = round(float(t - beats[j - 1] if t - beats[j - 1] < beats[j] - t else t - beats[j]), 3)
        x['phase'] = round(float((t - beats[j - 1]) / (beats[j] - beats[j - 1])) % 1, 2)
        i = int(t * B.FPS)
        x['whoosh'] = round(pre(t) - float(usual[j - 1 if t - beats[j - 1] < beats[j] - t else j]), 1)   # dB above usual
        x['hit'] = round(float(env[max(0, i - 3):i + 4].max()), 1)
    music['period'] = period
    return music, '', y


def sound_sheets(y, bounds, music, fps, out, row_s=15, rows=5):
    """Spectrogram rows with boundary and beat ticks; returns how many sheets were written."""
    hop, nfft, h = 220, 1024, 170
    pad = np.zeros(nfft // 2, np.float32)
    yy = np.concatenate([pad, y, pad])
    n = 1 + (len(yy) - nfft) // hop
    win = np.hanning(nfft).astype(np.float32)
    pos = np.geomspace(60, 11000, h) / (B.SR / nfft)          # picture rows: 60 Hz to 11 kHz, evenly in pitch
    lo = np.floor(pos).astype(int)
    hi, w = np.minimum(lo + 1, nfft // 2), (pos - lo).astype(np.float32)
    db = np.empty((h, n), np.float32)
    for a in range(0, n, 4096):
        i = np.arange(a, min(n, a + 4096))
        S = np.abs(np.fft.rfft(yy[np.arange(nfft)[None, :] + hop * i[:, None]] * win, axis=1))
        db[:, i] = (20 * np.log10(S[:, lo] * (1 - w) + S[:, hi] * w + 1e-6)).T
    v = np.clip((db - db.max() + 70) / 70, 0, 1)[::-1]        # 70 dB range, high notes on top
    stops = np.array([[0, 0, 0], [60, 10, 100], [190, 40, 80], [250, 150, 30], [255, 255, 210]], np.float32)
    rgb = np.stack([np.interp(v, np.linspace(0, 1, 5), stops[:, c]) for c in range(3)], axis=-1).astype(np.uint8)
    per, top, bot = B.SR / hop, 16, 16                        # spectrogram columns per second, tick bands
    dur, f, written = len(y) / B.SR, font(12), 0
    colour = {'cut': (255, 255, 255), 'trans': (255, 220, 0), 'soft': (80, 200, 255)}
    beats = music['beats'] if music else []
    bars = set(music['bars']) if music else set()
    for page in range(0, int(np.ceil(dur / row_s)), rows):
        count = min(rows, int(np.ceil(dur / row_s)) - page)
        im = Image.new('RGB', (SHEET_W, count * (top + h + bot)), (16, 16, 16))
        d = ImageDraw.Draw(im)
        for r in range(count):
            t0, y0 = (page + r) * row_s, r * (top + h + bot)
            part = rgb[:, int(t0 * per):int(min(dur, t0 + row_s) * per)]
            if part.shape[1]:
                width = max(1, round(part.shape[1] / per / row_s * SHEET_W))
                im.paste(Image.fromarray(part).resize((width, h), Image.BILINEAR), (0, y0 + top))
            x_of = lambda t: (t - t0) / row_s * SHEET_W
            last = -99
            for k, b in enumerate(bounds, 1):
                x = x_of(b['f'] / fps)
                if 0 <= x < SHEET_W:
                    d.line([(x, y0), (x, y0 + top + 6)], fill=colour[b['kind']], width=1)
                    if x - last >= 30:
                        d.text((x + 2, y0), f'c{k}' + ('F' if b['flash'] else ''), fill=colour[b['kind']], font=f)
                        last = x
            for t in beats:
                x = x_of(t)
                if 0 <= x < SHEET_W:
                    d.line([(x, y0 + top + h), (x, y0 + top + h + (9 if t in bars else 4))], fill=(200, 200, 200))
            for sec in range(int(t0), int(min(dur, t0 + row_s)) + 1):
                if x_of(sec) < SHEET_W - 30:
                    d.text((x_of(sec) + 2, y0 + top + h + 3), clock(sec), fill=(150, 150, 150), font=f)
        written += 1
        im.save(out / f'sound_{written:03d}.jpg', quality=85)
    return written


def level_at(music, t):
    if not music:
        return '-'
    sec = music['sections']
    return next((s['level'] for s in sec if s['start'] <= t < s['end']), sec[0 if t < sec[0]['start'] else -1]['level'])


def letterbox(small):
    rows = small[::10].max(axis=(0, 2, 3)) < 24
    top = int(np.argmin(rows)) if not rows.all() else 0
    bottom = int(np.argmin(rows[::-1])) if not rows.all() else 0
    return (top + bottom) / len(rows)


def summarise(name, info, n, bars, music, why, bounds, blips, shots, capped):
    fps, L = info['fps'], []
    sec = np.array([s['sec'] for s in shots])
    aspect = info['w'] / (info['h'] * (1 - bars))
    L.append(f"VIDEO  {name}  {info['w']}x{info['h']}  {fps:g} fps  {clock(n / fps, True)}  ({n} frames)  "
             + (f'black bars: picture is {aspect:.2f}:1' if bars > 0.04 else 'no black bars'))
    if music:
        p = music['period']
        L.append(f"MUSIC  {music['bpm']} BPM, one beat = {p:.3f} s = {p * fps:.1f} frames | sections: "
                 + ', '.join(f"{clock(s['start'])} {s['level']}" for s in music['sections'])
                 + ' | drops: ' + (', '.join(clock(d, True) for d in music['drops']) or 'none'))
    else:
        L.append(f'MUSIC  no beat grid ({why.strip() or "no sound"})')
    L.append(f'SHOTS  {len(shots)} | length: median {np.median(sec):.2f} s ({np.median(sec) * fps:.0f} frames), '
             f'mean {sec.mean():.2f} s, shortest {sec.min():.2f} s, longest {sec.max():.2f} s | '
             f'{len(bounds) / (n / fps) * 60:.0f} cuts a minute')
    if music:
        hist = Counter(s['beats'] for s in shots)
        L.append('       length in beats: ' + '  '.join(f'{k:g}: {v}' for k, v in sorted(hist.items())))
    kinds = Counter(b['kind'] for b in bounds)
    tl = [b['b'] - b['a'] + 1 for b in bounds if b['kind'] == 'trans']
    L.append(f"BOUNDARIES  cut {kinds['cut']}, trans {kinds['trans']}"
             + (f' (median {np.median(tl):.0f} frames long)' if tl else '') + f", soft {kinds['soft']}, "
             f"with a flash {sum(b['flash'] for b in bounds)} | inside shots: "
             f"{sum(b['kind'] == 'flash' for b in blips)} flashes, {sum(b['kind'] == 'blip' for b in blips)} other blips")
    if music and bounds:
        tol = max(1.5 / fps, 0.05)
        off = np.array([b['off'] for b in bounds])
        on = np.abs(off) <= tol
        half = ~on & (np.abs(np.array([b['phase'] for b in bounds]) - 0.5) * music['period'] <= tol)
        L.append(f'ON THE BEAT  {on.mean():.0%} of boundaries within {tol * fps:.1f} frames of a beat '
                 f"(scattered at random it would be {min(1, 2 * tol / music['period']):.0%}); "
                 f'another {half.mean():.0%} on the half beat')
        fr = Counter(int(round(o * fps)) for o in off[on])
        L.append('       frames from the beat (minus = the cut comes before the beat): '
                 + '  '.join(f'{k:+d}: {v}' for k, v in sorted(fr.items())))
        by = {}
        for s in shots:
            by.setdefault(s['level'], []).append(s)
        L.append('PACE BY MUSIC LEVEL  ' + ' | '.join(
            f"{lv}: {len(v)} shots, median {np.median([s['sec'] for s in v]):.2f} s "
            f"({np.median([s['beats'] for s in v]):g} beats)" for lv, v in by.items()))
    step = 10
    L.append(f'PACE OVER TIME  cuts per {step} s' + (' and music level' if music else '') + ': ' + ' | '.join(
        f"{clock(t)} {sum(t <= b['f'] / fps < t + step for b in bounds)}"
        + (f' {level_at(music, t + step / 2)}' if music else '') for t in range(0, int(n / fps) + 1, step)))
    ramp = [s for s in shots if s['speed']]
    dup = [s for s in shots if s['dup'] >= 0.2 and s['sec'] >= 0.3]
    L.append(f'SPEED  speed probably changes inside {len(ramp)} shots: '
             + (', '.join(f"#{s['n']} {s['speed']}" for s in ramp[:40]) or '-'))
    L.append(f'       repeated frames (slow motion by repeating, freeze or still) in {len(dup)} shots: '
             + (', '.join(f"#{s['n']} {s['dup']:.0%}" for s in dup[:40]) or '-'))
    if music and bounds:
        wh = [k for k, b in enumerate(bounds, 1) if b['whoosh'] >= 6]
        hit = [k for k, b in enumerate(bounds, 1) if b['hit'] >= 4]
        L.append(f'SOUND  a rise of hiss / air before {len(wh)} of {len(bounds)} boundaries (whoosh?): '
                 + (', '.join(f'c{k}' for k in wh[:40]) or '-'))
        L.append(f'       a strong accent on {len(hit)} of {len(bounds)} boundaries')
    if capped:
        L.append(f'NOTE  {capped} boundaries have no strip in cuts_*.jpg (too many); they are in report.json')
    return '\n'.join(L) + '\n'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video')
    ap.add_argument('--out')
    ap.add_argument('--bpm', type=float, help='force the tempo of the soundtrack')
    ap.add_argument('--strips', type=int, default=96, help='most boundary strips to draw')
    a = ap.parse_args()
    video = Path(a.video).resolve()
    out = Path(a.out).resolve() if a.out else video.with_suffix('.study')
    out.mkdir(parents=True, exist_ok=True)
    for old in [*out.glob('shots_*.jpg'), *out.glob('cuts_*.jpg'), *out.glob('sound_*.jpg')]:
        old.unlink()

    info = probe(video)
    fps = info['fps']
    small = decode(video, 64, 36)
    n = len(small)
    if n < 10:
        sys.exit(f'only {n} frames decoded from {video}')
    if abs(n / fps - info['dur']) > max(0.5, 0.01 * info['dur']):
        print(f"warning: {n} frames at {fps:g} fps is {n / fps:.1f} s but the file says {info['dur']:.1f} s; "
              'times may drift (variable frame rate?)', file=sys.stderr)
    mean, dabs, qf, uc, flat, ue, noedge = measure(small)
    bounds, blips, hot = find_boundaries(change(uc, flat, mean), qf, uc, flat, ue, noedge, mean, fps)
    shots = make_shots(bounds, n, fps, qf, dabs, hot)
    music, why, y = sound(video, bounds, fps, a.bpm) if info['audio'] else (None, 'no sound', None)
    for s in shots:
        s['level'] = level_at(music, s['start'] + s['sec'] / 2)
        if music:
            s['beats'] = max(0.5, round(s['sec'] / music['period'] * 2) / 2)

    # frames to draw: every shot, and a strip across the boundaries worth looking at
    aspect = info['h'] / info['w']
    cols = 6 if aspect <= 1 else 10
    cells, want = [], set()
    for s in shots:
        ln = s['f1'] - s['f0']
        picks = [s['f0'] + ln // 2] if s['sec'] < 3 else [s['f0'] + ln // 10, s['f0'] + ln // 2, s['f0'] + ln * 9 // 10]
        flag = ({'trans': 'T', 'soft': 'S'}.get(s['in'], '') + ('F' if s['flash'] else '')
                + ('R' if s['speed'] else '') + ('D' if s['dup'] >= 0.2 and s['sec'] >= 0.3 else ''))
        for j, f in enumerate(picks):
            cells.append((f, f"#{s['n']} {clock(s['start'], True)} {s['sec']:.2f}s" if j == 0
                          else f"#{s['n']} {'bc'[j - 1]}", flag if j == 0 else ''))
            want.add(f)
    odd = [(k, b) for k, b in enumerate(bounds, 1) if b['kind'] != 'cut' or b['flash']]
    plain = [(k, b) for k, b in enumerate(bounds, 1) if b['kind'] == 'cut' and not b['flash']]
    plain = [plain[i] for i in sorted(set(np.linspace(0, len(plain) - 1, min(12, len(plain))).astype(int)))]
    capped = max(0, len(odd) + len(plain) - a.strips)
    if capped:
        odd = [odd[i] for i in sorted(set(np.linspace(0, len(odd) - 1, a.strips - len(plain)).astype(int)))]
    strips = []
    for k, b in sorted(odd + plain, key=lambda kb: kb[0]):
        fr = ([b['f'] + d for d in (-3, -2, -1, 0, 1, 2)] if b['kind'] == 'cut'
              else np.linspace(b['a'] - 2, b['b'] + 2, 6).round().astype(int).tolist())
        fr = [int(min(n - 1, max(0, f))) for f in fr]
        head = f"c{k} {clock(b['f'] / fps, True)} {b['kind']}" + (f" {b['b'] - b['a'] + 1}f" if b['kind'] != 'cut' else '')
        for j, f in enumerate(fr):
            strips.append((f, head if j == 0 else f"{f - b['f']:+d}", 'F' if j == 0 and b['flash'] else ''))
            want.add(f)
    cw = SHEET_W // cols - 2
    cw -= cw % 2
    big = decode(video, cw, max(2, round(cw * aspect / 2) * 2), want) if want else {}
    sheets([(big.get(f), label, flag) for f, label, flag in cells], cols, 5 if aspect <= 1 else 3, out, 'shots', aspect)
    if strips:
        sheets([(big.get(f), label, flag) for f, label, flag in strips], 6, 8 if aspect <= 1 else 3, out, 'cuts', aspect)

    heard = sound_sheets(y, bounds, music, fps, out) if y is not None and len(y) > B.SR else 0
    text = summarise(video.name, info, n, letterbox(small), music, why, bounds, blips, shots, capped)
    (out / 'summary.txt').write_text(text, encoding='utf-8')
    head = ['n', 'start', 'sec', 'frames', 'beats', 'level', 'in', 'from_beat_frames', 'motion', 'speed', 'dup',
            'whoosh_db', 'hit']
    rows = ['\t'.join(head)]
    for k, s in enumerate(shots):
        b = bounds[k - 1] if k else {}
        rows.append('\t'.join(str(v) for v in (
            s['n'], clock(s['start'], True), s['sec'], s['f1'] - s['f0'], s.get('beats', ''), s['level'],
            s['in'] + ('+flash' if s['flash'] else ''), round(b['off'] * fps, 1) if 'off' in b else '',
            s['motion'], s['speed'], s['dup'], b.get('whoosh', ''), b.get('hit', ''))))
    (out / 'shots.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
    for b in bounds + blips:
        b['t'] = round(b['f'] / fps, 3)
    (out / 'report.json').write_text(json.dumps({'file': video.name, **info, 'frames': n, 'music': music,
                                                 'boundaries': bounds, 'blips': blips, 'shots': shots},
                                                ensure_ascii=False), encoding='utf-8')
    print(text, end='')
    print(f'-> {out}  ({len(list(out.glob("shots_*.jpg")))} shot sheets, {len(list(out.glob("cuts_*.jpg")))} cut sheets, '
          f'{heard} sound sheets)')


if __name__ == '__main__':
    main()
