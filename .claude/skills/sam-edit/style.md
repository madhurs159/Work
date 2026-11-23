# Edit style: SAM videos

## Stated by the owner (2026-11-23)

- Fast edits, cut on the beat.
- Sometimes a montage in which the footage is sped up and slowed down.
- Different video transitions, not one.
- SFX.
- He chooses the music himself and has his own way of choosing it.

## Not known yet

To be filled from his finished edits and his answers.

- Pace: beats per shot in quiet and in loud sections; whether a cut sits on the beat or a frame or two ahead of it.
- Speed: which shots get ramped, from what speed to what, and where against the beat.
- Transitions: which ones, how often, on which kind of cut.
- SFX: which sounds, for what, how far ahead of the cut.
- Music: what he picks for a teaser, a highlight, an aftermovie, a testimonial; where the drop should land.
- Structure of each kind of video: how it opens, builds and ends; the share of audience against stage shots.
- Testimonial videos: how he chooses and trims what people say.
- Titles, logos, colour.

## Defaults until then (Claude's, not his)

- Cuts land on beats, shots get shorter as the music gets louder, and the strongest shot lands on a drop.
- No shot is used twice. (His finished edits do reuse strong shots; ask him before applying this.)

## Learned from finished edits

Studied 2026-11-23 on his computer with `study.py` (720p downloads in `F:\Claude\sam_refs`, not in the repo).
Each point says whether it was **measured** (study.py numbers), **seen** (on the sheets) or **guessed**.
Not looked at, to save tokens: aftermovie `cuts_005–008` and `sound_002, 004–006, 008–010`; review `cuts_002–003`
and `sound_002–006`. Every shots sheet of all four videos was looked at.
None of this has been confirmed by him yet.

### Seen in all four (candidates for the general style)

- **Branding** (seen): small emblem top-left and the three-dot SAM mark top-right on every frame; the same white end
  card (SAM logo, Facebook / X / Instagram handles, e-mail) closes every video, 4–10 s, in silence or on the music tail.
- **Pace follows the music level** (measured): shots are shortest in the loud sections in every video (median 0.36 s,
  0.46 s, 0.84 s, 1.22 s in "high" against 1.4 s, 0.63 s, 1.66 s, 3.12 s in "low").
- **Cuts are near the beat, not locked to it** (measured): 35 %, 44 %, 32 %, 24 % of boundaries within about 2 frames
  of a beat, where chance would give 25 %, 32 %, 23 %, 17 %; another 11–24 % on the half beat. The beat tracker was
  not checked by ear, so this may undercount. In the Official Teaser the cut tends to come 1–2 frames *before* the
  beat (68 early against 23 late); the other three show no lean.
- **Mostly hard cuts** (measured, then checked on the cut sheets): 73–96 % of boundaries are plain cuts. Many of the
  boundaries flagged `trans` in band footage are stage lights changing inside one shot, or a stutter of the same shot
  (seen), so real transitions are rarer than the counts say.
- **The same strong shots come back** across videos and inside one video (seen): the singer in the white-rimmed
  glasses behind the CO2 jet, the confetti over the barrier crowd, the red-lit drone shot of the field, the girl in
  the brown sweater clapping. The default "no shot is used twice" is therefore wrong for him inside the fast montage.
- **Audience shots agree with his selection rules** (seen): young faces, smiling or shouting, hands up, phones up,
  packed frame, shot from the barrier or from a drone over a full field. During the guest's speech in the aftermovie
  the audience shots are still, attentive faces (1:24–1:36), as his lecture rule says.

### Teaser — SAM x Bhajan Clubbing, Janmashtami (0:55, 50 fps) `w-pgNCryxLQ`

- measured: 78 shots, median 0.36 s (1 beat at 152.7 BPM), 84 cuts a minute. Half-beat shots 29, one-beat 26.
  Cuts per 10 s: 13, 16, 6, 9, 30, 3 — the fastest run is the last one before the date card (0:40–0:47).
- seen, structure: title over four fast shots ("DELHI, GET READY!", the text holds while the pictures change) →
  hook line over a drone shot → venue gate → crowd, fireworks, confetti → "LIVE IN CONCERT / ETERNAL BLISS" →
  testimony 1 (6.7 s) → 8 crowd shots → testimony 2 (7.4 s) → fastest montage → date and venue card (2.5 s) → end card.
- seen, sound: about 4 s of thin intro with a stutter in the first second, music in full at 0:04; under both
  testimonies the music stays but drops; it comes back in full on the cut out of each testimony (0:26.5, 0:38.5).
- seen, transitions: vertical streak-blur between the opening shots, zoom-blur push into the crowd, a picture
  shrinking into a frame then zooming out, an upward slide, a whip pan, white flash on smoke, strobe-stutter of one
  shot (the singer at 0:43, the clapping girl at 0:30). 7 boundaries carry a flash (measured).
- measured, speed: probable ramps inside 4 shots, repeated frames in 8.
- seen, titles: bold yellow serif, centred, one phrase at a time; key words larger.
- seen, shot mix (rough count): audience about half, stage and band about a quarter, the rest titles, venue, testimony.

### Official Teaser — SAM Workshops (2:56, 50 fps) `JMg6dO6XJcM`

- measured: 246 shots, median 0.46 s, 84 cuts a minute, 190.8 BPM. Shot lengths cluster on 1 beat (71), 2 beats (46)
  and 8 beats (11). 235 of 245 boundaries are hard cuts. No speech at all, music only.
- seen, structure: logo and mission line (5 s) → chapters. Each chapter is a dark blue card with gold capitals
  (about 2.1–2.5 s, the letters resolve in) followed by a montage of that theme: 30 THOUSAND SELFLESS VOLUNTEERS,
  PORTRAYALS OF LIVES OF REVOLUTIONARIES, CONNECTING YOUTH TO CULTURE, DYNAMIC ORATIONS, PLEDGE TO NATION BUILDING,
  DEPICTION OF SPIRITUAL GIANTS, TRIBUTE TO SOLDIERS, 1.5 MILLION PARTICIPANTS, OUR GUESTS, ONE INSPIRATION → end card.
- measured + seen: the first chapter runs about 30 shots at a steady 0.30 s each (one beat); the revolutionaries get
  one bar each (about 2.5 s) with a name strip at the bottom; guests get about 0.6 s each with a blue name tag.
- seen, sound: the track has a heavy hit about every 2.5 s and the chapter cards and the long shots sit on those hits.
- seen: a wall of small video tiles that zooms out (0:23–0:35); photographs are mixed with video (many shots are
  stills, which is why 86 shots show repeated frames).
- measured, speed: probable ramps inside 16 shots.

### Aftermovie — National Youth Day, Sri Venkateswara College (11:57, 25 fps) `hp1LWn8hRTA`

- measured: 240 shots, median 1.16 s, 20 cuts a minute overall, 115.4 BPM. 0:00–1:10 is a montage at 10–17 cuts per
  10 s; after 6:50 it is almost one cut a minute. Longest shot 80 s.
- seen, structure: fast montage of the whole night (crowd, band, ballet, fireworks, 0:00–1:09) → SAM logo sting
  (1:09–1:15) → guests on stage with listening audience (1:15–1:42) → then blocks that alternate short youth
  testimonies at the lit "SAM" letters (2–13 s each) with a montage of the act being talked about (the Vivekananda
  skit, the band, the "Influencer of the Year" dance, the singer) → from 6:54 long interviews with dignitaries
  (17–80 s each, orange name strip) → end card.
- seen, sound: the first 30 s mix live voice and crowd bursts over a build; the music is in full from about 0:32;
  rising tones lead into 0:48 and 1:02; the low end is pulled out at 1:06–1:09 and comes back on the logo. Speech
  always has music under it. A clear impact sits on the cut from a testimony back to the band at 3:05.
- seen, transitions: cross dissolves between stage and crowd (0:05), dissolve from an interview into the act (2:08),
  fire / light-leak overlay in the skit (2:22), a face bleaching to white before a cut (1:36), whip-like 2-frame
  blurs in the montage. 9 boundaries carry a flash (measured).
- seen: vertical phone clips are placed on a blurred copy of themselves to fill 16:9.
- measured, speed: probable ramps inside 22 shots, mostly in the montage parts.

### Public Review — SAM @ IITF 2025, Bharat Mandapam (6:16, 50 fps) `P5aKEI1HC24`

- measured: 97 shots, median 2.16 s, 15 cuts a minute, 100.9 BPM. Testimonies run 2–18 s, most 5–15 s; the b-roll
  between them is 1–7 s. Only 24 % of boundaries near a beat: here the cuts follow the speech, not the music (guessed).
- seen, structure: cold open on one testimony line (4.7 s) → about 1.5 s with the music pulled out → hard hit at 0:06
  and a black-and-white crowd montage (10 shots of 0.1–0.3 s) → colour stage shots through diagonal streak-blur wipes
  → then testimony, b-roll of the act that testimony is about (band, drummer, classical dance, folk dance, the Bhagat
  Singh screen), testimony … → group photo with sparklers → a last testimony → end card.
- seen: every testimony sits in a rounded "old TV" frame on a dark vignette; stage and crowd shots are full frame.
  That is how talking and event footage are told apart.
- seen, sound: b-roll plays loud with the live band; under the testimonies the music drops far down.
- seen: testimonies are picked across ages and groups (students, pairs of friends, families with children, older
  couples), smiling, at night with the fair behind them.

### What is still "probably" (needs him, or a Final Cut Pro XML export)

- Exact speeds of the ramps, the names of his transition presets, and which SFX files he uses: the video shows only
  where they are. The whoosh counts from study.py (10, 3, 15, 7) are unreliable.
- He confirmed on 2026-11-23 that all four videos are his own edits. He has not confirmed the findings themselves:
  he said that will only show after a first rough cut.
- How he picks the music, and his rules for stage shots.

## Where he wants to go: reference edits by others

**He answered on 2026-11-23: what he wants from these reels is their sound design and their video transitions.**
The full catalogue of both, with colour, is in `transitions-sound.md`. The blocks below are the per-video notes on
pace and structure; the comparison list further down was Claude's and is now ranked by his answer: transitions and
sound first, everything else only if he asks.

Asked for on 2026-11-23: he wants edits of the kind he would like to make studied too. Keep these apart from
Learned from finished edits: that section is what he does now, this one is what he is aiming at.

Four Instagram reels he sent on 2026-11-23 with the words "aise edits main karna chahta hun", studied the same day
with `study.py` (downloads in `F:\Claude\sam_refs\aim`, not in the repo). All four are artist concert films by
professional tour crews, not his work. He has not yet said what in each one he likes, so everything under "What these
have that his edits do not" is Claude's comparison, not his stated aim. Ask him before making any of it a rule.
Not looked at, to save tokens: Diljit tour film `cuts_002–005`, `sound_002–003`; Wembley `cuts_001–002`;
Post Malone `cuts_001, 003–018`; Karan Aujla `cuts_002–005`. Every shots sheet was looked at.

### Diljit Dosanjh — AURA India Tour, JLN Stadium Delhi (2:55, 4:3, 24 fps) `DfOfemCtZ7D`

- measured: 119 shots, median 0.92 s, 40 cuts a minute, 168.9 BPM. Shots by music level: low 2.52 s, mid 1.29 s,
  high 0.75 s. Cuts per 10 s never above 13. 41 % of boundaries near a beat and another 31 % on the half beat.
  Probable speed ramps inside 14 shots. No repeated-frame slow motion.
- seen, structure: a story in three movements. (1) Black and white, 0:00–0:33: a child and an adult walking in the
  rain, the stadium, the artist seen from behind and in silhouette, then extreme close-ups of fans' eyes and faces
  looking up. (2) Colour arrives at 0:33 on a wide aerial of the stadium: crowd lights, faces lit by stage colour,
  people dancing in the concourse, a fan speaking to camera (0:57). (3) The show from 1:02: fire, silhouettes, drone
  passes, then long slow shots (5–9 s) in smoke, ending on the stadium from the air with a spoken line as subtitles.
- seen: title card is small red condensed capitals on black with a smear glitch ("AURA INDIA TOUR / JLN STADIUM,
  DELHI"), 1.8 s, 4 s in. No logo bug on the picture.
- seen, sound: the track changes character several times and the picture changes with it; live speech and crowd are
  let through at 0:57–1:03; the ending drops to voice over a pad.
- seen, transitions: almost all hard cuts; a few white flash frames and exposure "burns" into a cut (0:18, 0:25).

### Diljit Dosanjh — Wembley Stadium (0:55, 4:3, 23.976 fps) `DdPC23oIKY0`

- measured: 35 shots, median 1.25 s, 37 cuts a minute, 88 BPM. 33 of 34 boundaries are hard cuts, no transitions,
  no flashes. Shots by length: mostly 1.5–2.5 beats. Last shot 9.4 s.
- seen, structure: strict alternation of the artist as a small silhouette in front of a glowing disc and fans
  screaming at the barrier, close and lit red; then wides of the full stadium, pyro, an aerial; one line of text over
  two shots (white and yellow sans capitals, "FIRST SOUTH ASIAN ARTIST / TO SELL OUT WEMBLEY STADIUM"); it ends on a
  long, slow close shot of the artist laughing.
- seen: one colour world for the whole film (red, orange, black).
- seen, sound: a continuous swell of crowd noise under slow music, no percussive SFX visible at the cuts.

### Bilal Khan (@baricci) — Post Malone, Guwahati (0:59, 25 fps) `DSKbe2IEga5`

- measured: 86 shots, median 0.46 s, 86 cuts a minute, 123 BPM. 28 boundaries are transitions and 28 carry a flash.
  Only 24 % near a beat (chance 25 %): the beat grid was not found reliably here, do not read this as "off the beat".
- seen: the picture is a landscape film turned sideways inside the vertical reel, with a "rotate your phone" icon in
  the first seconds. `study.py` therefore shows it rotated.
- seen, structure: 6 s cold montage of the show → black card with small red capitals ("ASSAM, GUWAHATI.") → the
  journey to the venue in daylight: railway, river, birds, a cow, a bridge, the town (0:08–0:16) → a designed
  animated sequence (a train, posters) → sunset → "POST MALONE" in red over a silhouette at 0:24 → the show: fire,
  fireworks, drone, artist close-ups → a collage of several small frames on screen at once (0:51) → the crew posing
  → the editor's name on black.
- seen, sound: bass hits about once a second through the opening with cuts on them; the music is pulled out at 0:06.5
  for the place card and at 0:19–0:23 before the title; a noise burst at 0:52 covers the collage.
- seen, transitions: white flash frames, an ink / film-burn frame, smear and whip blurs, a light-streak wipe.

### Bilal Khan (@baricci) — Karan Aujla, "P-POP CULTURE" (0:57, 16:9, 25 fps) `DWyHHsKCaR8`

- measured: 53 shots, median 0.76 s, 55 cuts a minute, 77 BPM. 17 transitions (median 3 frames), 15 with a flash.
  Shots by music level: low 1.14 s, mid 0.68 s, high 0.56 s. Probable ramps inside 4 shots.
- seen, structure: the artist's logo (red chrome) sits over the first three shots while they change underneath →
  artist tiny on a lift, drone over fireworks, a fan's painted palm in close-up → slow, almost empty wide shots
  (0:10–0:25) with one black-and-white letterboxed insert of the artist backstage (0:19) → fire and the tour title
  "P-POP CULTURE" at 0:31 → the fastest part 0:35–0:44 → a 5.6 s closing shot looking down into the stage trap
  → the editor's name on black.
- seen, sound: big low-end hits at 0:10, 0:22.8 and 0:29 with a cut on each; the music thins before every hit.
- seen, transitions: 2–3 frame white flashes on the hits, defocus pulls, a smear between crowd shots.

### What these have that his edits do not (Claude's comparison, measured or seen, not his words)

- **Slower, and with long holds.** Three of the four run at 37–55 cuts a minute against his teasers' 84. Each ends on
  one long shot (5–9 s) instead of a date card. Only the Post Malone reel is as fast as his teasers.
- **A story order instead of a montage of everything**: arrival or journey → anticipation (faces before the show)
  → the show → a quiet ending. Two of them show the place and the way there before any stage shot.
- **One colour world per film**, with black and white used as a section of its own (three of four). His edits keep
  the mixed colours of the stage lights; only his IITF review has a short black-and-white run.
- **Faces much closer**: eyes, a hand, one person filling the frame, against his wide barrier shots. The packed
  crowd is shown separately, in aerials and wides.
- **The performer as a small silhouette** against light, smoke or fire, many times over.
- **Silence and drops**: the music is pulled out before a title or a hit and the cut lands on the return.
- **Titles are small, few and plain** (one or two lines, red or white capitals); no logo bug on the picture, no
  chapter cards, no social-media end card. This may not be his to choose: SAM videos carry SAM branding.
- **Formats**: 4:3 or sideways landscape, 24–25 fps, against his 16:9 at 25 or 50 fps.
- **No testimonies cut in**, except one fan line in the long Diljit film, and no name strips.

What they share with his edits already: hard cuts as the base, flash frames on hits, shots shortening as the music
gets louder, speed ramps inside shots, drone wides of a full venue.

What his footage may not allow (guessed): these films are shot for this look, with fast lenses, long lenses, many
cameras and drones, in stadiums with pyro and haze. Which of it can be had from SAM footage is only known once his
raw footage is scanned.

## Corrections

None yet.
