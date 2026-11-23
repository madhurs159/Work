#!/usr/bin/env python3
"""Has Google's Gemini watch a YouTube link and describe how the video is edited: picture and sound.

  watch_link.py <youtube url> [--ask picture|sound|both] [--question TEXT] [--out DIR] [--model ID]

Gemini reads the link itself, so nothing is downloaded: this works where yt-dlp is refused (cloud sessions).
It hears the soundtrack, which Claude cannot. It answers in words with MM:SS times, so this is a description and
not a measurement; study.py on the file gives exact cuts and beats. Treat what it says as evidence to check.
The link is sent to Google. Only YouTube links can be read this way.

Key: GEMINI_API_KEY in the environment (a free key from aistudio.google.com/apikey). In a cloud session whose
network proxy holds the key for generativelanguage.googleapis.com no variable is needed.
The request follows the `watch` skill of bradautomates/claude-video (MIT).
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

API = 'https://generativelanguage.googleapis.com/v1beta'
YOUTUBE = re.compile(r'^https?://(?:(?:www\.|m\.)?youtube\.com/(?:watch\?\S*\bv=|shorts/|live/)|youtu\.be/)([\w-]{6,})', re.I)

CONTEXT = ('This is a finished video of a youth event (rock band, musical ballet, talks, a young audience), cut by '
           'an editor who wants his own editing style written down exactly. ')
RULES = ('\n\nGive an MM:SS time for every statement about a moment. Keep what you see apart from what you hear. '
         'Where you cannot tell, say so plainly instead of guessing.')
ASK = {
    'picture': CONTEXT + '''Describe only what you can SEE.
1. Shot log. Every shot in order, one line each: time | kind (audience, band, singer, ballet or dance, speaker,
   testimony or interview, venue wide, title or graphic, other) | what is shown | framing (wide, mid, close) |
   camera (static, handheld, gimbal move, drone, zoom) | speed (normal, slow motion, sped up, speed ramp) |
   how the shot begins (hard cut, dissolve, whip or blur, zoom, flash, glitch, other). Where shots change faster
   than you can list one by one, say so, give the time range and about how many shots a second.
2. Audience shots. For each: what the people are doing (dancing, clapping, hands up, listening, watching), their
   expressions, about how old they look, and whether empty seats or empty ground can be seen.
3. Text, logos and graphics: the exact words, where on screen, when, and how they move.
4. Effects and look: speed ramps, slow motion, shake, zooms, flashes, light leaks, overlays, split screen,
   black bars, colour grade.
5. Structure: how it opens, how it builds, where the high point is, how it ends, and roughly what share of the
   running time is audience, stage and everything else.
6. Pace: where the cutting is fastest and where slowest.''',
    'sound': CONTEXT + '''Describe only what you can HEAR, and how the picture sits against it.
1. Music: genre, instruments, vocals or none and their language, an estimate of the tempo in BPM (say it is an
   estimate), and its timeline: intro, build, drop, breakdown, ending. Say when the track changes to another one.
2. Sound effects the editor added: whooshes, risers, impacts or hits, bass drops, reverses, glitches, added
   cheers. For each: the time, and what happens on screen at that moment.
3. Voice: any speech, voice-over or interview. Who seems to speak, the language, what is said (transcribe or
   summarise closely), and whether the music is lowered under it.
4. Sound of the event itself (band, crowd, speaker): is it used, and where.
5. Picture against music: do the cuts land on the beat, and on which beats? What happens on screen at each
   drop? Give examples.''',
}


def call(method, url, payload=None, timeout=900):
    key = os.environ.get('GEMINI_API_KEY') or 'set-by-network-proxy'
    req = Request(url, method=method, data=json.dumps(payload).encode() if payload else None,
                  headers={'x-goog-api-key': key, 'Content-Type': 'application/json'})
    try:
        with urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except HTTPError as e:
        body = e.read().decode('utf-8', 'replace').replace(key, '[key]')
        try:
            body = json.loads(body)
            body = (body[0] if isinstance(body, list) else body)['error']['message']
        except (ValueError, KeyError, TypeError, IndexError):
            pass
        sys.exit(f'Gemini refused (HTTP {e.code}): {str(body)[:500]}')
    except (URLError, TimeoutError, OSError) as e:
        sys.exit(f'could not reach Gemini: {getattr(e, "reason", e)}')


def watch(url, question, model):
    data = call('POST', f'{API}/interactions', {'model': model, 'input': [
        {'type': 'video', 'uri': url, 'processing': 'agentic'}, {'type': 'text', 'text': question + RULES}]})
    try:
        parts = [p['text'] for step in data['steps'] if step.get('type') == 'model_output'
                 for p in step.get('content', []) if p.get('type') == 'text' and p.get('text')]
    except (KeyError, TypeError):
        parts = []
    if not parts:
        sys.exit(f'Gemini gave no answer: {json.dumps(data)[:400]}')
    return '\n'.join(parts).strip(), (data.get('usage') or {}).get('total_tokens')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('url', nargs='?')
    ap.add_argument('--ask', choices=['picture', 'sound', 'both'], default='both')
    ap.add_argument('--question', help='a question of your own instead of the built-in ones')
    ap.add_argument('--out', default='gemini_notes')
    ap.add_argument('--model', default=os.environ.get('WATCH_GEMINI_MODEL', 'gemini-3.7-flash'))
    ap.add_argument('--models', action='store_true', help='list the models this key can use, then stop')
    a = ap.parse_args()
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if a.models:
        for m in call('GET', f'{API}/models?pageSize=200', timeout=60).get('models', []):
            print(m.get('name', '').replace('models/', ''))
        return
    m = YOUTUBE.match(a.url or '')
    if not m:
        sys.exit('give a YouTube link (watch, shorts, live or youtu.be); other sites cannot be read this way')
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    asks = {'question': a.question} if a.question else {k: ASK[k] for k in (ASK if a.ask == 'both' else [a.ask])}
    for name, question in asks.items():
        text, tokens = watch(a.url, question, a.model)
        path = out / f'{m.group(1)}_{name}.md'
        path.write_text(f'<!-- {a.url} | {a.model} | {name} | Gemini tokens: {tokens} -->\n{text}\n', encoding='utf-8')
        print(f'===== {name} -> {path}\n{text}\n')


if __name__ == '__main__':
    main()
