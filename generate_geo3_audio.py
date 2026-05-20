"""
Génère les 15 narrations TTS pour GeoEspaceTerminal3 (15 min).
Voix : ff_siwis (Kokoro KPipeline), vitesse 1.05.
Output : motion-design-app/public/audio/geo3_narration{1-15}.mp3
"""
import os, multiprocessing
from kokoro import KPipeline

VOICE  = "ff_siwis"
SPEED  = 1.05
OUT    = "motion-design-app/public/audio"
PREFIX = "geo3_narration"

NARRATIONS = {
    1: (
        "Bienvenue dans la troisième partie du cours de géométrie dans l'espace. "
        "Niveau terminale avancé. "
        "Aujourd'hui on aborde les sujets qui tombent le plus souvent au bac spécialité : "
        "symétrie par rapport à un point et à un plan, distance d'un point à une droite, "
        "équation de plan par trois points, sections planes d'un cube, "
        "tétraèdre régulier, optimisation, barycentre et plan médiateur."
    ),
    2: (
        "La symétrie centrale par rapport à un point O. "
        "O doit être le milieu de A A prime. "
        "La formule est directe : A prime égale deux fois O moins A. "
        "En coordonnées : x prime vaut deux x zéro moins x A, et de même pour y et z. "
        "Si O est l'origine, A prime est l'opposé de A."
    ),
    3: (
        "Pour trouver le symétrique d'un point A par rapport à un plan pi, "
        "on projette A perpendiculairement sur le plan pour obtenir H, "
        "puis on continue d'autant de l'autre côté. "
        "On calcule t zéro en injectant la droite A plus t fois n dans l'équation du plan. "
        "A prime vaut A plus deux t zéro fois n."
    ),
    4: (
        "La distance d'un point P à une droite D. "
        "Le plus efficace : utiliser le produit vectoriel. "
        "d de P virgule D vaut la norme de AP vecteur produit vectoriel u vecteur, divisée par la norme de u. "
        "Sinon, on projette P sur D pour trouver le pied P étoile, et on calcule M P étoile."
    ),
    5: (
        "Trois points non alignés A, B, C déterminent un unique plan. "
        "On calcule AB vecteur et AC vecteur, "
        "puis le vecteur normal n vaut leur produit vectoriel. "
        "L'équation du plan est : n vecteur point AM vecteur égal zéro, "
        "ce qui développe en a fois x moins x A plus b fois y moins y A plus c fois z moins z A égal zéro."
    ),
    6: (
        "La section plane d'un cube par un plan. "
        "On cherche les intersections avec chaque arête ou son prolongement. "
        "Si le plan coupe les six faces deux à deux, on obtient un hexagone. "
        "Cas classique du bac : le plan x plus y plus z égal trois coupe le cube unité "
        "en un hexagone régulier passant par les six milieux d'arêtes."
    ),
    7: (
        "Le cube A B C D E F G H d'arête deux. "
        "Le plan x plus y plus z égal trois coupe les arêtes en six points : "
        "les milieux de DC, BC, BF, EF, EH et DH. "
        "L'hexagone obtenu est régulier : tous les côtés font racine de deux. "
        "Son aire est trois racine de trois."
    ),
    8: (
        "Le tétraèdre régulier a quatre faces triangulaires équilatérales identiques. "
        "Pour une arête a, la hauteur vaut a racine de six sur trois. "
        "Le volume vaut a cube fois racine de deux sur douze. "
        "Le centre G est l'isobarycentre des quatre sommets : G égal la moyenne de A, B, C, D. "
        "Il se situe au quart de la hauteur depuis la base."
    ),
    9: (
        "Optimisation : trouver le point P étoile de la droite D le plus proche d'un point M. "
        "On paramétrise la droite : P de t vaut A plus t fois u vecteur. "
        "On minimise M P de t au carré par rapport à t. "
        "La dérivée donne t étoile égal AM vecteur point u vecteur, divisé par la norme de u au carré. "
        "La distance minimale est la norme de M P étoile."
    ),
    10: (
        "Le barycentre de points avec des poids. "
        "G barycentre de A alpha, B bêta, C gamma vérifie : "
        "alpha fois GA vecteur plus bêta fois GB vecteur plus gamma fois GC vecteur égal zéro vecteur. "
        "En pratique, O G vecteur est la moyenne pondérée des vecteurs positions. "
        "L'isobarycentre de A, B, C, D pour un tétraèdre est le quart de la somme des quatre vecteurs."
    ),
    11: (
        "Le plan médiateur d'un segment AB. "
        "Son vecteur normal est AB vecteur, et il passe par le milieu I de AB. "
        "Propriété fondamentale : M appartient au plan médiateur si et seulement si MA égale MB. "
        "L'équation s'obtient en développant MA carré égal MB carré : "
        "on obtient une équation linéaire en x, y, z."
    ),
    12: (
        "Les lieux géométriques en trois dimensions. "
        "L'ensemble des points équidistants de A et B est le plan médiateur. "
        "L'ensemble des points à distance r de A est la sphère de centre A et rayon r. "
        "L'ensemble des points à distance r d'une droite D est un cylindre de rayon r d'axe D. "
        "L'intersection d'une sphère et d'un plan donne un cercle si la distance est inférieure au rayon."
    ),
    13: (
        "Problème type bac sur le tétraèdre régulier ABCD d'arête deux. "
        "Les coordonnées sont : A zéro zéro zéro, B deux zéro zéro, C un racine de trois zéro, "
        "D un racine de trois sur trois deux racine de six sur trois. "
        "La hauteur depuis D vaut deux racine de six sur trois, environ 1.63. "
        "Le volume est deux racine de deux sur trois, environ 0.94. "
        "Le centre G a pour coordonnées un, racine de trois sur trois, racine de six sur six."
    ),
    14: (
        "Récapitulatif des méthodes types bac. "
        "Pour l'équation d'un plan : un point plus le vecteur normal, ou trois points avec le produit vectoriel. "
        "Pour le symétrique par rapport à un plan : droite perpendiculaire, trouver H, A prime vaut deux H moins A. "
        "Pour la section d'un solide : intersection arête par arête, puis relier les points. "
        "Pour l'optimisation sur une droite : paramétriser, minimiser en dérivant, calculer le pied."
    ),
    15: (
        "Félicitations ! Tu maîtrises maintenant les outils avancés de géométrie dans l'espace au niveau terminale. "
        "Symétrie par rapport à un point et à un plan, distance d'un point à une droite, "
        "plan par trois points, sections planes, tétraèdre régulier, optimisation, barycentre et plan médiateur. "
        "Tu as tout ce qu'il faut pour aborder les exercices de géométrie dans l'espace au baccalauréat. "
        "Bonne révision et bon courage !"
    ),
}


def generate_one(args):
    idx, text = args
    out_path = os.path.join(OUT, f"{PREFIX}{idx}.mp3")
    os.makedirs(OUT, exist_ok=True)

    if os.path.exists(out_path):
        print(f"[skip] {PREFIX}{idx}.mp3 already exists")
        return

    try:
        import soundfile as sf
        import numpy as np

        pipeline = KPipeline(lang_code="f")
        chunks = []
        for _, _, audio in pipeline(text, voice=VOICE, speed=SPEED, split_pattern=r"\n+"):
            chunks.append(audio)

        if not chunks:
            print(f"[SKIP] {PREFIX}{idx}.mp3 — aucun audio")
            return

        combined = np.concatenate(chunks)
        wav_path = out_path.replace(".mp3", ".wav")
        sf.write(wav_path, combined, 24000)
        os.system(f'ffmpeg -y -i "{wav_path}" -b:a 192k "{out_path}"')
        os.remove(wav_path)
        print(f"[ok]   {PREFIX}{idx}.mp3")
    except Exception as e:
        print(f"[ERR]  narration {idx}: {e}")


if __name__ == "__main__":
    tasks = list(NARRATIONS.items())
    with multiprocessing.Pool(processes=min(8, len(tasks))) as pool:
        pool.map(generate_one, tasks)
    print("Toutes les narrations geo3 générées dans", OUT)
