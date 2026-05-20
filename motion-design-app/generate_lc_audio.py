#!/usr/bin/env python3
"""Audio pour ListesChainees.jsx : musique + narration ff_siwis"""
import numpy as np, soundfile as sf, scipy.signal as sig
from pathlib import Path

OUT = Path("/root/remotion_animation/motion-design-app/public/audio")
OUT.mkdir(parents=True, exist_ok=True)
SR = 24000

# ── Musique de fond originale (libre de droits) ──────────────────
# Style : lo-fi éducatif, 75 BPM, gamme pentatonique, piano + pad
def piano(freq, dur, amp=0.32):
    t = np.linspace(0, dur, int(SR*dur), endpoint=False)
    w = (amp     * np.sin(2*np.pi*freq*t)   * np.exp(-2.2*t)
       + amp*.45 * np.sin(2*np.pi*freq*2*t) * np.exp(-3.8*t)
       + amp*.22 * np.sin(2*np.pi*freq*3*t) * np.exp(-6.0*t)
       + amp*.10 * np.sin(2*np.pi*freq*4*t) * np.exp(-9.0*t))
    a = int(SR*0.007); w[:a] *= np.linspace(0,1,a)
    return w.astype(np.float32)

def bass(freq, dur, amp=0.22):
    t = np.linspace(0, dur, int(SR*dur), endpoint=False)
    w = (amp * np.sin(2*np.pi*freq*t) * np.exp(-1.4*t)
       + amp*.28 * np.sin(2*np.pi*freq*2*t) * np.exp(-3.0*t))
    a = int(SR*0.01); w[:a] *= np.linspace(0,1,a)
    return w.astype(np.float32)

def pad(freqs, dur, amp=0.08):
    t = np.linspace(0, dur, int(SR*dur), endpoint=False)
    w = sum(amp/len(freqs)*np.sin(2*np.pi*f*t) for f in freqs).astype(np.float32)
    ea, er = int(SR*.4), int(SR*.4)
    e = np.ones(len(t)); e[:ea]=np.linspace(0,1,ea); e[-er:]=np.linspace(1,0,er)
    return (w*e).astype(np.float32)

# Gamme Ré pentatonique : D E F# A B
PENTA = {
    "D2":73.42,"F#2":92.50,"A2":110.0,"B2":123.47,
    "D3":146.83,"E3":164.81,"F#3":185.0,"A3":220.0,"B3":246.94,
    "D4":293.66,"E4":329.63,"F#4":370.0,"A4":440.0,"B4":493.88,
    "D5":587.33,"E5":659.26,
}
def n(name): return PENTA[name]

BPM=75; beat=60/BPM; measure=beat*4

# Mélodie principale (boucle 8 mesures)
MELODY = [
    ("D4",2),("F#4",1),("A4",1),("B4",2),("A4",1),("F#4",1),
    ("E4",2),("D4",2),("E4",1),("F#4",1),("A4",2),
    ("F#4",1),("E4",1),("D4",2),("F#4",1),("E4",1),
    ("A3",2),("B3",1),("D4",1),("E4",2),("D4",2),
]
CHORDS = [
    [n("D3"),n("F#3"),n("A3")],
    [n("A2"),n("D3"),n("F#3")],
    [n("B2"),n("D3"),n("F#3")],
    [n("A2"),n("D3"),n("E3")],
]

def make_lc_music(total_dur=305.0):
    N = int(total_dur*SR)
    track = np.zeros(N, np.float32)
    # pads par mesures
    n_meas = int(total_dur/measure)+1
    for m in range(n_meas):
        t0 = int(m*measure*SR)
        chord = CHORDS[m%len(CHORDS)]
        p = pad(chord, measure); end=min(t0+len(p),N); track[t0:end]+=p[:end-t0]
        b = bass(chord[0]/2, beat*2); end=min(t0+len(b),N); track[t0:end]+=b[:end-t0]
        b2= bass(chord[0]/2, beat*2); t2=t0+int(beat*2*SR); end=min(t2+len(b2),N)
        if end>t2: track[t2:end]+=b2[:end-t2]
    # mélodie
    mi,mt=0,0.0
    while mt<total_dur:
        nm,db=MELODY[mi%len(MELODY)]
        ds=db*beat
        p=piano(n(nm),min(ds*.88,ds))
        t0=int(mt*SR); end=min(t0+len(p),N)
        if end>t0: track[t0:end]+=p[:end-t0]
        mt+=ds; mi+=1
    mx=np.max(np.abs(track)); track=track/mx*0.52 if mx>1e-4 else track
    fade=int(SR*3)
    track[:fade]*=np.linspace(0,1,fade); track[-fade:]*=np.linspace(1,0,fade)
    return track

print("🎵 Musique lc_music.wav…")
m=make_lc_music(); sf.write(OUT/"lc_music.wav",m,SR)
print(f"   → {len(m)/SR:.1f}s")

# ── Narrations Kokoro ff_siwis ───────────────────────────────────
NARRATIONS = {
"lc_intro": (
    "Bienvenue dans ce cours sur les listes chaînées en Java. "
    "Une liste chaînée est l'une des structures de données les plus importantes en informatique. "
    "Nous allons apprendre ensemble ce qu'elle est, comment la construire, "
    "comment la parcourir, y ajouter des éléments, et en supprimer. "
    "Ce cours est fait pour les débutants complets — aucune connaissance préalable n'est nécessaire."
),
"lc_analogie": (
    "Imaginez une chaîne de wagons de train. "
    "Chaque wagon contient une valeur, et sait où se trouve le wagon suivant. "
    "C'est exactement ce qu'est une liste chaînée : "
    "une suite d'éléments appelés nœuds, où chaque nœud pointe vers le suivant. "
    "Contrairement à un tableau, les éléments ne sont pas rangés côte à côte en mémoire. "
    "Ils peuvent être dispersés partout, reliés entre eux par des références, qu'on appelle des flèches. "
    "Le gros avantage : la taille est dynamique. "
    "On peut ajouter ou retirer des éléments à volonté, sans avoir à tout recréer. "
    "L'inconvénient : pour accéder à un élément, il faut parcourir la liste depuis le début."
),
"lc_node": (
    "En Java, chaque maillon de la liste est représenté par une classe qu'on appelle Node, c'est-à-dire nœud en anglais. "
    "Cette classe contient exactement deux choses. "
    "D'abord, la donnée : c'est la valeur stockée dans ce nœud, par exemple un entier. "
    "Ensuite, next : c'est une référence vers le nœud suivant. "
    "Si next vaut null, cela signifie qu'il n'y a pas de nœud suivant : on est à la fin de la liste. "
    "Le constructeur est très simple : il reçoit la valeur en paramètre, la stocke dans data, et met next à null. "
    "La liste chaînée elle-même, la classe LinkedList, ne contient qu'un seul champ : "
    "head, une référence vers le premier nœud, c'est-à-dire la tête de la liste. "
    "Si head vaut null, la liste est vide."
),
"lc_creation": (
    "Créons maintenant notre première liste chaînée. "
    "On procède en trois étapes. "
    "Première étape : on crée les nœuds un par un avec new Node. "
    "Ici on crée trois nœuds avec les valeurs dix, vingt et trente. "
    "Pour l'instant, ils sont isolés les uns des autres. "
    "Deuxième étape : on les relie. "
    "On dit que le next de n un pointe vers n deux, et que le next de n deux pointe vers n trois. "
    "Le next de n trois reste null : c'est la fin de la liste. "
    "Troisième étape : on connecte la tête. "
    "On assigne n un à head, ce qui indique que n un est le premier élément de la liste. "
    "La liste est maintenant fonctionnelle. "
    "On peut aussi utiliser des méthodes comme addLast pour ajouter directement en fin de liste."
),
"lc_traversal": (
    "Pour parcourir une liste chaînée, on utilise une boucle while. "
    "Le principe est simple : on crée une variable current qui démarre à head. "
    "À chaque itération de la boucle, on lit la valeur de current.data, "
    "puis on avance en disant current égale current.next. "
    "On continue tant que current est différent de null. "
    "Quand current vaut null, on a atteint la fin de la liste, et la boucle s'arrête. "
    "C'est comme marcher le long de la chaîne de wagons, wagon par wagon, jusqu'à la fin. "
    "Attention : on ne peut pas aller directement à l'indice deux comme dans un tableau. "
    "Il faut toujours partir du début et avancer pas à pas."
),
"lc_insertion": (
    "Il existe deux façons principales d'insérer un élément dans une liste chaînée. "
    "La première, l'insertion en tête, est très rapide : on dit que c'est en temps constant, ou O de un. "
    "On crée un nouveau nœud, on lui assigne comme next l'actuelle tête de liste, "
    "puis on fait pointer head vers ce nouveau nœud. "
    "Le nouveau nœud devient instantanément le premier élément. "
    "La deuxième façon, l'insertion en fin, nécessite de parcourir toute la liste. "
    "On crée un nouveau nœud, on avance jusqu'au dernier nœud avec une boucle while, "
    "puis on accroche le nouveau nœud à la fin en mettant à jour le next du dernier nœud. "
    "Cette opération est en O de n, c'est-à-dire qu'elle est proportionnelle à la taille de la liste."
),
"lc_suppression": (
    "Pour supprimer un nœud, on distingue deux cas. "
    "Si le nœud à supprimer est la tête, c'est simple : "
    "on fait avancer head d'un cran, c'est-à-dire head égale head.next. "
    "Sinon, il faut trouver le nœud qui se trouve juste avant celui qu'on veut supprimer. "
    "On parcourt la liste avec une boucle while, et quand on trouve le bon nœud précédent, "
    "on fait sauter le lien : current.next devient current.next.next. "
    "En faisant cela, on court-circuite le nœud à supprimer, qui n'est plus référencé. "
    "Java gère automatiquement la mémoire grâce au Garbage Collector : "
    "le nœud supprimé sera libéré de la mémoire sans que vous ayez à vous en occuper. "
    "C'est une des grandes différences avec le langage C, où il faut gérer la mémoire manuellement."
),
}

print("\n🎤 Narrations Kokoro ff_siwis…")
import warnings, logging
warnings.filterwarnings("ignore"); logging.getLogger().setLevel(logging.ERROR)
from kokoro import KPipeline
pipe = KPipeline(lang_code='f')

for key, text in NARRATIONS.items():
    out_path = OUT / f"{key}.wav"
    if out_path.exists():
        print(f"   → {key}.wav (déjà existant)")
        continue
    print(f"  {key}…")
    chunks=[]
    for _,_,audio in pipe(text, voice='ff_siwis', speed=0.90):
        chunks.append(audio.numpy() if hasattr(audio,'numpy') else __import__('numpy').array(audio))
    if chunks:
        full=np.concatenate(chunks).astype(np.float32)
        mx=np.max(np.abs(full))
        if mx>1e-4: full=full/mx*0.82
        sf.write(out_path, full, SR)
        print(f"   → {key}.wav ({len(full)/SR:.1f}s)")

print("\n✅ Audio ListesChainees prêt !")
for f in sorted(OUT.glob("lc_*.wav")):
    print(f"  {f.name:<40} {f.stat().st_size/1024:>8.1f} KB")
