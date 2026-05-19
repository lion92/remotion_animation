#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génération complète pour AstronautStory :
  - Narrations  : Kokoro ff_siwis
  - Musiques    : 6 thèmes synthétisés 100% libres de droit
  - Rendu vidéo : npx remotion render AstronautStory --concurrency 12

Dépendances : pip install kokoro soundfile numpy scipy pydub
"""

import os, sys, io, time
import numpy as np
import soundfile as sf
import multiprocessing as mp

try:
    from scipy import signal as _sig
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

ROOT   = os.path.dirname(os.path.abspath(__file__))
OUTPUT = os.path.join(ROOT, "public", "audio")

RATE       = 44100
NAR_RATE   = 24000
SCENE_DUR  = 50.0   # 1200 frames / 24fps
VOICE      = "ff_siwis"
SPEED      = 0.88
NUM_CORES  = 12

# ─── Narrations ───────────────────────────────────────────────────────────────
NARRATIONS = {
    1: [
        "Il s'appelle Lucas. Il a seize ans.",
        "Chaque nuit, il contemple l'immensité du cosmos.",
        "La Lune, distante de trois cent quatre-vingt-quatre mille kilomètres, semble si proche.",
        "Son rêve : devenir astronaute et toucher les étoiles.",
    ],
    2: [
        "Pour conquérir l'espace, il faut d'abord conquérir la science.",
        "Lucas étudie la physique, les mathématiques, l'astrophysique.",
        "L'équation de Tsiolkovsky gouverne les fusées : delta-v égale l'impulsion spécifique fois le logarithme du ratio de masse.",
        "La vitesse de libération terrestre est de onze virgule deux kilomètres par seconde.",
    ],
    3: [
        "L'espace est impitoyable pour le corps humain.",
        "Lucas s'entraîne six heures par jour : course, musculation, piscine.",
        "Au décollage, les astronautes subissent jusqu'à trois G de force.",
        "Sous l'eau, ils simulent les sorties spatiales qui peuvent durer huit heures.",
    ],
    4: [
        "En deux mille vingt-et-un, dix-huit mille deux cent trente-deux personnes ont postulé à la NASA.",
        "Seulement dix ont été sélectionnés. Une chance sur mille huit cent vingt-trois.",
        "Tests médicaux, psychologiques, techniques. Chaque détail compte.",
        "Lucas reçoit ses ailes d'astronaute. Son destin commence.",
    ],
    5: [
        "Décollage. La Terre disparaît en huit minutes trente.",
        "L'ISS orbite à quatre cent huit kilomètres d'altitude, à vingt-sept mille sept cent vingt-quatre kilomètres par heure.",
        "En microgravité, les os perdent un à deux pourcent de leur masse chaque mois.",
        "Lucas réalise son premier EVA. Huit heures dans le vide absolu.",
    ],
    6: [
        "Après cent quatre-vingt-deux jours dans l'espace, le retour commence.",
        "La capsule traverse l'atmosphère à vingt-huit mille kilomètres par heure. La température atteint mille six cent cinquante degrés.",
        "Le bouclier thermique, fait de tuiles en silice, absorbe cette chaleur infernale.",
        "Lucas revient sur Terre. Son voyage inspire des millions de futurs astronautes à lever les yeux vers les étoiles.",
    ],
}

# ─── Utilitaires synth ────────────────────────────────────────────────────────
def _n(d): return int(d * RATE)
def _t(d): return np.linspace(0, d, _n(d), endpoint=False)

def sine(f, d, amp=1.0, ph=0.0):
    return amp * np.sin(2 * np.pi * f * _t(d) + ph)

def noise(d):
    return np.random.default_rng().uniform(-1, 1, _n(d))

def fade(arr, s):
    r, s = arr.copy(), min(s, len(arr) // 2)
    r[:s] *= np.linspace(0, 1, s)
    r[-s:] *= np.linspace(1, 0, s)
    return r

def adsr(arr, a, d, sl, r):
    n = len(arr)
    ai, di, ri = _n(a), _n(d), _n(r)
    si = max(0, n - ai - di - ri)
    env = np.concatenate([np.linspace(0, 1, ai), np.linspace(1, sl, di), np.full(si, sl), np.linspace(sl, 0, ri)])[:n]
    return arr * env

def lpf(arr, c):
    if not HAS_SCIPY: return arr
    b, a = _sig.butter(2, c / (RATE / 2), 'low'); return _sig.filtfilt(b, a, arr)

def hpf(arr, c):
    if not HAS_SCIPY: return arr
    b, a = _sig.butter(2, c / (RATE / 2), 'high'); return _sig.filtfilt(b, a, arr)

def bpf(arr, lo, hi):
    if not HAS_SCIPY: return arr
    b, a = _sig.butter(2, [lo / (RATE / 2), hi / (RATE / 2)], 'band'); return _sig.filtfilt(b, a, arr)

def reverb(arr, decay=0.35, delay_ms=100):
    d, out = int(delay_ms * RATE / 1000), arr.copy()
    for i in range(1, 5):
        pad = np.zeros(d * i)
        delayed = np.concatenate([pad, arr])[:len(arr)]
        out += delayed * (decay ** i)
    pk = np.max(np.abs(out))
    return out / pk if pk > 0 else out

def norm(arr, t=0.85):
    pk = np.max(np.abs(arr))
    return arr / pk * t if pk > 1e-9 else arr

def chord(freqs, dur, amp=0.3, wave='sine'):
    t = _t(dur); out = np.zeros(len(t))
    for f in freqs:
        if wave == 'sine': out += np.sin(2 * np.pi * f * t)
        elif wave == 'saw': out += (2 * ((f * t) % 1) - 1) * 0.45
        elif wave == 'sq': out += np.sign(np.sin(2 * np.pi * f * t)) * 0.3
    return out / len(freqs) * amp

def kick(f=60, d=0.25, amp=0.65):
    t = _t(d); env = np.exp(-t * 25); pe = np.exp(-t * 30)
    return amp * np.sin(2 * np.pi * (f + f * 2 * pe) * t) * env

def hat(d=0.04, amp=0.08):
    n = noise(d); n = hpf(n, 7000)
    return fade(n * amp, len(n) // 3)

def snare(d=0.1, amp=0.18):
    n = noise(d); n = bpf(n, 200, 5000)
    t = _t(d); body = 0.4 * np.sin(2 * np.pi * 200 * t) * np.exp(-t * 40)
    return fade((n + body) * amp, len(n) // 4)

def _add(buf, arr, t0):
    s = int(t0 * RATE); e = s + len(arr)
    if e <= len(buf): buf[s:e] += arr

def _save_mp3(name, arr):
    arr = np.clip(arr, -1, 1).astype(np.float32)
    wav = os.path.join(OUTPUT, name.replace('.mp3', '.wav'))
    mp3 = os.path.join(OUTPUT, name)
    sf.write(wav, arr, RATE)
    ok = False
    try:
        from pydub import AudioSegment
        AudioSegment.from_wav(wav).export(mp3, format='mp3', bitrate='192k')
        ok = True
    except Exception:
        ok = (os.system(f'ffmpeg -y -i "{wav}" -codec:a libmp3lame -qscale:a 2 "{mp3}" -loglevel quiet') == 0)
    if ok and os.path.exists(wav): os.remove(wav)
    return mp3

# ─── Musiques astronaute ──────────────────────────────────────────────────────

def _astro_music1():
    """Scène 1 · Rêve des étoiles · ambient cosmique · 55 BPM"""
    n, buf = _n(SCENE_DUR), np.zeros(_n(SCENE_DUR))
    # Pad spatial (Cm9 flottant)
    pads = [
        (130.81, 155.56, 196.00, 246.94, 293.66),  # Cm9
        (116.54, 138.59, 174.61, 220.00, 261.63),  # Bbm9
        (146.83, 174.61, 220.00, 277.18, 329.63),  # Dm
        (130.81, 155.56, 196.00, 233.08, 293.66),  # Cm retour
    ]
    seg = SCENE_DUR / len(pads)
    for i, p in enumerate(pads):
        c = chord(p, seg, amp=0.28, wave='sine')
        c = fade(c, _n(3.0))
        _add(buf, c, i * seg)
    # Mélodie flûte synthétique (triangle wave approché)
    mel = [392, 440, 523.25, 493.88, 440, 392, 349.23, 329.63, 392]
    for i, f in enumerate(mel):
        tone = sine(f, 2.5, amp=0.16) + sine(f*2, 2.5, amp=0.04) + sine(f*3, 2.5, amp=0.01)
        tone = adsr(tone, 0.2, 0.5, 0.5, 1.0)
        _add(buf, tone, i * (SCENE_DUR / len(mel)))
    # Basse cosmique (pulsation lente)
    for i in range(int(SCENE_DUR / 2.5)):
        b = sine(65.41, 1.2, amp=0.16)
        b = adsr(b, 0.1, 0.4, 0.4, 0.5)
        _add(buf, b, i * 2.5)
    # Arpège étoiles scintillantes
    arp = [783.99, 1046.50, 987.77, 880.00, 783.99, 698.46]
    for i in range(int(SCENE_DUR / 0.4)):
        f = arp[i % len(arp)]
        a = sine(f, 0.35, amp=0.06)
        a = adsr(a, 0.01, 0.1, 0.3, 0.15)
        _add(buf, a, i * 0.4)
    buf = reverb(buf, decay=0.5, delay_ms=180)
    return 'astro_music1.mp3', norm(fade(buf, _n(5)))

def _astro_music2():
    """Scène 2 · La Science · orchestral studieux · 80 BPM"""
    n, buf = _n(SCENE_DUR), np.zeros(_n(SCENE_DUR))
    beat = 60 / 80
    # Piano (cordes) sur Am → F → C → G
    prog = [
        (440.00, 523.25, 659.25, 880.00),  # Am
        (349.23, 440.00, 523.25, 698.46),  # F
        (261.63, 329.63, 392.00, 523.25),  # C
        (392.00, 493.88, 587.33, 783.99),  # G
    ]
    chord_d = SCENE_DUR / len(prog)
    for i, p in enumerate(prog):
        c = chord(p, chord_d, amp=0.28, wave='sine')
        c = adsr(c, 0.03, 0.2, 0.7, 0.8)
        _add(buf, c, i * chord_d)
    # Cordes basses (violoncelle simulé)
    bass = [220.00, 174.61, 130.81, 196.00]
    for i in range(len(prog)):
        b = sine(bass[i], chord_d, amp=0.25)
        b += sine(bass[i]*2, chord_d, amp=0.08)
        b = adsr(b, 0.05, 0.1, 0.75, 0.5)
        _add(buf, b, i * chord_d)
    # Mélodie pensif (hautbois simulé)
    mel = [659.25, 587.33, 523.25, 493.88, 440.00, 493.88, 523.25, 587.33]
    for i, f in enumerate(mel):
        tone = sine(f, 1.5, amp=0.18) + sine(f*2, 1.5, amp=0.07) + sine(f*3, 1.5, amp=0.03)
        tone = adsr(tone, 0.1, 0.3, 0.65, 0.6)
        _add(buf, tone, i * (SCENE_DUR / len(mel)))
    # Léger pizzicato (notes courtes)
    for i in range(int(SCENE_DUR / beat)):
        f = [329.63, 392.00, 349.23, 440.00][i % 4]
        p = sine(f, 0.12, amp=0.12)
        p = adsr(p, 0.005, 0.08, 0.0, 0.02)
        _add(buf, p, i * beat)
    buf = reverb(buf, decay=0.3, delay_ms=120)
    return 'astro_music2.mp3', norm(fade(buf, _n(4)))

def _astro_music3():
    """Scène 3 · Entraînement · rock motivant · 120 BPM"""
    n, buf = _n(SCENE_DUR), np.zeros(_n(SCENE_DUR))
    beat = 60 / 120
    # Power chords (Em - Am - C - G)
    prog = [
        (164.81, 246.94),  # Em power
        (220.00, 329.63),  # Am power
        (261.63, 392.00),  # C power
        (196.00, 293.66),  # G power
    ]
    chord_d = beat * 4
    for repeat in range(int(SCENE_DUR / (chord_d * len(prog))) + 1):
        for i, p in enumerate(prog):
            t0 = (repeat * len(prog) + i) * chord_d
            if t0 >= SCENE_DUR: break
            c = chord(p, min(chord_d, SCENE_DUR - t0), amp=0.35, wave='sq')
            c = adsr(c, 0.01, 0.05, 0.85, 0.1)
            _add(buf, c, t0)
    # Kick puissant
    for i in range(int(SCENE_DUR / beat)):
        if i % 4 in [0, 2, 3]:
            _add(buf, kick(70, 0.22, amp=0.65), i * beat)
    # Snare sur 2+4
    for i in range(int(SCENE_DUR / beat)):
        if i % 4 in [1, 3]:
            _add(buf, snare(0.10, amp=0.30), i * beat)
    # Hi-hat
    for i in range(int(SCENE_DUR / (beat / 2))):
        _add(buf, hat(0.03, amp=0.08), i * beat / 2)
    # Basse rock
    bass_n = [164.81, 164.81, 220.00, 196.00]
    for i in range(int(SCENE_DUR / chord_d)):
        f = bass_n[i % len(bass_n)]
        b = sine(f, chord_d, amp=0.35)
        b = adsr(b, 0.01, 0.04, 0.75, 0.05)
        _add(buf, b, i * chord_d)
    # Mélodie guitare lead
    lead = [659.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88]
    for i, f in enumerate(lead):
        tone = sine(f, beat * 0.8, amp=0.20) + sine(f*2, beat * 0.8, amp=0.06)
        tone = adsr(tone, 0.005, 0.05, 0.8, 0.1)
        _add(buf, tone, i * beat + beat * 4)
    return 'astro_music3.mp3', norm(fade(buf, _n(3)))

def _astro_music4():
    """Scène 4 · Sélection · tension + espoir · 90 BPM"""
    n, buf = _n(SCENE_DUR), np.zeros(_n(SCENE_DUR))
    beat = 60 / 90
    # Début tendu (Am min → résolution C maj)
    tense = [(440.00, 523.25, 659.25), (392.00, 493.88, 587.33)]
    resolve = [(261.63, 329.63, 392.00, 523.25), (293.66, 369.99, 440.00, 587.33)]
    for i in range(int(SCENE_DUR / (beat * 4))):
        t0 = i * beat * 4
        phase = i / max(1, int(SCENE_DUR / (beat * 4)))
        chords = resolve if phase > 0.6 else tense
        p = chords[i % len(chords)]
        c = chord(p, beat * 4, amp=0.26 + phase * 0.1, wave='sine')
        c = adsr(c, 0.05, 0.2, 0.8, 0.5)
        _add(buf, c, t0)
    # Percussion croissante (montée en intensité)
    for i in range(int(SCENE_DUR / beat)):
        progress = i / int(SCENE_DUR / beat)
        amp_k = 0.3 + progress * 0.35
        _add(buf, kick(60, 0.28, amp=amp_k), i * beat)
        if i % 2 == 1:
            _add(buf, snare(0.12, amp=0.15 + progress * 0.15), i * beat)
    # Mélodie montante (espoir)
    mel_rise = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
    mel_d = SCENE_DUR * 0.6 / len(mel_rise)
    for i, f in enumerate(mel_rise):
        tone = sine(f, mel_d * 0.9, amp=0.14 + i * 0.015)
        tone = adsr(tone, 0.05, 0.1, 0.7, 0.3)
        _add(buf, tone, SCENE_DUR * 0.35 + i * mel_d)
    # Fanfare victoire finale
    fan = [523.25, 659.25, 783.99, 1046.50]
    for i, f in enumerate(fan):
        tone = sine(f, 0.4, amp=0.35) + sine(f*2, 0.4, amp=0.12)
        tone = adsr(tone, 0.01, 0.05, 0.9, 0.15)
        _add(buf, tone, SCENE_DUR * 0.85 + i * 0.28)
    buf = reverb(buf, decay=0.25, delay_ms=90)
    return 'astro_music4.mp3', norm(fade(buf, _n(4)))

def _astro_music5():
    """Scène 5 · Dans l'espace · ambient zero-G · 60 BPM"""
    n, buf = _n(SCENE_DUR), np.zeros(_n(SCENE_DUR))
    # Pad flottant (pas de gravité = pas de pulse régulier)
    pads5 = [
        (261.63, 329.63, 392.00, 523.25, 659.25),  # C maj9
        (293.66, 369.99, 440.00, 587.33, 739.99),  # D maj9
        (220.00, 277.18, 329.63, 440.00, 554.37),  # Am9
        (174.61, 220.00, 261.63, 349.23, 440.00),  # Fmaj9
    ]
    seg5 = SCENE_DUR / len(pads5)
    for i, p in enumerate(pads5):
        c = chord(p, seg5, amp=0.22, wave='sine')
        c = fade(c, _n(4.0))
        _add(buf, c, i * seg5)
    # Mélodie synthé spatiale (progression lente)
    space_mel = [1046.50, 987.77, 880.00, 783.99, 698.46, 659.25, 523.25, 587.33, 659.25]
    for i, f in enumerate(space_mel):
        tone = sine(f, 3.0, amp=0.15) + sine(f*0.5, 3.0, amp=0.08)
        tone = adsr(tone, 0.5, 1.0, 0.4, 1.2)
        _add(buf, tone, i * (SCENE_DUR / len(space_mel)))
    # Drone cosmique basse
    drone = sine(32.70, SCENE_DUR, amp=0.08)  # C1 drone
    drone += sine(65.41, SCENE_DUR, amp=0.06)  # C2
    drone = fade(drone, _n(5))
    buf += drone
    # Scintillements (haute fréquence, aléatoire)
    rng = np.random.default_rng(55)
    for _ in range(80):
        t0 = rng.uniform(0, SCENE_DUR - 0.3)
        f = rng.choice([2093, 2637, 3136, 4186])
        a = sine(f, 0.25, amp=rng.uniform(0.04, 0.09))
        a = adsr(a, 0.01, 0.1, 0.2, 0.1)
        _add(buf, a, t0)
    buf = reverb(buf, decay=0.6, delay_ms=250)
    return 'astro_music5.mp3', norm(fade(buf, _n(5)))

def _astro_music6():
    """Scène 6 · Retour · épique héroïque · 110 BPM"""
    n, buf = _n(SCENE_DUR), np.zeros(_n(SCENE_DUR))
    beat = 60 / 110
    # Progression héroïque C G Am F C G C
    hero = [
        (261.63, 329.63, 392.00, 523.25),  # C
        (392.00, 493.88, 587.33, 783.99),  # G
        (440.00, 523.25, 659.25, 880.00),  # Am
        (349.23, 440.00, 523.25, 698.46),  # F
        (261.63, 329.63, 392.00, 523.25),  # C
        (392.00, 493.88, 587.33, 783.99),  # G
        (261.63, 329.63, 392.00, 523.25),  # C final
    ]
    cd = SCENE_DUR / len(hero)
    for i, p in enumerate(hero):
        c = chord(p, cd, amp=0.28, wave='sine')
        c += chord(p, cd, amp=0.10, wave='sq')
        c = adsr(c, 0.12, 0.18, 0.88, 0.5)
        _add(buf, c, i * cd)
        # Octave graves (cordes basses)
        cl = chord([f/2 for f in p[:2]], cd, amp=0.20, wave='sine')
        cl = adsr(cl, 0.08, 0.15, 0.8, 0.4)
        _add(buf, cl, i * cd)
    # Grosse caisse
    for i in range(int(SCENE_DUR / beat)):
        _add(buf, kick(68, 0.32, amp=0.70), i * beat)
    # Caisse claire héroïque
    for i in range(int(SCENE_DUR / beat)):
        if i % 2 == 1:
            _add(buf, snare(0.14, amp=0.28), i * beat)
    # Cymbales crash
    for i in range(len(hero)):
        cym = noise(3.5) * 0.12
        cym = hpf(cym, 5000)
        cym *= np.exp(-np.linspace(0, 1, len(cym)) * 4)
        _add(buf, cym, i * cd)
    # Cuivres (trompettes)
    for i in range(len(hero)):
        p = hero[i]
        brass = chord(p[:2], 0.55, amp=0.25, wave='sq')
        brass = adsr(brass, 0.06, 0.1, 0.88, 0.12)
        _add(buf, brass, i * cd)
    # Harpe (arpège triomphal)
    harp_f = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]
    for repeat in range(int(SCENE_DUR / 3)):
        for j, f in enumerate(harp_f):
            a = sine(f, 0.5, amp=0.09)
            a = adsr(a, 0.005, 0.3, 0.05, 0.15)
            _add(buf, a, repeat * 3.0 + j * 0.04)
    buf = reverb(buf, decay=0.25, delay_ms=65)
    return 'astro_music6.mp3', norm(fade(buf, _n(4)))

# ─── Registry ─────────────────────────────────────────────────────────────────
_MUSIC_REGISTRY = {
    'astro_music1': _astro_music1,
    'astro_music2': _astro_music2,
    'astro_music3': _astro_music3,
    'astro_music4': _astro_music4,
    'astro_music5': _astro_music5,
    'astro_music6': _astro_music6,
}

# ─── Workers ──────────────────────────────────────────────────────────────────
def _wrap():
    try:
        if hasattr(sys.stdout, 'buffer'):
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'buffer'):
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass

def _music_worker(key):
    _wrap()
    import warnings; warnings.filterwarnings("ignore")
    t0 = time.time()
    name, arr = _MUSIC_REGISTRY[key]()
    mp3 = _save_mp3(name, arr)
    kb = os.path.getsize(mp3) // 1024
    return f"[{name}] OK  {kb} KB  ({time.time()-t0:.1f}s)"

_pipeline = None

def _init_nar():
    global _pipeline
    _wrap()
    import warnings; warnings.filterwarnings("ignore")
    from kokoro import KPipeline
    _pipeline = KPipeline(lang_code="f")

def _nar_worker(args):
    scene_num, lines = args
    t0 = time.time()
    silence = np.zeros(int(NAR_RATE * 0.5))
    chunks = []
    for idx, line in enumerate(lines):
        parts = [audio for _, _, audio in _pipeline(line, voice=VOICE, speed=SPEED)]
        if parts:
            chunks.append(np.concatenate(parts))
        if idx < len(lines) - 1:
            chunks.append(silence)
    if not chunks:
        return f"[astro_narration{scene_num}] ERREUR"
    audio = np.concatenate(chunks).astype(np.float32)
    wav = os.path.join(OUTPUT, f"astro_narration{scene_num}.wav")
    mp3 = os.path.join(OUTPUT, f"astro_narration{scene_num}.mp3")
    sf.write(wav, audio, NAR_RATE)
    ok = False
    try:
        from pydub import AudioSegment
        AudioSegment.from_wav(wav).export(mp3, format='mp3', bitrate='192k')
        ok = True
    except Exception:
        ok = (os.system(f'ffmpeg -y -i "{wav}" -codec:a libmp3lame -qscale:a 2 "{mp3}" -loglevel quiet') == 0)
    if ok and os.path.exists(wav): os.remove(wav)
    kb = os.path.getsize(mp3) // 1024
    return f"[astro_narration{scene_num}.mp3] OK  {kb} KB  ({time.time()-t0:.1f}s)"

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    _wrap()
    os.makedirs(OUTPUT, exist_ok=True)
    print("=" * 65)
    print(f"  AstronautStory — Génération audio + vidéo  ({NUM_CORES} cœurs)")
    print("=" * 65)
    t_global = time.time()

    # Phase 1 : Musiques
    music_keys = list(_MUSIC_REGISTRY.keys())
    print(f"\n[1/3] Musiques astronaute ({len(music_keys)} fichiers)...")
    with mp.Pool(processes=min(len(music_keys), NUM_CORES)) as pool:
        for r in pool.map(_music_worker, music_keys):
            print("  ", r)

    # Phase 2 : Narrations
    n_scenes = len(NARRATIONS)
    print(f"\n[2/3] Narrations Kokoro ({n_scenes} scènes sur {min(n_scenes, NUM_CORES)} cœurs)...")
    with mp.Pool(processes=min(n_scenes, NUM_CORES), initializer=_init_nar) as pool:
        for r in pool.map(_nar_worker, list(NARRATIONS.items())):
            print("  ", r)

    print("\n" + "=" * 65)
    print(f"  Audio terminé en {time.time()-t_global:.1f}s")
    print("=" * 65)

    # Phase 3 : Rendu Remotion
    print(f"\n[3/3] Rendu Remotion (AstronautStory, {NUM_CORES} cœurs)...")
    cmd = f'npx remotion render src/index.jsx AstronautStory --concurrency={NUM_CORES} --output=out/AstronautStory.mp4'
    print(f"  $ {cmd}")
    ret = os.system(cmd)
    if ret == 0:
        out = os.path.join(ROOT, 'out', 'AstronautStory.mp4')
        if os.path.exists(out):
            mb = os.path.getsize(out) / (1024 * 1024)
            print(f"\n  Vidéo : out/AstronautStory.mp4 ({mb:.1f} MB)")
    else:
        print(f"\n  Erreur rendu (code {ret})")

    print(f"\n  Temps total : {time.time()-t_global:.0f}s ({(time.time()-t_global)/60:.1f} min)")

if __name__ == "__main__":
    mp.freeze_support()
    main()
