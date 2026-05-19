#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate French Swiss Kokoro narration for the HtmlCssJsStory Remotion video.

Dependencies:
    pip install kokoro soundfile numpy pydub
"""

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
SPEED = 0.92
SAMPLE_RATE = 24000

SCENES = {
    1: [
        "Dans une petite rue, Nina veut ouvrir un atelier en ligne.",
        "Elle a une idee claire : montrer ses lampes, raconter son travail, et inviter les visiteurs.",
        "Pour transformer cette idee en page vivante, trois compagnons arrivent : HTML, CSS et JavaScript.",
    ],
    2: [
        "HTML commence. Il donne du sens a chaque morceau de la page.",
        "Un titre n'est pas juste du texte : c'est un h un. Un paragraphe devient p. Un bouton devient button.",
        "Le navigateur lit ces balises comme le plan d'une maison.",
    ],
    3: [
        "CSS prend le plan et lui donne une atmosphere.",
        "Il choisit les couleurs, les espacements, la taille des textes et la forme des boutons.",
        "La meme page devient plus lisible, plus belle, plus accueillante.",
    ],
    4: [
        "Nina ajoute ensuite une vraie interaction.",
        "JavaScript ecoute le clic du visiteur et change la page au bon moment.",
        "Un bouton peut allumer une vitrine, ouvrir un menu, ou verifier un formulaire.",
    ],
    5: [
        "Une application contient souvent des donnees.",
        "JavaScript peut parcourir une liste, creer des cartes, et les ajouter dans la page.",
        "HTML accueille le contenu, CSS le presente, JavaScript le fabrique et le met a jour.",
    ],
    6: [
        "Voici la demo complete : structure, style, puis interaction.",
        "A gauche, le code explique ce que l'on ecrit. A droite, le navigateur montre ce que l'utilisateur voit.",
        "Le web fonctionne par couches simples qui collaborent tres bien.",
    ],
    7: [
        "Pour retenir, imagine une scene de theatre.",
        "HTML place les acteurs. CSS dessine les costumes et les lumieres. JavaScript dirige les actions.",
        "Si une couche change, les deux autres continuent de faire leur travail.",
    ],
    8: [
        "L'atelier de Nina est pret.",
        "Ce n'est pas de la magie : c'est une conversation entre structure, style et logique.",
        "Avec HTML, CSS et JavaScript, une idee devient un lieu que l'on peut visiter, comprendre et utiliser.",
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
    silence = np.zeros(int(SAMPLE_RATE * 0.42))
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
    wav_path = os.path.join(OUTPUT_DIR, f"html_story_narration{scene_num}.wav")
    mp3_path = os.path.join(OUTPUT_DIR, f"html_story_narration{scene_num}.mp3")

    sf.write(wav_path, audio, SAMPLE_RATE)
    if _to_mp3(wav_path, mp3_path):
        os.remove(wav_path)
        size_kb = os.path.getsize(mp3_path) // 1024
        return f"[html_story_narration{scene_num}.mp3] OK {size_kb} KB ({time.time() - t0:.1f}s)"

    return f"[scene {scene_num}] WAV kept because MP3 conversion failed ({time.time() - t0:.1f}s)"


def main():
    _wrap_stdio()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    workers = min(len(SCENES), mp.cpu_count())
    print(f"Generating {len(SCENES)} Kokoro narrations with voice {VOICE} on {workers} workers")

    with mp.Pool(processes=workers, initializer=_init_worker) as pool:
        results = pool.map(_worker, list(SCENES.items()))

    for result in results:
        print(result)


if __name__ == "__main__":
    mp.freeze_support()
    main()
