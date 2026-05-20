import {
  AbsoluteFill, Audio, Sequence, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from "remotion";

export const GEO_ESPACE2_DURATION = 11520;

const P = {
  bg: "#07080f", surface: "#0e1120", card: "#141824",
  board: "#0a2e1c", boardBorder: "#1a5c40",
  border: "#2a2f45", text: "#e2e8f0", dim: "#4a5568",
  gold: "#fbbf24", blue: "#38bdf8", magic: "#a78bfa",
  ax: "#ef4444", ay: "#22c55e", az: "#3b82f6",
  vec: "#fbbf24", plane: "#38bdf8", point: "#f9fafb",
  prof: "#3b82f6", lea: "#4ade80", lucas: "#f97316",
  perp: "#f43f5e", foot: "#06b6d4",
};
const SANS = "'Inter','Segoe UI',Arial,sans-serif";
const MONO = "'JetBrains Mono','Consolas','Courier New',monospace";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
const fi = (f, s = 0, d = 20) => interpolate(f, [s, s + d], [0, 1], clamp);
const fo = (f, s, d = 20)     => interpolate(f, [s, s + d], [1, 0], clamp);
const sceneFade = (f, dur)    => Math.min(fi(f, 0, 18), fo(f, dur - 18, 18));

function mathHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/([A-Za-zΩ])⃗/g, '$1<sup style="font-size:0.68em;vertical-align:super;font-style:normal;font-family:Arial,sans-serif">&#8594;</sup>')
    .replace(/ℝ/g, '<span style="font-family:Georgia,serif;font-weight:700">&#8477;</span>')
    .replace(/⟺/g, '<span style="letter-spacing:-1px"> &#10234; </span>');
}

// ── TIMING ────────────────────────────────────────────────────────────────────
const SC = {
  INTRO:      { s: 0,     d: 840  },
  DIST_PLAN:  { s: 840,   d: 1200 },
  PROJECTION: { s: 2040,  d: 1200 },
  POSITIONS:  { s: 3240,  d: 720  },
  INTERSECT:  { s: 3960,  d: 840  },
  ANGLE_PP:   { s: 4800,  d: 720  },
  ANGLE_DP:   { s: 5520,  d: 720  },
  DEMO:       { s: 6240,  d: 1920 },
  COPLAN:     { s: 8160,  d: 720  },
  SPHERE_TAN: { s: 8880,  d: 960  },
  BILAN:      { s: 9840,  d: 840  },
  OUTRO:      { s: 10680, d: 840  },
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
  return `${x2},${y2} ${x2+s*Math.cos(a+2.6)},${y2+s*Math.sin(a+2.6)} ${x2+s*Math.cos(a-2.6)},${y2+s*Math.sin(a-2.6)}`;
}

function Axes3D({ ry, rx, cx = 220, cy = 200, sc = 50, len = 3.0 }) {
  const O  = proj(0,0,0, ry,rx,cx,cy,sc);
  const px = proj(len,0,0, ry,rx,cx,cy,sc);
  const py = proj(0,len,0, ry,rx,cx,cy,sc);
  const pz = proj(0,0,len, ry,rx,cx,cy,sc);
  const lx = proj(len+0.5,0,0, ry,rx,cx,cy,sc);
  const ly = proj(0,len+0.5,0, ry,rx,cx,cy,sc);
  const lz = proj(0,0,len+0.5, ry,rx,cx,cy,sc);
  return (
    <>
      {[[px,P.ax,lx,"x"],[py,P.ay,ly,"y"],[pz,P.az,lz,"z"]].map(([pt,col,lpt,lbl],i)=>(
        <g key={i}>
          <line x1={O.px} y1={O.py} x2={pt.px} y2={pt.py} stroke={col} strokeWidth={2.5}/>
          <polygon points={arrow(O.px,O.py,pt.px,pt.py)} fill={col}/>
          <text x={lpt.px} y={lpt.py} fill={col} fontSize={16} fontWeight={800} textAnchor="middle" dominantBaseline="middle">{lbl}</text>
        </g>
      ))}
      <circle cx={O.px} cy={O.py} r={4} fill={P.point}/>
      <text x={O.px-14} y={O.py+6} fill={P.dim} fontSize={13}>O</text>
    </>
  );
}

function Point3D({ pos, ry, rx, cx, cy, sc, label, color = P.gold, r = 6 }) {
  const pt = proj(...pos, ry, rx, cx, cy, sc);
  return (
    <>
      <circle cx={pt.px} cy={pt.py} r={r} fill={color} style={{ filter:`drop-shadow(0 0 6px ${color})` }}/>
      {label && <text x={pt.px+10} y={pt.py-8} fill={color} fontSize={15} fontWeight={700}>{label}</text>}
    </>
  );
}

function Vector3D({ from, to, ry, rx, cx, cy, sc, color = P.vec, label, width = 2.5, dashed = false }) {
  const pf = proj(...from, ry,rx,cx,cy,sc);
  const pt = proj(...to,   ry,rx,cx,cy,sc);
  const lbl = label?.replace(/⃗/g,"→");
  return (
    <>
      <line x1={pf.px} y1={pf.py} x2={pt.px} y2={pt.py} stroke={color} strokeWidth={width}
        strokeDasharray={dashed?"6,4":"none"}/>
      {!dashed && <polygon points={arrow(pf.px,pf.py,pt.px,pt.py,10)} fill={color}/>}
      {lbl && <text x={(pf.px+pt.px)/2+12} y={(pf.py+pt.py)/2} fill={color} fontSize={14} fontWeight={700}>{lbl}</text>}
    </>
  );
}

function Plane3D({ corners, ry, rx, cx, cy, sc, color="#38bdf822", stroke="#38bdf877" }) {
  const pts = corners.map(c=>proj(...c,ry,rx,cx,cy,sc));
  return <polygon points={pts.map(p=>`${p.px},${p.py}`).join(" ")} fill={color} stroke={stroke} strokeWidth={1.5}/>;
}

function Stars({ count=50, seed=1 }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({length:count},(_,i)=>{
        const x = ((i*137+seed*31)%97)/97*width;
        const y = ((i*79+seed*17)%89)/89*height;
        const pulse = Math.sin((frame+i*13)/28)*0.5+0.5;
        const sz = 1.5+((i*11)%5)*0.7;
        return <div key={i} style={{ position:"absolute", left:x, top:y, width:sz, height:sz, borderRadius:"50%", background:"#e2e8f0", opacity:0.06+pulse*0.15 }}/>;
      })}
    </>
  );
}

function ClassroomPanel({ frame, dialogues=[] }) {
  const current = [...dialogues].reverse().find(d=>frame>=d.f)||null;
  const bub = (bc,bg) => ({ background:bg, border:`2px solid ${bc}`, borderRadius:12, padding:"10px 14px", color:P.text, fontSize:15, lineHeight:1.5 });
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:P.card, borderRadius:16, border:`1px solid ${P.border}`, padding:"16px 18px" }}>
        <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
          <div style={{ fontSize:52, lineHeight:1, flexShrink:0 }}>👨‍🏫</div>
          <div style={{ flex:1 }}>
            <div style={{ color:P.prof, fontSize:12, fontWeight:800, letterSpacing:2, marginBottom:6 }}>PROF. MARTIN</div>
            {current?.speaker==="prof"
              ? <div style={{ ...bub(P.prof,"#0f1e3a"), opacity:fi(frame,current.f,10) }} dangerouslySetInnerHTML={{__html:mathHTML(current.text)}}/>
              : <div style={{ color:P.dim, fontSize:14 }}>…</div>}
          </div>
        </div>
      </div>
      <div style={{ flex:1, background:P.card, borderRadius:16, border:`1px solid ${P.border}`, padding:"14px 18px" }}>
        <div style={{ color:P.dim, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>TERMINALE — PARTIE 2</div>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ fontSize:42, flexShrink:0 }}>👩‍🎓</div>
          <div style={{ flex:1 }}>
            <div style={{ color:P.lea, fontSize:12, fontWeight:700, marginBottom:4 }}>LÉA</div>
            {current?.speaker==="lea" && <div style={{ ...bub(P.lea,"#0a1f10"), opacity:fi(frame,current.f,10) }} dangerouslySetInnerHTML={{__html:mathHTML(current.text)}}/>}
          </div>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <div style={{ fontSize:42, flexShrink:0 }}>🧑‍🎓</div>
          <div style={{ flex:1 }}>
            <div style={{ color:P.lucas, fontSize:12, fontWeight:700, marginBottom:4 }}>LUCAS</div>
            {current?.speaker==="lucas" && <div style={{ ...bub(P.lucas,"#1f0e03"), opacity:fi(frame,current.f,10) }} dangerouslySetInnerHTML={{__html:mathHTML(current.text)}}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Blackboard({ frame, formulas }) {
  return (
    <div style={{ background:P.board, border:`3px solid ${P.boardBorder}`, borderRadius:12, padding:"12px 18px", minHeight:120 }}>
      <div style={{ color:"#80ffb0", fontSize:12, fontWeight:800, letterSpacing:2, marginBottom:10 }}>◆ FORMULES CLÉS</div>
      {formulas.map(({f,text,color="#f0f0e8"},i)=>(
        <div key={i} style={{ opacity:fi(frame,f,15), color, fontFamily:MONO, fontSize:16, fontWeight:600, lineHeight:1.7 }}
          dangerouslySetInnerHTML={{__html:mathHTML(text)}}/>
      ))}
    </div>
  );
}

function LessonScene({ title, dur, accent, music="music2.mp3", narrationFile, vizContent, formulas=[], dialogues=[] }) {
  const frame = useCurrentFrame();
  const opacity = sceneFade(frame, dur);
  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile(`audio/${music}`)} volume={0.08}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      {formulas.length>0 && <Sequence from={formulas[0].f}><Audio src={staticFile("audio/sfx_chalk.mp3")} volume={0.35}/></Sequence>}
      <Stars count={35}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,transparent,${accent},transparent)`, boxShadow:`0 0 20px ${accent}` }}/>
      <div style={{ position:"absolute", top:22, left:50, right:50 }}>
        <div style={{ color:accent, fontSize:15, fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>Géométrie dans l'espace · Terminale · Partie 2</div>
        <div style={{ color:P.text, fontSize:44, fontWeight:900, lineHeight:1.1, marginTop:4 }}>{title}</div>
        <div style={{ marginTop:8, height:3, background:P.border, borderRadius:3 }}>
          <div style={{ width:`${(frame/dur)*100}%`, height:"100%", background:accent, borderRadius:3, boxShadow:`0 0 6px ${accent}` }}/>
        </div>
      </div>
      <div style={{ position:"absolute", top:148, left:50, right:50, bottom:30, display:"flex", gap:28 }}>
        <div style={{ flex:"0 0 57%", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ flex:1, background:P.surface, borderRadius:16, border:`1px solid ${P.border}`, position:"relative", overflow:"hidden" }}>
            {vizContent}
          </div>
          <Blackboard frame={frame} formulas={formulas}/>
        </div>
        <ClassroomPanel frame={frame} dialogues={dialogues}/>
      </div>
    </AbsoluteFill>
  );
}

// ── INTRO ─────────────────────────────────────────────────────────────────────
function IntroScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.INTRO.d;
  const opacity = sceneFade(frame, dur);
  const ry = 0.4 + frame * 0.005;
  const rx = 0.28;
  const titleSc = spring({ frame:frame-15, fps, config:{ damping:14, stiffness:55 } });

  const topics = [
    { icon:"📏", label:"Distance point-plan", delay:200 },
    { icon:"🎯", label:"Projection orthogonale", delay:260 },
    { icon:"🔀", label:"Positions relatives (gauches)", delay:320 },
    { icon:"✂️", label:"Intersections droite/plan", delay:380 },
    { icon:"📐", label:"Angles dièdres & droite-plan", delay:440 },
    { icon:"🏆", label:"Problème BAC complet", delay:500 },
  ];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music4.mp3")} volume={0.12}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Sequence from={20}><Audio src={staticFile("audio/sfx_whoosh3d.mp3")} volume={0.5}/></Sequence>
      <Stars count={80} seed={7}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg,transparent,#a78bfa,transparent)", boxShadow:"0 0 20px #a78bfa" }}/>

      <div style={{ position:"absolute", left:60, top:60, right:"45%" }}>
        <div style={{ opacity:fi(frame,5,20), color:P.magic, fontSize:14, fontWeight:800, letterSpacing:4, textTransform:"uppercase", marginBottom:8 }}>
          Géométrie dans l'espace
        </div>
        <div style={{ transform:`scale(${0.7+titleSc*0.3}) translateY(${(1-titleSc)*30}px)`, color:P.text, fontSize:56, fontWeight:950, lineHeight:1.05, marginBottom:8 }}>
          Partie 2
        </div>
        <div style={{ opacity:fi(frame,30,22), fontSize:26, color:P.magic, fontWeight:700, marginBottom:4 }}>
          Distances · Angles · Intersections
        </div>
        <div style={{ opacity:fi(frame,50,22), fontSize:18, color:P.dim, marginBottom:36 }}>
          Niveau Terminale — exercices type bac
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {topics.map(({ icon, label, delay }, i) => (
            <div key={i} style={{ opacity:fi(frame,delay,18), transform:`translateX(${interpolate(frame,[delay,delay+18],[-20,0],clamp)}px)`,
              display:"flex", gap:10, alignItems:"center",
              background:P.card, borderRadius:10, padding:"10px 16px", border:`1px solid ${P.border}` }}>
              <span style={{ fontSize:22 }}>{icon}</span>
              <span style={{ color:P.text, fontSize:16, fontWeight:600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:"absolute", right:50, top:80, width:"40%", height:"75%" }}>
        <svg width="100%" height="100%" viewBox="0 0 420 420">
          <Axes3D ry={ry} rx={rx} cx={210} cy={220} sc={52}/>
          {/* Plane illustration */}
          <g opacity={fi(frame,80,30)}>
            <Plane3D corners={[[-2,0,-2],[2,0,-2],[2,0,2],[-2,0,2]]} ry={ry} rx={rx} cx={210} cy={220} sc={52} color="#a78bfa18" stroke="#a78bfa55"/>
          </g>
          {/* Point above plane */}
          <g opacity={fi(frame,140,25)}>
            <Point3D pos={[0.5,2.5,0.5]} ry={ry} rx={rx} cx={210} cy={220} sc={52} label="A" color={P.gold}/>
          </g>
          {/* Perpendicular foot */}
          <g opacity={fi(frame,200,25)}>
            <Point3D pos={[0.5,0,0.5]} ry={ry} rx={rx} cx={210} cy={220} sc={52} label="H" color={P.foot}/>
            {(() => {
              const pA = proj(0.5,2.5,0.5, ry,rx,210,220,52);
              const pH = proj(0.5,0,0.5, ry,rx,210,220,52);
              return (
                <>
                  <line x1={pA.px} y1={pA.py} x2={pH.px} y2={pH.py} stroke={P.perp} strokeWidth={2} strokeDasharray="6,4"/>
                  <text x={(pA.px+pH.px)/2+10} y={(pA.py+pH.py)/2} fill={P.perp} fontSize={14} fontWeight={700}>d</text>
                </>
              );
            })()}
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
}

// ── DISTANCE POINT-PLAN ───────────────────────────────────────────────────────
function DistancePlanScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DIST_PLAN.d;
  const ry = 0.5 + frame * 0.003;
  const rx = 0.22;
  const cx = 215, cy = 210, sc = 48;

  // Plane: y + z = 3  →  n⃗=(0,1,1), |n|=√2
  // A=(0,5,1): d = |5+1-3|/√2 = 3/√2 = 3√2/2 ≈ 2.12
  // H=(0,3.5,-0.5): 3.5+(-0.5)=3 ✓
  const planeCorners = [[2,1,2],[2,5,-2],[-2,5,-2],[-2,1,2]];
  const A = [0,5,1];
  const H = [0,3.5,-0.5];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 420" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,30,25)}>
        <Plane3D corners={planeCorners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf822" stroke="#38bdf877"/>
        {(() => {
          const p1=proj(2,1,2,ry,rx,cx,cy,sc), p2=proj(2,5,-2,ry,rx,cx,cy,sc);
          const p3=proj(-2,5,-2,ry,rx,cx,cy,sc), p4=proj(-2,1,2,ry,rx,cx,cy,sc);
          const mid = { px:(p1.px+p2.px+p3.px+p4.px)/4, py:(p1.py+p2.py+p3.py+p4.py)/4 };
          return <text x={mid.px} y={mid.py} fill="#38bdf8aa" fontSize={13} textAnchor="middle" fontWeight={700}>plan π</text>;
        })()}
      </g>
      <g opacity={fi(frame,80,25)}>
        <Point3D pos={A} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A(0;5;1)" color={P.gold}/>
      </g>
      <g opacity={fi(frame,200,25)}>
        <Point3D pos={H} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="H" color={P.foot}/>
      </g>
      {frame > 200 && (() => {
        const pA=proj(...A,ry,rx,cx,cy,sc), pH=proj(...H,ry,rx,cx,cy,sc);
        return (
          <g opacity={fi(frame,200,25)}>
            <line x1={pA.px} y1={pA.py} x2={pH.px} y2={pH.py} stroke={P.perp} strokeWidth={2.5} strokeDasharray="7,4"/>
            <text x={(pA.px+pH.px)/2+14} y={(pA.py+pH.py)/2-6} fill={P.perp} fontSize={15} fontWeight={800}>d</text>
          </g>
        );
      })()}
      {/* Normal vector at H */}
      {frame > 400 && (
        <g opacity={fi(frame,400,25)}>
          <Vector3D from={H} to={[0,4.5,0.5]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.magic} label="n⃗" width={2}/>
        </g>
      )}
    </svg>
  );

  return (
    <LessonScene
      title="Distance d'un point à un plan"
      dur={dur} accent={P.blue} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:30,  text:"π : ax + by + cz + d = 0",                    color:"#f0f0e8" },
        { f:200, text:"d(A, π) = |ax₀ + by₀ + cz₀ + d| / √(a²+b²+c²)", color:P.gold  },
        { f:450, text:"Ex : π : y+z−3=0, A(0;5;1)",                  color:"#f0f0e8" },
        { f:620, text:"d = |5+1−3| / √(1²+1²) = 3/√2 = 3√2/2",      color:P.blue  },
        { f:850, text:"n⃗(a;b;c) est le vecteur normal au plan",       color:P.magic },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Pour mesurer la distance d'un point à un plan, on projette perpendiculairement. La formule utilise l'équation du plan et la norme du vecteur normal." },
        { f:260, speaker:"lea",   text:"On remplace les coordonnées de A dans l'équation du plan, valeur absolue, et on divise par √(a²+b²+c²) ?" },
        { f:400, speaker:"prof",  text:"Exactement ! Ici : |0+5+1−3|/√2 = 3/√2. On rationalise : 3√2/2." },
        { f:680, speaker:"lucas", text:"Et si A est dans le plan, l'équation vaut 0, donc d=0 ?" },
        { f:800, speaker:"prof",  text:"Parfait. C'est la cohérence de la formule. H est le pied de la perpendiculaire de A sur π." },
      ]}
    />
  );
}

// ── PROJECTION ORTHOGONALE ────────────────────────────────────────────────────
function ProjectionScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.PROJECTION.d;
  const ry = 0.55 + frame * 0.002;
  const rx = 0.22;
  const cx = 215, cy = 215, sc = 46;

  const planeCorners = [[2,1,2],[2,5,-2],[-2,5,-2],[-2,1,2]];
  const A = [0,5,1];
  const H = [0,3.5,-0.5];
  // t = -(n⃗·OA+d)/|n⃗|² = -(5+1-3)/2 = -3/2

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 430" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <Plane3D corners={planeCorners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf818" stroke="#38bdf855"/>
      <Point3D pos={A} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A" color={P.gold}/>
      <Point3D pos={H} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="H (pied)" color={P.foot}/>
      {/* AH dashed */}
      {(() => {
        const pA=proj(...A,ry,rx,cx,cy,sc), pH=proj(...H,ry,rx,cx,cy,sc);
        return (
          <line x1={pA.px} y1={pA.py} x2={pH.px} y2={pH.py}
            stroke={P.perp} strokeWidth={2} strokeDasharray="6,4" opacity={fi(frame,60,20)}/>
        );
      })()}
      {/* AH vector */}
      <g opacity={fi(frame,150,25)}>
        <Vector3D from={A} to={H} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.perp} label="AH⃗ = t·n⃗" width={2.5}/>
      </g>
      {/* normal at H */}
      <g opacity={fi(frame,400,25)}>
        <Vector3D from={H} to={[0,4.5,0.5]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.magic} label="n⃗(0;1;1)" width={2}/>
      </g>
      {/* right angle symbol at H */}
      {frame > 150 && (() => {
        const pH=proj(...H,ry,rx,cx,cy,sc);
        return (
          <rect x={pH.px-8} y={pH.py-8} width={12} height={12}
            fill="none" stroke={P.foot} strokeWidth={1.5} opacity={fi(frame,200,20)}/>
        );
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Projection orthogonale"
      dur={dur} accent={P.foot} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:30,  text:"H = pied de perpendiculaire de A sur π",        color:"#f0f0e8" },
        { f:200, text:"t = −(ax₀+by₀+cz₀+d) / (a²+b²+c²)",           color:P.gold  },
        { f:420, text:"H = A + t·n⃗",                                   color:P.foot  },
        { f:640, text:"Ex : t = −(5+1−3)/2 = −3/2",                   color:"#f0f0e8" },
        { f:820, text:"H = (0+0 ; 5−3/2 ; 1−3/2) = (0 ; 7/2 ; −1/2)", color:P.blue  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"H est le point du plan le plus proche de A. La droite AH est perpendiculaire au plan, donc parallèle au vecteur normal n⃗." },
        { f:300, speaker:"lea",   text:"Donc H = A + t·n⃗ où t se calcule en injectant A dans l'équation du plan ?" },
        { f:430, speaker:"prof",  text:"Exactement ! t = −(f(A))/|n⃗|² où f(A) = ax₀+by₀+cz₀+d. Ici t = −3/2." },
        { f:700, speaker:"lucas", text:"Et si t est négatif, ça veut dire que H est 'en dessous' de A dans la direction de n⃗ ?" },
        { f:840, speaker:"prof",  text:"Oui ! Le signe de t indique de quel côté du plan se trouve A." },
      ]}
    />
  );
}

// ── POSITIONS RELATIVES ───────────────────────────────────────────────────────
function PositionsRelativesScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.POSITIONS.d;
  const ry = 0.5 + frame * 0.004;
  const rx = 0.25;
  const cx = 215, cy = 200, sc = 44;

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 400" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} len={2.5}/>
      {/* Case SÉCANTES */}
      <g opacity={fi(frame,40,20)}>
        <Vector3D from={[-2,0,0]} to={[2,0,0]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} width={2.5}/>
        <Vector3D from={[0,0,-2]} to={[0,0,2]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.lea} width={2.5}/>
        <Point3D pos={[0,0,0]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="I" color={P.gold} r={5}/>
        {(() => {
          const pI = proj(0,0,0,ry,rx,cx,cy,sc);
          return <text x={pI.px+40} y={pI.py-60} fill={P.gold} fontSize={13} fontWeight={700} opacity={fi(frame,80,20)}>
            Sécantes (I commun)
          </text>;
        })()}
      </g>
      {/* Case GAUCHES */}
      <g opacity={fi(frame,200,20)}>
        <Vector3D from={[-2,1,-1]} to={[2,1,-1]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.perp} width={2.5}/>
        <Vector3D from={[0,-1,-2]} to={[0,-1,2]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.magic} width={2.5}/>
        {(() => {
          const p = proj(0,1,-1,ry,rx,cx,cy,sc);
          return <text x={p.px-80} y={p.py-30} fill={P.perp} fontSize={13} fontWeight={700} opacity={fi(frame,240,20)}>
            Gauches (∉ même plan)
          </text>;
        })()}
      </g>
      {/* Case PARALLÈLES */}
      <g opacity={fi(frame,380,20)}>
        <Vector3D from={[-2,2,1]} to={[2,2,1]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#94a3b8" width={2.5}/>
        <Vector3D from={[-2,-1,1]} to={[2,-1,1]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#94a3b8" width={2.5}/>
        {(() => {
          const p = proj(0,2,1,ry,rx,cx,cy,sc);
          return <text x={p.px+10} y={p.py-20} fill="#94a3b8" fontSize={13} fontWeight={700} opacity={fi(frame,420,20)}>
            Parallèles (même dir.)
          </text>;
        })()}
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Positions relatives de droites"
      dur={dur} accent={P.perp} music="music3.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:30,  text:"Sécantes  : 1 point commun",             color:P.blue  },
        { f:180, text:"Parallèles : même direction, 0 point",   color:"#94a3b8" },
        { f:330, text:"Gauches   : non coplanaires, 0 point",   color:P.perp  },
        { f:500, text:"Tester : résoudre le système param.",     color:P.gold  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"En 3D, deux droites peuvent être gauches — ni parallèles ni sécantes, elles ne sont dans aucun plan commun." },
        { f:240, speaker:"lea",   text:"Comment savoir si deux droites sont gauches ?" },
        { f:360, speaker:"prof",  text:"On pose les équations paramétriques égales et on résout. Si le système est incompatible, les droites sont gauches." },
        { f:520, speaker:"lucas", text:"En 2D ça n'existe pas — deux droites non parallèles se croisent forcément ?" },
        { f:630, speaker:"prof",  text:"Exactement ! Les droites gauches sont un phénomène purement 3D." },
      ]}
    />
  );
}

// ── INTERSECTIONS ─────────────────────────────────────────────────────────────
function IntersectionScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.INTERSECT.d;
  const ry = 0.55 + frame * 0.003;
  const rx = 0.2;
  const cx = 215, cy = 215, sc = 48;

  // Plane z=2, Line: (0,0,0)+t(1,0.5,2) → intersection at t=1: (1,0.5,2)
  const planeCorners = [[-2.5,2.5,-2.5],[2.5,2.5,-2.5],[2.5,2.5,2.5],[-2.5,2.5,2.5]];
  const lineStart = [0,0,0];
  const lineEnd   = [1.5,0.75,3];
  const inter     = [1,0.5,2];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 430" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,30,25)}>
        <Plane3D corners={planeCorners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf820" stroke="#38bdf866"/>
        {(() => {
          const mid=proj(0,2.5,0,ry,rx,cx,cy,sc);
          return <text x={mid.px+50} y={mid.py-10} fill="#38bdf8aa" fontSize={13} fontWeight={700}>π : y = 2.5</text>;
        })()}
      </g>
      <g opacity={fi(frame,100,25)}>
        <Vector3D from={lineStart} to={lineEnd} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.gold} label="d" width={2.5}/>
      </g>
      <g opacity={fi(frame,300,25)}>
        <Point3D pos={inter} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="I" color={P.perp} r={7}/>
        {(() => {
          const pI=proj(...inter,ry,rx,cx,cy,sc);
          return (
            <>
              <line x1={pI.px} y1={pI.py+8} x2={pI.px} y2={pI.py+50}
                stroke={P.perp} strokeWidth={1.5} strokeDasharray="4,3" opacity={fi(frame,320,20)}/>
              <text x={pI.px} y={pI.py+65} fill={P.perp} fontSize={12} textAnchor="middle" fontWeight={700} opacity={fi(frame,340,20)}>
                I = intersection
              </text>
            </>
          );
        })()}
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Intersection droite / plan"
      dur={dur} accent={P.gold} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:30,  text:"d : M = A + t·u⃗   et   π : ax+by+cz+d=0",      color:"#f0f0e8" },
        { f:200, text:"Substituer x=x_A+tu_x etc. dans l'équation π",   color:P.gold  },
        { f:380, text:"On obtient t* → I = A + t*·u⃗",                  color:P.blue  },
        { f:560, text:"Plan ∩ Plan : droite (système à 2 équations)",    color:P.magic },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Pour trouver l'intersection d'une droite et d'un plan, on injecte la forme paramétrique de la droite dans l'équation cartésienne du plan." },
        { f:260, speaker:"lea",   text:"On obtient une équation en t seulement, qu'on résout ?" },
        { f:380, speaker:"prof",  text:"Oui ! Si l'équation en t a une solution unique, la droite coupe le plan en I = A + t·u⃗." },
        { f:560, speaker:"lucas", text:"Et si t n'a pas de solution, la droite est parallèle au plan ?" },
        { f:670, speaker:"prof",  text:"Exactement. Et si l'équation est 0=0, la droite est dans le plan." },
      ]}
    />
  );
}

// ── ANGLE ENTRE DEUX PLANS ────────────────────────────────────────────────────
function AnglePlansScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.ANGLE_PP.d;
  const ry = 0.45 + frame * 0.004;
  const rx = 0.2;
  const cx = 215, cy = 220, sc = 48;

  // π₁: z=0  n₁=(0,0,1)
  // π₂: y-z=0  n₂=(0,1,-1)/√2
  // angle entre n₁ et n₂: cos=|0+0-1|/(1·√2) = 1/√2 → θ=45°
  const plane1Corners = [[-2.5,0,-2.5],[2.5,0,-2.5],[2.5,0,2.5],[-2.5,0,2.5]];
  const plane2Corners = [[-2.5,0,-2.5],[2.5,0,-2.5],[2.5,2.5,2.5],[-2.5,2.5,2.5]];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 440" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,30,25)}>
        <Plane3D corners={plane1Corners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf820" stroke="#38bdf866"/>
        {(() => {
          const m=proj(0,0,2,ry,rx,cx,cy,sc);
          return <text x={m.px+10} y={m.py} fill="#38bdf8aa" fontSize={12} fontWeight={700}>π₁</text>;
        })()}
      </g>
      <g opacity={fi(frame,80,25)}>
        <Plane3D corners={plane2Corners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#a78bfa18" stroke="#a78bfa55"/>
        {(() => {
          const m=proj(0,2,2,ry,rx,cx,cy,sc);
          return <text x={m.px+10} y={m.py} fill="#a78bfa" fontSize={12} fontWeight={700}>π₂</text>;
        })()}
      </g>
      {/* normals */}
      <g opacity={fi(frame,200,25)}>
        <Vector3D from={[0,0,0]} to={[0,2,0]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} label="n⃗₁" width={2.5}/>
      </g>
      <g opacity={fi(frame,320,25)}>
        <Vector3D from={[0,0,0]} to={[0,1.5,-1.5]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.magic} label="n⃗₂" width={2.5}/>
      </g>
      {/* angle arc */}
      {frame > 420 && (() => {
        const pO=proj(0,0,0,ry,rx,cx,cy,sc);
        return (
          <text x={pO.px+20} y={pO.py-30} fill={P.gold} fontSize={15} fontWeight={800} opacity={fi(frame,420,20)}>θ=45°</text>
        );
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Angle entre deux plans"
      dur={dur} accent={P.magic} music="music3.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:30,  text:"cos θ = |n⃗₁·n⃗₂| / (|n⃗₁| × |n⃗₂|)",          color:P.gold  },
        { f:200, text:"θ ∈ [0°; 90°]  (valeur absolue !)",             color:"#f0f0e8" },
        { f:370, text:"Ex : n⃗₁(0;0;1), n⃗₂(0;1;−1) → θ = 45°",       color:P.magic },
        { f:530, text:"Plans ⊥ ⟺ n⃗₁·n⃗₂ = 0",                        color:P.blue  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"L'angle entre deux plans — appelé angle dièdre — se calcule via leurs vecteurs normaux." },
        { f:220, speaker:"lea",   text:"On prend le produit scalaire des normales, on divise par les normes. La valeur absolue donne un angle entre 0° et 90° ?" },
        { f:380, speaker:"prof",  text:"Exactement ! Sans la valeur absolue, on pourrait obtenir un angle obtus. L'angle dièdre est toujours aigu ou droit." },
        { f:580, speaker:"lucas", text:"Si les normales sont perpendiculaires, les plans aussi ?" },
        { f:670, speaker:"prof",  text:"Oui ! Deux plans sont perpendiculaires si et seulement si leurs normales sont orthogonales." },
      ]}
    />
  );
}

// ── ANGLE DROITE-PLAN ─────────────────────────────────────────────────────────
function AngleDroiteScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.ANGLE_DP.d;
  const ry = 0.5 + frame * 0.004;
  const rx = 0.18;
  const cx = 215, cy = 215, sc = 48;

  // Plane z=0  n=(0,0,1)
  // Line direction u=(1,0,1): sin α = |u·n|/(|u||n|) = 1/(√2·1) = 1/√2 → α=45°
  const planeCorners = [[-2.5,0,-2.5],[2.5,0,-2.5],[2.5,0,2.5],[-2.5,0,2.5]];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 430" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,30,25)}>
        <Plane3D corners={planeCorners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#22c55e18" stroke="#22c55e55"/>
      </g>
      {/* Line d */}
      <g opacity={fi(frame,80,25)}>
        <Vector3D from={[-1.5,0,-1.5]} to={[1.5,0,1.5]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.gold} label="d" width={3}/>
      </g>
      {/* Projection of d onto plane */}
      <g opacity={fi(frame,220,25)}>
        <Vector3D from={[-1.5,0,-1.5]} to={[1.5,0,-1.5]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#94a3b8" label="proj" width={2} dashed/>
      </g>
      {/* Normal at origin */}
      <g opacity={fi(frame,380,25)}>
        <Vector3D from={[0,0,0]} to={[0,2,0]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} label="n⃗" width={2}/>
      </g>
      {/* angle label */}
      {frame > 280 && (() => {
        const pO=proj(0,0,0,ry,rx,cx,cy,sc);
        return (
          <text x={pO.px+30} y={pO.py-20} fill={P.gold} fontSize={15} fontWeight={800} opacity={fi(frame,300,20)}>α=45°</text>
        );
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Angle entre droite et plan"
      dur={dur} accent={P.lea} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:30,  text:"sin α = |u⃗ · n⃗| / (|u⃗| × |n⃗|)",             color:P.gold  },
        { f:200, text:"α = complément de l'angle (u⃗, n⃗)",             color:"#f0f0e8" },
        { f:370, text:"Ex : u⃗(1;0;1), n⃗(0;0;1) → sin α = 1/√2",     color:P.lea   },
        { f:530, text:"Droite ∥ plan ⟺ u⃗·n⃗ = 0  (α=0°)",            color:P.blue  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"L'angle entre une droite et un plan est l'angle entre la droite et sa projection sur le plan." },
        { f:250, speaker:"lea",   text:"C'est le complément de l'angle entre la droite et la normale ?" },
        { f:370, speaker:"prof",  text:"Exactement ! D'où le sinus au lieu du cosinus. sin α = |u⃗·n⃗|/(|u⃗||n⃗|)." },
        { f:570, speaker:"lucas", text:"Si la droite est perpendiculaire au plan, α=90° et u⃗ est colinéaire à n⃗ ?" },
        { f:660, speaker:"prof",  text:"Oui ! Et si la droite est dans le plan, α=0° et u⃗·n⃗=0." },
      ]}
    />
  );
}

// ── DEMO SCENE — PROBLÈME BAC COMPLET ─────────────────────────────────────────
// Plan π₁: 2x+y−2z−3=0, n⃗(2;1;−2), |n⃗|=3
// A(3;3;0) : ax₀+by₀+cz₀+d = 6+3+0−3=6, d=2
// H = A + t·n⃗, t=−2/3 → H=(5/3; 7/3; 4/3)
// B(3;0;3) : AB⃗=(0;−3;3), |AB|=3√2, AB⃗·n⃗=−9, sinα=1/√2 → α=45°
function DemoScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DEMO.d;
  const opacity = sceneFade(frame, dur);
  const ry = 0.48 + frame * 0.003;
  const rx = 0.25;
  const cx = 250, cy = 280, sc = 36;

  const planeCorners = [
    [2.67,2.33,2.33],[2.67,-1.67,0.33],[0.67,2.33,0.33],[0.67,6.33,2.33]
  ];
  const A = [3,3,0];
  const H = [5/3, 7/3, 4/3];
  const B = [3,0,3];

  const steps = [
    { f:0,    text:"Plan π₁: 2x+y−2z−3=0,  n⃗(2;1;−2),  |n⃗|=3" },
    { f:200,  text:"Étape 1 — Distance de A(3;3;0) à π₁" },
    { f:380,  text:"f(A) = 2(3)+3−2(0)−3 = 6  →  d = |6|/3 = 2" },
    { f:620,  text:"Étape 2 — Pied H de la perpendiculaire" },
    { f:820,  text:"t = −f(A)/|n⃗|² = −6/9 = −2/3" },
    { f:1020, text:"H = A + t·n⃗ = (3−4/3 ; 3−2/3 ; 0+4/3) = (5/3 ; 7/3 ; 4/3)" },
    { f:1260, text:"Étape 3 — Angle entre AB et π₁" },
    { f:1440, text:"AB⃗=(0;−3;3), |AB|=3√2,  AB⃗·n⃗=0−3−6=−9" },
    { f:1620, text:"sin α = |−9|/(3√2·3) = 1/√2  →  α = 45°" },
  ];

  const currentStep = [...steps].reverse().find(s=>frame>=s.f)||steps[0];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music5.mp3")} volume={0.10}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Sequence from={1620}><Audio src={staticFile("audio/sfx_ding.mp3")} volume={0.65}/></Sequence>
      <Stars count={40}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg,transparent,#fbbf24,transparent)", boxShadow:"0 0 20px #fbbf24" }}/>

      <div style={{ position:"absolute", top:22, left:50, right:50 }}>
        <div style={{ color:P.gold, fontSize:15, fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>Problème BAC · Partie 2</div>
        <div style={{ color:P.text, fontSize:44, fontWeight:900, lineHeight:1.1, marginTop:4 }}>Distance, projection, angle</div>
        <div style={{ marginTop:8, height:3, background:P.border, borderRadius:3 }}>
          <div style={{ width:`${(frame/dur)*100}%`, height:"100%", background:P.gold, borderRadius:3 }}/>
        </div>
      </div>

      <div style={{ position:"absolute", top:148, left:50, right:50, bottom:30, display:"flex", gap:28 }}>
        {/* 3D viz */}
        <div style={{ flex:"0 0 50%", background:P.surface, borderRadius:16, border:`1px solid ${P.border}`, position:"relative", overflow:"hidden" }}>
          <svg width="100%" height="100%" viewBox="0 0 500 480" style={{ position:"absolute" }}>
            <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
            <g opacity={fi(frame,40,30)}>
              <Plane3D corners={planeCorners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf818" stroke="#38bdf866"/>
              {(() => {
                const m=proj(1.67,4.33,1.33,ry,rx,cx,cy,sc);
                return <text x={m.px} y={m.py} fill="#38bdf8aa" fontSize={12} fontWeight={700}>π₁</text>;
              })()}
            </g>
            <g opacity={fi(frame,120,25)}>
              <Point3D pos={A} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A(3;3;0)" color={P.gold}/>
            </g>
            <g opacity={fi(frame,560,25)}>
              <Point3D pos={H} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="H" color={P.foot}/>
              {(() => {
                const pA=proj(...A,ry,rx,cx,cy,sc), pH=proj(...H,ry,rx,cx,cy,sc);
                return (
                  <>
                    <line x1={pA.px} y1={pA.py} x2={pH.px} y2={pH.py} stroke={P.perp} strokeWidth={2} strokeDasharray="6,4"/>
                    <text x={(pA.px+pH.px)/2+10} y={(pA.py+pH.py)/2} fill={P.perp} fontSize={13} fontWeight={700}>d=2</text>
                  </>
                );
              })()}
            </g>
            <g opacity={fi(frame,1300,25)}>
              <Point3D pos={B} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="B(3;0;3)" color={P.magic}/>
              <Vector3D from={A} to={B} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.magic} label="AB⃗" width={2}/>
            </g>
          </svg>
        </div>

        {/* Steps + classroom */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#1a1b2e", border:`2px solid ${P.gold}`, borderRadius:14, padding:"16px 20px" }}>
            <div style={{ color:P.gold, fontSize:12, fontWeight:800, letterSpacing:2, marginBottom:8 }}>ÉTAPE EN COURS</div>
            <div style={{ color:P.text, fontFamily:MONO, fontSize:13, lineHeight:1.6 }}
              dangerouslySetInnerHTML={{__html:mathHTML(currentStep.text)}}/>
          </div>
          <div style={{ flex:1, background:P.card, borderRadius:14, border:`1px solid ${P.border}`, padding:"12px 16px", overflow:"hidden" }}>
            {steps.map((s,i)=>(
              <div key={i} style={{
                opacity:frame>=s.f?(s===currentStep?1:0.35):0.08,
                color:s===currentStep?P.gold:P.text,
                fontFamily:MONO, fontSize:11, lineHeight:1.55, marginBottom:3,
                fontWeight:s===currentStep?700:400,
              }} dangerouslySetInnerHTML={{__html:`${i+1}. ${mathHTML(s.text)}`}}/>
            ))}
          </div>
          <ClassroomPanel frame={frame} dialogues={[
            { f:40,   speaker:"prof",  text:"Plan π₁: 2x+y−2z−3=0. On commence par calculer la distance de A(3;3;0) à ce plan." },
            { f:360,  speaker:"lea",   text:"f(A) = 2×3+3−2×0−3 = 6, donc d = 6/3 = 2 ?" },
            { f:480,  speaker:"prof",  text:"Exactement ! Maintenant on cherche H, le pied de la perpendiculaire." },
            { f:800,  speaker:"lucas", text:"t = −6/9 = −2/3, donc H = (3−4/3; 3−2/3; 4/3) = (5/3; 7/3; 4/3) ?" },
            { f:980,  speaker:"prof",  text:"Parfait ! Vérification : 2(5/3)+(7/3)−2(4/3)−3 = 10/3+7/3−8/3−9/3 = 0 ✓" },
            { f:1300, speaker:"lea",   text:"Pour l'angle : AB⃗·n⃗ = 0−3−6 = −9, sin α = 9/(3√2×3) = 1/√2, α=45° !" },
            { f:1550, speaker:"prof",  text:"Bravo ! Distance = 2, H(5/3; 7/3; 4/3), angle = 45°. Résultats nets pour le bac." },
          ]}/>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── COPLANARITÉ ───────────────────────────────────────────────────────────────
function CoplanariteScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.COPLAN.d;
  const ry = 0.5 + frame * 0.005;
  const rx = 0.25;
  const cx = 215, cy = 200, sc = 50;

  // A,B,C coplanar (z=0), D coplanar too
  // A(0,0,0), B(2,0,0), C(0,2,0), D(1,1,0) → coplanar z=0
  // vs D(1,1,1) → not coplanar
  const showNotCoplanar = frame > 350;
  const D = showNotCoplanar ? [1,1,1.5] : [1,1,0];
  const Dcol = showNotCoplanar ? P.perp : P.lea;

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 400" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,30,25)}>
        <Plane3D corners={[[-2,0,-2],[2.5,0,-2],[2.5,0,2.5],[-2,0,2.5]]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#22c55e15" stroke="#22c55e44"/>
      </g>
      <g opacity={fi(frame,60,20)}>
        {[[0,0,0,"A",P.gold],[2,0,0,"B",P.blue],[0,2,0,"C",P.magic]].map(([x,y,z,lbl,col])=>(
          <Point3D key={lbl} pos={[x,y,z]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label={lbl} color={col} r={6}/>
        ))}
      </g>
      <g opacity={fi(frame,180,20)}>
        <Point3D pos={D} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label={showNotCoplanar?"D (∉ plan)":"D (∈ plan)"} color={Dcol} r={7}/>
      </g>
      {frame > 350 && (() => {
        const pD=proj(...D,ry,rx,cx,cy,sc), pO=proj(1,0,1,ry,rx,cx,cy,sc);
        return (
          <line x1={pD.px} y1={pD.py} x2={pO.px} y2={pO.py}
            stroke={P.perp} strokeWidth={1.5} strokeDasharray="5,4" opacity={fi(frame,370,20)}/>
        );
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Coplanarité de 4 points"
      dur={dur} accent={P.lea} music="music3.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:30,  text:"A, B, C, D coplanaires ⟺ D ∈ plan(ABC)",         color:"#f0f0e8" },
        { f:200, text:"Méthode : équation cartésienne du plan ABC",       color:P.gold  },
        { f:380, text:"Puis vérifier si f(D) = 0",                       color:P.lea   },
        { f:530, text:"Ou : AD⃗ = α·AB⃗ + β·AC⃗  (combo linéaire)",      color:P.magic },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Quatre points sont coplanaires si l'un des quatre appartient au plan défini par les trois autres." },
        { f:240, speaker:"lea",   text:"On trouve l'équation du plan ABC et on vérifie que D la vérifie ?" },
        { f:360, speaker:"prof",  text:"Exactement ! Ou alors on cherche α et β tels que AD⃗ = α·AB⃗ + β·AC⃗." },
        { f:540, speaker:"lucas", text:"Si le système en α,β n'a pas de solution, D n'est pas dans le plan ?" },
        { f:640, speaker:"prof",  text:"Précisément. Un tétraèdre a justement 4 sommets non coplanaires." },
      ]}
    />
  );
}

// ── SPHÈRE TANGENTE ───────────────────────────────────────────────────────────
function SphereTangenteScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.SPHERE_TAN.d;
  const ry = 0.5 + frame * 0.003;
  const rx = 0.2;
  const cx = 215, cy = 220, sc = 46;

  // Sphere center Ω(2,2,2) radius r=2, plane z=0
  // d(Ω, plan) = |2|/1 = 2 = r → tangent at T(2,2,0)
  const planeCorners = [[-1,0,-1],[4.5,0,-1],[4.5,0,5],[-1,0,5]];
  const OmegaPos = [2,2,2];
  const T = [2,0,2];

  const pulse = 1 + Math.sin(frame/25)*0.03;

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 440" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,30,25)}>
        <Plane3D corners={planeCorners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf818" stroke="#38bdf866"/>
      </g>
      {/* Sphere — approximate circle */}
      {(() => {
        const pO=proj(...OmegaPos,ry,rx,cx,cy,sc);
        const pr=proj(OmegaPos[0],OmegaPos[1]+2,OmegaPos[2],ry,rx,cx,cy,sc);
        const r3d = Math.hypot(pr.px-pO.px, pr.py-pO.py);
        return (
          <g opacity={fi(frame,80,30)}>
            <circle cx={pO.px} cy={pO.py} r={r3d*pulse} fill="#a78bfa10" stroke="#a78bfa66" strokeWidth={2}/>
            <circle cx={pO.px} cy={pO.py} r={r3d*0.7} fill="none" stroke="#a78bfa33" strokeWidth={1} strokeDasharray="4,3"/>
          </g>
        );
      })()}
      <g opacity={fi(frame,80,25)}>
        <Point3D pos={OmegaPos} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="Ω(2;2;2)" color={P.magic}/>
      </g>
      {/* Tangency point */}
      <g opacity={fi(frame,250,25)}>
        <Point3D pos={T} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="T" color={P.gold} r={7}/>
        {(() => {
          const pOm=proj(...OmegaPos,ry,rx,cx,cy,sc), pT=proj(...T,ry,rx,cx,cy,sc);
          return (
            <>
              <line x1={pOm.px} y1={pOm.py} x2={pT.px} y2={pT.py} stroke={P.perp} strokeWidth={2} strokeDasharray="5,4"/>
              <text x={(pOm.px+pT.px)/2+10} y={(pOm.py+pT.py)/2} fill={P.perp} fontSize={13} fontWeight={700}>r=2</text>
            </>
          );
        })()}
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Sphère tangente à un plan"
      dur={dur} accent={P.magic} music="music1.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:30,  text:"Sphère S(Ω, r) : (x−a)²+(y−b)²+(z−c)² = r²",   color:"#f0f0e8" },
        { f:200, text:"Tangente au plan π ⟺ d(Ω, π) = r",               color:P.gold  },
        { f:400, text:"Ex : Ω(2;2;2), π: z=0  →  d(Ω,π)=2=r ✓",       color:P.magic },
        { f:580, text:"Point de tangence T : projection de Ω sur π",     color:P.foot  },
        { f:740, text:"T(2;2;0) : Ω + (−r)·n⃗/|n⃗| = (2;2;2−2)",       color:P.blue  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Une sphère est tangente à un plan si elle ne le coupe pas mais lui est tangente — comme une balle posée sur le sol." },
        { f:280, speaker:"lea",   text:"La condition c'est que la distance du centre Ω au plan soit exactement égale au rayon ?" },
        { f:420, speaker:"prof",  text:"Exactement ! d(Ω, π) = r. Ici d=2=r, donc la sphère est tangente en T(2;2;0)." },
        { f:680, speaker:"lucas", text:"Si d < r, la sphère coupe le plan en un cercle ?" },
        { f:800, speaker:"prof",  text:"Oui ! Et si d > r, la sphère et le plan ne se rencontrent pas. Trois cas possibles." },
      ]}
    />
  );
}

// ── BILAN FORMULES ────────────────────────────────────────────────────────────
function BilanScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.BILAN.d;
  const opacity = sceneFade(frame, dur);

  const formules = [
    { cat:"Distance", color:P.blue,  items:[
      { key:"Point → Plan",  val:"d = |ax₀+by₀+cz₀+d| / √(a²+b²+c²)" },
      { key:"Pied H",        val:"t = −f(A)/|n⃗|²,  H = A+t·n⃗" },
    ]},
    { cat:"Angles", color:P.gold, items:[
      { key:"Plan ∩ Plan",   val:"cos θ = |n⃗₁·n⃗₂| / (|n⃗₁|·|n⃗₂|)" },
      { key:"Droite ∩ Plan", val:"sin α = |u⃗·n⃗| / (|u⃗|·|n⃗|)" },
    ]},
    { cat:"Intersections", color:P.lea, items:[
      { key:"Droite ∩ Plan", val:"Injecter param. dans éq. plan → t*" },
      { key:"Plan ∩ Plan",   val:"Droite : résoudre système 2 éq." },
    ]},
    { cat:"Positions", color:P.magic, items:[
      { key:"Droites gauches", val:"Système incompatible (non coplanaires)" },
      { key:"4 pts coplan.",   val:"D ∈ plan(ABC) ⟺ f(D)=0" },
    ]},
    { cat:"Sphère", color:P.perp, items:[
      { key:"Équation",   val:"(x−a)²+(y−b)²+(z−c)² = r²" },
      { key:"Tangente π", val:"d(Ω, π) = r" },
    ]},
    { cat:"Vecteur normal", color:"#94a3b8", items:[
      { key:"Plan ax+by+cz+d=0", val:"n⃗(a;b;c)" },
      { key:"Produit vectoriel",  val:"u⃗×v⃗ ⊥ plan(u⃗,v⃗)" },
    ]},
  ];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music6.mp3")} volume={0.12}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Stars count={60} seed={5}/>

      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg,transparent,#fbbf24,transparent)", boxShadow:"0 0 20px #fbbf24" }}/>

      <div style={{ position:"absolute", top:22, left:50, right:50 }}>
        <div style={{ color:P.gold, fontSize:15, fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>Mémo · Terminale</div>
        <div style={{ color:P.text, fontSize:44, fontWeight:900, lineHeight:1.1, marginTop:4 }}>Toutes les formules clés</div>
        <div style={{ marginTop:8, height:3, background:P.border, borderRadius:3 }}>
          <div style={{ width:`${(frame/dur)*100}%`, height:"100%", background:P.gold, borderRadius:3 }}/>
        </div>
      </div>

      <div style={{ position:"absolute", top:148, left:50, right:50, bottom:30, display:"flex", flexWrap:"wrap", gap:16, alignContent:"flex-start" }}>
        {formules.map(({ cat, color, items }, ci) => {
          const sc2 = spring({ frame:frame-(40+ci*50), fps, config:{ damping:12, stiffness:55 } });
          return (
            <div key={cat} style={{
              opacity:sc2, transform:`translateY(${(1-sc2)*20}px)`,
              background:P.card, border:`1px solid ${P.border}`,
              borderLeft:`4px solid ${color}`,
              borderRadius:12, padding:"14px 18px", flex:"0 0 calc(33% - 11px)",
            }}>
              <div style={{ color, fontSize:12, fontWeight:800, letterSpacing:2, marginBottom:8 }}>{cat.toUpperCase()}</div>
              {items.map(({ key, val }) => (
                <div key={key} style={{ marginBottom:8 }}>
                  <div style={{ color:P.dim, fontSize:12, marginBottom:2 }}>{key}</div>
                  <div style={{ color:P.text, fontFamily:MONO, fontSize:13, lineHeight:1.5 }}
                    dangerouslySetInnerHTML={{__html:mathHTML(val)}}/>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ── OUTRO ─────────────────────────────────────────────────────────────────────
function OutroScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.OUTRO.d;
  const opacity = sceneFade(frame, dur);

  const items = [
    { icon:"📏", label:"Distance point-plan",  desc:"d = |f(A)| / √(a²+b²+c²)" },
    { icon:"🎯", label:"Projection H",          desc:"H = A + t·n⃗, t = −f(A)/|n⃗|²" },
    { icon:"🔀", label:"Droites gauches",       desc:"Non coplanaires, système incompatible" },
    { icon:"📐", label:"Angle plan-plan",       desc:"cos θ = |n⃗₁·n⃗₂| / (|n⃗₁||n⃗₂|)" },
    { icon:"✂️", label:"Angle droite-plan",     desc:"sin α = |u⃗·n⃗| / (|u⃗||n⃗|)" },
    { icon:"🔵", label:"Sphère tangente",       desc:"d(Ω, π) = r" },
  ];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music6.mp3")} volume={0.13}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Sequence from={220}><Audio src={staticFile("audio/sfx_applause.mp3")} volume={0.45}/></Sequence>
      <Stars count={100} seed={4}/>

      <AbsoluteFill style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ opacity:fi(frame,10,22), color:P.gold, fontSize:20, fontWeight:800, textTransform:"uppercase", letterSpacing:4, marginBottom:16 }}>
          Récapitulatif — Partie 2
        </div>
        <div style={{ fontSize:64, fontWeight:950, color:P.text, textShadow:"0 0 40px #a78bfa44", marginBottom:6 }}>
          Prêt pour le bac !
        </div>
        <div style={{ opacity:fi(frame,30,22), fontSize:28, color:P.magic, fontWeight:700, marginBottom:44 }}>
          Géométrie dans l'espace — Terminale complète
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:18, maxWidth:1200, justifyContent:"center" }}>
          {items.map(({ icon, label, desc }, i) => {
            const sc2 = spring({ frame:frame-(60+i*50), fps, config:{ damping:12, stiffness:60 } });
            return (
              <div key={label} style={{
                opacity:sc2, transform:`scale(${0.6+sc2*0.4}) translateY(${(1-sc2)*30}px)`,
                background:P.card, border:`1px solid ${P.border}`,
                borderRadius:16, padding:"18px 22px", width:310,
                display:"flex", gap:14, alignItems:"flex-start",
              }}>
                <div style={{ fontSize:32, lineHeight:1, flexShrink:0 }}>{icon}</div>
                <div>
                  <div style={{ color:P.text, fontSize:18, fontWeight:800 }}>{label}</div>
                  <div style={{ color:P.dim, fontSize:14, marginTop:4, fontFamily:MONO }}
                    dangerouslySetInnerHTML={{__html:mathHTML(desc)}}/>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ opacity:fi(frame,dur-200,30), marginTop:44, textAlign:"center" }}>
          <div style={{ background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", borderRadius:16,
            padding:"18px 48px", color:"#fff", fontSize:26, fontWeight:900, boxShadow:"0 0 40px #7c3aed66" }}>
            🏆 Bonne chance à l'examen !
          </div>
          <div style={{ color:P.dim, fontSize:17, marginTop:14 }}>
            Parties 1 et 2 : tous les outils pour les exercices de géométrie dans l'espace
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function GeoEspaceTerminal2() {
  return (
    <AbsoluteFill style={{ background:P.bg }}>
      <Sequence from={SC.INTRO.s}      durationInFrames={SC.INTRO.d}>
        <IntroScene narrationFile="geo2_narration1.mp3"/>
      </Sequence>
      <Sequence from={SC.DIST_PLAN.s}  durationInFrames={SC.DIST_PLAN.d}>
        <DistancePlanScene narrationFile="geo2_narration2.mp3"/>
      </Sequence>
      <Sequence from={SC.PROJECTION.s} durationInFrames={SC.PROJECTION.d}>
        <ProjectionScene narrationFile="geo2_narration3.mp3"/>
      </Sequence>
      <Sequence from={SC.POSITIONS.s}  durationInFrames={SC.POSITIONS.d}>
        <PositionsRelativesScene narrationFile="geo2_narration4.mp3"/>
      </Sequence>
      <Sequence from={SC.INTERSECT.s}  durationInFrames={SC.INTERSECT.d}>
        <IntersectionScene narrationFile="geo2_narration5.mp3"/>
      </Sequence>
      <Sequence from={SC.ANGLE_PP.s}   durationInFrames={SC.ANGLE_PP.d}>
        <AnglePlansScene narrationFile="geo2_narration6.mp3"/>
      </Sequence>
      <Sequence from={SC.ANGLE_DP.s}   durationInFrames={SC.ANGLE_DP.d}>
        <AngleDroiteScene narrationFile="geo2_narration7.mp3"/>
      </Sequence>
      <Sequence from={SC.DEMO.s}       durationInFrames={SC.DEMO.d}>
        <DemoScene narrationFile="geo2_narration8.mp3"/>
      </Sequence>
      <Sequence from={SC.COPLAN.s}     durationInFrames={SC.COPLAN.d}>
        <CoplanariteScene narrationFile="geo2_narration9.mp3"/>
      </Sequence>
      <Sequence from={SC.SPHERE_TAN.s} durationInFrames={SC.SPHERE_TAN.d}>
        <SphereTangenteScene narrationFile="geo2_narration10.mp3"/>
      </Sequence>
      <Sequence from={SC.BILAN.s}      durationInFrames={SC.BILAN.d}>
        <BilanScene narrationFile="geo2_narration11.mp3"/>
      </Sequence>
      <Sequence from={SC.OUTRO.s}      durationInFrames={SC.OUTRO.d}>
        <OutroScene narrationFile="geo2_narration12.mp3"/>
      </Sequence>
    </AbsoluteFill>
  );
}
