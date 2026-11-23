---
name: sam-edit
description: >-
  Rough-cut assistant for the owner's SAM Workshop (DJJS youth wing) event videos, in his editing style: highlights,
  aftermovies, teasers and testimonial videos that he finishes in Premiere Pro. Scans raw footage into contact sheets,
  picks shots by his selection rules (a packed, young, visibly engaged audience; band, musical ballet, lecture), fits
  them to the music's beat grid and hands back selects and a cut plan. Use when the owner mentions SAM, an event
  highlight, aftermovie, teaser, testimonial video, choosing shots from raw footage, a beat edit or a Premiere rough
  cut, or wants to teach or correct his editing style.
---

# sam-edit

The owner volunteers as video editor for SAM Workshop, the youth wing of Divya Jyoti Jagrati Sansthan. SAM events have
a rock band (including Sanskrit shlokas set to rock), musical ballets that carry a message for society, and lectures
that give youth direction. From each event he cuts a highlight, an aftermovie, testimony-based videos and teasers, in
Premiere Pro.

The slow part of that job is finding the right moments in hours of footage and laying them on the beat. This skill
does that part the way he would, so that he starts from a rough cut instead of from raw cards. He does the finish.

## What is and is not Claude's job

- Claude: watch the footage through contact sheets, choose shots by his rules, plan the cut on the beat, hand over
  selects and a cut plan, and learn from his corrections.
- The owner, in Premiere: speed-ramp curves, his transition presets, the SFX mix, colour, titles. Claude cannot operate
  Premiere, so mark where these go instead of imitating them.
- A finished-looking video is not the goal. A rough cut he agrees with shot for shot is.

## Where it runs

Raw footage is tens of GB and stays on his computer. Run this in a Claude Code session on that computer (the Claude
Desktop app, or `claude remote-control` started in the footage folder). Never copy footage into this repo or a cloud
container. Work files go in `<footage>/_sam/`. Needs ffmpeg and ffprobe on PATH and Python 3 with numpy and Pillow,
all free; install them if they are missing.

## Tokens

He is short on tokens. Never open video frames one at a time: look only at contact sheets (under 2k tokens for 30
frames). Do a coarse pass over everything first and zoom only into shots that might make the cut.

## Steps

`<skill>` is this file's folder. On Windows the command is `python`.

1. **Brief.** Ask once, and only for what he has not said: which video (teaser, highlight, aftermovie, testimonial),
   length, music track, which parts of the event the footage covers, any moment that must be in.
2. **Scan.** `python3 <skill>/scripts/scan.py scan <footage>` writes `_sam/sheets/sheet_NNN.jpg` and
   `_sam/index.tsv`. Each cell is labelled `clip-id m:ss`. A long continuous take gets at most 24 samples; cover it
   with `scan.py zoom <file> 0 <end> --step 10`.
3. **Sort the clips.** From the sheets, one line per clip in `_sam/clips.tsv`: id, kind (audience, band, ballet,
   lecture, testimony, venue, other), part of the event, usable or not and why. Unusable clips stop here.
4. **Find the moment.** For each candidate run `scan.py zoom <file> <t0> <t1> --step 0.5` (add `--cols 2` when faces
   have to be read). Take only the span in which the selection rules hold for every frame of it.
5. **Selects.** Write `_sam/selects.json`, then `scan.py picks _sam/selects.json` writes `_sam/picks*.jpg`. Show him
   the picks sheets and take his corrections (see Learning) before cutting.
6. **Beat grid.** `python3 <skill>/scripts/beats.py <music> --out <footage>/_sam/beats.json` gives bpm, beats, bars,
   energy per beat, sections, drops and hits. If the grid feels half or double time, rerun with `--bpm`.
7. **Cut plan.** Write `_sam/edl.json` and `_sam/cut_sheet.md`, the same cut as a table he can follow in Premiere:
   timeline time, clip, source in and out, speed, note.
8. **Premiere timeline.** Not built yet; see Status.

### Files

Times are seconds from the start of the file, as on the sheet labels.

`selects.json` is a list of
`{"clip": "012", "file": "CAM_A/C0012.MP4", "in": 34.0, "out": 37.5, "kind": "audience", "part": "band", "why": "..."}`.

`edl.json` is
`{"name": "...", "fps": 25, "size": [1920, 1080], "music": {"file": "...", "in": 0}, "cuts": [], "sfx": [], "marks": []}`.
- A cut: `{"at": 7.86, "dur": 0.47, "file": "...", "in": 35.2, "speed": 100, "note": "..."}`. `at` and `dur` are
  timeline seconds taken from the beat grid, `in` is source seconds, and the source span used is `dur × speed / 100`.
- An SFX: `{"at": 7.5, "file": "...", "note": "..."}`. A mark: `{"at": 7.86, "note": "TRANSITION ..." or "RAMP ..."}`.

## Selection rules

These are his, as he stated them on 2026-11-23. They matter more than anything else in this skill.

### Audience shots

The audience must be seen enjoying SAM. A shot is not good or bad as a whole: inside one gimbal pass over the crowd
there are usually only a few moments worth taking. Take just those.

| What is on stage | Take the audience only while they are |
|---|---|
| Band, rock music | into the music: dancing, clapping, swaying (झूमना) |
| Lecture | listening closely, with full attention |
| Musical ballet | watching the ballet intently, eyes on it, nobody looking around |

Every audience shot, whatever is on stage:
- **Good expressions.** Smiling, bright, smart-looking faces, in a frame that looks good.
- **Youth only.** The people on screen must read as young. It is a youth event and has to look like one.
- **Full house.** No empty seats, no gaps, no bare patch of ground anywhere in frame. The venue must always look
  packed. A shot that shows empty space is out, however good the rest of it is.

Teasers and highlights lean on these shots the most: they have to say that the audience is loving SAM.

Claude's reading of the above, not his words: a crowd shot belongs with the stage content it was filmed during (a
dancing crowd with the band, a listening crowd with the lecture), and one visibly bored or distracted person in the
foreground spoils an otherwise good shot.

### Stage shots: band, ballet, lecture, speakers, testimonies

He has not stated rules for these yet. Until he does, use ordinary craft (in focus, steady or deliberately moving,
well exposed, the subject clear), say on the picks that these are Claude's judgement, and ask him what he looks for.

## Edit style

Fast cuts on the beat, sometimes a montage with the footage sped up and slowed down, varied transitions, SFX, and
music he chooses himself. Everything more specific is in `style.md`, including what is still unknown.

## Learning: how this skill is "trained"

Nothing here trains a model. The skill improves because his taste gets written down, in three ways.

1. **What he says.** A rule he states goes into Selection rules or `style.md`, dated, in his meaning, not embellished.
2. **His finished edits.** For each finished SAM video he exports the sequence from Premiere (File → Export → Final
   Cut Pro XML) and keeps the final mp4. From those, measure and write into `style.md`: shot lengths against the beat,
   where cuts sit relative to the beat, speed changes, which transitions and where, which SFX and where against the
   cut, the music (genre, BPM, where the drop lands), the order of shot kinds from opening to end, the share of
   audience against stage shots, titles.
3. **His corrections.** When he rejects or swaps a pick or a cut, append it to Corrections in `style.md` with the
   date, what and why. A correction that comes twice becomes a rule.

Never write down a preference he has not stated or shown. Where nothing is known, use a default and say that it is one.

## Status (2026-11-23)

- `scan.py` (scan, zoom, picks) and `beats.py` work on synthetic test clips and on click tracks at 97, 128 and 174
  BPM (tempo exact, beats within about 16 ms, drop found). Neither has run on his camera files or on real music yet,
  and the D / B / S flags are untuned.
- Not built: reading his finished edits (`learn_style.py`) and writing a Premiere timeline (`make_xml.py`). Build both
  from one real Final Cut Pro XML export out of his Premiere and mirror its structure exactly (clip items, file and
  path entries, speed, audio tracks) rather than writing the format from memory. In the timeline: cuts and constant
  speeds as clips, music and SFX as audio clips, transitions and speed ramps as markers for him to apply.
- `style.md` holds only what he has said. Nothing has been learned from his edits yet.
- Needed from him: 3–5 finished SAM edits (XML export and final mp4), the folders he keeps SFX and music in, and one
  event's raw footage for a first rough cut.
