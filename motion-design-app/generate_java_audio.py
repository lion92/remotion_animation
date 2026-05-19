#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import io
import os
import sys
import time
import multiprocessing as mp

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(ROOT, "public", "audio")
VOICE = "ff_siwis"
SPEED = 1.05
SAMPLE_RATE = 24000

SCENES = {
    1: [
        "C'est quoi Java ? Java est un langage pour creer des applications.",
        "On l'utilise pour des sites, des applications Android, des serveurs, des jeux, et des outils d'entreprise.",
        "Son idee forte : tu ecris le code une fois, puis il peut tourner sur plusieurs machines.",
    ],
    2: [
        "Le principe est simple. Tu ecris un fichier point java avec des instructions lisibles.",
        "Le compilateur transforme ce fichier en bytecode.",
        "Ensuite, la Java Virtual Machine, qu'on appelle JVM, execute ce bytecode.",
    ],
    3: [
        "La JVM fait le pont entre ton programme et l'ordinateur.",
        "Windows, macOS ou Linux peuvent lancer le meme programme Java si la JVM est presente.",
        "C'est une des raisons pour lesquelles Java est tres utilise dans les gros systemes.",
    ],
    4: [
        "En Java, on organise le code dans des classes.",
        "Une classe peut representer un objet, comme une voiture, un utilisateur, ou une commande.",
        "La methode main est souvent le point de depart du programme.",
    ],
    5: [
        "Java est un langage type.",
        "Une variable annonce ce qu'elle contient : du texte, un nombre, ou vrai ou faux.",
        "Le compilateur peut donc reperer beaucoup d'erreurs avant meme de lancer l'application.",
    ],
    6: [
        "Dans le monde reel, Java est partout cote serveur.",
        "On le trouve dans des banques, des boutiques en ligne, des services cloud, des API, et des applications Android.",
        "Il est apprecie quand il faut construire quelque chose de solide et durable.",
    ],
    7: [
        "A retenir : Java, ce n'est pas seulement un langage.",
        "C'est aussi un ecosysteme avec une machine virtuelle, des outils, et beaucoup de bibliotheques.",
        "Si tu veux apprendre la programmation serieusement, Java donne de tres bonnes bases.",
    ],
}

_pipeline = None


def _wrap_stdio():
    try:
        if hasattr(sys.stdout, "buffer"):
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "buffer"):
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass


def _init_worker():
    global _pipeline
    _wrap_stdio()
    import warnings

    warnings.filterwarnings("ignore")
    from kokoro import KPipeline

    _pipeline = KPipeline(lang_code="f")


def _to_mp3(wav_path, mp3_path):
    try:
        from pydub import AudioSegment

        AudioSegment.from_wav(wav_path).export(mp3_path, format="mp3", bitrate="192k")
        return True
    except Exception:
        pass

    command = f'ffmpeg -y -i "{wav_path}" -codec:a libmp3lame -qscale:a 2 "{mp3_path}" -loglevel quiet'
    return os.system(command) == 0


def _worker(item):
    scene_num, lines = item
    t0 = time.time()
    silence = np.zeros(int(SAMPLE_RATE * 0.26))
    chunks = []

    for index, line in enumerate(lines):
        parts = [audio for _, _, audio in _pipeline(line, voice=VOICE, speed=SPEED)]
        if parts:
            chunks.append(np.concatenate(parts))
        if index < len(lines) - 1:
            chunks.append(silence)

    if not chunks:
        return f"[scene {scene_num}] ERROR no audio generated"

    audio = np.concatenate(chunks).astype(np.float32)
    wav_path = os.path.join(OUTPUT_DIR, f"java_narration{scene_num}.wav")
    mp3_path = os.path.join(OUTPUT_DIR, f"java_narration{scene_num}.mp3")

    sf.write(wav_path, audio, SAMPLE_RATE)
    if _to_mp3(wav_path, mp3_path):
        os.remove(wav_path)
        size_kb = os.path.getsize(mp3_path) // 1024
        return f"[java_narration{scene_num}.mp3] OK {size_kb} KB ({time.time() - t0:.1f}s)"

    return f"[scene {scene_num}] WAV kept because MP3 conversion failed ({time.time() - t0:.1f}s)"


def main():
    _wrap_stdio()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    workers = min(len(SCENES), mp.cpu_count())
    print(f"Generating {len(SCENES)} Java narrations with voice {VOICE} on {workers} workers")

    with mp.Pool(processes=workers, initializer=_init_worker) as pool:
        results = pool.map(_worker, list(SCENES.items()))

    for result in results:
        print(result)


if __name__ == "__main__":
    mp.freeze_support()
    main()
