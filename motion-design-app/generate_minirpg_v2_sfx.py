#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère les effets sonores synthétiques pour MiniRpgCodeurV2."""

import os
import numpy as np
import soundfile as sf

ROOT       = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(ROOT, "public", "audio")
SR         = 44100


def envelope(t, attack=0.005, decay=0.1, sustain=0.6, release=0.2, total=1.0):
    env = np.ones(len(t))
    a = int(attack * SR); d = int(decay * SR); r = int(release * SR)
    for i in range(len(t)):
        if   i < a:               env[i] = i / max(a, 1)
        elif i < a + d:           env[i] = 1.0 - (1.0 - sustain) * (i - a) / max(d, 1)
        elif i >= len(t) - r:     env[i] = sustain * (len(t) - i) / max(r, 1)
        else:                     env[i] = sustain
    return env


def save(sig, name):
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * 0.85
    path_wav = os.path.join(OUTPUT_DIR, name.replace(".mp3", ".wav"))
    path_mp3 = os.path.join(OUTPUT_DIR, name)
    sf.write(path_wav, sig.astype(np.float32), SR)
    ok = False
    try:
        from pydub import AudioSegment
        AudioSegment.from_wav(path_wav).export(path_mp3, format="mp3", bitrate="192k")
        ok = True
    except Exception:
        pass
    if not ok:
        ok = os.system(f'ffmpeg -y -i "{path_wav}" -codec:a libmp3lame -qscale:a 2 "{path_mp3}" -loglevel quiet') == 0
    if ok and os.path.exists(path_mp3):
        os.remove(path_wav)
        print(f"  {name}  {os.path.getsize(path_mp3)//1024} KB")
    else:
        print(f"  {name.replace('.mp3','.wav')}  (WAV kept)")


# ── SWORD ATTACK ──────────────────────────────────────────────────────────────
def make_attack():
    dur = 0.35
    t   = np.linspace(0, dur, int(SR * dur))
    # Metallic ping: two close tones + noise burst
    tone = (0.5 * np.sin(2*np.pi*880*t) +
            0.3 * np.sin(2*np.pi*1100*t) +
            0.2 * np.sin(2*np.pi*1320*t))
    noise  = np.random.randn(len(t)) * 0.3
    env    = np.exp(-t * 22)
    impact = np.exp(-t * 80) * 0.6          # sharp transient
    sig    = (tone + noise) * env + impact
    return sig


# ── MONSTER HIT (dragon growl) ────────────────────────────────────────────────
def make_monster():
    dur = 0.5
    t   = np.linspace(0, dur, int(SR * dur))
    # Descending low rumble
    freq = 90 + np.exp(-t * 14) * 80
    phase = np.cumsum(2 * np.pi * freq / SR)
    sig  = np.sin(phase)
    sig += 0.4 * np.sin(phase * 1.5)
    sig += 0.2 * np.sin(phase * 2.3)
    noise = np.random.randn(len(t)) * 0.15
    env   = np.exp(-t * 10)
    sig   = (sig + noise) * env
    sig   = np.tanh(sig * 1.8) * 0.7       # soft distortion = growl
    return sig


# ── HEAL CHIME ────────────────────────────────────────────────────────────────
def make_heal():
    dur   = 0.7
    t     = np.linspace(0, dur, int(SR * dur))
    notes = [523, 659, 784, 1047]           # C5-E5-G5-C6
    sig   = np.zeros(len(t))
    for i, f in enumerate(notes):
        delay   = i * 0.07
        local_t = np.maximum(0, t - delay)
        env     = np.minimum(1, local_t * 50) * np.exp(-local_t * 4)
        sig    += 0.28 * np.sin(2*np.pi*f*t) * env
    return sig


# ── MAGIC SPELL ───────────────────────────────────────────────────────────────
def make_magic():
    dur = 0.9
    t   = np.linspace(0, dur, int(SR * dur))
    # Upward frequency sweep with shimmer
    f   = 300 + 1100 * (t / dur) ** 0.7
    phase = np.cumsum(2 * np.pi * f / SR)
    sig   = np.sin(phase)
    sig  += 0.35 * np.sin(phase * 2)
    sig  += 0.15 * np.sin(phase * 3)
    # Sparkle: high freq noise modulated
    sparkle = np.random.randn(len(t)) * 0.12 * np.sin(2*np.pi*8*t)
    sig     = sig + sparkle
    env     = np.minimum(t * 8, 1) * np.minimum((dur - t) * 6, 1)
    return sig * env


# ── VICTORY FANFARE ───────────────────────────────────────────────────────────
def make_victory():
    dur   = 1.5
    t_all = np.linspace(0, dur, int(SR * dur))
    # Ascending C major arpeggio + chord
    notes = [523, 659, 784, 1047, 1319, 1568]  # C5 E5 G5 C6 E6 G6
    sig   = np.zeros(len(t_all))
    note_dur = 0.22
    for i, f in enumerate(notes):
        start   = i * 0.14
        local_t = np.maximum(0, t_all - start)
        env     = np.minimum(local_t * 40, 1) * np.exp(-local_t * 4)
        sig    += 0.35 * np.sin(2*np.pi*f*t_all) * env
        sig    += 0.15 * np.sin(4*np.pi*f*t_all) * env  # octave shimmer
    # Fade out end
    fade_frames = int(0.4 * SR)
    sig[-fade_frames:] *= np.linspace(1, 0, fade_frames)
    return sig


# ── KEYBOARD CLICK (single key, short) ───────────────────────────────────────
def make_key():
    dur = 0.06
    t   = np.linspace(0, dur, int(SR * dur))
    noise = np.random.randn(len(t))
    env   = np.exp(-t * 120)
    # Slight tonal content
    tone  = 0.3 * np.sin(2*np.pi*1400*t)
    return (noise * 0.7 + tone) * env


if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating RPG sound effects…")
    save(make_attack(),  "sfx_attack.mp3")
    save(make_monster(), "sfx_monster.mp3")
    save(make_heal(),    "sfx_heal.mp3")
    save(make_magic(),   "sfx_magic.mp3")
    save(make_victory(), "sfx_victory.mp3")
    print("Done.")
