#!/usr/bin/env python3
"""clips.py - cut every select into its own clip, for editing in CapCut (or any editor).

    python clips.py <footage> [--selects <file>] [--out <dir>] [--handles 1.0] [--exact]

Reads <footage>/_sam/selects.json (see SKILL.md, Files) and writes one clip per select to <footage>/_sam/selects/,
named  NNN_<kind>_<clip>_<m-ss>.<ext>, plus selects.tsv (the list) in the same folder.

Default is a stream copy: no re-encode, no quality loss, fast. A copy can only start on a keyframe, so each clip
starts a little before the chosen moment (up to one GOP, often 0.5-2 s) on top of --handles. That spare footage is
useful in the editor. Use --exact when the clip must start on the chosen frame: it re-encodes (H.264, near-lossless).
The original files are only read. Nothing outside the output folder is written.
"""
import argparse, json, os, re, subprocess, sys


def dur_of(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("footage")
    ap.add_argument("--selects")
    ap.add_argument("--out")
    ap.add_argument("--handles", type=float, default=1.0, help="spare seconds kept before and after each select")
    ap.add_argument("--exact", action="store_true", help="re-encode so the clip starts on the exact frame")
    a = ap.parse_args()

    foot = os.path.abspath(a.footage)
    sel_path = a.selects or os.path.join(foot, "_sam", "selects.json")
    out = os.path.abspath(a.out or os.path.join(foot, "_sam", "selects"))
    sels = json.load(open(sel_path, encoding="utf-8"))
    same_drive = os.path.splitdrive(out)[0].lower() == os.path.splitdrive(foot)[0].lower()
    if same_drive and os.path.commonpath([out, foot]) == foot \
            and "_sam" not in os.path.relpath(out, foot).split(os.sep):
        sys.exit("refusing to write clips among the original footage; use a folder under _sam")
    os.makedirs(out, exist_ok=True)

    rows, bad = [], 0
    for i, s in enumerate(sels, 1):
        src = s["file"] if os.path.isabs(s["file"]) else os.path.join(foot, s["file"])
        if not os.path.isfile(src):
            print(f"!! {i:03d} missing source: {src}")
            bad += 1
            continue
        total = dur_of(src)
        t0 = max(0.0, float(s["in"]) - a.handles)
        t1 = float(s["out"]) + a.handles
        if total:
            t1 = min(t1, total)
        if t1 - t0 <= 0.05:
            print(f"!! {i:03d} empty span in {s['file']}")
            bad += 1
            continue
        kind = re.sub(r"[^a-z0-9]+", "-", str(s.get("kind", "shot")).lower()).strip("-") or "shot"
        clip = re.sub(r"[^A-Za-z0-9]+", "", str(s.get("clip", ""))) or os.path.splitext(os.path.basename(src))[0]
        stamp = "%d-%02d" % (int(s["in"]) // 60, int(s["in"]) % 60)
        ext = ".mp4" if a.exact else os.path.splitext(src)[1]
        name = f"{i:03d}_{kind}_{clip}_{stamp}{ext}"
        dst = os.path.join(out, name)
        cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-i", src, "-t", f"{t1 - t0:.3f}",
               "-map", "0:v:0", "-map", "0:a?"]
        if a.exact:
            cmd += ["-c:v", "libx264", "-crf", "14", "-preset", "fast", "-c:a", "aac", "-b:a", "320k"]
        else:
            cmd += ["-c", "copy", "-avoid_negative_ts", "make_zero"]
        r = subprocess.run(cmd + [dst], capture_output=True, text=True)
        got = dur_of(dst) if r.returncode == 0 and os.path.isfile(dst) else None
        if not got:
            print(f"!! {i:03d} ffmpeg failed: {(r.stderr or '').strip()[:200]}")
            bad += 1
            continue
        rows.append([name, s["file"], f"{float(s['in']):.2f}", f"{float(s['out']):.2f}", f"{got:.2f}",
                     s.get("kind", ""), s.get("part", ""), s.get("why", "")])
        print(f"{name}  {got:.1f}s")

    with open(os.path.join(out, "selects.tsv"), "w", encoding="utf-8", newline="") as f:
        f.write("clip\tsource\tin\tout\tclip_seconds\tkind\tpart\twhy\n")
        for r in rows:
            f.write("\t".join(str(x).replace("\t", " ") for x in r) + "\n")
    print(f"-> {out}  ({len(rows)} clips written, {bad} failed)")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
