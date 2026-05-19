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
        "Un jeu de combat au tour par tour dans le navigateur.",
        "HTML = structure, CSS = style, JS = logique de jeu.",
        "8 minutes pour coder un vrai jeu qui fonctionne.",
    ],
    2: [
        "Chaque div est une zone : arène, journal, boutons.",
        "Les id permettent à JS de cibler chaque élément.",
        "onclick sur les boutons appelle directement les fonctions JS.",
    ],
    3: [
        "background 0d0d1a donne le fond sombre typique RPG.",
        "display flex avec flex-direction column centre tout verticalement.",
        "text-shadow avec la même couleur que le texte crée l'effet lumineux.",
    ],
    4: [
        "linear-gradient donne de la profondeur aux cartes de combat.",
        "La barre HP a une transition CSS : elle s'anime sans JS.",
        "box-shadow coloré crée l'aura autour de chaque combattant.",
    ],
    5: [
        "shake fait vibrer la carte quand elle prend des dégâts.",
        "pulse fait briller le héros en boucle, animation infinie.",
        "JS déclenche l'animation en ajoutant puis retirant la classe CSS.",
    ],
    6: [
        "Un objet JS regroupe toutes les stats d'un personnage.",
        "hero.hp, hero.atk : on accède à une propriété avec un point.",
        "Ces valeurs changent à chaque action, c'est l'état vivant du jeu.",
    ],
    7: [
        "getElementById cible un élément HTML par son id.",
        "style.width met la barre HP à jour sans recharger la page.",
        "createElement et appendChild injectent du HTML dynamiquement.",
    ],
    8: [
        "Math.random renvoie un float entre 0 et 1, pour la variance.",
        "Math.max empêche les HP de passer en négatif.",
        "Après chaque attaque, monsterTurn riposte automatiquement.",
    ],
    9: [
        "Math.min empêche les HP de dépasser le maximum.",
        "La magie coûte 15 MP, on vérifie avec if avant d'agir.",
        "Deux stratégies, même structure : calcul, log, update, tour monstre.",
    ],
    10: [
        "Le monstre riposte automatiquement après chaque action du joueur.",
        "checkEnd retourne true si le combat est terminé, stoppe la chaîne.",
        "endGame affiche le résultat et désactive tous les boutons.",
    ],
    11: [
        "HTML définit le quoi, CSS le look, JS le comment ça marche.",
        "Chaque clic : calcul, log, updateHud, tour monstre, checkEnd.",
        "Tout tourne dans le navigateur, aucun serveur nécessaire.",
    ],
    12: [
        "HTML : div, id, class, onclick, la fondation du jeu.",
        "CSS : gradient, transition, keyframes, le style et les animations.",
        "JS : objets, fonctions, DOM, Math, toute la logique du combat.",
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
    wav_path = os.path.join(OUTPUT_DIR, f"rpg_narration{scene_num}.wav")
    mp3_path = os.path.join(OUTPUT_DIR, f"rpg_narration{scene_num}.mp3")

    sf.write(wav_path, audio, SAMPLE_RATE)
    if _to_mp3(wav_path, mp3_path):
        os.remove(wav_path)
        size_kb = os.path.getsize(mp3_path) // 1024
        return f"[rpg_narration{scene_num}.mp3] OK {size_kb} KB ({time.time() - t0:.1f}s)"

    return f"[scene {scene_num}] WAV kept because MP3 conversion failed ({time.time() - t0:.1f}s)"


def main():
    _wrap_stdio()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    workers = 8
    print(f"Generating {len(SCENES)} RPG narrations with voice {VOICE} on {workers} workers")

    with mp.Pool(processes=workers, initializer=_init_worker) as pool:
        results = pool.map(_worker, list(SCENES.items()))

    for result in results:
        print(result)


if __name__ == "__main__":
    mp.freeze_support()
    main()
