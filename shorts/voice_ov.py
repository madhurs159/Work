"""Directed character voiceover with OmniVoice (the engine behind Voice Studio).
usage: python voice_ov.py <episode_dir>
Reads <episode_dir>/voice.json (delivery direction per phrase) and timings.json (line ids, text, sfx flags).
Writes voice.wav (24 kHz) and rewrites timings.json from the real audio (line start/end + exact phrase times `ck`).
voice.json: {narrator:{ref,ref_text}, voices:{name:instruct}, lead, gap, tail,
             lines:{id:[{who, n(phrases covered, default 1), speed, pause(after, s), text(override), fx}]}}"""
import json, re, sys
from pathlib import Path
import numpy as np, soundfile as sf, torch
from omnivoice.models.omnivoice import OmniVoice

ep = Path(sys.argv[1]); D = json.loads((ep / "voice.json").read_text()); T = json.loads((ep / "timings.json").read_text())
torch.set_num_threads(4)
m = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32); SR = m.sampling_rate
root = Path(__file__).parent


def say(text, who, speed, seed):
    torch.manual_seed(seed)
    kw = dict(ref_audio=str(root / D["narrator"]["ref"]), ref_text=D["narrator"]["ref_text"]) if who == "narr" else dict(instruct=D["voices"][who])
    a = m.generate(text=text, language="hi", speed=speed, **kw)
    a = a[0] if isinstance(a, (list, tuple)) else a
    a = (a.detach().cpu().numpy() if hasattr(a, "detach") else np.asarray(a)).squeeze().astype(np.float32)
    nz = np.where(np.abs(a) > 0.012 * np.abs(a).max())[0]; a = a[max(nz[0] - 400, 0): nz[-1] + 1800]   # trim silence
    return a * (0.11 / (np.sqrt(np.mean(a ** 2)) or 1e-6))


t = D.get("lead", .8); clips = []; seed = 100
for L in T["lines"]:
    parts = [p for p in re.split(r"(?<=[।,?!])\s*", L["say"]) if p]; i = 0; L["start"] = round(t, 3); ck = []
    for sg in D["lines"][L["id"]]:
        n = sg.get("n", 1); ps = parts[i:i + n]; i += n; seed += 1
        a = say(sg.get("text", " ".join(ps)), sg["who"], sg.get("speed", .9), seed); d = len(a) / SR; clips.append((t, a))
        tot = sum(len(p) for p in ps); s = t
        for p in ps: ck.append({"s": round(s, 3), "p": p}); s += d * len(p) / tot
        if sg.get("fx"): b = say(sg["fx"], sg.get("fxwho", "old"), 1.0, seed + 50) * .6; clips.append((t + d * .5, b))
        print(f'{L["id"]:7s}{sg["who"]:6s}{t:6.2f}s  {d:4.2f}s  {" ".join(ps)[:44]}', flush=True)
        L["end"] = round(t + d, 3); t += d + sg.get("pause", 0)
    assert i == len(parts), (L["id"], i, len(parts))
    for k, c in enumerate(ck): c["e"] = ck[k + 1]["s"] if k + 1 < len(ck) else L["end"]
    L["ck"] = ck; t = L["end"] + D.get("gap", .6)
T["total"] = round(T["lines"][-1]["end"] + D.get("tail", 2.6), 3)
N = int(T["total"] * SR); track = np.zeros(N, np.float32)
for st, a in clips: i = int(st * SR); a = a[: N - i]; track[i:i + len(a)] += a
sf.write(ep / "voice.wav", np.tanh(track * 1.5) / 1.5, SR)
(ep / "timings.json").write_text(json.dumps(T, ensure_ascii=False, indent=1))
print("total", T["total"])
