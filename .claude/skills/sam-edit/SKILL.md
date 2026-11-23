---
name: sam-edit
description: >-
  Rough-cut assistant for the owner's SAM Workshop (DJJS youth wing) event videos, in his editing style: highlights,
  aftermovies, teasers and testimonial videos that he finishes in Premiere Pro. Scans raw footage into contact sheets,
  picks shots by his selection rules (a packed, young, visibly engaged audience; band, musical ballet, lecture), fits
  them to the music's beat grid and hands back selects and a cut plan with markers for transitions, SFX and music
  pull-outs. Also holds his catalogue of video transitions, sound design and colour taken from his own edits and
  from the reference reels he wants to edit like. Use when the owner mentions SAM, an event highlight, aftermovie,
  teaser, testimonial video, choosing shots from raw footage, a beat edit, a Premiere rough cut, transitions, sound
  design, SFX placement or a reference reel, or wants to teach or correct his editing style.
---

# sam-edit

The owner volunteers as video editor for SAM Workshop, the youth wing of Divya Jyoti Jagrati Sansthan. SAM events have
a rock band (including Sanskrit shlokas set to rock), musical ballets that carry a message for society, and lectures
that give youth direction. From each event he cuts a highlight, an aftermovie, testimony-based videos and teasers, in
Premiere Pro.

The slow part of that job is finding the right moments in hours of footage and laying them on the beat. This skill
does that part the way he would, so that he starts from a rough cut instead of from raw cards. He does the finish.

His four finished edits and four reference reels were studied on 2026-11-23 (see Status). What was found is written
down as measured, seen or guessed, and he has not confirmed it: he said that will show only after a first rough cut.
So present it as "what the study found", and treat his corrections on the first rough cut as the real test.

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

His computer runs Windows with the Claude Desktop app, and his work folder there is `F:\Claude`. A cloud session
cannot see that folder unless he shares it through Remote Control (desktop app: Settings, Claude Code, Remote Control).

### When there is no footage and no shell (phone, claude.ai chat)

He wants this skill to work everywhere (2026-11-23). Away from his computer the scripts and the footage are not
there, so do only what needs neither: answer from `style.md`, `shot-selection.md` and `transitions-sound.md`, plan a cut on paper, write
marker and SFX lists for a sequence he describes, and take down his rules and corrections. A change to the skill
made there cannot be saved into it: give him the exact text to add and tell him to paste it in a session on his
computer. Never pretend to have looked at footage.

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

He has not stated rules for these yet. Until he does, pick the way his finished edits show (`shot-selection.md`,
sections 2 and 5): the peak of a gesture, medium from the pit with CO2, confetti or fire in frame, one wide of a
ballet formation then the lead at the top of a jump, a speaker waist-up with a hand raised. Say on the picks that
these come from his edits and not from a rule he stated, and ask him what he looks for.

### What his finished edits and the reference reels show

`shot-selection.md` holds the shot-by-shot study of all eight videos (954 shots labelled by kind and size): what he
picks for each kind of shot, what the references pick, the two set side by side, and a checklist for picking from
raw footage. Read it before step 4 (Find the moment) and step 5 (Selects). In `selects.json`, put the kind and size
in `kind`, and in `why` say what is in the air (confetti, CO2, fire), the light colour and the peak that was chosen.

## Edit style

Fast cuts on the beat, sometimes a montage with the footage sped up and slowed down, varied transitions, SFX, and
music he chooses himself. Everything more specific is in `style.md`, including what is still unknown.

**Where he wants to go (2026-11-23): the sound design and the video transitions of four reference reels** (two
Diljit Dosanjh tour films, two concert reels by @baricci). `transitions-sound.md` is the catalogue of those: fifteen
transitions (T1–T15) and seven sound moves (S1–S7) with where each was seen, how it is built and how to mark it, a
colour comparison, and his own edits set against the references. Read it before writing any cut plan, marker list or
SFX list, and use its marker wording (`TRANSITION T1 flash 3f`, `MUSIC OUT at …`, `SFX riser … ending at …`) so the
cut sheet tells him exactly what to apply in Premiere. The short version:

- A transition is 2–6 frames long and sits on a musical event or a change of chapter; two cuts in three stay hard.
- Take the music away for 1–4 s before the biggest moments, and put a flash, burn or smear on the frame it returns.
- Risers end dead on the cut; moving transitions get a whoosh; a low hit matters because the bass before it is empty.
- No cross dissolves in the references: use smear, defocus or one or two black frames instead.
- Keep SAM's branding (logo bug, end card, name strips, testimony frame) unless he says otherwise.

The cut plan must therefore carry three things besides the cuts: `marks` for every transition and speed ramp, `sfx`
for every riser, whoosh and impact, and music marks for every pull-out and bass cut.

## Learning: how this skill is "trained"

Nothing here trains a model. The skill improves because his taste gets written down, in three ways.

1. **What he says.** A rule he states goes into Selection rules or `style.md`, dated, in his meaning, not embellished.
2. **His finished edits.** The main source. See Studying his finished edits below.
3. **His corrections.** When he rejects or swaps a pick or a cut, append it to Corrections in `style.md` with the
   date, what and why. A correction that comes twice becomes a rule.

Never write down a preference he has not stated or shown. Where nothing is known, use a default and say that it is one.

## Studying his finished edits

He can give only YouTube and Instagram links to his finished edits. From a cloud session YouTube answers with a
sign-in check ("confirm you're not a bot"); do not try to get around it. On his own computer the links normally open:
`python -m pip install "yt-dlp[default]"`, then
`yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" --merge-output-format mp4 -o "F:/Claude/sam_refs/%(title).60s [%(id)s].%(ext)s" <link>`
(it needs ffmpeg, and a JavaScript runtime for YouTube: Deno, or `--js-runtimes node` when Node is installed).

He chose to read his edits with these tools only (2026-11-23): no Gemini and no third-party video-watching skill.

For each finished video (720p is enough):

1. `python3 <skill>/scripts/study.py <video>` writes `<video>.study/`. Keep his videos and this output out of the
   repo; only the findings go into `style.md`.
2. Read `summary.txt`: pace, cuts against the beat, kinds of boundary, speed changes, sound cues. Then run
   `python3 <skill>/scripts/look.py <video>` for `look.txt`: brightness, black and clipped pixels, saturation, hues,
   black-and-white runs, low hits and how many have a cut on them, pull-outs of the music.
3. Look at every `shots_*.jpg`: what each shot shows (audience, band, ballet, lecture, speaker, testimony, title), how
   it is framed, in what order the kinds come, and whether what he used agrees with his selection rules.
4. Look at every `cuts_*.jpg`: name each transition from its frames, and strike out false boundaries (a change of
   light or heavy motion inside one shot is often flagged `soft`).
5. Look at every `sound_*.jpg`: where whooshes, risers, impacts and speech sit against the cuts and the beats. This
   picture is the only way to hear the track.
6. Write the findings under Learned from finished edits in `style.md` (his own edits) or Where he wants to go
   (reference edits by others), one block per video, with the numbers, and say of each point whether it was
   measured, seen or guessed. A new transition or sound move goes into `transitions-sound.md` with its own number. Lift a point into the general style only when several
   videos agree on it.
7. Tell him the findings in plain words and let him correct them.

If he also has the Premiere sequence, its Final Cut Pro XML export (File → Export → Final Cut Pro XML) settles speed,
transition names and SFX files exactly. The video alone shows those only as "probably".

## Status (2026-11-23)

- `scan.py` (scan, zoom, picks) and `beats.py` work on synthetic test clips and on click tracks at 97, 128 and 174
  BPM (tempo exact, beats within about 16 ms, drop found). Neither has run on his camera files or on real music yet,
  and the D / B / S flags are untuned.
- `study.py` finds all 28 boundaries of a synthetic beat edit with known cuts (hard cuts, a whip, a flash, a dissolve,
  a flash inside a shot, a speed change, repeated-frame slow motion) and runs on a real 4-minute 1080p file in under a
  minute. Its thresholds are not tuned on camera or concert footage: on the real file, lights flickering inside one
  shot were flagged as `soft` boundaries. The whoosh number is unreliable; trust the sound picture instead.
- Four finished edits were studied on his computer on 2026-11-23 (two teasers, one aftermovie, one public-review
  video); the findings are in `style.md` under Learned from finished edits and are not yet confirmed by him. On real
  concert footage `study.py` flags stage-light changes and stutters as `trans`, as expected.
- Four reference edits by others that he wants to move towards (two Diljit Dosanjh tour films, two concert reels by
  @baricci) were studied the same day; see Where he wants to go in `style.md`. He has not yet said which qualities of
  them he is after, so a rough cut still follows his own style unless he says otherwise. Instagram reels download
  with yt-dlp on his computer without a login. `study.py` ignores a sideways (rotate-your-phone) picture.
- All eight videos were gone through again the same day for transitions, sound and colour: every cut sheet and
  shots sheet, and all sound sheets except seven long interview stretches. Result: `transitions-sound.md`.
  `look.py` is new and untuned: its riser count is unreliable (read risers off the sound sheets), and its loudness
  range is wrong when a video ends in digital silence.
- Shot selection was studied the same day: all 954 shots of the eight videos labelled from the shots sheets
  (`F:\Claude\sam_refs\labels.txt`) and counted with the new `scripts/shotmix.py`. Result: `shot-selection.md`.
  Labels rest on 1–3 small frames a shot; percentages are ±5 points.
- This skill is installed for every Claude Code session on his computer at `%USERPROFILE%\.claude\skills\sam-edit`.
  That copy is the one that runs. `F:\Claude\Work\.claude\skills\sam-edit` is the copy for the repo; after changing
  one, copy it over the other.
- His computer: no git; Python 3.12 is at `%LOCALAPPDATA%\Programs\Python\Python312\python.exe` (not on PATH in an
  already-open shell), with numpy, Pillow and yt-dlp; Deno and ffmpeg are installed through winget. This skill's
  files are in `F:\Claude\Work`, fetched file by file, so that folder is not a git clone.
- Not built: writing a Premiere timeline (`make_xml.py`). Build it from one real Final Cut Pro XML export out of his
  Premiere and mirror its structure exactly (clip items, file and path entries, speed, audio tracks) rather than
  writing the format from memory. In the timeline: cuts and constant speeds as clips, music and SFX as audio clips,
  transitions and speed ramps as markers for him to apply.
- Needed from him: links to 3–5 finished SAM edits of different kinds, read in a session on his computer (a file
  attached to a cloud chat arrives in `/mnt/user-data/uploads/`), then the folders he keeps SFX and music in, and one
  event's raw footage for a first rough cut.
