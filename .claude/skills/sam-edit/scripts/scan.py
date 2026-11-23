#!/usr/bin/env python3
"""Contact sheets of raw footage: shots are judged from a few images instead of thousands of frames.

  scan.py scan  <footage_dir> [--every 4] [--max 24] [--cols 6] [--rows 5]   coarse pass over every clip
  scan.py zoom  <video> <t0> <t1> [--step 0.5] [--cols 4]                    dense sheet of one span
  scan.py picks <selects.json> [--cols 4]                                    one frame per selected shot

Work files go to <footage_dir>/_sam/ (override with --out). Needs ffmpeg + ffprobe on PATH, numpy, Pillow.
Cell label: clip id + time (scan), seconds into the clip (zoom), pick number + clip + in-out (picks).
Red letter on a cell: D too dark, B blown out, S soft compared with the rest of the footage. Hints, not verdicts.
index.tsv lists the same per clip: one character per sample ('.' fine, '?' frame missing).
"""
import argparse
import json
import math
import os
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

VIDEO_EXT = {'.mp4', '.mov', '.mxf', '.mts', '.m2ts', '.avi', '.mkv', '.m4v', '.mpg', '.3gp', '.webm', '.wmv'}
SHEET_W = 1568      # an image is read at most this wide; a wider sheet would only be scaled down
LABEL_H = 18
GRAB_W = 640        # frames are grabbed at this width, measured, then shrunk into the sheet


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')


def natural(p):
    return [int(s) if s.isdigit() else s.lower() for s in re.split(r'(\d+)', str(p))]


def clock(t, tenths=False):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    sec = f'{s:04.1f}' if tenths else f'{int(s):02d}'
    return f'{h}:{m:02d}:{sec}' if h else f'{m}:{sec}'


def probe(video):
    r = run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
             'stream=width,height,avg_frame_rate,codec_name:format=duration', '-of', 'json', str(video)])
    try:
        j = json.loads(r.stdout)
        s = j['streams'][0]
        num, den = (float(x) for x in s['avg_frame_rate'].split('/'))
        return {'dur': round(float(j['format']['duration']), 2), 'fps': round(num / den, 3) if den else 0.0,
                'w': s['width'], 'h': s['height'], 'codec': s['codec_name']}
    except (ValueError, KeyError, IndexError):
        return None


def grab(video, times, outdir, stem, width=GRAB_W):
    """Exact single frames. Six seeks share one ffmpeg process; two decoder threads each keep memory low on 4K."""
    outs = [outdir / f'{stem}_{i:04d}.jpg' for i in range(len(times))]
    for a in range(0, len(times), 6):
        cmd = ['ffmpeg', '-v', 'error', '-y']
        for t in times[a:a + 6]:
            cmd += ['-threads', '2', '-ss', f'{t:.3f}', '-i', str(video)]
        for k, o in enumerate(outs[a:a + 6]):
            cmd += ['-map', f'{k}:v:0', '-frames:v', '1', '-vf', f'scale={width}:-2', '-q:v', '4', str(o)]
        run(cmd)
    return [o if o.exists() else None for o in outs]


def measure(img):
    """(sharpness, brightness). Sharpness is the Laplacian variance of the crispest tenth of the frame, so a tight
    shot with a soft background still counts as sharp; only a frame with nothing in focus scores low."""
    g = np.asarray(Image.open(img).convert('L'), dtype=np.float32)
    lap = 4 * g[1:-1, 1:-1] - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]
    h, w = lap.shape[0] // 40 * 40, lap.shape[1] // 40 * 40
    blocks = lap[:h, :w].reshape(h // 40, 40, w // 40, 40).var(axis=(1, 3))
    return float(np.percentile(blocks, 90)), float(g.mean())


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:               # Pillow older than 10.1
        return ImageFont.load_default()


def sheet(cells, cols, out, aspect=9 / 16):
    """cells: (image path, PIL image or None, label, red flag text). Writes one JPEG."""
    cw = SHEET_W // cols
    ch = round(cw * aspect)
    rows = math.ceil(len(cells) / cols)
    im = Image.new('RGB', (cw * cols, rows * (ch + LABEL_H)), (16, 16, 16))
    d, f = ImageDraw.Draw(im), font(14)
    for k, (p, label, flag) in enumerate(cells):
        x, y = (k % cols) * cw, (k // cols) * (ch + LABEL_H)
        if p is not None:
            t = (p if isinstance(p, Image.Image) else Image.open(p)).convert('RGB')
            t.thumbnail((cw - 2, ch))
            im.paste(t, (x + (cw - t.width) // 2, y + (ch - t.height) // 2))
        d.text((x + 4, y + ch + 1), label, fill=(255, 255, 255), font=f)
        if flag:
            d.text((x + cw - 6 - d.textlength(flag, font=f), y + ch + 1), flag, fill=(255, 80, 80), font=f)
    im.save(out, quality=82)


def sheets(cells, cols, rows, outdir, prefix, aspect=9 / 16):
    """Split cells over as many sheets as needed; returns the sheet name of every cell."""
    per, names = cols * rows, []
    for k in range(0, len(cells), per):
        name = f'{prefix}_{k // per + 1:03d}.jpg'
        sheet(cells[k:k + per], cols, outdir / name, aspect)
        names += [name] * len(cells[k:k + per])
    return names


def fresh(d):
    shutil.rmtree(d, ignore_errors=True)
    d.mkdir(parents=True)
    return d


def cmd_scan(a):
    root = Path(a.dir).resolve()
    out = Path(a.out).resolve() if a.out else root / '_sam'
    tmp, dest = fresh(out / 'tmp'), fresh(out / 'sheets')
    files = sorted((p for p in root.rglob('*') if p.is_file() and p.suffix.lower() in VIDEO_EXT
                    and out not in p.parents and not p.name.startswith('.')), key=natural)
    if not files:
        sys.exit(f'no video files under {root}')
    digits = max(3, len(str(len(files))))

    def work(item):
        i, p = item
        clip = {'id': f'{i:0{digits}d}', 'file': p.relative_to(root).as_posix()}
        m = probe(p)
        if not m:
            return {**clip, 'error': 'unreadable'}
        n = 1 if m['dur'] < 2 else max(3, min(a.max, math.ceil(m['dur'] / a.every)))
        t = [round(m['dur'] * (k + 0.5) / n, 2) for k in range(n)]
        return {**clip, **m, 't': t, '_img': grab(p, t, tmp, clip['id'])}

    clips = []
    with ThreadPoolExecutor(max_workers=max(1, min(4, (os.cpu_count() or 2) // 2))) as ex:
        for c in ex.map(work, enumerate(files, 1)):
            clips.append(c)
            print(f'\rscanned {len(clips)}/{len(files)}', end='', file=sys.stderr, flush=True)
    print(file=sys.stderr)

    cells = []
    for c in clips:
        for t, img in zip(c.get('t', []), c.pop('_img', [])):
            sharp, mean = measure(img) if img else (0.0, 0.0)
            cells.append({'clip': c, 't': t, 'img': img, 'sharp': sharp, 'mean': mean})
    med = float(np.median([x['sharp'] for x in cells if x['img']] or [0]))
    for x in cells:
        x['flag'] = ('' if not x['img'] else 'D' if x['mean'] < 28 else 'B' if x['mean'] > 232
                     else 'S' if x['sharp'] < 0.3 * med else '')
    names = sheets([(x['img'], f"{x['clip']['id']} {clock(x['t'])}", x['flag']) for x in cells],
                   a.cols, a.rows, dest, 'sheet')
    for x, name in zip(cells, names):
        x['clip']['flags'] = x['clip'].get('flags', '') + (x['flag'] or ('.' if x['img'] else '?'))
        x['clip'].setdefault('sheets', [])
        if name not in x['clip']['sheets']:
            x['clip']['sheets'].append(name)
    shutil.rmtree(tmp, ignore_errors=True)

    (out / 'index.json').write_text(json.dumps({'root': str(root), 'clips': clips}, ensure_ascii=False, indent=1),
                                    encoding='utf-8')
    rows = ['id\tdur\tfps\tsize\tsheets\tflags\tfile']
    for c in clips:
        rows.append(f"{c['id']}\t-\t-\t-\t-\tUNREADABLE\t{c['file']}" if 'error' in c else
                    f"{c['id']}\t{clock(c['dur'])}\t{c['fps']:g}\t{c['w']}x{c['h']}\t"
                    f"{','.join(s[6:9] for s in c.get('sheets', []))}\t{c.get('flags', '')}\t{c['file']}")
    (out / 'index.tsv').write_text('\n'.join(rows) + '\n', encoding='utf-8')
    bad = [c['file'] for c in clips if 'error' in c]
    total = sum(c.get('dur', 0) for c in clips)
    print(f'{len(clips)} clips, {clock(total)} of footage, {len(set(names))} sheets -> {dest}')
    print(f'index: {out / "index.tsv"}')
    if bad:
        print(f'unreadable ({len(bad)}): ' + ', '.join(bad[:10]))


def sam_dir(video):
    """The _sam folder of the shoot this file belongs to, or one next to the file."""
    for parent in list(video.parents)[:5]:
        if (parent / '_sam').is_dir():
            return parent / '_sam'
    return video.parent / '_sam'


def cmd_zoom(a):
    video = Path(a.video).resolve()
    out = (Path(a.out).resolve() if a.out else sam_dir(video)) / 'zoom'
    out.mkdir(parents=True, exist_ok=True)
    tmp = fresh(out / 'tmp')
    width = max(GRAB_W, SHEET_W // a.cols // 2 * 2)
    base = ['ffmpeg', '-v', 'error', '-y', '-ss', f'{a.t0:.3f}', '-t', f'{a.t1 - a.t0 + 0.001:.3f}', '-i', str(video),
            '-vf', f"select='gte(t,selected_n*{a.step})',scale={width}:-2"]
    for sync in (['-fps_mode', 'vfr'], ['-vsync', 'vfr']):       # the second spelling is for ffmpeg older than 5.1
        r = run(base + sync + ['-q:v', '3', str(tmp / 'z_%04d.jpg')])
        if r.returncode == 0:
            break
    imgs = sorted(tmp.glob('z_*.jpg'))
    if not imgs:
        sys.exit(f'no frames from {video}: {r.stderr.strip()[:300]}')
    cells = [(p, f'{a.t0 + k * a.step:.2f}'.rstrip('0').rstrip('.'), '') for k, p in enumerate(imgs)]
    stem = f'{video.stem}_{a.t0:g}-{a.t1:g}'
    for name in sorted(set(sheets(cells, a.cols, 6, out, stem))):
        print(out / name)
    shutil.rmtree(tmp, ignore_errors=True)


def cmd_picks(a):
    sel = Path(a.selects).resolve()
    out = sel.parent
    root = Path(a.root).resolve() if a.root else out.parent
    tmp = fresh(out / 'tmp_picks')
    cells = []
    for k, s in enumerate(json.loads(sel.read_text(encoding='utf-8')), 1):
        img = grab(root / s['file'], [(s['in'] + s['out']) / 2], tmp, f'p{k:03d}',
                   max(GRAB_W, SHEET_W // a.cols // 2 * 2))[0]
        cells.append((img, f"#{k} {s.get('clip', '')} {clock(s['in'], True)}-{clock(s['out'], True)}", ''))
    for name in sorted(set(sheets(cells, a.cols, 6, out, 'picks'))):
        print(out / name)
    shutil.rmtree(tmp, ignore_errors=True)


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('scan')
    s.add_argument('dir')
    s.add_argument('--out')
    s.add_argument('--every', type=float, default=4.0, help='seconds between samples')
    s.add_argument('--max', type=int, default=24, help='most samples per clip')
    s.add_argument('--cols', type=int, default=6)
    s.add_argument('--rows', type=int, default=5)
    s.set_defaults(fn=cmd_scan)
    z = sub.add_parser('zoom')
    z.add_argument('video')
    z.add_argument('t0', type=float)
    z.add_argument('t1', type=float)
    z.add_argument('--step', type=float, default=0.5)
    z.add_argument('--cols', type=int, default=4)
    z.add_argument('--out')
    z.set_defaults(fn=cmd_zoom)
    p = sub.add_parser('picks')
    p.add_argument('selects')
    p.add_argument('--root', help='footage folder (default: the parent of the folder holding selects.json)')
    p.add_argument('--cols', type=int, default=4)
    p.set_defaults(fn=cmd_picks)
    a = ap.parse_args()
    a.fn(a)


if __name__ == '__main__':
    main()
