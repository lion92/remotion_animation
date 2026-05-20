"""
Génère les 12 narrations TTS pour JavaRpgTutoriel2.
Voix : ff_siwis (Kokoro KPipeline), vitesse 1.05, 8 workers en parallèle.
Output : motion-design-app/public/audio/java2_narration{1-12}.mp3
"""
import os, multiprocessing
from kokoro import KPipeline

VOICE  = "ff_siwis"
SPEED  = 1.05
OUT    = "motion-design-app/public/audio"
PREFIX = "java2_narration"

NARRATIONS = {
    1: (
        "Bienvenue dans la suite du cours Java. "
        "Aujourd'hui on monte de niveau : interfaces, classes abstraites, "
        "polymorphisme, exceptions personnalisées, streams et generics. "
        "Le tout appliqué à notre Mini RPG, niveau terminale baccalauréat."
    ),
    2: (
        "Une interface est un contrat en Java. "
        "Toute classe qui l'implémente doit fournir les méthodes définies. "
        "La classe abstraite AbstractCharacter regroupe le code commun "
        "à Hero et Monster, sans qu'on puisse l'instancier directement."
    ),
    3: (
        "Le polymorphisme, c'est la capacité à traiter Hero et Monster "
        "de façon identique via leur type commun Entity. "
        "BattleArena stocke une List d'Entity et parcourt tous les participants "
        "dans une seule boucle, sans savoir si c'est un héros ou un monstre."
    ),
    4: (
        "Les exceptions personnalisées donnent du sens aux erreurs. "
        "InvalidActionException étend Exception : c'est une exception vérifiée, "
        "le compilateur force le try-catch. "
        "DeadCharacterException étend RuntimeException pour les bugs impossibles."
    ),
    5: (
        "HashMap donne accès à n'importe quel item en temps constant. "
        "La méthode merge additionne les quantités si la clé existe déjà. "
        "TreeMap trie ses clés automatiquement, "
        "ce qui est parfait pour un classement ordonné des scores."
    ),
    6: (
        "Les Streams Java 8 permettent d'écrire du code déclaratif. "
        "filter garde les monstres vivants, mapToInt extrait l'attaque, "
        "sum calcule le total. "
        "Collectors.joining enchaîne les noms avec une virgule en une ligne."
    ),
    7: (
        "Les Generics permettent d'écrire du code qui fonctionne pour n'importe quel type. "
        "GameRepository T stocke des Hero, des Monster ou des Item "
        "avec le même code, vérifié par le compilateur à la compilation. "
        "Optional évite le NullPointerException en forçant à gérer le cas vide."
    ),
    8: (
        "Voici la BattleArena en action. "
        "Hero, Goblin et Dragon sont tous des Entity. "
        "stream filtre compte les vivants en temps réel. "
        "Quand le joueur saisit un choix invalide, "
        "l'InvalidActionException est capturée proprement et le jeu continue."
    ),
    9: (
        "Le pattern Observer découple les acteurs du jeu. "
        "CombatLog émet des événements à tous ses abonnés. "
        "ConsoleLogger, AchievementTracker et SoundManager réagissent "
        "chacun à leur façon sans se connaître mutuellement."
    ),
    10: (
        "Les enums Java peuvent avoir des attributs et des méthodes. "
        "MonsterType.DRAGON regroupe le nom, l'emoji et les stats du dragon. "
        "La méthode spawn crée le monstre avec les bonnes valeurs. "
        "Plus de constantes magiques dispersées dans le code."
    ),
    11: (
        "Le pattern Stratégie permet d'injecter un comportement à la volée. "
        "AIStrategy est une interface fonctionnelle avec une seule méthode. "
        "BERSERKER, CAUTIOUS et AGGRESSIVE sont des lambdas, "
        "pas des sous-classes. On change l'IA d'un monstre en une ligne."
    ),
    12: (
        "Félicitations. Tu maîtrises maintenant les six piliers du Java avancé : "
        "interfaces, polymorphisme, exceptions, collections, streams et generics. "
        "Avec les trois patterns observer, enum et stratégie, "
        "tu as tout ce qu'il faut pour le baccalauréat NSI. "
        "Ouvre IntelliJ et implémente Entity dans ton propre RPG !"
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
    print("Toutes les narrations java2 générées dans", OUT)
