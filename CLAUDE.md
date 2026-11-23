# Project: automated Hindi story YouTube channel

Read this first in every session. The owner should not have to repeat any of it.

## How to work with the owner
- Writes Hinglish. Reply in short Hinglish. No long explanations, no politeness padding — act, then report briefly.
- **Zero money**: never use a paid tool or API. No Higgsfield. No ElevenLabs (credential request was declined — don't ask again).
- Low on tokens: avoid subagents and long reads; renders and voice generation cost no tokens.
- Review scripts/stories yourself as director and script writer. Ask the owner's opinion only on finished videos.
- Never ask for secrets in chat. Keys go in GitHub Actions secrets or the environment's network secrets.
- Don't run third-party setup scripts.

## Decisions already made
- Niche: Hindi suspense / horror storytelling.
- Visual style: 80s cel anime, drawn in code (`shorts/opuscar/cel-anime-80s/`).
- Voice: OmniVoice, narrator "voice A" (`shorts/voice_samples/narrator_A.wav`), heavy voice, directed delivery (`shorts/voice_ov.py`).
- Formats: long video 16:9, 5–6 min (~700 Hindi words); 3–4 vertical Shorts cut from it; same Shorts go to Instagram Reels.
- Posting: planned GitHub Actions workflow. YouTube secrets `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`; Instagram needs a Professional account + Facebook Page + Graph API token. Not built yet.

## Pipeline (`shorts/`)
1. `<ep>/lines.json` — script lines (id, who, say).
2. `python voice_ov.py <ep>` → `voice.wav` + `timings.json` (CPU, slow: ~1.5 h for 4 min).
3. `python3 audio.py <ep> unused dark` → `mix.wav` (music + SFX).
4. `<ep>/film.html` — one shot per line; `node render.js <ep> --size 1920x1080` → `final.mp4`.
5. `node <ep>/cut_shorts.js` → vertical shorts in `<ep>/shorts/`.

Keep videos under 100 MB (GitHub limit) and H.264 level 4.0 (`-preset medium`) so phones play them.
Episode 1 is `shorts/long1/` ("आख़िरी बस", 4:11).

## Skills in this repo (`.claude/skills/`)
- `paint-mv`, `paint-mv-storyboard`, `paint-mv-animate`, `paint-mv-render` — song/narration + lyrics → watercolour video.
  The drawing engine is not included: it is fetched from `JohnHeibel/PDoomVideo` (no licence), which needs the owner to
  give the session access to that repository. It also uses one subagent per chapter, so it is token-heavy.
- `sam-edit` — the owner's other work: rough cuts of SAM event videos in his style (see below).

## SAM event editing (separate from the channel)
- The owner volunteers as editor for SAM Workshop (DJJS youth wing): event highlights, aftermovies, teasers and
  testimonial videos, finished in Premiere Pro. Professionally he generates AI videos and edits them in Premiere.
- `.claude/skills/sam-edit/` holds his shot-selection rules, his edit style and the tools. Its SKILL.md has the
  current status and what is still needed from him. It has to run on his computer, where the footage is.
