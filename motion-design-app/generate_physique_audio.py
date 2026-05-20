#!/usr/bin/env python3
"""
Génère toute l'audio pour PhysiqueTerminale.jsx :
  - Narration Kokoro ff_siwis (français suisse) par scène
  - Bruitages (whoosh, craie, pop, ressort, circuit, photon, tick)
  - Musique de fond originale libre de droits (algo)
"""
import numpy as np
import soundfile as sf
import scipy.signal as sig
from pathlib import Path

OUT = Path("/root/remotion_animation/motion-design-app/public/audio")
OUT.mkdir(parents=True, exist_ok=True)
SR = 24000  # kokoro native sample rate

# ─────────────────────────────────────────────────────────────────────────────
# MUSIQUE DE FOND (libre de droits, générée algorithmiquement)
# ─────────────────────────────────────────────────────────────────────────────

def note_freq(name):
    notes = {"C":261.63,"D":293.66,"E":329.63,"F":349.23,"G":392.00,
             "A":440.00,"B":493.88,"c":523.25,"d":587.33,"e":659.25,
             "f":698.46,"g":783.99,"a":880.00}
    return notes.get(name, 440.0)

def piano_tone(freq, dur, sr=SR, amp=0.35):
    t = np.linspace(0, dur, int(sr*dur), endpoint=False)
    # fondamentale + harmoniques avec décroissance
    wave = (amp * np.sin(2*np.pi*freq*t) * np.exp(-2.0*t)
          + amp*0.5 * np.sin(2*np.pi*freq*2*t) * np.exp(-3.5*t)
          + amp*0.25 * np.sin(2*np.pi*freq*3*t) * np.exp(-5.0*t)
          + amp*0.12 * np.sin(2*np.pi*freq*4*t) * np.exp(-7.0*t))
    # attaque rapide
    attack = int(sr*0.008)
    wave[:attack] *= np.linspace(0,1,attack)
    return wave.astype(np.float32)

def bass_tone(freq, dur, sr=SR, amp=0.25):
    t = np.linspace(0, dur, int(sr*dur), endpoint=False)
    wave = (amp * np.sin(2*np.pi*freq*t) * np.exp(-1.2*t)
          + amp*0.3 * np.sin(2*np.pi*freq*2*t) * np.exp(-2.5*t))
    attack = int(sr*0.01)
    wave[:attack] *= np.linspace(0,1,attack)
    return wave.astype(np.float32)

def pad_tone(freqs, dur, sr=SR, amp=0.12):
    t = np.linspace(0, dur, int(sr*dur), endpoint=False)
    wave = np.zeros(len(t), dtype=np.float32)
    for f in freqs:
        wave += amp/len(freqs) * np.sin(2*np.pi*f*t)
    # enveloppe douce
    env_a = int(sr*0.3)
    env_r = int(sr*0.3)
    env = np.ones(len(t))
    env[:env_a] = np.linspace(0,1,env_a)
    env[-env_r:] = np.linspace(1,0,env_r)
    return (wave * env).astype(np.float32)

def make_music(total_dur=960.0, sr=SR):
    """
    Progression : C maj → A min → F maj → G maj (80 BPM)
    Couches : mélodie piano + basse + pad harmonique
    """
    bpm = 80
    beat = 60.0 / bpm        # 0.75s
    measure = beat * 4       # 3.0s

    # Accords (fondamentale, tierce, quinte)
    chords = {
        "C":  [261.63, 329.63, 392.00],
        "Am": [220.00, 261.63, 329.63],
        "F":  [174.61, 220.00, 261.63],
        "G":  [196.00, 246.94, 293.66],
    }
    progression = ["C","Am","F","G"]

    # Mélodie (notes + durées en beats)
    melody = [
        ("e",1),("d",1),("c",1),("e",1),
        ("a",1),("g",1),("e",2),
        ("f",1),("e",1),("d",1),("c",1),
        ("g",2),("C",2),
        ("e",1),("f",1),("g",1),("e",1),
        ("d",1),("c",2),("B",1),
        ("c",2),("d",1),("e",1),
        ("C",4),
    ]

    n_measures = int(total_dur / measure) + 1
    total_samples = int(total_dur * sr)
    track = np.zeros(total_samples, dtype=np.float32)

    for m in range(n_measures):
        chord_name = progression[m % len(progression)]
        chord_freqs = chords[chord_name]
        t_start = int(m * measure * sr)
        # pad harmonique
        pad = pad_tone(chord_freqs, measure, sr, amp=0.10)
        end = min(t_start + len(pad), total_samples)
        track[t_start:end] += pad[:end-t_start]
        # basse (fondamentale à l'octave basse)
        bass_f = chord_freqs[0] / 2
        bass = bass_tone(bass_f, beat*2, sr, amp=0.18)
        end = min(t_start + len(bass), total_samples)
        track[t_start:end] += bass[:end-t_start]

    # mélodie sur tout le morceau (boucle)
    mel_idx = 0
    mel_t = 0.0
    while mel_t < total_dur:
        note_name, dur_beats = melody[mel_idx % len(melody)]
        dur_s = dur_beats * beat
        freq = note_freq(note_name)
        tone = piano_tone(freq, min(dur_s*0.9, dur_s), sr, amp=0.28)
        t_s = int(mel_t * sr)
        end = min(t_s + len(tone), total_samples)
        if end > t_s:
            track[t_s:end] += tone[:end-t_s]
        mel_t += dur_s
        mel_idx += 1

    # normalisation douce
    mx = np.max(np.abs(track))
    if mx > 0.001:
        track = track / mx * 0.55

    # fondu début/fin
    fade = int(sr * 3.0)
    track[:fade] *= np.linspace(0,1,fade)
    track[-fade:] *= np.linspace(1,0,fade)

    return track

print("🎵 Génération musique de fond…")
music = make_music(total_dur=970.0)
sf.write(OUT / "physique_music.wav", music, SR)
print(f"   → physique_music.wav ({len(music)/SR:.1f}s)")

# ─────────────────────────────────────────────────────────────────────────────
# BRUITAGES
# ─────────────────────────────────────────────────────────────────────────────

def write_sfx(name, data, sr=SR):
    path = OUT / name
    mx = np.max(np.abs(data)) + 1e-9
    data = (data / mx * 0.7).astype(np.float32)
    sf.write(path, data, sr)
    print(f"   → {name} ({len(data)/sr*1000:.0f}ms)")

print("\n🔊 Génération bruitages…")

sr = SR

# whoosh (transition de scène)
def sfx_whoosh():
    dur = 0.55
    t = np.linspace(0,dur,int(sr*dur))
    noise = np.random.randn(len(t)).astype(np.float32)
    # filtre passe-bande glissant
    freq_sweep = np.exp(np.linspace(np.log(200),np.log(4000),len(t)))
    phase = np.cumsum(freq_sweep / sr * 2 * np.pi)
    carrier = np.sin(phase).astype(np.float32)
    env = np.exp(-3*t) * np.sqrt(t+0.01)
    env /= np.max(env)
    b, a = sig.butter(3, [0.04, 0.4], btype='band')
    filtered = sig.lfilter(b, a, noise)
    return (filtered * env * 0.6 + carrier * env * 0.4).astype(np.float32)

write_sfx("sfx_whoosh.wav", sfx_whoosh())

# pop (apparition formule)
def sfx_pop():
    dur = 0.18
    t = np.linspace(0,dur,int(sr*dur))
    freq = 600 * np.exp(-8*t)
    phase = np.cumsum(freq/sr*2*np.pi)
    wave = np.sin(phase)
    env = np.exp(-20*t)
    return (wave * env).astype(np.float32)

write_sfx("sfx_pop.wav", sfx_pop())

# craie (écriture tableau)
def sfx_chalk():
    dur = 0.40
    t = np.linspace(0,dur,int(sr*dur))
    noise = np.random.randn(len(t)).astype(np.float32)
    b, a = sig.butter(4, [0.15, 0.45], btype='band')
    filtered = sig.lfilter(b, a, noise)
    # modulation irrégulière
    mod = 0.5 + 0.5*np.sin(2*np.pi*35*t + np.random.randn(len(t))*0.5)
    env = np.exp(-2.5*t) * np.sqrt(t/dur+0.1)
    env /= np.max(env)
    return (filtered * mod * env).astype(np.float32)

write_sfx("sfx_chalk.wav", sfx_chalk())

# ressort (oscillateur)
def sfx_spring():
    dur = 0.80
    t = np.linspace(0,dur,int(sr*dur))
    # deux partiels qui décroissent
    f0 = 320
    wave = (0.5*np.sin(2*np.pi*f0*t)*np.exp(-8*t)
          + 0.3*np.sin(2*np.pi*f0*1.5*t)*np.exp(-12*t)
          + 0.2*np.sin(2*np.pi*f0*2.5*t)*np.exp(-18*t))
    noise = np.random.randn(len(t)).astype(np.float32) * 0.05
    b, a = sig.butter(3, 0.3)
    noise = sig.lfilter(b, a, noise)
    return (wave + noise).astype(np.float32)

write_sfx("sfx_spring.wav", sfx_spring())

# circuit électrique (buzz RC)
def sfx_electric():
    dur = 0.70
    t = np.linspace(0,dur,int(sr*dur))
    # fond 50Hz + harmoniques
    buzz = (0.5*np.sin(2*np.pi*50*t)
          + 0.25*np.sin(2*np.pi*150*t)
          + 0.15*np.sin(2*np.pi*250*t))
    # décroissance exponentielle (comme condensateur qui charge)
    env = 1 - np.exp(-5*t)
    env2 = np.exp(-3*(t-0.2)**2)
    return (buzz * env * env2 * 0.6).astype(np.float32)

write_sfx("sfx_electric.wav", sfx_electric())

# photon (quantum pop lumineux)
def sfx_photon():
    dur = 0.30
    t = np.linspace(0,dur,int(sr*dur))
    freq = 2400 * np.exp(-4*t) + 800
    phase = np.cumsum(freq/sr*2*np.pi)
    wave = np.sin(phase)
    env = np.exp(-12*t) * np.sin(np.pi*t/dur)
    shine = np.random.randn(len(t)) * 0.15
    b, a = sig.butter(4, 0.4)
    shine = sig.lfilter(b, a, shine)
    return (wave * env + shine * np.exp(-15*t)).astype(np.float32)

write_sfx("sfx_photon.wav", sfx_photon())

# relativité (effet spatial)
def sfx_space():
    dur = 1.0
    t = np.linspace(0,dur,int(sr*dur))
    freq = 200 + 600*t/dur
    phase = np.cumsum(freq/sr*2*np.pi)
    wave = np.sin(phase) * 0.4
    noise = np.random.randn(len(t)).astype(np.float32)
    b, a = sig.butter(3, [0.01, 0.1], btype='band')
    filtered = sig.lfilter(b, a, noise) * 0.3
    env = np.sin(np.pi*t/dur)
    return ((wave + filtered) * env).astype(np.float32)

write_sfx("sfx_space.wav", sfx_space())

# tick (progression étape)
def sfx_tick():
    dur = 0.08
    t = np.linspace(0,dur,int(sr*dur))
    wave = np.sin(2*np.pi*1200*t) * np.exp(-60*t)
    return wave.astype(np.float32)

write_sfx("sfx_tick.wav", sfx_tick())

# ─────────────────────────────────────────────────────────────────────────────
# NARRATION KOKORO ff_siwis
# ─────────────────────────────────────────────────────────────────────────────

print("\n🎤 Génération narration Kokoro ff_siwis…")

from kokoro import KPipeline
import warnings, logging
warnings.filterwarnings("ignore")
logging.getLogger().setLevel(logging.ERROR)

pipe = KPipeline(lang_code='f')

NARRATIONS = {
    "narration_intro": (
        "Bienvenue dans ce cours complet de physique niveau terminale. "
        "Nous allons explorer ensemble les grandes lois qui gouvernent l'univers : "
        "la mécanique newtonienne, l'électrocinétique, l'optique géométrique, "
        "les ondes, la physique quantique et la relativité restreinte. "
        "Préparez-vous pour quinze minutes de démonstrations animées en trois dimensions."
    ),
    "narration_newton": (
        "Les trois lois de Newton forment le socle de la mécanique classique. "
        "La première loi, dite principe d'inertie, affirme qu'un corps persiste dans son état "
        "si la somme des forces qui lui sont appliquées est nulle. "
        "La deuxième loi, le principe fondamental de la dynamique, relie la résultante des forces "
        "à la masse et à l'accélération : la somme vectorielle des forces est égale à m fois a. "
        "La troisième loi, principe des actions réciproques, stipule que si A exerce une force sur B, "
        "alors B exerce sur A une force égale et opposée. "
        "Sur ce bloc posé sur un plan, nous voyons le poids P vers le bas, "
        "la réaction normale N vers le haut, et une force de frottement f. "
        "À l'équilibre, la somme vectorielle de ces trois forces est nulle."
    ),
    "narration_projectile": (
        "Lorsqu'on lance un projectile avec une vitesse initiale v zéro à un angle thêta, "
        "le mouvement se décompose en deux composantes indépendantes. "
        "Horizontalement, aucune force n'agit : la vitesse v x est constante, "
        "et la position x varie linéairement avec le temps. "
        "Verticalement, seule la pesanteur agit : la vitesse v y décroît linéairement, "
        "et la hauteur suit une équation du second degré en t. "
        "La portée maximale est atteinte pour un angle de quarante-cinq degrés, "
        "car sinus de deux fois quarante-cinq vaut un. "
        "La portée est proportionnelle au carré de la vitesse initiale : "
        "doubler la vitesse quadruple la portée."
    ),
    "narration_energie": (
        "L'énergie est une grandeur fondamentale qui se conserve. "
        "L'énergie cinétique d'un corps est égale à un demi m v carré. "
        "L'énergie potentielle de pesanteur vaut m g h, "
        "où h est la hauteur au-dessus de la référence choisie. "
        "La somme des deux, appelée énergie mécanique, "
        "se conserve en l'absence de frottements. "
        "Le théorème travail-énergie cinétique est essentiel : "
        "la variation d'énergie cinétique est égale à la somme des travaux de toutes les forces. "
        "Observez cette bille qui dévale la rampe : "
        "l'énergie potentielle se transforme progressivement en énergie cinétique, "
        "et la somme reste constante."
    ),
    "narration_oscillateur": (
        "L'oscillateur harmonique est un système soumis à une force de rappel "
        "proportionnelle à l'écart par rapport à la position d'équilibre. "
        "C'est la loi de Hooke : F égale moins k fois x. "
        "La solution de l'équation différentielle est un cosinus : "
        "x de t égale X m cosinus de oméga zéro t plus phi. "
        "La pulsation propre oméga zéro vaut racine de k sur m. "
        "La période propre T zéro vaut deux pi racine de m sur k. "
        "Plus la masse est grande ou plus la raideur est faible, plus la période est longue. "
        "L'énergie totale de l'oscillateur est constante et vaut un demi k X m carré."
    ),
    "narration_circuit_rc": (
        "Le circuit RC associe une résistance et un condensateur en série. "
        "Lors de la charge, la tension aux bornes du condensateur suit une loi exponentielle croissante : "
        "U c de t égale E fois un moins e exposant moins t sur tau. "
        "La constante de temps tau est le produit de R par C. "
        "À t égal tau, la tension atteint soixante-trois pour cent de la tension d'alimentation. "
        "Lors de la décharge, la loi est symétrique : "
        "U c décroît exponentiellement avec la même constante tau. "
        "Plus R ou C est grand, plus la charge et la décharge sont lentes. "
        "Ce modèle est fondamental en électronique pour les filtres, "
        "les temporisateurs et les intégrateurs."
    ),
    "narration_optique": (
        "L'optique géométrique décrit la propagation de la lumière par des rayons. "
        "Une lentille mince convergente de vergence V diopties, "
        "correspondant à une distance focale f prime en mètres, "
        "forme l'image d'un objet selon la relation conjuguée : "
        "un sur O A prime moins un sur O A égale un sur f prime. "
        "Le grandissement algébrique gamma vaut O A prime sur O A. "
        "Un objet réel à gauche donne une image réelle à droite si O A est plus petit que moins f prime. "
        "La loi de Snell-Descartes régit la réfraction : "
        "n un sinus i un égale n deux sinus i deux. "
        "Au-delà de l'angle limite, on obtient la réflexion totale, "
        "phénomène utilisé dans les fibres optiques."
    ),
    "narration_ondes": (
        "Une onde mécanique progressive est une perturbation qui se propage "
        "à travers un milieu sans transport de matière. "
        "Elle est décrite par l'équation y de x virgule t égale A cosinus de oméga t moins k x. "
        "La célérité v est le rapport de la longueur d'onde lambda sur la période T, "
        "ce qui donne aussi v égale lambda fois f. "
        "Deux points distants de d ont un déphasage de deux pi d sur lambda. "
        "Si ce déphasage est un multiple de deux pi, les points vibrent en phase. "
        "La superposition de deux ondes cohérentes produit des interférences : "
        "constructives si les amplitudes s'ajoutent, destructives si elles s'annulent."
    ),
    "narration_young": (
        "L'expérience de Young, réalisée en mille huit cent un, "
        "démontra la nature ondulatoire de la lumière. "
        "Deux fentes éclairées par une source cohérente rayonnent des ondes en phase. "
        "Sur un écran à distance D, on observe une figure d'interférences : "
        "des franges brillantes alternant avec des franges sombres. "
        "L'interfrange i, c'est-à-dire la distance entre deux franges brillantes consécutives, "
        "vaut lambda D sur a, où a est l'écartement des fentes. "
        "Plus l'écartement a est petit, plus les franges sont larges. "
        "Ce résultat est fondamental : il permet de mesurer la longueur d'onde de la lumière."
    ),
    "narration_quantique": (
        "La physique quantique révolutionna notre conception du monde au début du vingtième siècle. "
        "Max Planck postula que l'énergie est échangée par quanta : E égale h nu. "
        "Einstein utilisa ce concept pour expliquer l'effet photoélectrique : "
        "un photon de fréquence nu frappe un métal et arrache un électron "
        "si son énergie h nu est supérieure au travail d'extraction W. "
        "L'énergie cinétique de l'électron éjecté vaut h nu moins W. "
        "En dessous de la fréquence seuil nu zéro, aucun électron n'est libéré, "
        "quelle que soit l'intensité lumineuse. "
        "Le modèle de Bohr quantifie les niveaux d'énergie de l'atome d'hydrogène : "
        "E n vaut moins treize virgule six électronvolts sur n carré."
    ),
    "narration_demo1": (
        "Résolvons maintenant un problème complet de balistique. "
        "Une bille de deux cents grammes est lancée depuis une falaise de vingt mètres "
        "avec une vitesse de quinze mètres par seconde à trente degrés. "
        "On décompose d'abord le mouvement : "
        "horizontalement, x de t vaut v zéro cosinus trente fois t, soit environ douze virgule neuf neuf t. "
        "Verticalement, y de t vaut vingt plus v zéro sinus trente fois t moins un demi g t carré. "
        "Pour trouver l'instant d'impact, on résout y de t égale zéro, "
        "ce qui donne une équation du second degré en t. "
        "Le discriminant vaut quatre cent quarante-huit virgule soixante-cinq, "
        "et la racine positive donne t égal deux virgule soixante-dix-neuf secondes. "
        "La portée est donc d'environ trente-six mètres. "
        "L'énergie cinétique à l'impact, vérifiée par la conservation de l'énergie mécanique, "
        "vaut environ cinquante-sept joules."
    ),
    "narration_relativite": (
        "La relativité restreinte d'Einstein, publiée en mille neuf cent cinq, "
        "repose sur deux postulats : les lois de la physique sont identiques "
        "dans tous les référentiels inertiels, "
        "et la célérité de la lumière c est la même dans tous les référentiels. "
        "Le facteur de Lorentz gamma vaut un sur racine de un moins bêta carré, "
        "où bêta est le rapport v sur c. "
        "La dilatation des durées : une horloge en mouvement à la vitesse v "
        "mesure un temps propre delta t zéro plus court que le temps delta t mesuré par un observateur au repos. "
        "On a delta t égale gamma fois delta t zéro. "
        "La contraction des longueurs : un objet de longueur propre L zéro "
        "apparaît plus court dans la direction du mouvement : L égale L zéro sur gamma. "
        "L'énergie totale d'un corps est E égale gamma m c carré, "
        "et l'énergie de masse au repos est m c carré."
    ),
    "narration_methodes": (
        "Voici les conseils méthodologiques essentiels pour réussir l'épreuve de physique. "
        "Toujours préciser les unités à chaque étape du calcul. "
        "Décomposer systématiquement les vecteurs en composantes cartésiennes. "
        "Vérifier la cohérence dimensionnelle de chaque formule. "
        "Préférer la conservation de l'énergie à l'application des lois de Newton "
        "lorsque c'est possible, car c'est plus simple. "
        "Tracer un schéma propre avec toutes les forces, les grandeurs connues et inconnues. "
        "Exprimer le résultat sous forme littérale avant de substituer les valeurs numériques. "
        "En optique, ne jamais oublier que les grandeurs O A et O A prime sont algébriques. "
        "Distinguer soigneusement ondes transversales et longitudinales, "
        "ondes stationnaires et progressives."
    ),
    "narration_demo2": (
        "Appliquons la relation conjuguée des lentilles. "
        "Une lentille convergente de distance focale dix centimètres. "
        "Un objet réel est placé à quinze centimètres de la lentille, "
        "donc O A vaut moins quinze centimètres. "
        "La relation conjuguée donne : un sur O A prime égale un sur f prime plus un sur O A, "
        "soit un sur dix plus un sur moins quinze. "
        "On obtient un sur O A prime égale trois sur trente moins deux sur trente, soit un sur trente. "
        "Donc O A prime vaut trente centimètres : l'image est réelle, à droite de la lentille. "
        "Le grandissement vaut O A prime sur O A, soit trente sur moins quinze, égal moins deux. "
        "L'image est renversée et deux fois plus grande que l'objet."
    ),
    "narration_outro": (
        "Félicitations ! Vous avez parcouru l'ensemble du programme de physique terminale. "
        "Des lois de Newton à la relativité restreinte, "
        "en passant par les oscillateurs, les circuits, l'optique et la physique quantique. "
        "La physique s'apprend en résolvant des problèmes variés : "
        "plus vous pratiquerez, plus ces concepts deviendront intuitifs. "
        "N'oubliez pas les méthodes : schéma, décomposition, conservation de l'énergie. "
        "Bonne chance pour vos examens !"
    ),
}

def generate_narration(key, text, speed=0.90):
    out_path = OUT / f"{key}.wav"
    if out_path.exists():
        print(f"   → {key}.wav (déjà existant, sauté)")
        return
    chunks = []
    gen = pipe(text, voice='ff_siwis', speed=speed)
    for _, _, audio in gen:
        chunks.append(audio.numpy() if hasattr(audio,'numpy') else np.array(audio))
    if chunks:
        full = np.concatenate(chunks).astype(np.float32)
        # normalisation
        mx = np.max(np.abs(full))
        if mx > 0.001:
            full = full / mx * 0.82
        sf.write(out_path, full, SR)
        print(f"   → {key}.wav ({len(full)/SR:.1f}s)")
    else:
        print(f"   ⚠ {key}: aucun audio généré")

for key, text in NARRATIONS.items():
    print(f"  Génération {key}…")
    generate_narration(key, text)

print("\n✅ Tous les fichiers audio générés dans:", OUT)
print("\nRécapitulatif :")
for f in sorted(OUT.iterdir()):
    size = f.stat().st_size / 1024
    print(f"  {f.name:<45} {size:>8.1f} KB")
