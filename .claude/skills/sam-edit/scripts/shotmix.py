#!/usr/bin/env python3
"""shotmix.py - shot-selection numbers for finished edits, from hand labels + study.py output.

    python shotmix.py <labels.txt> [<folder holding the .study folders>]

labels.txt: one line per video, "<path without .mp4>: TOKEN TOKEN ...", one token per shot in study.py's order.
Token = kind letter + size letter (see the header of labels.txt). Lines starting with # are comments.
The labels are a person's (or Claude's) reading of the shots sheets; this script only counts them.
Writes shotmix.txt next to labels.txt.
"""
import csv, os, statistics as st, sys

KIND = {"A": "audience", "F": "testimony", "S": "performer", "B": "ballet/skit", "L": "speaker", "V": "venue/stage wide",
        "P": "pyro/lights", "O": "other", "G": "graphic", "X": "title/card"}
SIZE = {"X": "detail", "C": "close", "M": "medium", "W": "wide", "D": "aerial", "-": "-"}


def load(labels, root):
    out = []
    for line in open(labels, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        name, toks = line.split(":", 1)
        toks = toks.split()
        tsv = os.path.join(root, name.strip() + ".study", "shots.tsv")
        rows = list(csv.DictReader(open(tsv, encoding="utf-8"), delimiter="\t"))
        if len(rows) != len(toks):
            print(f"!! {name}: {len(toks)} labels for {len(rows)} shots - skipped")
            continue
        out.append((name.strip(), [(t[0], t[1], float(r["sec"]), r) for t, r in zip(toks, rows)]))
    return out


def pct(a, b):
    return f"{100 * a / b:.0f}%" if b else "-"


def report(name, shots):
    L = []
    body = [s for s in shots if s[0] != "X"]
    tot_n, tot_t = len(body), sum(s[2] for s in body)
    L.append(f"=== {name}: {len(shots)} shots, {len(body)} without cards, {tot_t:.0f} s of picture")
    L.append("  kind              shots  share  time   share  median  longest")
    for k in "AFSBLVPOG":
        g = [s for s in body if s[0] == k]
        if not g:
            continue
        t = sum(s[2] for s in g)
        L.append(f"  {KIND[k]:<17} {len(g):>5}  {pct(len(g), tot_n):>5}  {t:>5.0f}s {pct(t, tot_t):>5}  "
                 f"{st.median(s[2] for s in g):>5.2f}s  {max(s[2] for s in g):>5.1f}s")
    L.append("  size, all shots:  " + "  ".join(
        f"{SIZE[z]} {pct(sum(1 for s in body if s[1] == z), tot_n)}" for z in "XCMWD"))
    aud = [s for s in body if s[0] == "A"]
    if aud:
        L.append("  size, audience:   " + "  ".join(
            f"{SIZE[z]} {pct(sum(1 for s in aud if s[1] == z), len(aud))}" for z in "XCMWD"))
    per = [s for s in body if s[0] in "SBL"]
    if per:
        L.append("  size, on stage:   " + "  ".join(
            f"{SIZE[z]} {pct(sum(1 for s in per if s[1] == z), len(per))}" for z in "XCMWD"))
    # what follows an audience shot, what precedes it
    seq = [s[0] for s in body]
    nxt, n_a = {}, 0
    for a, b in zip(seq, seq[1:]):
        if a == "A":
            nxt[b] = nxt.get(b, 0) + 1
            n_a += 1
    if n_a:
        L.append("  after an audience shot comes: " + ", ".join(
            f"{KIND[k]} {pct(v, n_a)}" for k, v in sorted(nxt.items(), key=lambda x: -x[1])))
    # runs
    runs, cur, n = [], seq[0] if seq else None, 0
    for k in seq:
        if k == cur:
            n += 1
        else:
            runs.append((cur, n))
            cur, n = k, 1
    if cur:
        runs.append((cur, n))
    ar = [n for k, n in runs if k == "A"]
    if ar:
        L.append(f"  audience shots come in runs of: median {st.median(ar):.0f}, longest {max(ar)} "
                 f"({len(ar)} runs); alone {pct(sum(1 for x in ar if x == 1), len(ar))} of the time")
    L.append(f"  longest stretch with no audience shot: "
             f"{max([0] + [sum(1 for _ in g) for g in _gaps(seq)])} shots")
    # first 10 and last 5 kinds
    L.append("  opens with: " + " ".join(s[0] + s[1] for s in shots[:12]))
    L.append("  ends with:  " + " ".join(s[0] + s[1] for s in shots[-6:]))
    # thirds
    third = []
    acc, cut = 0, [tot_t / 3, 2 * tot_t / 3]
    parts = [[], [], []]
    for s in body:
        parts[0 if acc < cut[0] else 1 if acc < cut[1] else 2].append(s)
        acc += s[2]
    for i, p in enumerate(parts):
        t = sum(s[2] for s in p) or 1
        third.append("third %d: " % (i + 1) + ", ".join(
            f"{KIND[k].split('/')[0]} {pct(sum(s[2] for s in p if s[0] == k), t)}" for k in "AFSBLVO"
            if sum(s[2] for s in p if s[0] == k) / t >= 0.08))
    L += ["  by time, " + x for x in third]
    return L


def _gaps(seq):
    g = []
    for k in seq:
        if k == "A":
            if g:
                yield g
            g = []
        else:
            g.append(k)
    if g:
        yield g


def main():
    labels = sys.argv[1]
    root = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(labels))
    L = []
    for name, shots in load(labels, root):
        L += report(name, shots) + [""]
    open(os.path.join(os.path.dirname(os.path.abspath(labels)), "shotmix.txt"), "w", encoding="utf-8").write("\n".join(L))
    print("\n".join(L))


if __name__ == "__main__":
    main()
