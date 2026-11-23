# Shot selection: what he picks, what the references pick

He asked on 2026-11-23 for shot selection to be studied in detail, in his own four YouTube edits and in the four
reference reels. This file is the result. `SKILL.md` has the rules he *stated*; this file is what his finished edits
and the references *show*. Where the two disagree, his stated rules win until he says otherwise.

## How this was got, and how far to trust it

- Every shot of all eight videos (954 shots) was labelled by Claude from the shots sheets: a **kind** (audience,
  testimony, performer, ballet/skit, speaker, venue/stage wide, pyro/lights, other, graphic, card) and a **size**
  (detail, close = 1–2 people, medium = small group or one performer full body, wide, aerial).
  The labels are in `F:\Claude\sam_refs\labels.txt`; `scripts/shotmix.py` counts them against `study.py`'s lengths.
- A label rests on 1–3 small frames of a shot. Medium against close, and "venue wide" against "audience wide", are
  judgement calls. Read every percentage as ±5 points. Counts of 0 % and of over 40 % are safe.
- **A finished edit shows only what was chosen.** What he rejected, and why, is not in it. The real test of
  everything below is his corrections on picks from raw footage.
- Videos: his = Janmashtami teaser (J), Official Teaser (O), Aftermovie (A), IITF Public Review (R).
  References = Diljit Delhi (DfOf), Diljit Wembley (DdPC), Post Malone (DSKb), Karan Aujla (DWyH).

## 1. The numbers

Share of shots, cards left out. Time share in brackets where it differs a lot.

| | audience | testimony | performer | ballet / skit | speaker | venue wide | pyro / lights | other | graphic |
|---|---|---|---|---|---|---|---|---|---|
| J teaser | **54 %** (32 % of time) | 3 % (30 %) | 23 % | – | – | 18 % | 3 % | – | – |
| O teaser | 4 % | – | 0 % | 21 % | 20 % | 8 % | – | 36 % volunteers | 10 % |
| A aftermovie | 26 % (9 %) | 17 % (**64 %**) | 22 % | 13 % | 5 % | 17 % | 0 % | – | – |
| R review | 18 % (3 %) | 36 % (**71 %**) | 24 % | 13 % | 2 % | 3 % | 2 % | 2 % | – |
| DdPC Wembley | 21 % | – | **44 %** (61 %) | – | – | 32 % | 3 % | – | – |
| DfOf Delhi | 25 % | 4 % | **47 %** (55 %) | – | – | 22 % | 1 % | 2 % | – |
| DSKb Post Malone | 12 % | – | 24 % | – | – | 12 % | **16 %** | **25 %** journey, crew | 11 % |
| DWyH Karan Aujla | 15 % | – | **48 %** | – | – | 29 % | 6 % | 2 % | – |

Shot size, all shots:

| | detail | close | medium | wide | aerial | wide + aerial |
|---|---|---|---|---|---|---|
| J | 0 % | 25 % | 34 % | 38 % | 3 % | 41 % |
| O | 2 % | 12 % | 48 % | 22 % | 5 % | 27 % |
| A | 1 % | 35 % | 33 % | 31 % | 0 % | 31 % |
| R | 1 % | 43 % | 27 % | 28 % | 0 % | 28 % |
| DdPC | 0 % | 15 % | 24 % | 47 % | 15 % | **62 %** |
| DfOf | 9 % | 22 % | 31 % | 25 % | 12 % | 37 % |
| DSKb | 7 % | 17 % | 14 % | 41 % | 10 % | **51 %** |
| DWyH | 2 % | 8 % | 23 % | 52 % | 15 % | **67 %** |

Audience shots only:

| | detail + close | medium | wide + aerial | median length | next shot is also audience | come alone |
|---|---|---|---|---|---|---|
| J | 26 % | 42 % | 32 % | 0.37 s | **78 %** | 11 % |
| O | 0 % | 0 % | 100 % (70 % aerial) | 0.59 s | 50 % | 40 % |
| A | 55 % | 37 % | 8 % | 0.76 s | 52 % | 52 % |
| R | 29 % | 24 % | 47 % | 0.26 s | 71 % | 60 % |
| DdPC | 43 % | 43 % | 14 % | 1.21 s | **0 %** | **100 %** |
| DfOf | **73 %** (28 % detail) | 14 % | 14 % | 0.83 s | 79 % | 50 % |
| DSKb | 50 % (30 % detail) | 50 % | 0 % | 0.46 s | 30 % | 71 % |
| DWyH | 37 % | 0 % | 62 % | 1.02 s | 25 % | 83 % |

Performers on stage (band, ballet, speaker together):

| | close | medium | wide |
|---|---|---|---|
| J | 38 % | 50 % | 12 % |
| O | 14 % | 74 % | 12 % |
| A | 12 % | 60 % | 28 % |
| R | 8 % | 57 % | 35 % |
| DdPC | 13 % | 33 % | **53 %** |
| DfOf | 20 % | 58 % | 22 % |
| DSKb | 45 % | 30 % | 25 % |
| DWyH | 4 % | 48 % | **48 %** |

## 2. What he picks — by kind of shot (seen on the sheets)

### Audience

- **Barrier shots.** The front row at the rail, 3–8 faces, shot from the pit at chest height, slightly wide lens.
  Hands or phones up, mouths open or smiling, lit by the stage in one strong colour (pink, purple, green, white).
  J #12, #13, #19, #24–28, #70–74; A #4, #12, #40, #52–54, #69, #74.
- **Confetti and paper over the crowd.** His favourite single kind of moment: the burst is in the air, hands are
  reaching up. J #16–19, #24–28, #35, #45; A #18, #79, #149–150. The same burst is often used as 3–5 consecutive
  very short shots (0.06–0.3 s) — one take cut into a stutter.
- **One or two faces close.** A girl clapping and laughing, shot from the side at 1 m (J #37–39, A #154–157 — the
  same shot three times in a row); a boy pointing at the camera (J #70); a pair shouting (A #25).
- **Top shots of a packed crowd.** From a raised position or drone, the whole frame faces and raised arms, one
  colour of light: red (J #31, #47), green (J #48, A #45, #107), white (A #108, #172), blue with phone torches
  (R #53–57, five in a row), aerials of a full field (O #194–218).
- **One position, three colours.** A #106–108 and A #172–174: three shots of the same packed faces in orange, green
  and white light, each about 0.6–2 s. The colour change is the stage light, used as three shots.
- **Listening faces, during a speech.** A #86, #88, #90, #91: one or two faces close, still, looking up and past the
  camera, cool blue light, 0.6–2.6 s each, cut between shots of the guest speaking. This is exactly his stated
  lecture rule, and it is the only place a still, non-cheering audience appears.
- **Phones.** A phone held up filming is in a large share of his audience shots (J #13, #20, #74; A #52–54, #74,
  #213). He does not avoid them; a raised phone reads as engagement.
- **Audience shots come in runs.** In the teaser 78 % of audience shots are followed by another audience shot, in
  runs of about 5. The crowd is shown as a burst of many faces, not one at a time.
- **Length.** 0.26–0.76 s median. Longest audience shot in any of his edits: 4.8 s.
- **Against his stated rules** (packed, young, engaged): almost every audience shot agrees. Shots where the crowd is
  seen loosely from behind with ground or gaps visible: J #33, A #99 (people dancing in open space), A #186, A #188.
  They are few; whether he would still pick them is a question for him. The IITF review shows a seated, mixed-age
  audience (it is a public fair), in black and white for 1.5 s and in blue wides.

### Band and singers

- **Medium, from the pit, low angle**, the performer from the knees or waist up, with something in the air around
  them: CO2 jet (J #58–62), confetti (J #53–56, A #30–34), sparklers (A #126–128), haze and a beam (A #27, #55).
- **A gesture at its peak**: arm thrown out, fist up, pointing at the crowd, head back singing (A #51, #67, #153;
  R #39, #48). No shot of a performer standing still between lines was found.
- **Players as well as the singer**: guitarist (A #31, #96, #126–130), drummer (A #47–48, #146, #221; R #13, #26,
  #46–47), dhol (A #58, R #41), tabla (R #81), keys (A #68). One short shot each, on a fill or an accent.
- **The same performer shot cut into 3–5 pieces** on consecutive beats (J #58–62, A #32–34, #42–44, #201–207).
- **Close is rare** (8–38 %), true close-ups of a face almost absent. Wide stage shots are counted under venue.
- Seen and probably not wanted: a camera operator with a gimbal is in frame behind the singer in A #204–206 and
  A #193. Ask him whether that is acceptable or was the only angle.

### Musical ballet, dance, skit

- **Wide first, then medium.** A wide of the whole formation on the lit stage (A #23, #46, #100; R #63, #66, #72),
  then medium on the lead or on a group (A #24, #61; R #64–65, #67–69, #79).
- **The peak of a movement**: the jump at its top (A #35–38, the same jump four times; A #61), swords crossed
  (O #168–172), arms flung open (A #115–116), a skirt at full spin (R #79).
- **Characters in costume, medium, one each**: O #80–89, ten revolutionaries, each centred, waist up, in a strong
  pose, with a name strip, 0.7–2.6 s. O #165–179 the same for the spiritual figures.
- **Fire, flags and torches in frame** wherever the act has them (A #15, #49, #75, #111–119; O #149–163).
- Size: 57–74 % medium, the rest wide. Almost no close shots.

### Lectures, speakers, guests

- **One framing only**: waist up, centred or slightly off centre, the LED wall or backdrop behind, microphone in
  hand. O #122–147 (26 speakers, 0.3–1.4 s each), O #220–239 (20 guests with a blue name tag, about 0.6 s each),
  A #84–93, #97, #182–184, R #17, #84.
- **Always mid-gesture**: a raised finger, an open palm, a fist. In O #122–147 nearly every one of the 26 has a hand
  up. A speaker with hands down, reading or looking away is not used.
- Guests on stage as a group, wide, to show who was there (A #57, #71, #83, #85).

### Venue and stage wides

- **From behind the crowd toward the stage**, heads in the lower third, the lit stage and LED wall above, pyro,
  CO2 or beams going off (J #3, #23, #34, #44, #46, #57; A #2, #14, #26, #28–29, #39, #41, #50, #64–66, #80).
- **Drone over a full ground at night** (J #6–7, O #194–218) and the entrance gate by day (J #8–9).
- 17–18 % of shots in the teaser and the aftermovie. They are where the pyro and the scale are shown.

### Testimonies

- **Close to medium, eye level, the SAM-cube microphone in frame**, a lit background behind the person: the glowing
  "SAM" letters (A, nearly all), the fairground at night (R, J), a sponsor wall for dignitaries (A #110, #231–238).
- **Pairs and small groups as often as single people** (J #30; A #105, #109, #124, #138, #162; R #21–22, #35, #40,
  #50, #59–60, #73–75). Smiling, animated, hands moving.
- **Youth first**; in the aftermovie the dignitaries come last and run long (17–80 s). In the review, families and
  older visitors are included on purpose (it is a public-review video).
- Length: median 5.7–7.6 s; each is cut down to one thought. Vertical phone clips sit on a blurred copy of
  themselves (A #135, #137, #185–190, #228).
- Each testimony is followed by the act it talks about (see `style.md`).

### SAM volunteers (Official Teaser, chapter 1)

- Daylight, medium group shots of people in yellow or orange SAM jackets **doing something**: handing over a book,
  building a set, leading a march, teaching children. O #3–20, #22–55, 0.30 s each.
- **The back of the jacket with the SAM logo** fills the frame several times (O #4, #18, #34; R #77).

## 3. What the references pick

### Audience

- **Much closer, and fewer.** 12–25 % of shots against his 54 % in the comparable teaser. Half to three quarters of
  them are close or detail: eyes filling the frame (DfOf #16–18), a profile with pearls (DfOf #17), a hand with a
  painted palm (DWyH #8), a phone in a hand against the stage glow (DSKb #41, #55), a girl seen from behind against
  out-of-focus lights (DfOf #26–27), one screaming face lit red (DdPC #13, #16, #18).
- **Looking, not only cheering.** DfOf #15–23: nine faces in a row looking up, waiting, in black and white, before
  any stage shot. Anticipation is used as a chapter of its own.
- **One at a time.** In DdPC every audience shot stands alone between two shots of the artist or the stadium
  (100 %); in DWyH 83 %, in DSKb 71 %. Reaction is answered by action, shot for shot.
- **Front-loaded.** DfOf puts all its audience in the first third (44 % of that third) and then runs 60 shots with
  none. DdPC has none in its last third.
- **The packed house is shown by aerials and wides**, kept separate from the faces (DfOf #24–25, #32; DWyH #9–11,
  #18, #45; DdPC #8, #19, #21).

### The performer

- **About half of all shots**, against his 22–24 %.
- **Small in a big frame.** 48–53 % of performer shots are wide in DdPC and DWyH: a tiny figure in front of a
  glowing disc (DdPC #3, #5, #10–12), on a lift above the crowd (DWyH #4, #17), at the end of a runway in smoke.
- **From behind and in silhouette** (DfOf #6, #7, #9, #13, #117; DWyH #25–26; DSKb #48, #51): rim light, no face.
- **With fire or smoke in the same frame** in a large share of shots (DfOf #54, #56, #68, #90–91, #98, #112, #116;
  DWyH #25, #32, #38–41; DdPC #14, #20, #33).
- **One long, close, calm shot to end on**: DdPC #35 (9.4 s, the artist laughing), DfOf #109–112 (3–6 s each in
  smoke), DWyH #50 (5.6 s looking down into the stage trap).

### Kinds of shot he does not have at all

- **Pure texture** — fireworks filling the frame, a light smear, lens flare, blur (DSKb 16 % of shots; DWyH #29,
  #33, #36). Used as punctuation between real shots.
- **The way there** — railway, river, a road sign, birds, a cow, a bridge, the town (DSKb #18–34, a quarter of the
  reel); a child and an adult walking in the rain, people dancing in the concourse, staff at a gate (DfOf #1,
  #33–39).
- **Details of objects** — a turban from behind (DfOf #6), feet on a wet floor (DfOf #35), a framed poster held
  over the rail (DWyH #22).
- **Backstage** — one black-and-white shot of the artist alone (DWyH #21).
- **The crew at the end** (DSKb #83–85).

## 4. His edits against the references

| | his edits | references |
|---|---|---|
| Who the film is about | the audience and the many acts | one performer, with the audience as witness |
| Audience share of shots | 54 % (teaser), 18–26 % (longer films) | 12–25 % |
| Audience size | medium groups at the barrier | faces, eyes, hands; or the whole field from the air |
| Audience rhythm | bursts of about 5 in a row | one shot, then back to the stage |
| Audience mood | cheering, clapping, filming | also waiting and looking |
| Performer size | medium, waist up | half of them wide, small in the frame |
| Performer angle | front, from the pit | also from behind, in silhouette |
| Wide + aerial, all shots | 27–41 % | 37–67 % |
| Aerial | 0–5 % | 10–15 % |
| Detail shots | 0–2 % | 2–9 % (28–30 % of audience shots in two reels) |
| Texture shots | 0–3 % | 3–16 % |
| Journey, backstage, crew | none | in two of four |
| Last shot | date card or end card | a long calm shot of the performer or the venue |

Same in both: the peak of a gesture is what gets picked; fire, confetti and smoke in frame are preferred; a full
venue from the air; the same strong shot cut into several pieces.

A caution that is Claude's, not his: SAM's own purpose pulls the other way from the references on one point. He
said the teaser must say that a young, packed audience is loving SAM, and the references are films about a star.
Fewer audience shots is therefore probably *not* what to take from them. Closer faces, single reaction shots
answered by the stage, anticipation before the show, wides and aerials for scale, texture shots and a calm last shot
can all be taken without losing the audience.

## 5. Picking from raw footage — working checklist

Use his stated selection rules in `SKILL.md` first. This list adds what his finished edits show he actually takes.
Each line is "seen in his edits", not something he has said.

For every candidate span, mark the **peak frame** and take 0.3–1 s around it for a montage, 1–3 s for a slow part.

- Audience, band on stage: barrier group with hands or phones up; confetti or paper in the air; one or two faces
  laughing or clapping close; a packed top shot in one colour of light. Take several from the same pass: he uses
  them in runs.
- Audience, lecture on stage: one or two still faces, eyes on the stage, 1–2.5 s.
- Audience, ballet on stage: nothing in his edits shows this clearly yet; use his stated rule (eyes on the ballet).
- Band: medium from the pit with CO2, confetti or sparks in frame, at the top of a gesture; one shot of each player
  on an accent. Reject: performer idle, back turned by accident, a crew member crossing the frame.
- Ballet: one wide of the full formation per act, then medium on the lead at the top of a jump, spin or pose;
  fire, flags, torches in frame.
- Speaker: waist up, a hand raised. One to three seconds. Reject hands-down and reading.
- Venue: from behind the crowd with pyro, CO2 or beams firing; a drone pass over a full ground; the gate.
- Testimony: one clear thought of 5–8 s, smiling, lit background; pairs welcome.
- Always note for each pick: kind, size, light colour, what is in the air (confetti, CO2, fire, nothing), and
  whether a phone, a crew member or an empty patch is in frame.

If he asks for the reference look in the pictures too (he has named sound and transitions, not this), also pull:
faces close enough that the eyes fill a third of the frame; people looking up and waiting before the show; single
reaction shots; the performer small in a wide frame or from behind with rim light; texture (fireworks, flare, a
blurred pan); the way to the venue and the ground filling up; one calm long shot to end on.

## 6. Still unknown

- His rules for stage shots, in his own words. Section 2 is what he used, not why.
- What he rejects. Needs raw footage and his corrections.
- Whether the loose-crowd shots (J #33, A #99, #186, #188) and the crew-in-frame shots (A #193, #204–206) were
  choices or the best that was there.
- Whether he wants any of section 3 in the pictures, or only the transitions and sound he named.
- Whether the raw footage holds what the references use: long-lens close faces, drone passes, backstage, arrival.
