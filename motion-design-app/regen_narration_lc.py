#!/usr/bin/env python3
"""
Regénère les narrations LC avec :
  - découpage phrase par phrase
  - trim des silences de fin de chunk
  - silence fixe et court entre phrases
→ résultat fluide sans interruptions
"""
import numpy as np
import soundfile as sf
from pathlib import Path
import warnings, logging
warnings.filterwarnings("ignore"); logging.getLogger().setLevel(logging.ERROR)
from kokoro import KPipeline

SR = 24000
OUT = Path("/root/remotion_animation/motion-design-app/public/audio")

pipe = KPipeline(lang_code='f')

def trim_silence(audio, threshold=0.005, margin_ms=30):
    """Retire le silence de fin, garde une marge courte."""
    margin = int(SR * margin_ms / 1000)
    energy = np.abs(audio)
    # dernier échantillon au-dessus du seuil
    nonsilent = np.where(energy > threshold)[0]
    if len(nonsilent) == 0:
        return audio
    end = min(nonsilent[-1] + margin, len(audio))
    return audio[:end]

def silence_ms(ms):
    return np.zeros(int(SR * ms / 1000), dtype=np.float32)

def generate_narration(key, sentences, speed=0.92):
    """Génère phrase par phrase, assemble avec silences propres."""
    print(f"  {key}…")
    chunks = []
    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue
        parts = []
        for _, _, audio in pipe(sent, voice='ff_siwis', speed=speed):
            a = audio.numpy() if hasattr(audio, 'numpy') else np.array(audio)
            parts.append(a.astype(np.float32))
        if not parts:
            continue
        chunk = np.concatenate(parts)
        chunk = trim_silence(chunk, threshold=0.004, margin_ms=25)
        chunks.append(chunk)
        chunks.append(silence_ms(110))   # 110ms entre phrases → naturel

    if not chunks:
        print(f"    ⚠ aucun audio pour {key}")
        return

    full = np.concatenate(chunks).astype(np.float32)
    # normalisation
    mx = np.max(np.abs(full))
    if mx > 1e-4:
        full = full / mx * 0.82
    out_path = OUT / f"{key}.wav"
    sf.write(out_path, full, SR)
    print(f"   → {key}.wav ({len(full)/SR:.1f}s)")

# ── Narrations découpées par phrases ────────────────────────────

NARRATIONS = {

"lc_intro": [
    "Bienvenue dans ce cours sur les listes chaînées en Java.",
    "Une liste chaînée est l'une des structures de données les plus importantes en informatique.",
    "Nous allons apprendre ensemble ce qu'elle est, comment la construire, comment la parcourir, y ajouter des éléments, et en supprimer.",
    "Ce cours est fait pour les débutants complets.",
    "Aucune connaissance préalable n'est nécessaire.",
],

"lc_analogie": [
    "Imaginez une chaîne de wagons de train.",
    "Chaque wagon contient une valeur, et sait où se trouve le wagon suivant.",
    "C'est exactement ce qu'est une liste chaînée : une suite d'éléments appelés nœuds, où chaque nœud pointe vers le suivant.",
    "Contrairement à un tableau, les éléments ne sont pas rangés côte à côte en mémoire.",
    "Ils peuvent être dispersés partout, reliés entre eux par des références que l'on appelle des flèches.",
    "Le gros avantage : la taille est dynamique.",
    "On peut ajouter ou retirer des éléments à volonté, sans avoir à tout recréer.",
    "L'inconvénient : pour accéder à un élément, il faut parcourir la liste depuis le début.",
],

"lc_node": [
    "En Java, chaque maillon de la liste est représenté par une classe que l'on appelle Node, c'est-à-dire nœud en anglais.",
    "Cette classe contient exactement deux choses.",
    "D'abord la donnée : c'est la valeur stockée dans ce nœud, par exemple un entier.",
    "Ensuite next : c'est une référence vers le nœud suivant.",
    "Si next vaut null, cela signifie qu'il n'y a pas de nœud suivant et que l'on est à la fin de la liste.",
    "La liste chaînée elle-même ne contient qu'un seul champ : head.",
    "Head est la référence vers le premier nœud, c'est-à-dire la tête de la liste.",
    "Si head vaut null, la liste est vide.",
],

"lc_creation": [
    "Construisons maintenant notre première liste chaînée avec la méthode addLast.",
    "Au départ, la liste est vide : head est égal à null.",
    "On appelle addLast de dix.",
    "La liste est vide, donc dix devient directement la tête.",
    "La liste contient maintenant un seul nœud : dix.",
    "On appelle ensuite addLast de vingt.",
    "Cette fois, la liste n'est pas vide.",
    "La méthode parcourt la liste jusqu'au dernier nœud avec current, puis lui accroche le nœud vingt.",
    "On appelle enfin addLast de trente.",
    "Le même processus se répète : current avance jusqu'au nœud vingt, et lui accroche trente.",
    "Notre liste est maintenant : dix, flèche, vingt, flèche, trente, null.",
],

"lc_traversal": [
    "Pour parcourir une liste chaînée, on utilise une boucle while.",
    "On crée une variable current qui démarre à head.",
    "À chaque itération, on lit la valeur de current.data et on l'affiche.",
    "Puis on avance en disant current égale current.next.",
    "On continue tant que current est différent de null.",
    "Quand current vaut null, on a atteint la fin de la liste et la boucle s'arrête.",
    "C'est comme marcher le long de la chaîne de wagons, wagon par wagon, jusqu'à la fin.",
    "Attention : on ne peut pas aller directement à un index comme dans un tableau.",
    "Il faut toujours partir du début et avancer pas à pas.",
],

"lc_insertion": [
    "Il existe deux façons principales d'insérer un élément dans une liste chaînée.",
    "La première, l'insertion en tête, est très rapide.",
    "On dit que c'est en temps constant, ou O de un.",
    "On crée un nouveau nœud, on lui assigne comme next l'actuelle tête de liste, puis on fait pointer head vers ce nouveau nœud.",
    "Le nouveau nœud devient instantanément le premier élément.",
    "Ici, addFirst de cinq insère cinq avant dix.",
    "La deuxième façon, l'insertion en fin, nécessite de parcourir toute la liste.",
    "On crée un nouveau nœud, on avance jusqu'au dernier nœud avec une boucle while, puis on accroche le nouveau nœud à la fin.",
    "Cette opération est en O de n, c'est-à-dire proportionnelle à la taille de la liste.",
    "Ici, addLast de quatre-vingt-dix-neuf accroche quatre-vingt-dix-neuf après trente.",
],

"lc_suppression": [
    "Pour supprimer un nœud, on distingue deux cas.",
    "Si le nœud à supprimer est la tête, c'est simple : on fait avancer head d'un cran.",
    "Sinon, il faut trouver le nœud qui se trouve juste avant celui que l'on veut supprimer.",
    "On parcourt la liste avec une boucle while.",
    "Quand on trouve le bon nœud précédent, on fait sauter le lien.",
    "current.next devient current.next.next.",
    "En faisant cela, on court-circuite le nœud à supprimer, qui n'est plus référencé par personne.",
    "Java gère automatiquement la mémoire grâce au Garbage Collector.",
    "Le nœud supprimé sera libéré de la mémoire sans que vous ayez à vous en occuper.",
],

}

print("🎤 Regénération narrations fluides (phrase par phrase)…\n")
for key, sentences in NARRATIONS.items():
    generate_narration(key, sentences)

print("\n✅ Terminé.")
for f in sorted(OUT.glob("lc_[a-z]*.wav")):
    print(f"  {f.name:<40} {f.stat().st_size/1024:>8.1f} KB  ({int(f.stat().st_size/SR/2):.0f}s aprox)")
