#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génération complète audio + rendu Remotion :
  - Narrations  : Kokoro ff_siwis (voix française suisse)
  - Musiques    : synthèse numpy/scipy — 100 % libre de droit
  - Bruitages   : synthèse numpy/scipy — 100 % libre de droit
  - Rendu vidéo : npx remotion render DevStory --concurrency 12

Dépendances :
    pip install kokoro soundfile numpy scipy pydub
"""

import os, sys, io, time, math
import numpy as np
import soundfile as sf
import multiprocessing as mp

try:
    from scipy import signal as _sig
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

# ─────────────────────────── chemins ──────────────────────────────────────────
ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT = os.path.join(ROOT, "public", "audio")

# ─────────────────────────── constantes ───────────────────────────────────────
RATE = 44100          # Hz pour musique / SFX
NAR_RATE = 24000      # Hz pour Kokoro
SCENE_DUR = 50.0      # 1200 frames ÷ 24 fps = 50 s
VOICE = "ff_siwis"
SPEED = 0.92
NUM_CORES = 12

# ─────────────────────────── textes narration ─────────────────────────────────
SCENES_TEXT = {
    1: ["Il s'appelle Lucas. 18 ans.",
        "Chaque nuit, il rêve du même rêve...",
        "Devenir un grand développeur."],
    2: ["Le lendemain matin... 7 heures.",
        "Lucas ouvre son premier IDE, les mains tremblantes.",
        "Une erreur. Puis une autre. Mais il ne lâche pas.",
        "Et puis... son premier programme fonctionne !"],
    3: ["Le terminal. Son nouveau terrain de jeu.",
        "Il tape son programme, caractère par caractère...",
        "HELLO WORLD ! Ca fonctionne ! Pour de vrai !",
        "Ce jour-là, il devient développeur."],
    4: ["Les semaines passent. Les bugs s'accumulent.",
        "Chaque ligne de code cache un nouveau piège...",
        "Il veut abandonner. Mais quelque chose le retient.",
        "Non. Il recommence. Plus fort. Plus déterminé."],
    5: ["22 heures. Lucas commence son grand projet.",
        "Minuit. La ville dort. Lui, il code.",
        "3 heures du matin. Le café est froid. Le code avance.",
        "Une ligne à la fois, son rêve prend forme."],
    6: ["Six mois plus tard...",
        "L'application est en ligne. Les utilisateurs arrivent.",
        "Une première offre d'emploi. Puis une deuxième.",
        "Lucas est maintenant développeur senior. Son rêve est réel."],
}

# ══════════════════════════ UTILITAIRES SYNTH ═════════════════════════════════

def _n(dur, rate=RATE):
    return int(dur * rate)

def _t(dur, rate=RATE):
    return np.linspace(0, dur, _n(dur, rate), endpoint=False)

def sine(freq, dur, rate=RATE, amp=1.0, phase=0.0):
    return amp * np.sin(2 * np.pi * freq * _t(dur, rate) + phase)

def noise(dur, rate=RATE):
    return np.random.default_rng().uniform(-1, 1, _n(dur, rate))

def fade(arr, samps):
    r = arr.copy()
    s = min(samps, len(r) // 2)
    r[:s] *= np.linspace(0, 1, s)
    r[-s:] *= np.linspace(1, 0, s)
    return r

def adsr(arr, a, d, s_level, r, rate=RATE):
    n = len(arr)
    ai, di, ri = _n(a, rate), _n(d, rate), _n(r, rate)
    si = max(0, n - ai - di - ri)
    env = np.concatenate([
        np.linspace(0, 1, ai),
        np.linspace(1, s_level, di),
        np.full(si, s_level),
        np.linspace(s_level, 0, ri),
    ])[:n]
    return arr * env

def lpf(arr, cutoff, rate=RATE):
    if not HAS_SCIPY:
        return arr
    b, a = _sig.butter(2, cutoff / (rate / 2), btype='low')
    return _sig.filtfilt(b, a, arr)

def hpf(arr, cutoff, rate=RATE):
    if not HAS_SCIPY:
        return arr
    b, a = _sig.butter(2, cutoff / (rate / 2), btype='high')
    return _sig.filtfilt(b, a, arr)

def bpf(arr, lo, hi, rate=RATE):
    if not HAS_SCIPY:
        return arr
    b, a = _sig.butter(2, [lo / (rate / 2), hi / (rate / 2)], btype='band')
    return _sig.filtfilt(b, a, arr)

def reverb(arr, decay=0.35, delay_ms=100, rate=RATE):
    d = int(delay_ms * rate / 1000)
    out = arr.copy()
    for i in range(1, 5):
        g = decay ** i
        pad = np.zeros(d * i)
        delayed = np.concatenate([pad, arr])[:len(arr)]
        out = out + delayed * g
    pk = np.max(np.abs(out))
    return out / pk if pk > 0 else out

def norm(arr, target=0.85):
    pk = np.max(np.abs(arr))
    return arr / pk * target if pk > 1e-9 else arr

def chord(freqs, dur, amp=0.35, wave='sine', rate=RATE):
    t = _t(dur, rate)
    out = np.zeros(len(t))
    for f in freqs:
        if wave == 'sine':
            out += np.sin(2 * np.pi * f * t)
        elif wave == 'saw':
            out += (2 * ((f * t) % 1) - 1) * 0.45
        elif wave == 'sq':
            out += np.sign(np.sin(2 * np.pi * f * t)) * 0.3
    return out / len(freqs) * amp

def kick(freq=60, dur=0.25, amp=0.65, rate=RATE):
    t = _t(dur, rate)
    env = np.exp(-t * 25)
    pitch_env = np.exp(-t * 30)
    return amp * np.sin(2 * np.pi * (freq + freq * 2 * pitch_env) * t) * env

def hat(dur=0.04, amp=0.08, rate=RATE):
    n = _noise(dur, rate) if False else noise(dur, rate)
    n = hpf(n, 7000, rate)
    return fade(n * amp, len(n) // 3)

def snare(dur=0.1, amp=0.18, rate=RATE):
    n = noise(dur, rate)
    n = bpf(n, 200, 5000, rate)
    t = _t(dur, rate)
    body = 0.4 * np.sin(2 * np.pi * 200 * t) * np.exp(-t * 40)
    return fade((n + body) * amp, len(n) // 4)

def mix(*arrays):
    n = max(len(a) for a in arrays)
    out = np.zeros(n)
    for a in arrays:
        out[:len(a)] += a
    return out

def _add(buf, arr, start_s, rate=RATE):
    s = int(start_s * rate)
    e = s + len(arr)
    if e <= len(buf):
        buf[s:e] += arr

def _save_mp3(name, arr, rate=RATE):
    arr = np.clip(arr, -1, 1).astype(np.float32)
    wav = os.path.join(OUTPUT, name.replace('.mp3', '.wav'))
    mp3 = os.path.join(OUTPUT, name)
    sf.write(wav, arr, rate)
    ok = False
    try:
        from pydub import AudioSegment
        AudioSegment.from_wav(wav).export(mp3, format='mp3', bitrate='192k')
        ok = True
    except Exception:
        ret = os.system(f'ffmpeg -y -i "{wav}" -codec:a libmp3lame -qscale:a 2 "{mp3}" -loglevel quiet')
        ok = (ret == 0)
    if ok and os.path.exists(wav):
        os.remove(wav)
    return mp3

# ══════════════════════════ MUSIQUES (libres de droit) ════════════════════════
# Toutes les musiques sont générées par synthèse mathématique pure.
# Aucun sample, aucun contenu tiers : 100 % libre de droit.

def _music1():
    """Scène 1 – Rêve spatial · ambient mystérieux · Cm · 60 BPM"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    # Pad harmonique (Cm add9 : C Eb G Bb D)
    pads = [(130.81, 155.56, 196.00, 233.08, 146.83),
            (116.54, 138.59, 174.61, 207.65, 130.81),
            (146.83, 174.61, 220.00, 261.63, 164.81),
            (130.81, 155.56, 196.00, 233.08, 110.00)]
    seg_dur = SCENE_DUR / len(pads)
    for i, p in enumerate(pads):
        c = chord(p, seg_dur, amp=0.3, wave='sine')
        c = fade(c, _n(2.5))
        _add(buf, c, i * seg_dur)
    # Basse pulsante lente
    for i in range(int(SCENE_DUR / 2)):
        b = sine(65.41, 0.9, amp=0.18)
        b = adsr(b, 0.05, 0.3, 0.5, 0.4)
        _add(buf, b, i * 2.0)
    # Mélodie céleste (triangle approché : sine fondamental + harmoniques décroissantes)
    mel = [392.00, 349.23, 329.63, 293.66, 329.63, 349.23, 392.00, 440.00]
    for i, f in enumerate(mel):
        tone = sine(f, 2.2, amp=0.18) + sine(f*2, 2.2, amp=0.06) + sine(f*3, 2.2, amp=0.02)
        tone = adsr(tone, 0.2, 0.4, 0.55, 0.8)
        _add(buf, tone, i * (SCENE_DUR / len(mel)))
    # Arpège doux
    arp = [196.00, 233.08, 261.63, 293.66]
    for i in range(int(SCENE_DUR / 0.5)):
        note = arp[i % len(arp)]
        a = sine(note, 0.4, amp=0.10)
        a = adsr(a, 0.02, 0.1, 0.6, 0.2)
        _add(buf, a, i * 0.5)
    buf = reverb(buf, decay=0.45, delay_ms=140)
    return 'music1.mp3', norm(fade(buf, _n(4)))

def _music2():
    """Scène 2 – Réveil matinal · pop énergique · C major · 100 BPM"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    bpm = 100
    beat = 60 / bpm       # 0.6 s
    # Accords (I V vi IV en C : C G Am F)
    prog = [
        (261.63, 329.63, 392.00, 523.25),   # C
        (392.00, 493.88, 587.33, 783.99),   # G
        (440.00, 523.25, 659.25, 880.00),   # Am
        (349.23, 440.00, 523.25, 698.46),   # F
    ]
    chord_dur = SCENE_DUR / len(prog)
    for i, p in enumerate(prog):
        c = chord(p, chord_dur, amp=0.32, wave='sine')
        c = adsr(c, 0.02, 0.1, 0.75, 0.5)
        _add(buf, c, i * chord_dur)
    # Kick 4/4
    for i in range(int(SCENE_DUR / beat)):
        _add(buf, kick(65, 0.28, amp=0.55), i * beat)
    # Snare sur 2 et 4
    for i in range(int(SCENE_DUR / beat)):
        if i % 2 == 1:
            _add(buf, snare(0.12, amp=0.22), i * beat)
    # Hi-hat 8ths
    for i in range(int(SCENE_DUR / (beat / 2))):
        _add(buf, hat(0.04, amp=0.07), i * beat / 2)
    # Basse
    bass_notes = [130.81, 196.00, 220.00, 174.61]
    for i in range(int(SCENE_DUR / chord_dur)):
        b = sine(bass_notes[i % len(bass_notes)], chord_dur, amp=0.28)
        b = adsr(b, 0.01, 0.05, 0.7, 0.2)
        _add(buf, b, i * chord_dur)
    # Mélodie joyeuse (C pentatonique)
    mel = [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33,
           523.25, 659.25, 587.33, 523.25, 440.00, 523.25]
    note_dur = beat
    for i, f in enumerate(mel):
        tone = sine(f, note_dur * 0.8, amp=0.22)
        tone = adsr(tone, 0.01, 0.05, 0.8, 0.15)
        _add(buf, tone, i * note_dur)
    return 'music2.mp3', norm(fade(buf, _n(3)))

def _music3():
    """Scène 3 – Hello World · triomphe électronique · C major · 120 BPM"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    bpm = 120
    beat = 60 / bpm       # 0.5 s
    # Fanfare ascendante (premier 3 secondes)
    fanfare = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]
    for i, f in enumerate(fanfare):
        tone = (sine(f, 0.45, amp=0.40)
                + sine(f * 2, 0.45, amp=0.15)
                + sine(f * 3, 0.45, amp=0.06))
        tone = adsr(tone, 0.01, 0.05, 0.9, 0.15)
        _add(buf, tone, i * 0.38)
    # Corps principal : accords C Dm F G
    prog = [
        (261.63, 329.63, 392.00),  # C
        (293.66, 349.23, 440.00),  # Dm
        (349.23, 440.00, 523.25),  # F
        (392.00, 493.88, 587.33),  # G
    ]
    chord_dur = 8 * beat
    for repeat in range(int(SCENE_DUR / (chord_dur * len(prog))) + 1):
        for i, p in enumerate(prog):
            t0 = 3.0 + (repeat * len(prog) + i) * chord_dur
            if t0 >= SCENE_DUR:
                break
            c = chord(p, min(chord_dur, SCENE_DUR - t0), amp=0.28, wave='sine')
            c = adsr(c, 0.02, 0.08, 0.8, 0.4)
            _add(buf, c, t0)
    # Kick
    for i in range(int(SCENE_DUR / beat)):
        _add(buf, kick(70, 0.22, amp=0.60), i * beat)
    # Snare 2+4
    for i in range(int(SCENE_DUR / beat)):
        if i % 2 == 1:
            _add(buf, snare(0.10, amp=0.25), i * beat)
    # Basse pulsante
    for i in range(int(SCENE_DUR / beat)):
        f = [130.81, 130.81, 146.83, 164.81][i % 4]
        b = sine(f, beat * 0.7, amp=0.32)
        b = adsr(b, 0.01, 0.04, 0.7, 0.1)
        _add(buf, b, i * beat)
    # Arpège brillant
    arp = [523.25, 659.25, 783.99, 880.00]
    for i in range(int(SCENE_DUR / (beat / 2))):
        a = sine(arp[i % len(arp)], beat / 2 * 0.6, amp=0.14)
        a = adsr(a, 0.005, 0.02, 0.7, 0.1)
        _add(buf, a, i * beat / 2)
    buf = reverb(buf, decay=0.20, delay_ms=80)
    return 'music3.mp3', norm(fade(buf, _n(3)))

def _music4():
    """Scène 4 – Bugs · tension anxieuse · Cm · 80 BPM"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    bpm = 80
    beat = 60 / bpm
    # Accord mineur tendu (Cm7b5 : C Eb Gb Bb)
    tense_pads = [
        (130.81, 155.56, 184.99, 233.08),  # Cm7b5
        (116.54, 138.59, 164.81, 207.65),  # Bbm7b5
        (123.47, 146.83, 174.61, 220.00),  # Bm7b5
        (130.81, 155.56, 184.99, 233.08),  # retour
    ]
    seg = SCENE_DUR / len(tense_pads)
    for i, p in enumerate(tense_pads):
        c = chord(p, seg, amp=0.22, wave='saw')
        c = adsr(c, 0.5, 1.0, 0.7, 2.0)
        _add(buf, c, i * seg)
    # Basse inquiète (pattern descendant)
    bass_p = [130.81, 123.47, 116.54, 110.00]
    for i in range(int(SCENE_DUR / beat)):
        f = bass_p[i % len(bass_p)]
        b = sine(f, beat * 0.8, amp=0.25)
        b += sine(f * 1.005, beat * 0.8, amp=0.08)  # légère dissonance battements
        b = adsr(b, 0.02, 0.1, 0.6, 0.2)
        _add(buf, b, i * beat)
    # Kick sourd
    for i in range(int(SCENE_DUR / beat)):
        _add(buf, kick(50, 0.35, amp=0.45), i * beat)
    # Snare off-beat décalé (crée tension)
    for i in range(int(SCENE_DUR / beat)):
        if i % 4 == 2:
            _add(buf, snare(0.15, amp=0.20), i * beat + beat * 0.1)
    # Mélodie chromatique angoissée
    chroma = [220.00, 207.65, 196.00, 185.00, 174.61, 185.00, 196.00, 207.65]
    mel_dur = SCENE_DUR / len(chroma)
    for i, f in enumerate(chroma):
        tone = sine(f, mel_dur * 0.85, amp=0.18)
        tone += sine(f * 1.007, mel_dur * 0.85, amp=0.08)  # battements anxieux
        tone = adsr(tone, 0.1, 0.3, 0.5, 0.8)
        _add(buf, tone, i * mel_dur)
    # Glitch : bruits parasites sporadiques
    rng = np.random.default_rng(99)
    for _ in range(12):
        t_s = rng.uniform(2, SCENE_DUR - 0.5)
        g = noise(rng.uniform(0.05, 0.15)) * 0.12
        g = hpf(g, 3000)
        g = fade(g, len(g) // 3)
        _add(buf, g, t_s)
    buf = reverb(buf, decay=0.55, delay_ms=160)
    return 'music4.mp3', norm(fade(buf, _n(4)))

def _music5():
    """Scène 5 – Nuit de code · lo-fi hip-hop · Cm jazz · 75 BPM"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    bpm = 75
    beat = 60 / bpm
    # Accords jazz (Cm9 Fm9 Bb7 Ebmaj7)
    jazz = [
        (130.81, 155.56, 196.00, 246.94, 293.66),  # Cm9
        (174.61, 207.65, 261.63, 329.63, 392.00),  # Fm9
        (233.08, 293.66, 349.23, 440.00, 523.25),  # Bb7
        (155.56, 196.00, 246.94, 311.13, 392.00),  # Ebmaj7
    ]
    chord_dur = beat * 4
    for repeat in range(int(SCENE_DUR / (chord_dur * len(jazz))) + 1):
        for i, p in enumerate(jazz):
            t0 = (repeat * len(jazz) + i) * chord_dur
            if t0 >= SCENE_DUR:
                break
            dur = min(chord_dur, SCENE_DUR - t0)
            c = chord(p, dur, amp=0.25, wave='sine')
            c = adsr(c, 0.05, 0.15, 0.7, 0.5)
            _add(buf, c, t0)
    # Kick lo-fi (légèrement en retard = "swing")
    for i in range(int(SCENE_DUR / (beat * 2))):
        _add(buf, kick(55, 0.28, amp=0.42), i * beat * 2)
    # Snare sur le 3 (lo-fi)
    for i in range(int(SCENE_DUR / (beat * 2))):
        _add(buf, snare(0.12, amp=0.18), i * beat * 2 + beat * 1.0)
    # Hi-hat swingué (shuffle)
    for i in range(int(SCENE_DUR / beat)):
        offset = 0.0 if i % 2 == 0 else beat * 0.1
        _add(buf, hat(0.035, amp=0.06), i * beat + offset)
    # Basse mélodique
    bass_m = [130.81, 116.54, 138.59, 155.56]
    for i in range(int(SCENE_DUR / chord_dur)):
        f = bass_m[i % len(bass_m)]
        b = sine(f, chord_dur * 0.9, amp=0.30)
        b = adsr(b, 0.01, 0.08, 0.65, 0.3)
        _add(buf, b, i * chord_dur)
    # Piano électrique (Rhodes simulé : sine + harmoniques + déclin rapide)
    rhodes_mel = [392.00, 349.23, 329.63, 293.66, 261.63, 220.00, 196.00, 220.00]
    note_dur = beat * 2
    for i, f in enumerate(rhodes_mel):
        tone = sine(f, note_dur, amp=0.18) + sine(f*2, note_dur, amp=0.06) + sine(f*4, note_dur, amp=0.02)
        tone = adsr(tone, 0.005, 0.6, 0.1, 0.4)   # déclin Rhodes caractéristique
        _add(buf, tone, i * note_dur)
    # Vinyl crackle
    crackle = noise(SCENE_DUR) * 0.018
    crackle = lpf(crackle, 400)
    buf += crackle
    buf = reverb(buf, decay=0.30, delay_ms=90)
    return 'music5.mp3', norm(fade(buf, _n(4)))

def _music6():
    """Scène 6 – Triomphe · orchestral épique · C major · 130 BPM"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    bpm = 130
    beat = 60 / bpm
    # Progression épique (C G/B Am F C G C)
    epic = [
        (261.63, 329.63, 392.00, 523.25),   # C
        (391.99, 329.63, 246.94, 196.00),   # G/B
        (440.00, 523.25, 659.25, 880.00),   # Am
        (349.23, 440.00, 523.25, 698.46),   # F
        (261.63, 329.63, 392.00, 523.25),   # C
        (392.00, 493.88, 587.33, 783.99),   # G
        (261.63, 329.63, 392.00, 523.25),   # C final
    ]
    chord_dur = SCENE_DUR / len(epic)
    for i, p in enumerate(epic):
        # Cordes : sine + saw pour richesse orchestrale
        c = chord(p, chord_dur, amp=0.30, wave='sine')
        c += chord(p, chord_dur, amp=0.10, wave='saw')
        c = adsr(c, 0.15, 0.2, 0.85, 0.6)
        _add(buf, c, i * chord_dur)
        # Octave basse pour les cordes basses
        c_low = chord([f/2 for f in p[:2]], chord_dur, amp=0.18, wave='sine')
        c_low = adsr(c_low, 0.1, 0.2, 0.8, 0.5)
        _add(buf, c_low, i * chord_dur)
    # Cuivres (attaque marquée = square)
    for i in range(len(epic)):
        p = epic[i]
        t0 = i * chord_dur
        brass = chord(p, 0.6, amp=0.22, wave='sq')
        brass = adsr(brass, 0.05, 0.1, 0.85, 0.15)
        _add(buf, brass, t0)
    # Grosse caisse épique
    for i in range(int(SCENE_DUR / beat)):
        _add(buf, kick(65, 0.35, amp=0.72), i * beat)
    # Caisse claire sur 2+4
    for i in range(int(SCENE_DUR / beat)):
        if i % 2 == 1:
            _add(buf, snare(0.14, amp=0.30), i * beat)
    # Cymbales crash (bruit broadband déclinant)
    for i in range(len(epic)):
        n_c = noise(3.0) * 0.14
        n_c = hpf(n_c, 5000)
        n_c = n_c * np.exp(-np.linspace(0, 1, len(n_c)) * 4)
        _add(buf, n_c, i * chord_dur)
    # Timbales (grondement + ton)
    timbal_notes = [130.81, 146.83, 164.81]
    for i in range(int(SCENE_DUR / (beat * 4))):
        f = timbal_notes[i % len(timbal_notes)]
        t_arr = _t(0.5)
        tim = (np.sin(2*np.pi*f*t_arr) * 0.3 + noise(0.5)*0.15) * np.exp(-t_arr*8)
        _add(buf, tim, i * beat * 4)
    # Harpe (arpège rapide montant)
    harp = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51]
    for repeat in range(int(SCENE_DUR / 4)):
        for j, f in enumerate(harp):
            a = sine(f, 0.5, amp=0.10)
            a = adsr(a, 0.005, 0.3, 0.1, 0.15)
            _add(buf, a, repeat * 4.0 + j * 0.05)
    buf = reverb(buf, decay=0.28, delay_ms=70)
    return 'music6.mp3', norm(fade(buf, _n(4)))

# ══════════════════════════ BRUITAGES (libres de droit) ══════════════════════

def _night_ambient():
    """Ambiance nocturne : grillons + vent + frémissement de feuilles"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    rng = np.random.default_rng(42)
    # Grillons (chirps à ~4.2 kHz, stridulation rythmique ~3/s)
    for i in range(int(SCENE_DUR * 3)):
        t0 = i / 3 + rng.uniform(-0.05, 0.05)
        chirp_t = _t(0.07)
        chirp = np.sin(2*np.pi*4200*chirp_t) * np.exp(-chirp_t * 60) * 0.055
        _add(buf, chirp, t0)
    # Vent léger (bruit basse fréquence modulé)
    wind = noise(SCENE_DUR) * 0.04
    wind = lpf(wind, 180)
    mod = 0.5 + 0.5 * np.sin(2 * np.pi * 0.08 * np.linspace(0, SCENE_DUR, n))
    buf += wind * mod
    # Frémissement de feuilles
    rustle = noise(SCENE_DUR) * 0.028
    rustle = bpf(rustle, 600, 2500)
    buf += rustle
    return 'night_ambient.mp3', norm(fade(buf, _n(3)), 0.70)

def _keyboard():
    """Clavier mécanique : clics, frappes, résonance"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    rng = np.random.default_rng(7)
    # ~5 touches/seconde avec légère variabilité
    times = []
    t_cur = 0.1
    while t_cur < SCENE_DUR - 0.1:
        times.append(t_cur)
        t_cur += rng.uniform(0.12, 0.28)
    for t0 in times:
        amp = rng.uniform(0.18, 0.40)
        # Clac mécanique (transitoire)
        clac = noise(0.022) * amp
        clac = bpf(clac, 1500, 9000)
        clac = fade(clac, len(clac) // 3)
        # Résonance de touche
        res_f = rng.uniform(900, 1400)
        res_dur = rng.uniform(0.03, 0.07)
        res = sine(res_f, res_dur, amp=amp * 0.12)
        res = adsr(res, 0.001, res_dur * 0.8, 0.0, 0.001)
        _add(buf, clac + res[:len(clac)], t0)
    return 'keyboard.mp3', norm(fade(buf, _n(2)), 0.75)

def _celebration():
    """Célébration : fanfare + applaudissements + confettis"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    # Fanfare montante (premier 2 secondes)
    fanfare_f = [523.25, 659.25, 783.99, 1046.50, 1318.51]
    for i, f in enumerate(fanfare_f):
        tone = sine(f, 0.5, amp=0.45) + sine(f*2, 0.5, amp=0.18) + sine(f*3, 0.5, amp=0.07)
        tone = adsr(tone, 0.01, 0.05, 0.92, 0.12)
        _add(buf, tone, i * 0.32)
    # Accord final triomphant
    final_chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]
    c = chord(final_chord, 3.0, amp=0.50, wave='sine')
    c = adsr(c, 0.05, 0.2, 0.85, 0.8)
    _add(buf, c, 1.6)
    # Applaudissements (bruit broadband)
    clap_noise = noise(8.0) * 0.35
    clap_noise = bpf(clap_noise, 400, 14000)
    clap_noise = fade(clap_noise, _n(0.6))
    _add(buf, clap_noise, 2.0)
    # Confettis / pétards (clics haute fréquence)
    rng = np.random.default_rng(13)
    for _ in range(80):
        t0 = rng.uniform(1.8, 12.0)
        c_click = noise(0.045) * rng.uniform(0.10, 0.28)
        c_click = hpf(c_click, 5000)
        c_click = fade(c_click, len(c_click) // 3)
        _add(buf, c_click, t0)
    buf = reverb(buf, decay=0.22, delay_ms=60)
    return 'celebration.mp3', norm(fade(buf, _n(4)), 0.85)

def _rain():
    """Pluie : fond continu + gouttes individuelles"""
    n = _n(SCENE_DUR)
    # Fond de pluie (bruit rose)
    rain_base = noise(SCENE_DUR) * 0.32
    rain_base = lpf(rain_base, 3000)
    rain_base = hpf(rain_base, 100)
    rng = np.random.default_rng(21)
    # Gouttes aléatoires
    for _ in range(int(SCENE_DUR * 18)):
        t0 = rng.uniform(0, SCENE_DUR - 0.1)
        dur = rng.uniform(0.018, 0.075)
        drop = noise(dur) * rng.uniform(0.08, 0.35)
        drop = bpf(drop, 300, 7000)
        drop = fade(drop, len(drop) // 3)
        _add(rain_base, drop, t0)
    rain_base = fade(rain_base, _n(2))
    return 'rain.mp3', norm(rain_base, 0.80)

def _thunder():
    """Tonnerre : 3 coups (éclair + grondement + réverbération)"""
    n = _n(SCENE_DUR)
    buf = np.zeros(n)
    for t_start in [3.0, 19.0, 40.0]:
        # Crack initial (éclair)
        crack = noise(0.18) * 0.85
        crack = fade(crack, _n(0.04))
        _add(buf, crack, t_start)
        # Grondement déclinant (basses fréquences)
        rum_dur = 4.0
        t_r = _t(rum_dur)
        rumble = (np.sin(2*np.pi*55*t_r)*0.45
                  + np.sin(2*np.pi*38*t_r)*0.30
                  + noise(rum_dur)[:len(t_r)]*0.20)
        rumble *= np.exp(-t_r * 1.4)
        rumble = lpf(rumble, 350)
        _add(buf, rumble * 0.70, t_start)
        # Écho de tonnerre (delay)
        echo = rumble * 0.30
        _add(buf, echo, t_start + 0.8)
    buf = reverb(buf, decay=0.65, delay_ms=220)
    return 'thunder.mp3', norm(fade(buf, _n(3)), 0.85)

# ══════════════════════════ NARRATION KOKORO ══════════════════════════════════

_pipeline_nar = None

def _init_nar():
    global _pipeline_nar
    _wrap_stdio()
    import warnings; warnings.filterwarnings("ignore")
    from kokoro import KPipeline
    _pipeline_nar = KPipeline(lang_code="f")

def _nar_worker(args):
    scene_num, lines = args
    t0 = time.time()
    silence = np.zeros(int(NAR_RATE * 0.45))
    chunks = []
    for idx, line in enumerate(lines):
        parts = [audio for _, _, audio in _pipeline_nar(line, voice=VOICE, speed=SPEED)]
        if parts:
            chunks.append(np.concatenate(parts))
        if idx < len(lines) - 1:
            chunks.append(silence)
    if not chunks:
        return f"[narration{scene_num}] ERREUR — aucun audio"
    audio = np.concatenate(chunks).astype(np.float32)
    wav = os.path.join(OUTPUT, f"narration{scene_num}.wav")
    mp3 = os.path.join(OUTPUT, f"narration{scene_num}.mp3")
    sf.write(wav, audio, NAR_RATE)
    if _to_mp3_simple(wav, mp3):
        os.remove(wav)
    kb = os.path.getsize(mp3) // 1024
    return f"[narration{scene_num}.mp3] OK  {kb} KB  ({time.time()-t0:.1f}s)"

def _to_mp3_simple(wav, mp3):
    try:
        from pydub import AudioSegment
        AudioSegment.from_wav(wav).export(mp3, format='mp3', bitrate='192k')
        return True
    except Exception:
        pass
    return os.system(f'ffmpeg -y -i "{wav}" -codec:a libmp3lame -qscale:a 2 "{mp3}" -loglevel quiet') == 0

# ══════════════════════════ WORKERS GÉNÉRIQUES ════════════════════════════════

def _wrap_stdio():
    try:
        if hasattr(sys.stdout, 'buffer'):
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'buffer'):
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

# Registre des générateurs SFX/musique (doit être défini APRÈS les fonctions)
_SFX_REGISTRY = {
    'music1': _music1, 'music2': _music2, 'music3': _music3,
    'music4': _music4, 'music5': _music5, 'music6': _music6,
    'night_ambient': _night_ambient, 'keyboard': _keyboard,
    'celebration': _celebration, 'rain': _rain, 'thunder': _thunder,
}

def _sfx_worker(key):
    _wrap_stdio()
    import warnings; warnings.filterwarnings("ignore")
    t0 = time.time()
    fn = _SFX_REGISTRY[key]
    name, arr = fn()
    mp3 = _save_mp3(name, arr)
    kb = os.path.getsize(mp3) // 1024
    return f"[{name}] OK  {kb} KB  ({time.time()-t0:.1f}s)"

# ══════════════════════════ MAIN ══════════════════════════════════════════════

def main():
    _wrap_stdio()
    os.makedirs(OUTPUT, exist_ok=True)

    print("=" * 65)
    print(f"  Génération audio complète — {NUM_CORES} cœurs")
    print(f"  Voix : Kokoro {VOICE}  |  Musique & SFX : synthèse libre de droit")
    print("=" * 65)
    t_global = time.time()

    # ── Phase 1 : Musiques + Bruitages (parallèle numpy/scipy) ──────────────
    sfx_keys = list(_SFX_REGISTRY.keys())
    print(f"\n[1/2] Génération musiques + bruitages ({len(sfx_keys)} fichiers)...")
    with mp.Pool(processes=min(len(sfx_keys), NUM_CORES)) as pool:
        results = pool.map(_sfx_worker, sfx_keys)
    for r in results:
        print("  ", r)

    # ── Phase 2 : Narrations Kokoro ──────────────────────────────────────────
    n_scenes = len(SCENES_TEXT)
    nar_workers = min(n_scenes, NUM_CORES)
    print(f"\n[2/2] Narrations Kokoro ({n_scenes} scènes sur {nar_workers} cœurs)...")
    with mp.Pool(processes=nar_workers, initializer=_init_nar) as pool:
        nar_results = pool.map(_nar_worker, list(SCENES_TEXT.items()))
    for r in nar_results:
        print("  ", r)

    print("\n" + "=" * 65)
    print(f"  Audio terminé en {time.time()-t_global:.1f}s")
    print(f"  Fichiers dans : {OUTPUT}")
    print("=" * 65)

    # ── Phase 3 : Rendu Remotion ─────────────────────────────────────────────
    print(f"\n[3/3] Rendu vidéo Remotion (DevStory, {NUM_CORES} concurrency)...")
    render_cmd = (
        f'npx remotion render DevStory '
        f'--concurrency={NUM_CORES} '
        f'--output=out/DevStory.mp4'
    )
    print(f"  $ {render_cmd}")
    ret = os.system(render_cmd)
    if ret == 0:
        out_path = os.path.join(ROOT, 'out', 'DevStory.mp4')
        if os.path.exists(out_path):
            mb = os.path.getsize(out_path) / (1024 * 1024)
            print(f"\n  Vidéo rendue : out/DevStory.mp4 ({mb:.1f} MB)")
        else:
            print("\n  Rendu terminé.")
    else:
        print(f"\n  Erreur rendu (code {ret}). Vérifiez que 'npx remotion render' fonctionne.")

    t_total = time.time() - t_global
    print(f"\n  Temps total : {t_total:.0f}s ({t_total/60:.1f} min)")

if __name__ == "__main__":
    mp.freeze_support()
    main()
