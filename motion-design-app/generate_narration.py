#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère les narrations (narration1-6.mp3) avec la voix Kokoro ff_siwis (Swiss French).
Utilise multiprocessing pour traiter les 6 scènes en parallèle.

Dépendances :
    pip install kokoro soundfile numpy pydub
"""

import os
import sys
import io
import time
import numpy as np
import soundfile as sf
import multiprocessing as mp

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "audio")

SCENES = {
    1: [
        "Il s'appelle Lucas. 18 ans.",
        "Chaque nuit, il rêve du même rêve...",
        "Devenir un grand développeur.",
    ],
    2: [
        "Le lendemain matin... 7 heures.",
        "Lucas ouvre son premier IDE, les mains tremblantes.",
        "Une erreur. Puis une autre. Mais il ne lâche pas.",
        "Et puis... son premier programme fonctionne !",
    ],
    3: [
        "Le terminal. Son nouveau terrain de jeu.",
        "Il tape son programme, caractère par caractère...",
        "HELLO WORLD ! Ca fonctionne ! Pour de vrai !",
        "Ce jour-là, il devient développeur.",
    ],
    4: [
        "Les semaines passent. Les bugs s'accumulent.",
        "Chaque ligne de code cache un nouveau piège...",
        "Il veut abandonner. Mais quelque chose le retient.",
        "Non. Il recommence. Plus fort. Plus déterminé.",
    ],
    5: [
        "22 heures. Lucas commence son grand projet.",
        "Minuit. La ville dort. Lui, il code.",
        "3 heures du matin. Le café est froid. Le code avance.",
        "Une ligne à la fois, son rêve prend forme.",
    ],
    6: [
        "Six mois plus tard...",
        "L'application est en ligne. Les utilisateurs arrivent.",
        "Une première offre d'emploi. Puis une deuxième.",
        "Lucas est maintenant développeur senior. Son rêve est réel.",
    ],
}

SAMPLE_RATE = 24000
VOICE = "ff_siwis"
SPEED = 0.92

# Pipeline global par processus worker
_pipeline = None


def _init_worker():
    """Initialise un pipeline Kokoro dans chaque processus worker."""
    global _pipeline
    # Redirige stdout/stderr en UTF-8 dans chaque worker Windows
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    import warnings
    warnings.filterwarnings("ignore")
    from kokoro import KPipeline
    _pipeline = KPipeline(lang_code="f")


def _wav_to_mp3(wav_path: str, mp3_path: str) -> bool:
    try:
        from pydub import AudioSegment
        AudioSegment.from_wav(wav_path).export(mp3_path, format="mp3", bitrate="192k")
        return True
    except Exception:
        pass
    ret = os.system(f'ffmpeg -y -i "{wav_path}" -codec:a libmp3lame -qscale:a 2 "{mp3_path}" -loglevel quiet')
    return ret == 0


def _worker(args: tuple) -> str:
    """Fonction exécutée dans chaque processus worker."""
    scene_num, lines = args
    t0 = time.time()

    silence = np.zeros(int(SAMPLE_RATE * 0.45))
    chunks = []

    for idx, line in enumerate(lines):
        parts = [audio for _, _, audio in _pipeline(line, voice=VOICE, speed=SPEED)]
        if parts:
            chunks.append(np.concatenate(parts))
        if idx < len(lines) - 1:
            chunks.append(silence)

    if not chunks:
        return f"[Scene {scene_num}] ERREUR — aucun audio genere"

    audio_full = np.concatenate(chunks).astype(np.float32)
    wav_path = os.path.join(OUTPUT_DIR, f"narration{scene_num}.wav")
    mp3_path = os.path.join(OUTPUT_DIR, f"narration{scene_num}.mp3")

    sf.write(wav_path, audio_full, SAMPLE_RATE)

    if _wav_to_mp3(wav_path, mp3_path):
        os.remove(wav_path)
        size_kb = os.path.getsize(mp3_path) // 1024
        elapsed = time.time() - t0
        return f"[Scene {scene_num}] OK  {size_kb} KB  ({elapsed:.1f}s)"
    else:
        elapsed = time.time() - t0
        return f"[Scene {scene_num}] WAV conserve (ffmpeg absent)  ({elapsed:.1f}s)"


def main():
    # UTF-8 pour le processus principal
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    num_workers = min(len(SCENES), mp.cpu_count())
    print(f"Génération de {len(SCENES)} scènes sur {num_workers} cœurs — voix {VOICE}")
    print("-" * 60)

    t_total = time.time()

    with mp.Pool(
        processes=num_workers,
        initializer=_init_worker,
    ) as pool:
        results = pool.map(_worker, list(SCENES.items()))

    for r in results:
        print(r)

    print("-" * 60)
    print(f"Terminé en {time.time() - t_total:.1f}s — fichiers dans public/audio/")


if __name__ == "__main__":
    main()
