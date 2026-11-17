"""Character voiceover with OmniVoice (the engine behind Voice Studio), fitted to an episode's existing timings.
usage: python voice_ov.py <episode_dir> <narrator_ref.wav> <narrator_ref_text>
Writes <episode_dir>/voice.wav (24 kHz). audio.py then uses it instead of Piper and keeps timings.json."""
import json, re, sys
from pathlib import Path
import numpy as np, soundfile as sf, torch
from omnivoice.models.omnivoice import OmniVoice

ep, ref, ref_text = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
T = json.loads((ep / "timings.json").read_text())
torch.set_num_threads(4); torch.manual_seed(7)
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
SR = m.sampling_rate
VO = {"arjun": "male, young adult, high pitch", "old": "female, elderly, low pitch, whisper"}


def chunks(L):  # same split as the caption code in film.html
    parts = [p for p in re.split(r"(?<=[।,?!])\s*", L["say"]) if p]
    tot = sum(len(p) for p in parts); s = L["start"]; out = []
    for p in parts:
        d = (L["end"] - L["start"]) * len(p) / tot; out.append((s, d, p)); s += d
    return out


def say(text, dur, who):
    kw = dict(ref_audio=ref, ref_text=ref_text) if who == "narr" else dict(instruct=VO[who])
    a = m.generate(text=text, language="hi", duration=dur, **kw)
    a = a[0] if isinstance(a, (list, tuple)) else a
    a = (a.detach().cpu().numpy() if hasattr(a, "detach") else np.asarray(a)).squeeze().astype(np.float32)
    rms = np.sqrt(np.mean(a ** 2)) or 1e-6
    return a * (0.11 / rms)


segs = []
for L in T["lines"]:
    c = chunks(L)
    join = lambda i, j: (c[i][0], sum(x[1] for x in c[i:j]), " ".join(x[2] for x in c[i:j]))
    if L["id"] == "call": segs += [(*join(0, 1), "narr"), (*join(1, 3), "arjun"), (*join(3, 4), "narr")]
    elif L["id"] == "woman":
        segs += [(*join(0, 2), "narr"), (*join(2, 4), "old")]
        segs.append((c[0][0] + c[0][1] * .55, 1.6, "[laughter]", "old"))
    else: segs.append((L["start"], L["end"] - L["start"], L["say"], "narr"))

N = int(T["total"] * SR); track = np.zeros(N, np.float32)
for st, dur, text, who in segs:
    a = say(text, round(dur, 2), who)
    if text == "[laughter]": a *= .6
    i = int(st * SR); a = a[: N - i]; track[i:i + len(a)] += a
    print(f"{who:5s} {st:6.2f}s dur {dur:4.2f}s -> {len(a)/SR:4.2f}s  {text[:40]}", flush=True)
track = np.tanh(track * 1.5) / 1.5
sf.write(ep / "voice.wav", track, SR)
print("wrote", ep / "voice.wav")
