#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère les narrations pour MiniRpgCodeurV2 (12 scènes)."""

import io
import os
import sys
import time
import multiprocessing as mp

import numpy as np
import soundfile as sf

ROOT       = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(ROOT, "public", "audio")
VOICE      = "ff_siwis"
SPEED      = 1.05
SAMPLE_RATE = 24000

SCENES = {
    1: [  # INTRO 35s
        "Bienvenue. On va coder un mini RPG complet : héros contre dragon, combat au tour par tour.",
        "Trois fichiers seulement : HTML pour la structure, CSS pour le style, JavaScript pour la logique.",
        "8 minutes et tu as un vrai jeu jouable dans le navigateur.",
    ],
    2: [  # HTML 50s
        "Le HTML pose le squelette. L'arène contient deux cartes de combattant, un journal, des boutons.",
        "Chaque élément a un id unique : c'est ce que JavaScript va cibler pour modifier l'affichage.",
        "onclick sur un bouton appelle directement la fonction JS. Pas d'EventListener nécessaire.",
    ],
    3: [  # CSS 50s
        "Le CSS crée l'ambiance RPG. Fond presque noir, cartes avec dégradé violet, textes lumineux.",
        "La barre de vie a une transition de 0,4 secondes. L'animation est gérée entièrement par CSS.",
        "box-shadow coloré donne l'aura autour des combattants. Une ligne de CSS, un effet visuel fort.",
    ],
    4: [  # JS_DATA 30s
        "Deux objets JavaScript stockent toutes les stats : HP, MP, attaque, défense.",
        "Accéder à hero.hp ou modifier monster.hp, c'est aussi simple que ça.",
    ],
    5: [  # JS_DISP 30s
        "updateHud recalcule le pourcentage de HP et l'applique directement en style.width.",
        "log crée un paragraphe HTML et l'injecte dans la div via appendChild.",
    ],
    6: [  # JS_FIGHT 35s
        "Math.random ajoute de la variance sur les dégâts. Chaque combat est différent.",
        "Math.max empêche les HP de passer sous zéro. Math.min empêche de dépasser le maximum.",
        "Même structure pour attack, heal et magic : calcul, log, mise à jour, tour du monstre.",
    ],
    7: [  # JS_AI 30s
        "monsterTurn riposte automatiquement après chaque action du joueur.",
        "checkEnd retourne true pour stopper la chaîne. Victoire ou défaite, le jeu s'arrête proprement.",
    ],
    8: [  # DEMO 80s
        "Voilà le jeu en action. Les barres de vie descendent en temps réel à chaque coup.",
        "Chaque bouton déclenche le cycle complet : calcul, journal, mise à jour, riposte du monstre.",
        "Victoire après plusieurs échanges. Le code fonctionne exactement comme prévu.",
    ],
    9: [  # AMELI1 35s
        "Première amélioration : le feedback visuel. Les keyframes CSS font vibrer la carte touchée.",
        "void el.offsetWidth force le reflow CSS pour relancer l'animation même si elle est déjà active.",
    ],
    10: [  # AMELI2 35s
        "Deuxième amélioration : plusieurs ennemis. Un tableau stocke Goblin, Orc et Dragon dans l'ordre.",
        "nextEnemy retire le premier de la file et charge le suivant. Aucun autre code ne change.",
    ],
    11: [  # AMELI3 35s
        "Troisième amélioration : l'expérience et le level-up.",
        "Chaque victoire donne des XP. Quand le seuil est atteint, les stats progressent automatiquement.",
    ],
    12: [  # OUTRO 35s
        "Tu maîtrises maintenant HTML, CSS et JavaScript appliqués à un vrai jeu.",
        "Structure, style, logique, animations, multi-ennemis, progression. Tout est là.",
        "Lance ton éditeur et commence. Les trois fichiers. C'est tout ce qu'il faut.",
    ],
}

PREFIX = "rpg_v2_narration"

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
    return os.system(f'ffmpeg -y -i "{wav_path}" -codec:a libmp3lame -qscale:a 2 "{mp3_path}" -loglevel quiet') == 0


def _worker(item):
    scene_num, lines = item
    t0 = time.time()
    silence = np.zeros(int(SAMPLE_RATE * 0.28))
    chunks = []
    for i, line in enumerate(lines):
        parts = [audio for _, _, audio in _pipeline(line, voice=VOICE, speed=SPEED)]
        if parts:
            chunks.append(np.concatenate(parts))
        if i < len(lines) - 1:
            chunks.append(silence)
    if not chunks:
        return f"[scene {scene_num}] ERROR no audio"
    audio    = np.concatenate(chunks).astype(np.float32)
    wav_path = os.path.join(OUTPUT_DIR, f"{PREFIX}{scene_num}.wav")
    mp3_path = os.path.join(OUTPUT_DIR, f"{PREFIX}{scene_num}.mp3")
    sf.write(wav_path, audio, SAMPLE_RATE)
    if _to_mp3(wav_path, mp3_path):
        os.remove(wav_path)
        return f"[{PREFIX}{scene_num}.mp3] OK {os.path.getsize(mp3_path)//1024} KB ({time.time()-t0:.1f}s)"
    return f"[scene {scene_num}] WAV kept ({time.time()-t0:.1f}s)"


def main():
    _wrap_stdio()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating {len(SCENES)} narrations with voice {VOICE}…")
    with mp.Pool(processes=min(8, len(SCENES)), initializer=_init_worker) as pool:
        for r in pool.map(_worker, list(SCENES.items())):
            print(r)


if __name__ == "__main__":
    mp.freeze_support()
    main()
