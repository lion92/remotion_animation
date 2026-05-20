import {
  AbsoluteFill, Audio, Sequence, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from "remotion";

export const GEO_ESPACE3_DURATION = 21600;

const P = {
  bg:"#07080f", surface:"#0e1120", card:"#141824",
  board:"#0a2e1c", boardBorder:"#1a5c40",
  border:"#2a2f45", text:"#e2e8f0", dim:"#4a5568",
  gold:"#fbbf24", blue:"#38bdf8", magic:"#a78bfa",
  ax:"#ef4444", ay:"#22c55e", az:"#3b82f6",
  vec:"#fbbf24", plane:"#38bdf8", point:"#f9fafb",
  prof:"#3b82f6", lea:"#4ade80", lucas:"#f97316",
  perp:"#f43f5e", foot:"#06b6d4", section:"#fb923c",
};
const SANS = "'Inter','Segoe UI',Arial,sans-serif";
const MONO = "'JetBrains Mono','Consolas','Courier New',monospace";
const clamp = { extrapolateLeft:"clamp", extrapolateRight:"clamp" };
const fi = (f, s = 0, d = 20) => interpolate(f, [s, s + d], [0, 1], clamp);
const fo = (f, s, d = 20)     => interpolate(f, [s, s + d], [1, 0], clamp);
const sceneFade = (f, dur)    => Math.min(fi(f, 0, 18), fo(f, dur - 18, 18));

const SC = {
  INTRO:       { s: 0,     d: 960  },
  SYMET_PT:    { s: 960,   d: 1440 },
  SYMET_PLAN:  { s: 2400,  d: 1440 },
  DIST_DROITE: { s: 3840,  d: 1440 },
  PLAN_3PTS:   { s: 5280,  d: 1440 },
  SECTIONS:    { s: 6720,  d: 1440 },
  DEMO1:       { s: 8160,  d: 2400 },
  TETRA_REG:   { s: 10560, d: 1440 },
  OPTIMIS:     { s: 12000, d: 1200 },
  BARYCENTRE:  { s: 13200, d: 1440 },
  PLAN_MED:    { s: 14640, d: 1200 },
  LIEUX_GEO:   { s: 15840, d: 1200 },
  DEMO2:       { s: 17040, d: 2400 },
  METHODES:    { s: 19440, d: 1200 },
  OUTRO:       { s: 20640, d: 960  },
};

function mathHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/([A-Za-zΩ])⃗/g, '$1<sup style="font-size:0.68em;vertical-align:super;font-style:normal;font-family:Arial,sans-serif">&#8594;</sup>')
    .replace(/ℝ/g, '<span style="font-family:Georgia,serif;font-weight:700">&#8477;</span>')
    .replace(/⟺/g, '<span style="letter-spacing:-1px"> &#10234; </span>');
}

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
        <div style={{ color:P.dim, fontSize:12, fontWeight:700, letterSpacing:2, marginBottom:12 }}>TERMINALE — PARTIE 3</div>
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
        <div style={{ color:accent, fontSize:15, fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>Géométrie dans l'espace · Terminale · Partie 3</div>
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
    { icon:"🔁", label:"Symétrie par rapport à un point",  delay:160 },
    { icon:"🪞", label:"Symétrie par rapport à un plan",   delay:210 },
    { icon:"📐", label:"Distance d'un point à une droite", delay:260 },
    { icon:"🔺", label:"Plan par 3 points",                delay:310 },
    { icon:"✂️", label:"Sections planes d'un solide",      delay:360 },
    { icon:"🎲", label:"Démonstration cube BAC",           delay:410 },
    { icon:"💎", label:"Tétraèdre régulier",               delay:460 },
    { icon:"🎯", label:"Optimisation sur une droite",      delay:510 },
    { icon:"⚖️", label:"Barycentre en 3D",                delay:560 },
    { icon:"🔷", label:"Plan médiateur",                   delay:610 },
    { icon:"🌐", label:"Lieux géométriques",               delay:660 },
    { icon:"🏆", label:"Démonstration tétraèdre BAC",      delay:710 },
    { icon:"📋", label:"Méthodes types BAC",               delay:760 },
  ];

  // Cube for intro SVG
  const cubeVerts = [
    [0,0,0],[2,0,0],[2,2,0],[0,2,0],
    [0,0,2],[2,0,2],[2,2,2],[0,2,2],
  ];
  const cubeEdges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7],
  ];
  const cx2=200, cy2=220, sc2=38;

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music4.mp3")} volume={0.12}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Sequence from={20}><Audio src={staticFile("audio/sfx_whoosh3d.mp3")} volume={0.5}/></Sequence>
      <Stars count={80} seed={9}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg,transparent,#a78bfa,transparent)", boxShadow:"0 0 20px #a78bfa" }}/>

      <div style={{ position:"absolute", left:60, top:55, right:"46%", overflowY:"hidden" }}>
        <div style={{ opacity:fi(frame,5,20), color:P.magic, fontSize:14, fontWeight:800, letterSpacing:4, textTransform:"uppercase", marginBottom:6 }}>
          Géométrie dans l'espace
        </div>
        <div style={{ transform:`scale(${0.7+titleSc*0.3}) translateY(${(1-titleSc)*30}px)`, color:P.text, fontSize:52, fontWeight:950, lineHeight:1.05, marginBottom:6 }}>
          Partie 3
        </div>
        <div style={{ opacity:fi(frame,30,22), fontSize:22, color:P.magic, fontWeight:700, marginBottom:4 }}>
          Terminale Avancé
        </div>
        <div style={{ opacity:fi(frame,50,22), fontSize:16, color:P.dim, marginBottom:20 }}>
          Symétries · Plans · Sections · Tétraèdres · BAC
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {topics.map(({ icon, label, delay }, i) => (
            <div key={i} style={{
              opacity:fi(frame,delay,18),
              transform:`translateX(${interpolate(frame,[delay,delay+18],[-20,0],clamp)}px)`,
              display:"flex", gap:10, alignItems:"center",
              background:P.card, borderRadius:9, padding:"8px 14px", border:`1px solid ${P.border}`,
            }}>
              <span style={{ fontSize:18 }}>{icon}</span>
              <span style={{ color:P.text, fontSize:14, fontWeight:600 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:"absolute", right:40, top:70, width:"40%", height:"80%" }}>
        <svg width="100%" height="100%" viewBox="0 0 400 450">
          <Axes3D ry={ry} rx={rx} cx={cx2} cy={cy2} sc={sc2} len={2.5}/>
          <g opacity={fi(frame,60,30)}>
            {cubeEdges.map(([a,b],i)=>{
              const va=cubeVerts[a], vb=cubeVerts[b];
              const pa=proj(va[0]+0.1,va[1]+0.1,va[2],ry,rx,cx2,cy2,sc2);
              const pb=proj(vb[0]+0.1,vb[1]+0.1,vb[2],ry,rx,cx2,cy2,sc2);
              return <line key={i} x1={pa.px} y1={pa.py} x2={pb.px} y2={pb.py} stroke="#38bdf877" strokeWidth={1.5}/>;
            })}
          </g>
          <g opacity={fi(frame,200,25)}>
            {(() => {
              const midPts = [
                [2,1,0],[2,2,1],[1,2,2],[0,2,1],[0,1,0],[1,0,0],
              ];
              return midPts.map((mp,i)=>{
                const p=proj(mp[0],mp[1],mp[2],ry,rx,cx2,cy2,sc2);
                return <circle key={i} cx={p.px} cy={p.py} r={5} fill={P.section} opacity={fi(frame,280+i*40,20)}/>;
              });
            })()}
          </g>
          <g opacity={fi(frame,500,30)}>
            {(() => {
              const hexPts = [
                [2,1,0],[2,2,1],[1,2,2],[0,2,1],[0,1,0],[1,0,0],
              ];
              const projected = hexPts.map(mp=>proj(mp[0],mp[1],mp[2],ry,rx,cx2,cy2,sc2));
              return <polygon points={projected.map(p=>`${p.px},${p.py}`).join(" ")} fill="#fb923c22" stroke={P.section} strokeWidth={2}/>;
            })()}
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
}

// ── SYMET PT ─────────────────────────────────────────────────────────────────
function SymetPtScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.SYMET_PT.d;
  const ry = 0.4 + frame * 0.003;
  const rx = 0.22;
  const cx = 215, cy = 205, sc = 48;

  const A = [2,2,1];
  const O = [1,0.5,0.5];
  // A' = 2O - A = (2-2, 1-2, 1-1) = (0,-1,0)
  const Ap = [0,-1,0];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 410" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,40,25)}>
        <Point3D pos={A} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A(2;2;1)" color={P.gold}/>
      </g>
      <g opacity={fi(frame,80,25)}>
        <Point3D pos={O} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="O(1;0.5;0.5)" color={P.blue}/>
      </g>
      <g opacity={fi(frame,150,25)}>
        <Point3D pos={Ap} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A'(0;-1;0)" color={P.magic}/>
      </g>
      {frame > 100 && (() => {
        const pA=proj(...A,ry,rx,cx,cy,sc);
        const pO=proj(...O,ry,rx,cx,cy,sc);
        const pAp=proj(...Ap,ry,rx,cx,cy,sc);
        return (
          <g opacity={fi(frame,120,25)}>
            <line x1={pA.px} y1={pA.py} x2={pAp.px} y2={pAp.py}
              stroke={P.perp} strokeWidth={1.5} strokeDasharray="6,4"/>
            <circle cx={pO.px} cy={pO.py} r={8} fill="none" stroke={P.blue} strokeWidth={2} opacity={fi(frame,180,20)}/>
            <text x={pO.px+14} y={pO.py-16} fill={P.blue} fontSize={12} fontWeight={700} opacity={fi(frame,200,20)}>milieu</text>
          </g>
        );
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Symétrique par rapport à un point"
      dur={dur} accent={P.magic} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:80,  text:"A' = 2·O − A",                                        color:P.gold  },
        { f:140, text:"x' = 2x₀−xA,  y' = 2y₀−yA,  z' = 2z₀−zA",          color:"#f0f0e8" },
        { f:240, text:"O = milieu de [AA']",                                  color:P.blue  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Pour trouver le symétrique de A par rapport à O, O doit être le milieu de [AA']. Donc A' = 2·O − A. On soustrait et on multiplie, c'est tout." },
        { f:260, speaker:"lea",   text:"Donc si A(3; 1; 4) et O(2; 3; 1), on a A'(1; 5; −2) ?" },
        { f:400, speaker:"prof",  text:"Exactement ! Vérification : milieu de AA' = ((3+1)/2, (1+5)/2, (4−2)/2) = (2,3,1) = O ✓" },
        { f:640, speaker:"lucas", text:"Et si O est l'origine, A' = −A ?" },
        { f:760, speaker:"prof",  text:"Oui ! La symétrie centrale par rapport à l'origine inverse toutes les coordonnées." },
      ]}
    />
  );
}

// ── SYMET PLAN ────────────────────────────────────────────────────────────────
function SymetPlanScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.SYMET_PLAN.d;
  const ry = 0.45 + frame * 0.003;
  const rx = 0.20;
  const cx = 215, cy = 210, sc = 46;

  // Plan z=1, n=(0,0,1)
  // A=(1,2,2.5), H=(1,2,1), A'=(1,2,-0.5)
  const A  = [1,2,2.5];
  const H  = [1,2,1];
  const Ap = [1,2,-0.5];
  const planeCorners = [[-1.5,0.5,1],[3.5,0.5,1],[3.5,3.5,1],[-1.5,3.5,1]];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 420" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,40,25)}>
        <Plane3D corners={planeCorners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf820" stroke="#38bdf877"/>
        {(() => {
          const m=proj(1,3,1,ry,rx,cx,cy,sc);
          return <text x={m.px+10} y={m.py} fill="#38bdf8aa" fontSize={12} fontWeight={700}>π : z=1</text>;
        })()}
      </g>
      <g opacity={fi(frame,80,25)}>
        <Point3D pos={A} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A(1;2;2.5)" color={P.gold}/>
      </g>
      <g opacity={fi(frame,180,25)}>
        <Point3D pos={H} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="H(1;2;1)" color={P.foot}/>
      </g>
      <g opacity={fi(frame,280,25)}>
        <Point3D pos={Ap} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A'(1;2;-0.5)" color={P.magic}/>
      </g>
      {frame > 140 && (() => {
        const pA=proj(...A,ry,rx,cx,cy,sc);
        const pH=proj(...H,ry,rx,cx,cy,sc);
        const pAp=proj(...Ap,ry,rx,cx,cy,sc);
        return (
          <g>
            <line x1={pA.px} y1={pA.py} x2={pAp.px} y2={pAp.py}
              stroke={P.perp} strokeWidth={1.5} strokeDasharray="6,4" opacity={fi(frame,150,20)}/>
            <rect x={pH.px-6} y={pH.py-6} width={10} height={10}
              fill="none" stroke={P.foot} strokeWidth={1.5} opacity={fi(frame,220,20)}/>
          </g>
        );
      })()}
      <g opacity={fi(frame,200,25)}>
        <Vector3D from={H} to={[1,2,2]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} label="n⃗" width={2}/>
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Symétrique par rapport à un plan"
      dur={dur} accent={P.blue} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:60,  text:"π : ax + by + cz + d = 0,  n⃗(a; b; c) normal",      color:"#f0f0e8" },
        { f:120, text:"t₀ = −(axA + byA + czA + d) / (a²+b²+c²)",           color:P.gold  },
        { f:200, text:"H = A + t₀·n⃗   (pied ⊥)",                           color:P.foot  },
        { f:280, text:"A' = A + 2t₀·n⃗  (symétrique)",                       color:P.magic },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Le symétrique de A par rapport au plan π : on descend perpendiculairement sur π pour atteindre H, puis on continue d'autant de l'autre côté." },
        { f:280, speaker:"lea",   text:"t₀ c'est le paramètre qui donne H sur la droite A + t·n⃗ ?" },
        { f:400, speaker:"prof",  text:"Exactement. On injecte la droite dans l'équation du plan, on résout en t, on obtient t₀ pour H. A' = A + 2t₀·n⃗." },
        { f:700, speaker:"lucas", text:"Pourquoi 2t₀ et pas t₀ ?" },
        { f:820, speaker:"prof",  text:"Parce que H est le milieu de [AA']. H = A + t₀·n⃗. Donc A' = 2H − A = A + 2t₀·n⃗." },
      ]}
    />
  );
}

// ── DIST DROITE ───────────────────────────────────────────────────────────────
function DistDroiteScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DIST_DROITE.d;
  const ry = 0.5 + frame * 0.003;
  const rx = 0.22;
  const cx = 215, cy = 210, sc = 46;

  // Droite (D): A=(0,0,0), u=(1,1,0)/√2
  // Point P=(1,3,2)
  // t* = AP·u/|u|² = (1+3)/2 = 2
  // P* = (2,2,0)
  // d = |PP*| = sqrt(1+1+4) = sqrt(6)
  const lineA = [-2,-2,0];
  const lineB = [3,3,0];
  const P3 = [1,3,2];
  const Pstar = [1,1,0];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 420" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,30,25)}>
        <Vector3D from={lineA} to={lineB} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} label="(D)" width={2.5}/>
      </g>
      <g opacity={fi(frame,80,25)}>
        <Point3D pos={P3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="P(1;3;2)" color={P.gold}/>
      </g>
      <g opacity={fi(frame,200,25)}>
        <Point3D pos={Pstar} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="P*(1;1;0)" color={P.foot}/>
      </g>
      {frame > 180 && (() => {
        const pP=proj(...P3,ry,rx,cx,cy,sc);
        const pPs=proj(...Pstar,ry,rx,cx,cy,sc);
        return (
          <g opacity={fi(frame,200,20)}>
            <line x1={pP.px} y1={pP.py} x2={pPs.px} y2={pPs.py}
              stroke={P.perp} strokeWidth={2.5} strokeDasharray="6,4"/>
            <text x={(pP.px+pPs.px)/2+14} y={(pP.py+pPs.py)/2} fill={P.perp} fontSize={14} fontWeight={800}>d</text>
            <rect x={pPs.px-6} y={pPs.py-6} width={10} height={10}
              fill="none" stroke={P.foot} strokeWidth={1.5} opacity={fi(frame,240,20)}/>
          </g>
        );
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Distance d'un point à une droite"
      dur={dur} accent={P.perp} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:60,  text:"(D) : M = A + t·u⃗",                                    color:"#f0f0e8" },
        { f:120, text:"d(P, D) = ‖AP⃗ ∧ u⃗‖ / ‖u⃗‖",                          color:P.gold  },
        { f:220, text:"Ou : d² = ‖AP⃗‖² − (AP⃗·u⃗)²/‖u⃗‖²",                   color:P.blue  },
        { f:340, text:"Pied : P* = A + t*·u⃗  avec  t* = AP⃗·u⃗/‖u⃗‖²",        color:P.foot  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"La distance d'un point P à une droite (D) se calcule via le pied de perpendiculaire P*. On projette P sur (D)." },
        { f:260, speaker:"lea",   text:"La formule avec le produit vectoriel est plus directe : ‖AP⃗ ∧ u⃗‖ / ‖u⃗‖ ?" },
        { f:400, speaker:"prof",  text:"Oui ! Le produit vectoriel donne directement la distance sans chercher t*. Les deux formules sont équivalentes." },
        { f:680, speaker:"lucas", text:"Et si P est sur (D), la distance est 0 ?" },
        { f:800, speaker:"prof",  text:"Oui. AP⃗ est colinéaire à u⃗ dans ce cas, donc AP⃗ ∧ u⃗ = 0⃗." },
      ]}
    />
  );
}

// ── PLAN 3 PTS ────────────────────────────────────────────────────────────────
function Plan3PtsScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.PLAN_3PTS.d;
  const ry = 0.4 + frame * 0.003;
  const rx = 0.25;
  const cx = 215, cy = 210, sc = 50;

  // A(2,0,0), B(0,2,0), C(0,0,2) → plan x+y+z=2
  const A3 = [2,0,0];
  const B3 = [0,2,0];
  const C3 = [0,0,2];
  // centroide = (2/3, 2/3, 2/3)
  const G3 = [2/3, 2/3, 2/3];
  // n = (1,1,1), from centroide to centroide + n
  const Nend = [2/3+1.5, 2/3+1.5, 2/3+1.5];
  const planeCorners3 = [[2,0,0],[0,2,0],[0,0,2]];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 420" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,60,25)}>
        <Point3D pos={A3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A(2;0;0)" color={P.gold}/>
        <Point3D pos={B3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="B(0;2;0)" color={P.foot}/>
        <Point3D pos={C3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="C(0;0;2)" color={P.section}/>
      </g>
      <g opacity={fi(frame,120,25)}>
        <Vector3D from={A3} to={B3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.gold} label="AB⃗" width={2}/>
      </g>
      <g opacity={fi(frame,180,25)}>
        <Vector3D from={A3} to={C3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.gold} label="AC⃗" width={2}/>
      </g>
      <g opacity={fi(frame,260,25)}>
        <Vector3D from={G3} to={Nend} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.magic} label="n⃗" width={2.5}/>
      </g>
      <g opacity={fi(frame,320,30)}>
        <Plane3D corners={planeCorners3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf820" stroke="#38bdf866"/>
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Plan par 3 points"
      dur={dur} accent={P.gold} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:60,  text:"A, B, C non alignés → un unique plan π",               color:"#f0f0e8" },
        { f:120, text:"AB⃗ = B − A,  AC⃗ = C − A",                           color:P.gold  },
        { f:200, text:"n⃗ = AB⃗ ∧ AC⃗   (normal au plan)",                    color:P.magic },
        { f:300, text:"π : n⃗·AM⃗ = 0  ↔  a(x−xA)+b(y−yA)+c(z−zA)=0",      color:P.blue  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"3 points non alignés déterminent un unique plan. La clé : trouver le vecteur normal via le produit vectoriel de AB⃗ et AC⃗." },
        { f:300, speaker:"lea",   text:"Pour A(2,0,0), B(0,2,0), C(0,0,2) : AB⃗=(−2,2,0), AC⃗=(−2,0,2), donc n⃗ = AB⃗∧AC⃗ ?" },
        { f:460, speaker:"prof",  text:"n⃗ = (4,4,4) → simplifie en (1,1,1). Équation : (x−2)+y+z=0, soit x+y+z=2 !" },
        { f:760, speaker:"lucas", text:"On peut vérifier en injectant les 3 points dans l'équation ?" },
        { f:880, speaker:"prof",  text:"Oui ! 2+0+0=2 ✓, 0+2+0=2 ✓, 0+0+2=2 ✓. C'est le test de validation." },
      ]}
    />
  );
}

// ── SECTIONS ─────────────────────────────────────────────────────────────────
function SectionsScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.SECTIONS.d;
  const ry = 0.35 + frame * 0.003;
  const rx = 0.28;
  const cx = 215, cy = 220, sc = 44;

  // Cube [0,2]^3, plan x+y+z=3
  // Les 6 midpoints des arêtes : sur les arêtes DC, BC, BF, EF, EH, DH
  // A(0,0,0), B(2,0,0), C(2,2,0), D(0,2,0), E(0,0,2), F(2,0,2), G(2,2,2), H(0,2,2)
  // P1 = midpoint DC = (1,2,0) → 1+2+0=3 ✓
  // P2 = midpoint BC = (2,1,0) → 2+1+0=3 ✓
  // P3 = midpoint BF = (2,0,1) → 2+0+1=3 ✓
  // P4 = midpoint EF = (1,0,2) → 1+0+2=3 ✓
  // P5 = midpoint EH = (0,1,2) → 0+1+2=3 ✓
  // P6 = midpoint DH = (0,2,1) → 0+2+1=3 ✓
  const cubeVerts = {
    A:[0,0,0], B:[2,0,0], C:[2,2,0], D:[0,2,0],
    E:[0,0,2], F:[2,0,2], G:[2,2,2], H:[0,2,2],
  };
  const cubeEdges = [
    ["A","B"],["B","C"],["C","D"],["D","A"],
    ["E","F"],["F","G"],["G","H"],["H","E"],
    ["A","E"],["B","F"],["C","G"],["D","H"],
  ];
  const hexPts = [
    [1,2,0],[2,1,0],[2,0,1],[1,0,2],[0,1,2],[0,2,1],
  ];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 440" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} len={2.5}/>
      {/* Cube edges */}
      <g opacity={fi(frame,30,25)}>
        {cubeEdges.map(([ka,kb],i)=>{
          const va=cubeVerts[ka], vb=cubeVerts[kb];
          const pa=proj(va[0],va[1],va[2],ry,rx,cx,cy,sc);
          const pb=proj(vb[0],vb[1],vb[2],ry,rx,cx,cy,sc);
          return <line key={i} x1={pa.px} y1={pa.py} x2={pb.px} y2={pb.py} stroke="#38bdf855" strokeWidth={1.5}/>;
        })}
      </g>
      {/* 6 midpoints progressifs */}
      {hexPts.map((mp,i)=>(
        <g key={i} opacity={fi(frame,200+i*50,20)}>
          <Point3D pos={mp} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.section} r={6}/>
        </g>
      ))}
      {/* Hexagone final */}
      <g opacity={fi(frame,500,30)}>
        {(() => {
          const pp = hexPts.map(mp=>proj(mp[0],mp[1],mp[2],ry,rx,cx,cy,sc));
          return <polygon points={pp.map(p=>`${p.px},${p.py}`).join(" ")} fill="#fb923c22" stroke={P.section} strokeWidth={2.5}/>;
        })()}
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Sections planes d'un solide"
      dur={dur} accent={P.section} music="music3.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:40,  text:"Section = intersection du plan avec le solide",        color:"#f0f0e8" },
        { f:100, text:"Méthode : chercher les points ∩ par arête",            color:P.gold  },
        { f:200, text:"Cube : plan peut couper 3, 4, 5 ou 6 faces",          color:P.blue  },
        { f:300, text:"Hexagone régulier : plan par 6 midpoints d'arêtes",    color:P.section },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Pour sectionner un cube par un plan, on trace les intersections avec chaque face. Si le plan coupe 6 faces opposées deux à deux, on obtient un hexagone." },
        { f:300, speaker:"lea",   text:"Pour le plan x+y+z=3 et le cube [0,2]³, chaque sommet de la section est le milieu d'une arête ?" },
        { f:440, speaker:"prof",  text:"Exactement ! L'hexagone obtenu est régulier, de côté √2 et d'aire 3√3. Un résultat classique du bac." },
        { f:760, speaker:"lucas", text:"Comment on prouve que c'est régulier ?" },
        { f:880, speaker:"prof",  text:"Tous les côtés font √2 : |P1P2|=√((2−1)²+(1−2)²+0)=√2. Et tous les angles sont égaux par symétrie du cube." },
      ]}
    />
  );
}

// ── DEMO1 — CUBE SECTION ──────────────────────────────────────────────────────
function Demo1Scene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DEMO1.d;
  const opacity = sceneFade(frame, dur);
  const ry = 0.3 + frame * 0.002;
  const rx = 0.30;
  const cx = 240, cy = 290, sc = 38;

  const cubeVerts = {
    A:[0,0,0], B:[2,0,0], C:[2,2,0], D:[0,2,0],
    E:[0,0,2], F:[2,0,2], G:[2,2,2], H:[0,2,2],
  };
  const cubeEdges = [
    ["A","B"],["B","C"],["C","D"],["D","A"],
    ["E","F"],["F","G"],["G","H"],["H","E"],
    ["A","E"],["B","F"],["C","G"],["D","H"],
  ];
  // Plan x+y+z=3, hex: P1(1,2,0),P2(2,1,0),P3(2,0,1),P4(1,0,2),P5(0,1,2),P6(0,2,1)
  const hexPts = [[1,2,0],[2,1,0],[2,0,1],[1,0,2],[0,1,2],[0,2,1]];

  const steps = [
    { f:0,    text:"Cube ABCDEFGH d'arête 2, plan π : x+y+z = 3" },
    { f:400,  text:"Plan π coupe 6 arêtes du cube (ni par les sommets ni les faces entières)" },
    { f:800,  text:"P1(1;2;0) — midpoint DC : 1+2+0=3 ✓  |  P2(2;1;0) — midpoint BC : 2+1+0=3 ✓" },
    { f:950,  text:"P3(2;0;1) ✓  P4(1;0;2) ✓  P5(0;1;2) ✓  P6(0;2;1) ✓" },
    { f:1100, text:"6 points d'intersection → hexagone P1P2P3P4P5P6" },
    { f:1400, text:"Côté |P1P2| = √((2−1)²+(1−2)²+0²) = √2  →  tous les côtés = √2" },
    { f:1700, text:"Aire = (3√3/2)·(√2)² = 3√3 ≈ 5.196 unités²" },
    { f:2000, text:"Angle intérieur = 120° (hexagone régulier par symétrie du cube)" },
  ];

  const currentStep = [...steps].reverse().find(s=>frame>=s.f)||steps[0];
  const hexVisible = frame >= 1100;

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music5.mp3")} volume={0.10}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Sequence from={1700}><Audio src={staticFile("audio/sfx_ding.mp3")} volume={0.65}/></Sequence>
      <Stars count={40} seed={3}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,transparent,${P.section},transparent)`, boxShadow:`0 0 20px ${P.section}` }}/>

      <div style={{ position:"absolute", top:22, left:50, right:50 }}>
        <div style={{ color:P.section, fontSize:15, fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>Démonstration BAC · Partie 3</div>
        <div style={{ color:P.text, fontSize:44, fontWeight:900, lineHeight:1.1, marginTop:4 }}>Cube ABCDEFGH : section hexagonale</div>
        <div style={{ marginTop:8, height:3, background:P.border, borderRadius:3 }}>
          <div style={{ width:`${(frame/dur)*100}%`, height:"100%", background:P.section, borderRadius:3 }}/>
        </div>
      </div>

      <div style={{ position:"absolute", top:148, left:50, right:50, bottom:30, display:"flex", gap:28 }}>
        {/* SVG Cube */}
        <div style={{ flex:"0 0 55%", background:P.surface, borderRadius:16, border:`1px solid ${P.border}`, position:"relative", overflow:"hidden" }}>
          <svg width="100%" height="100%" viewBox="0 0 480 520" style={{ position:"absolute" }}>
            <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} len={2.5}/>
            <g opacity={fi(frame,40,30)}>
              {cubeEdges.map(([ka,kb],i)=>{
                const va=cubeVerts[ka], vb=cubeVerts[kb];
                const pa=proj(va[0],va[1],va[2],ry,rx,cx,cy,sc);
                const pb=proj(vb[0],vb[1],vb[2],ry,rx,cx,cy,sc);
                return <line key={i} x1={pa.px} y1={pa.py} x2={pb.px} y2={pb.py} stroke="#38bdf877" strokeWidth={1.8}/>;
              })}
            </g>
            {/* Plan semi-transparent */}
            <g opacity={fi(frame,400,40)}>
              {(() => {
                const pp = hexPts.map(mp=>proj(mp[0],mp[1],mp[2],ry,rx,cx,cy,sc));
                return <polygon points={pp.map(p=>`${p.px},${p.py}`).join(" ")} fill="#fb923c15" stroke="#fb923c44" strokeWidth={1}/>;
              })()}
            </g>
            {/* 6 midpoints */}
            {hexPts.map((mp,i)=>(
              <g key={i} opacity={fi(frame,800+i*25,20)}>
                <Point3D pos={mp} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.section} r={7}/>
              </g>
            ))}
            {/* Hexagone final */}
            {hexVisible && (
              <g opacity={fi(frame,1100,40)}>
                {(() => {
                  const pp = hexPts.map(mp=>proj(mp[0],mp[1],mp[2],ry,rx,cx,cy,sc));
                  return <polygon points={pp.map(p=>`${p.px},${p.py}`).join(" ")} fill="#fb923c30" stroke={P.section} strokeWidth={3}/>;
                })()}
              </g>
            )}
            {/* Labels hex points */}
            {hexPts.map((mp,i)=>(
              <g key={`lbl${i}`} opacity={fi(frame,1100,30)}>
                {(() => {
                  const p=proj(mp[0],mp[1],mp[2],ry,rx,cx,cy,sc);
                  return <text x={p.px+8} y={p.py-10} fill={P.section} fontSize={12} fontWeight={700}>{`P${i+1}`}</text>;
                })()}
              </g>
            ))}
          </svg>
        </div>

        {/* Steps panel */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#1a1020", border:`2px solid ${P.section}`, borderRadius:14, padding:"16px 20px" }}>
            <div style={{ color:P.section, fontSize:12, fontWeight:800, letterSpacing:2, marginBottom:8 }}>ÉTAPE EN COURS</div>
            <div style={{ color:P.text, fontFamily:MONO, fontSize:13, lineHeight:1.6 }}
              dangerouslySetInnerHTML={{__html:mathHTML(currentStep.text)}}/>
          </div>
          <div style={{ flex:1, background:P.card, borderRadius:14, border:`1px solid ${P.border}`, padding:"12px 16px", overflow:"hidden" }}>
            <div style={{ color:P.gold, fontSize:12, fontWeight:800, letterSpacing:2, marginBottom:10 }}>PROBLÈME BAC · CUBE ARÊTE 2</div>
            {steps.map((s,i)=>(
              <div key={i} style={{
                opacity:frame>=s.f?(s===currentStep?1:0.35):0.08,
                color:s===currentStep?P.section:P.text,
                fontFamily:MONO, fontSize:11, lineHeight:1.55, marginBottom:4,
                fontWeight:s===currentStep?700:400,
              }} dangerouslySetInnerHTML={{__html:`${i+1}. ${mathHTML(s.text)}`}}/>
            ))}
          </div>
          <ClassroomPanel frame={frame} dialogues={[
            { f:40,   speaker:"prof",  text:"On cherche la section du cube ABCDEFGH d'arête 2 par le plan π : x+y+z=3. Trouvons les intersections avec les arêtes." },
            { f:380,  speaker:"lea",   text:"Le plan coupe les arêtes DC, BC, BF, EF, EH, DH exactement à mi-longueur ?" },
            { f:500,  speaker:"prof",  text:"Exactement ! Chaque midpoint vérifie x+y+z=3. On obtient 6 points P1 à P6." },
            { f:1080, speaker:"lucas", text:"L'hexagone P1P2P3P4P5P6 est régulier ?" },
            { f:1200, speaker:"prof",  text:"Oui ! Tous les côtés font √2. L'aire vaut 3√3 ≈ 5.2 unités². Résultat à retenir !" },
            { f:1900, speaker:"lea",   text:"Et les angles intérieurs font tous 120° puisque c'est un hexagone régulier ?" },
            { f:2050, speaker:"prof",  text:"Parfait ! Somme des angles = (6−2)×180 = 720°, chaque angle = 720/6 = 120°." },
          ]}/>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── TETRA REG ─────────────────────────────────────────────────────────────────
function TetraRegScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.TETRA_REG.d;
  const ry = 0.4 + frame * 0.003;
  const rx = 0.20;
  const cx = 215, cy = 230, sc = 44;

  // A(0,0,0), B(2,0,0), C(1,√3,0), D(1, √3/3, 2√6/3)
  const sqrt3 = Math.sqrt(3);
  const sqrt6 = Math.sqrt(6);
  const TA = [0,0,0];
  const TB = [2,0,0];
  const TC = [1,sqrt3,0];
  const TD = [1, sqrt3/3, 2*sqrt6/3];
  // Centroide ABC = (1, √3/3, 0)
  const GABC = [1, sqrt3/3, 0];
  // Isobarycentre = (A+B+C+D)/4
  const G4 = [(0+2+1+1)/4, (0+0+sqrt3+sqrt3/3)/4, (0+0+0+2*sqrt6/3)/4];

  const tetFaces = [
    { pts:[TA,TB,TC], color:"#22c55e20", stroke:"#22c55e66" },
    { pts:[TA,TB,TD], color:"#3b82f620", stroke:"#3b82f666" },
    { pts:[TB,TC,TD], color:"#ef444420", stroke:"#ef444466" },
    { pts:[TA,TC,TD], color:"#fb923c20", stroke:"#fb923c66" },
  ];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 460" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      {/* Faces */}
      {tetFaces.map(({pts,color,stroke},i)=>(
        <g key={i} opacity={fi(frame,60,30)}>
          <Plane3D corners={pts} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={color} stroke={stroke}/>
        </g>
      ))}
      {/* Sommets */}
      <g opacity={fi(frame,80,25)}>
        <Point3D pos={TA} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A" color={P.gold}/>
        <Point3D pos={TB} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="B" color={P.blue}/>
        <Point3D pos={TC} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="C" color={P.section}/>
        <Point3D pos={TD} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="D" color={P.magic}/>
      </g>
      {/* Hauteur D->GABC */}
      <g opacity={fi(frame,220,25)}>
        <Vector3D from={TD} to={GABC} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.text} width={1.5} dashed/>
        <Point3D pos={GABC} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="H" color={P.foot} r={5}/>
      </g>
      {/* Centre G */}
      <g opacity={fi(frame,380,25)}>
        <Point3D pos={G4} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="G" color={P.foot} r={6}/>
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Tétraèdre régulier"
      dur={dur} accent={P.magic} music="music3.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:60,  text:"A(0;0;0), B(2;0;0), C(1;√3;0), D(1; √3/3; 2√6/3)",  color:"#f0f0e8" },
        { f:140, text:"Hauteur : h = a√6/3  (a = arête)",                    color:P.gold  },
        { f:220, text:"Volume : V = a³√2/12",                                color:P.blue  },
        { f:320, text:"Centre G = (A+B+C+D)/4  (isobarycentre)",             color:P.foot  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Le tétraèdre régulier a 4 faces équilatérales identiques. Ses propriétés sont très souvent au bac, surtout le calcul de hauteur et de volume." },
        { f:240, speaker:"lea",   text:"h = a√6/3 ? D'où ça vient ?" },
        { f:360, speaker:"prof",  text:"Le pied de la hauteur est le centroïde de la face de base ABC. On calcule sa distance au centroïde, puis on applique Pythagore avec a/2." },
        { f:700, speaker:"lucas", text:"Pour a=2 : h = 2√6/3 ≈ 1.63 et V = 8√2/12 = 2√2/3 ≈ 0.94 ?" },
        { f:850, speaker:"prof",  text:"Parfait ! Et le centre G est à la distance h/4 de la base et 3h/4 du sommet — propriété de l'isobarycentre." },
      ]}
    />
  );
}

// ── OPTIMIS ───────────────────────────────────────────────────────────────────
function OptimisScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.OPTIMIS.d;
  const ry = 0.5 + frame * 0.003;
  const rx = 0.22;
  const cx = 215, cy = 210, sc = 48;

  // Droite (D): A=(0,1,0), u=(1,0,1)
  // M=(1,3,1)
  // t* = AM·u/|u|² = (1+0+1)/2 = 1
  // P* = (0+1, 1+0, 0+1) = (1,1,1)
  const OA = [0,1,0];
  const lineEnd = [2.5,1,2.5];
  const lineStart2 = [-1.5,1,-1.5];
  const M3 = [1,3,1];
  const Pstar2 = [1,1,1];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 420" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,30,25)}>
        <Vector3D from={lineStart2} to={lineEnd} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} label="(D)" width={2.5}/>
      </g>
      <g opacity={fi(frame,80,25)}>
        <Point3D pos={M3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="M(1;3;1)" color={P.gold}/>
      </g>
      <g opacity={fi(frame,180,25)}>
        <Point3D pos={Pstar2} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="P*" color={P.foot}/>
      </g>
      {frame > 160 && (() => {
        const pM=proj(...M3,ry,rx,cx,cy,sc);
        const pPs=proj(...Pstar2,ry,rx,cx,cy,sc);
        return (
          <g opacity={fi(frame,180,20)}>
            <line x1={pM.px} y1={pM.py} x2={pPs.px} y2={pPs.py}
              stroke={P.perp} strokeWidth={2.5} strokeDasharray="6,4"/>
            <text x={(pM.px+pPs.px)/2+14} y={(pM.py+pPs.py)/2} fill={P.perp} fontSize={14} fontWeight={800}>d</text>
            <rect x={pPs.px-6} y={pPs.py-6} width={10} height={10}
              fill="none" stroke={P.foot} strokeWidth={1.5} opacity={fi(frame,220,20)}/>
          </g>
        );
      })()}
    </svg>
  );

  return (
    <LessonScene
      title="Optimisation : point le plus proche"
      dur={dur} accent={P.foot} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:40,  text:"(D) : P = A + t·u⃗,  minimiser MP(t)²",              color:"#f0f0e8" },
        { f:100, text:"t* = AM⃗·u⃗ / ‖u⃗‖²",                                 color:P.gold  },
        { f:180, text:"Pied P* = A + t*·u⃗",                                 color:P.foot  },
        { f:260, text:"d(M, D) = ‖MP*‖",                                     color:P.perp  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Pour trouver le point de (D) le plus proche de M, on minimise MP(t)² en t. La dérivée en t* donne la condition AM⃗·u⃗ − t*‖u⃗‖² = 0." },
        { f:220, speaker:"lea",   text:"C'est la projection de AM⃗ sur u⃗ divisée par ‖u⃗‖² ?" },
        { f:360, speaker:"prof",  text:"Exactement. P* est le pied de la perpendiculaire issue de M sur (D). La distance cherchée est ‖MP*‖." },
      ]}
    />
  );
}

// ── BARYCENTRE ────────────────────────────────────────────────────────────────
function BarycentreScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.BARYCENTRE.d;
  const ry = 0.4 + frame * 0.003;
  const rx = 0.18;
  const cx = 215, cy = 215, sc = 50;

  // A(0,0,0), B(3,0,0), C(1,2,0)
  // Poids (2,1,1), G = (2·0+1·3+1·1)/4, (2·0+1·0+1·2)/4, 0
  //             = (4/4, 2/4, 0) = (1, 0.5, 0)
  const BA = [0,0,0];
  const BB = [3,0,0];
  const BC3 = [1,2,0];
  const BG = [1, 0.5, 0];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 430" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      {/* Triangle */}
      <g opacity={fi(frame,40,25)}>
        <Vector3D from={BA} to={BB} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} width={2}/>
        <Vector3D from={BB} to={BC3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} width={2}/>
        <Vector3D from={BC3} to={BA} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} width={2}/>
      </g>
      {/* Points */}
      <g opacity={fi(frame,60,25)}>
        <Point3D pos={BA} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A (α=2)" color={P.gold}/>
        <Point3D pos={BB} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="B (β=1)" color={P.blue}/>
        <Point3D pos={BC3} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="C (γ=1)" color={P.section}/>
      </g>
      {/* Barycentre */}
      <g opacity={fi(frame,200,25)}>
        <Point3D pos={BG} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="G(1;0.5;0)" color={P.gold} r={8}/>
      </g>
      {/* Segments AG, BG, CG */}
      <g opacity={fi(frame,240,25)}>
        <Vector3D from={BA} to={BG} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.gold} width={1.5} dashed/>
        <Vector3D from={BB} to={BG} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} width={1.5} dashed/>
        <Vector3D from={BC3} to={BG} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.section} width={1.5} dashed/>
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Barycentre en 3D"
      dur={dur} accent={P.gold} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:40,  text:"G barycentre de (A,α),(B,β),(C,γ) :",                 color:"#f0f0e8" },
        { f:100, text:"αGA⃗ + βGB⃗ + γGC⃗ = 0⃗",                            color:P.gold  },
        { f:180, text:"OG⃗ = (α·OA⃗ + β·OB⃗ + γ·OC⃗)/(α+β+γ)",             color:P.blue  },
        { f:280, text:"Isobarycentre (α=β=γ=1): G=(A+B+C)/3",               color:P.foot  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Le barycentre de plusieurs points avec des poids, c'est leur 'moyenne pondérée'. En 3D on l'utilise pour trouver le centre de gravité d'un solide." },
        { f:260, speaker:"lea",   text:"L'isobarycentre de A, B, C, D est le centre de gravité G = (A+B+C+D)/4 pour un tétraèdre ?" },
        { f:400, speaker:"prof",  text:"Exactement ! Pour tout tétraèdre, G est à l'intersection des 4 médianes, et il divise chaque médiane en ratio 3:1 depuis le sommet." },
      ]}
    />
  );
}

// ── PLAN MED ──────────────────────────────────────────────────────────────────
function PlanMedScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.PLAN_MED.d;
  const ry = 0.45 + frame * 0.003;
  const rx = 0.22;
  const cx = 215, cy = 215, sc = 48;

  // A=(-1,0,-1), B=(1,2,1) → n=AB=(2,2,2) → dir (1,1,1)
  // I = (0,1,0)
  const MA = [-1,0,-1];
  const MB = [1,2,1];
  const MI = [0,1,0];
  // plan mediateur perpendiculaire à AB en I
  // corners: I ± v1 ± v2 where v1,v2 ⊥ (1,1,1)
  // v1=(1,-1,0)/√2, v2=(1,1,-2)/√6
  const planCorners = [
    [ 1.5, -0.5, 1],[-0.5, 2.5, 0],
    [-1.5,  2.5,-1],[ 0.5,-0.5, 0],
  ];

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 430" style={{ position:"absolute" }}>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
      <g opacity={fi(frame,40,25)}>
        <Point3D pos={MA} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A(-1;0;-1)" color={P.gold}/>
        <Point3D pos={MB} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="B(1;2;1)" color={P.gold}/>
        {(() => {
          const pA=proj(...MA,ry,rx,cx,cy,sc);
          const pB=proj(...MB,ry,rx,cx,cy,sc);
          return <line x1={pA.px} y1={pA.py} x2={pB.px} y2={pB.py} stroke={P.gold} strokeWidth={2}/>;
        })()}
      </g>
      <g opacity={fi(frame,100,25)}>
        <Point3D pos={MI} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="I(0;1;0)" color={P.foot}/>
      </g>
      <g opacity={fi(frame,160,30)}>
        <Plane3D corners={planCorners} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color="#38bdf820" stroke="#38bdf877"/>
      </g>
      <g opacity={fi(frame,240,25)}>
        <Vector3D from={MI} to={[1,2,1]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.blue} label="n⃗=AB⃗" width={2}/>
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Plan médiateur d'un segment"
      dur={dur} accent={P.blue} music="music2.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:40,  text:"n⃗ = AB⃗,  I = (A+B)/2",                             color:"#f0f0e8" },
        { f:100, text:"π médiateur : n⃗·IM⃗ = 0",                           color:P.gold  },
        { f:200, text:"Propriété : M ∈ π ⟺ MA = MB",                        color:P.blue  },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Le plan médiateur de [AB] est l'ensemble des points équidistants de A et B. Son vecteur normal est AB⃗, et il passe par le milieu I." },
        { f:220, speaker:"lea",   text:"MA = MB donne une équation du plan si on développe les distances ?" },
        { f:360, speaker:"prof",  text:"Oui ! MA² = MB² développe en une équation linéaire en x, y, z — c'est l'équation du plan médiateur." },
      ]}
    />
  );
}

// ── LIEUX GEO ─────────────────────────────────────────────────────────────────
function LieuxGeoScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.LIEUX_GEO.d;
  const ry = 0.4 + frame * 0.003;
  const rx = 0.20;

  const vizContent = (
    <svg width="100%" height="100%" viewBox="0 0 430 380" style={{ position:"absolute" }}>
      {/* 3 vignettes côte à côte */}
      {/* Vignette 1: plan médiateur */}
      <g opacity={fi(frame,40,25)}>
        <rect x={10} y={20} width={120} height={100} fill={P.card} rx={8} stroke={P.blue} strokeWidth={1.5}/>
        <text x={70} y={40} fill={P.blue} fontSize={10} fontWeight={800} textAnchor="middle">PLAN MÉDIATEUR</text>
        <line x1={70} y1={50} x2={70} y2={110} stroke="#38bdf877" strokeWidth={2}/>
        <circle cx={70} cy={60} r={5} fill={P.gold}/>
        <circle cx={70} cy={100} r={5} fill={P.gold}/>
        <text x={82} y={62} fill={P.gold} fontSize={9}>A</text>
        <text x={82} y={102} fill={P.gold} fontSize={9}>B</text>
        <line x1={30} y1={80} x2={110} y2={80} stroke={P.blue} strokeWidth={2}/>
        <text x={70} y={125} fill={P.dim} fontSize={9} textAnchor="middle">{"{M | MA=MB}"}</text>
      </g>
      {/* Vignette 2: sphère */}
      <g opacity={fi(frame,120,25)}>
        <rect x={155} y={20} width={120} height={100} fill={P.card} rx={8} stroke={P.magic} strokeWidth={1.5}/>
        <text x={215} y={40} fill={P.magic} fontSize={10} fontWeight={800} textAnchor="middle">SPHÈRE</text>
        <circle cx={215} cy={78} r={30} fill="#a78bfa15" stroke={P.magic} strokeWidth={2}/>
        <circle cx={215} cy={78} r={4} fill={P.magic}/>
        <text x={221} y={76} fill={P.magic} fontSize={9}>Ω</text>
        <line x1={215} y1={78} x2={215} y2={48} stroke={P.gold} strokeWidth={1.5} strokeDasharray="3,2"/>
        <text x={220} y={65} fill={P.gold} fontSize={9}>r</text>
        <text x={215} y={125} fill={P.dim} fontSize={9} textAnchor="middle">{"{M | MA=r}"}</text>
      </g>
      {/* Vignette 3: cylindre */}
      <g opacity={fi(frame,220,25)}>
        <rect x={300} y={20} width={120} height={100} fill={P.card} rx={8} stroke={P.section} strokeWidth={1.5}/>
        <text x={360} y={40} fill={P.section} fontSize={10} fontWeight={800} textAnchor="middle">CYLINDRE</text>
        <line x1={360} y1={50} x2={360} y2={115} stroke={P.blue} strokeWidth={2}/>
        <ellipse cx={360} cy={78} rx={22} ry={8} fill="#fb923c15" stroke={P.section} strokeWidth={2}/>
        <ellipse cx={360} cy={55} rx={22} ry={8} fill="#fb923c15" stroke={P.section} strokeWidth={1} strokeDasharray="3,2"/>
        <ellipse cx={360} cy={108} rx={22} ry={8} fill="#fb923c15" stroke={P.section} strokeWidth={1.5}/>
        <text x={360} y={125} fill={P.dim} fontSize={9} textAnchor="middle">{"{M | d(M,D)=r}"}</text>
      </g>
      {/* Formules bas */}
      <g opacity={fi(frame,320,25)}>
        <text x={215} y={155} fill={P.text} fontSize={13} fontWeight={700} textAnchor="middle">Intersection sphère ∩ plan</text>
        <text x={215} y={178} fill={P.blue} fontSize={13} fontWeight={600} textAnchor="middle">→ cercle de rayon √(r²−d²) si d {"<"} r</text>
        <text x={215} y={200} fill={P.dim} fontSize={12} textAnchor="middle">→ point si d = r  |  ∅ si d {">"} r</text>
      </g>
    </svg>
  );

  return (
    <LessonScene
      title="Lieux géométriques"
      dur={dur} accent={P.magic} music="music3.mp3"
      narrationFile={narrationFile}
      vizContent={vizContent}
      formulas={[
        { f:40,  text:"{M | MA = MB} = plan médiateur de [AB]",             color:P.blue  },
        { f:120, text:"{M | MA = r}  = sphère de centre A, rayon r",        color:P.magic },
        { f:220, text:"{M | d(M,D) = r} = cylindre de rayon r",             color:P.section },
        { f:320, text:"{M | MA ≤ r}  = boule (solide)",                     color:"#f0f0e8" },
      ]}
      dialogues={[
        { f:40,  speaker:"prof",  text:"Un lieu géométrique est l'ensemble de tous les points vérifiant une condition. En 3D, les plus courants sont le plan médiateur, la sphère, et le cylindre." },
        { f:240, speaker:"lea",   text:"L'intersection d'une sphère et d'un plan, c'est un cercle ?" },
        { f:380, speaker:"prof",  text:"Oui ! Si la distance du centre au plan est d < r, l'intersection est un cercle de rayon √(r²−d²). Si d=r, c'est un point." },
      ]}
    />
  );
}

// ── DEMO2 — TETRAÈDRE BAC ─────────────────────────────────────────────────────
function Demo2Scene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DEMO2.d;
  const opacity = sceneFade(frame, dur);
  const ry = 0.35 + frame * 0.002;
  const rx = 0.25;
  const cx = 240, cy = 300, sc = 40;

  const sqrt3 = Math.sqrt(3);
  const sqrt6 = Math.sqrt(6);
  const TA = [0,0,0];
  const TB = [2,0,0];
  const TC = [1,sqrt3,0];
  const TD = [1, sqrt3/3, 2*sqrt6/3];
  const GABC = [1, sqrt3/3, 0];
  const G4 = [1, (sqrt3 + sqrt3/3)/4, (2*sqrt6/3)/4];

  const tetFaces = [
    { pts:[TA,TB,TC], color:"#22c55e18", stroke:"#22c55e55" },
    { pts:[TA,TB,TD], color:"#3b82f618", stroke:"#3b82f655" },
    { pts:[TB,TC,TD], color:"#ef444418", stroke:"#ef444455" },
    { pts:[TA,TC,TD], color:"#fb923c18", stroke:"#fb923c55" },
  ];

  const steps = [
    { f:0,    text:"Tétraèdre régulier ABCD, arête a=2" },
    { f:400,  text:"A(0;0;0), B(2;0;0), C(1;√3;0), D(1; √3/3; 2√6/3)" },
    { f:600,  text:"Étape 1 — Hauteur DE (D vers centroïde H de ABC)" },
    { f:700,  text:"H = centroïde ABC = ((0+2+1)/3; (0+0+√3)/3; 0) = (1; √3/3; 0)" },
    { f:900,  text:"DH⃗ = H−D = (0; 0; −2√6/3)  →  h = |DH| = 2√6/3 ≈ 1.633" },
    { f:1100, text:"Formule : h = a√6/3 = 2√6/3 ✓" },
    { f:1400, text:"Étape 2 — Volume V = (Aire base × h) / 3" },
    { f:1500, text:"Aire ABC (équilatéral a=2) = (√3/4)×4 = √3" },
    { f:1600, text:"V = √3 × 2√6/3 / 3 = 2√18/9 = 6√2/9 = 2√2/3 ≈ 0.943" },
    { f:1900, text:"Étape 3 — Isobarycentre G = (A+B+C+D)/4" },
    { f:2000, text:"G = ((0+2+1+1)/4; (0+0+√3+√3/3)/4; (2√6/3)/4)" },
    { f:2100, text:"G = (1; (4√3/3)/4; √6/6) = (1; √3/3; √6/6)" },
    { f:2200, text:"Dist D à plan ABC (z=0) : z_D = 2√6/3 ✓  (déjà la hauteur)" },
  ];

  const currentStep = [...steps].reverse().find(s=>frame>=s.f)||steps[0];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music5.mp3")} volume={0.10}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Sequence from={1900}><Audio src={staticFile("audio/sfx_ding.mp3")} volume={0.65}/></Sequence>
      <Stars count={40} seed={6}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,transparent,${P.magic},transparent)`, boxShadow:`0 0 20px ${P.magic}` }}/>

      <div style={{ position:"absolute", top:22, left:50, right:50 }}>
        <div style={{ color:P.magic, fontSize:15, fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>Démonstration BAC · Partie 3</div>
        <div style={{ color:P.text, fontSize:44, fontWeight:900, lineHeight:1.1, marginTop:4 }}>Tétraèdre régulier ABCD complet</div>
        <div style={{ marginTop:8, height:3, background:P.border, borderRadius:3 }}>
          <div style={{ width:`${(frame/dur)*100}%`, height:"100%", background:P.magic, borderRadius:3 }}/>
        </div>
      </div>

      <div style={{ position:"absolute", top:148, left:50, right:50, bottom:30, display:"flex", gap:28 }}>
        {/* SVG Tetraèdre */}
        <div style={{ flex:"0 0 55%", background:P.surface, borderRadius:16, border:`1px solid ${P.border}`, position:"relative", overflow:"hidden" }}>
          <svg width="100%" height="100%" viewBox="0 0 480 540" style={{ position:"absolute" }}>
            <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc}/>
            {tetFaces.map(({pts,color,stroke},i)=>(
              <g key={i} opacity={fi(frame,60,30)}>
                <Plane3D corners={pts} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={color} stroke={stroke}/>
              </g>
            ))}
            <g opacity={fi(frame,80,25)}>
              <Point3D pos={TA} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="A" color={P.gold}/>
              <Point3D pos={TB} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="B" color={P.blue}/>
              <Point3D pos={TC} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="C" color={P.section}/>
              <Point3D pos={TD} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="D" color={P.magic}/>
            </g>
            {/* Hauteur */}
            <g opacity={fi(frame,700,30)}>
              <Vector3D from={TD} to={GABC} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.text} width={2} dashed/>
              <Point3D pos={GABC} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="H" color={P.foot} r={5}/>
            </g>
            {/* Isobarycentre */}
            <g opacity={fi(frame,1900,30)}>
              <Point3D pos={G4} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} label="G" color={P.foot} r={7}/>
            </g>
          </svg>
        </div>

        {/* Steps panel */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#110a1f", border:`2px solid ${P.magic}`, borderRadius:14, padding:"16px 20px" }}>
            <div style={{ color:P.magic, fontSize:12, fontWeight:800, letterSpacing:2, marginBottom:8 }}>ÉTAPE EN COURS</div>
            <div style={{ color:P.text, fontFamily:MONO, fontSize:12, lineHeight:1.6 }}
              dangerouslySetInnerHTML={{__html:mathHTML(currentStep.text)}}/>
          </div>
          <div style={{ flex:1, background:P.card, borderRadius:14, border:`1px solid ${P.border}`, padding:"12px 16px", overflow:"hidden" }}>
            <div style={{ color:P.gold, fontSize:12, fontWeight:800, letterSpacing:2, marginBottom:8 }}>PROBLÈME TYPE BAC · TÉTRAÈDRE RÉGULIER</div>
            {steps.map((s,i)=>(
              <div key={i} style={{
                opacity:frame>=s.f?(s===currentStep?1:0.35):0.08,
                color:s===currentStep?P.magic:P.text,
                fontFamily:MONO, fontSize:10, lineHeight:1.5, marginBottom:3,
                fontWeight:s===currentStep?700:400,
              }} dangerouslySetInnerHTML={{__html:`${i+1}. ${mathHTML(s.text)}`}}/>
            ))}
          </div>
          <ClassroomPanel frame={frame} dialogues={[
            { f:40,   speaker:"prof",  text:"Tétraèdre régulier ABCD d'arête 2. On place A à l'origine, B sur l'axe x, C dans le plan xy, D au-dessus." },
            { f:580,  speaker:"lea",   text:"Le centroïde de ABC est H = (1; √3/3; 0) — c'est la moyenne des coordonnées ?" },
            { f:720,  speaker:"prof",  text:"Exactement. Et DH = 2√6/3 est la hauteur. On vérifie avec la formule h = a√6/3 = 2√6/3 ✓" },
            { f:1350, speaker:"lucas", text:"Le volume V = 2√2/3 ≈ 0.94 unités cube pour a=2 ?" },
            { f:1480, speaker:"prof",  text:"Oui ! V = a³√2/12 = 8√2/12 = 2√2/3. Et G est à h/4 = √6/6 au-dessus du plan ABC." },
            { f:2050, speaker:"lea",   text:"L'équation du plan ABC est z=0, donc d(D, plan ABC) = z_D = 2√6/3 = h ?" },
            { f:2200, speaker:"prof",  text:"Exactement ! La distance du sommet D au plan de base est égale à la hauteur du tétraèdre. Cohérent !" },
          ]}/>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── METHODES ──────────────────────────────────────────────────────────────────
function MethodesScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.METHODES.d;
  const opacity = sceneFade(frame, dur);

  const cards = [
    {
      color: P.gold,
      icon: "🔺",
      title: "Plan par 3 points",
      steps: [
        "① Calculer AB⃗ = B−A et AC⃗ = C−A",
        "② n⃗ = AB⃗ ∧ AC⃗ (produit vectoriel)",
        "③ Équation : n⃗·AM⃗ = 0",
        "④ Développer : ax+by+cz+d=0",
      ],
    },
    {
      color: P.magic,
      icon: "🪞",
      title: "Symétrique/plan",
      steps: [
        "① Écrire la droite : M = A + t·n⃗",
        "② Injecter dans π → résoudre en t₀",
        "③ H = A + t₀·n⃗ (pied ⊥)",
        "④ A' = A + 2t₀·n⃗ (symétrique)",
      ],
    },
    {
      color: P.section,
      icon: "✂️",
      title: "Section cube",
      steps: [
        "① Lister toutes les arêtes du cube",
        "② Chercher ∩ plan / arête par paramétrie",
        "③ Valider : point dans [0,a]",
        "④ Relier les points → polygone section",
      ],
    },
    {
      color: P.foot,
      icon: "🎯",
      title: "Optimisation",
      steps: [
        "① Paramétriser la droite : P(t) = A+t·u⃗",
        "② Poser f(t) = ‖MP(t)‖² et dériver",
        "③ f'(t*)=0 → t* = AM⃗·u⃗/‖u⃗‖²",
        "④ P* = A+t*·u⃗,  d = ‖MP*‖",
      ],
    },
  ];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music6.mp3")} volume={0.10}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Stars count={40} seed={8}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(90deg,transparent,#fbbf24,transparent)", boxShadow:"0 0 20px #fbbf24" }}/>

      <div style={{ position:"absolute", top:22, left:50, right:50 }}>
        <div style={{ color:P.gold, fontSize:15, fontWeight:800, letterSpacing:3, textTransform:"uppercase" }}>Mémos · Terminale Partie 3</div>
        <div style={{ color:P.text, fontSize:44, fontWeight:900, lineHeight:1.1, marginTop:4 }}>Méthodes types BAC</div>
        <div style={{ marginTop:8, height:3, background:P.border, borderRadius:3 }}>
          <div style={{ width:`${(frame/dur)*100}%`, height:"100%", background:P.gold, borderRadius:3 }}/>
        </div>
      </div>

      <div style={{ position:"absolute", top:148, left:50, right:50, bottom:30, display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
        {cards.map(({ color, icon, title, steps }, ci) => {
          const sc2 = spring({ frame:frame-(40+ci*80), fps, config:{ damping:12, stiffness:55 } });
          return (
            <div key={title} style={{
              opacity:sc2, transform:`translateY(${(1-sc2)*24}px)`,
              background:P.card, border:`1px solid ${P.border}`,
              borderLeft:`5px solid ${color}`, borderRadius:14, padding:"20px 22px",
            }}>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                <span style={{ fontSize:28 }}>{icon}</span>
                <div style={{ color, fontSize:16, fontWeight:900 }}>{title}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {steps.map((step,i)=>(
                  <div key={i} style={{
                    opacity:fi(frame, 80+ci*80+i*60, 20),
                    background:P.surface, borderRadius:8, padding:"8px 12px",
                    color:P.text, fontFamily:MONO, fontSize:13, lineHeight:1.5,
                  }} dangerouslySetInnerHTML={{__html:mathHTML(step)}}/>
                ))}
              </div>
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
    { icon:"🔁", label:"Symétrie/point",            desc:"A' = 2·O − A" },
    { icon:"🪞", label:"Symétrie/plan",             desc:"A' = A + 2t₀·n⃗,  t₀ = −f(A)/|n⃗|²" },
    { icon:"📐", label:"Distance pt-droite",         desc:"‖AP⃗ ∧ u⃗‖ / ‖u⃗‖" },
    { icon:"🔺", label:"Plan par 3 pts",            desc:"n⃗ = AB⃗∧AC⃗,  n⃗·AM⃗=0" },
    { icon:"✂️", label:"Sections hexagonales",      desc:"6 midpoints, aire = 3√3" },
    { icon:"💎", label:"Tétraèdre : h, V, G",       desc:"h=a√6/3, V=a³√2/12, G=(A+B+C+D)/4" },
    { icon:"🎯", label:"Optimisation sur droite",   desc:"t* = AM⃗·u⃗/‖u⃗‖²,  P*=A+t*·u⃗" },
    { icon:"⚖️", label:"Barycentre 3D",             desc:"OG⃗=(αOA⃗+βOB⃗+γOC⃗)/(α+β+γ)" },
    { icon:"🔷", label:"Plan médiateur",            desc:"MA=MB, n⃗=AB⃗, passe par I" },
    { icon:"🌐", label:"Lieux (sphère/plan/cyl.)",  desc:"MA=r, MA=MB, d(M,D)=r" },
    { icon:"📋", label:"Méthodes BAC",              desc:"Plan, symétrie, section, optim." },
    { icon:"🏆", label:"Prêt pour le bac !",        desc:"Parties 1, 2 et 3 complètes" },
  ];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music6.mp3")} volume={0.13}/>
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1}/>}
      <Sequence from={200}><Audio src={staticFile("audio/sfx_applause.mp3")} volume={0.45}/></Sequence>
      <Stars count={100} seed={11}/>

      <AbsoluteFill style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ opacity:fi(frame,10,22), color:P.gold, fontSize:18, fontWeight:800, textTransform:"uppercase", letterSpacing:4, marginBottom:10 }}>
          Récapitulatif — Partie 3
        </div>
        <div style={{ fontSize:56, fontWeight:950, color:P.text, textShadow:"0 0 40px #a78bfa44", marginBottom:4 }}>
          Terminale Avancé
        </div>
        <div style={{ opacity:fi(frame,30,22), fontSize:22, color:P.magic, fontWeight:700, marginBottom:30 }}>
          Géométrie dans l'espace — Niveau Expert
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:12, maxWidth:1280, justifyContent:"center" }}>
          {items.map(({ icon, label, desc }, i) => {
            const sc2 = spring({ frame:frame-(50+i*38), fps, config:{ damping:12, stiffness:60 } });
            return (
              <div key={label} style={{
                opacity:sc2, transform:`scale(${0.6+sc2*0.4}) translateY(${(1-sc2)*20}px)`,
                background:P.card, border:`1px solid ${P.border}`,
                borderRadius:12, padding:"12px 16px", width:270,
                display:"flex", gap:10, alignItems:"flex-start",
              }}>
                <div style={{ fontSize:24, lineHeight:1, flexShrink:0 }}>{icon}</div>
                <div>
                  <div style={{ color:P.text, fontSize:14, fontWeight:800 }}>{label}</div>
                  <div style={{ color:P.dim, fontSize:11, marginTop:3, fontFamily:MONO }}
                    dangerouslySetInnerHTML={{__html:mathHTML(desc)}}/>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ opacity:fi(frame,dur-200,30), marginTop:30, textAlign:"center" }}>
          <div style={{ background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", borderRadius:16,
            padding:"16px 44px", color:"#fff", fontSize:24, fontWeight:900, boxShadow:"0 0 40px #7c3aed66" }}>
            🏆 Bonne chance à l'examen !
          </div>
          <div style={{ color:P.dim, fontSize:15, marginTop:12 }}>
            Parties 1, 2 et 3 : tous les outils pour maîtriser la géométrie dans l'espace
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function GeoEspaceTerminal3() {
  return (
    <AbsoluteFill style={{ background:P.bg }}>
      <Sequence from={SC.INTRO.s}       durationInFrames={SC.INTRO.d}>
        <IntroScene narrationFile="geo3_narration1.mp3"/>
      </Sequence>
      <Sequence from={SC.SYMET_PT.s}    durationInFrames={SC.SYMET_PT.d}>
        <SymetPtScene narrationFile="geo3_narration2.mp3"/>
      </Sequence>
      <Sequence from={SC.SYMET_PLAN.s}  durationInFrames={SC.SYMET_PLAN.d}>
        <SymetPlanScene narrationFile="geo3_narration3.mp3"/>
      </Sequence>
      <Sequence from={SC.DIST_DROITE.s} durationInFrames={SC.DIST_DROITE.d}>
        <DistDroiteScene narrationFile="geo3_narration4.mp3"/>
      </Sequence>
      <Sequence from={SC.PLAN_3PTS.s}   durationInFrames={SC.PLAN_3PTS.d}>
        <Plan3PtsScene narrationFile="geo3_narration5.mp3"/>
      </Sequence>
      <Sequence from={SC.SECTIONS.s}    durationInFrames={SC.SECTIONS.d}>
        <SectionsScene narrationFile="geo3_narration6.mp3"/>
      </Sequence>
      <Sequence from={SC.DEMO1.s}       durationInFrames={SC.DEMO1.d}>
        <Demo1Scene narrationFile="geo3_narration7.mp3"/>
      </Sequence>
      <Sequence from={SC.TETRA_REG.s}   durationInFrames={SC.TETRA_REG.d}>
        <TetraRegScene narrationFile="geo3_narration8.mp3"/>
      </Sequence>
      <Sequence from={SC.OPTIMIS.s}     durationInFrames={SC.OPTIMIS.d}>
        <OptimisScene narrationFile="geo3_narration9.mp3"/>
      </Sequence>
      <Sequence from={SC.BARYCENTRE.s}  durationInFrames={SC.BARYCENTRE.d}>
        <BarycentreScene narrationFile="geo3_narration10.mp3"/>
      </Sequence>
      <Sequence from={SC.PLAN_MED.s}    durationInFrames={SC.PLAN_MED.d}>
        <PlanMedScene narrationFile="geo3_narration11.mp3"/>
      </Sequence>
      <Sequence from={SC.LIEUX_GEO.s}   durationInFrames={SC.LIEUX_GEO.d}>
        <LieuxGeoScene narrationFile="geo3_narration12.mp3"/>
      </Sequence>
      <Sequence from={SC.DEMO2.s}       durationInFrames={SC.DEMO2.d}>
        <Demo2Scene narrationFile="geo3_narration13.mp3"/>
      </Sequence>
      <Sequence from={SC.METHODES.s}    durationInFrames={SC.METHODES.d}>
        <MethodesScene narrationFile="geo3_narration14.mp3"/>
      </Sequence>
      <Sequence from={SC.OUTRO.s}       durationInFrames={SC.OUTRO.d}>
        <OutroScene narrationFile="geo3_narration15.mp3"/>
      </Sequence>
    </AbsoluteFill>
  );
}

export { GeoEspaceTerminal3 as default };
