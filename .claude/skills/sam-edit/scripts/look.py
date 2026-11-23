#!/usr/bin/env python3
"""look.py - colour and sound numbers for a finished edit, next to study.py's report.

    python look.py <video>            (run study.py on the same video first)

Writes <video>.study/look.txt and look.json. Needs ffmpeg, numpy.
Colour: 2 frames a second, 160 px wide. Sound: mono 22.05 kHz.
Everything here is a measurement of the picture and the track, not of the editor's intent.
"""
import json, os, subprocess, sys
import numpy as np

HUES = ["red", "orange", "yellow", "lime", "green", "teal", "cyan", "azure", "blue", "violet", "magenta", "rose"]


def frames(path, w=160, h=90, fps=2):
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={w}:{h}", "-f", "rawvideo",
           "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    n = len(raw) // (w * h * 3)
    return np.frombuffer(raw[: n * w * h * 3], np.uint8).reshape(n, h, w, 3).astype(np.float32) / 255.0, fps


def colour(path):
    f, fps = frames(path)
    mx, mn = f.max(-1), f.min(-1)
    luma = 0.2126 * f[..., 0] + 0.7152 * f[..., 1] + 0.0722 * f[..., 2]
    sat = np.where(mx > 0.02, (mx - mn) / np.maximum(mx, 1e-6), 0)
    d = np.maximum(mx - mn, 1e-6)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    wgt = sat * mx * (sat > 0.15)
    fsat = sat.reshape(len(f), -1).mean(1)
    fl = luma.reshape(len(f), -1).mean(1)
    bw = fsat < 0.06
    hist = np.zeros(12)
    idx = (((hue + 15) % 360) // 30).astype(int)
    for i in range(12):
        hist[i] = wgt[idx == i].sum()
    hist = hist / max(hist.sum(), 1e-9)
    top = sorted(range(12), key=lambda i: -hist[i])[:4]
    # black-and-white runs
    runs, s = [], None
    for i, v in enumerate(list(bw) + [False]):
        if v and s is None:
            s = i
        if not v and s is not None:
            if (i - s) / fps >= 1.0:
                runs.append([round(s / fps, 1), round(i / fps, 1)])
            s = None
    warm = hist[[0, 1, 2, 11]].sum()
    cool = hist[[5, 6, 7, 8]].sum()
    return {
        "frames": int(len(f)),
        "luma_mean": round(float(fl.mean()), 3),
        "luma_p5_pixels": round(float(np.percentile(luma, 5)), 3),
        "luma_p95_pixels": round(float(np.percentile(luma, 95)), 3),
        "dark_pixels_pct": round(float((luma < 0.08).mean() * 100), 1),
        "clipped_pixels_pct": round(float((luma > 0.95).mean() * 100), 1),
        "sat_mean": round(float(fsat.mean()), 3),
        "sat_mean_colour_frames": round(float(fsat[~bw].mean()) if (~bw).any() else 0.0, 3),
        "bw_frames_pct": round(float(bw.mean() * 100), 1),
        "bw_runs": runs,
        "hues": [[HUES[i], round(float(hist[i] * 100), 1)] for i in top],
        "warm_pct": round(float(warm * 100), 1),
        "cool_pct": round(float(cool * 100), 1),
    }


def sound(path, cuts):
    sr = 22050
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"],
                         capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0
    if len(x) < sr:
        return {}
    n, hop = 2048, 512
    k = 1 + (len(x) - n) // hop
    win = np.hanning(n).astype(np.float32)
    idx = np.arange(n)[None, :] + hop * np.arange(k)[:, None]
    S = np.abs(np.fft.rfft(x[idx] * win, axis=1)) ** 2
    fr = np.fft.rfftfreq(n, 1 / sr)
    t = (np.arange(k) * hop + n / 2) / sr
    db = lambda v: 10 * np.log10(np.maximum(v, 1e-10))
    full, low, high = db(S.sum(1)), db(S[:, fr < 150].sum(1)), db(S[:, fr > 5000].sum(1))
    step = hop / sr
    cuts = np.array(cuts, float)
    near = lambda tt, tol: bool(len(cuts) and np.abs(cuts - tt).min() <= tol)

    # pull-outs: the level falls at least 14 dB under the level of the 3 s before, for 0.2-5 s
    w = int(3 / step)
    ref = np.array([np.median(full[max(0, i - w):i + 1]) for i in range(k)])
    quiet = full < ref - 14
    pulls, s = [], None
    for i, v in enumerate(list(quiet) + [False]):
        if v and s is None:
            s = i
        if not v and s is not None:
            dur = (i - s) * step
            if 0.2 <= dur <= 5 and t[s] > 0.5 and i < k - int(1 / step):
                pulls.append({"at": round(float(t[s]), 2), "dur": round(dur, 2),
                              "back_at": round(float(t[min(i, k - 1)]), 2),
                              "cut_on_return": near(float(t[min(i, k - 1)]), 0.12)})
            s = None

    # low hits: sudden rise of the band under 150 Hz
    on = np.maximum(0, low[2:] - low[:-2])
    on = np.concatenate([[0, 0], on])
    thr = max(8.0, float(on.mean() + 2.5 * on.std()))
    hits, last = [], -1
    for i in range(2, k - 1):
        if on[i] >= thr and on[i] >= on[i - 1] and on[i] >= on[i + 1] and low[i] > np.percentile(low, 60):
            if last < 0 or t[i] - last > 0.35:
                hits.append(round(float(t[i]), 2))
                last = t[i]
    hit_cut = sum(near(h, 0.08) for h in hits)

    # risers: the band over 5 kHz climbs for the 0.8 s before a cut, then falls back
    m = int(0.8 / step)
    ris = []
    for c in cuts:
        i = int(np.searchsorted(t, c))
        if i - m < 2 or i + m >= k:
            continue
        seg = high[i - m:i]
        slope = np.polyfit(np.arange(m), seg, 1)[0] * m
        after = high[i + int(0.15 / step):i + m].mean()
        if slope >= 8 and seg[-3:].mean() - after >= 4:
            ris.append(round(float(c), 2))

    dur = len(x) / sr
    return {
        "loud_range_db": round(float(np.percentile(full, 95) - np.percentile(full, 10)), 1),
        "pull_outs": pulls,
        "low_hits": len(hits),
        "low_hits_per_min": round(len(hits) / dur * 60, 1),
        "low_hits_on_a_cut_pct": round(100 * hit_cut / max(len(hits), 1)),
        "cuts_on_a_low_hit_pct": round(100 * sum(bool(len(hits) and np.abs(np.array(hits) - c).min() <= 0.08)
                                                 for c in cuts) / max(len(cuts), 1)),
        "risers_into_a_cut": ris,
    }


def main():
    v = sys.argv[1]
    out = os.path.splitext(v)[0] + ".study"
    rep = json.load(open(os.path.join(out, "report.json"), encoding="utf-8"))
    cuts = [b["t"] for b in rep["boundaries"]]
    kinds = {}
    for b in rep["boundaries"]:
        kinds[b["kind"]] = kinds.get(b["kind"], 0) + 1
    tr = [b for b in rep["boundaries"] if b["kind"] == "trans"]
    res = {"file": rep["file"], "dur": rep["dur"], "colour": colour(v), "sound": sound(v, cuts),
           "trans": [{"t": round(b["t"], 2), "frames": b["b"] - b["a"], "flash": bool(b["flash"])} for b in tr],
           "flash_cuts": [round(b["t"], 2) for b in rep["boundaries"] if b["flash"]]}
    json.dump(res, open(os.path.join(out, "look.json"), "w", encoding="utf-8"), indent=1)
    c, s = res["colour"], res["sound"]
    L = [f"LOOK  {rep['file']}  {rep['dur']:.1f} s",
         f"COLOUR  brightness mean {c['luma_mean']}, darkest 5% of pixels under {c['luma_p5_pixels']}, "
         f"brightest 5% over {c['luma_p95_pixels']} | near-black pixels {c['dark_pixels_pct']}%, "
         f"clipped white {c['clipped_pixels_pct']}%",
         f"        saturation mean {c['sat_mean']} (colour frames only {c['sat_mean_colour_frames']}) | "
         f"black-and-white frames {c['bw_frames_pct']}%, runs {c['bw_runs']}",
         "        hues by weight: " + ", ".join(f"{h} {p}%" for h, p in c["hues"]) +
         f" | warm {c['warm_pct']}% cool {c['cool_pct']}%"]
    if s:
        L += [f"SOUND   loudness range {s['loud_range_db']} dB | low hits {s['low_hits']} "
              f"({s['low_hits_per_min']} a minute), {s['low_hits_on_a_cut_pct']}% of them on a cut; "
              f"{s['cuts_on_a_low_hit_pct']}% of cuts sit on a low hit",
              "        pull-outs (music drops 14 dB or more): " +
              (", ".join(f"{p['at']}s for {p['dur']}s" + (" >cut on return" if p["cut_on_return"] else "")
                         for p in s["pull_outs"]) or "none"),
              f"        risers into a cut: {len(s['risers_into_a_cut'])}  {s['risers_into_a_cut'][:20]}"]
    L += [f"TRANS   {len(res['trans'])} flagged, lengths in frames: {sorted(x['frames'] for x in res['trans'])} | "
          f"boundaries with a flash at: {res['flash_cuts']}"]
    open(os.path.join(out, "look.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
    print("\n".join(L))


if __name__ == "__main__":
    main()
