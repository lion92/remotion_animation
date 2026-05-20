import {
  AbsoluteFill, Audio, Sequence, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from "remotion";

export const GEO_ESPACE_DURATION = 11520;

// ── PALETTE ───────────────────────────────────────────────────────────────────
const P = {
  bg: "#07080f", surface: "#0e1120", card: "#141824",
  board: "#0a2e1c", boardBorder: "#1a5c40",
  border: "#2a2f45", text: "#e2e8f0", dim: "#4a5568",
  gold: "#fbbf24", blue: "#38bdf8", magic: "#a78bfa",
  ax: "#ef4444", ay: "#22c55e", az: "#3b82f6",
  vec: "#fbbf24", plane: "#38bdf8", point: "#f9fafb",
  prof: "#3b82f6", lea: "#4ade80", lucas: "#f97316",
};
const SANS = "'Inter','Segoe UI',Arial,sans-serif";
const MONO = "'JetBrains Mono','Consolas','Courier New',monospace";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const fi = (f, s = 0, d = 20) => interpolate(f, [s, s + d], [0, 1], clamp);
const fo = (f, s, d = 20)     => interpolate(f, [s, s + d], [1, 0], clamp);
const sceneFade = (f, dur)    => Math.min(fi(f, 0, 18), fo(f, dur - 18, 18));

// Converts math Unicode combining characters to styled HTML for proper display
function mathHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/([A-Za-zΩ])⃗/g, '$1<sup style="font-size:0.68em;vertical-align:super;font-style:normal;font-family:Arial,sans-serif">&#8594;</sup>')
    .replace(/ℝ/g, '<span style="font-family:Georgia,serif;font-weight:700">&#8477;</span>')
    .replace(/⟺/g, '<span style="letter-spacing:-1px"> &#10234; </span>')
    .replace(/⟹/g, ' &#10233; ')
    .replace(/⌈|⌉/g, '');
}

// ── TIMING ────────────────────────────────────────────────────────────────────
const SC = {
  INTRO:    { s: 0,     d: 840  },
  REPERE:   { s: 840,   d: 1200 },
  VECTEURS: { s: 2040,  d: 1200 },
  DROITES:  { s: 3240,  d: 720  },
  PLANS:    { s: 3960,  d: 720  },
  PARALLEX: { s: 4680,  d: 840  },
  PRODUIT:  { s: 5520,  d: 720  },
  DEMO:     { s: 6240,  d: 1920 },
  SPHERE:   { s: 8160,  d: 840  },
  PVECT:    { s: 9000,  d: 840  },
  PYRAMIDE: { s: 9840,  d: 840  },
  OUTRO:    { s: 10680, d: 840  },
};

// ── 3D PROJECTION ─────────────────────────────────────────────────────────────
function proj(x, y, z, ry, rx, cx, cy, sc) {
  const cosY = Math.cos(ry), sinY = Math.sin(ry);
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;
  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;
  const fov = 900;
  const scale = fov / (fov + z2 * sc * 0.15 + 120);
  return { px: cx + x1 * sc * scale, py: cy - y2 * sc * scale, depth: z2 };
}

function arrow(x1, y1, x2, y2, s = 9) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  return `${x2},${y2} ${x2 + s * Math.cos(a + 2.6)},${y2 + s * Math.sin(a + 2.6)} ${x2 + s * Math.cos(a - 2.6)},${y2 + s * Math.sin(a - 2.6)}`;
}

// ── 3D COMPONENTS (SVG) ───────────────────────────────────────────────────────
function Axes3D({ ry, rx, cx = 220, cy = 200, sc = 55, grid = true, len = 3.5 }) {
  const O = proj(0,0,0, ry, rx, cx, cy, sc);
  const px = proj(len,0,0, ry, rx, cx, cy, sc);
  const py = proj(0,len,0, ry, rx, cx, cy, sc);
  const pz = proj(0,0,len, ry, rx, cx, cy, sc);
  const nx = proj(-1.2,0,0, ry, rx, cx, cy, sc);
  const ny = proj(0,-1.2,0, ry, rx, cx, cy, sc);
  const nz = proj(0,0,-1.2, ry, rx, cx, cy, sc);
  const lx = proj(len+0.5,0,0, ry, rx, cx, cy, sc);
  const ly = proj(0,len+0.5,0, ry, rx, cx, cy, sc);
  const lz = proj(0,0,len+0.5, ry, rx, cx, cy, sc);

  const gridLines = [];
  if (grid) {
    for (let i = -3; i <= 3; i++) {
      const a = proj(i,0,-3, ry, rx, cx, cy, sc);
      const b = proj(i,0, 3, ry, rx, cx, cy, sc);
      const c = proj(-3,0,i, ry, rx, cx, cy, sc);
      const d = proj( 3,0,i, ry, rx, cx, cy, sc);
      gridLines.push(<line key={`gx${i}`} x1={a.px} y1={a.py} x2={b.px} y2={b.py} stroke="#2a3a55" strokeWidth={0.6} />);
      gridLines.push(<line key={`gz${i}`} x1={c.px} y1={c.py} x2={d.px} y2={d.py} stroke="#2a3a55" strokeWidth={0.6} />);
    }
  }

  return (
    <>
      {gridLines}
      {/* negative dashed */}
      {[[nx,P.ax],[ny,P.ay],[nz,P.az]].map(([pt,col],i) => (
        <line key={`n${i}`} x1={O.px} y1={O.py} x2={pt.px} y2={pt.py}
          stroke={col} strokeWidth={1} strokeDasharray="5,4" opacity={0.35} />
      ))}
      {/* positive axes */}
      {[[px,P.ax,lx,"x"],[py,P.ay,ly,"y"],[pz,P.az,lz,"z"]].map(([pt,col,lpt,lbl],i) => (
        <g key={`a${i}`}>
          <line x1={O.px} y1={O.py} x2={pt.px} y2={pt.py} stroke={col} strokeWidth={2.5} />
          <polygon points={arrow(O.px,O.py,pt.px,pt.py)} fill={col} />
          <text x={lpt.px} y={lpt.py} fill={col} fontSize={16} fontWeight={800} textAnchor="middle" dominantBaseline="middle">{lbl}</text>
        </g>
      ))}
      {/* Origin */}
      <circle cx={O.px} cy={O.py} r={4} fill={P.point} />
      <text x={O.px-14} y={O.py+6} fill={P.dim} fontSize={13}>O</text>
    </>
  );
}

function Point3D({ pos, ry, rx, cx, cy, sc, label, color = P.gold, r = 6 }) {
  const pt = proj(...pos, ry, rx, cx, cy, sc);
  const [x,y,z] = pos;
  const px0 = proj(x,0,z, ry, rx, cx, cy, sc);
  const py0 = proj(x,0,0, ry, rx, cx, cy, sc);
  const pz0 = proj(0,0,z, ry, rx, cx, cy, sc);
  return (
    <>
      {/* projection lines */}
      <line x1={pt.px} y1={pt.py} x2={px0.px} y2={px0.py} stroke={color} strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
      <line x1={px0.px} y1={px0.py} x2={py0.px} y2={py0.py} stroke={P.ax} strokeWidth={1} strokeDasharray="4,3" opacity={0.4} />
      <line x1={px0.px} y1={px0.py} x2={pz0.px} y2={pz0.py} stroke={P.az} strokeWidth={1} strokeDasharray="4,3" opacity={0.4} />
      <circle cx={pt.px} cy={pt.py} r={r} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      {label && <text x={pt.px+10} y={pt.py-8} fill={color} fontSize={15} fontWeight={700}>{label}</text>}
    </>
  );
}

function Vector3D({ from, to, ry, rx, cx, cy, sc, color = P.vec, label, width = 2.5 }) {
  const pf = proj(...from, ry, rx, cx, cy, sc);
  const pt = proj(...to,   ry, rx, cx, cy, sc);
  const cleanLabel = label?.replace(/⃗/g, "→");
  return (
    <>
      <line x1={pf.px} y1={pf.py} x2={pt.px} y2={pt.py} stroke={color} strokeWidth={width} />
      <polygon points={arrow(pf.px,pf.py,pt.px,pt.py,10)} fill={color} />
      {cleanLabel && (
        <text x={(pf.px+pt.px)/2+12} y={(pf.py+pt.py)/2} fill={color} fontSize={14} fontWeight={700}>{cleanLabel}</text>
      )}
    </>
  );
}

function Plane3D({ corners, ry, rx, cx, cy, sc, color = "#38bdf822", stroke = "#38bdf877" }) {
  const pts = corners.map(c => proj(...c, ry, rx, cx, cy, sc));
  const poly = pts.map(p => `${p.px},${p.py}`).join(" ");
  return (
    <polygon points={poly} fill={color} stroke={stroke} strokeWidth={1.5} />
  );
}

// ── STARS ─────────────────────────────────────────────────────────────────────
function Stars({ count = 50, seed = 1 }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = ((i * 137 + seed * 31) % 97) / 97 * width;
        const y = ((i * 79 + seed * 17) % 89) / 89 * height;
        const pulse = Math.sin((frame + i * 13) / 28) * 0.5 + 0.5;
        const sz = 1.5 + ((i * 11) % 5) * 0.7;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: sz, height: sz, borderRadius: "50%",
            background: "#e2e8f0", opacity: 0.06 + pulse * 0.15,
          }} />
        );
      })}
    </>
  );
}

// ── CLASSROOM PANEL ───────────────────────────────────────────────────────────
function ClassroomPanel({ frame, dialogues = [] }) {
  const current = [...dialogues].reverse().find(d => frame >= d.f) || null;
  const bubbleStyle = (borderCol, bgCol) => ({
    background: bgCol, border: `2px solid ${borderCol}`,
    borderRadius: 12, padding: "10px 14px",
    color: P.text, fontSize: 15, lineHeight: 1.5,
  });
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Prof */}
      <div style={{ background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, padding: "16px 18px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 52, lineHeight: 1, flexShrink: 0 }}>👨‍🏫</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: P.prof, fontSize: 12, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>PROF. MARTIN</div>
            {current?.speaker === "prof" ? (
              <div style={{ ...bubbleStyle(P.prof, "#0f1e3a"), opacity: fi(frame, current.f, 10) }}
                dangerouslySetInnerHTML={{ __html: mathHTML(current.text) }} />
            ) : (
              <div style={{ color: P.dim, fontSize: 14 }}>…</div>
            )}
          </div>
        </div>
      </div>

      {/* Students */}
      <div style={{ flex: 1, background: P.card, borderRadius: 16, border: `1px solid ${P.border}`, padding: "14px 18px" }}>
        <div style={{ color: P.dim, fontSize: 12, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>TERMINALE — COURS</div>

        {/* Léa */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ fontSize: 42, flexShrink: 0 }}>👩‍🎓</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: P.lea, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>LÉA</div>
            {current?.speaker === "lea" ? (
              <div style={{ ...bubbleStyle(P.lea, "#0a1f10"), opacity: fi(frame, current.f, 10) }}
                dangerouslySetInnerHTML={{ __html: mathHTML(current.text) }} />
            ) : null}
          </div>
        </div>

        {/* Lucas */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 42, flexShrink: 0 }}>🧑‍🎓</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: P.lucas, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>LUCAS</div>
            {current?.speaker === "lucas" ? (
              <div style={{ ...bubbleStyle(P.lucas, "#1f0e03"), opacity: fi(frame, current.f, 10) }}
                dangerouslySetInnerHTML={{ __html: mathHTML(current.text) }} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BLACKBOARD ────────────────────────────────────────────────────────────────
function Blackboard({ frame, formulas }) {
  return (
    <div style={{
      background: P.board, border: `3px solid ${P.boardBorder}`,
      borderRadius: 12, padding: "12px 18px", minHeight: 120,
    }}>
      <div style={{ color: "#80ffb0", fontSize: 12, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>
        ◆ FORMULES CLÉS
      </div>
      {formulas.map(({ f, text, color = "#f0f0e8" }, i) => (
        <div key={i} style={{
          opacity: fi(frame, f, 15), color, fontFamily: MONO,
          fontSize: 16, fontWeight: 600, lineHeight: 1.7,
        }} dangerouslySetInnerHTML={{ __html: mathHTML(text) }} />
      ))}
    </div>
  );
}

// ── LESSON TEMPLATE ───────────────────────────────────────────────────────────
function LessonScene({ title, dur, accent, music = "music2.mp3", narrationFile, vizContent, formulas = [], dialogues = [] }) {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame, dur);
  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile(`audio/${music}`)} volume={0.08} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      {formulas.length > 0 && (
        <Sequence from={formulas[0].f}><Audio src={staticFile("audio/sfx_chalk.mp3")} volume={0.35} /></Sequence>
      )}
      {formulas.length > 2 && (
        <Sequence from={formulas[2].f}><Audio src={staticFile("audio/sfx_chalk.mp3")} volume={0.3} /></Sequence>
      )}
      <Stars count={35} />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        boxShadow: `0 0 20px ${accent}` }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 22, left: 50, right: 50 }}>
        <div style={{ color: accent, fontSize: 15, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
          Géométrie dans l'espace · Terminale
        </div>
        <div style={{ color: P.text, fontSize: 44, fontWeight: 900, lineHeight: 1.1, marginTop: 4 }}>{title}</div>
        <div style={{ marginTop: 8, height: 3, background: P.border, borderRadius: 3 }}>
          <div style={{ width: `${(frame / dur) * 100}%`, height: "100%", background: accent, borderRadius: 3, boxShadow: `0 0 6px ${accent}` }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ position: "absolute", top: 148, left: 50, right: 50, bottom: 30, display: "flex", gap: 28 }}>
        {/* Left : viz + blackboard */}
        <div style={{ flex: "0 0 57%", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ flex: 1, background: P.surface, borderRadius: 16, border: `1px solid ${P.border}`, position: "relative", overflow: "hidden" }}>
            {vizContent}
          </div>
          <Blackboard frame={frame} formulas={formulas} />
        </div>
        {/* Right : classroom */}
        <ClassroomPanel frame={frame} dialogues={dialogues} />
      </div>
    </AbsoluteFill>
  );
}

// ── INTRO SCENE ───────────────────────────────────────────────────────────────
function IntroScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.INTRO.d;
  const opacity = sceneFade(frame, dur);
  const titleSc = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 55 } });
  const ry = 0.4 + frame * 0.006;
  const rx = 0.32;

  const chapters = [
    { icon: "📐", label: "Repère 3D",       delay: 180 },
    { icon: "➡️", label: "Vecteurs",         delay: 240 },
    { icon: "📏", label: "Droites & Plans",  delay: 300 },
    { icon: "🔵", label: "Sphère",           delay: 360 },
    { icon: "✖️", label: "Prod. vectoriel",  delay: 420 },
    { icon: "🔺", label: "Pyramide",         delay: 480 },
  ];

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS, overflow: "hidden" }}>
      <Audio src={staticFile("audio/music4.mp3")} volume={0.12} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Sequence from={20}><Audio src={staticFile("audio/sfx_whoosh3d.mp3")} volume={0.5} /></Sequence>
      <Stars count={90} />

      <AbsoluteFill style={{
        backgroundImage: "linear-gradient(#3b82f611 1px,transparent 1px),linear-gradient(90deg,#3b82f611 1px,transparent 1px)",
        backgroundSize: "80px 80px", opacity: 0.5,
      }} />

      {/* 3D axes decor (background) */}
      <div style={{ position: "absolute", right: 60, top: 80, opacity: fi(frame, 60, 40) * 0.35 }}>
        <svg width={480} height={480}>
          <Axes3D ry={ry} rx={rx} cx={240} cy={240} sc={70} grid />
        </svg>
      </div>

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: fi(frame, 10, 18), background: "#3b82f622", border: "1px solid #3b82f655",
          borderRadius: 99, padding: "6px 22px", marginBottom: 24,
          color: "#60a5fa", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3 }}>
          Cours · Terminale · 8 minutes
        </div>
        <div style={{ fontSize: 105, fontWeight: 950, color: P.text, letterSpacing: -3, lineHeight: 1,
          transform: `scale(${0.7 + titleSc * 0.3})`,
          textShadow: "0 0 60px #3b82f644, 0 0 120px #3b82f622" }}>
          GÉOMÉTRIE
        </div>
        <div style={{ fontSize: 68, fontWeight: 950, color: "#38bdf8", marginTop: 4, letterSpacing: -2,
          opacity: fi(frame, 30, 22) }}>
          dans l'Espace
        </div>
        <div style={{ opacity: fi(frame, 80, 22), marginTop: 18, textAlign: "center" }}>
          <div style={{ fontSize: 26, color: P.magic, fontWeight: 600 }}>
            Repère · Vecteurs · Droites · Plans · Sphère · Produit vectoriel
          </div>
        </div>
        <div style={{ opacity: fi(frame, 130, 22), marginTop: 14 }}>
          <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 12, padding: "10px 26px",
            color: P.dim, fontSize: 17 }}>
            👨‍🏫 Prof. Martin · 👩‍🎓 Léa · 🧑‍🎓 Lucas
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 44, flexWrap: "wrap", justifyContent: "center" }}>
          {chapters.map(({ icon, label, delay }) => {
            const sc = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 50 } });
            return (
              <div key={label} style={{ opacity: sc, transform: `scale(${0.5 + sc * 0.5}) translateY(${(1-sc)*30}px)`,
                background: P.card, border: `1px solid ${P.border}`,
                borderRadius: 14, padding: "14px 18px", textAlign: "center", minWidth: 120 }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <div style={{ color: P.text, fontSize: 14, fontWeight: 700, marginTop: 6 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── REPERE SCENE ──────────────────────────────────────────────────────────────
function RepereScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.REPERE.d;
  const ry = 0.5 + frame * 0.007;
  const rx = 0.32;
  const showPoint = frame > 250;
  const pointOp = fi(frame, 250, 30);

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 440 400" style={{ position: "absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={210} cy={210} sc={58} grid />
      {showPoint && (
        <g opacity={pointOp}>
          <Point3D pos={[2,3,1]} ry={ry} rx={rx} cx={210} cy={210} sc={58} label="A(2 ; 3 ; 1)" color={P.gold} />
        </g>
      )}
      {/* Coord labels on axes */}
      {[1,2,3].map(n => {
        const px = proj(n,0,0, ry, rx, 210, 210, 58);
        const py = proj(0,n,0, ry, rx, 210, 210, 58);
        const pz = proj(0,0,n, ry, rx, 210, 210, 58);
        return (
          <g key={n}>
            <text x={px.px} y={px.py+14} fill={P.ax} fontSize={11} textAnchor="middle" opacity={0.6}>{n}</text>
            <text x={py.px-14} y={py.py} fill={P.ay} fontSize={11} textAnchor="middle" opacity={0.6}>{n}</text>
            <text x={pz.px+8} y={pz.py} fill={P.az} fontSize={11} textAnchor="middle" opacity={0.6}>{n}</text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <LessonScene
      title="Le repère dans l'espace" dur={dur} accent={P.blue}
      music="music2.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 30,  text: "M(x ; y ; z) ∈ ℝ³",           color: "#f0f0e8" },
        { f: 200, text: "OM⃗ = (x ; y ; z)",             color: P.gold  },
        { f: 380, text: "|OM| = √(x² + y² + z²)",       color: "#a78bfa"},
      ]}
      dialogues={[
        { f: 40,  speaker: "prof", text: "Dans l'espace, on repère chaque point par trois coordonnées : x, y et z." },
        { f: 220, speaker: "lea",  text: "C'est comme le plan mais avec une coordonnée en plus ?" },
        { f: 370, speaker: "prof", text: "Exactement ! Ici, A(2 ; 3 ; 1) : on va de 2 sur x, 3 sur y, 1 sur z." },
        { f: 560, speaker: "lucas",text: "La troisième coordonnée c'est la hauteur ?" },
        { f: 700, speaker: "prof", text: "Souvent oui ! z représente l'altitude dans beaucoup de problèmes." },
        { f: 900, speaker: "lea",  text: "Et |OM| c'est juste Pythagore généralisé à 3D !" },
      ]}
    />
  );
}

// ── VECTEURS SCENE ────────────────────────────────────────────────────────────
function VecteursScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.VECTEURS.d;
  const ry = 0.6 + frame * 0.006;
  const rx = 0.30;
  const A = [1, 0, 1];
  const B = [3, 2, 4];
  const showVec = frame > 180;
  const showComp = frame > 450;
  const showNorm = frame > 750;

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 440 400" style={{ position: "absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={210} cy={210} sc={55} grid />
      {/* Points A and B */}
      <g opacity={fi(frame, 60, 25)}>
        <Point3D pos={A} ry={ry} rx={rx} cx={210} cy={210} sc={55} label="A(1;0;1)" color={P.lea} r={5} />
      </g>
      <g opacity={fi(frame, 120, 25)}>
        <Point3D pos={B} ry={ry} rx={rx} cx={210} cy={210} sc={55} label="B(3;2;4)" color={P.magic} r={5} />
      </g>
      {/* Vector AB */}
      {showVec && (
        <g opacity={fi(frame, 180, 25)}>
          <Vector3D from={A} to={B} ry={ry} rx={rx} cx={210} cy={210} sc={55} color={P.vec} label="AB⃗" />
        </g>
      )}
      {/* Component lines */}
      {showComp && (
        <g opacity={fi(frame, 450, 30)}>
          {/* Δx */}
          <Vector3D from={A} to={[B[0],A[1],A[2]]} ry={ry} rx={rx} cx={210} cy={210} sc={55} color={P.ax} label="Δx=2" width={1.5} />
          {/* Δz */}
          <Vector3D from={[B[0],A[1],A[2]]} to={[B[0],A[1],B[2]]} ry={ry} rx={rx} cx={210} cy={210} sc={55} color={P.az} label="Δz=3" width={1.5} />
          {/* Δy */}
          <Vector3D from={[B[0],A[1],B[2]]} to={B} ry={ry} rx={rx} cx={210} cy={210} sc={55} color={P.ay} label="Δy=2" width={1.5} />
        </g>
      )}
    </svg>
  );

  return (
    <LessonScene
      title="Vecteurs dans l'espace" dur={dur} accent={P.gold}
      music="music2.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 30,  text: "AB⃗ = (xB−xA ; yB−yA ; zB−zA)",  color: "#f0f0e8" },
        { f: 200, text: "AB⃗ = (2 ; 2 ; 3)",               color: P.gold  },
        { f: 500, text: "|AB| = √(4+4+9) = √17 ≈ 4,12",   color: "#a78bfa"},
        { f: 780, text: "Colinéaires : ∃k, u⃗ = k·v⃗",      color: P.blue  },
      ]}
      dialogues={[
        { f: 40,  speaker: "prof",  text: "Le vecteur AB⃗ se calcule : coordonnées de B moins coordonnées de A." },
        { f: 220, speaker: "lea",   text: "Donc AB⃗ = (3−1 ; 2−0 ; 4−1) = (2 ; 2 ; 3) ?" },
        { f: 370, speaker: "prof",  text: "Exactement ! Et sa norme — sa longueur — c'est √(2²+2²+3²) = √17." },
        { f: 560, speaker: "lucas", text: "C'est Pythagore mais en 3D !" },
        { f: 700, speaker: "prof",  text: "Bien vu ! Le théorème de Pythagore se généralise parfaitement à l'espace." },
        { f: 900, speaker: "lea",   text: "Et deux vecteurs colinéaires, c'est quand l'un est multiple de l'autre ?" },
        { f: 1040,speaker: "prof",  text: "Oui ! u⃗ et v⃗ sont colinéaires si ∃k tel que u⃗ = k·v⃗." },
      ]}
    />
  );
}

// ── DROITES SCENE ─────────────────────────────────────────────────────────────
function DroitesScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DROITES.d;
  const ry = 0.7 + frame * 0.008;
  const rx = 0.28;
  const A = [0, 1, 0];
  const u = [1, 1, 1];
  const t1 = -2, t2 = 2.5;

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 440 400" style={{ position: "absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={200} cy={200} sc={52} grid />
      {/* The line M = A + t·u */}
      {(() => {
        const p1 = proj(A[0]+t1*u[0], A[1]+t1*u[1], A[2]+t1*u[2], ry, rx, 200, 200, 52);
        const p2 = proj(A[0]+t2*u[0], A[1]+t2*u[1], A[2]+t2*u[2], ry, rx, 200, 200, 52);
        return <line x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py} stroke={P.magic} strokeWidth={2.5} />;
      })()}
      <g opacity={fi(frame, 80, 25)}>
        <Point3D pos={A} ry={ry} rx={rx} cx={200} cy={200} sc={52} label="A(0;1;0)" color={P.gold} r={5} />
      </g>
      <g opacity={fi(frame, 200, 25)}>
        <Vector3D from={A} to={[A[0]+u[0], A[1]+u[1], A[2]+u[2]]}
          ry={ry} rx={rx} cx={200} cy={200} sc={52} color={P.blue} label="u⃗(1;1;1)" />
      </g>
      {/* A moving point on the line */}
      {(() => {
        const t = Math.sin(frame / 40) * 1.8;
        const mp = proj(A[0]+t*u[0], A[1]+t*u[1], A[2]+t*u[2], ry, rx, 200, 200, 52);
        return <circle cx={mp.px} cy={mp.py} r={5} fill={P.lea} opacity={fi(frame, 300, 20)} style={{ filter: "drop-shadow(0 0 4px #4ade80)" }} />;
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Droites dans l'espace" dur={dur} accent={P.magic}
      music="music3.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 30,  text: "M ∈ (d) ⟺ OM⃗ = OA⃗ + t·u⃗",  color: "#f0f0e8" },
        { f: 180, text: "x = 0 + t",                    color: P.ax    },
        { f: 220, text: "y = 1 + t",                    color: P.ay    },
        { f: 260, text: "z = 0 + t   (t ∈ ℝ)",          color: P.az    },
      ]}
      dialogues={[
        { f: 40,  speaker: "prof",  text: "Une droite est définie par un point A et un vecteur directeur u⃗." },
        { f: 220, speaker: "lea",   text: "Et n'importe quel point M de la droite vérifie OM⃗ = OA⃗ + t·u⃗ ?" },
        { f: 360, speaker: "prof",  text: "Exactement ! Le paramètre t fait glisser M le long de la droite." },
        { f: 520, speaker: "lucas", text: "Le point vert bouge ! C'est ça le paramètre t qui varie ?" },
        { f: 620, speaker: "prof",  text: "Oui ! Quand t varie dans ℝ, on parcourt toute la droite." },
      ]}
    />
  );
}

// ── PLANS SCENE ───────────────────────────────────────────────────────────────
function PlansScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.PLANS.d;
  const ry = 0.3 + frame * 0.007;
  const rx = 0.30;
  // Plane x + y + z = 4, corners in the plane
  const planeCorners = [
    [4,0,0], [0,4,0], [0,0,4], // triangle
  ];
  // Extended plane quad corners (in plane x+y+z=4)
  const corners = [
    [4, 0, 0], [2, 2, 0], [0, 2, 2], [2, 0, 2],
  ];
  const normal = [1, 1, 1]; // normal to x+y+z=4 (unnormalized)
  const A = [4/3, 4/3, 4/3]; // centroid on plane
  const normEnd = [A[0]+normal[0]*0.9, A[1]+normal[1]*0.9, A[2]+normal[2]*0.9];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 440 400" style={{ position: "absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={200} cy={200} sc={54} grid={false} />
      {/* The plane */}
      <g opacity={fi(frame, 60, 30)}>
        <Plane3D corners={corners} ry={ry} rx={rx} cx={200} cy={200} sc={54} color="#38bdf830" stroke="#38bdf877" />
      </g>
      {/* Normal vector */}
      <g opacity={fi(frame, 250, 30)}>
        <Vector3D from={A} to={normEnd} ry={ry} rx={rx} cx={200} cy={200} sc={54} color={P.gold} label="n⃗" />
      </g>
      {/* Point on plane */}
      <g opacity={fi(frame, 100, 20)}>
        <Point3D pos={[4,0,0]} ry={ry} rx={rx} cx={200} cy={200} sc={54} label="(4;0;0)" color={P.lea} r={4} />
        <Point3D pos={[0,4,0]} ry={ry} rx={rx} cx={200} cy={200} sc={54} label="(0;4;0)" color={P.lea} r={4} />
        <Point3D pos={[0,0,4]} ry={ry} rx={rx} cx={200} cy={200} sc={54} label="(0;0;4)" color={P.lea} r={4} />
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Plans dans l'espace" dur={dur} accent={P.blue}
      music="music3.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 30,  text: "Plan : ax + by + cz + d = 0",       color: "#f0f0e8" },
        { f: 200, text: "Ici : x + y + z − 4 = 0",           color: P.blue  },
        { f: 300, text: "n⃗(a ; b ; c) ⊥ au plan",            color: P.gold  },
        { f: 450, text: "n⃗(1 ; 1 ; 1) ici",                  color: P.gold  },
      ]}
      dialogues={[
        { f: 40,  speaker: "prof",  text: "Un plan a une équation cartésienne ax + by + cz + d = 0." },
        { f: 220, speaker: "lucas", text: "Et le vecteur n⃗(a ; b ; c) est perpendiculaire au plan ?" },
        { f: 360, speaker: "prof",  text: "Exactement ! On l'appelle le vecteur normal. Il est orthogonal à tout vecteur du plan." },
        { f: 530, speaker: "lea",   text: "Pour le plan x+y+z = 4, n⃗ = (1;1;1) donc ?" },
        { f: 630, speaker: "prof",  text: "Oui ! Et le plan coupe les axes en (4;0;0), (0;4;0) et (0;0;4)." },
      ]}
    />
  );
}

// ── PARALLELISME SCENE ────────────────────────────────────────────────────────
function ParallexScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.PARALLEX.d;
  const ry = 0.4 + frame * 0.006;
  const rx = 0.28;

  const plane1 = [ [-2,-1,-2],[ 2,-1,-2],[ 2,-1, 2],[-2,-1, 2] ];
  const plane2 = [ [-2, 1,-2],[ 2, 1,-2],[ 2, 1, 2],[-2, 1, 2] ];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 440 400" style={{ position: "absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={210} cy={210} sc={50} grid={false} />
      {/* Two parallel planes */}
      <g opacity={fi(frame, 60, 30)}>
        <Plane3D corners={plane1} ry={ry} rx={rx} cx={210} cy={210} sc={50} color="#38bdf828" stroke="#38bdf866" />
        <Plane3D corners={plane2} ry={ry} rx={rx} cx={210} cy={210} sc={50} color="#f43f5e22" stroke="#f43f5e66" />
      </g>
      {/* Normal arrows on both planes */}
      <g opacity={fi(frame, 300, 30)}>
        <Vector3D from={[0,-1,0]} to={[0,-2.2,0]} ry={ry} rx={rx} cx={210} cy={210} sc={50} color={P.gold} label="n⃗" />
        <Vector3D from={[0, 1,0]} to={[0, 2.2,0]} ry={ry} rx={rx} cx={210} cy={210} sc={50} color={P.gold} />
      </g>
      {/* Perpendicular vectors */}
      <g opacity={fi(frame, 550, 30)}>
        <Vector3D from={[0,0,0]} to={[2,0,0]} ry={ry} rx={rx} cx={210} cy={210} sc={50} color={P.ax} label="u⃗" />
        <Vector3D from={[0,0,0]} to={[0,2,0]} ry={ry} rx={rx} cx={210} cy={210} sc={50} color={P.ay} label="v⃗ ⊥ u⃗" />
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Parallélisme & Perpendicularité" dur={dur} accent={P.magic}
      music="music2.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 40,  text: "Plans ∥ ⟺ n⃗₁ et n⃗₂ colinéaires",  color: "#f0f0e8" },
        { f: 300, text: "Droite ⊥ plan ⟺ dir. ∥ à n⃗",       color: P.blue   },
        { f: 500, text: "u⃗ ⊥ v⃗ ⟺ u⃗ · v⃗ = 0",              color: P.gold   },
      ]}
      dialogues={[
        { f: 40,  speaker: "prof",  text: "Deux plans sont parallèles si et seulement si leurs vecteurs normaux sont colinéaires." },
        { f: 300, speaker: "lea",   text: "Et une droite est perpendiculaire à un plan si son vecteur directeur est parallèle au vecteur normal ?" },
        { f: 480, speaker: "prof",  text: "Exactement ! La clé de tout ça c'est le produit scalaire qu'on va voir ensuite." },
        { f: 650, speaker: "lucas", text: "Deux vecteurs orthogonaux c'est u⃗ · v⃗ = 0, c'est ça ?" },
        { f: 750, speaker: "prof",  text: "Oui ! C'est le critère fondamental d'orthogonalité dans l'espace." },
      ]}
    />
  );
}

// ── PRODUIT SCALAIRE SCENE ────────────────────────────────────────────────────
function ProduitScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.PRODUIT.d;
  const ry = 0.5 + frame * 0.007;
  const rx = 0.25;
  // u = (2,1,0), v = (1,2,1)
  const u = [2,1,0], v = [1,2,1];
  const dot = u[0]*v[0]+u[1]*v[1]+u[2]*v[2]; // = 4
  const nu = Math.sqrt(u.reduce((s,c)=>s+c*c,0)); // √5
  const nv = Math.sqrt(v.reduce((s,c)=>s+c*c,0)); // √6
  const cosT = dot/(nu*nv);
  const theta = Math.acos(cosT); // radians

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 440 400" style={{ position: "absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={200} cy={210} sc={55} grid={false} />
      <g opacity={fi(frame, 60, 25)}>
        <Vector3D from={[0,0,0]} to={u} ry={ry} rx={rx} cx={200} cy={210} sc={55} color={P.blue} label="u⃗(2;1;0)" />
      </g>
      <g opacity={fi(frame, 130, 25)}>
        <Vector3D from={[0,0,0]} to={v} ry={ry} rx={rx} cx={200} cy={210} sc={55} color={P.magic} label="v⃗(1;2;1)" />
      </g>
      {/* Angle arc */}
      {frame > 300 && (() => {
        const pu = proj(u[0]*0.5,u[1]*0.5,u[2]*0.5, ry,rx, 200,210,55);
        const pv = proj(v[0]*0.5,v[1]*0.5,v[2]*0.5, ry,rx, 200,210,55);
        const pm = proj((u[0]+v[0])*0.28,(u[1]+v[1])*0.28,(u[2]+v[2])*0.28, ry,rx,200,210,55);
        const O  = proj(0,0,0, ry,rx, 200,210,55);
        const r = Math.hypot(pu.px-O.px, pu.py-O.py);
        return (
          <g opacity={fi(frame, 300, 25)}>
            <text x={pm.px} y={pm.py-8} fill={P.gold} fontSize={14} fontWeight={700}>θ</text>
          </g>
        );
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Produit scalaire & angle" dur={dur} accent={P.blue}
      music="music3.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 30,  text: "u⃗·v⃗ = x₁x₂ + y₁y₂ + z₁z₂",         color: "#f0f0e8" },
        { f: 180, text: "Ici : 2×1 + 1×2 + 0×1 = 4",           color: P.gold  },
        { f: 340, text: "cos θ = u⃗·v⃗ / (|u⃗|×|v⃗|)",           color: P.blue  },
        { f: 500, text: "u⃗ ⊥ v⃗ ⟺ u⃗·v⃗ = 0",                  color: P.lea   },
      ]}
      dialogues={[
        { f: 40,  speaker: "prof",  text: "Le produit scalaire de u⃗(x₁;y₁;z₁) et v⃗(x₂;y₂;z₂) vaut x₁x₂+y₁y₂+z₁z₂." },
        { f: 220, speaker: "lea",   text: "Et ça sert à calculer l'angle entre deux vecteurs ?" },
        { f: 360, speaker: "prof",  text: "Exactement ! cos θ = u⃗·v⃗ divisé par le produit des normes." },
        { f: 530, speaker: "lucas", text: "Donc si le produit scalaire est nul, les vecteurs sont orthogonaux ?" },
        { f: 640, speaker: "prof",  text: "Oui ! c'est le critère le plus utilisé : u⃗·v⃗ = 0 ⟺ u⃗ ⊥ v⃗." },
      ]}
    />
  );
}

// ── DEMO SCENE (PYRAMIDE) ─────────────────────────────────────────────────────
const PYRAMID_VERTS = {
  A: [0,0,0], B: [4,0,0], C: [4,4,0], D: [0,4,0], S: [2,2,5]
};

function DemoScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DEMO.d;
  const opacity = sceneFade(frame, dur);
  const ry = 0.3 + frame * 0.005;
  const rx = 0.28;
  const cx = 260, cy = 310, sc = 48;

  const V = PYRAMID_VERTS;
  const I = [2,2,0]; // centre base

  const steps = [
    { f: 0,    text: "Pyramide SABCD — base carrée 4×4, sommet S(2;2;5)" },
    { f: 180,  text: "I = centre de ABCD = ((0+4+4+0)/4 ; (0+0+4+4)/4 ; 0) = (2;2;0)" },
    { f: 420,  text: "SI⃗ = I − S = (0;0;−5) → |SI| = 5  (hauteur de la pyramide)" },
    { f: 660,  text: "SA⃗ = A − S = (−2;−2;−5),  AB⃗ = (4;0;0)" },
    { f: 860,  text: "cos(∠SAB) = SA⃗·AB⃗ / (|SA⃗||AB⃗|) = −8/(√33×4) ≈ −0,35" },
    { f: 1060, text: "∠SAB ≈ 110°  (angle obtus car S est au-dessus de A)" },
    { f: 1300, text: "V = (1/3) × Base × h = (1/3) × 16 × 5 = 80/3 ≈ 26,7 u³" },
    { f: 1560, text: "✓ Hauteur = 5 · Angle ≈ 110° · Volume ≈ 26,7 u³" },
  ];
  const currentStep = [...steps].reverse().find(s => frame >= s.f) || steps[0];

  const faces = [
    { verts: ["A","B","S"], col: "#f43f5e22", str: "#f43f5e66" },
    { verts: ["B","C","S"], col: "#38bdf822", str: "#38bdf866" },
    { verts: ["C","D","S"], col: "#a78bfa22", str: "#a78bfa66" },
    { verts: ["D","A","S"], col: "#4ade8022", str: "#4ade8066" },
  ];

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile("audio/music5.mp3")} volume={0.10} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Sequence from={1560}><Audio src={staticFile("audio/sfx_ding.mp3")} volume={0.65} /></Sequence>
      <Stars count={40} />

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,transparent,#fbbf24,transparent)", boxShadow: "0 0 20px #fbbf24" }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 22, left: 50, right: 50 }}>
        <div style={{ color: P.gold, fontSize: 15, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
          Problème complet · Pyramide SABCD
        </div>
        <div style={{ color: P.text, fontSize: 44, fontWeight: 900, lineHeight: 1.1, marginTop: 4 }}>
          Résolution pas à pas
        </div>
        <div style={{ marginTop: 8, height: 3, background: P.border, borderRadius: 3 }}>
          <div style={{ width: `${(frame / dur) * 100}%`, height: "100%", background: P.gold, borderRadius: 3 }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "absolute", top: 148, left: 50, right: 50, bottom: 30, display: "flex", gap: 28 }}>
        {/* 3D Pyramid */}
        <div style={{ flex: "0 0 52%", background: P.surface, borderRadius: 16, border: `1px solid ${P.border}`, position: "relative", overflow: "hidden" }}>
          <svg width="100%" height="100%" viewBox="0 0 520 450" style={{ position: "absolute" }}>
            <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} grid />
            {/* Base */}
            <g opacity={fi(frame, 40, 30)}>
              <Plane3D corners={[V.A,V.B,V.C,V.D]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#ffffff0a" stroke="#ffffff33" />
            </g>
            {/* Faces */}
            {faces.map(({ verts, col, str }, i) => (
              <g key={i} opacity={fi(frame, 80 + i*30, 25)}>
                <Plane3D corners={verts.map(k => Object.values(V)[Object.keys(V).indexOf(k)])} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={col} stroke={str} />
              </g>
            ))}
            {/* Vertices */}
            {Object.entries(V).map(([name, pos], i) => (
              <g key={name} opacity={fi(frame, 120 + i*20, 20)}>
                <Point3D pos={pos} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label={name} color={name==="S"?P.gold:P.text} r={5} />
              </g>
            ))}
            {/* I — center of base */}
            {frame > 200 && (
              <g opacity={fi(frame, 200, 20)}>
                <Point3D pos={I} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="I" color={P.magic} r={5} />
              </g>
            )}
            {/* SI height */}
            {frame > 380 && (
              <g opacity={fi(frame, 380, 25)}>
                <Vector3D from={V.S} to={I} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} label="|SI|=5" width={2} />
              </g>
            )}
          </svg>
          {/* Vertex coords legend */}
          <div style={{ position: "absolute", bottom: 12, left: 14, fontFamily: MONO, fontSize: 11, color: P.dim, lineHeight: 1.7, opacity: fi(frame, 100, 20) }}>
            A(0;0;0)  B(4;0;0)<br />C(4;4;0)  D(0;4;0)<br />S(2;2;5)
          </div>
        </div>

        {/* Steps + classroom */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Current step */}
          <div style={{ background: "#1a1b2e", border: `2px solid ${P.gold}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ color: P.gold, fontSize: 12, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>ÉTAPE EN COURS</div>
            <div style={{ color: P.text, fontFamily: MONO, fontSize: 14, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: mathHTML(currentStep.text) }} />
          </div>
          {/* All steps */}
          <div style={{ flex: 1, background: P.card, borderRadius: 14, border: `1px solid ${P.border}`, padding: "14px 18px", overflowY: "hidden" }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                opacity: frame >= s.f ? (s === currentStep ? 1 : 0.35) : 0.1,
                color: s === currentStep ? P.gold : P.text,
                fontFamily: MONO, fontSize: 12, lineHeight: 1.6, marginBottom: 4,
                fontWeight: s === currentStep ? 700 : 400,
              }} dangerouslySetInnerHTML={{ __html: `${i+1}. ${mathHTML(s.text)}` }} />
            ))}
          </div>
          {/* Classroom */}
          <ClassroomPanel frame={frame} dialogues={[
            { f: 40,   speaker: "prof",  text: "Voici une pyramide SABCD à base carrée. Trouvons la hauteur, un angle et le volume." },
            { f: 300,  speaker: "lea",   text: "I est le milieu de la base, donc SI c'est la hauteur ?" },
            { f: 440,  speaker: "prof",  text: "Exactement ! SI⃗ = (0;0;−5) donc |SI| = 5." },
            { f: 700,  speaker: "lucas", text: "Pour l'angle SAB on utilise le produit scalaire ?" },
            { f: 820,  speaker: "prof",  text: "Oui ! SA⃗·AB⃗ = −8, et on trouve cos θ ≈ −0,35, soit θ ≈ 110°." },
            { f: 1100, speaker: "lea",   text: "Et le volume V = (1/3) × Aire base × hauteur !" },
            { f: 1350, speaker: "prof",  text: "Parfait ! V = (1/3)×16×5 = 80/3 ≈ 26,7 unités cubes." },
          ]} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── SPHERE SCENE ──────────────────────────────────────────────────────────────
function SphereScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.SPHERE.d;
  const pulse = Math.sin(frame / 30) * 0.04 + 1;

  const vizContent = (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Sphere (CSS 3D illusion) */}
      <div style={{ position: "relative" }}>
        <div style={{
          width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 32%, #60a5facc, #1e3a8a88 55%, #0a0e1a)",
          boxShadow: "0 0 60px #3b82f666, inset 0 0 40px #00000088",
          transform: `scale(${pulse})`,
        }} />
        {/* Center */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          width: 10, height: 10, borderRadius: "50%", background: P.gold,
          boxShadow: `0 0 10px ${P.gold}`,
        }} />
        {/* Omega label */}
        <div style={{ position: "absolute", left: "52%", top: "48%", color: P.gold, fontFamily: MONO, fontSize: 18, fontWeight: 700 }}>Ω</div>
        {/* Radius line */}
        <svg style={{ position: "absolute", inset: 0, overflow: "visible" }} width={260} height={260}>
          <line x1={130} y1={130} x2={220} y2={75} stroke={P.blue} strokeWidth={2} />
          <text x={180} y={90} fill={P.blue} fontSize={14} fontWeight={700}>r</text>
          <circle cx={220} cy={75} r={5} fill={P.blue} />
        </svg>
        {/* Equator circle */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          width: 260, height: 80, borderRadius: "50%",
          border: "2px dashed #3b82f655",
        }} />
      </div>
    </div>
  );

  return (
    <LessonScene
      title="Sphère dans l'espace" dur={dur} accent={P.blue}
      music="music1.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 30,  text: "Sphère Ω(a;b;c), rayon r :",           color: "#f0f0e8" },
        { f: 100, text: "(x−a)²+(y−b)²+(z−c)² = r²",           color: P.blue  },
        { f: 300, text: "d(M, plan) = |ax₀+by₀+cz₀+d|/√(a²+b²+c²)", color: P.gold },
        { f: 550, text: "M ∈ sphère ⟺ |ΩM| = r",              color: P.lea   },
      ]}
      dialogues={[
        { f: 40,  speaker: "prof",  text: "Une sphère de centre Ω(a;b;c) et rayon r : tous les points à distance r de Ω." },
        { f: 230, speaker: "lea",   text: "L'équation c'est (x−a)²+(y−b)²+(z−c)² = r² ?" },
        { f: 360, speaker: "prof",  text: "Exactement ! Et on peut aussi calculer la distance d'un point à un plan." },
        { f: 530, speaker: "lucas", text: "C'est utile pour savoir si la sphère coupe un plan ?" },
        { f: 650, speaker: "prof",  text: "Oui ! Si d(Ω, plan) < r, ils se coupent ; si d = r, le plan est tangent." },
      ]}
    />
  );
}

// ── PRODUIT VECTORIEL SCENE ───────────────────────────────────────────────────
function PVectScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.PVECT.d;
  const ry = 0.5 + frame * 0.007;
  const rx = 0.28;
  const u = [2, 0, 0];
  const v = [1, 2, 0];
  // u × v = (0*0-0*2, 0*1-2*0, 2*2-0*1) = (0,0,4)
  const w = [0, 0, 4];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 440 400" style={{ position: "absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={210} cy={220} sc={52} grid />
      <g opacity={fi(frame, 60, 25)}>
        <Vector3D from={[0,0,0]} to={u} ry={ry} rx={rx} cx={210} cy={220} sc={52} color={P.blue} label="u⃗(2;0;0)" />
      </g>
      <g opacity={fi(frame, 140, 25)}>
        <Vector3D from={[0,0,0]} to={v} ry={ry} rx={rx} cx={210} cy={220} sc={52} color={P.magic} label="v⃗(1;2;0)" />
      </g>
      {/* Parallelogram */}
      <g opacity={fi(frame, 300, 30)}>
        <Plane3D corners={[[0,0,0], u, [u[0]+v[0],u[1]+v[1],u[2]+v[2]], v]}
          ry={ry} rx={rx} cx={210} cy={220} sc={52} color="#fbbf2418" stroke="#fbbf2455" />
      </g>
      {/* Cross product result */}
      <g opacity={fi(frame, 480, 30)}>
        <Vector3D from={[0,0,0]} to={w} ry={ry} rx={rx} cx={210} cy={220} sc={52} color={P.gold} label="u⃗×v⃗(0;0;4)" />
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Produit vectoriel" dur={dur} accent={P.magic}
      music="music1.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 30,  text: "u⃗×v⃗ = (y₁z₂−z₁y₂ ; z₁x₂−x₁z₂ ; x₁y₂−y₁x₂)",  color: "#f0f0e8" },
        { f: 300, text: "u⃗×v⃗ ⊥ u⃗  et  u⃗×v⃗ ⊥ v⃗",                       color: P.gold  },
        { f: 520, text: "|u⃗×v⃗| = Aire du parallélogramme",                 color: P.blue  },
      ]}
      dialogues={[
        { f: 40,  speaker: "prof",  text: "Le produit vectoriel u⃗×v⃗ donne un vecteur perpendiculaire aux deux." },
        { f: 280, speaker: "lea",   text: "Donc u⃗×v⃗ est le vecteur normal d'un plan contenant u⃗ et v⃗ ?" },
        { f: 420, speaker: "prof",  text: "Exactement ! C'est très utile pour trouver l'équation d'un plan." },
        { f: 600, speaker: "lucas", text: "Et le module c'est l'aire du parallélogramme formé par u⃗ et v⃗ ?" },
        { f: 710, speaker: "prof",  text: "Oui ! Donc l'aire du triangle est la moitié : |u⃗×v⃗|/2." },
      ]}
    />
  );
}

// ── PYRAMIDE COMPLETE SCENE ───────────────────────────────────────────────────
function PyramideScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.PYRAMIDE.d;
  const ry = 0.4 + frame * 0.006;
  const rx = 0.30;
  const V = { A:[0,0,0], B:[3,0,0], C:[1.5,0,3*Math.sqrt(3)/2], S:[1.5,3,Math.sqrt(3)/2] };

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 440 400" style={{ position: "absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={200} cy={230} sc={48} grid />
      {[["A","B","S"],["B","C","S"],["A","C","S"]].map(([a,b,c],i) => (
        <g key={i} opacity={fi(frame, 60+i*40, 25)}>
          <Plane3D corners={[V[a],V[b],V[c]]}
            ry={ry} rx={rx} cx={200} cy={230} sc={48}
            color={["#f43f5e22","#38bdf822","#4ade8022"][i]}
            stroke={["#f43f5e66","#38bdf866","#4ade8066"][i]} />
        </g>
      ))}
      {Object.entries(V).map(([name, pos], i) => (
        <g key={name} opacity={fi(frame, 80+i*20, 20)}>
          <Point3D pos={pos} ry={ry} rx={rx} cx={200} cy={230} sc={48}
            label={name} color={name==="S"?P.gold:P.text} r={5} />
        </g>
      ))}
    </svg>
  );

  return (
    <LessonScene
      title="Tétraèdre régulier — bilan" dur={dur} accent={P.lea}
      music="music1.mp3" narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f: 30,  text: "Toutes arêtes égales → tétraèdre régulier",  color: "#f0f0e8" },
        { f: 200, text: "V = a³√2/12  (a = arête)",                   color: P.gold  },
        { f: 400, text: "H = a√(2/3)",                                color: P.blue  },
        { f: 580, text: "Angle dièdre ≈ 70,53°",                      color: P.magic },
      ]}
      dialogues={[
        { f: 40,  speaker: "prof",  text: "Un tétraèdre régulier ABCS a toutes ses arêtes égales. Toutes les faces sont des triangles équilatéraux." },
        { f: 260, speaker: "lea",   text: "Le produit vectoriel permet de trouver le vecteur normal à chaque face ?" },
        { f: 420, speaker: "prof",  text: "Exactement ! Et à partir du vecteur normal on déduit l'équation du plan de la face." },
        { f: 600, speaker: "lucas", text: "C'est tout ce qu'on a vu dans le cours réuni en un seul problème !" },
        { f: 720, speaker: "prof",  text: "C'est ça la géométrie dans l'espace : repère, vecteurs, plans et angles — tout est lié." },
      ]}
    />
  );
}

// ── OUTRO SCENE ───────────────────────────────────────────────────────────────
function OutroScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.OUTRO.d;
  const opacity = sceneFade(frame, dur);

  const items = [
    { icon: "🎯", label: "Repère 3D",         desc: "M(x;y;z), OM⃗, distance |OM|" },
    { icon: "➡️", label: "Vecteurs",           desc: "AB⃗ = B−A, norme √(Δx²+Δy²+Δz²)" },
    { icon: "📏", label: "Droites",            desc: "M = A + t·u⃗ (forme paramétrique)" },
    { icon: "🟦", label: "Plans",              desc: "ax+by+cz+d = 0, n⃗(a;b;c) normal" },
    { icon: "·",  label: "Produit scalaire",   desc: "u⃗·v⃗ = x₁x₂+y₁y₂+z₁z₂, angle θ" },
    { icon: "✖️", label: "Produit vectoriel",  desc: "u⃗×v⃗ ⊥ u⃗ et v⃗, aire = |u⃗×v⃗|" },
  ];

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile("audio/music6.mp3")} volume={0.13} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Sequence from={200}><Audio src={staticFile("audio/sfx_applause.mp3")} volume={0.45} /></Sequence>
      <Stars count={100} seed={3} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ opacity: fi(frame, 10, 22), color: P.gold, fontSize: 20, fontWeight: 800,
          textTransform: "uppercase", letterSpacing: 4, marginBottom: 16 }}>
          Récapitulatif
        </div>
        <div style={{ fontSize: 64, fontWeight: 950, color: P.text, textShadow: "0 0 40px #3b82f644", marginBottom: 6 }}>
          Tu maîtrises
        </div>
        <div style={{ opacity: fi(frame, 30, 22), fontSize: 28, color: "#38bdf8", fontWeight: 700, marginBottom: 44 }}>
          la géométrie dans l'espace — Terminale
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, maxWidth: 1200, justifyContent: "center" }}>
          {items.map(({ icon, label, desc }, i) => {
            const sc = spring({ frame: frame - (60 + i * 50), fps, config: { damping: 12, stiffness: 60 } });
            return (
              <div key={label} style={{
                opacity: sc, transform: `scale(${0.6 + sc * 0.4}) translateY(${(1-sc)*30}px)`,
                background: P.card, border: `1px solid ${P.border}`,
                borderRadius: 16, padding: "18px 22px", width: 320,
                display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ color: P.text, fontSize: 18, fontWeight: 800 }}>{label}</div>
                  <div style={{ color: P.dim, fontSize: 14, marginTop: 4, fontFamily: MONO }} dangerouslySetInnerHTML={{ __html: mathHTML(desc) }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ opacity: fi(frame, dur - 200, 30), marginTop: 44, textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", borderRadius: 16,
            padding: "18px 48px", color: "#fff", fontSize: 26, fontWeight: 900,
            boxShadow: "0 0 40px #3b82f666" }}>
            📐 Bonne chance au bac !
          </div>
          <div style={{ color: P.dim, fontSize: 17, marginTop: 14 }}>
            Tous les outils pour les exercices de géométrie dans l'espace
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function GeoEspaceTerminal() {
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Sequence from={SC.INTRO.s}    durationInFrames={SC.INTRO.d}>
        <IntroScene narrationFile="geo_narration1.mp3" />
      </Sequence>
      <Sequence from={SC.REPERE.s}   durationInFrames={SC.REPERE.d}>
        <RepereScene narrationFile="geo_narration2.mp3" />
      </Sequence>
      <Sequence from={SC.VECTEURS.s} durationInFrames={SC.VECTEURS.d}>
        <VecteursScene narrationFile="geo_narration3.mp3" />
      </Sequence>
      <Sequence from={SC.DROITES.s}  durationInFrames={SC.DROITES.d}>
        <DroitesScene narrationFile="geo_narration4.mp3" />
      </Sequence>
      <Sequence from={SC.PLANS.s}    durationInFrames={SC.PLANS.d}>
        <PlansScene narrationFile="geo_narration5.mp3" />
      </Sequence>
      <Sequence from={SC.PARALLEX.s} durationInFrames={SC.PARALLEX.d}>
        <ParallexScene narrationFile="geo_narration6.mp3" />
      </Sequence>
      <Sequence from={SC.PRODUIT.s}  durationInFrames={SC.PRODUIT.d}>
        <ProduitScene narrationFile="geo_narration7.mp3" />
      </Sequence>
      <Sequence from={SC.DEMO.s}     durationInFrames={SC.DEMO.d}>
        <DemoScene narrationFile="geo_narration8.mp3" />
      </Sequence>
      <Sequence from={SC.SPHERE.s}   durationInFrames={SC.SPHERE.d}>
        <SphereScene narrationFile="geo_narration9.mp3" />
      </Sequence>
      <Sequence from={SC.PVECT.s}    durationInFrames={SC.PVECT.d}>
        <PVectScene narrationFile="geo_narration10.mp3" />
      </Sequence>
      <Sequence from={SC.PYRAMIDE.s} durationInFrames={SC.PYRAMIDE.d}>
        <PyramideScene narrationFile="geo_narration11.mp3" />
      </Sequence>
      <Sequence from={SC.OUTRO.s}    durationInFrames={SC.OUTRO.d}>
        <OutroScene narrationFile="geo_narration12.mp3" />
      </Sequence>
    </AbsoluteFill>
  );
}
