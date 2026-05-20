"""
Génère les narrations TTS pour JavaRpgTutoriel via Kokoro.
Output : motion-design-app/public/audio/java_rpg_narration1..12.mp3
"""

import os
import multiprocessing
from kokoro import KPipeline

VOICE  = "ff_siwis"
SPEED  = 1.05
OUT    = "motion-design-app/public/audio"
PREFIX = "java_rpg_narration"

NARRATIONS = {
    1: (
        "Bienvenue dans ce tutoriel Java ! "
        "On va coder un mini RPG complet — héros, monstre, combat tour par tour — "
        "en utilisant les bases de la programmation orientée objet. "
        "Six fichiers, deux cents lignes, et un vrai jeu jouable en console."
    ),
    2: (
        "On commence par la classe Hero. "
        "Tous les attributs sont private : personne ne peut les modifier directement depuis l'extérieur. "
        "Le constructeur initialise toutes les stats, et chaque méthode a une seule responsabilité : "
        "heal soigne, takeDamage retire des PV, gainXp gère la progression."
    ),
    3: (
        "La classe Monster suit exactement le même patron. "
        "takeDamage retourne les dégâts réels après avoir soustrait la défense — "
        "Math.max de 1 garantit qu'on fait toujours au moins un dégât. "
        "Cette symétrie entre Hero et Monster est une signature de la POO bien faite."
    ),
    4: (
        "La classe Combat regroupe toute la logique de combat en méthodes statiques. "
        "Pas besoin de l'instancier : on appelle Combat.heroAttack directement. "
        "new Random avec nextInt ajoute une variance aléatoire — chaque combat est différent."
    ),
    5: (
        "GameMenu gère l'affichage et la saisie. "
        "Scanner System.in lit ce que le joueur tape au clavier. "
        "printf avec des spécificateurs de format rend l'affichage propre et aligné "
        "sans concaténer des dizaines de chaînes."
    ),
    6: (
        "Main assemble tout. "
        "La boucle while avec hero.isAlive ET monster.isAlive c'est la boucle de jeu entière. "
        "Le switch expression Java quatorze permet d'écrire chaque cas en une ligne. "
        "Après le choix du joueur, le monstre riposte automatiquement."
    ),
    7: (
        "La gestion de fin de combat se fait après la boucle. "
        "Si le héros est encore vivant : victoire, calcul des XP, et vérification du level-up. "
        "gainXp est appelé une seule fois et gère tout en interne — "
        "c'est l'encapsulation en action."
    ),
    8: (
        "Voici le jeu en action dans le terminal Java. "
        "On voit le héros attaquer, le Dragon riposter, puis une potion de soin. "
        "Les barres de HP se mettent à jour en temps réel. "
        "Un sort de magie décisif, et c'est la victoire !"
    ),
    9: (
        "Première amélioration : l'héritage. "
        "Le Mage étend Hero avec extends — il hérite automatiquement de toutes les méthodes. "
        "On surcharge gainXp avec Override pour lui faire gagner vingt pourcent de XP en plus. "
        "castFireball est une méthode exclusive, disponible seulement pour le Mage."
    ),
    10: (
        "Deuxième amélioration : l'inventaire. "
        "ArrayList de Item est générique et typé — impossible d'ajouter autre chose. "
        "items.remove retire et retourne l'objet d'un coup, ce qui le consomme. "
        "L'interface Item avec la méthode apply permet à chaque objet de définir son propre effet."
    ),
    11: (
        "Troisième amélioration : le donjon multi-ennemis. "
        "Queue de Monster garantit l'ordre FIFO — Goblin, Orc, Dragon. "
        "poll retire le premier élément sans exception si la file est vide. "
        "La difficulté monte naturellement sans toucher au code de combat existant."
    ),
    12: (
        "Tu as maintenant un mini RPG Java complet avec héritage, inventaire et donjon. "
        "Six fichiers, moins de deux cents lignes, et tous les fondamentaux de la POO. "
        "Lance IntelliJ, crée ton projet, et code ton propre RPG ! "
        "Like et abonne-toi pour la suite — on ajoutera des sorts, des armes et une interface graphique."
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
        sf.write(out_path.replace(".mp3", ".wav"), combined, 24000)
        os.system(f'ffmpeg -y -i "{out_path.replace(".mp3",".wav")}" -b:a 192k "{out_path}"')
        os.remove(out_path.replace(".mp3", ".wav"))
        print(f"[OK] {PREFIX}{idx}.mp3")
    else:
        print(f"[SKIP] {PREFIX}{idx}.mp3 — aucun audio généré")


if __name__ == "__main__":
    tasks = list(NARRATIONS.items())
    with multiprocessing.Pool(processes=min(8, len(tasks))) as pool:
        pool.map(generate_one, tasks)
    print("Toutes les narrations générées dans", OUT)
