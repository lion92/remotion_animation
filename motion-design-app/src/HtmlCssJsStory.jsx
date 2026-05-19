import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const FPS = 24;
const SCENE_DURATION = 840;
const TOTAL_SCENES = 8;
const MONO = "'Courier New', Courier, monospace";
const SANS = "'Inter', 'Arial', sans-serif";

const CODE = {
  htmlBase: `<main class="atelier">
  <header>
    <h1>Atelier des lumieres</h1>
    <p>Des lampes faites a la main.</p>
  </header>

  <button>Allumer la vitrine</button>
</main>`,
  cssBase: `.atelier {
  max-width: 760px;
  margin: 48px auto;
  padding: 32px;
  background: #fff7ed;
  color: #1f2937;
  border: 2px solid #f59e0b;
}`,
  cssButton: `button {
  height: 56px;
  padding: 0 24px;
  border: 0;
  border-radius: 8px;
  background: #2563eb;
  color: white;
}`,
  jsClick: `const bouton = document.querySelector("button");

bouton.addEventListener("click", () => {
  document.body.classList.toggle("nuit");
  bouton.textContent = "La vitrine brille";
});`,
  jsList: `const produits = ["Lampe lune", "Veilleuse mer", "Bougie code"];

produits.forEach((nom) => {
  const carte = document.createElement("article");
  carte.textContent = nom;
  vitrine.append(carte);
});`,
  final: `<main class="atelier">
  <h1>Atelier des lumieres</h1>
  <section id="vitrine"></section>
  <button>Changer d'ambiance</button>
</main>`,
};

const SUBTITLES = {
  1: [
    [55, 210, "Dans une petite rue, Nina veut ouvrir un atelier en ligne."],
    [245, 455, "Elle a une idee claire : montrer ses lampes, raconter son travail, et inviter les visiteurs."],
    [500, 760, "Pour transformer cette idee en page vivante, trois compagnons arrivent : HTML, CSS et JavaScript."],
  ],
  2: [
    [50, 225, "HTML commence. Il donne du sens a chaque morceau de la page."],
    [260, 510, "Un titre n'est pas juste du texte : c'est un h1. Un paragraphe devient p. Un bouton devient button."],
    [550, 775, "Le navigateur lit ces balises comme le plan d'une maison."],
  ],
  3: [
    [45, 225, "CSS prend le plan et lui donne une atmosphere."],
    [265, 520, "Il choisit les couleurs, les espacements, la taille des textes et la forme des boutons."],
    [555, 770, "La meme page devient plus lisible, plus belle, plus accueillante."],
  ],
  4: [
    [50, 235, "Nina ajoute ensuite une vraie interaction."],
    [270, 525, "JavaScript ecoute le clic du visiteur et change la page au bon moment."],
    [565, 775, "Un bouton peut allumer une vitrine, ouvrir un menu, ou verifier un formulaire."],
  ],
  5: [
    [45, 225, "Une application contient souvent des donnees."],
    [260, 520, "JavaScript peut parcourir une liste, creer des cartes, et les ajouter dans la page."],
    [555, 775, "HTML accueille le contenu, CSS le presente, JavaScript le fabrique et le met a jour."],
  ],
  6: [
    [50, 250, "Voici la demo complete : structure, style, puis interaction."],
    [285, 545, "A gauche, le code explique ce que l'on ecrit. A droite, le navigateur montre ce que l'utilisateur voit."],
    [585, 780, "Le web fonctionne par couches simples qui collaborent tres bien."],
  ],
  7: [
    [45, 235, "Pour retenir, imagine une scene de theatre."],
    [275, 500, "HTML place les acteurs. CSS dessine les costumes et les lumieres. JavaScript dirige les actions."],
    [540, 770, "Si une couche change, les deux autres continuent de faire leur travail."],
  ],
  8: [
    [55, 240, "L'atelier de Nina est pret."],
    [275, 530, "Ce n'est pas de la magie : c'est une conversation entre structure, style et logique."],
    [570, 775, "Avec HTML, CSS et JavaScript, une idee devient un lieu que l'on peut visiter, comprendre et utiliser."],
  ],
};

const clampFade = (frame, start, end) =>
  interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const sceneFade = (frame) =>
  interpolate(frame, [0, 28, SCENE_DURATION - 30, SCENE_DURATION], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

function Dot({ color }) {
  return <div style={{ width: 15, height: 15, borderRadius: "50%", background: color }} />;
}

function SceneShell({ scene, title, accent, children, music = "music2.mp3", mood = "night" }) {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame);
  const bg = mood === "day" ? "#f8fafc" : "#101418";
  const text = mood === "day" ? "#172033" : "#f8fafc";

  return (
    <AbsoluteFill style={{ opacity, background: bg, color: text, fontFamily: SANS, overflow: "hidden" }}>
      <Audio src={staticFile(`audio/html_story_narration${scene}.mp3`)} volume={1} />
      <Audio src={staticFile(`audio/${music}`)} volume={0.11} />
      <StageBackdrop accent={accent} mood={mood} />
      <div
        style={{
          position: "absolute",
          top: 34,
          left: 52,
          right: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: 26, color: mood === "day" ? "#475569" : "#cbd5e1", letterSpacing: 0 }}>
          Chapitre {scene} / {TOTAL_SCENES}
        </div>
        <div style={{ fontSize: 38, fontWeight: 900, color: accent, letterSpacing: 0 }}>{title}</div>
      </div>
      {children}
      <SubtitleLayer items={SUBTITLES[scene]} mood={mood} />
    </AbsoluteFill>
  );
}

function StageBackdrop({ accent, mood }) {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, SCENE_DURATION], [0, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const base =
    mood === "day"
      ? "linear-gradient(180deg, #f8fafc 0%, #ecfeff 46%, #fff7ed 100%)"
      : "linear-gradient(180deg, #101418 0%, #18212a 48%, #20262d 100%)";

  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: base }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${accent}18 1px, transparent 1px), linear-gradient(90deg, ${accent}14 1px, transparent 1px)`,
          backgroundSize: "88px 88px",
          transform: `translateY(${drift}px)`,
          opacity: mood === "day" ? 0.48 : 0.78,
          maskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 96%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 118,
          background: mood === "day" ? "#d9a861" : "#0b1020",
          borderTop: `4px solid ${accent}55`,
        }}
      />
    </>
  );
}

function SubtitleLayer({ items, mood }) {
  const frame = useCurrentFrame();

  return (
    <>
      {items.map(([start, end, text], index) => {
        if (frame < start || frame > end) return null;
        const opacity = interpolate(frame, [start, start + 16, end - 16, end], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "50%",
              bottom: 48,
              transform: "translateX(-50%)",
              opacity,
              background: mood === "day" ? "rgba(255,255,255,0.9)" : "rgba(8,13,20,0.86)",
              border: mood === "day" ? "2px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.14)",
              borderRadius: 8,
              color: mood === "day" ? "#172033" : "#ffffff",
              fontSize: 34,
              lineHeight: 1.34,
              padding: "14px 34px",
              maxWidth: 1480,
              textAlign: "center",
              zIndex: 40,
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            {text}
          </div>
        );
      })}
    </>
  );
}

function Character({ x, y, scale = 1, color = "#f59e0b", label = "Nina", looking = false }) {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.09) * 8;
  const arm = Math.sin(frame * 0.13) * 16;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + bob,
        width: 170,
        height: 260,
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
        zIndex: 12,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 52,
          top: 0,
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "#ffd7a8",
          border: "5px solid #172033",
          transform: looking ? "rotate(-8deg)" : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 76,
          width: 80,
          height: 100,
          borderRadius: 8,
          background: color,
          border: "5px solid #172033",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 94,
          width: 70,
          height: 16,
          borderRadius: 8,
          background: "#ffd7a8",
          border: "4px solid #172033",
          transform: `rotate(${arm}deg)`,
          transformOrigin: "right center",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          top: 94,
          width: 74,
          height: 16,
          borderRadius: 8,
          background: "#ffd7a8",
          border: "4px solid #172033",
          transform: `rotate(${-arm}deg)`,
          transformOrigin: "left center",
        }}
      />
      <div style={{ position: "absolute", left: 58, top: 174, width: 18, height: 74, background: "#172033", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 98, top: 174, width: 18, height: 74, background: "#172033", borderRadius: 8 }} />
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          top: 252,
          textAlign: "center",
          fontSize: 24,
          fontWeight: 900,
          color: "#172033",
          background: "rgba(255,255,255,0.8)",
          borderRadius: 8,
          padding: "5px 0",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SpeechBubble({ x, y, text, start = 90, accent = "#2563eb" }) {
  const frame = useCurrentFrame();
  const opacity = clampFade(frame, start, start + 22);
  const rise = interpolate(frame, [start, start + 22], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 430,
        opacity,
        transform: `translateY(${rise}px)`,
        background: "#ffffff",
        color: "#172033",
        border: `3px solid ${accent}`,
        borderRadius: 8,
        padding: "22px 26px",
        fontSize: 30,
        lineHeight: 1.28,
        fontWeight: 800,
        zIndex: 18,
        boxShadow: "0 22px 55px rgba(0,0,0,0.2)",
      }}
    >
      {text}
      <div
        style={{
          position: "absolute",
          left: 46,
          bottom: -28,
          width: 0,
          height: 0,
          borderLeft: "22px solid transparent",
          borderRight: "22px solid transparent",
          borderTop: `28px solid ${accent}`,
        }}
      />
    </div>
  );
}

function CodeWindow({ title, code, x, y, w = 680, h = 540, start = 90, accent = "#60a5fa", highlight = [] }) {
  const frame = useCurrentFrame();
  const visibleChars = Math.max(0, Math.min(code.length, Math.floor((frame - start) * 2.75)));
  const opacity = clampFade(frame, start - 24, start + 16);
  const slide = interpolate(frame, [start - 24, start + 18], [44, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const visible = code.slice(0, visibleChars);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        transform: `translateY(${slide}px)`,
        background: "#0b1020",
        border: `2px solid ${accent}77`,
        borderRadius: 8,
        boxShadow: "0 22px 70px rgba(0,0,0,0.38)",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      <div
        style={{
          height: 58,
          background: "#111827",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 22px",
        }}
      >
        <Dot color="#ef4444" />
        <Dot color="#f59e0b" />
        <Dot color="#22c55e" />
        <span style={{ marginLeft: 14, color: "#cbd5e1", fontSize: 24, fontFamily: MONO }}>{title}</span>
      </div>
      <div style={{ padding: "24px 28px", fontFamily: MONO, fontSize: 25, lineHeight: 1.46 }}>
        {visible.split("\n").map((line, index) => {
          const lineNumber = index + 1;
          return (
            <div
              key={index}
              style={{
                minHeight: 36,
                whiteSpace: "pre",
                color: syntaxColor(line),
                background: highlight.includes(lineNumber) ? `${accent}22` : "transparent",
                borderLeft: highlight.includes(lineNumber) ? `4px solid ${accent}` : "4px solid transparent",
                paddingLeft: highlight.includes(lineNumber) ? 10 : 0,
              }}
            >
              {line || " "}
            </div>
          );
        })}
        {visibleChars < code.length && <span style={{ color: accent }}>_</span>}
      </div>
    </div>
  );
}

function syntaxColor(line) {
  const text = line.trim();
  if (text.startsWith("<") || text.startsWith("</")) return "#60a5fa";
  if (text.startsWith(".") || text.startsWith("#") || text.includes("{") || text.includes("}")) return "#c084fc";
  if (text.includes(":")) return "#22c55e";
  if (text.includes("const") || text.includes("forEach")) return "#facc15";
  if (text.includes("addEventListener") || text.includes("querySelector") || text.includes("createElement")) return "#fb923c";
  return "#e5e7eb";
}

function BrowserMockup({ x, y, w = 780, h = 540, stage = "raw", start = 120 }) {
  const frame = useCurrentFrame();
  const opacity = clampFade(frame, start, start + 28);
  const night = stage === "js" && frame > 430;
  const cards = stage === "list" || stage === "final";
  const polished = stage !== "raw";
  const buttonPulse = 1 + Math.sin(frame * 0.08) * 0.035;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity,
        background: "#ffffff",
        borderRadius: 8,
        border: "2px solid rgba(15,23,42,0.18)",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
        zIndex: 11,
      }}
    >
      <div style={{ height: 58, background: "#e5e7eb", display: "flex", alignItems: "center", padding: "0 20px", gap: 10 }}>
        <Dot color="#ef4444" />
        <Dot color="#f59e0b" />
        <Dot color="#22c55e" />
        <div
          style={{
            marginLeft: 18,
            height: 28,
            flex: 1,
            borderRadius: 5,
            background: "#f8fafc",
            color: "#64748b",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            paddingLeft: 18,
          }}
        >
          https://atelier-lumieres.local
        </div>
      </div>
      <div
        style={{
          height: h - 58,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: night ? "#111827" : polished ? "#fff7ed" : "#ffffff",
          color: night ? "#e0f2fe" : "#172033",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: polished ? 520 : 460,
            minHeight: polished ? 315 : 240,
            borderRadius: polished ? 8 : 0,
            background: polished ? (night ? "#172033" : "#ffffff") : "transparent",
            border: polished ? "2px solid #f59e0b" : "0",
            padding: polished ? 34 : 0,
            textAlign: polished ? "center" : "left",
            boxShadow: polished ? "0 18px 45px rgba(245,158,11,0.2)" : "none",
          }}
        >
          <div style={{ fontSize: polished ? 45 : 34, fontWeight: 900, marginBottom: 16 }}>Atelier des lumieres</div>
          <div style={{ fontSize: polished ? 25 : 24, color: night ? "#bfdbfe" : "#475569", marginBottom: 28 }}>
            Des lampes faites a la main.
          </div>
          {cards && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 26 }}>
              {["Lampe lune", "Veilleuse mer", "Bougie code"].map((item, index) => (
                <div
                  key={item}
                  style={{
                    opacity: clampFade(frame, 230 + index * 70, 260 + index * 70),
                    background: night ? "#0f172a" : "#eff6ff",
                    border: "2px solid #2563eb55",
                    borderRadius: 8,
                    minHeight: 86,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: night ? "#dbeafe" : "#1e3a8a",
                    fontSize: 19,
                    fontWeight: 800,
                    padding: "0 10px",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 210,
              height: polished ? 56 : 42,
              borderRadius: polished ? 8 : 2,
              background: polished ? "#2563eb" : "#d1d5db",
              color: "#ffffff",
              fontSize: polished ? 22 : 18,
              fontWeight: 800,
              transform: stage === "js" || stage === "final" ? `scale(${buttonPulse})` : "none",
            }}
          >
            {night || stage === "final" ? "La vitrine brille" : "Allumer la vitrine"}
          </div>
        </div>
      </div>
    </div>
  );
}

function TagStack() {
  const frame = useCurrentFrame();
  const tags = [
    ["main", "#f97316", 145, 190, 460],
    ["header", "#3b82f6", 235, 290, 360],
    ["h1", "#22c55e", 325, 390, 250],
    ["p", "#a855f7", 415, 490, 285],
    ["button", "#eab308", 505, 590, 315],
  ];

  return (
    <div style={{ position: "absolute", left: 1060, top: 190, width: 690, height: 570, zIndex: 11 }}>
      {tags.map(([label, color, start, top, width]) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: 90,
            top,
            width,
            height: 76,
            opacity: clampFade(frame, start, start + 24),
            transform: `translateX(${interpolate(frame, [start, start + 30], [120, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
            background: `${color}22`,
            border: `4px solid ${color}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: MONO,
            fontSize: 34,
            fontWeight: 900,
            color,
          }}
        >
          &lt;{label}&gt;
        </div>
      ))}
    </div>
  );
}

function InspectorPanel() {
  const frame = useCurrentFrame();
  const rules = [
    ["background", "#fff7ed", "#172033", 190],
    ["padding", "32px", "#22c55e", 275],
    ["border", "2px solid orange", "#f59e0b", 360],
    ["border-radius", "8px", "#db2777", 445],
  ];

  return (
    <div style={{ position: "absolute", left: 1110, top: 170, width: 570, zIndex: 16 }}>
      {rules.map(([name, value, color, start]) => (
        <div
          key={name}
          style={{
            opacity: clampFade(frame, start, start + 22),
            display: "grid",
            gridTemplateColumns: "210px 1fr",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
            background: "rgba(15,23,42,0.82)",
            border: `2px solid ${color}66`,
            borderRadius: 8,
            padding: "15px 20px",
            fontSize: 25,
            boxShadow: "0 14px 34px rgba(0,0,0,0.18)",
          }}
        >
          <span style={{ color, fontFamily: MONO }}>{name}</span>
          <span style={{ color: "#f8fafc", fontWeight: 800 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function CursorClick({ start = 365, x1 = 1265, y1 = 520, x2 = 1375, y2 = 626 }) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [start, start + 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = x1 + (x2 - x1) * progress;
  const y = y1 + (y2 - y1) * progress;
  const ring = frame > start + 62 && frame < start + 110;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 0,
          height: 0,
          borderLeft: "20px solid transparent",
          borderRight: "20px solid transparent",
          borderTop: "58px solid #ffffff",
          transform: "rotate(-28deg)",
          filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.35))",
          zIndex: 25,
        }}
      />
      {ring && (
        <div
          style={{
            position: "absolute",
            left: x2 - 30,
            top: y2 - 30,
            width: 78,
            height: 78,
            borderRadius: "50%",
            border: "4px solid #facc15",
            opacity: interpolate(frame, [start + 62, start + 110], [1, 0], { extrapolateRight: "clamp" }),
            zIndex: 24,
          }}
        />
      )}
    </>
  );
}

function LayerCards() {
  const frame = useCurrentFrame();
  const cards = [
    ["HTML", "Structure", "Les balises disent ce que chaque element veut dire.", "#f97316", 120],
    ["CSS", "Style", "Les regles transforment le plan en interface claire.", "#2563eb", 230],
    ["JavaScript", "Logique", "Le script reagit aux actions et met le contenu a jour.", "#facc15", 340],
  ];

  return (
    <div style={{ position: "absolute", left: 190, right: 190, top: 290, display: "flex", gap: 28, zIndex: 15 }}>
      {cards.map(([name, role, desc, color, start]) => (
        <div
          key={name}
          style={{
            width: 485,
            minHeight: 330,
            opacity: clampFade(frame, start, start + 28),
            transform: `translateY(${interpolate(frame, [start, start + 28], [50, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
            background: "rgba(255,255,255,0.92)",
            border: `3px solid ${color}`,
            borderRadius: 8,
            padding: "34px 34px",
            color: "#172033",
            boxShadow: `0 24px 60px ${color}24`,
          }}
        >
          <div style={{ color, fontSize: 54, fontWeight: 950, marginBottom: 10 }}>{name}</div>
          <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 18 }}>{role}</div>
          <div style={{ fontSize: 27, lineHeight: 1.35, color: "#475569" }}>{desc}</div>
        </div>
      ))}
    </div>
  );
}

function MiniTimeline() {
  const frame = useCurrentFrame();
  const steps = [
    ["1", "HTML", "#f97316", 115],
    ["2", "CSS", "#2563eb", 245],
    ["3", "JS", "#facc15", 375],
    ["4", "Page vivante", "#22c55e", 505],
  ];
  const progress = interpolate(frame, [115, 620], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: 210, right: 210, bottom: 178, height: 118, zIndex: 17 }}>
      <div style={{ position: "absolute", left: 45, right: 45, top: 38, height: 14, borderRadius: 8, background: "#263241" }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 8, background: "linear-gradient(90deg,#f97316,#2563eb,#facc15,#22c55e)" }} />
      </div>
      {steps.map(([num, label, color, start], index) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: `${index * 31.4}%`,
            top: 0,
            width: 230,
            opacity: clampFade(frame, start, start + 20),
            textAlign: "center",
          }}
        >
          <div
            style={{
              margin: "0 auto 10px",
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: color,
              color: "#111827",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 950,
              border: "5px solid #ffffff",
            }}
          >
            {num}
          </div>
          <div style={{ color: "#e5e7eb", fontSize: 26, fontWeight: 850 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function IntroScene() {
  const frame = useCurrentFrame();
  const title = clampFade(frame, 40, 92);
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 190, fps, config: { damping: 14, stiffness: 90 } });

  return (
    <SceneShell scene={1} title="L'idee de Nina" accent="#38bdf8" music="music1.mp3" mood="day">
      <Character x={245} y={558} scale={1.05} color="#fb923c" looking />
      <SpeechBubble x={330} y={365} text="Je veux une page que les gens comprennent, regardent, puis utilisent." start={120} accent="#38bdf8" />
      <div
        style={{
          position: "absolute",
          left: 930,
          top: 255,
          width: 650,
          height: 390,
          borderRadius: 8,
          background: "#ffffff",
          border: "4px solid #172033",
          boxShadow: "0 30px 80px rgba(15,23,42,0.22)",
          transform: `scale(${0.82 + pop * 0.18})`,
          opacity: clampFade(frame, 170, 220),
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 70, background: "#172033", display: "flex", alignItems: "center", paddingLeft: 28, gap: 12 }}>
          <Dot color="#ef4444" />
          <Dot color="#f59e0b" />
          <Dot color="#22c55e" />
        </div>
        <div style={{ padding: 44 }}>
          <div style={{ fontSize: 54, fontWeight: 950, color: "#172033", marginBottom: 18 }}>Atelier des lumieres</div>
          <div style={{ height: 22, width: 420, background: "#cbd5e1", borderRadius: 8, marginBottom: 22 }} />
          <div style={{ height: 22, width: 340, background: "#cbd5e1", borderRadius: 8, marginBottom: 42 }} />
          <div style={{ width: 230, height: 58, background: "#2563eb", borderRadius: 8 }} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 140,
          textAlign: "center",
          fontSize: 82,
          fontWeight: 950,
          color: "#172033",
          opacity: title,
          zIndex: 13,
        }}
      >
        HTML, CSS et JavaScript
      </div>
      <MiniTimeline />
    </SceneShell>
  );
}

function HtmlScene() {
  return (
    <SceneShell scene={2} title="HTML donne le sens" accent="#fb923c" music="music2.mp3">
      <Character x={820} y={610} scale={0.86} color="#fb923c" label="HTML" />
      <CodeWindow title="index.html" code={CODE.htmlBase} x={95} y={165} h={570} start={70} accent="#fb923c" highlight={[1, 2, 3, 4, 7]} />
      <TagStack />
      <SpeechBubble x={780} y={245} text="Je ne decore pas. Je nomme les parties de la page." start={120} accent="#fb923c" />
    </SceneShell>
  );
}

function CssScene() {
  return (
    <SceneShell scene={3} title="CSS rend l'idee visible" accent="#2563eb" music="music3.mp3" mood="day">
      <CodeWindow title="style.css" code={`${CODE.cssBase}\n\n${CODE.cssButton}`} x={80} y={150} h={620} start={65} accent="#2563eb" highlight={[2, 5, 7, 12, 13]} />
      <BrowserMockup x={925} y={285} stage="css" start={165} />
      <InspectorPanel />
    </SceneShell>
  );
}

function JsScene() {
  return (
    <SceneShell scene={4} title="JavaScript repond" accent="#facc15" music="music4.mp3">
      <CodeWindow title="app.js" code={CODE.jsClick} x={95} y={170} h={445} start={78} accent="#facc15" highlight={[1, 3, 4, 5]} />
      <BrowserMockup x={930} y={260} stage="js" start={155} />
      <CursorClick />
      <div
        style={{
          position: "absolute",
          left: 145,
          top: 675,
          width: 560,
          background: "rgba(15,23,42,0.86)",
          border: "2px solid rgba(250,204,21,0.55)",
          borderRadius: 8,
          padding: "24px 28px",
          fontSize: 29,
          lineHeight: 1.42,
          color: "#fde68a",
          zIndex: 15,
        }}
      >
        evenement: click<br />
        action: toggle("nuit")<br />
        resultat: l'interface change
      </div>
    </SceneShell>
  );
}

function DataScene() {
  return (
    <SceneShell scene={5} title="JavaScript fabrique du contenu" accent="#22c55e" music="music5.mp3" mood="day">
      <CodeWindow title="catalogue.js" code={CODE.jsList} x={95} y={155} h={520} start={72} accent="#22c55e" highlight={[1, 3, 4, 5, 6]} />
      <BrowserMockup x={900} y={250} stage="list" start={160} />
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 725,
          width: 520,
          fontSize: 31,
          lineHeight: 1.36,
          color: "#14532d",
          fontWeight: 850,
          zIndex: 18,
        }}
      >
        Une liste de donnees devient une vitrine visible.
      </div>
    </SceneShell>
  );
}

function DemoScene() {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [100, 640], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell scene={6} title="Demo complete" accent="#14b8a6" music="music6.mp3">
      <CodeWindow title="mini-page.html" code={CODE.final} x={90} y={145} w={595} h={395} start={70} accent="#14b8a6" highlight={[1, 3, 4]} />
      <CodeWindow title="style.css + app.js" code={`${CODE.cssButton}\n\n${CODE.jsClick}`} x={90} y={585} w={595} h={310} start={210} accent="#14b8a6" highlight={[1, 6, 10, 11]} />
      <BrowserMockup x={810} y={190} w={850} h={600} stage="final" start={155} />
      <div
        style={{
          position: "absolute",
          left: 728,
          top: 158,
          bottom: 155,
          width: 10,
          borderRadius: 8,
          background: "#263241",
          zIndex: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", height: `${line}%`, background: "#14b8a6" }} />
      </div>
    </SceneShell>
  );
}

function MemoryScene() {
  const frame = useCurrentFrame();

  return (
    <SceneShell scene={7} title="Le modele mental" accent="#ec4899" music="music3.mp3" mood="day">
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", zIndex: 15 }}>
        <div style={{ fontSize: 72, fontWeight: 950, color: "#172033" }}>Une page web, c'est une equipe</div>
      </div>
      <LayerCards />
      <div style={{ position: "absolute", left: 290, right: 290, bottom: 176, height: 120, zIndex: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
          {["ce que c'est", "comment c'est vu", "ce qui se passe"].map((text, index) => (
            <div
              key={text}
              style={{
                background: "#172033",
                color: "#ffffff",
                borderRadius: 8,
                height: 88,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 29,
                fontWeight: 850,
                opacity: clampFade(frame, 470 + index * 70, 492 + index * 70),
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
}

function OutroScene() {
  const frame = useCurrentFrame();
  const items = [
    ["HTML", "structure et sens", "#f97316", 130],
    ["CSS", "style et mise en page", "#2563eb", 245],
    ["JavaScript", "actions et logique", "#facc15", 360],
  ];

  return (
    <SceneShell scene={8} title="La page vivante" accent="#22c55e" music="music1.mp3" mood="day">
      <Character x={190} y={575} scale={0.94} color="#fb923c" looking />
      <BrowserMockup x={760} y={185} w={820} h={580} stage="final" start={80} />
      <div style={{ position: "absolute", left: 250, top: 155, width: 520, zIndex: 16 }}>
        {items.map(([name, desc, color, start]) => (
          <div
            key={name}
            style={{
              opacity: clampFade(frame, start, start + 24),
              transform: `translateX(${interpolate(frame, [start, start + 24], [-45, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })}px)`,
              background: "#ffffff",
              border: `3px solid ${color}`,
              borderRadius: 8,
              padding: "20px 24px",
              marginBottom: 16,
              color: "#172033",
              boxShadow: "0 14px 38px rgba(15,23,42,0.16)",
            }}
          >
            <div style={{ color, fontSize: 42, fontWeight: 950 }}>{name}</div>
            <div style={{ fontSize: 27, fontWeight: 800 }}>{desc}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 82,
          textAlign: "center",
          fontSize: 62,
          fontWeight: 950,
          color: "#172033",
          opacity: clampFade(frame, 40, 85),
          zIndex: 15,
        }}
      >
        Une idee devient une experience.
      </div>
    </SceneShell>
  );
}

export const HtmlCssJsStory = () => (
  <div style={{ width: 1920, height: 1080, overflow: "hidden", background: "#000" }}>
    <Sequence from={0} durationInFrames={SCENE_DURATION}>
      <IntroScene />
    </Sequence>
    <Sequence from={SCENE_DURATION} durationInFrames={SCENE_DURATION}>
      <HtmlScene />
    </Sequence>
    <Sequence from={SCENE_DURATION * 2} durationInFrames={SCENE_DURATION}>
      <CssScene />
    </Sequence>
    <Sequence from={SCENE_DURATION * 3} durationInFrames={SCENE_DURATION}>
      <JsScene />
    </Sequence>
    <Sequence from={SCENE_DURATION * 4} durationInFrames={SCENE_DURATION}>
      <DataScene />
    </Sequence>
    <Sequence from={SCENE_DURATION * 5} durationInFrames={SCENE_DURATION}>
      <DemoScene />
    </Sequence>
    <Sequence from={SCENE_DURATION * 6} durationInFrames={SCENE_DURATION}>
      <MemoryScene />
    </Sequence>
    <Sequence from={SCENE_DURATION * 7} durationInFrames={SCENE_DURATION}>
      <OutroScene />
    </Sequence>
  </div>
);

export const HTML_CSS_JS_STORY_DURATION = SCENE_DURATION * TOTAL_SCENES;
export const HTML_CSS_JS_STORY_FPS = FPS;
