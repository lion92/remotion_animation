"""
Narrations ParisChercheur — voix française Kokoro ff_siwis.
Léa, 19 ans, arrive à Paris pour devenir chercheuse.
6 scènes × 50 secondes = 5 minutes.
"""
import os, multiprocessing
from kokoro import KPipeline

VOICE  = "ff_siwis"
SPEED  = 0.90          # légèrement posé, émotionnel
OUT    = "motion-design-app/public/audio"
PREFIX = "paris_narration"

NARRATIONS = {
    1: (
        "Léa a dix-neuf ans. "
        "Originaire d'un petit village breton, elle a quitté sa famille avant l'aube. "
        "Dans son sac : quelques vêtements froissés, ses cahiers de sciences, et un rêve immense. "
        "Le TGV ralentit. "
        "À travers la vitre embuée, les premiers toits de Paris apparaissent, "
        "dorés par la lumière hésitante du matin. "
        "Les pigeons s'envolent sur le quai numéro sept. "
        "Le train s'immobilise dans un souffle de vapeur. "
        "Léa ramasse sa valise, prend une grande inspiration, "
        "et pose le pied sur le sol de la Gare du Nord. "
        "Elle est arrivée."
    ),
    2: (
        "En sortant de la gare, Léa s'immobilise net. "
        "La Tour Eiffel se dessine à l'horizon, baignée d'une lumière dorée et matinale. "
        "Elle n'avait jamais vu Paris autrement qu'en photographie. "
        "La réalité est plus grande, plus belle, plus vertigineuse. "
        "Les platanes du boulevard bruissent doucement. "
        "La Seine scintille au loin. "
        "Paris, capitale mondiale de la recherche scientifique, s'éveille lentement. "
        "Plus de quarante mille chercheurs sillonnent ces rues chaque jour. "
        "Des prix Nobel ont marché sur ces trottoirs. "
        "Léa serre sa valise. "
        "Son cœur bat fort. "
        "L'aventure commence vraiment."
    ),
    3: (
        "La Sorbonne. "
        "Fondée en douze cent cinquante-sept. "
        "Des siècles de savoir accumulés entre ces murs de pierre calcaire. "
        "Léa s'avance sur la place. "
        "Les colonnes massives, les hautes fenêtres en ogive, le dôme majestueux... "
        "Elle se sent minuscule, et pourtant, étrangement à sa place. "
        "Sur un tableau d'affichage, à gauche de la grande arche, une feuille blanche. "
        "Elle s'approche. Elle lit. "
        "Recrutement doctorat. Sciences des matériaux. "
        "Laboratoire CNRS. Financement garanti sur trois ans. "
        "Elle relit la phrase une deuxième fois. Une troisième. "
        "Son cœur s'emballe. "
        "C'est exactement ce pour quoi elle est venue."
    ),
    4: (
        "Le lendemain matin, un jeune chercheur de l'équipe l'invite à visiter son laboratoire. "
        "Les néons blancs du plafond baignent tout d'une lumière froide et précise. "
        "Sur les grands tableaux noirs, des équations s'enchaînent : "
        "énergie, masse, vitesse de la lumière... "
        "Des machines ronronnent doucement, analysent, mesurent, enregistrent. "
        "Des flacons colorés s'alignent en rang d'oignon sur les paillasses. "
        "Le chercheur s'approche d'elle et lui tend l'oculaire d'un microscope. "
        "Elle ferme un œil. "
        "Elle regarde. "
        "Et dans le cercle lumineux, des cellules vivantes se divisent, lentement, majestueusement. "
        "Elle voit la vie à l'échelle du vivant. "
        "Pour la première fois. "
        "Ça lui coupe le souffle."
    ),
    5: (
        "Cette nuit-là, Léa ne dort pas vraiment. "
        "Elle rêve. "
        "Des molécules dansent autour d'elle en spirale. "
        "Des hélices d'ADN s'enroulent et se déroulent comme des galaxies. "
        "Les équations qu'elle a vues sur les tableaux brillent comme des étoiles. "
        "Elle voit les forces invisibles qui maintiennent la matière ensemble. "
        "Elle voit les liens entre les atomes, la danse des électrons, "
        "les secrets que la science tente de déchiffrer depuis des siècles. "
        "Dans ce rêve lumineux, elle n'est plus étudiante. "
        "Elle est chercheuse. "
        "Elle tient dans ses mains les clés du monde. "
        "Elle murmure dans son sommeil : "
        "je vais y arriver."
    ),
    6: (
        "Paris, la nuit. "
        "La Tour Eiffel scintille de mille feux dorés, son faisceau tournant balaie le ciel. "
        "Léa est assise sur un banc du quai de la Seine. "
        "L'eau noire reflète les lumières de la ville. "
        "Elle ouvre son ordinateur. "
        "L'écran s'allume dans la nuit. "
        "Elle commence à taper sa lettre de motivation. "
        "Les mots viennent, précis, sincères, déterminés. "
        "Ses mains ne tremblent plus. "
        "Elle sait ce qu'elle veut. "
        "Elle sait qu'elle en est capable. "
        "Demain matin, elle soumettra sa candidature au laboratoire CNRS. "
        "Car Léa sera chercheuse. "
        "Et Paris, cette nuit, le sait déjà."
    ),
}


def generate_one(args):
    idx, text = args
    out_path = os.path.join(OUT, f"{PREFIX}{idx}.mp3")
    os.makedirs(OUT, exist_ok=True)

    try:
        import soundfile as sf
        import numpy as np

        pipeline = KPipeline(lang_code="f")
        chunks = []
        for _, _, audio in pipeline(text, voice=VOICE, speed=SPEED, split_pattern=r"\n+"):
            chunks.append(audio)

        if not chunks:
            print(f"[SKIP] {PREFIX}{idx}.mp3 — aucun audio généré")
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
    # 3 workers (narrations longues, on évite la surcharge)
    with multiprocessing.Pool(processes=3) as pool:
        pool.map(generate_one, tasks)
    print(f"\nNarrations Paris générées dans {OUT}/")
