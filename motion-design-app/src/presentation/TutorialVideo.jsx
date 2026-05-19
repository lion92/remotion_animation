// TutorialVideo.jsx — Tutoriel animé avec voix française (Microsoft Paul)
// Durées audio mesurées : 01=394f 02=593f 03=543f 04=834f 05=481f 06=554f 07=538f 08=504f

import { Sequence, useCurrentFrame, interpolate, Audio, staticFile } from "remotion";

// ─── THÈME ───────────────────────────────────────────────────────────────────
const MONO  = "'Courier New', Courier, monospace";
const SANS  = "'Arial', 'Helvetica', sans-serif";
const BG    = "#0d1117";
const PANEL = "#161b22";
const GOLD  = "#FFD700";

// ─── CODE SOURCES ────────────────────────────────────────────────────────────

const CODE = {

root:
`// Root.jsx — Le canvas de la vidéo

import { Composition } from "remotion";
import App from "./App";

export const RemotionRoot = () => (
    <Composition
        id="Cartoon"
        component={App}

        durationInFrames={960}
        fps={24}

        width={1920}
        height={1080}
    />
);`,

app:
`// App.jsx — Les 4 scènes séquencées dans le temps

import { Sequence } from "remotion";

export default function App() {
    return (
        <>
            <Sequence from={0} durationInFrames={240}>
                <Scene1 />
            </Sequence>
            <Sequence from={240} durationInFrames={240}>
                <Scene2 />
            </Sequence>
            <Sequence from={480} durationInFrames={240}>
                <Scene3 />
            </Sequence>
            <Sequence from={720} durationInFrames={240}>
                <Scene4 />
            </Sequence>
        </>
    );
}`,

littleguy:
`// LittleGuy.jsx — Animation par trigonométrie

import { useCurrentFrame } from "remotion";

export default function LittleGuy({ lookingUp = false }) {
    const frame = useCurrentFrame();

    // Oscillation sinusoïdale = cycle de marche
    const walkCycle = frame * 0.06;
    const armAngle  = Math.sin(walkCycle) * 18;
    const legAngle  = Math.sin(walkCycle) * 18;
    const headRotation = lookingUp ? -20 : 0;

    return (
        <div style={{
            position: "relative", width: 200, height: 320,
        }}>
            <div style={{
                transform: 'rotate(' + headRotation + 'deg)',
            }} />
            <div style={{
                transform: 'rotate(' + armAngle + 'deg)',
            }} />
            <div style={{
                transform: 'rotate(' + (-legAngle) + 'deg)',
            }} />
        </div>
    );
}`,

bubble:
`// Bubble.jsx — Bulle de dialogue en CSS pur

export default function Bubble({ text }) {
    return (
        <div style={{
            position: "absolute",
            background: "white",
            padding: "20px",
            borderRadius: "20px",
            fontSize: "24px",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}>
            {text}

            {/* Triangle CSS : border trick ! */}
            <div style={{
                position: "absolute",
                bottom: "-20px",
                width: 0, height: 0,
                borderLeft:  "20px solid transparent",
                borderRight: "20px solid transparent",
                borderTop:   "20px solid white",
            }} />
        </div>
    );
}`,

plane:
`// Plane.jsx — Mouvement fluide en 2 dimensions

import { useCurrentFrame } from "remotion";

export default function Plane() {
    const frame = useCurrentFrame();

    // 6 pixels par frame = vitesse linéaire constante
    const x = frame * 6 - 400;

    // Onde sinusoïdale = légère turbulence
    const y = Math.sin(frame * 0.04) * 15;

    return (
        <div style={{
            position: "absolute",
            top:  150 + y,
            left: x,
            fontSize: 120,
        }}>
            ✈️
        </div>
    );
}`,

scene3:
`// Scene3.jsx — 2 animations simultanées

import { useCurrentFrame } from "remotion";

export default function Scene3() {
    // frame repart à 0 dans chaque <Sequence> !
    const frame = useCurrentFrame();

    // Avion descend vers la piste
    const planeY = Math.min(frame * 1.5, 350);

    // Personnage court vers l'avion
    const characterX = Math.min(frame * 1.2, 420);

    return (
        <div style={{ width: "100%", height: "100%" }}>

            <div style={{ top: planeY, right: 250 }}>
                ✈️
            </div>

            <div style={{ bottom: 120, left: characterX }}>
                <LittleGuy lookingUp />
            </div>

        </div>
    );
}`,
};

// ─── DÉFINITIONS DES STAGES ──────────────────────────────────────────────────
// Pour chaque slide : { from, to, lines (1-indexé), subtitle, icon, concept, explain }

const STAGES = {
    root: [
        {
            from: 0, to: 90,
            lines: [],
            icon: "📁", concept: "Root.jsx",
            explain: "Le point d'entrée de toute la vidéo",
            subtitle: "On commence par Root.jsx. C'est ici qu'on configure notre vidéo.",
        },
        {
            from: 90, to: 260,
            lines: [7, 8, 9],
            icon: "🎬", concept: "Composition",
            explain: "Déclare l'identifiant et le composant React principal",
            subtitle: "La Composition, c'est comme le canvas d'un film. On y déclare l'identifiant et le composant principal.",
        },
        {
            from: 260, to: 450,
            lines: [11, 12],
            icon: "⏱️", concept: "960 ÷ 24 = 40s",
            explain: "durationInFrames × fps⁻¹ = durée en secondes",
            subtitle: "Neuf cent soixante frames divisé par vingt-quatre fps, ça fait exactement quarante secondes de vidéo.",
        },
        {
            from: 450, to: 620,
            lines: [14, 15],
            icon: "📐", concept: "1920 × 1080",
            explain: "Full HD — standard vidéo professionnel",
            subtitle: "Width 1920 et height 1080, c'est la résolution Full HD, le standard professionnel.",
        },
    ],

    app: [
        {
            from: 0, to: 100,
            lines: [3],
            icon: "📦", concept: "import Sequence",
            explain: "Sequence est le composant clé pour la timeline",
            subtitle: "Dans App.jsx, on importe Sequence depuis Remotion. C'est le composant qui gère la timeline.",
        },
        {
            from: 100, to: 290,
            lines: [8, 9, 10],
            icon: "▶️", concept: "from={0}",
            explain: "Démarre à la frame 0 = seconde 0",
            subtitle: "La Sequence avec from égal zéro démarre au tout début. La scène un commence à la frame zéro.",
        },
        {
            from: 290, to: 460,
            lines: [11, 14, 17],
            icon: "⏭️", concept: "240 frames = 10s",
            explain: "Chaque scène dure exactement 10 secondes",
            subtitle: "from égal deux cent quarante signifie dix secondes. Chaque scène dure deux cent quarante frames, soit dix secondes à vingt-quatre fps.",
        },
        {
            from: 460, to: 570,
            lines: [8, 11, 14, 17],
            icon: "🎞️", concept: "Timeline complète",
            explain: "4 scènes × 10s = 40 secondes au total",
            subtitle: "Quatre scènes enchaînées font quarante secondes au total. C'est toute la timeline du film.",
        },
    ],

    littleguy: [
        {
            from: 0, to: 120,
            lines: [3],
            icon: "🎯", concept: "useCurrentFrame",
            explain: "Le cœur de toute animation Remotion",
            subtitle: "On importe useCurrentFrame depuis Remotion. C'est la fonction essentielle pour animer.",
        },
        {
            from: 120, to: 310,
            lines: [6],
            icon: "🔢", concept: "frame = 0, 1, 2...",
            explain: "Retourne le numéro de la frame courante",
            subtitle: "useCurrentFrame retourne simplement le numéro de la frame en cours : zéro, un, deux, et ainsi de suite jusqu'à la fin de la scène.",
        },
        {
            from: 310, to: 560,
            lines: [9, 10, 11],
            icon: "〰️", concept: "Math.sin()",
            explain: "Oscille entre −1 et +1 : parfait pour animer",
            subtitle: "Math sin de walkCycle multiplie le résultat par dix-huit degrés. Ca produit une oscillation naturelle entre moins dix-huit et plus dix-huit degrés. Voilà le secret du cycle de marche.",
        },
        {
            from: 560, to: 700,
            lines: [12],
            icon: "👀", concept: "lookingUp",
            explain: "Prop React pour modifier le comportement",
            subtitle: "La prop lookingUp, quand elle est vraie, pivote la tête de moins vingt degrés. Le personnage lève les yeux vers l'avion.",
        },
        {
            from: 700, to: 840,
            lines: [17, 20, 23],
            icon: "🎨", concept: "CSS transform",
            explain: "rotate() anime les membres du personnage",
            subtitle: "Chaque membre du personnage est un div avec un transform rotate. L'angle change à chaque frame grâce à Math sin.",
        },
    ],

    bubble: [
        {
            from: 0, to: 150,
            lines: [6, 7, 8, 9, 10],
            icon: "💬", concept: "Div stylisé",
            explain: "Une bulle = un div avec borderRadius",
            subtitle: "La bulle de dialogue est un simple div avec background blanc, padding, et border-radius pour les coins arrondis.",
        },
        {
            from: 150, to: 320,
            lines: [13],
            icon: "📝", concept: "{text}",
            explain: "La prop passe le texte au composant",
            subtitle: "Le texte est passé en prop et affiché directement dans le JSX. Le composant est réutilisable avec n'importe quel texte.",
        },
        {
            from: 320, to: 481,
            lines: [17, 18, 19, 20, 21],
            icon: "△", concept: "Border Trick",
            explain: "width=0 height=0 + une seule bordure = triangle",
            subtitle: "Pour la flèche, on utilise le border trick CSS. En fixant la largeur et la hauteur à zéro, puis en colorant une seule bordure, le navigateur dessine un triangle parfait.",
        },
    ],

    plane: [
        {
            from: 0, to: 150,
            lines: [6],
            icon: "🎯", concept: "useCurrentFrame",
            explain: "Toujours la même base : la frame courante",
            subtitle: "On récupère la frame courante avec useCurrentFrame. C'est la base de toutes nos animations.",
        },
        {
            from: 150, to: 370,
            lines: [9],
            icon: "➡️", concept: "frame × 6",
            explain: "Vitesse constante de 6 pixels par frame",
            subtitle: "frame multiplié par six donne six pixels par frame. Moins quatre cents pour démarrer hors de l'écran à gauche.",
        },
        {
            from: 370, to: 554,
            lines: [12],
            icon: "〰️", concept: "Math.sin × 15",
            explain: "±15px d'oscillation = effet de turbulence",
            subtitle: "Math sin de frame multiplié par zéro virgule zéro quatre, fois quinze. Ça crée une oscillation verticale de plus ou moins quinze pixels. L'avion semble voler dans les turbulences.",
        },
    ],

    scene3: [
        {
            from: 0, to: 150,
            lines: [6, 7],
            icon: "🔄", concept: "Frame locale",
            explain: "Sequence remet frame à 0 à chaque scène",
            subtitle: "Grâce à Sequence, la frame repart à zéro au début de chaque scène. Scene3 ne sait pas qu'elle est à la frame quatre cent quatre-vingts globalement.",
        },
        {
            from: 150, to: 360,
            lines: [10],
            icon: "📉", concept: "Math.min",
            explain: "Plafonne l'animation à 350px maximum",
            subtitle: "Math min de frame fois un virgule cinq et trois cent cinquante. L'avion descend progressivement et s'arrête à trois cent cinquante pixels vers le bas.",
        },
        {
            from: 360, to: 538,
            lines: [13, 21, 22],
            icon: "🏃", concept: "2 objets simultanés",
            explain: "planeY et characterX évoluent en même temps",
            subtitle: "Le personnage court vers l'avion avec characterX. Les deux animations tournent dans la même frame. C'est la puissance de React : tout est synchrone.",
        },
    ],
};

// ─── COMPOSANTS VISUELS ──────────────────────────────────────────────────────

function getLineColor(line) {
    const t = line.trimStart();
    if (t.startsWith("//"))           return "#6a9955";
    if (t.startsWith("{/*"))          return "#6a9955";
    if (/^(import|export)/.test(t))   return "#c586c0";
    if (/^(const|let|return)/.test(t)) return "#9cdcfe";
    if (/^(function |export default function)/.test(t)) return "#dcdcaa";
    if (/Math\.(sin|min|max)/.test(t)) return "#4ec9b0";
    if (/useCurrentFrame/.test(t))    return "#4ec9b0";
    if (/^<[A-Z]/.test(t))            return "#4ec9b0";
    if (/^<\/?\s*(div|span)/.test(t)) return "#569cd6";
    if (t.startsWith("/>"))           return "#808080";
    return "#d4d4d4";
}

function CodeDisplay({ code, highlightedLines }) {
    const lines = code.split("\n");
    return (
        <div style={{ fontFamily: MONO }}>
            {lines.map((line, i) => {
                const lineNum = i + 1;
                const isHL    = highlightedLines.includes(lineNum);
                return (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "stretch",
                            minHeight: "1.55em",
                            background:   isHL ? "rgba(255,215,0,0.12)" : "transparent",
                            borderLeft:   isHL ? `4px solid ${GOLD}` : "4px solid transparent",
                            transition:   "background 0.3s, border-color 0.3s",
                        }}
                    >
                        {/* Numéro de ligne */}
                        <span style={{
                            width: 44,
                            textAlign: "right",
                            paddingRight: 14,
                            color: isHL ? GOLD : "#444",
                            fontSize: 20,
                            lineHeight: 1.55,
                            userSelect: "none",
                            flexShrink: 0,
                        }}>
                            {lineNum}
                        </span>
                        {/* Contenu de la ligne */}
                        <span style={{
                            color:   isHL ? "#fff" : getLineColor(line),
                            opacity: isHL ? 1 : 0.55,
                            whiteSpace: "pre",
                            fontSize: 28,
                            lineHeight: 1.55,
                            flex: 1,
                        }}>
                            {line || " "}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function ExplanationPanel({ icon, concept, explain, frame, stageFrom }) {
    const localF  = Math.max(0, frame - stageFrom);
    const fadeIn  = interpolate(localF, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const slideIn = interpolate(localF, [0, 20], [30, 0], { extrapolateRight: "clamp" });

    return (
        <div
            style={{
                opacity:   fadeIn,
                transform: `translateY(${slideIn}px)`,
                display:   "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 28,
                height: "100%",
                padding: "40px 36px",
                textAlign: "center",
                fontFamily: SANS,
            }}
        >
            <div style={{ fontSize: 100 }}>{icon}</div>
            <div style={{
                fontSize: 42,
                fontWeight: "bold",
                color: GOLD,
                fontFamily: MONO,
                padding: "12px 24px",
                background: "rgba(255,215,0,0.08)",
                borderRadius: 12,
                border: "2px solid rgba(255,215,0,0.3)",
            }}>
                {concept}
            </div>
            <div style={{
                fontSize: 28,
                color: "#adb5bd",
                lineHeight: 1.6,
                maxWidth: 560,
            }}>
                {explain}
            </div>
        </div>
    );
}

function SubtitleBar({ text, frame, stageFrom }) {
    const localF = Math.max(0, frame - stageFrom);
    const op = interpolate(localF, [0, 15], [0, 1], { extrapolateRight: "clamp" });

    return (
        <div
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
                background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                padding: "0 120px 18px",
            }}
        >
            <div
                style={{
                    opacity: op,
                    fontSize: 30,
                    color: "#fff",
                    textAlign: "center",
                    fontFamily: SANS,
                    lineHeight: 1.5,
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                    background: "rgba(0,0,0,0.6)",
                    padding: "10px 28px",
                    borderRadius: 10,
                    maxWidth: 1600,
                }}
            >
                {text}
            </div>
        </div>
    );
}

// ─── SLIDE TUTORIEL ──────────────────────────────────────────────────────────

function TutorialSlide({ filename, code, stages, audioFile, stepNum, totalSteps }) {
    const frame = useCurrentFrame();

    const currentStage = stages.reduce((acc, s) => (frame >= s.from ? s : acc), stages[0]);
    const stageFrom    = currentStage.from;

    return (
        <div style={{
            width: "100%", height: "100%",
            background: BG,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            fontFamily: SANS,
        }}>
            {/* Audio narration */}
            <Audio src={staticFile(audioFile)} />

            {/* Barre titre */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 44px",
                borderBottom: "1px solid #21262d",
                background: "#010409",
                flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#ff5f57" }} />
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#febc2e" }} />
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#28c840" }} />
                    <span style={{ marginLeft: 20, fontSize: 28, color: "#8b949e", fontFamily: MONO }}>
                        {filename}
                    </span>
                </div>
                <div style={{
                    fontSize: 24,
                    color: "#8b949e",
                    background: "#161b22",
                    border: "1px solid #30363d",
                    padding: "6px 18px",
                    borderRadius: 20,
                }}>
                    Étape {stepNum} / {totalSteps}
                </div>
            </div>

            {/* Corps principal : code (gauche) + explication (droite) */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                {/* GAUCHE : Code */}
                <div style={{
                    width: "60%",
                    background: "#0d1117",
                    borderRight: "1px solid #21262d",
                    padding: "30px 20px 120px 30px",
                    overflowY: "hidden",
                }}>
                    <CodeDisplay
                        code={code}
                        highlightedLines={currentStage.lines}
                    />
                </div>

                {/* DROITE : Explication */}
                <div style={{
                    width: "40%",
                    background: PANEL,
                    position: "relative",
                }}>
                    <ExplanationPanel
                        key={stageFrom}
                        icon={currentStage.icon}
                        concept={currentStage.concept}
                        explain={currentStage.explain}
                        frame={frame}
                        stageFrom={stageFrom}
                    />
                </div>
            </div>

            {/* Sous-titres */}
            <SubtitleBar
                key={stageFrom}
                text={currentStage.subtitle}
                frame={frame}
                stageFrom={stageFrom}
            />
        </div>
    );
}

// ─── SLIDE INTRO ─────────────────────────────────────────────────────────────

function IntroSlide() {
    const frame = useCurrentFrame();

    const fade = (s) => interpolate(frame, [s, s + 24], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const rise = (s) => interpolate(frame, [s, s + 24], [50, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const FILES = [
        { name: "Root.jsx",      color: "#ff7b72", icon: "🎬" },
        { name: "App.jsx",       color: "#7ee787", icon: "🗂️" },
        { name: "LittleGuy.jsx", color: "#d2a8ff", icon: "🧍" },
        { name: "Bubble.jsx",    color: "#ffa657", icon: "💬" },
        { name: "Plane.jsx",     color: "#58a6ff", icon: "✈️" },
        { name: "Scene3.jsx",    color: "#79c0ff", icon: "🎬" },
    ];

    return (
        <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
            fontFamily: SANS,
            position: "relative",
        }}>
            <Audio src={staticFile("narration/01_intro.wav")} />

            <div style={{
                opacity: fade(0), transform: `translateY(${rise(0)}px)`,
                fontSize: 76, fontWeight: "bold", color: "#e6edf3", textAlign: "center",
            }}>
                🎬 Motion Design avec Remotion
            </div>

            <div style={{
                opacity: fade(20), transform: `translateY(${rise(20)}px)`,
                fontSize: 38, color: "#79c0ff", textAlign: "center",
            }}>
                Tutoriel complet · React + CSS + Trigonométrie
            </div>

            <div style={{ opacity: fade(50), marginTop: 20, display: "flex", gap: 24 }}>
                {[["4","Scènes"], ["960","Frames"], ["24","FPS"], ["40s","Durée"], ["1920×1080","Full HD"]].map(([v,l]) => (
                    <div key={l} style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        background: "#161b22", border: "2px solid #30363d",
                        borderRadius: 16, padding: "18px 28px",
                    }}>
                        <span style={{ fontSize: 42, color: "#58a6ff", fontWeight: "bold" }}>{v}</span>
                        <span style={{ fontSize: 22, color: "#8b949e", marginTop: 4 }}>{l}</span>
                    </div>
                ))}
            </div>

            <div style={{ opacity: fade(80), marginTop: 20, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
                {FILES.map(({ name, color, icon }) => (
                    <div key={name} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: "#161b22", border: `2px solid ${color}33`,
                        borderRadius: 12, padding: "12px 22px",
                        fontSize: 26, color,
                    }}>
                        <span>{icon}</span>
                        <span style={{ fontFamily: MONO }}>{name}</span>
                    </div>
                ))}
            </div>

            <div style={{
                opacity: fade(110),
                position: "absolute", bottom: 30,
                fontSize: 26, color: "#8b949e",
            }}>
                💬 Narration : Microsoft Paul · Voix française
            </div>
        </div>
    );
}

// ─── SLIDE OUTRO ─────────────────────────────────────────────────────────────

function OutroSlide() {
    const frame = useCurrentFrame();
    const op = interpolate(frame, [0, 30], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const STEPS = [
        "1️⃣  Créer Root.jsx : Composition avec durée, fps, résolution",
        "2️⃣  Créer App.jsx : enchaîner les scènes avec <Sequence>",
        "3️⃣  Créer LittleGuy.jsx : useCurrentFrame + Math.sin = marche",
        "4️⃣  Créer Bubble.jsx : div + borderRadius + border trick",
        "5️⃣  Créer Plane.jsx : frame × vitesse + Math.sin oscillation",
        "6️⃣  Créer Scene3.jsx : coordonner plusieurs animations",
    ];

    return (
        <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            opacity: op,
            fontFamily: SANS,
            padding: "0 120px",
            boxSizing: "border-box",
        }}>
            <Audio src={staticFile("narration/08_outro.wav")} />

            <div style={{ fontSize: 72, fontWeight: "bold", color: "#e6edf3", textAlign: "center" }}>
                🎉 Récapitulatif
            </div>

            <div style={{ width: "100%", marginTop: 10 }}>
                {STEPS.map((s, i) => (
                    <div key={i} style={{
                        fontSize: 28, color: "#e6edf3",
                        padding: "14px 28px",
                        background: i % 2 === 0 ? "#161b22" : "#0d1117",
                        borderLeft: "4px solid #58a6ff",
                        marginBottom: 6,
                        borderRadius: 8,
                        lineHeight: 1.5,
                    }}>
                        {s}
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: 16, fontSize: 30, color: "#79c0ff", textAlign: "center",
            }}>
                Remotion v4 · github.com/lion92
            </div>
        </div>
    );
}

// ─── COMPOSITION PRINCIPALE ──────────────────────────────────────────────────
//
//  Slide         | from  | durée | audio (frames)
//  ──────────────────────────────────────────────
//  Intro         |     0 |  420  | 394
//  Root.jsx      |   420 |  620  | 593
//  App.jsx       |  1040 |  570  | 543
//  LittleGuy.jsx |  1610 |  860  | 834
//  Bubble.jsx    |  2470 |  510  | 481
//  Plane.jsx     |  2980 |  580  | 554
//  Scene3.jsx    |  3560 |  560  | 538
//  Outro         |  4120 |  540  | 504
//  ─────────────────────────────────────
//  Total         |       | 4660  | ~3 min 14s

export default function TutorialVideo() {
    return (
        <>
            {/* Intro */}
            <Sequence from={0} durationInFrames={420}>
                <IntroSlide />
            </Sequence>

            {/* Root.jsx */}
            <Sequence from={420} durationInFrames={620}>
                <TutorialSlide
                    filename="Root.jsx"
                    code={CODE.root}
                    stages={STAGES.root}
                    audioFile="narration/02_root.wav"
                    stepNum={1}
                    totalSteps={6}
                />
            </Sequence>

            {/* App.jsx */}
            <Sequence from={1040} durationInFrames={570}>
                <TutorialSlide
                    filename="App.jsx"
                    code={CODE.app}
                    stages={STAGES.app}
                    audioFile="narration/03_app.wav"
                    stepNum={2}
                    totalSteps={6}
                />
            </Sequence>

            {/* LittleGuy.jsx */}
            <Sequence from={1610} durationInFrames={860}>
                <TutorialSlide
                    filename="LittleGuy.jsx"
                    code={CODE.littleguy}
                    stages={STAGES.littleguy}
                    audioFile="narration/04_littleguy.wav"
                    stepNum={3}
                    totalSteps={6}
                />
            </Sequence>

            {/* Bubble.jsx */}
            <Sequence from={2470} durationInFrames={510}>
                <TutorialSlide
                    filename="Bubble.jsx"
                    code={CODE.bubble}
                    stages={STAGES.bubble}
                    audioFile="narration/05_bubble.wav"
                    stepNum={4}
                    totalSteps={6}
                />
            </Sequence>

            {/* Plane.jsx */}
            <Sequence from={2980} durationInFrames={580}>
                <TutorialSlide
                    filename="Plane.jsx"
                    code={CODE.plane}
                    stages={STAGES.plane}
                    audioFile="narration/06_plane.wav"
                    stepNum={5}
                    totalSteps={6}
                />
            </Sequence>

            {/* Scene3.jsx */}
            <Sequence from={3560} durationInFrames={560}>
                <TutorialSlide
                    filename="Scene3.jsx"
                    code={CODE.scene3}
                    stages={STAGES.scene3}
                    audioFile="narration/07_scene3.wav"
                    stepNum={6}
                    totalSteps={6}
                />
            </Sequence>

            {/* Outro */}
            <Sequence from={4120} durationInFrames={540}>
                <OutroSlide />
            </Sequence>
        </>
    );
}
