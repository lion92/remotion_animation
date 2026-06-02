"""
Narrations GeoEspaceTerminal3 — version pédagogique complète.
Voix ff_siwis, vitesse 0.92 (plus posée, accessible à tous).
"""
import os, multiprocessing
from kokoro import KPipeline

VOICE  = "ff_siwis"
SPEED  = 0.92          # plus lent = plus compréhensible
OUT    = "motion-design-app/public/audio"
PREFIX = "geo3_narration"

NARRATIONS = {
    1: (
        "Bonjour à tous et bienvenue dans ce cours de géométrie dans l'espace, niveau terminale. "
        "Ce cours est la suite directe des deux premières parties. "
        "Aujourd'hui on va aborder ensemble les thèmes les plus difficiles, "
        "ceux qui tombent le plus souvent à l'examen du baccalauréat. "
        "On va voir : comment trouver le symétrique d'un point par rapport à un autre point, "
        "puis par rapport à un plan. "
        "Comment calculer la distance d'un point à une droite. "
        "Comment écrire l'équation d'un plan qui passe par trois points. "
        "Comment couper un cube avec un plan pour obtenir une section. "
        "Et enfin les propriétés du tétraèdre régulier, le barycentre, et le plan médiateur. "
        "Prenez de quoi noter, on y va progressivement, étape par étape."
    ),
    2: (
        "Commençons par la symétrie centrale, c'est-à-dire le symétrique d'un point A "
        "par rapport à un centre O. "
        "L'idée est simple : O doit être exactement le milieu du segment reliant A à son symétrique A prime. "
        "La formule se déduit directement de la définition du milieu. "
        "Si O est le milieu de A A prime, alors les coordonnées de O sont la moyenne de celles de A et A prime. "
        "On en tire : A prime vaut deux fois O, moins A. "
        "Concrètement, pour chaque coordonnée, x prime vaut deux x zéro moins x A, "
        "y prime vaut deux y zéro moins y A, et z prime vaut deux z zéro moins z A. "
        "Prenons un exemple. Si A a pour coordonnées trois, un, quatre, "
        "et O a pour coordonnées deux, trois, un, "
        "alors A prime a pour coordonnées deux fois deux moins trois, soit un, "
        "deux fois trois moins un, soit cinq, "
        "et deux fois un moins quatre, soit moins deux. "
        "A prime est donc le point de coordonnées un, cinq, moins deux. "
        "Vérification rapide : le milieu de A A prime doit bien être O. "
        "Milieu de x : trois plus un sur deux égal deux. Milieu de y : un plus cinq sur deux égal trois. "
        "Milieu de z : quatre plus moins deux sur deux égal un. C'est bien O. "
        "Cas particulier important : si O est l'origine du repère, "
        "alors A prime a pour coordonnées l'opposé de A, c'est-à-dire moins x A, moins y A, moins z A."
    ),
    3: (
        "Voyons maintenant la symétrie par rapport à un plan. "
        "C'est plus complexe, mais la méthode est toujours la même. "
        "On se donne un plan pi d'équation a x plus b y plus c z plus d égal zéro, "
        "et un vecteur normal n de coordonnées a, b, c. "
        "Pour trouver le symétrique A prime du point A par rapport à ce plan, "
        "on procède en trois étapes. "
        "Étape un : on part du point A et on trace la droite perpendiculaire au plan. "
        "Cette droite a pour représentation paramétrique : x égal x A plus t fois a, "
        "y égal y A plus t fois b, z égal z A plus t fois c. "
        "Le paramètre t est ce qu'on cherche à calculer. "
        "Étape deux : on trouve le pied de perpendiculaire H, c'est-à-dire le point d'intersection "
        "de cette droite avec le plan. "
        "Pour cela, on injecte les expressions de x, y et z dans l'équation du plan. "
        "On obtient une équation du premier degré en t, qu'on résout facilement. "
        "La valeur obtenue est t zéro, et elle vaut moins le résultat de a x A plus b y A plus c z A plus d, "
        "divisé par a carré plus b carré plus c carré. "
        "Étape trois : le symétrique A prime se trouve de l'autre côté de H, à la même distance. "
        "Puisque H est le milieu de A A prime, on a A prime égal deux fois H moins A, "
        "ce qui s'écrit aussi A prime égal A plus deux fois t zéro fois n vecteur. "
        "Retenez bien cette formule : A prime égal A plus deux t zéro n."
    ),
    4: (
        "Calculons maintenant la distance d'un point P à une droite D dans l'espace. "
        "La droite D passe par un point A et a pour vecteur directeur u vecteur. "
        "Il y a deux méthodes, et les deux sont valables au baccalauréat. "
        "Première méthode : trouver le pied de perpendiculaire. "
        "On cherche le point P étoile de la droite D tel que le segment P P étoile "
        "soit perpendiculaire à la droite. "
        "Pour cela, on paramétrise D : tout point de D s'écrit A plus t fois u vecteur. "
        "On veut que le vecteur P P étoile soit orthogonal à u vecteur. "
        "La condition d'orthogonalité donne : P P étoile vecteur point u vecteur égal zéro. "
        "On développe et on résout en t. "
        "La valeur t étoile est égale au produit scalaire de A P vecteur par u vecteur, "
        "divisé par la norme de u au carré. "
        "P étoile est le point de D correspondant à ce t étoile. "
        "La distance cherchée est alors la longueur du segment P P étoile. "
        "Deuxième méthode, plus directe avec le produit vectoriel : "
        "la distance vaut la norme du produit vectoriel de A P vecteur par u vecteur, "
        "divisée par la norme de u. "
        "Le produit vectoriel donne directement la distance sans passer par le pied. "
        "Cette formule est très efficace pour les calculs rapides. "
        "Remarque importante : si P est sur la droite D, "
        "le vecteur A P est colinéaire à u, donc le produit vectoriel est nul, et la distance est bien zéro."
    ),
    5: (
        "Passons à une technique fondamentale : trouver l'équation d'un plan "
        "qui passe par trois points donnés. "
        "Trois points non alignés déterminent un unique plan. "
        "La méthode utilise le produit vectoriel pour trouver le vecteur normal. "
        "On note les trois points A, B et C, avec leurs coordonnées. "
        "Étape un : on calcule les vecteurs A B et A C. "
        "A B vecteur, c'est B moins A, coordonnée par coordonnée. "
        "A C vecteur, c'est C moins A, de la même façon. "
        "Étape deux : le vecteur normal n vecteur au plan est le produit vectoriel de A B par A C. "
        "Pour un rappel, le produit vectoriel de deux vecteurs u et v de coordonnées u1 u2 u3 et v1 v2 v3 "
        "donne le vecteur de coordonnées u2 v3 moins u3 v2, u3 v1 moins u1 v3, u1 v2 moins u2 v1. "
        "Ce vecteur n est perpendiculaire au plan qui contient A, B et C. "
        "Étape trois : on écrit l'équation du plan. "
        "Le plan passe par A et a pour vecteur normal n de coordonnées a, b, c. "
        "Son équation est : a fois x moins x A, plus b fois y moins y A, plus c fois z moins z A, égal zéro. "
        "On développe et on simplifie pour obtenir la forme ax plus by plus cz plus d égal zéro. "
        "Exemple : A vaut deux zéro zéro, B vaut zéro deux zéro, C vaut zéro zéro deux. "
        "On trouve n vecteur égal un un un, et l'équation du plan est x plus y plus z égal deux. "
        "Vérification : en remplaçant les coordonnées de A, B et C, on obtient bien deux dans chaque cas."
    ),
    6: (
        "Intéressons-nous maintenant aux sections planes d'un solide. "
        "L'idée est de couper un solide, par exemple un cube, avec un plan, "
        "et de déterminer la forme de la coupe. "
        "La méthode générale est la suivante. "
        "On examine chaque arête du solide une par une. "
        "Pour chaque arête, on paramétrise le segment correspondant "
        "et on cherche si le plan coupe cette arête en un point. "
        "On relie ensuite tous les points trouvés pour obtenir la section. "
        "Étudions le cas classique du baccalauréat : le cube ABCDEFGH d'arête deux, "
        "coupé par le plan d'équation x plus y plus z égal trois. "
        "Ce plan coupe exactement six arêtes du cube. "
        "Sur chaque arête coupée, le point d'intersection est le milieu de cette arête. "
        "En effet, les six points trouvés sont : le milieu de DC, le milieu de BC, "
        "le milieu de BF, le milieu de EF, le milieu de EH, et le milieu de DH. "
        "Ces six points forment un hexagone. "
        "Pour vérifier que cet hexagone est régulier, on calcule la distance entre deux sommets consécutifs. "
        "Par exemple, la distance entre le milieu de DC et le milieu de BC vaut racine de deux. "
        "Tous les côtés font la même longueur racine de deux, et tous les angles sont égaux. "
        "L'hexagone est donc bien régulier. "
        "Son aire est trois racine de trois, car l'aire d'un hexagone régulier de côté c vaut "
        "trois racine de trois sur deux fois c au carré, et ici c vaut racine de deux."
    ),
    7: (
        "Voici le problème de démonstration complet sur le cube. "
        "On prend le cube ABCDEFGH d'arête deux, "
        "dont les sommets ont pour coordonnées : "
        "A zéro zéro zéro, B deux zéro zéro, C deux deux zéro, D zéro deux zéro, "
        "E zéro zéro deux, F deux zéro deux, G deux deux deux, H zéro deux deux. "
        "Le plan de coupe a pour équation x plus y plus z égal trois. "
        "Première étape : on cherche les intersections avec chaque arête. "
        "Sur l'arête DC, qui relie D zéro deux zéro à C deux deux zéro, "
        "le point courant est D plus t fois D C vecteur, soit t fois deux zéro zéro. "
        "On injecte dans l'équation du plan : t fois deux plus deux plus zéro égal trois, "
        "ce qui donne t égal un demi, et le point est un deux zéro. C'est le milieu de DC. "
        "On répète ce calcul pour les cinq autres arêtes coupées. "
        "On trouve les six points : P1 un deux zéro, P2 deux un zéro, P3 deux zéro un, "
        "P4 un zéro deux, P5 zéro un deux, P6 zéro deux un. "
        "Deuxième étape : on vérifie que c'est un hexagone régulier. "
        "Calculons P1 P2 : distance entre un deux zéro et deux un zéro. "
        "Cela vaut racine de un plus un plus zéro, soit racine de deux. "
        "On vérifie que tous les côtés font racine de deux. "
        "Troisième étape : on calcule l'aire. "
        "Un hexagone régulier de côté c a une aire de trois racine de trois sur deux fois c au carré. "
        "Avec c égal racine de deux, on obtient trois racine de trois sur deux fois deux, "
        "ce qui donne trois racine de trois. "
        "Ce résultat vaut environ cinq virgule deux unités carrées."
    ),
    8: (
        "Parlons maintenant du tétraèdre régulier, un solide qui revient très souvent au baccalauréat. "
        "Un tétraèdre régulier est un solide à quatre faces, toutes triangulaires et équilatérales, "
        "et de même longueur pour les six arêtes. "
        "On note a la longueur commune des arêtes. "
        "Prenons des coordonnées concrètes pour un tétraèdre d'arête deux. "
        "On peut placer A en zéro zéro zéro, B en deux zéro zéro, "
        "C en un racine de trois zéro, et D en un un sur racine de trois deux racine de six sur trois. "
        "La face ABC est un triangle équilatéral dans le plan horizontal. "
        "D est le sommet placé au-dessus du centroïde de ABC. "
        "Comment calculer la hauteur du tétraèdre ? "
        "La hauteur h part du sommet D et tombe perpendiculairement sur la face de base ABC. "
        "Le pied de la hauteur est le centroïde G de ABC. "
        "Pour un tétraèdre régulier d'arête a, la hauteur vaut a fois racine de six, divisée par trois. "
        "Pour a égal deux, cela donne deux racine de six sur trois, soit environ un virgule soixante-trois. "
        "Le volume d'un tétraèdre régulier d'arête a vaut a cube fois racine de deux, divisé par douze. "
        "Pour a égal deux, le volume vaut huit racine de deux sur douze, "
        "ce qui simplifie en deux racine de deux sur trois, soit environ zéro virgule neuf quatre. "
        "Enfin, le centre de gravité G du tétraèdre est l'isobarycentre des quatre sommets, "
        "c'est-à-dire la moyenne de leurs coordonnées. "
        "G est situé au quart de la hauteur depuis la base, et aux trois quarts depuis le sommet."
    ),
    9: (
        "Voyons comment résoudre un problème d'optimisation : "
        "trouver le point d'une droite le plus proche d'un point donné. "
        "On se donne une droite D qui passe par un point A et a pour vecteur directeur u vecteur. "
        "On se donne aussi un point M extérieur à cette droite. "
        "On cherche le point P étoile de D tel que la distance M P étoile soit minimale. "
        "Méthode : on paramétrise tous les points de D sous la forme P de t égal A plus t fois u vecteur. "
        "On calcule M P de t au carré en fonction de t. "
        "C'est une fonction polynomiale du second degré en t, qui admet un minimum. "
        "On dérive par rapport à t et on annule la dérivée. "
        "Le calcul donne : t étoile est égal au produit scalaire de A M vecteur par u vecteur, "
        "divisé par la norme de u au carré. "
        "On injecte t étoile dans la paramétrisation pour obtenir P étoile. "
        "La distance minimale cherchée est la norme de M P étoile. "
        "Remarque : si la droite est un axe de coordonnées, "
        "le calcul se simplifie beaucoup, car les composantes du vecteur directeur "
        "sont très simples, et le produit scalaire aussi."
    ),
    10: (
        "Le barycentre, c'est en quelque sorte le centre de gravité d'un système de points avec des poids. "
        "Définition : G est le barycentre du système formé de A avec le poids alpha, "
        "B avec le poids bêta, et C avec le poids gamma, "
        "si et seulement si le vecteur alpha fois G A plus bêta fois G B plus gamma fois G C est nul. "
        "En pratique, on calcule G plus facilement avec la formule vectorielle : "
        "le vecteur O G est égal à alpha fois O A plus bêta fois O B plus gamma fois O C, "
        "le tout divisé par la somme alpha plus bêta plus gamma. "
        "En coordonnées, x de G vaut alpha x A plus bêta x B plus gamma x C, divisé par la somme des poids. "
        "Et de même pour y et z. "
        "Cas particulier très important : l'isobarycentre, c'est le barycentre avec des poids tous égaux. "
        "Pour trois points A, B, C, l'isobarycentre est G égal A plus B plus C, divisé par trois. "
        "Pour quatre points comme les sommets d'un tétraèdre, c'est la somme des quatre points divisée par quatre. "
        "Au baccalauréat, on utilise souvent le barycentre pour "
        "trouver le centre de gravité d'un solide ou démontrer qu'un point est bien placé sur un segment."
    ),
    11: (
        "Le plan médiateur d'un segment A B, c'est l'ensemble de tous les points de l'espace "
        "qui sont à égale distance de A et de B. "
        "C'est une généralisation en trois dimensions de la médiatrice d'un segment en deux dimensions. "
        "Ce plan a deux caractéristiques essentielles. "
        "Premièrement, son vecteur normal est le vecteur A B, "
        "parce que le plan médiateur est perpendiculaire au segment A B. "
        "Deuxièmement, il passe par le milieu I du segment A B, "
        "car le milieu est équidistant des deux extrémités. "
        "Pour trouver son équation, on peut partir de la condition M A égal M B. "
        "On élève au carré les deux membres : M A carré égal M B carré. "
        "On développe ces expressions avec les coordonnées, "
        "et les termes au carré se simplifient entre eux. "
        "Il reste une équation du premier degré en x, y et z : c'est l'équation du plan médiateur. "
        "Application au baccalauréat : si une sphère passe par quatre points, "
        "son centre est à l'intersection des plans médiateurs de tous les segments reliant ces points. "
        "C'est la méthode pour trouver le centre d'une sphère passant par plusieurs points."
    ),
    12: (
        "Voyons les principaux lieux géométriques que l'on rencontre dans l'espace. "
        "Un lieu géométrique, c'est l'ensemble de tous les points vérifiant une certaine condition. "
        "Premier lieu : l'ensemble des points équidistants de A et de B. "
        "Comme on vient de le voir, c'est le plan médiateur du segment A B. "
        "Si on écrit M A égal M B, on obtient l'équation d'un plan. "
        "Deuxième lieu : l'ensemble des points situés à une distance fixe r d'un point centre A. "
        "C'est la sphère de centre A et de rayon r. "
        "Son équation est x moins x A, le tout au carré, plus y moins y A au carré, "
        "plus z moins z A au carré, le tout égal r au carré. "
        "Troisième lieu : l'ensemble des points situés à une distance fixe r d'une droite D. "
        "C'est une surface cylindrique d'axe D et de rayon r. "
        "Lien important entre sphère et plan : si on coupe une sphère de centre A et rayon r "
        "par un plan situé à une distance d du centre, on obtient un cercle si d est strictement inférieur à r. "
        "Ce cercle a pour rayon racine de r carré moins d carré. "
        "Si d égal r, le plan est tangent à la sphère et l'intersection est un seul point. "
        "Si d est supérieur à r, le plan ne coupe pas la sphère."
    ),
    13: (
        "Résolvons maintenant un problème complet sur le tétraèdre régulier ABCD d'arête deux. "
        "Les coordonnées des sommets sont les suivantes. "
        "A est en zéro zéro zéro. B est en deux zéro zéro. "
        "C est en un virgule sept trois deux, zéro, soit un racine de trois zéro. "
        "D est en un, zéro virgule cinq sept sept, un virgule six trois trois, "
        "soit un, un sur racine de trois, deux racine de six sur trois. "
        "Question une : calculer la hauteur du tétraèdre depuis D. "
        "Le pied de la hauteur est le centroïde de ABC. "
        "On calcule G de ABC : x vaut zéro plus deux plus un sur trois, soit un. "
        "y vaut zéro plus zéro plus racine de trois sur trois, soit un sur racine de trois. "
        "z vaut zéro. Donc G de ABC est en un, un sur racine de trois, zéro. "
        "La hauteur est la distance de D à ce point. "
        "DG vaut racine de zéro carré plus zéro carré plus deux racine de six sur trois au carré. "
        "Ce qui donne deux racine de six sur trois, soit environ un virgule six trois. "
        "Question deux : calculer le volume. "
        "Le volume d'un tétraèdre vaut un tiers fois l'aire de la base fois la hauteur. "
        "L'aire de la base équilatérale de côté deux vaut deux fois racine de trois. "
        "Le volume est donc un tiers fois deux racine de trois fois deux racine de six sur trois. "
        "Ce qui simplifie en quatre racine de dix-huit sur neuf, soit deux racine de deux sur trois. "
        "Environ zéro virgule neuf quatre. "
        "Question trois : le centre de gravité G du tétraèdre. "
        "C'est l'isobarycentre des quatre sommets. "
        "x de G vaut zéro plus deux plus un plus un sur quatre, soit un. "
        "y de G vaut zéro plus zéro plus racine de trois plus un sur racine de trois sur quatre. "
        "Soit racine de trois sur trois. "
        "z de G vaut zéro plus zéro plus zéro plus deux racine de six sur trois, divisé par quatre. "
        "Soit racine de six sur six. "
        "G est donc à un quart de la hauteur depuis la base, et aux trois quarts depuis le sommet."
    ),
    14: (
        "Résumons les quatre méthodes types que vous devez maîtriser pour le baccalauréat. "
        "Méthode un : écrire l'équation d'un plan. "
        "Soit on vous donne un point et un vecteur normal : on applique directement la formule. "
        "Soit on vous donne trois points : on calcule deux vecteurs directeurs, "
        "puis leur produit vectoriel pour trouver le vecteur normal, et ensuite l'équation. "
        "Méthode deux : trouver le symétrique d'un point par rapport à un plan. "
        "On trace la droite perpendiculaire au plan passant par le point. "
        "On trouve le pied H en injectant dans l'équation du plan. "
        "On obtient le symétrique avec la formule A prime égal deux H moins A. "
        "Méthode trois : construire la section d'un solide par un plan. "
        "On examine arête par arête. Pour chaque arête, on paramétrise le segment "
        "et on injecte dans l'équation du plan pour trouver l'intersection. "
        "On relie les points trouvés pour tracer la section. "
        "Méthode quatre : résoudre un problème d'optimisation de distance à une droite. "
        "On paramétrise la droite. On exprime la distance au carré en fonction du paramètre. "
        "On dérive et on annule la dérivée pour trouver le paramètre optimal. "
        "On calcule le point optimal et la distance minimale. "
        "Ces quatre méthodes couvrent la grande majorité des exercices de géométrie du baccalauréat."
    ),
    15: (
        "Voilà, nous arrivons à la fin de ce cours de géométrie dans l'espace niveau terminale. "
        "Vous avez maintenant tous les outils pour aborder les exercices du baccalauréat avec confiance. "
        "Récapitulons ce que vous avez appris aujourd'hui. "
        "La symétrie centrale : A prime égal deux O moins A. "
        "La symétrie par rapport à un plan : on passe par le pied de perpendiculaire H, "
        "et A prime vaut A plus deux t zéro fois n. "
        "La distance d'un point à une droite : via la projection ou le produit vectoriel. "
        "L'équation d'un plan par trois points : via le produit vectoriel A B par A C. "
        "La section plane d'un cube : intersection arête par arête. "
        "Les propriétés du tétraèdre régulier : hauteur, volume et centre de gravité. "
        "L'optimisation de distance : paramétriser, dériver, résoudre. "
        "Le barycentre et l'isobarycentre en trois dimensions. "
        "Le plan médiateur et les lieux géométriques classiques. "
        "Pour progresser, exercez-vous sur des sujets de bac des années précédentes. "
        "Bonne révision, et bon courage pour votre examen !"
    ),
}


def generate_one(args):
    idx, text = args
    out_path = os.path.join(OUT, f"{PREFIX}{idx}.mp3")
    os.makedirs(OUT, exist_ok=True)

    # Toujours régénérer (narrations améliorées)
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
    # 4 workers pour éviter les surcharges mémoire sur les longues narrations
    with multiprocessing.Pool(processes=4) as pool:
        pool.map(generate_one, tasks)
    print("Toutes les narrations geo3 (version pédagogique) générées dans", OUT)
