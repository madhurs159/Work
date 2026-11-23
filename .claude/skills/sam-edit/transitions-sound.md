# Transitions, sound design and colour: what to build

He said on 2026-11-23 that, out of the reference reels, what he wants most is their **sound design and video
transitions**. This file is the working catalogue for that: every transition and sound move found in the four
reference reels and in his own four edits, with where it was seen, how it is built, and where it goes in a cut.

Read `style.md` for pace and structure. Read this file whenever a cut plan, a marker list or an SFX list is written.

How the facts were got: `study.py` (boundaries, 6 frames around each), `look.py` (colour and sound numbers), and the
cut and sound sheets looked at one by one. **seen** = on the frames or the spectrogram. **measured** = a number from
the tools. **guessed** = Claude's reading of how it was made; the plugin or preset used cannot be known from a video.
Sound was never heard, only seen as a spectrogram: an SFX is named by its shape, not by its file.

Videos: his = `teaser_janmashtami`, `teaser_official`, `aftermovie_nyd`, `review_iitf`.
References = `DfOf` (Diljit, Delhi, 2:55), `DdPC` (Diljit, Wembley, 0:55), `DSKb` (@baricci, Post Malone, 0:59),
`DWyH` (@baricci, Karan Aujla, 0:57). Times are m:ss in that video.

## 1. The rule under everything (measured)

| | hard cuts | transitions | with a flash | how long a transition lasts |
|---|---|---|---|---|
| DSKb Post Malone | 55 | 28 | 28 | 1–9 frames at 25 fps, median 4 |
| DWyH Karan Aujla | 35 | 17 | 15 | 1–6 frames at 25 fps, median 3 |
| DfOf Diljit Delhi | 95 | 19 | 10 | 1–10 frames at 24 fps, median 4 |
| DdPC Diljit Wembley | 33 | 0 | 0 | none: every boundary is a hard cut |
| his Janmashtami teaser | 57 | 16 | 7 | 1–15 frames at 50 fps, median 4 (= 2 frames at 25) |
| his Official Teaser | 235 | 5 | 2 | 1–4 frames at 50 fps |
| his Aftermovie | 193 | 28 | 9 | 1–16 frames at 25 fps, median 2 |
| his IITF review | 87 | 3 | 0 | 9 frames at 50 fps |

- **A reference transition is 2–6 frames long.** It is felt, not watched. Nothing in the references is a half-second
  wipe. The longest are the smear into a title (9 frames) and a whip (7 frames).
- **The hard cut is still the base**: two cuts in three even in the most effect-heavy reel. One film (Wembley) has no
  transition at all and gets all its force from the order of shots and from the sound.
- **Where they differ from him**: the @baricci reels put a transition or a flash on one boundary in three, in bursts;
  his Official Teaser does it on one in fifty. His own Janmashtami teaser (16 of 77) is already close to their rate.
- A transition goes on a **musical event** (a hit, a drop, the return after a pull-out) or on a **change of chapter**
  (show → journey, journey → title). Ordinary cuts inside a run stay hard.

## 2. Transition catalogue

Frames are counted at 25 fps. "Mark" is the note to write on the marker in the cut plan.

### T1. White flash frame — the reference reels' main transition

- seen: DSKb 0:01.1, 0:05.2, 0:39.0, 0:44.4; DWyH 0:01.5, 0:26.8, 0:27.4, 0:28.2, 0:39.3, 0:39.7.
- What it is: the last frame of the outgoing shot is pushed to white (1 frame), sometimes 1 pure white frame, then the
  incoming shot starts over-bright and settles in 1–2 frames. Total 2–3 frames.
- Often it is **the footage's own light**: the cut is placed on the frame where a flame, a strobe or a firework blows
  the picture out (DWyH 0:39.3 fire, DfOf 1:21.0 fire, 1:46.2 fire, 2:09.8 LED wall). No effect is added then.
- Build (guessed): adjustment layer 2–3 frames long, exposure or a white solid in Add, keyframed up for 1 frame and
  down over 2. Or simply cut on the bright frame.
- Use: on a low hit, on the first frame after a pull-out, entering the fastest run.
- Mark: `TRANSITION T1 flash 3f` or `CUT ON FLASH (in footage)`.
- In his edits already: Janmashtami 0:13.4, 0:38.6, 0:43.1; aftermovie 3:12.8, 3:14.2 (stage light), 1:36 (face to white).

### T2. Negative / invert flash

- seen: DSKb 0:05.0 (2 frames: the night aerial turns white with blue and red ink marks, then back);
  DfOf 1:28.4 (1 frame of the crowd in cyan negative inside a hard cut); DfOf 0:25.8 (silhouette in a disc inverted).
- Build (guessed): Invert on the outgoing or incoming shot for 1–2 frames.
- Use: rarely, once or twice a film, on the hardest accent. Not in his edits at all.
- Mark: `TRANSITION T2 invert 2f`.

### T3. Film burn / ink frame

- seen: DSKb 0:00.4 (10 frames at the very start: smoke, a red light smear, a white frame with black ink blots, then
  the artist), 0:02.4 (1 white frame with black brush marks), 0:05.8 (black frame, then a white frame with red brush
  strokes at the edges, then the crowd fading in from white over 2 frames).
- Build (guessed): an overlay clip (film burn, ink or paint-stroke stock) in Screen or Add over the cut, 3–6 frames.
- Use: the opening seconds and the last hits before a title. It gives the "film" texture those reels have.
- Mark: `TRANSITION T3 burn overlay 4f`. He needs overlay stock for this; ask what he has.

### T4. Smear / streak blur

- seen: DSKb 0:16.1 (a daylight wide stretches into vertical streaks, 3–4 frames, and lands on the next shot),
  0:23.8 → 0:24.6 (a 7–9 frame teal and cream streak that carries the sunset into the red title), 0:28.0–0:28.2 (two
  hard cuts in and out of a cream streak shot), 0:30.7 (cyan diagonal streaks); DWyH 0:37.0, 0:41.6, 0:44.5 (fire and
  red light smeared sideways, 2–7 frames); DfOf 0:40.3 (orange smear), 0:42.6, 0:43.4 (the crowd smeared sideways).
- Build (guessed): directional blur ramped up to a very large value over 2–3 frames on the outgoing shot and down on
  the incoming one; or a ready smear preset; or a real fast pan in the footage used as the join.
- Use: to change place or chapter. The streak's colour should be the colour of the shot it leaves.
- In his edits: Janmashtami opening (vertical streaks between the first shots), IITF 0:07.6, 0:07.9, 0:09.2 (diagonal
  red and blue streak wipes, 10 frames at 50 fps = 5 at 25). He already does this one well.
- Mark: `TRANSITION T4 smear <direction> 4f`.

### T5. Whip pan

- seen: DfOf 1:12.5 (5 frames, a phone in a hand swings across to a dancing face), 1:02.5 (7 frames, the camera
  whips off a fan speaking and lands on a white-out of the artist).
- Build: use the camera's own fast movement at the end of one shot and the start of the next, cut in the blur.
- Mark: `TRANSITION T5 whip (in footage)`; choose shots with matching direction of movement.

### T6. Zoom / spin blur

- seen: DSKb 0:09.3 and 0:09.6 (the picture goes over-bright and radial-blurs for 2–3 frames between daylight shots);
  DWyH 0:00.0–0:01.0 (the crowd spinning under the logo).
- Build (guessed): radial or zoom blur plus exposure, 3 frames.
- In his edits: Janmashtami zoom-blur push into the crowd.
- Mark: `TRANSITION T6 zoom blur 3f`.

### T7. Dip to black, 1–2 frames

- seen: DSKb 0:04.5 (3 frames, crowd → black → next), 0:35.2 (2 frames), 0:44.4 (white frame, then 2 black frames,
  then the next shot rises out of dark red); DWyH 0:24.8.
- Use: a breath inside a fast run, or just before a hit so the hit lands out of nothing. Costs nothing to build.
- Mark: `TRANSITION T7 black 2f`.

### T8. Exposure pop inside a shot (not a cut)

- seen: DWyH 0:07.5 (a crowd shot jumps bright for 1 frame and back), DfOf 0:53.5 (the stage lights lift for 2
  frames), DfOf 0:18.2 (a figure blows out to white inside the shot).
- Use: on a beat where there is no cut. It keeps a long shot alive on the rhythm.
- In his edits: the strobe-stutter of one shot (Janmashtami 0:30, 0:43) does the same job.
- Mark: `POP exposure 1f`.

### T9. Colour flip on the same shot

- seen: DfOf 0:40.3–0:42.5 (one smiling face, shown yellow-orange, then teal-green, then orange, then teal: three
  cuts of 0.6–0.9 s that are the same shot under a changing stage light or a hue shift), DSKb 0:39.0–0:39.5 (the
  artist over-bright and blue, then warm and dark).
- Use: to hold on one very good face for 2–3 beats without it going still.
- Mark: `SAME SHOT x3, hue A / B / A`.

### T10. Defocus

- seen: DWyH 0:01.0 (the logo holds while the picture under it cuts to defocused lights that pull sharp), 0:28.5
  (a shot blurs and blows out over 4 frames into an aerial), 0:42.1.
- Build: gaussian blur keyframed 0 → heavy over 3–4 frames, or a real focus pull in the footage.
- Mark: `TRANSITION T10 defocus 4f`.

### T11. Text or logo held across cuts

- seen: DWyH 0:00–0:01.5 (the red chrome logo stays while three shots change under it), DfOf 0:04 (title smeared on
  over a moving shot), DdPC 0:43.3–0:45.3 (one line of text over two shots), DSKb 0:15.6 (small red coordinates text
  survives a flash).
- In his edits: Janmashtami "DELHI, GET READY!" over four shots. Same idea, already his.
- Mark: `TITLE holds over cuts N–M`.

### T12. Cut to a black title card in silence

- seen: DSKb 0:06.6 (a 2-frame warm flash, then black with small red capitals for 1.6 s), 0:24.6 (red name over a
  rim-lit silhouette), 0:58.2 and DWyH 0:56.0 (the maker's name, tiny, on black, with a small RGB-split flicker).
- It is a sound move as much as a picture one: see S1.
- Mark: `TITLE CARD black, <text>, 1.5 s, music out`.

### T13. Black-and-white as a section

- seen: DfOf 0:00–0:33 (the whole first movement), 0:42–0:53 (a second run), 1:02.5–1:11 (inverted and grainy);
  DWyH 0:18.8 (one 2.4 s letterboxed black-and-white insert, entered through a white flash).
- The change to or from colour is always a hard cut on a musical change (DfOf 0:33.4: black-and-white face → colour
  aerial of the stadium, exactly where the track opens up).
- In his edits: IITF 0:06.0–0:07.5 only.
- Mark: `B&W from cut N to cut M`.

### T14. Collage of small frames

- seen: DSKb 0:44.9 (two small frames over a full one), 0:51.2–0:52.6 (five or six small frames of different sizes
  on black, each cutting on its own, under a noise burst).
- In his edits: Official Teaser 0:23–0:35 (the wall of video tiles that zooms out).
- Mark: `COLLAGE n frames`.

### T15. Cross dissolve — his, not theirs

- seen in his: aftermovie 0:05 (stage ↔ crowd), 2:08 and 2:37.7 (5 frames, stage → interview), 4:14.1 (10 frames);
  IITF 0:04.7 (31 frames at 50 fps).
- **Not one dissolve was found in any reference reel.** Their soft joins are smears, defocus or black frames.
- When building toward the reference look, replace a dissolve with T4, T7 or T10. Keep dissolves only where he asks.

### What `study.py` flags that is not a transition (strike these out)

- Stage lights changing inside one shot: aftermovie 3:08–3:12 (LED wall), 3:23–3:25, 5:54–6:08 (crowd under strobes);
  IITF 1:34, 3:04–3:05 (dancers under colour changes). Flagged `soft` or `trans 2f`.
- Fire entering a shot: DfOf 1:15, 1:43, 1:59. Flagged `soft`.
- An animated shot (DSKb 0:19–0:22, the poster flying inside the train).

## 3. Sound design

### What the tools measured

| | loudness range | low hits a minute | low hits that have a cut on them | pull-outs |
|---|---|---|---|---|
| DSKb Post Malone | 20 dB | 8 | 38 % | 1 found by the tool, 3 seen |
| DWyH Karan Aujla | 14 dB | 12 | 36 % | 2 |
| DfOf Diljit Delhi | 16 dB | 13 | 8 % | 8 short ones, 5 of them in the spoken ending |
| DdPC Diljit Wembley | 8 dB | 1 | — | none |
| his Janmashtami teaser | (not valid: digital silence at the end) | 56 | 37 % | 1 (before the end card) |
| his Official Teaser | 22 dB | 17 | **76 %** | only at the end card |
| his Aftermovie | 16 dB | 19 | 13 % | 11 short |
| his IITF review | 25 dB | 22 | 9 % | 26 short (gaps in speech, not design) |

"Low hit" = a sudden rise under 150 Hz. In his Janmashtami teaser that is simply the kick drum of the track (56 a
minute); in the reference reels a low hit is a rare, placed event. `look.py`'s riser count is unreliable (same
weakness as the whoosh count in `study.py`); the risers below were read off the spectrograms.

### S1. Pull-out before a title or a hit — the references' signature

- seen: DSKb 0:06.5–0:08.2 (everything above the bass is cut dead on the frame the "ASSAM, GUWAHATI." card appears;
  a thin tone and a low hum stay; the track slams back at 0:08.2 on the first daylight shot), 0:19–0:23 (the track
  thins to a low drone under the animated train, then full band returns at 0:23.8 on the sunset → title),
  DWyH 0:02.5–0:09.5 (after the opening burst, 7 s of near-empty, airy sound under slow wide shots, then the hit at
  0:09.8 with a flash), 0:29–0:33 (thin again under the "P-POP CULTURE" title, back at 0:33).
- Rule to apply: **take the music away for 1–4 s before the moment that should feel biggest, and put a transition
  (T1, T3 or T4) on the first frame it returns.** The picture during the gap is calm: a card, a wide, a slow shot.
- In his edits: the Janmashtami teaser has one (0:47.8, into the date card, with a cut on the return) and the IITF
  review has one at 0:04.7–0:06.0 (cold-open line, 1.5 s of near silence, then the hit and the black-and-white run).
  So he knows the move; the references use it three or four times a minute, he uses it once a film.
- Mark: `MUSIC OUT at <t>, IN at <t>` plus the transition on the return.

### S2. One big low hit, alone

- seen: DWyH 0:09.8, 0:22.8, 0:29.0 (three hits in 57 s, each after a thin passage, each with a cut and two of them
  with a flash); DSKb 0:00–0:06 (a low boom about every 1.1 s, five in a row, each with a flash cut on it, then
  nothing like it until 0:29 and 0:50).
- Rule: a hit counts because the seconds before it are empty of bass. Do not put an impact on every bar.
- Build: a sub-drop or boom SFX (or the track's own drop) placed on the cut frame, with the music's low end ducked
  for the half second before.
- In his edits: the Official Teaser does this best (a heavy hit about every 2.5 s, 76 % of them with a cut and the
  chapter cards sitting on them). That is his strongest sound habit; it only lacks the emptiness before the hit.
- Mark: `SFX impact at <t>` + `duck low end 0.5 s before`.

### S3. Riser into a cut

- seen: DSKb 0:08.0–0:08.2 (a short burst of high noise into the first journey shot), 0:16.5–0:17.0 (a steep climb
  of noise under the smear into the train sequence), 0:23.0–0:23.8 (noise swelling into the sunset), 0:52.0–0:52.8
  (a noise burst shaped like a peak, exactly under the collage); DWyH 0:06–0:09.5 (a broad wash that swells for 3 s
  and is cut off on the hit), 0:33–0:35 (a swell into the fastest part).
- Rule: the riser **ends on the cut frame and is cut off dead**, it does not ring over the next shot. Length 0.3–1 s
  for a transition, 2–4 s for a section change.
- In his edits: aftermovie rising tones into 0:48 and 1:02; a few short ones in the Janmashtami teaser (0:15.9,
  0:19.8, 0:30.6, 0:38.9). Present, but short and few.
- Mark: `SFX riser <length> ending at <t>`.

### S4. Whoosh on a smear or whip

- seen: every T4 and T5 in DSKb has a short band of noise over it (0:16.1, 0:24.6, 0:28.0, 0:30.7).
- Rule: any transition with movement in it (T4, T5, T6) gets a whoosh as long as the transition, centred on it.
  A flash (T1) gets a hit or a camera-shutter click instead, not a whoosh.
- Mark: `SFX whoosh on T4`.

### S5. Let the real sound through

- seen: DfOf 0:57–1:03 (the music drops and a fan's voice and laughter come through, then the track returns on a
  whip to white at 1:02.5), 1:35–1:43 (the low end is removed and the artist's own voice is heard on stage), DdPC
  the whole film (a wash of crowd noise sits under slow music from the first second to the last; loudness range only
  8 dB; no percussive SFX at all), DfOf 2:40–2:55 (music gone, a spoken line with subtitles over a pad).
- Rule: crowd roar is used as an instrument. Lay a continuous crowd bed under the whole cut and lift it at the
  places where the picture shows the crowd; let one real line or one real cheer stand in a gap.
- In his edits: the aftermovie's first 30 s mix live voice and crowd bursts over a build, and every testimony keeps
  music under it. So the material is there; what is missing is the crowd bed under the montage parts.
- Mark: `NAT SOUND up <t0>–<t1>`, `CROWD BED under all`.

### S6. Filter moves (guessed from the spectrogram)

- seen: DfOf 1:34–1:42 (the band below about 200 Hz disappears for 8 s: a high-pass), DSKb 0:48–0:50 (the top end
  closes down before the collage: a low-pass), his aftermovie 1:06–1:09 (low end pulled before the logo).
- Rule: instead of a full pull-out, cut the bass for a bar before a drop and bring it back on the cut.
- Mark: `MUSIC high-pass <t0>–<t1>`.

### S7. Ducking under speech — his, and it stays

- seen in his: Janmashtami 0:20–0:26.5 and 0:31–0:38.5 (music drops under each testimony and is back in full on the
  cut out), IITF throughout (band loud on b-roll, far down under every testimony; e.g. loud 1:25–1:35, speech from
  1:35), aftermovie 4:15–4:19 (the music stops completely for a spoken line, then a hit at 4:19.5 into the dance act).
- The references have almost no speech, so this is his own territory. Keep it as it is.

### Order of work for sound, when a cut plan is written

1. Mark the track's own drops and hits (`beats.json`).
2. Choose 2–4 places a minute for a pull-out (S1) or a bass cut (S6): before each title, before the fastest run,
   before the ending.
3. Put the strongest shots and a T1 / T3 / T4 on the returns.
4. Add risers (S3) into those returns, whooshes (S4) on moving transitions, one impact (S2) on each return.
5. Lay the crowd bed (S5) and mark where natural sound comes up.
6. Leave everything else as hard cuts with no SFX.

## 4. Colour (measured with `look.py`, 2 frames a second)

| | mean brightness | near-black pixels | clipped white | saturation | main hues | warm / cool |
|---|---|---|---|---|---|---|
| DWyH Karan Aujla | 0.14 | 58 % | 0.9 % | 0.49 | azure, red, orange in equal thirds | 59 / 38 |
| DdPC Diljit Wembley | 0.22 | 34 % | 0.5 % | 0.63 | red 61 %, orange 29 % | 97 / 2 |
| DfOf Diljit Delhi | 0.25 | 39 % | 1.0 % | 0.36 | orange 45 %, red 16 % | 68 / 23 |
| DSKb Post Malone | 0.27 | 29 % | 2.0 % | 0.38 | azure, red, orange | 51 / 44 |
| his IITF review | 0.28 | 30 % | 2.2 % | 0.38 | orange, blue, red | 60 / 33 |
| his Official Teaser | 0.35 | 23 % | 6.1 % | 0.48 | blue, azure, orange, red | 42 / 51 |
| his Janmashtami teaser | 0.35 | 15 % | **7.1 %** | 0.28 | orange 44 % | 72 / 17 |
| his Aftermovie | 0.37 | 16 % | 2.2 % | 0.40 | orange, red, azure, blue | 65 / 30 |

- **The references are darker and never clip.** Mean brightness 0.14–0.27 against his 0.35–0.37 (the IITF review,
  0.28, is the exception and is closest). Their whites stop short: under 2 % of pixels clipped, against 6–7 % in his
  two teasers. Their blacks are a third to a half of the picture and are held as true black.
- **Two hues, opposite each other.** The @baricci reels are teal-blue against red-orange in almost equal weight. The
  Wembley film is one hue family only (red and orange, 97 % warm). His edits carry whatever the stage lights gave:
  blue, purple, green, pink and orange together.
- **Skin and whites lean warm, shadows lean teal** in both @baricci reels (seen on every close shot).
- **Lifted, slightly milky bright areas with grain** in the Delhi film's black-and-white part and the Post Malone
  reel (seen); the daylight journey shots are graded like film stock: cream highlights, teal sky, deep greens.
- Saturation is not higher than his. The stronger look comes from darkness and from fewer hues, not from more colour.
- Colour is his job in Premiere. In a cut plan this becomes shot selection: prefer shots whose light is already one
  of the two chosen hues, avoid shots lit green or pink, and avoid shots with a burnt-out stage wall.

## 5. His edits against the references, on these three things

Already his, keep: hard cuts as the base; flash frames on hits; smear wipes (T4); title held across cuts (T11);
video-tile wall (T14); heavy hits with cuts and cards on them (S2); ducking music under speech (S7); one pull-out
before the date card and one after a cold-open line (S1).

To add, in the order they will be noticed:
1. Pull-outs and bass cuts before the big moments, 2–4 a minute instead of one a film (S1, S6).
2. A flash, burn or smear on the first frame the music returns (T1, T3, T4), and hard cuts everywhere else.
3. Risers that end dead on the cut, and whooshes on every moving transition (S3, S4).
4. A crowd bed under the montage, with real sound let through once or twice (S5).
5. Burn and ink overlays in the first seconds (T3), one invert flash on the hardest accent (T2).
6. Black frames as breaths (T7) and exposure pops on beats inside long shots (T8).
7. Replace cross dissolves with smear, defocus or black (T15).
8. Darker picture, held blacks, no clipped whites, two hues (section 4).

Not his to change without asking: the SAM logo bug on every frame, the white social-media end card, name strips and
the "old TV" frame for testimonies. The references have none of these, but they are SAM's branding.

## 6. What is still unknown

- The actual SFX files, plugins and presets behind any of this. A Final Cut Pro XML export of one of his sequences
  would settle his; the reference makers' cannot be known.
- Whether he wants the darker, two-hue grade or only the transitions and sound. He named transitions and sound.
- Which overlay stock (film burns, ink, light leaks) and which SFX library he owns.
- The beat grid of the Post Malone reel was not found reliably, so "on the beat" there is read from the low hits.
- Not looked at (long interview stretches, speech with music under it): aftermovie `sound_006, 008, 009, 010`;
  IITF `sound_004, 005, 006`. Every cut sheet and every shots sheet of all eight videos was looked at.
