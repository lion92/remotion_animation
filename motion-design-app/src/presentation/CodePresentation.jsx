// CodePresentation.jsx — Présentation animée du code source

import { Sequence, useCurrentFrame, interpolate } from "remotion";

// ─── THÈME ÉDITEUR ───────────────────────────────────────────────────────────
const MONO   = "'Courier New', Courier, monospace";
const SANS   = "'Arial', 'Helvetica', sans-serif";
const BG     = "#0d1117";
const CODE_BG = "#161b22";
const BORDER = "#30363d";

// ─── EXTRAITS DE CODE ────────────────────────────────────────────────────────

const ROOT_CODE =
`// Root.jsx — Le canvas de la vidéo

import { Composition } from "remotion";
import App from "./App";

export const RemotionRoot = () => (
    <Composition
        id="Cartoon"
        component={App}

        // 960 frames ÷ 24fps = 40 secondes
        durationInFrames={960}
        fps={24}

        // Full HD
        width={1920}
        height={1080}
    />
);`;

const APP_CODE =
`// App.jsx — Les 4 scènes séquencées dans le temps

import { Sequence } from "remotion";

export default function App() {
    return (
        <>
            <Sequence from={0} durationInFrames={240}>
                <Scene1 />   {/* 0s → 10s */}
            </Sequence>
            <Sequence from={240} durationInFrames={240}>
                <Scene2 />   {/* 10s → 20s */}
            </Sequence>
            <Sequence from={480} durationInFrames={240}>
                <Scene3 />   {/* 20s → 30s */}
            </Sequence>
            <Sequence from={720} durationInFrames={240}>
                <Scene4 />   {/* 30s → 40s */}
            </Sequence>
        </>
    );
}`;

const LITTLEGUY_CODE =
`// LittleGuy.jsx — Animation par trigonométrie

import { useCurrentFrame } from "remotion";

export default function LittleGuy({ lookingUp = false }) {
    const frame = useCurrentFrame();
    // Oscillation sinusoïdale = cycle de marche
    const walkCycle = frame * 0.06;
    const armAngle  = Math.sin(walkCycle) * 18; // +18° à -18°
    const legAngle  = Math.sin(walkCycle) * 18; // en opposition
    const headRotation = lookingUp ? -20 : 0;

    return (
        <div style={{ position: "relative", width: 200, height: 320 }}>
            {/* Tête qui pivote si lookingUp */}
            <div style={{ transform: 'rotate(' + headRotation + 'deg)' }} />
            {/* Bras et jambes oscillent en miroir */}
            <div style={{ transform: 'rotate(' + armAngle + 'deg)' }} />
            <div style={{ transform: 'rotate(' + (-legAngle) + 'deg)' }} />
        </div>
    );
}`;

const BUBBLE_CODE =
`// Bubble.jsx — Bulle de dialogue en CSS pur

export default function Bubble({ text }) {
    return (
        <div style={{
            position: "absolute", background: "white",
            padding: "20px", borderRadius: "20px",
            fontSize: "24px", fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}>
            {text}
            {/* Triangle CSS : border trick ! */}
            <div style={{
                position: "absolute", bottom: "-20px",
                width: 0, height: 0,
                borderLeft:  "20px solid transparent",
                borderRight: "20px solid transparent",
                borderTop:   "20px solid white",
            }} />
        </div>
    );
}`;

const PLANE_CODE =
`// Plane.jsx — Mouvement fluide en 2 dimensions

import { useCurrentFrame } from "remotion";

export default function Plane() {
    const frame = useCurrentFrame();

    const x = frame * 6 - 400;              // vitesse linéaire
    const y = Math.sin(frame * 0.04) * 15;  // légère turbulence

    return (
        <div style={{
            position: "absolute",
            top:  150 + y,  // oscille 135px ↔ 165px
            left: x,        // traverse l'écran de gauche à droite
            fontSize: 120,
        }}>
            ✈️
        </div>
    );
}`;

const SCENE3_CODE =
`// Scene3.jsx — Aéroport : 2 animations simultanées

import { useCurrentFrame } from "remotion";

export default function Scene3() {
    // frame repart à 0 dans chaque <Sequence> !
    const frame = useCurrentFrame();

    const planeY     = Math.min(frame * 1.5, 350); // atterrissage
    const characterX = Math.min(frame * 1.2, 420); // course

    return (
        <div style={{ width: "100%", height: "100%" }}>
            {/* Avion qui descend vers la piste */}
            <div style={{ top: planeY, right: 250 }}>✈️</div>

            {/* Personnage qui court vers l'avion */}
            <div style={{ bottom: 120, left: characterX }}>
                <LittleGuy lookingUp />
            </div>
        </div>
    );
}`;

// ─── COLORISATION SYNTAXIQUE ──────────────────────────────────────────────────

function getLineColor(line) {
    const t = line.trimStart();
    if (t.startsWith("//"))                          return "#6a9955"; // vert commentaire
    if (t.startsWith("{/*") || t.startsWith("*/"))   return "#6a9955";
    if (/^(import|export default|export const)/.test(t)) return "#c586c0"; // violet
    if (/^(const|let|return)/.test(t))               return "#9cdcfe"; // bleu clair
    if (/^(function |export default function)/.test(t)) return "#dcdcaa"; // jaune
    if (/Math\.(sin|min|max|abs)/.test(t))           return "#4ec9b0"; // cyan
    if (/useCurrentFrame/.test(t))                   return "#4ec9b0";
    if (/^<[A-Z]/.test(t))                           return "#4ec9b0"; // composant React
    if (/^<\/?div|^<\/?span|^<>|^<\/>/.test(t))     return "#569cd6"; // bleu tag HTML
    if (t === "/>")                                  return "#808080";
    if (t.startsWith("/>"))                          return "#569cd6";
    return "#d4d4d4";
}

function ColorizedCode({ code }) {
    const lines = code.split("\n");
    return (
        <div>
            {lines.map((line, i) => (
                <div
                    key={i}
                    style={{
                        color: getLineColor(line),
                        minHeight: "1.6em",
                        whiteSpace: "pre",
                        fontFamily: MONO,
                    }}
                >
                    {line || " "}
                </div>
            ))}
        </div>
    );
}

// ─── SLIDE CODE ──────────────────────────────────────────────────────────────

const CHARS_PER_FRAME = 3;

function CodeSlide({ filename, code, explanation, accentColor = "#388bfd" }) {
    const frame = useCurrentFrame();

    const charsToShow  = Math.min(Math.floor(frame * CHARS_PER_FRAME), code.length);
    const showCursor   = charsToShow < code.length || Math.floor(frame / 12) % 2 === 0;
    const typingFrames = Math.ceil(code.length / CHARS_PER_FRAME);

    const explainOpacity = interpolate(
        frame,
        [typingFrames, typingFrames + 20],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const visibleCode = code.slice(0, charsToShow) + (showCursor ? "█" : "");

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: BG,
                display: "flex",
                flexDirection: "column",
                padding: 44,
                boxSizing: "border-box",
            }}
        >
            {/* Barre style macOS */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#28c840" }} />
                <span style={{ marginLeft: 20, fontSize: 26, color: "#8b949e", fontFamily: MONO }}>
                    {filename}
                </span>
            </div>

            {/* Zone code */}
            <div
                style={{
                    flex: 1,
                    background: CODE_BG,
                    borderRadius: 12,
                    border: `2px solid ${BORDER}`,
                    padding: "28px 36px",
                    overflow: "hidden",
                    fontSize: 22,
                    lineHeight: 1.6,
                }}
            >
                <ColorizedCode code={visibleCode} />
            </div>

            {/* Explication */}
            <div
                style={{
                    opacity: explainOpacity,
                    marginTop: 22,
                    background: "#1c2128",
                    border: `2px solid ${accentColor}`,
                    borderRadius: 12,
                    padding: "16px 28px",
                    fontSize: 28,
                    color: "#e6edf3",
                    lineHeight: 1.5,
                    fontFamily: SANS,
                }}
            >
                💡 {explanation}
            </div>
        </div>
    );
}

// ─── SLIDE INTRO ─────────────────────────────────────────────────────────────

function IntroSlide() {
    const frame = useCurrentFrame();

    const fade = (start) =>
        interpolate(frame, [start, start + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

    const rise = (start) =>
        interpolate(frame, [start, start + 20], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
        });

    const STATS = [
        ["4",         "Scènes"],
        ["960",       "Frames"],
        ["24",        "FPS"],
        ["40s",       "Durée"],
        ["1920×1080", "Full HD"],
    ];

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
                fontFamily: SANS,
            }}
        >
            {/* Titre */}
            <div
                style={{
                    opacity: fade(0),
                    transform: `translateY(${rise(0)}px)`,
                    fontSize: 72,
                    fontWeight: "bold",
                    color: "#e6edf3",
                    textAlign: "center",
                }}
            >
                🎬 Motion Design avec Remotion
            </div>

            {/* Sous-titre */}
            <div
                style={{
                    opacity: fade(20),
                    transform: `translateY(${rise(20)}px)`,
                    fontSize: 40,
                    color: "#79c0ff",
                    textAlign: "center",
                }}
            >
                Animation React en JSX pur — 0 dépendance externe
            </div>

            {/* Stats */}
            <div style={{ opacity: fade(40), marginTop: 40, display: "flex", gap: 36 }}>
                {STATS.map(([val, label]) => (
                    <div
                        key={label}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            background: "#161b22",
                            border: "2px solid #30363d",
                            borderRadius: 16,
                            padding: "20px 32px",
                        }}
                    >
                        <span style={{ fontSize: 46, color: "#58a6ff", fontWeight: "bold" }}>{val}</span>
                        <span style={{ fontSize: 24, color: "#8b949e", marginTop: 4 }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Stack technique */}
            <div
                style={{
                    opacity: fade(60),
                    marginTop: 30,
                    display: "flex",
                    gap: 24,
                    alignItems: "center",
                    fontSize: 34,
                    color: "#8b949e",
                }}
            >
                <span style={{ color: "#61dafb" }}>React</span>
                <span>+</span>
                <span style={{ color: "#ff4f64" }}>Remotion</span>
                <span>+</span>
                <span style={{ color: "#7ee787" }}>CSS-in-JS</span>
                <span>+</span>
                <span style={{ color: "#d2a8ff" }}>Math.sin()</span>
            </div>
        </div>
    );
}

// ─── SLIDE OUTRO ─────────────────────────────────────────────────────────────

function OutroSlide() {
    const frame = useCurrentFrame();

    const op = interpolate(frame, [0, 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 32,
                opacity: op,
                fontFamily: SANS,
            }}
        >
            <div style={{ fontSize: 100 }}>🎉</div>
            <div style={{ fontSize: 60, fontWeight: "bold", color: "#e6edf3", textAlign: "center" }}>
                Animation complète en JSX pur
            </div>
            <div
                style={{
                    fontSize: 36,
                    color: "#8b949e",
                    textAlign: "center",
                    maxWidth: 1400,
                    lineHeight: 1.6,
                }}
            >
                Pas de canvas, pas de WebGL<br />
                Juste React + CSS + trigonométrie
            </div>
            <div style={{ fontSize: 32, color: "#79c0ff", marginTop: 10 }}>
                Remotion v4 · github.com/lion92
            </div>
        </div>
    );
}

// ─── COMPOSITION PRINCIPALE ──────────────────────────────────────────────────
//
//   Slide          | from  | durée | fin
//   ─────────────────────────────────────
//   Intro          |    0  |  180  |  179
//   Root.jsx       |  180  |  240  |  419
//   App.jsx        |  420  |  270  |  689
//   LittleGuy.jsx  |  690  |  330  | 1019
//   Bubble.jsx     | 1020  |  240  | 1259
//   Plane.jsx      | 1260  |  210  | 1469
//   Scene3.jsx     | 1470  |  270  | 1739
//   Outro          | 1740  |  180  | 1919
//   ─────────────────────────────────────
//   Total          |       | 1920  | 80 s

export default function CodePresentation() {
    return (
        <>
            <Sequence from={0} durationInFrames={180}>
                <IntroSlide />
            </Sequence>

            <Sequence from={180} durationInFrames={240}>
                <CodeSlide
                    filename="Root.jsx"
                    code={ROOT_CODE}
                    explanation="Composition = le canvas de la vidéo. On y déclare : durée (960 frames), cadence (24fps), résolution (1920×1080 Full HD). Toute la vidéo naît ici."
                    accentColor="#ff7b72"
                />
            </Sequence>

            <Sequence from={420} durationInFrames={270}>
                <CodeSlide
                    filename="App.jsx"
                    code={APP_CODE}
                    explanation="<Sequence from={240}> = 'démarre à la frame 240 = 10s'. C'est la timeline de la vidéo ! Chaque scène dure 240 frames = 10 secondes à 24fps."
                    accentColor="#7ee787"
                />
            </Sequence>

            <Sequence from={690} durationInFrames={330}>
                <CodeSlide
                    filename="LittleGuy.jsx"
                    code={LITTLEGUY_CODE}
                    explanation="useCurrentFrame() retourne la frame courante. Math.sin() oscille entre −1 et +1 en continu → simulation parfaite d'un cycle de marche avec de la trigonométrie !"
                    accentColor="#d2a8ff"
                />
            </Sequence>

            <Sequence from={1020} durationInFrames={240}>
                <CodeSlide
                    filename="Bubble.jsx"
                    code={BUBBLE_CODE}
                    explanation='La flèche du ballon = triangle CSS pur ! En fixant width/height à 0 et en colorant une seule bordure, le navigateur dessine un triangle parfait.'
                    accentColor="#ffa657"
                />
            </Sequence>

            <Sequence from={1260} durationInFrames={210}>
                <CodeSlide
                    filename="Plane.jsx"
                    code={PLANE_CODE}
                    explanation="frame × 6 = déplacement linéaire (vitesse constante). Math.sin(frame × 0.04) × 15 = ±15px d'oscillation verticale. Deux formules = un vol réaliste !"
                    accentColor="#58a6ff"
                />
            </Sequence>

            <Sequence from={1470} durationInFrames={270}>
                <CodeSlide
                    filename="Scene3.jsx"
                    code={SCENE3_CODE}
                    explanation="Grâce à <Sequence>, frame repart à 0 dans chaque scène. Math.min() plafonne l'animation. Ici : avion qui atterrit ET personnage qui court — en même temps !"
                    accentColor="#79c0ff"
                />
            </Sequence>

            <Sequence from={1740} durationInFrames={180}>
                <OutroSlide />
            </Sequence>
        </>
    );
}
