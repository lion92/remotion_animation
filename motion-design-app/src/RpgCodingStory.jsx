import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FPS    = 24;
const SCENE  = 960;   // 40 secondes par scène
const SCENES = 12;    // 12 × 40s = 8 minutes exactes
export const RPG_CODING_STORY_DURATION = SCENE * SCENES;

const SANS = "'Inter', 'Arial', sans-serif";
const MONO = "'JetBrains Mono', 'Consolas', monospace";

// ─── données des scènes ─────────────────────────────────────────────────────

const sceneData = [
  {
    eyebrow: "Introduction",
    title: "Mini RPG — Héros vs Dragon",
    accent: "#fbbf24",
    lines: [
      "Un jeu de combat au tour par tour dans le navigateur.",
      "HTML = structure, CSS = style, JS = logique de jeu.",
      "8 minutes pour coder un vrai jeu qui fonctionne.",
    ],
    code: null,
    filename: null,
  },
  {
    eyebrow: "HTML",
    title: "La structure du jeu",
    accent: "#38bdf8",
    lines: [
      "Chaque div est une zone : arène, journal, boutons.",
      "Les id permettent à JS de cibler chaque élément.",
      "onclick sur les boutons appelle directement les fonctions JS.",
    ],
    filename: "index.html",
    code: `<div id="arena">
  <div class="fighter" id="hero-card">
    <div class="fighter-emoji">🧙</div>
    <div class="fighter-name">Héros</div>
    <div class="hp-bar-bg">
      <div class="hp-bar" id="hero-bar"></div>
    </div>
    <div id="hero-hp-text"></div>
  </div>

  <div class="vs">VS</div>

  <div class="fighter enemy" id="monster-card">
    <div class="fighter-emoji">🐉</div>
    <div class="fighter-name">Dragon</div>
    <div class="hp-bar-bg">
      <div class="hp-bar" id="monster-bar"></div>
    </div>
    <div id="monster-hp-text"></div>
  </div>
</div>

<div id="log"></div>

<div id="actions">
  <button onclick="attack()">⚔️ Attaque</button>
  <button onclick="heal()">💊 Soin</button>
  <button onclick="magic()">✨ Magie</button>
</div>`,
  },
  {
    eyebrow: "CSS — Ambiance",
    title: "Le thème sombre",
    accent: "#a78bfa",
    lines: [
      "background: #0d0d1a donne le fond sombre typique RPG.",
      "display:flex + flex-direction:column centre tout verticalement.",
      "text-shadow avec la même couleur que le texte crée l'effet lumineux.",
    ],
    filename: "style.css",
    code: `body {
  background: #0d0d1a;
  color: #e2e8f0;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

h1 {
  font-size: 2rem;
  color: #fbbf24;
  text-shadow: 0 0 20px #fbbf24;
  margin-bottom: 20px;
}

#arena {
  display: flex;
  gap: 60px;
  align-items: center;
  margin: 20px 0;
}

#log {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 16px;
  height: 100px;
  width: 500px;
  overflow-y: auto;
  font-size: 0.85rem;
}`,
  },
  {
    eyebrow: "CSS — Cartes",
    title: "Héros & Monstre",
    accent: "#818cf8",
    lines: [
      "linear-gradient donne de la profondeur aux cartes de combat.",
      "La barre HP a une transition CSS : elle s'anime sans JS.",
      "box-shadow coloré crée l'aura autour de chaque combattant.",
    ],
    filename: "style.css",
    code: `.fighter {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border: 2px solid #6366f1;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  width: 200px;
  box-shadow: 0 0 30px #6366f133;
}
.fighter.enemy {
  border-color: #ef4444;
  box-shadow: 0 0 30px #ef444433;
}
.hp-bar-bg {
  background: #1e293b;
  border-radius: 8px;
  height: 12px;
  overflow: hidden;
  margin-top: 6px;
}
.hp-bar {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #86efac);
  transition: width 0.4s ease;
}
.hp-bar.low {
  background: linear-gradient(90deg, #ef4444, #fca5a5);
}
button {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}`,
  },
  {
    eyebrow: "CSS — Animations",
    title: "@keyframes",
    accent: "#22d3ee",
    lines: [
      "shake() fait vibrer la carte quand elle prend des dégâts.",
      "pulse() fait briller le héros en boucle — animation infinie.",
      "JS déclenche l'animation en ajoutant puis retirant la classe CSS.",
    ],
    filename: "style.css",
    code: `.shake { animation: shake 0.4s; }

@keyframes shake {
  0%,  100% { transform: translateX(0);    }
  25%        { transform: translateX(-8px); }
  75%        { transform: translateX( 8px); }
}

.pulse { animation: pulse 1.5s infinite; }

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 20px #6366f133; }
  50%       { box-shadow: 0 0 40px #6366f177; }
}

/* JS déclenche shake comme ça : */
function shake(id) {
  const el = document.getElementById(id);
  el.classList.remove('shake');
  void el.offsetWidth;   // force le reflow CSS
  el.classList.add('shake');
}`,
  },
  {
    eyebrow: "JavaScript — Données",
    title: "Les objets du jeu",
    accent: "#f97316",
    lines: [
      "Un objet JS regroupe toutes les stats d'un personnage.",
      "hero.hp, hero.atk : on accède à une propriété avec un point.",
      "Ces valeurs changent à chaque action — c'est l'état vivant du jeu.",
    ],
    filename: "game.js",
    code: `let hero = {
  hp:    100,  maxHp: 100,
  mp:     40,  maxMp:  40,
  atk:    15,  def:     5
};

let monster = {
  hp:    80,   maxHp:  80,
  atk:   12,   name: "Dragon"
};

// Accès aux propriétés :
console.log(hero.hp);       // 100
console.log(monster.name);  // "Dragon"

// Modification :
hero.hp -= 10;    // hero.hp vaut maintenant 90
monster.hp = 0;   // le dragon est vaincu`,
  },
  {
    eyebrow: "JavaScript — Affichage",
    title: "updateHud() & log()",
    accent: "#34d399",
    lines: [
      "getElementById() cible un élément HTML par son id.",
      "style.width met la barre HP à jour sans recharger la page.",
      "createElement + appendChild injecte du HTML dynamiquement.",
    ],
    filename: "game.js",
    code: `function updateHud() {
  const hPct = (hero.hp / hero.maxHp) * 100;
  const mPct = (monster.hp / monster.maxHp) * 100;

  document.getElementById('hero-bar')
    .style.width = hPct + '%';
  document.getElementById('monster-bar')
    .style.width = mPct + '%';
  document.getElementById('hero-hp-text')
    .textContent = hero.hp + ' / ' + hero.maxHp
      + ' HP  |  ' + hero.mp + ' MP';
  document.getElementById('monster-hp-text')
    .textContent = monster.hp + ' / ' + monster.maxHp;
}

function log(msg, type = '') {
  const el = document.getElementById('log');
  const p  = document.createElement('p');
  p.className  = type;
  p.textContent = msg;
  el.appendChild(p);
  el.scrollTop = el.scrollHeight;
}`,
  },
  {
    eyebrow: "JavaScript — Combat",
    title: "attack()",
    accent: "#f43f5e",
    lines: [
      "Math.random() renvoie un float entre 0 et 1 — pour la variance.",
      "Math.max(0, …) empêche les HP de passer en négatif.",
      "Après chaque attaque, monsterTurn() riposte automatiquement.",
    ],
    filename: "game.js",
    code: `function attack() {
  const dmg = Math.max(1,
    hero.atk
    - Math.floor(monster.def / 2)
    + Math.floor(Math.random() * 8) - 3
  );
  monster.hp = Math.max(0, monster.hp - dmg);
  log('⚔️ Tu fais ' + dmg + ' dégâts !', 'hit');
  shake('monster-card');
  updateHud();
  if (!checkEnd()) monsterTurn();
}

// Exemple de résultat :
// hero.atk = 15
// monster.def / 2 = 2.5  → Math.floor = 2
// random(0..7) - 3        → -3 à +4
// Total : entre  9 et 17 dégâts`,
  },
  {
    eyebrow: "JavaScript — Soin & Magie",
    title: "heal() & magic()",
    accent: "#4ade80",
    lines: [
      "Math.min(maxHp, …) empêche les HP de dépasser le maximum.",
      "La magie coûte 15 MP — on vérifie avec if avant d'agir.",
      "Deux stratégies, même structure : calcul → log → update → tour monstre.",
    ],
    filename: "game.js",
    code: `function heal() {
  const pts = Math.floor(Math.random() * 15) + 10;
  hero.hp = Math.min(hero.maxHp, hero.hp + pts);
  log('💊 Soin de ' + pts + ' HP !', 'heal');
  updateHud();
  if (!checkEnd()) monsterTurn();
}

function magic() {
  if (hero.mp < 15) {
    log('❌ Pas assez de MP !', 'info');
    return;
  }
  hero.mp -= 15;
  const dmg = Math.floor(Math.random() * 20) + 20;
  monster.hp = Math.max(0, monster.hp - dmg);
  log('✨ Magie ! ' + dmg + ' dégâts !', 'magic');
  shake('monster-card');
  updateHud();
  if (!checkEnd()) monsterTurn();
}`,
  },
  {
    eyebrow: "JavaScript — IA & Fin",
    title: "monsterTurn() & checkEnd()",
    accent: "#fb923c",
    lines: [
      "Le monstre riposte automatiquement après chaque action du joueur.",
      "checkEnd() retourne true si le combat est terminé — stoppe la chaîne.",
      "endGame() affiche le résultat et désactive tous les boutons.",
    ],
    filename: "game.js",
    code: `function monsterTurn() {
  const dmg = Math.max(1,
    monster.atk + Math.floor(Math.random() * 6) - 2
  );
  hero.hp = Math.max(0, hero.hp - dmg);
  log('🐉 Dragon attaque ! ' + dmg + ' dégâts.', 'hit');
  shake('hero-card');
  updateHud();
  checkEnd();
}

function checkEnd() {
  if (monster.hp <= 0) {
    endGame('🏆 Victoire !', '#fbbf24');
    return true;
  }
  if (hero.hp <= 0) {
    endGame('💀 Défaite...', '#ef4444');
    return true;
  }
  return false;   // le combat continue
}

function endGame(msg, color) {
  const el = document.getElementById('game-over');
  el.style.display = 'flex';
  el.style.color   = color;
  el.textContent   = msg;
  document.querySelectorAll('button')
    .forEach(b => b.disabled = true);
}`,
  },
  {
    eyebrow: "Démo",
    title: "Le jeu en action",
    accent: "#fbbf24",
    lines: [
      "HTML définit le quoi, CSS le look, JS le comment ça marche.",
      "Chaque clic : calcul → log → updateHud → tour monstre → checkEnd.",
      "Tout tourne dans le navigateur, aucun serveur nécessaire.",
    ],
    filename: "game.js",
    code: `// Initialisation
updateHud();
log('⚔️ Le combat commence !', 'info');

// Flux complet d'un tour :
//
// 1. Joueur clique "Attaque"
//    → attack() calcule les dégâts
//    → monster.hp diminue
//    → log() affiche le résultat
//    → shake() anime la carte
//    → updateHud() met à jour les barres
//    → checkEnd() : victoire ?
//    → sinon : monsterTurn()
//       → hero.hp diminue
//       → checkEnd() : défaite ?
//
// C'est un cycle fermé, tour par tour.`,
  },
  {
    eyebrow: "Récapitulatif",
    title: "Ce que tu maîtrises",
    accent: "#c084fc",
    lines: [
      "HTML : div, id, class, onclick — la fondation du jeu.",
      "CSS : gradient, transition, @keyframes — le style et les animations.",
      "JS : objets, fonctions, DOM, Math — toute la logique du combat.",
    ],
    code: null,
    filename: null,
  },
];

// ─── helpers ────────────────────────────────────────────────────────────────

const fade = (frame, duration = SCENE) =>
  interpolate(frame, [0, 18, duration - 18, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const inOut = (frame, start, end) =>
  interpolate(frame, [start, start + 14, end - 14, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

// ─── Backdrop ───────────────────────────────────────────────────────────────

function Backdrop({ accent }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = interpolate(frame, [0, SCENE], [0, -50], clamp);
  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(135deg, #05080f 0%, #0c1220 55%, #070c18 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${accent}18 1px, transparent 1px), linear-gradient(90deg, ${accent}12 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          transform: `translateY(${drift}px)`,
          opacity: 0.65,
        }}
      />
      {[...Array(18)].map((_, i) => {
        const x = (i * 223) % width;
        const y = (i * 151) % height;
        const p = Math.sin((frame + i * 17) / 24) * 0.5 + 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 4 + p * 5,
              height: 4 + p * 5,
              borderRadius: "50%",
              background: accent,
              opacity: 0.12 + p * 0.22,
              boxShadow: `0 0 ${10 + p * 16}px ${accent}`,
            }}
          />
        );
      })}
    </>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

function SceneHeader({ data, index }) {
  return (
    <div style={{ position: "absolute", top: 22, left: 44, right: 44, zIndex: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div
          style={{
            color: data.accent,
            fontSize: 24,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          {data.eyebrow}
        </div>
        <div style={{ color: "#334155", fontSize: 20, fontWeight: 700 }}>
          Mini RPG — {index + 1} / {SCENES}
        </div>
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 44,
          fontWeight: 950,
          color: "#f1f5f9",
          textShadow: `0 0 30px ${data.accent}44`,
          lineHeight: 1,
        }}
      >
        {data.title}
      </div>
      <div
        style={{
          marginTop: 12,
          height: 5,
          background: "rgba(255,255,255,0.07)",
          borderRadius: 5,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${((index + 1) / SCENES) * 100}%`,
            height: "100%",
            background: data.accent,
            boxShadow: `0 0 16px ${data.accent}`,
          }}
        />
      </div>
    </div>
  );
}

// ─── SubtitleBlock ──────────────────────────────────────────────────────────

function SubtitleBlock({ lines, accent }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 44,
        bottom: 24,
        right: 44,
        zIndex: 40,
      }}
    >
      {lines.map((line, i) => {
        const start = 480 + i * 155;
        const opacity = inOut(frame, start, start + 110);
        const x = interpolate(frame, [start, start + 18], [-36, 0], clamp);
        return (
          <div
            key={line}
            style={{
              opacity,
              transform: `translateX(${x}px)`,
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 8,
              color: "#e2e8f0",
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.3,
              fontFamily: SANS,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                marginTop: 8,
                borderRadius: 4,
                background: accent,
                boxShadow: `0 0 14px ${accent}`,
                flexShrink: 0,
              }}
            />
            <span>{line}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── CodeEditor ─────────────────────────────────────────────────────────────

function CodeEditor({ code, filename, accent }) {
  const frame = useCurrentFrame();
  if (!code) return null;
  const chars = Math.floor(
    interpolate(frame, [20, 440], [0, code.length], clamp)
  );
  const allLines = code.slice(0, chars).split("\n");
  const cursor = Math.sin(frame / 7) > 0;

  const VISIBLE_LINES = 18;
  const startLine = Math.max(0, allLines.length - VISIBLE_LINES);
  const visibleLines = allLines.slice(startLine);
  const visibleCode = visibleLines.join("\n");

  return (
    <div
      style={{
        position: "absolute",
        left: 30,
        top: 160,
        width: 980,
        height: 720,
        borderRadius: 12,
        background: "rgba(3, 8, 18, 0.97)",
        border: `2px solid ${accent}40`,
        boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 50px ${accent}16`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* chrome */}
      <div
        style={{
          height: 46,
          background: "rgba(255,255,255,0.05)",
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          display: "flex",
          alignItems: "center",
          gap: 9,
          paddingLeft: 20,
          flexShrink: 0,
        }}
      >
        {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
          <div
            key={c}
            style={{ width: 12, height: 12, borderRadius: "50%", background: c }}
          />
        ))}
        <div
          style={{
            marginLeft: 20,
            color: "#475569",
            fontSize: 19,
            fontFamily: MONO,
          }}
        >
          {filename}
        </div>
      </div>
      {/* code */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* line numbers */}
        <div
          style={{
            padding: "20px 16px 20px 18px",
            background: "rgba(0,0,0,0.18)",
            borderRight: "1px solid rgba(255,255,255,0.04)",
            color: "#2d3748",
            fontFamily: MONO,
            fontSize: 20,
            lineHeight: 1.6,
            textAlign: "right",
            userSelect: "none",
            minWidth: 52,
            flexShrink: 0,
          }}
        >
          {visibleLines.map((_, i) => (
            <div key={i}>{startLine + i + 1}</div>
          ))}
        </div>
        {/* content — only the visible window of lines */}
        <pre
          style={{
            margin: 0,
            padding: "20px 26px",
            color: "#e2e8f0",
            fontSize: 21,
            lineHeight: 1.6,
            fontFamily: MONO,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {visibleCode}
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: "1.1em",
              background: accent,
              marginLeft: 2,
              opacity: cursor ? 1 : 0,
              verticalAlign: "text-bottom",
            }}
          />
        </pre>
      </div>
    </div>
  );
}

// ─── FighterMini ─────────────────────────────────────────────────────────────

function FighterMini({ emoji, name, hpPct, mpPct = null, side = "hero", accent }) {
  const bc = side === "enemy" ? "#ef4444" : accent;
  const barGrad =
    hpPct > 35
      ? "linear-gradient(90deg, #22c55e, #86efac)"
      : "linear-gradient(90deg, #ef4444, #fca5a5)";
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a1740, #2d2470)",
        border: `2px solid ${bc}66`,
        borderRadius: 14,
        padding: "18px 22px",
        textAlign: "center",
        width: 200,
        boxShadow: `0 0 28px ${bc}33`,
      }}
    >
      <div style={{ fontSize: 50, lineHeight: 1 }}>{emoji}</div>
      <div
        style={{
          color: "#f1f5f9",
          fontSize: 24,
          fontWeight: 800,
          marginTop: 10,
          fontFamily: SANS,
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 12,
          background: "#0f172a",
          borderRadius: 6,
          height: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: hpPct + "%",
            height: "100%",
            background: barGrad,
            borderRadius: 6,
            transition: "width 0.4s",
          }}
        />
      </div>
      <div style={{ color: "#64748b", fontSize: 17, marginTop: 5 }}>
        {Math.round(hpPct)}% HP
      </div>
      {mpPct !== null && (
        <>
          <div
            style={{
              marginTop: 7,
              background: "#0f172a",
              borderRadius: 6,
              height: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: mpPct + "%",
                height: "100%",
                background: "linear-gradient(90deg, #8b5cf6, #c4b5fd)",
                borderRadius: 6,
              }}
            />
          </div>
          <div style={{ color: "#64748b", fontSize: 15, marginTop: 4 }}>
            {Math.round(mpPct)}% MP
          </div>
        </>
      )}
    </div>
  );
}

// ─── Visual 0 : IntroPreview ─────────────────────────────────────────────────

function IntroPreview({ accent }) {
  const frame = useCurrentFrame();
  const pop = spring({ frame: frame - 12, fps: FPS, config: { damping: 13, stiffness: 100 } });
  const titleY = interpolate(frame, [0, 30], [40, 0], clamp);
  const titleOp = interpolate(frame, [0, 30], [0, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          color: accent,
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 3,
          textTransform: "uppercase",
          textShadow: `0 0 20px ${accent}`,
        }}
      >
        ⚔️ Aperçu du jeu final
      </div>
      <div
        style={{
          transform: `scale(${pop})`,
          display: "flex",
          gap: 50,
          alignItems: "center",
        }}
      >
        <FighterMini emoji="🧙" name="Héros" hpPct={100} mpPct={100} side="hero" accent={accent} />
        <div
          style={{
            color: accent,
            fontSize: 44,
            fontWeight: 950,
            textShadow: `0 0 25px ${accent}`,
          }}
        >
          VS
        </div>
        <FighterMini emoji="🐉" name="Dragon" hpPct={100} side="enemy" accent={accent} />
      </div>
      <div
        style={{
          transform: `scale(${pop})`,
          display: "flex",
          gap: 14,
          marginTop: 10,
        }}
      >
        {[
          { label: "⚔️ Attaque", bg: "#ef4444" },
          { label: "💊 Soin",    bg: "#22c55e" },
          { label: "✨ Magie",   bg: "#8b5cf6" },
        ].map(({ label, bg }) => (
          <div
            key={label}
            style={{
              background: bg,
              color: "#fff",
              padding: "12px 22px",
              borderRadius: 10,
              fontSize: 22,
              fontWeight: 800,
              boxShadow: `0 8px 30px ${bg}55`,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div
        style={{
          opacity: interpolate(frame, [80, 120], [0, 1], clamp),
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: 8,
          padding: "10px 20px",
          width: 500,
          color: "#94a3b8",
          fontSize: 20,
          fontFamily: MONO,
        }}
      >
        <div style={{ color: "#fbbf24" }}>⚔️ Le combat commence !</div>
        <div style={{ color: "#f87171", marginTop: 4 }}>⚔️ Tu fais 14 dégâts !</div>
        <div style={{ color: "#f87171", marginTop: 4 }}>🐉 Dragon attaque ! 11 dégâts.</div>
      </div>
    </div>
  );
}

// ─── Visual 1 : HtmlTreeViz ──────────────────────────────────────────────────

const HTML_TREE = [
  { indent: 0, text: "body",                      color: "#38bdf8" },
  { indent: 1, text: "h1  ⚔️ Mini RPG",           color: "#fbbf24" },
  { indent: 1, text: 'div  id="arena"',            color: "#38bdf8" },
  { indent: 2, text: 'div  class="fighter"  #hero-card', color: "#a78bfa" },
  { indent: 3, text: "div  .fighter-emoji  🧙",    color: "#94a3b8" },
  { indent: 3, text: "div  .hp-bar-bg",            color: "#94a3b8" },
  { indent: 2, text: 'div  class="vs"',            color: "#fbbf24" },
  { indent: 2, text: 'div  class="fighter enemy"  #monster-card', color: "#f87171" },
  { indent: 3, text: "div  .fighter-emoji  🐉",    color: "#94a3b8" },
  { indent: 3, text: "div  .hp-bar-bg",            color: "#94a3b8" },
  { indent: 1, text: 'div  id="log"',              color: "#64748b" },
  { indent: 1, text: 'div  id="actions"',          color: "#38bdf8" },
  { indent: 2, text: 'button  onclick="attack()"', color: "#f87171" },
  { indent: 2, text: 'button  onclick="heal()"',   color: "#4ade80" },
  { indent: 2, text: 'button  onclick="magic()"',  color: "#a78bfa" },
];

function HtmlTreeViz({ accent }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        background: "rgba(3,8,18,0.95)",
        border: `2px solid ${accent}40`,
        borderRadius: 12,
        padding: "28px 32px",
        overflow: "hidden",
        boxShadow: `0 24px 70px rgba(0,0,0,0.5)`,
      }}
    >
      <div
        style={{
          color: accent,
          fontSize: 22,
          fontWeight: 800,
          marginBottom: 22,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Structure HTML du jeu
      </div>
      {HTML_TREE.map((node, i) => {
        const startF = 20 + i * 42;
        const op = interpolate(frame, [startF, startF + 22], [0, 1], clamp);
        const x = interpolate(frame, [startF, startF + 22], [-20, 0], clamp);
        return (
          <div
            key={i}
            style={{
              opacity: op,
              transform: `translateX(${x}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
              paddingLeft: node.indent * 28,
            }}
          >
            {node.indent > 0 && (
              <div
                style={{
                  width: 16,
                  height: 2,
                  background: accent + "66",
                  flexShrink: 0,
                }}
              />
            )}
            <div
              style={{
                color: node.color,
                fontSize: 20,
                fontFamily: MONO,
                fontWeight: 600,
              }}
            >
              {`<${node.text}>`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Visual 2 : CssThemeViz ──────────────────────────────────────────────────

function CssThemeViz({ accent }) {
  const frame = useCurrentFrame();
  const revealPct = interpolate(frame, [30, 380], [0, 100], clamp);

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        borderRadius: 12,
        overflow: "hidden",
        border: `2px solid ${accent}40`,
        boxShadow: `0 24px 70px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Before: unstyled (right half) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: "#000" }}>⚔️ Mini RPG</div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: 16,
            width: 300,
            textAlign: "center",
            fontSize: 18,
            color: "#333",
          }}
        >
          Héros
          <div style={{ height: 10, background: "#ddd", marginTop: 8 }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>VS</div>
        <div
          style={{
            border: "1px solid #ccc",
            padding: 16,
            width: 300,
            textAlign: "center",
            fontSize: 18,
            color: "#333",
          }}
        >
          Dragon
          <div style={{ height: 10, background: "#ddd", marginTop: 8 }} />
        </div>
        <div style={{ color: "#555", fontSize: 18 }}>Sans CSS — brut navigateur</div>
      </div>

      {/* After: styled (slides in from left) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${100 - revealPct}% 0 0)`,
          background: "#0d0d1a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#fbbf24",
            textShadow: "0 0 20px #fbbf24",
          }}
        >
          ⚔️ Mini RPG
        </div>
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <FighterMini emoji="🧙" name="Héros" hpPct={100} mpPct={80} side="hero" accent={accent} />
          <div
            style={{ color: "#fbbf24", fontSize: 36, fontWeight: 950, textShadow: "0 0 20px #fbbf24" }}
          >
            VS
          </div>
          <FighterMini emoji="🐉" name="Dragon" hpPct={100} side="enemy" accent={accent} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: `${accent}cc`,
            color: "#000",
            fontSize: 16,
            fontWeight: 800,
            padding: "4px 12px",
            borderBottomRightRadius: 8,
          }}
        >
          Avec CSS ✓
        </div>
      </div>

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${revealPct}%`,
          width: 3,
          background: accent,
          boxShadow: `0 0 20px ${accent}`,
        }}
      />
    </div>
  );
}

// ─── Visual 3 : CssCardsViz ──────────────────────────────────────────────────

function CssCardsViz({ accent }) {
  const frame = useCurrentFrame();
  const pop = spring({ frame: frame - 15, fps: FPS, config: { damping: 12, stiffness: 100 } });
  const hpAnim = interpolate(frame, [200, 500], [100, 55], clamp);

  const props = [
    { label: "gradient", val: "135deg, #1e1b4b → #312e81", color: "#818cf8" },
    { label: "border",   val: "2px solid #6366f1",          color: "#a78bfa" },
    { label: "border-radius", val: "16px",                  color: "#c084fc" },
    { label: "transition", val: "width 0.4s ease",          color: accent },
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      <div style={{ transform: `scale(${pop})`, display: "flex", gap: 36, alignItems: "center" }}>
        <FighterMini emoji="🧙" name="Héros" hpPct={hpAnim} mpPct={70} side="hero" accent={accent} />
        <div style={{ color: accent, fontSize: 38, fontWeight: 950, textShadow: `0 0 20px ${accent}` }}>
          VS
        </div>
        <FighterMini emoji="🐉" name="Dragon" hpPct={100 - (100 - hpAnim) * 1.4} side="enemy" accent={accent} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 560 }}>
        {props.map((p, i) => {
          const op = interpolate(frame, [160 + i * 70, 200 + i * 70], [0, 1], clamp);
          return (
            <div
              key={p.label}
              style={{
                opacity: op,
                display: "flex",
                gap: 16,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: "10px 18px",
                border: `1px solid ${p.color}44`,
              }}
            >
              <div style={{ color: p.color, fontFamily: MONO, fontSize: 20, fontWeight: 700, minWidth: 160 }}>
                {p.label}:
              </div>
              <div style={{ color: "#94a3b8", fontFamily: MONO, fontSize: 20 }}>
                {p.val}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Visual 4 : CssAnimViz ──────────────────────────────────────────────────

function CssAnimViz({ accent }) {
  const frame = useCurrentFrame();

  // shake demo: oscillates every ~60 frames
  const shakeX = interpolate(frame % 80,
    [0, 10, 25, 40, 55, 80],
    [0, -10, 10, -6, 6, 0],
    clamp
  );

  // pulse demo: glow oscillates
  const pulseGlow = Math.sin(frame / 16) * 0.5 + 0.5;
  const glowSize = 18 + pulseGlow * 28;

  const kfRows = [
    { pct: "0%, 100%", prop: "translateX(0)",    label: "position neutre" },
    { pct: "25%",      prop: "translateX(-8px)", label: "glisse à gauche" },
    { pct: "75%",      prop: "translateX(+8px)", label: "glisse à droite" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
        {/* shake demo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div
            style={{
              transform: `translateX(${shakeX}px)`,
              background: "linear-gradient(135deg, #1e1b4b, #312e81)",
              border: "2px solid #f43f5e66",
              borderRadius: 12,
              padding: "16px 22px",
              textAlign: "center",
              width: 160,
              boxShadow: "0 0 24px #f43f5e33",
            }}
          >
            <div style={{ fontSize: 40 }}>🐉</div>
            <div style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginTop: 6 }}>Dragon</div>
          </div>
          <div
            style={{
              color: "#f43f5e",
              fontSize: 18,
              fontWeight: 700,
              background: "rgba(244,63,94,0.1)",
              padding: "6px 14px",
              borderRadius: 6,
            }}
          >
            .shake — dégâts
          </div>
        </div>

        {/* pulse demo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #1e1b4b, #312e81)",
              border: `2px solid ${accent}88`,
              borderRadius: 12,
              padding: "16px 22px",
              textAlign: "center",
              width: 160,
              boxShadow: `0 0 ${glowSize}px ${accent}${Math.round(55 + pulseGlow * 66).toString(16)}`,
            }}
          >
            <div style={{ fontSize: 40 }}>🧙</div>
            <div style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginTop: 6 }}>Héros</div>
          </div>
          <div
            style={{
              color: accent,
              fontSize: 18,
              fontWeight: 700,
              background: `${accent}18`,
              padding: "6px 14px",
              borderRadius: 6,
            }}
          >
            .pulse — en attente
          </div>
        </div>
      </div>

      {/* Keyframe table */}
      <div style={{ width: 580 }}>
        <div style={{ color: accent, fontSize: 20, fontWeight: 800, marginBottom: 12, fontFamily: MONO }}>
          @keyframes shake
        </div>
        {kfRows.map((row, i) => {
          const op = interpolate(frame, [200 + i * 70, 240 + i * 70], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                opacity: op,
                display: "flex",
                gap: 16,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: "10px 16px",
                marginBottom: 8,
                fontFamily: MONO,
                fontSize: 19,
              }}
            >
              <div style={{ color: accent, minWidth: 120 }}>{row.pct}</div>
              <div style={{ color: "#f1f5f9", minWidth: 200 }}>{row.prop}</div>
              <div style={{ color: "#64748b" }}>← {row.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Visual 5 : JsObjectsViz ─────────────────────────────────────────────────

function JsObjectsViz({ accent }) {
  const frame = useCurrentFrame();

  const heroProps = [
    { k: "hp",    v: "100", c: "#4ade80" },
    { k: "maxHp", v: "100", c: "#4ade80" },
    { k: "mp",    v: "40",  c: "#a78bfa" },
    { k: "maxMp", v: "40",  c: "#a78bfa" },
    { k: "atk",   v: "15",  c: "#f43f5e" },
    { k: "def",   v: "5",   c: "#38bdf8" },
  ];

  const monsterProps = [
    { k: "hp",    v: "80",       c: "#4ade80" },
    { k: "maxHp", v: "80",       c: "#4ade80" },
    { k: "atk",   v: "12",       c: "#f43f5e" },
    { k: "name",  v: '"Dragon"', c: "#fbbf24" },
  ];

  function ObjBox({ label, emoji, props, startDelay }) {
    const pop = spring({ frame: frame - startDelay, fps: FPS, config: { damping: 12, stiffness: 110 } });
    return (
      <div
        style={{
          transform: `scale(${pop})`,
          background: "rgba(3,8,18,0.95)",
          border: `2px solid ${accent}55`,
          borderRadius: 12,
          overflow: "hidden",
          width: 300,
          boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${accent}18`,
        }}
      >
        <div
          style={{
            background: accent,
            padding: "14px 20px",
            color: "#07111f",
            fontSize: 24,
            fontWeight: 950,
            fontFamily: MONO,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 28 }}>{emoji}</span>
          <span>let {label}</span>
        </div>
        <div style={{ padding: "14px 20px" }}>
          {props.map((p, i) => {
            const op = interpolate(frame, [startDelay + 25 + i * 50, startDelay + 55 + i * 50], [0, 1], clamp);
            const x = interpolate(frame, [startDelay + 25 + i * 50, startDelay + 55 + i * 50], [-16, 0], clamp);
            return (
              <div
                key={p.k}
                style={{
                  opacity: op,
                  transform: `translateX(${x}px)`,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: MONO,
                  fontSize: 20,
                  paddingBottom: 8,
                }}
              >
                <span style={{ color: "#94a3b8" }}>{p.k}:</span>
                <span style={{ color: p.c, fontWeight: 700 }}>{p.v},</span>
              </div>
            );
          })}
          <div style={{ color: "#475569", fontFamily: MONO, fontSize: 20 }}>{"}"}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      <ObjBox label="hero" emoji="🧙" props={heroProps} startDelay={10} />
      <ObjBox label="monster" emoji="🐉" props={monsterProps} startDelay={60} />
    </div>
  );
}

// ─── Visual 6 : JsDomViz ─────────────────────────────────────────────────────

function JsDomViz({ accent }) {
  const frame = useCurrentFrame();

  const steps = [
    { label: "getElementById('hero-bar')", color: "#38bdf8", icon: "🔍" },
    { label: "<div class='hp-bar' id='hero-bar'>", color: "#a78bfa", icon: "📄" },
    { label: ".style.width = '75%'", color: accent, icon: "🎨" },
    { label: "Barre HP se met à jour", color: "#4ade80", icon: "✅" },
  ];

  const hpPct = interpolate(frame, [350, 600], [100, 75], clamp);

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      {steps.map((step, i) => {
        const startF = 30 + i * 100;
        const op = interpolate(frame, [startF, startF + 28], [0, 1], clamp);
        const y = interpolate(frame, [startF, startF + 28], [20, 0], clamp);
        const arrowOp = interpolate(frame, [startF + 55, startF + 80], [0, 1], clamp);

        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "rgba(3,8,18,0.95)",
                border: `2px solid ${step.color}55`,
                borderRadius: 10,
                padding: "16px 24px",
                width: 620,
                boxShadow: `0 0 30px ${step.color}22`,
              }}
            >
              <div style={{ fontSize: 28 }}>{step.icon}</div>
              <div style={{ color: step.color, fontFamily: MONO, fontSize: 22, fontWeight: 700 }}>
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  opacity: arrowOp,
                  color: step.color,
                  fontSize: 28,
                  margin: "6px 0",
                }}
              >
                ↓
              </div>
            )}
          </div>
        );
      })}

      {/* Live HP bar */}
      <div
        style={{
          opacity: interpolate(frame, [360, 400], [0, 1], clamp),
          marginTop: 30,
          width: 480,
          background: "rgba(3,8,18,0.9)",
          border: `2px solid ${accent}44`,
          borderRadius: 10,
          padding: "18px 24px",
        }}
      >
        <div style={{ color: "#94a3b8", fontSize: 18, marginBottom: 10 }}>hero-bar en temps réel :</div>
        <div style={{ background: "#0f172a", borderRadius: 8, height: 18, overflow: "hidden" }}>
          <div
            style={{
              width: hpPct + "%",
              height: "100%",
              background: "linear-gradient(90deg, #22c55e, #86efac)",
              transition: "width 0.4s",
            }}
          />
        </div>
        <div style={{ color: accent, fontFamily: MONO, fontSize: 18, marginTop: 8 }}>
          style.width = '{Math.round(hpPct)}%'
        </div>
      </div>
    </div>
  );
}

// ─── Visual 7 : JsAttackViz ──────────────────────────────────────────────────

function JsAttackViz({ accent }) {
  const frame = useCurrentFrame();
  const randomVal = Math.floor(((Math.sin(frame / 12) * 0.5 + 0.5) * 8));
  const dmg = Math.max(1, 15 - 2 + randomVal - 3);

  const terms = [
    { label: "hero.atk", value: "15", color: "#4ade80", desc: "force de base" },
    { label: "- def/2",  value: "-2", color: "#f87171", desc: "armure du monstre" },
    { label: "+ random", value: `+${randomVal - 3}`, color: "#fbbf24", desc: "variance (−3 à +4)" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
      }}
    >
      <div style={{ color: accent, fontSize: 22, fontWeight: 800, fontFamily: MONO }}>
        Calcul des dégâts d'attaque :
      </div>

      {terms.map((t, i) => {
        const op = interpolate(frame, [30 + i * 90, 65 + i * 90], [0, 1], clamp);
        return (
          <div
            key={t.label}
            style={{
              opacity: op,
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: "rgba(3,8,18,0.95)",
              border: `2px solid ${t.color}44`,
              borderRadius: 10,
              padding: "14px 24px",
              width: 620,
            }}
          >
            <div
              style={{
                color: t.color,
                fontFamily: MONO,
                fontSize: 26,
                fontWeight: 900,
                minWidth: 130,
              }}
            >
              {t.label}
            </div>
            <div
              style={{
                background: t.color + "22",
                color: t.color,
                fontFamily: MONO,
                fontSize: 28,
                fontWeight: 950,
                padding: "4px 16px",
                borderRadius: 6,
                minWidth: 70,
                textAlign: "center",
              }}
            >
              {t.value}
            </div>
            <div style={{ color: "#64748b", fontSize: 18 }}>{t.desc}</div>
          </div>
        );
      })}

      {/* Total */}
      <div
        style={{
          opacity: interpolate(frame, [310, 360], [0, 1], clamp),
          display: "flex",
          alignItems: "center",
          gap: 20,
          background: accent + "22",
          border: `3px solid ${accent}`,
          borderRadius: 12,
          padding: "18px 30px",
          width: 620,
          boxShadow: `0 0 40px ${accent}44`,
        }}
      >
        <div style={{ color: accent, fontSize: 26, fontWeight: 900, fontFamily: MONO, flex: 1 }}>
          = Math.max(1, {dmg})
        </div>
        <div
          style={{
            background: accent,
            color: "#07111f",
            fontFamily: MONO,
            fontSize: 36,
            fontWeight: 950,
            padding: "6px 20px",
            borderRadius: 8,
          }}
        >
          {dmg} dégâts
        </div>
      </div>

      <div
        style={{
          opacity: interpolate(frame, [450, 500], [0, 1], clamp),
          color: "#64748b",
          fontSize: 20,
          fontFamily: MONO,
          textAlign: "center",
        }}
      >
        La valeur random change à chaque attaque — variance naturelle du combat
      </div>
    </div>
  );
}

// ─── Visual 8 : JsHealViz ───────────────────────────────────────────────────

function JsHealViz({ accent }) {
  const frame = useCurrentFrame();
  const heroHp  = interpolate(frame, [100, 200, 350, 420], [65, 65, 83, 83], clamp);
  const heroMp  = interpolate(frame, [400, 500], [100, 62.5], clamp);
  const monstHp = interpolate(frame, [450, 600], [100, 48], clamp);

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
      }}
    >
      {/* Cards */}
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <FighterMini emoji="🧙" name="Héros" hpPct={heroHp} mpPct={heroMp} side="hero" accent={accent} />
        <div style={{ color: "#475569", fontSize: 36, fontWeight: 900 }}>VS</div>
        <FighterMini emoji="🐉" name="Dragon" hpPct={monstHp} side="enemy" accent={accent} />
      </div>

      {/* Actions legend */}
      {[
        { label: "heal()", desc: "HP: 65% → 83%  (Math.min plafonne à 100)", color: "#4ade80", frame: 50 },
        { label: "magic()", desc: "Coûte 15 MP, inflige 20-40 dégâts aléatoires", color: "#a78bfa", frame: 180 },
        { label: "Math.min(maxHp, hp + pts)", desc: "HP ne dépassent jamais le maximum", color: accent, frame: 310 },
      ].map((item) => {
        const op = interpolate(frame, [item.frame, item.frame + 30], [0, 1], clamp);
        const x = interpolate(frame, [item.frame, item.frame + 30], [-20, 0], clamp);
        return (
          <div
            key={item.label}
            style={{
              opacity: op,
              transform: `translateX(${x}px)`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "rgba(3,8,18,0.95)",
              border: `2px solid ${item.color}44`,
              borderRadius: 10,
              padding: "14px 22px",
              width: 620,
            }}
          >
            <div
              style={{
                color: item.color,
                fontFamily: MONO,
                fontSize: 22,
                fontWeight: 800,
                minWidth: 80,
              }}
            >
              {item.label}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 19 }}>{item.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Visual 9 : JsTurnViz ───────────────────────────────────────────────────

function JsTurnViz({ accent }) {
  const frame = useCurrentFrame();

  const nodes = [
    { label: "Joueur clique",   color: "#38bdf8",  y: 0 },
    { label: "attack / heal / magic", color: accent, y: 100 },
    { label: "calcul + log + updateHud", color: "#fbbf24", y: 200 },
    { label: "checkEnd() → victoire ?",  color: "#f43f5e",  y: 300 },
    { label: "monsterTurn() riposte",   color: "#f87171",  y: 400 },
    { label: "checkEnd() → défaite ?",  color: "#f43f5e",  y: 500 },
  ];

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative", width: 560, height: 600 }}>
        {nodes.map((node, i) => {
          const startF = 18 + i * 85;
          const pop = spring({ frame: frame - startF, fps: FPS, config: { damping: 12, stiffness: 120 } });
          const arrowH = interpolate(frame, [startF + 40, startF + 70], [0, 60], clamp);

          return (
            <div key={i}>
              <div
                style={{
                  position: "absolute",
                  left: 80,
                  top: node.y,
                  width: 400,
                  height: 60,
                  borderRadius: 10,
                  background: "rgba(3,8,18,0.95)",
                  border: `2px solid ${node.color}66`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: node.color,
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: SANS,
                  transform: `scale(${pop})`,
                  boxShadow: `0 0 20px ${node.color}22`,
                }}
              >
                {node.label}
              </div>
              {i < nodes.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 278,
                    top: node.y + 60,
                    width: 3,
                    height: arrowH,
                    background: node.color,
                    opacity: 0.7,
                  }}
                />
              )}
            </div>
          );
        })}
        {/* OUI/NON branches on checkEnd */}
        {frame > 320 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 340,
              color: "#4ade80",
              fontSize: 17,
              fontWeight: 700,
              opacity: interpolate(frame, [320, 360], [0, 1], clamp),
              fontFamily: MONO,
            }}
          >
            NON → continue ↓
          </div>
        )}
        {frame > 320 && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 340,
              color: "#f43f5e",
              fontSize: 17,
              fontWeight: 700,
              opacity: interpolate(frame, [320, 360], [0, 1], clamp),
              fontFamily: MONO,
            }}
          >
            OUI → endGame()
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Visual 10 : DemoSimViz ──────────────────────────────────────────────────

const BATTLE_LOG = [
  { frame: 20,  text: "⚔️ Le combat commence !",       type: "info" },
  { frame: 80,  text: "⚔️ Tu fais 13 dégâts !",        type: "hit" },
  { frame: 140, text: "🐉 Dragon attaque ! 11 dégâts.", type: "hit" },
  { frame: 220, text: "✨ Magie ! 28 dégâts !",         type: "magic" },
  { frame: 290, text: "🐉 Dragon attaque ! 9 dégâts.",  type: "hit" },
  { frame: 370, text: "⚔️ Tu fais 15 dégâts !",        type: "hit" },
  { frame: 440, text: "🐉 Dragon attaque ! 12 dégâts.", type: "hit" },
  { frame: 520, text: "✨ Magie ! 25 dégâts — victoire !", type: "magic" },
  { frame: 600, text: "🏆 VICTOIRE !",                  type: "win" },
];

function DemoSimViz({ accent }) {
  const frame = useCurrentFrame();

  const heroHp    = interpolate(frame, [0, 140, 290, 440, 960], [100, 89, 80, 68, 68], clamp);
  const heroMp    = interpolate(frame, [0, 220, 520, 960],      [100, 100, 62.5, 25], clamp);
  const monsterHp = interpolate(frame, [0, 80, 220, 370, 520, 960], [100, 84, 49, 30, 0, 0], clamp);

  const logs = BATTLE_LOG.filter((l) => frame >= l.frame);

  const logColors = { hit: "#f87171", heal: "#4ade80", magic: "#c4b5fd", info: "#fbbf24", win: "#fbbf24" };

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        top: 160,
        width: 860,
        height: 720,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
      }}
    >
      {/* fighters */}
      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
        <FighterMini emoji="🧙" name="Héros" hpPct={heroHp} mpPct={heroMp} side="hero" accent={accent} />
        <div style={{ color: accent, fontSize: 38, fontWeight: 950, textShadow: `0 0 20px ${accent}` }}>
          VS
        </div>
        <FighterMini emoji="🐉" name="Dragon" hpPct={monsterHp} side="enemy" accent={accent} />
      </div>

      {/* log */}
      <div
        style={{
          background: "#0a0f1c",
          border: "1px solid #1e293b",
          borderRadius: 10,
          padding: "14px 18px",
          width: 580,
          height: 200,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 5,
        }}
      >
        {logs.slice(-5).map((l, i) => (
          <div
            key={i}
            style={{
              color: logColors[l.type] || "#94a3b8",
              fontSize: 19,
              fontFamily: MONO,
              fontWeight: l.type === "win" ? 900 : 500,
            }}
          >
            {l.text}
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 14 }}>
        {[
          { label: "⚔️ Attaque", bg: "#ef4444" },
          { label: "💊 Soin",    bg: "#22c55e" },
          { label: "✨ Magie",   bg: "#8b5cf6" },
        ].map(({ label, bg }) => (
          <div
            key={label}
            style={{
              background: monsterHp <= 0 ? "#1e293b" : bg,
              color: monsterHp <= 0 ? "#475569" : "#fff",
              padding: "12px 20px",
              borderRadius: 10,
              fontSize: 20,
              fontWeight: 800,
              opacity: monsterHp <= 0 ? 0.45 : 1,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Visual 11 : RecapViz ───────────────────────────────────────────────────

const RECAP_COLS = [
  {
    lang: "HTML",
    color: "#38bdf8",
    icon: "🏗️",
    items: ["div, id, class", "onclick=…", "hp-bar-bg", "arena, log", "actions", "fighter-emoji"],
  },
  {
    lang: "CSS",
    color: "#a78bfa",
    icon: "🎨",
    items: ["linear-gradient", "transition", "@keyframes", "box-shadow", "display:flex", ".shake / .pulse"],
  },
  {
    lang: "JavaScript",
    color: "#f97316",
    icon: "⚙️",
    items: ["let hero = { }", "getElementById", "Math.random()", "Math.max/min", "function attack()", "checkEnd()"],
  },
];

function RecapViz({ accent }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        paddingTop: 160,
      }}
    >
      <div
        style={{
          opacity: interpolate(frame, [10, 40], [0, 1], clamp),
          color: accent,
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: 3,
          textTransform: "uppercase",
          textShadow: `0 0 20px ${accent}`,
        }}
      >
        Ce que tu maîtrises maintenant
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {RECAP_COLS.map((col, ci) => {
          const colStart = 30 + ci * 100;
          const colPop = spring({
            frame: frame - colStart,
            fps: FPS,
            config: { damping: 13, stiffness: 100 },
          });
          return (
            <div
              key={col.lang}
              style={{
                transform: `scale(${colPop})`,
                background: "rgba(3,8,18,0.95)",
                border: `2px solid ${col.color}55`,
                borderRadius: 14,
                overflow: "hidden",
                width: 340,
                boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${col.color}18`,
              }}
            >
              <div
                style={{
                  background: col.color,
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "#07111f",
                  fontSize: 28,
                  fontWeight: 950,
                }}
              >
                <span style={{ fontSize: 32 }}>{col.icon}</span>
                <span>{col.lang}</span>
              </div>
              <div style={{ padding: "14px 20px" }}>
                {col.items.map((item, ii) => {
                  const op = interpolate(
                    frame,
                    [colStart + 40 + ii * 55, colStart + 75 + ii * 55],
                    [0, 1],
                    clamp
                  );
                  const x = interpolate(
                    frame,
                    [colStart + 40 + ii * 55, colStart + 75 + ii * 55],
                    [-14, 0],
                    clamp
                  );
                  return (
                    <div
                      key={item}
                      style={{
                        opacity: op,
                        transform: `translateX(${x}px)`,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: col.color,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          color: "#e2e8f0",
                          fontFamily: MONO,
                          fontSize: 19,
                        }}
                      >
                        {item}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          opacity: interpolate(frame, [700, 760], [0, 1], clamp),
          color: "#fbbf24",
          fontSize: 24,
          fontWeight: 800,
          textShadow: "0 0 20px #fbbf24",
          marginTop: 10,
        }}
      >
        ⚔️ Ouvre index.html dans ton navigateur — le jeu tourne !
      </div>
    </div>
  );
}

// ─── Mapping scenes → composants visuels ────────────────────────────────────

const VISUALS = [
  IntroPreview,
  HtmlTreeViz,
  CssThemeViz,
  CssCardsViz,
  CssAnimViz,
  JsObjectsViz,
  JsDomViz,
  JsAttackViz,
  JsHealViz,
  JsTurnViz,
  DemoSimViz,
  RecapViz,
];

// ─── RpgScene ────────────────────────────────────────────────────────────────

function RpgScene({ data, index, VisComp }) {
  const frame = useCurrentFrame();
  const isFullWidth = !data.code; // scènes 0 et 11 sans éditeur
  return (
    <AbsoluteFill style={{ opacity: fade(frame), fontFamily: SANS, overflow: "hidden" }}>
      <Audio src={staticFile(`audio/rpg_narration${index + 1}.mp3`)} volume={1} />
      <Audio src={staticFile("audio/music3.mp3")} volume={0.05} />
      <Backdrop accent={data.accent} />
      <SceneHeader data={data} index={index} />
      {!isFullWidth && (
        <CodeEditor code={data.code} filename={data.filename} accent={data.accent} />
      )}
      <VisComp accent={data.accent} />
      <SubtitleBlock lines={data.lines} accent={data.accent} />
    </AbsoluteFill>
  );
}

// ─── Export principal ────────────────────────────────────────────────────────

export function RpgCodingStory() {
  return (
    <AbsoluteFill style={{ background: "#05080f" }}>
      {sceneData.map((data, index) => (
        <Sequence key={index} from={SCENE * index} durationInFrames={SCENE}>
          <RpgScene data={data} index={index} VisComp={VISUALS[index]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
