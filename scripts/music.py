"""Sintetiza la banda sonora documental para "Por qué el país más habitable de Sudamérica está casi vacío" (556 s).

Lee automáticamente src/data/vo.json para sincronizar las 5 grandes secciones dramáticas
(Prólogo curioso -> Génesis histórica -> Macrocefalia y tensión -> Invierno demográfico -> Esperanza y Horizonte Siglo XXI)
con los cortes exactos de SCENE_FRAMES en src/utils/timing.ts.

Uso:
    python scripts/music.py          -> public/audio/music.wav
"""

import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "music.wav"
VO_JSON = ROOT / "src" / "data" / "vo.json"

SR = 24000  # 24 kHz estéreo para síntesis rápida y limpia en un documental de 9m16s
DUR = 556.0
N = int(SR * DUR)
BPM = 92
BEAT = 60.0 / BPM
BAR = BEAT * 4.0
rng = np.random.default_rng(42)

# Calcular los inicios de las 15 escenas exactamente igual que src/utils/timing.ts
VO_KEYS = [f"s{i}" for i in range(1, 16)]
GAPS = [0.75, 0.75, 1.35, 0.85, 0.85, 1.35, 0.85, 0.85, 1.35, 0.85, 0.85, 1.35, 0.85, 0.85]
FIRST_VO = 0.55
LEAD = 0.3

with open(VO_JSON, encoding="utf-8") as f:
    vo_data = json.load(f)

vo_start = {}
t_cursor = FIRST_VO
for i, k in enumerate(VO_KEYS):
    vo_start[k] = t_cursor
    t_cursor += vo_data[k]["seconds"] + (GAPS[i] if i < len(GAPS) else 0.0)

S = []
for i, k in enumerate(VO_KEYS):
    S.append(0.0 if i == 0 else round((vo_start[k] - LEAD) * 30) / 30.0)

# Capítulos principales en segundos:
# Cap 0 (Gancho): S[0] .. S[3]
# Cap 1 (Historia / Vacas y Alambramiento): S[3] .. S[6]
# Cap 2 (Macrocefalia / Luz nocturna / Infraestructura): S[6] .. S[9]
# Cap 3 (Escala / Invierno demográfico / Emigración): S[9] .. S[12]
# Conclusión (Acuífero Guaraní / Renovable / Cierre): S[12] .. DUR

CH = {
    "Dm": [50, 53, 57, 62],
    "Bb": [46, 50, 53, 58],
    "F": [53, 57, 60, 65],
    "C": [48, 52, 55, 60],
    "Gm": [43, 50, 55, 58],
    "Am": [45, 52, 57, 60],
    "Fadd9": [53, 57, 60, 67],
}
ROOT_NOTE = {"Dm": 38, "Bb": 34, "F": 41, "C": 36, "Gm": 31, "Am": 33, "Fadd9": 41}

PROG_HOOK = ["Dm", "Bb", "F", "C"]
PROG_HISTORY = ["F", "C", "Dm", "Bb"]
PROG_URBAN = ["Dm", "Gm", "Bb", "C"]
PROG_WINTER = ["Dm", "Am", "Bb", "Gm"]
PROG_FUTURE = ["F", "Bb", "Dm", "C"]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def stereo(x, p=0.0):
    return np.stack([x * np.cos((p + 1) * np.pi / 4), x * np.sin((p + 1) * np.pi / 4)], axis=1)


def place(bus, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(bus) or i < 0:
        return
    if sig.ndim == 1:
        sig = stereo(sig)
    j = min(i + len(sig), len(bus))
    bus[i:j] += sig[: j - i] * gain


def lp(x, fc, order=2):
    return sosfilt(butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos"), x, axis=0)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x, axis=0)


def env(d, a, r):
    t = tt(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)


def saw(f, d):
    t = tt(d)
    p = (rng.random() + t * f) % 1.0
    return 2 * p - 1


def ir(length, decay, damp=5500):
    t = tt(length)
    h = rng.standard_normal((len(t), 2)) * np.exp(-t / decay)[:, None]
    h = lp(h, damp)
    h[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return h / np.sqrt(np.sum(h**2))


def verb(x, h):
    return np.stack([fftconvolve(x[:, c], h[:, c])[: len(x)] for c in range(2)], axis=1)


# Cache de timbres para acelerar la síntesis de 556s
PAD_CACHE = {}
MARIMBA_CACHE = {}
PLUCK_CACHE = {}
BELL_CACHE = {}
BASS_CACHE = {}


def get_pad(name, cutoff):
    key = (name, cutoff)
    if key not in PAD_CACHE:
        chord = CH[name]
        d = BAR + 0.6
        out = np.zeros((int(d * SR), 2), dtype=np.float32)
        for i, m in enumerate(chord):
            for v in (-0.07, 0.07):
                out += stereo(saw(hz(m + v), d), -0.55 + 1.1 * i / max(1, len(chord) - 1))
        PAD_CACHE[key] = (lp(out / (2 * len(chord)), cutoff) * env(d, 0.6, 0.85)[:, None]).astype(np.float32)
    return PAD_CACHE[key]


def get_marimba(m):
    if m not in MARIMBA_CACHE:
        d = 0.85
        t = tt(d)
        f = hz(m)
        y = (
            np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35)
            + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.06)
        )
        MARIMBA_CACHE[m] = (y * (1 - np.exp(-t / 0.002)) * 0.36).astype(np.float32)
    return MARIMBA_CACHE[m]


def get_pluck(m):
    if m not in PLUCK_CACHE:
        d = 0.45
        t = tt(d)
        f = hz(m)
        y = sum(np.sin(2 * np.pi * f * k * t) / k * np.exp(-t * (6 + 3.5 * k)) for k in range(1, 6))
        PLUCK_CACHE[m] = (y * (1 - np.exp(-t / 0.002)) * 0.3).astype(np.float32)
    return PLUCK_CACHE[m]


def get_bell(m):
    if m not in BELL_CACHE:
        d = 2.0
        t = tt(d)
        f = hz(m)
        y = np.sin(2 * np.pi * f * t + 1.4 * np.exp(-t / 0.5) * np.sin(2 * np.pi * f * 3.5 * t))
        BELL_CACHE[m] = (y * np.exp(-t / 0.8) * (1 - np.exp(-t / 0.002)) * 0.25).astype(np.float32)
    return BELL_CACHE[m]


def get_bass(m):
    if m not in BASS_CACHE:
        d = BEAT * 0.65
        t = tt(d)
        f = hz(m)
        y = np.sin(2 * np.pi * f * t) + 0.22 * np.sin(2 * np.pi * f * 2 * t)
        BASS_CACHE[m] = stereo((np.tanh(y * 1.25) * env(d, 0.012, 0.14) * 0.46).astype(np.float32))
    return BASS_CACHE[m]


KICK_SIG = stereo(
    (
        np.tanh(
            np.sin(2 * np.pi * np.cumsum(46 + 95 * np.exp(-tt(0.38) / 0.03)) / SR)
            * np.exp(-tt(0.38) / 0.19)
            * 1.4
        )
        * 0.72
    ).astype(np.float32)
)

SHAKER_L = stereo((hp(rng.standard_normal(int(0.08 * SR)), 5500, 3) * np.exp(-tt(0.08) / 0.024) * 0.26).astype(np.float32), -0.25)
SHAKER_R = stereo((hp(rng.standard_normal(int(0.08 * SR)), 5500, 3) * np.exp(-tt(0.08) / 0.024) * 0.26).astype(np.float32), 0.25)

HIT_SIG = stereo(
    (
        np.tanh(
            (
                np.sin(2 * np.pi * np.cumsum(38 + 65 * np.exp(-tt(2.2) / 0.08)) / SR) * np.exp(-tt(2.2) / 0.65)
                + lp(rng.standard_normal(int(2.2 * SR)), 2200) * np.exp(-tt(2.2) / 0.14) * 0.25
            )
            * 1.2
        )
        * 0.65
    ).astype(np.float32)
)

drums = np.zeros((N, 2), dtype=np.float32)
low = np.zeros((N, 2), dtype=np.float32)
pads = np.zeros((N, 2), dtype=np.float32)
leads = np.zeros((N, 2), dtype=np.float32)
fx = np.zeros((N, 2), dtype=np.float32)


def chord_at(t, prog, start):
    return prog[int((t - start) // BAR) % len(prog)]


def render_chapter(start, end, prog, cutoff, pad_gain, arp_step, arp_pat, arp_gain, kick_gain, bass_gain, use_pluck=False):
    # Pads armónicos
    t0 = start
    while t0 < end - 0.1:
        name = chord_at(t0, prog, start)
        place(pads, get_pad(name, cutoff), t0, pad_gain)
        t0 += BAR

    # Pulso de arpegio estilo Johnny Harris / RealLifeLore
    k = 0
    for t0 in np.arange(start, end - 0.05, arp_step):
        name = chord_at(t0, prog, start)
        n = CH[name][arp_pat[k % len(arp_pat)] % 4] + 12
        sig = get_pluck(n) if use_pluck else get_marimba(n)
        place(leads, stereo(sig, (-0.32, 0.32)[k % 2]), t0, arp_gain)
        k += 1

    # Bajo y pulso rítmico documental
    for t0 in np.arange(start, end - 0.05, BEAT):
        b_idx = int(round((t0 - start) / BEAT))
        name = chord_at(t0, prog, start)
        if b_idx % 2 == 0 and bass_gain > 0:
            place(low, get_bass(ROOT_NOTE[name]), t0, bass_gain)
        if b_idx % 2 == 0 and kick_gain > 0:
            place(drums, KICK_SIG, t0, kick_gain)
        if kick_gain > 0.1:
            place(drums, SHAKER_L if b_idx % 2 == 0 else SHAKER_R, t0 + BEAT * 0.5, kick_gain * 0.55)


# 1. CAPÍTULO 0 — El Gancho (Intrigante y analítico)
render_chapter(S[0], S[3], PROG_HOOK, 1250, 0.72, BEAT / 2, [0, 2, 3, 1, 2, 3, 1, 2], 0.34, 0.38, 0.48, use_pluck=False)

# 2. CAPÍTULO 1 — Cuando las vacas llegaron antes que las personas (Pulso histórico en movimiento)
render_chapter(S[3], S[6], PROG_HISTORY, 1550, 0.70, BEAT / 2, [0, 1, 2, 3, 2, 1, 3, 2], 0.36, 0.52, 0.55, use_pluck=False)

# 3. CAPÍTULO 2 — El Enano Gigante: Montevideo vs El Interior (Contraste espacial y tensión nocturna)
render_chapter(S[6], S[9], PROG_URBAN, 1150, 0.78, BEAT, [0, 3, 1, 2], 0.32, 0.45, 0.52, use_pluck=True)

# 4. CAPÍTULO 3 — El precio de ser pocos e Invierno Demográfico (Sobrio, reflexivo, menor)
render_chapter(S[9], S[12], PROG_WINTER, 1050, 0.80, BEAT / 2, [0, 2, 1, 3, 0, 3, 1, 2], 0.30, 0.42, 0.50, use_pluck=True)

# 5. CONCLUSIÓN — Acuífero Guaraní y Refugio del Siglo XXI (Luminoso, esperanzador y amplio)
render_chapter(S[12], S[14], PROG_FUTURE, 1850, 0.76, BEAT / 2, [0, 1, 2, 3, 1, 2, 3, 0], 0.38, 0.55, 0.56, use_pluck=False)
render_chapter(S[14], DUR - 4.0, ["Fadd9", "Bb", "F", "C"], 2100, 0.82, BEAT / 2, [0, 2, 3, 1, 2, 3], 0.32, 0.30, 0.45, use_pluck=False)

# Golpes cinematográficos suaves y campanas sutiles en cada cambio de escena
for idx, sc_time in enumerate(S):
    place(fx, HIT_SIG, sc_time, 0.45 if idx in (0, 3, 6, 9, 12, 14) else 0.25)
    if idx in (0, 3, 6, 9, 12, 14):
        for k, note in enumerate([74, 77, 81, 86]):
            place(leads, stereo(get_bell(note), -0.4 + 0.25 * k), sc_time + 0.06 * k, 0.22)

# Reverberación y mezcla final
wet = verb(pads * 0.28 + leads * 0.4 + fx * 0.25, ir(2.1, 0.65)) * 0.75
mix = drums * 0.65 + low * 0.85 + pads * 0.88 + leads * 0.82 + fx * 0.65 + wet
mix = hp(mix, 28)

tf = np.arange(N) / SR
fade_out = (np.clip((DUR - tf) / 2.5, 0, 1) ** 1.5)[:, None]
mix *= fade_out
mix = np.tanh(mix * 1.05)
mix *= 0.88 / max(1e-6, float(np.max(np.abs(mix))))

OUT.parent.mkdir(parents=True, exist_ok=True)
sf.write(OUT, mix.astype(np.float32), SR, subtype="PCM_16")
print(f"music: {OUT} ({DUR:.1f}s, {SR}Hz)")
