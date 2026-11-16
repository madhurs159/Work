"""Voice (Piper) + code-synthesised music & SFX -> mix.wav + timings.json
usage: python3 audio.py <episode_dir> <voice_model.onnx> [upbeat|dark] [length_scale]
script.json line fields: id, say, cap (optional), sting / heart / riser (dark mood cues)"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

SR = 44100
ep, model = Path(sys.argv[1]), sys.argv[2]
mood = sys.argv[3] if len(sys.argv) > 3 else "upbeat"
lscale = sys.argv[4] if len(sys.argv) > 4 else "0.95"
lines = json.loads((ep / "script.json").read_text())
(ep / "vo").mkdir(exist_ok=True)


def read_wav(p):
    with wave.open(str(p)) as w:
        sr, n = w.getframerate(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    if sr != SR:  # linear resample
        t = np.arange(int(len(x) * SR / sr)) * sr / SR
        x = np.interp(t, np.arange(len(x)), x).astype(np.float32)
    return x


# ---- voice ----
LEAD, GAP, TAIL = (0.35, 0.32, 1.2) if mood == "upbeat" else (0.8, 0.55, 2.6)
t, timings, clips = LEAD, [], []
for ln in lines:
    out = ep / "vo" / f"{ln['id']}.wav"
    subprocess.run([sys.executable, "-m", "piper", "-m", model, "-f", str(out),
                    "--length-scale", lscale], input=ln["say"].encode(), check=True,
                   capture_output=True)
    x = read_wav(out)
    nz = np.where(np.abs(x) > 0.01)[0]          # trim silence
    x = x[max(nz[0] - 800, 0): nz[-1] + 2500]
    d = len(x) / SR
    timings.append({**ln, "cap": ln.get("cap", ln["say"]), "start": round(t, 3), "end": round(t + d, 3)})
    clips.append((t, x))
    t += d + GAP
total = t - GAP + TAIL
N = int(total * SR)
voice = np.zeros(N, np.float32)
for st, x in clips:
    i = int(st * SR)
    voice[i:i + len(x)] += x[: N - i]
voice /= max(np.abs(voice).max(), 1e-6)

tt = np.arange(N) / SR
music = np.zeros(N, np.float32)
sfx = np.zeros(N, np.float32)
rng = np.random.default_rng(1)


def add(buf, start, sig):
    i = int(max(start, 0) * SR)
    if i >= N: return
    sig = sig[: N - i]
    buf[i:i + len(sig)] += sig.astype(np.float32)


def lp_noise(m, win):
    return np.convolve(rng.standard_normal(m).astype(np.float32), np.ones(win, np.float32) / win, "same")


def kick(amp=0.22, dec=14):
    m = int(0.3 * SR); y = np.arange(m) / SR
    return amp * np.sin(2 * np.pi * (45 + 70 * np.exp(-y * 30)) * y) * np.exp(-y * dec)


def ding(at, f=880.0):
    m = int(0.9 * SR); y = np.arange(m) / SR
    add(sfx, at, 0.22 * (np.sin(2 * np.pi * f * y) + 0.5 * np.sin(2 * np.pi * f * 2.01 * y)) * np.exp(-y * 5))


if mood == "upbeat":
    # 100 bpm, Am F C G pad + pluck arp + soft kick
    beat = 60 / 100; bar = beat * 4
    chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (261.63, 329.63, 392.0), (196.0, 246.94, 293.66)]
    for b in range(int(total / bar) + 1):
        ch = chords[b % 4]
        n = int(bar * SR); x = np.arange(n) / SR
        env = np.minimum(x / 0.4, 1) * np.minimum((bar - x) / 0.4, 1)
        pad = sum(np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.003 * x) for f in ch) / 3
        add(music, b * bar, 0.10 * pad * env)
        add(music, b * bar, 0.16 * np.sin(2 * np.pi * ch[0] / 2 * x) * env)
        for k in range(8):
            m = int(0.35 * SR); y = np.arange(m) / SR
            add(music, b * bar + k * beat / 2, 0.07 * np.sin(2 * np.pi * ch[k % 3] * 2 * y) * np.exp(-y * 9))
        for k in range(4):
            add(music, b * bar + k * beat, kick())
    for i, tm in enumerate(timings):
        if i:  # whoosh on scene change
            m = int(0.45 * SR); y = np.arange(m) / SR
            add(sfx, tm["start"] - 0.2, 0.9 * lp_noise(m, 40) * np.sin(np.pi * y / 0.45) ** 2)
        if tm["id"] in ("y10", "y20"): ding(tm["end"] - 0.5, 880 if tm["id"] == "y10" else 1046.5)
        if tm["id"] == "y30":
            for j, f in enumerate((1046.5, 1318.5, 1568.0)): ding(tm["end"] - 0.7 + j * 0.12, f)
    duck_amt, mus_gain, sfx_gain = 0.55, 0.9, 0.6
else:
    # dark: low drone + engine rumble + eerie high tone; heartbeat / riser / sting cues
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * tt)
    music += 0.13 * lfo * (np.sin(2 * np.pi * 55 * tt) + np.sin(2 * np.pi * 55.6 * tt) + 0.5 * np.sin(2 * np.pi * 82.4 * tt))
    music += 0.9 * lp_noise(N, 220) * (0.8 + 0.2 * np.sin(2 * np.pi * 7 * tt))          # engine
    ph = 2 * np.pi * np.cumsum(659 + 7 * np.sin(2 * np.pi * 4.5 * tt)) / SR
    music += 0.022 * np.sin(ph) * np.clip(np.sin(2 * np.pi * tt / 11 - 1), 0, 1) ** 2
    music *= np.minimum(tt / 1.5, 1)
    for tm in timings:
        if tm.get("heart"):
            b = tm["start"]
            while b < tm["end"] + 0.3:
                add(sfx, b, kick(0.5, 10)); add(sfx, b + 0.28, kick(0.35, 10)); b += 0.95
        if tm.get("riser"):
            d = tm["end"] - tm["start"] + 0.5; m = int(d * SR); y = np.arange(m) / SR
            phs = 2 * np.pi * np.cumsum(200 + 700 * (y / d) ** 2) / SR
            add(sfx, tm["start"], (0.10 * np.sin(phs) + 1.2 * lp_noise(m, 12)) * (y / d) ** 2.5)
        if tm.get("sting"):
            m = int(3.2 * SR); y = np.arange(m) / SR
            hit = sum(np.sin(2 * np.pi * f * y) for f in (55, 110, 116.5, 155.6, 233.1, 466.2)) / 6
            add(sfx, tm["start"] - 0.12, 0.95 * hit * np.exp(-y * 1.3) + 1.6 * lp_noise(m, 6) * np.exp(-y * 9))
    m = int(4 * SR); y = np.arange(m) / SR                                              # closing low bell
    add(sfx, timings[-1]["end"] + 0.2, 0.3 * (np.sin(2 * np.pi * 110 * y) + 0.5 * np.sin(2 * np.pi * 277.2 * y)) * np.exp(-y * 1.2))
    duck_amt, mus_gain, sfx_gain = 0.45, 1.0, 0.75

env = np.convolve(np.abs(voice), np.ones(4000) / 4000, "same")
duck = 1 - duck_amt * np.clip(env * 8, 0, 1)
mix = voice * 0.95 + music * duck * mus_gain + sfx * sfx_gain
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
mix = np.tanh(mix * 1.1)
with wave.open(str(ep / "mix.wav"), "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32000).astype(np.int16).tobytes())
(ep / "timings.json").write_text(json.dumps({"total": round(total, 3), "lines": timings}, ensure_ascii=False, indent=1))
print(json.dumps({"total": total, "lines": [(x["id"], x["start"], x["end"]) for x in timings]}))
