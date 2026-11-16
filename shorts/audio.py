"""Voice (Piper) + code-synthesised music & SFX -> mix.wav + timings.json
usage: python3 audio.py <episode_dir> <voice_model.onnx>"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np

SR = 44100
ep, model = Path(sys.argv[1]), sys.argv[2]
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
LEAD, GAP, TAIL = 0.35, 0.32, 1.2
t, timings, clips = LEAD, [], []
for ln in lines:
    out = ep / "vo" / f"{ln['id']}.wav"
    subprocess.run([sys.executable, "-m", "piper", "-m", model, "-f", str(out),
                    "--length-scale", "0.95"], input=ln["say"].encode(), check=True,
                   capture_output=True)
    x = read_wav(out)
    nz = np.where(np.abs(x) > 0.01)[0]          # trim silence
    x = x[max(nz[0] - 800, 0): nz[-1] + 2500]
    d = len(x) / SR
    timings.append({"id": ln["id"], "cap": ln["cap"], "start": round(t, 3), "end": round(t + d, 3)})
    clips.append((t, x))
    t += d + GAP
total = t - GAP + TAIL
N = int(total * SR)
voice = np.zeros(N, np.float32)
for st, x in clips:
    i = int(st * SR)
    voice[i:i + len(x)] += x[: N - i]
voice /= max(np.abs(voice).max(), 1e-6)

# ---- music: 100 bpm, Am F C G pad + pluck arp + soft kick ----
tt = np.arange(N) / SR
beat = 60 / 100
music = np.zeros(N, np.float32)
chords = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (261.63, 329.63, 392.0), (196.0, 246.94, 293.66)]


def add(buf, start, sig):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    buf[i:i + len(sig)] += sig


bar = beat * 4
nb = int(total / bar) + 1
for b in range(nb):
    ch = chords[b % 4]
    n = int(bar * SR); x = np.arange(n) / SR
    env = np.minimum(x / 0.4, 1) * np.minimum((bar - x) / 0.4, 1)
    pad = sum(np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.003 * x) for f in ch) / 3
    add(music, b * bar, (0.10 * pad * env).astype(np.float32))
    add(music, b * bar, (0.16 * np.sin(2 * np.pi * ch[0] / 2 * x) * env).astype(np.float32))  # bass
    for k in range(8):  # pluck arp on 8ths
        f = ch[k % 3] * 2
        m = int(0.35 * SR); y = np.arange(m) / SR
        add(music, b * bar + k * beat / 2, (0.07 * np.sin(2 * np.pi * f * y) * np.exp(-y * 9)).astype(np.float32))
    for k in range(4):  # kick
        m = int(0.25 * SR); y = np.arange(m) / SR
        add(music, b * bar + k * beat, (0.22 * np.sin(2 * np.pi * (45 + 70 * np.exp(-y * 30)) * y) * np.exp(-y * 14)).astype(np.float32))

# ---- sfx ----
sfx = np.zeros(N, np.float32)
rng = np.random.default_rng(1)


def whoosh(at):
    m = int(0.45 * SR); y = np.arange(m) / SR
    nse = rng.standard_normal(m).astype(np.float32)
    nse = np.convolve(nse, np.ones(40) / 40, "same")       # crude low-pass
    add(sfx, at - 0.2, 0.9 * nse * np.sin(np.pi * y / 0.45) ** 2)


def ding(at, f=880.0):
    m = int(0.9 * SR); y = np.arange(m) / SR
    add(sfx, at, 0.22 * (np.sin(2 * np.pi * f * y) + 0.5 * np.sin(2 * np.pi * f * 2.01 * y)) * np.exp(-y * 5))


for i, tm in enumerate(timings):
    if i: whoosh(tm["start"])
    if tm["id"] in ("y10", "y20"): ding(tm["end"] - 0.5, 880 if tm["id"] == "y10" else 1046.5)
    if tm["id"] == "y30":
        for j, f in enumerate((1046.5, 1318.5, 1568.0)): ding(tm["end"] - 0.7 + j * 0.12, f)

# duck music under voice
env = np.convolve(np.abs(voice), np.ones(4000) / 4000, "same")
duck = 1 - 0.55 * np.clip(env * 8, 0, 1)
mix = voice * 0.95 + music * duck * 0.9 + sfx * 0.6
fade = int(0.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
mix = np.tanh(mix * 1.1)
with wave.open(str(ep / "mix.wav"), "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32000).astype(np.int16).tobytes())
(ep / "timings.json").write_text(json.dumps({"total": round(total, 3), "lines": timings}, ensure_ascii=False, indent=1))
print(json.dumps({"total": total, "lines": [(x["id"], x["start"], x["end"]) for x in timings]}))
