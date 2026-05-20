"""
Génère les SFX pour GeoEspaceTerminal.
- sfx_chalk.mp3      : son de craie sur tableau (découverte d'une formule)
- sfx_ding.mp3       : ding de découverte / bonne réponse
- sfx_whoosh3d.mp3   : whoosh pour rotation 3D
- sfx_applause.mp3   : applaudissements courts pour l'outro
"""

import os
import numpy as np
import soundfile as sf

OUT = "motion-design-app/public/audio"
os.makedirs(OUT, exist_ok=True)

SR = 44100


def write_mp3(name, arr, sr=SR):
    wav = os.path.join(OUT, name.replace(".mp3", ".wav"))
    sf.write(wav, arr.astype(np.float32), sr)
    os.system(f'ffmpeg -y -i "{wav}" -b:a 192k "{os.path.join(OUT, name)}"')
    os.remove(wav)
    print(f"[OK] {name}")


# ── CHALK SCRATCH ──────────────────────────────────────────────────────────────
def make_chalk(duration=0.55):
    n = int(SR * duration)
    t = np.linspace(0, duration, n)
    noise = np.random.randn(n) * 0.3
    # bandpass-like: mix of high freq components
    hf = np.sin(2 * np.pi * 4200 * t) * 0.15 + np.sin(2 * np.pi * 3100 * t) * 0.1
    scratch = (noise + hf) * np.exp(-t * 4.5)
    # Add small rhythmic variations (pen pressure)
    rhythm = 1 + 0.4 * np.sin(2 * np.pi * 14 * t)
    scratch *= rhythm * 0.6
    return scratch


write_mp3("sfx_chalk.mp3", make_chalk())


# ── DING (discovery) ───────────────────────────────────────────────────────────
def make_ding(duration=0.9):
    n = int(SR * duration)
    t = np.linspace(0, duration, n)
    # Bell-like: fundamental + overtones
    sig = (
        0.5  * np.sin(2 * np.pi * 880  * t) * np.exp(-t * 3.5) +
        0.25 * np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 5.0) +
        0.12 * np.sin(2 * np.pi * 2640 * t) * np.exp(-t * 7.0)
    )
    return sig * 0.7


write_mp3("sfx_ding.mp3", make_ding())


# ── WHOOSH 3D ──────────────────────────────────────────────────────────────────
def make_whoosh(duration=0.5):
    n = int(SR * duration)
    t = np.linspace(0, duration, n)
    # Frequency sweep: 200 → 800 Hz
    freq = 200 + 600 * (t / duration) ** 2
    phase = 2 * np.pi * np.cumsum(freq) / SR
    sig = np.sin(phase) * 0.4
    # envelope: fade in + fast fade out
    env = np.sin(np.pi * t / duration) * np.exp(-t * 2)
    noise = np.random.randn(n) * 0.05
    return (sig * env + noise) * 0.65


write_mp3("sfx_whoosh3d.mp3", make_whoosh())


# ── SHORT APPLAUSE ─────────────────────────────────────────────────────────────
def make_applause(duration=1.8):
    n = int(SR * duration)
    t = np.linspace(0, duration, n)
    # Random bursts simulating clapping
    np.random.seed(42)
    noise = np.random.randn(n)
    # Multiple clap bursts
    env = np.zeros(n)
    for clap_t in np.linspace(0.05, duration - 0.2, 18):
        idx = int(clap_t * SR)
        width = int(0.04 * SR)
        end = min(idx + width, n)
        burst = np.exp(-np.linspace(0, 6, end - idx))
        env[idx:end] += burst
    # Overall envelope: crescendo then decrescendo
    master = np.sin(np.pi * t / duration) ** 0.5
    sig = noise * env * master * 0.5
    return sig


write_mp3("sfx_applause.mp3", make_applause())

print("Tous les SFX générés dans", OUT)
