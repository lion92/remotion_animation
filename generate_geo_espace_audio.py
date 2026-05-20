"""
Génère les narrations TTS pour GeoEspaceTerminal via Kokoro.
Output : motion-design-app/public/audio/geo_narration1..12.mp3
"""

import os
import multiprocessing
from kokoro import KPipeline

VOICE  = "ff_siwis"
SPEED  = 1.05
OUT    = "motion-design-app/public/audio"
PREFIX = "geo_narration"

NARRATIONS = {
    1: (
        "Bienvenue dans ce cours de géométrie dans l'espace — niveau Terminale. "
        "On va voir le repère 3D, les vecteurs, les droites, les plans, "
        "et le produit scalaire en 3 dimensions. "
        "Le Prof. Martin, Léa et Lucas vous guideront à travers tous les outils du programme."
    ),
    2: (
        "Tout commence par le repère orthonormé de l'espace. "
        "Trois axes perpendiculaires : x, y et z. "
        "Un point M a trois coordonnées : M de x virgule y virgule z. "
        "La distance de l'origine O à M vaut la racine carrée de x carré plus y carré plus z carré."
    ),
    3: (
        "Un vecteur AB est défini par les coordonnées de B moins les coordonnées de A. "
        "Sa norme — sa longueur — se calcule avec la même formule que la distance. "
        "Deux vecteurs sont colinéaires s'il existe un réel k tel que u égale k fois v."
    ),
    4: (
        "Une droite dans l'espace est définie par un point A et un vecteur directeur u. "
        "Tout point M de la droite vérifie : OM vecteur égale OA vecteur plus t fois u vecteur, "
        "où t parcourt tous les réels. "
        "C'est la représentation paramétrique — trois équations, un paramètre t."
    ),
    5: (
        "Un plan est caractérisé par son équation cartésienne : ax plus by plus cz plus d égale zéro. "
        "Le vecteur n de coordonnées a, b, c est le vecteur normal — perpendiculaire au plan. "
        "Pour trouver l'équation d'un plan, on part d'un point du plan et de son vecteur normal."
    ),
    6: (
        "Deux plans sont parallèles si leurs vecteurs normaux sont colinéaires. "
        "Une droite est perpendiculaire à un plan si son vecteur directeur est parallèle au vecteur normal. "
        "Et deux vecteurs sont orthogonaux si leur produit scalaire vaut zéro."
    ),
    7: (
        "Le produit scalaire de u et v vaut x1 fois x2 plus y1 fois y2 plus z1 fois z2. "
        "On s'en sert pour calculer des angles : cosinus de thêta égale le produit scalaire "
        "divisé par le produit des normes. "
        "Si le produit scalaire vaut zéro, les deux vecteurs sont orthogonaux."
    ),
    8: (
        "Voici un problème complet sur la pyramide SABCD à base carrée. "
        "On calcule d'abord la hauteur SI, puis l'angle SAB avec le produit scalaire, "
        "et enfin le volume : un tiers de l'aire de la base fois la hauteur. "
        "La hauteur vaut 5, l'angle environ 110 degrés, et le volume environ 26 virgule 7 unités cubes."
    ),
    9: (
        "La sphère de centre Oméga et de rayon r a pour équation : "
        "x moins a au carré plus y moins b au carré plus z moins c au carré égale r carré. "
        "Pour tester si un point appartient à la sphère, on calcule sa distance au centre "
        "et on vérifie qu'elle vaut r."
    ),
    10: (
        "Le produit vectoriel de u et v donne un nouveau vecteur perpendiculaire aux deux. "
        "Sa norme est égale à l'aire du parallélogramme formé par u et v. "
        "C'est l'outil idéal pour trouver un vecteur normal à un plan "
        "quand on connaît deux vecteurs de ce plan."
    ),
    11: (
        "Un tétraèdre régulier a quatre faces triangulaires équilatérales. "
        "Si a est la longueur de l'arête, le volume vaut a cube fois racine de 2 sur 12. "
        "La hauteur vaut a fois racine de deux tiers. "
        "L'angle dièdre entre deux faces est d'environ 70 degrés et demi."
    ),
    12: (
        "Tu maîtrises maintenant tous les outils de la géométrie dans l'espace au niveau Terminale. "
        "Repère 3D, vecteurs, droites paramétriques, plans cartésiens, produit scalaire et produit vectoriel. "
        "Entraîne-toi sur des exercices de bac — les pyramides, les sphères et les angles sont les plus fréquents. "
        "Bonne chance pour ton bac de maths !"
    ),
}


def generate_one(args):
    idx, text = args
    pipeline = KPipeline(lang_code="f")
    out_path  = os.path.join(OUT, f"{PREFIX}{idx}.mp3")
    os.makedirs(OUT, exist_ok=True)

    generator = pipeline(text, voice=VOICE, speed=SPEED, split_pattern=r"\n+")
    import soundfile as sf
    import numpy as np
    chunks = []
    for _, _, audio in generator:
        chunks.append(audio)
    if chunks:
        combined = np.concatenate(chunks)
        wav_path = out_path.replace(".mp3", ".wav")
        sf.write(wav_path, combined, 24000)
        os.system(f'ffmpeg -y -i "{wav_path}" -b:a 192k "{out_path}"')
        os.remove(wav_path)
        print(f"[OK] {PREFIX}{idx}.mp3")
    else:
        print(f"[SKIP] {PREFIX}{idx}.mp3 — aucun audio généré")


if __name__ == "__main__":
    tasks = list(NARRATIONS.items())
    with multiprocessing.Pool(processes=min(8, len(tasks))) as pool:
        pool.map(generate_one, tasks)
    print("Toutes les narrations générées dans", OUT)
