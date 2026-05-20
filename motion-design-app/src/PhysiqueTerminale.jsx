import {
  AbsoluteFill, Sequence, Audio, staticFile,
  useCurrentFrame, useVideoConfig,
  interpolate, spring,
} from "remotion";

export const PHYSIQUE_TERMINALE_DURATION = 22320; // ~15min 30s à 24fps

const P = {
  bg:"#070810", surface:"#0d0f1e", card:"#131525",
  board:"#051a2e", boardBorder:"#0e4a7a",
  border:"#1e2340", text:"#e2e8f0", dim:"#4a5568",
  gold:"#fbbf24", blue:"#38bdf8", magic:"#a78bfa",
  red:"#ef4444", green:"#22c55e", orange:"#f97316",
  cyan:"#06b6d4", pink:"#ec4899", lime:"#84cc16",
  ax:"#ef4444", ay:"#22c55e", az:"#3b82f6",
  prof:"#38bdf8", lea:"#4ade80", lucas:"#f97316",
  force:"#ef4444", vel:"#fbbf24", acc:"#a78bfa",
};
const SANS = "'Inter','Segoe UI',Arial,sans-serif";
const MONO = "'JetBrains Mono','Consolas','Courier New',monospace";
const cl = { extrapolateLeft:"clamp", extrapolateRight:"clamp" };
const fi = (f, s=0, d=20) => interpolate(f,[s,s+d],[0,1],cl);
const fo = (f, s, d=20)   => interpolate(f,[s,s+d],[1,0],cl);
const sd = (f,s=0,d=20) => Math.min(fi(f,s,d),fo(f,s+d,20));
const sceneFade = (f,dur) => Math.min(fi(f,0,18),fo(f,dur-18,18));
const lerp = (a,b,t) => a+(b-a)*t;

const SC = {
  INTRO:      {s:0,     d:960 },
  NEWTON:     {s:960,   d:1680},
  PROJECTILE: {s:2640,  d:1680},
  ENERGIE:    {s:4320,  d:1440},
  OSCILLATEUR:{s:5760,  d:1440},
  CIRCUIT_RC: {s:7200,  d:1680},
  OPTIQUE:    {s:8880,  d:1680},
  ONDES:      {s:10560, d:1440},
  YOUNG:      {s:12000, d:1440},
  QUANTIQUE:  {s:13440, d:1440},
  DEMO1:      {s:14880, d:2400},
  RELATIVITE: {s:17280, d:1440},
  METHODES:   {s:18720, d:1440},
  DEMO2:      {s:20160, d:1200},
  OUTRO:      {s:21360, d:960 },
};

// ── 3D projection ──────────────────────────────────────────────
function proj(x,y,z,ry,rx,cx,cy,sc){
  const cosY=Math.cos(ry),sinY=Math.sin(ry);
  const x1=x*cosY+z*sinY, z1=-x*sinY+z*cosY;
  const cosX=Math.cos(rx),sinX=Math.sin(rx);
  const y2=y*cosX-z1*sinX, z2=y*sinX+z1*cosX;
  const fov=900, scale=fov/(fov+z2*sc*0.15+120);
  return {px:cx+x1*sc*scale, py:cy-y2*sc*scale, depth:z2};
}
function arrowPts(x1,y1,x2,y2,s=9){
  const a=Math.atan2(y2-y1,x2-x1);
  return `${x2},${y2} ${x2+s*Math.cos(a+2.6)},${y2+s*Math.sin(a+2.6)} ${x2+s*Math.cos(a-2.6)},${y2+s*Math.sin(a-2.6)}`;
}
function Axes3D({ry,rx,cx=220,cy=200,sc=50,len=3}){
  const O=proj(0,0,0,ry,rx,cx,cy,sc);
  const axes=[
    [proj(len,0,0,ry,rx,cx,cy,sc),P.ax,"x"],
    [proj(0,len,0,ry,rx,cx,cy,sc),P.ay,"y"],
    [proj(0,0,len,ry,rx,cx,cy,sc),P.az,"z"],
  ];
  return(<>
    {axes.map(([pt,col,lbl],i)=>(
      <g key={i}>
        <line x1={O.px} y1={O.py} x2={pt.px} y2={pt.py} stroke={col} strokeWidth={2.5}/>
        <polygon points={arrowPts(O.px,O.py,pt.px,pt.py)} fill={col}/>
        <text x={pt.px+8} y={pt.py+5} fill={col} fontSize={15} fontWeight={800}>{lbl}</text>
      </g>
    ))}
    <circle cx={O.px} cy={O.py} r={4} fill={P.text}/>
    <text x={O.px-14} y={O.py+6} fill={P.dim} fontSize={13}>O</text>
  </>);
}
function Vec3D({from,to,ry,rx,cx,cy,sc,color=P.gold,label,w=2.5,dash=false}){
  const pf=proj(...from,ry,rx,cx,cy,sc);
  const pt=proj(...to,ry,rx,cx,cy,sc);
  return(<>
    <line x1={pf.px} y1={pf.py} x2={pt.px} y2={pt.py} stroke={color} strokeWidth={w}
      strokeDasharray={dash?"6,4":"none"}/>
    {!dash&&<polygon points={arrowPts(pf.px,pf.py,pt.px,pt.py,10)} fill={color}/>}
    {label&&<text x={(pf.px+pt.px)/2+10} y={(pf.py+pt.py)/2-8} fill={color} fontSize={14} fontWeight={700}>{label}</text>}
  </>);
}

// ── Shared UI ──────────────────────────────────────────────────
function Stars({count=50,seed=1}){
  const frame=useCurrentFrame();
  const {width,height}=useVideoConfig();
  return(<>{Array.from({length:count},(_,i)=>{
    const x=((i*137+seed*31)%97)/97*width;
    const y=((i*79+seed*17)%89)/89*height;
    const p=Math.sin((frame+i*13)/28)*0.5+0.5;
    const sz=1.5+((i*11)%5)*0.7;
    return <div key={i} style={{position:"absolute",left:x,top:y,width:sz,height:sz,borderRadius:"50%",background:"#e2e8f0",opacity:0.05+p*0.12}}/>;
  })}</>);
}

function FormulaBoard({frame,formulas=[]}){
  return(
    <div style={{background:P.board,border:`2px solid ${P.boardBorder}`,borderRadius:12,padding:"12px 16px"}}>
      <div style={{color:"#60c8ff",fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:8}}>◆ FORMULES CLÉS</div>
      {formulas.map(({f,text,color="#f0f0e8"},i)=>(
        <div key={i} style={{opacity:fi(frame,f,15),color,fontFamily:MONO,fontSize:15,fontWeight:600,lineHeight:1.8}}
          dangerouslySetInnerHTML={{__html:text}}/>
      ))}
    </div>
  );
}

function Dialogue({frame,dialogues=[]}){
  const cur=[...dialogues].reverse().find(d=>frame>=d.f)||null;
  const bub=(bc,bg)=>({background:bg,border:`2px solid ${bc}`,borderRadius:10,padding:"8px 12px",color:P.text,fontSize:14,lineHeight:1.5});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{background:P.card,borderRadius:12,border:`1px solid ${P.border}`,padding:"12px 14px"}}>
        <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
          <div style={{fontSize:44,lineHeight:1,flexShrink:0}}>👨‍🏫</div>
          <div style={{flex:1}}>
            <div style={{color:P.prof,fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:5}}>PROF. MARTIN</div>
            {cur?.speaker==="prof"
              ?<div style={{...bub(P.prof,"#0a1e35"),opacity:fi(frame,cur.f,10)}} dangerouslySetInnerHTML={{__html:cur.text}}/>
              :<div style={{color:P.dim,fontSize:13}}>…</div>}
          </div>
        </div>
      </div>
      <div style={{background:P.card,borderRadius:12,border:`1px solid ${P.border}`,padding:"12px 14px",display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{fontSize:38,flexShrink:0}}>👩‍🎓</div>
        <div style={{flex:1}}>
          <div style={{color:P.lea,fontSize:11,fontWeight:700,marginBottom:4}}>LÉA</div>
          {cur?.speaker==="lea"&&<div style={{...bub(P.lea,"#0a1f10"),opacity:fi(frame,cur.f,10)}} dangerouslySetInnerHTML={{__html:cur.text}}/>}
        </div>
        <div style={{fontSize:38,flexShrink:0}}>🧑‍🎓</div>
        <div style={{flex:1}}>
          <div style={{color:P.lucas,fontSize:11,fontWeight:700,marginBottom:4}}>LUCAS</div>
          {cur?.speaker==="lucas"&&<div style={{...bub(P.lucas,"#1f0e03"),opacity:fi(frame,cur.f,10)}} dangerouslySetInnerHTML={{__html:cur.text}}/>}
        </div>
      </div>
    </div>
  );
}

function SceneShell({title,subtitle,accent,dur,children,formulas=[],dialogues=[],narration,sfx=[]}){
  const frame=useCurrentFrame();
  const opacity=sceneFade(frame,dur);
  return(
    <AbsoluteFill style={{opacity,background:P.bg,fontFamily:SANS}}>
      {/* Musique de fond douce */}
      <Audio src={staticFile("audio/physique_music.wav")} volume={0.10} startFrom={0} endAt={dur}/>
      {/* Narration voix ff_siwis */}
      {narration&&<Audio src={staticFile(`audio/${narration}.wav`)} volume={1.0}/>}
      {/* Bruitages programmés */}
      {sfx.map(({file,from:f2,vol=0.6},i)=>(
        <Sequence key={i} from={f2} durationInFrames={48}>
          <Audio src={staticFile(`audio/${file}.wav`)} volume={vol}/>
        </Sequence>
      ))}
      <Stars count={40}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,transparent,${accent},transparent)`,boxShadow:`0 0 18px ${accent}`}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",padding:"22px 50px 20px"}}>
        <div style={{marginBottom:10}}>
          <div style={{color:accent,fontSize:13,fontWeight:800,letterSpacing:3,textTransform:"uppercase"}}>Physique · Terminale · {subtitle}</div>
          <div style={{color:P.text,fontSize:40,fontWeight:900,lineHeight:1.1,marginTop:3}}>{title}</div>
          <div style={{marginTop:6,height:3,background:P.border,borderRadius:3}}>
            <div style={{width:`${(frame/dur)*100}%`,height:"100%",background:accent,borderRadius:3,boxShadow:`0 0 6px ${accent}`}}/>
          </div>
        </div>
        <div style={{flex:1,display:"flex",gap:22,minHeight:0}}>
          <div style={{flex:"0 0 560px",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {children}
          </div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:14}}>
            {formulas.length>0&&<FormulaBoard frame={frame} formulas={formulas}/>}
            <Dialogue frame={frame} dialogues={dialogues}/>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 0 — INTRO
// ════════════════════════════════════════════════════════════════
function SceneIntro(){
  const frame=useCurrentFrame();
  const dur=SC.INTRO.d;
  const opacity=sceneFade(frame,dur);
  const {width,height}=useVideoConfig();
  const chapters=[
    {icon:"⚡",title:"Lois de Newton",col:P.red},
    {icon:"🎯",title:"Projectile & Énergie",col:P.gold},
    {icon:"🔄",title:"Oscillateur",col:P.green},
    {icon:"🔌",title:"Circuit RC",col:P.blue},
    {icon:"🔭",title:"Optique – Lentilles",col:P.cyan},
    {icon:"〰️",title:"Ondes & Interférences",col:P.magic},
    {icon:"⚛️",title:"Physique Quantique",col:P.pink},
    {icon:"🚀",title:"Relativité Restreinte",col:P.orange},
  ];
  return(
    <AbsoluteFill style={{opacity,background:P.bg,fontFamily:SANS}}>
      <Audio src={staticFile("audio/physique_music.wav")} volume={0.18} startFrom={0} endAt={dur}/>
      <Audio src={staticFile("audio/narration_intro.wav")} volume={1.0}/>
      <Sequence from={20} durationInFrames={48}>
        <Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.5}/>
      </Sequence>
      <Stars count={80} seed={42}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:5,background:`linear-gradient(90deg,${P.blue},${P.magic},${P.cyan})`,boxShadow:`0 0 30px ${P.blue}`}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:18}}>
        <div style={{opacity:fi(frame,0,30),textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:800,letterSpacing:4,color:P.blue,textTransform:"uppercase",marginBottom:8}}>Cours Complet · Niveau Avancé</div>
          <div style={{fontSize:72,fontWeight:900,background:`linear-gradient(135deg,${P.blue},${P.magic},${P.cyan})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>PHYSIQUE</div>
          <div style={{fontSize:42,fontWeight:700,color:P.text,marginTop:4}}>Terminale Spécialité</div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center",maxWidth:900,opacity:fi(frame,60,40)}}>
          {chapters.map(({icon,title,col},i)=>(
            <div key={i} style={{opacity:fi(frame,80+i*25,20),background:P.card,border:`1px solid ${col}44`,borderRadius:12,padding:"10px 18px",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>{icon}</span>
              <span style={{color:col,fontWeight:700,fontSize:14}}>{title}</span>
            </div>
          ))}
        </div>
        <div style={{opacity:fi(frame,300,40),color:P.dim,fontSize:14,letterSpacing:2,textTransform:"uppercase"}}>15 minutes de démonstrations animées</div>
      </div>
    </AbsoluteFill>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 1 — LOIS DE NEWTON
// ════════════════════════════════════════════════════════════════
function Newton3D({frame}){
  const ry=frame*0.008+0.5;
  const rx=0.35;
  const cx=280, cy=240, sc=55;
  // bloc + forces
  const block=[0,0,0];
  const t=frame/SC.NEWTON.d;
  const showPoids=frame>120, showNorm=frame>200, showFric=frame>300, showAcc=frame>420;
  const pulseP=1+0.05*Math.sin(frame*0.15);
  return(
    <svg width={560} height={480} style={{display:"block"}}>
      {/* plan sol */}
      <polygon points={[
        proj(-3,-0.5,-3,ry,rx,cx,cy,sc),
        proj( 3,-0.5,-3,ry,rx,cx,cy,sc),
        proj( 3,-0.5, 3,ry,rx,cx,cy,sc),
        proj(-3,-0.5, 3,ry,rx,cx,cy,sc),
      ].map(p=>`${p.px},${p.py}`).join(" ")} fill="#0d1a2e" stroke={P.boardBorder} strokeWidth={1.5}/>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} len={2.5}/>
      {/* bloc 3D */}
      {[
        [[-0.6,-0.5,-0.6],[0.6,-0.5,-0.6],[0.6,0.5,-0.6],[-0.6,0.5,-0.6]],
        [[-0.6,-0.5, 0.6],[0.6,-0.5, 0.6],[0.6,0.5, 0.6],[-0.6,0.5, 0.6]],
        [[0.6,-0.5,-0.6],[0.6,-0.5, 0.6],[0.6,0.5, 0.6],[0.6,0.5,-0.6]],
        [[-0.6,0.5,-0.6],[0.6,0.5,-0.6],[0.6,0.5, 0.6],[-0.6,0.5, 0.6]],
      ].map((face,i)=>(
        <polygon key={i} points={face.map(p=>proj(...p,ry,rx,cx,cy,sc)).map(p=>`${p.px},${p.py}`).join(" ")}
          fill={`${["#1e3a5f","#1a3456","#162d4e","#1e4060"][i]}cc`} stroke={P.blue} strokeWidth={1.2}/>
      ))}
      {/* Poids */}
      {showPoids&&<Vec3D from={[0,0,0]} to={[0,-2.2,0]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.force} label="P⃗" w={3}/>}
      {/* Normale */}
      {showNorm&&<Vec3D from={[0,0.5,0]} to={[0,2.7,0]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.green} label="N⃗" w={3}/>}
      {/* Frottement */}
      {showFric&&<Vec3D from={[0,0,0]} to={[-1.8,0,0]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.orange} label="f⃗" w={3}/>}
      {/* Accélération */}
      {showAcc&&<Vec3D from={[0,0.8,0]} to={[2.5,0.8,0]} ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} color={P.magic} label="a⃗" w={3.5}/>}
      {/* Labels lois */}
      {frame>500&&(
        <text x={20} y={430} fill={P.text} fontSize={13} fontFamily={MONO} opacity={fi(frame,500,25)}>
          ΣF⃗ = m·a⃗  ↔  Principe fondamental de la dynamique
        </text>
      )}
    </svg>
  );
}

function SceneNewton(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Lois de Newton" subtitle="Mécanique" accent={P.red} dur={SC.NEWTON.d}
      narration="narration_newton"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_chalk",from:80,vol:0.5},
        {file:"sfx_chalk",from:200,vol:0.5},
        {file:"sfx_chalk",from:360,vol:0.5},
        {file:"sfx_pop",from:500,vol:0.4},
      ]}
      formulas={[
        {f:80,  text:"1ʳᵉ loi : Si ΣF⃗ = 0⃗ → mouvement rectiligne uniforme"},
        {f:200, text:"2ᵉ loi : ΣF⃗ = m·a⃗  (F en N, m en kg, a en m·s⁻²)"},
        {f:360, text:"3ᵉ loi : F⃗<sub>A/B</sub> = −F⃗<sub>B/A</sub>  (action-réaction)"},
        {f:500, text:"Poids : P⃗ = m·g⃗  avec g ≈ 9,81 m·s⁻²"},
        {f:650, text:"Équilibre : N⃗ + P⃗ + f⃗ = 0⃗"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Les lois de Newton gouvernent tout mouvement mécanique à l'échelle humaine."},
        {f:200, speaker:"lea",  text:"Pourquoi dit-on « principe fondamental » ?"},
        {f:300, speaker:"prof", text:"Car ΣF⃗ = m·a⃗ relie directement causes (forces) et effets (accélération)."},
        {f:450, speaker:"lucas",text:"Et si plusieurs forces agissent ?"},
        {f:550, speaker:"prof", text:"On additionne <b>vectoriellement</b> toutes les forces — c'est le principe de superposition."},
        {f:900, speaker:"lea",  text:"La 3ᵉ loi, c'est quand on pose la main sur un mur ?"},
        {f:1000,speaker:"prof", text:"Exactement : le mur pousse ta main avec la même force, en sens opposé !"},
      ]}
    >
      <Newton3D frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 2 — PROJECTILE
// ════════════════════════════════════════════════════════════════
function ProjectileViz({frame}){
  const dur=SC.PROJECTILE.d;
  const t=frame/dur;
  const ry=0.3+frame*0.005;
  const rx=0.28;
  const cx=280, cy=280, sc=45;
  const g=9.81, v0=18, angle=Math.PI/4;
  const vx=v0*Math.cos(angle), vy0=v0*Math.sin(angle);
  const tMax=2*vy0/g;
  const xMax=vx*tMax;
  // trajectoire
  const pts=Array.from({length:60},(_,i)=>{
    const tt=i/59*tMax;
    const x=vx*tt, y=vy0*tt-0.5*g*tt*tt;
    return proj(x*0.2,y*0.2,0,ry,rx,cx,cy,sc);
  });
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.px},${p.py}`).join(" ");
  // position actuelle
  const tCur=((frame%720)/720)*tMax;
  const xCur=vx*tCur, yCur=vy0*tCur-0.5*g*tCur*tCur;
  const pCur=proj(xCur*0.2,yCur*0.2,0,ry,rx,cx,cy,sc);
  const pO=proj(0,0,0,ry,rx,cx,cy,sc);
  return(
    <svg width={560} height={480} style={{display:"block"}}>
      <polygon points={[
        proj(-0.5,0,-1,ry,rx,cx,cy,sc),proj(8,0,-1,ry,rx,cx,cy,sc),
        proj(8,0,1,ry,rx,cx,cy,sc),proj(-0.5,0,1,ry,rx,cx,cy,sc),
      ].map(p=>`${p.px},${p.py}`).join(" ")} fill="#0a1520" stroke={P.boardBorder} strokeWidth={1}/>
      <Axes3D ry={ry} rx={rx} cx={cx} cy={cy} sc={sc} len={2.2}/>
      {/* trajectoire */}
      <path d={path} fill="none" stroke={P.gold} strokeWidth={2} strokeDasharray="5,3" opacity={0.7}/>
      {/* Hauteur max */}
      {frame>400&&(
        <line x1={proj(xMax*0.1,yCur>0?Math.max(yCur,vy0*vy0/(2*g)):vy0*vy0/(2*g),0,ry,rx,cx,cy,sc).px}
              y1={proj(xMax*0.1,vy0*vy0/(2*g)*0.2,0,ry,rx,cx,cy,sc).py}
              x2={pO.px} y2={pO.py} stroke={P.dim} strokeWidth={1} strokeDasharray="4,3"/>
      )}
      {/* vecteur vitesse */}
      {frame>200&&(()=>{
        const vyCur=vy0-g*tCur;
        const scale=2.5;
        const endX=proj((xCur+vx*scale)*0.2,(yCur+vyCur*scale)*0.2,0,ry,rx,cx,cy,sc);
        return <><line x1={pCur.px} y1={pCur.py} x2={endX.px} y2={endX.py} stroke={P.vel} strokeWidth={3}/>
          <polygon points={arrowPts(pCur.px,pCur.py,endX.px,endX.py,10)} fill={P.vel}/>
          <text x={endX.px+8} y={endX.py} fill={P.vel} fontSize={13} fontWeight={700}>v⃗</text></>;
      })()}
      {/* projectile */}
      <circle cx={pCur.px} cy={pCur.py} r={8} fill={P.red} style={{filter:"drop-shadow(0 0 8px #ef4444)"}}/>
      {/* angle */}
      {frame>50&&(
        <text x={pO.px+18} y={pO.py-12} fill={P.cyan} fontSize={14} fontWeight={700}>θ = 45°</text>
      )}
      {/* portée */}
      {frame>700&&(
        <text x={20} y={450} fill={P.text} fontSize={13} fontFamily={MONO}>
          Portée = v₀²·sin(2θ)/g = {(xMax).toFixed(1)} m
        </text>
      )}
    </svg>
  );
}

function SceneProjectile(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Mouvement du Projectile" subtitle="Mécanique" accent={P.gold} dur={SC.PROJECTILE.d}
      narration="narration_projectile"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_chalk",from:60,vol:0.5},
        {file:"sfx_chalk",from:160,vol:0.5},
        {file:"sfx_pop",from:700,vol:0.4},
      ]}
      formulas={[
        {f:60,  text:"x(t) = v₀·cos(θ)·t"},
        {f:160, text:"y(t) = v₀·sin(θ)·t − ½g·t²"},
        {f:300, text:"vₓ(t) = v₀·cos(θ)  (constante)"},
        {f:400, text:"vᵧ(t) = v₀·sin(θ) − g·t"},
        {f:550, text:"H<sub>max</sub> = v₀²·sin²θ / (2g)"},
        {f:700, text:"Portée L = v₀²·sin(2θ) / g"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Un projectile lancé à v₀ = 18 m/s avec θ = 45° — on décompose le mouvement en x et y."},
        {f:200, speaker:"lucas",text:"Pourquoi le mouvement horizontal est-il uniforme ?"},
        {f:300, speaker:"prof", text:"En l'absence de frottement, aucune force horizontale : aₓ = 0, donc vₓ = constante."},
        {f:550, speaker:"lea",  text:"La portée est maximale pour θ = 45° ?"},
        {f:680, speaker:"prof", text:"Oui ! sin(2θ) est maximal quand 2θ = 90°, soit θ = 45°. C'est le meilleur angle de tir."},
        {f:900, speaker:"lucas",text:"Et si v₀ double, la portée quadruple ?"},
        {f:1000,speaker:"prof", text:"Exactement : L ∝ v₀². C'est un résultat important pour les examens !"},
      ]}
    >
      <ProjectileViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 3 — TRAVAIL & ÉNERGIE
// ════════════════════════════════════════════════════════════════
function EnergieViz({frame}){
  const dur=SC.ENERGIE.d;
  const t=frame/dur;
  // simulation bille qui descend une rampe
  const progress=Math.min(t*1.4,1);
  const h=200*(1-progress); // hauteur
  const v=Math.sqrt(2*9.81*200*progress/100); // vitesse prop
  const Ec=Math.min(progress*100,100);
  const Ep=100-Ec;
  const Em=100;
  const bx=80+progress*300;
  const by=350-progress*180;
  return(
    <svg width={560} height={420} style={{display:"block"}}>
      {/* rampe */}
      <path d="M 60 80 L 420 300 L 420 380 L 60 380 Z" fill="#0d1a2e" stroke={P.boardBorder} strokeWidth={2}/>
      <line x1={60} y1={80} x2={420} y2={300} stroke={P.blue} strokeWidth={3}/>
      {/* hauteur */}
      {frame>60&&(
        <>
          <line x1={60} y1={by} x2={60} y2={300} stroke={P.dim} strokeWidth={1} strokeDasharray="5,3"/>
          <text x={25} y={(by+300)/2} fill={P.cyan} fontSize={13} fontWeight={700}>h</text>
        </>
      )}
      {/* bille */}
      <circle cx={bx} cy={by} r={14} fill={P.red} style={{filter:"drop-shadow(0 0 10px #ef4444)"}}/>
      {/* barres énergie */}
      {frame>100&&(
        <g transform="translate(460,60)">
          {[
            {label:"Ep",val:Ep,color:P.blue,y:0},
            {label:"Ec",val:Ec,color:P.gold,y:100},
            {label:"Em",val:Em,color:P.green,y:200},
          ].map(({label,val,color,y})=>(
            <g key={label} transform={`translate(0,${y})`}>
              <rect x={0} y={0} width={70} height={22} rx={4} fill={P.surface} stroke={P.border}/>
              <rect x={0} y={0} width={val*0.7} height={22} rx={4} fill={color} opacity={0.85}/>
              <text x={75} y={15} fill={color} fontSize={13} fontWeight={700}>{label}</text>
              <text x={35} y={15} fill="#fff" fontSize={11} fontWeight={600} textAnchor="middle">{Math.round(val)}%</text>
            </g>
          ))}
          <text x={35} y={270} fill={P.dim} fontSize={11} textAnchor="middle">Conservation</text>
          <text x={35} y={285} fill={P.dim} fontSize={11} textAnchor="middle">de l'énergie</text>
        </g>
      )}
      {/* flèche poids */}
      {frame>200&&(
        <>
          <line x1={bx} y1={by+14} x2={bx} y2={by+60} stroke={P.force} strokeWidth={2.5}/>
          <polygon points={arrowPts(bx,by+14,bx,by+60,8)} fill={P.force}/>
          <text x={bx+8} y={by+50} fill={P.force} fontSize={13} fontWeight={700}>P⃗</text>
        </>
      )}
      {/* travail */}
      {frame>400&&(
        <text x={30} y={400} fill={P.gold} fontSize={14} fontFamily={MONO} opacity={fi(frame,400,25)}>
          W(P⃗) = mgh = ΔEc  ✓ Théorème travail-énergie
        </text>
      )}
    </svg>
  );
}

function SceneEnergie(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Travail & Énergie" subtitle="Mécanique – Énergie" accent={P.green} dur={SC.ENERGIE.d}
      narration="narration_energie"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_chalk",from:60,vol:0.5},
        {file:"sfx_chalk",from:320,vol:0.5},
        {file:"sfx_pop",from:480,vol:0.4},
      ]}
      formulas={[
        {f:60,  text:"Éc = ½·m·v²  (énergie cinétique)"},
        {f:180, text:"Ép = m·g·h  (énergie potentielle de pesanteur)"},
        {f:320, text:"Em = Éc + Ép  (énergie mécanique)"},
        {f:480, text:"W(F⃗) = F·d·cos(α)  (travail d'une force)"},
        {f:650, text:"Thm travail-énergie : W<sub>tot</sub> = ΔÉc"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Une bille dévale une rampe : observons la conversion entre énergie potentielle et cinétique."},
        {f:180, speaker:"lea",  text:"L'énergie mécanique reste constante tout au long ?"},
        {f:280, speaker:"prof", text:"Oui, sans frottement : Em = Éc + Ép = constante. C'est la conservation de l'énergie mécanique."},
        {f:480, speaker:"lucas",text:"Et le travail du poids vaut combien ?"},
        {f:580, speaker:"prof", text:"W(P) = mgh — le poids travaille positivement quand la bille descend de h."},
        {f:900, speaker:"lea",  text:"En présence de frottements, que se passe-t-il ?"},
        {f:1000,speaker:"prof", text:"Em diminue : l'énergie est dissipée en chaleur. ΔEm = W<sub>frottements</sub> < 0."},
      ]}
    >
      <EnergieViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 4 — OSCILLATEUR MÉCANIQUE
// ════════════════════════════════════════════════════════════════
function OscillateurViz({frame}){
  const dur=SC.OSCILLATEUR.d;
  const omega=2*Math.PI/96; // période ≈ 4s à 24fps
  const x=120*Math.cos(omega*frame);
  const cx=280;
  const equilib=280;
  const ballX=equilib+x;
  // courbe x(t)
  const pts=Array.from({length:200},(_,i)=>{
    const t=i/199*dur;
    const xx=120*Math.cos(omega*t);
    return {sx:80+i*(400/199), sy:360+xx*0.5};
  });
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.sx},${p.sy}`).join(" ");
  const cursorX=80+(frame/dur)*400;
  return(
    <svg width={560} height={430} style={{display:"block"}}>
      {/* mur */}
      <rect x={50} y={80} width={15} height={160} fill={P.surface} stroke={P.border} strokeWidth={2}/>
      {/* ressort */}
      {Array.from({length:20},(_,i)=>{
        const x0=65+i*(ballX-75)/20;
        const x1=65+(i+1)*(ballX-75)/20;
        const mid=(x0+x1)/2;
        const amp=(i%2===0?12:-12);
        return <polyline key={i} points={`${x0},${160} ${mid},${160+amp} ${x1},${160}`} fill="none" stroke={P.gold} strokeWidth={2}/>;
      })}
      {/* masse */}
      <rect x={ballX-22} y={138} width={44} height={44} rx={6} fill={P.blue} stroke="#60a8ff" strokeWidth={2} style={{filter:"drop-shadow(0 0 8px #38bdf8)"}}/>
      <text x={ballX} y={165} fill="#fff" fontSize={13} fontWeight={700} textAnchor="middle">m</text>
      {/* position équilibre */}
      <line x1={equilib} y1={90} x2={equilib} y2={200} stroke={P.dim} strokeWidth={1} strokeDasharray="5,3"/>
      <text x={equilib} y={85} fill={P.dim} fontSize={12} textAnchor="middle">x = 0</text>
      {/* position actuelle */}
      {frame>30&&(
        <text x={ballX} y={200} fill={P.green} fontSize={13} fontWeight={700} textAnchor="middle">
          x = {(x/100).toFixed(2)} m
        </text>
      )}
      {/* graphe x(t) */}
      {frame>60&&(
        <>
          <text x={80} y={295} fill={P.dim} fontSize={12}>x(t)</text>
          <line x1={80} y1={360} x2={480} y2={360} stroke={P.dim} strokeWidth={1}/>
          <path d={path} fill="none" stroke={P.magic} strokeWidth={2} opacity={0.8}/>
          <line x1={cursorX} y1={295} x2={cursorX} y2={420} stroke={P.cyan} strokeWidth={1.5} strokeDasharray="4,3"/>
        </>
      )}
      {/* force rappel */}
      {frame>200&&x!==0&&(
        <>
          <line x1={ballX} y1={160} x2={equilib} y2={160} stroke={P.red} strokeWidth={3}/>
          <polygon points={arrowPts(ballX,160,equilib,160,10)} fill={P.red}/>
          <text x={(ballX+equilib)/2} y={150} fill={P.red} fontSize={13} fontWeight={700}>F⃗ = −kx</text>
        </>
      )}
    </svg>
  );
}

function SceneOscillateur(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Oscillateur Mécanique" subtitle="Mécanique – Oscillations" accent={P.magic} dur={SC.OSCILLATEUR.d}
      narration="narration_oscillateur"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_spring",from:30,vol:0.55},
        {file:"sfx_spring",from:120,vol:0.45},
        {file:"sfx_spring",from:240,vol:0.45},
        {file:"sfx_chalk",from:60,vol:0.4},
        {file:"sfx_chalk",from:360,vol:0.4},
      ]}
      formulas={[
        {f:60,  text:"Loi de Hooke : F⃗ = −k·x⃗  (force de rappel)"},
        {f:200, text:"x(t) = X<sub>m</sub>·cos(ω₀t + φ)"},
        {f:360, text:"ω₀ = √(k/m)  (pulsation propre)"},
        {f:500, text:"T₀ = 2π/ω₀ = 2π√(m/k)"},
        {f:680, text:"Énergie totale : E = ½·k·X<sub>m</sub>²  (constante)"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Un bloc de masse m relié à un ressort de raideur k — l'oscillateur harmonique."},
        {f:200, speaker:"lea",  text:"La force est toujours dirigée vers l'équilibre ?"},
        {f:300, speaker:"prof", text:"Oui, c'est la caractéristique d'un oscillateur : force de rappel proportionnelle à l'écart."},
        {f:500, speaker:"lucas",text:"Si je double la masse, que devient la période ?"},
        {f:620, speaker:"prof", text:"T₀ = 2π√(m/k) → T₀ est multipliée par √2 ≈ 1,41. La masse plus lourde oscille plus lentement."},
        {f:900, speaker:"lea",  text:"Et si on ajoute un amortisseur ?"},
        {f:1000,speaker:"prof", text:"L'oscillateur amorti : l'amplitude décroît exponentiellement. On sort du régime harmonique pur."},
      ]}
    >
      <OscillateurViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 5 — CIRCUIT RC
// ════════════════════════════════════════════════════════════════
function CircuitRCViz({frame}){
  const dur=SC.CIRCUIT_RC.d;
  const tau=200; // frames
  const E=12, R=10, C=20; // valeurs symboliques
  const showCharge=frame<dur*0.55;
  const t=showCharge?frame:frame-dur*0.55;
  const Uc=showCharge
    ? E*(1-Math.exp(-frame/tau))
    : E*Math.exp(-(frame-dur*0.55)/(tau));
  const Ur=E-Uc;
  // tracé courbe
  const pts=Array.from({length:frame+1},(_,i)=>{
    const uu=showCharge?E*(1-Math.exp(-i/tau)):E*Math.exp(-(i-0)/(tau));
    return {sx:60+i*(440/(dur*0.55)), sy:340-uu*20};
  });
  const maxPts=pts.slice(0,Math.min(pts.length,300));
  const path=maxPts.map((p,i)=>`${i===0?"M":"L"}${p.sx},${p.sy}`).join(" ");
  return(
    <svg width={560} height={420} style={{display:"block"}}>
      {/* schéma circuit */}
      <g transform="translate(30,20)">
        {/* fils */}
        <polyline points="60,60 60,20 300,20 300,60" fill="none" stroke={P.text} strokeWidth={2}/>
        <polyline points="60,140 60,180 300,180 300,140" fill="none" stroke={P.text} strokeWidth={2}/>
        {/* Résistance */}
        <rect x={40} y={60} width={40} height={80} rx={4} fill={P.surface} stroke={P.orange} strokeWidth={2}/>
        <text x={60} y={105} fill={P.orange} fontSize={12} fontWeight={700} textAnchor="middle">R</text>
        {/* Générateur */}
        <circle cx={300} cy={100} r={40} fill={P.surface} stroke={P.green} strokeWidth={2}/>
        <text x={300} y={97} fill={P.green} fontSize={14} fontWeight={700} textAnchor="middle">E</text>
        <text x={300} y={113} fill={P.green} fontSize={11} textAnchor="middle">{E}V</text>
        {/* Condensateur */}
        <line x1={50} y1={220} x2={70} y2={220} stroke={P.blue} strokeWidth={2.5}/>
        <line x1={70} y1={205} x2={70} y2={235} stroke={P.blue} strokeWidth={3}/>
        <line x1={76} y1={205} x2={76} y2={235} stroke={P.blue} strokeWidth={3}/>
        <line x1={76} y1={220} x2={96} y2={220} stroke={P.blue} strokeWidth={2.5}/>
        <text x={73} y={255} fill={P.blue} fontSize={12} fontWeight={700} textAnchor="middle">C</text>
        {/* interrupteur */}
        <circle cx={180} cy={20} r={5} fill={P.dim} stroke={P.text}/>
        <circle cx={210} cy={20} r={5} fill={P.dim} stroke={P.text}/>
        <line x1={185} y1={20} x2={205} y2={14} stroke={P.gold} strokeWidth={2.5}/>
        <text x={195} y={12} fill={P.gold} fontSize={11} textAnchor="middle">K</text>
      </g>
      {/* tension Uc */}
      <text x={280} y={55} fill={P.blue} fontSize={18} fontWeight={800} textAnchor="middle">
        Uc = {Uc.toFixed(2)} V
      </text>
      {/* courbe */}
      {frame>30&&(
        <>
          <line x1={60} y1={340} x2={500} y2={340} stroke={P.dim} strokeWidth={1}/>
          <line x1={60} y1={100} x2={60} y2={345} stroke={P.dim} strokeWidth={1}/>
          <path d={path} fill="none" stroke={P.blue} strokeWidth={2.5}/>
          <text x={62} y={96} fill={P.dim} fontSize={11}>E={E}V</text>
          <line x1={60} y1={100} x2={500} y2={100} stroke={P.dim} strokeWidth={1} strokeDasharray="4,3"/>
          {/* tau marker */}
          {frame>tau&&(
            <>
              <line x1={60+tau*(440/(dur*0.55))} y1={100} x2={60+tau*(440/(dur*0.55))} y2={345} stroke={P.gold} strokeWidth={1} strokeDasharray="4,3"/>
              <text x={60+tau*(440/(dur*0.55))} y={355} fill={P.gold} fontSize={11} textAnchor="middle">τ=RC</text>
              <circle cx={60+tau*(440/(dur*0.55))} cy={340-0.632*E*20} r={4} fill={P.gold}/>
            </>
          )}
          <text x={500} y={355} fill={P.dim} fontSize={11}>t</text>
        </>
      )}
    </svg>
  );
}

function SceneCircuitRC(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Circuit RC – Charge & Décharge" subtitle="Électrocinétique" accent={P.blue} dur={SC.CIRCUIT_RC.d}
      narration="narration_circuit_rc"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_electric",from:20,vol:0.55},
        {file:"sfx_chalk",from:60,vol:0.4},
        {file:"sfx_electric",from:300,vol:0.40},
        {file:"sfx_pop",from:500,vol:0.4},
      ]}
      formulas={[
        {f:60,  text:"Charge : Uc(t) = E·(1 − e<sup>−t/τ</sup>)"},
        {f:200, text:"Décharge : Uc(t) = E·e<sup>−t/τ</sup>"},
        {f:350, text:"Constante de temps : τ = R·C"},
        {f:500, text:"À t = τ : Uc = 0,63·E  (charge) / 0,37·E (décharge)"},
        {f:680, text:"Équation diff : R·C·dU/dt + U = E"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Le circuit RC est le modèle fondamental de l'électronique analogique."},
        {f:200, speaker:"lucas",text:"Pourquoi la courbe s'aplatit-elle ?"},
        {f:320, speaker:"prof", text:"Quand Uc ≈ E, la différence de potentiel est faible : le courant i = (E−Uc)/R tend vers 0."},
        {f:500, speaker:"lea",  text:"Que représente physiquement τ = RC ?"},
        {f:620, speaker:"prof", text:"C'est le temps nécessaire pour atteindre 63% de la charge totale. Plus R ou C est grand, plus c'est lent."},
        {f:900, speaker:"lucas",text:"Comment mesure-t-on τ expérimentalement ?"},
        {f:1020,speaker:"prof", text:"On lit le temps où Uc = 0,63·E sur l'oscilloscope — ou on calcule la pente à l'origine."},
      ]}
    >
      <CircuitRCViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 6 — OPTIQUE / LENTILLES
// ════════════════════════════════════════════════════════════════
function LentilleViz({frame}){
  const dur=SC.OPTIQUE.d;
  const cx=280, f=120; // focale
  const showObj=frame>30;
  const showRays=frame>120;
  const showImage=frame>280;
  // objet à OA = -200 → image à OA' = 1/(1/f+1/200) hmm
  // Relation conjuguée : 1/OA' - 1/OA = 1/f'
  // OA = -200, f' = 120 → 1/OA' = 1/120 + 1/(-200) = ... non
  // 1/OA' - 1/OA = 1/f' → 1/OA' = 1/f' + 1/OA = 1/120 + 1/(-200) = (200-120)/(120*200) ...
  // = (200-120)/(24000) = 80/24000 = 1/300
  // OA' = 300 → image réelle à droite
  const OA=-200, fp=120;
  const OA_prime=1/(1/fp+1/OA); // ≈ 300
  const grandissement=-OA_prime/OA; // ≈ -1.5
  const objH=60, objX=cx+OA*0.4, imgX=cx+OA_prime*0.4;
  const imgH=objH*Math.abs(grandissement);
  const lensX=cx;
  const y0=260; // axe optique y
  return(
    <svg width={560} height={420} style={{display:"block"}}>
      {/* axe optique */}
      <line x1={20} y1={y0} x2={540} y2={y0} stroke={P.dim} strokeWidth={1.5} strokeDasharray="8,4"/>
      {/* lentille */}
      <ellipse cx={lensX} cy={y0} rx={8} ry={90} fill="#38bdf822" stroke={P.blue} strokeWidth={2.5}/>
      <text x={lensX} y={y0+110} fill={P.blue} fontSize={13} fontWeight={700} textAnchor="middle">Lentille convergente</text>
      <text x={lensX} y={y0+125} fill={P.blue} fontSize={12} textAnchor="middle">f' = {fp} mm</text>
      {/* foyers */}
      <circle cx={lensX+fp*0.4} cy={y0} r={4} fill={P.gold}/>
      <text x={lensX+fp*0.4} y={y0+16} fill={P.gold} fontSize={12} textAnchor="middle">F'</text>
      <circle cx={lensX-fp*0.4} cy={y0} r={4} fill={P.gold}/>
      <text x={lensX-fp*0.4} y={y0+16} fill={P.gold} fontSize={12} textAnchor="middle">F</text>
      {/* objet */}
      {showObj&&(
        <>
          <line x1={objX} y1={y0} x2={objX} y2={y0-objH} stroke={P.orange} strokeWidth={3}/>
          <polygon points={arrowPts(objX,y0,objX,y0-objH,8)} fill={P.orange}/>
          <text x={objX} y={y0+16} fill={P.orange} fontSize={13} textAnchor="middle">A</text>
          <text x={objX} y={y0-objH-8} fill={P.orange} fontSize={13} textAnchor="middle">B</text>
        </>
      )}
      {/* rayons */}
      {showRays&&(
        <>
          {/* rayon parallèle à l'axe → passe par F' */}
          <polyline points={`${objX},${y0-objH} ${lensX},${y0-objH} ${lensX+200},${y0-objH+(y0-objH)*(200/(lensX+200-lensX+(fp*0.4)))}`}
            fill="none" stroke={P.red} strokeWidth={1.5} strokeDasharray="5,3" opacity={0.8}/>
          <line x1={objX} y1={y0-objH} x2={lensX} y2={y0-objH} stroke={P.red} strokeWidth={1.8}/>
          <line x1={lensX} y1={y0-objH} x2={imgX} y2={y0+imgH} stroke={P.red} strokeWidth={1.8}/>
          {/* rayon passant par centre optique */}
          <line x1={objX} y1={y0-objH} x2={imgX} y2={y0+imgH} stroke={P.green} strokeWidth={1.8}/>
        </>
      )}
      {/* image */}
      {showImage&&(
        <>
          <line x1={imgX} y1={y0} x2={imgX} y2={y0+imgH} stroke={P.cyan} strokeWidth={2.5} strokeDasharray="none"/>
          <polygon points={arrowPts(imgX,y0,imgX,y0+imgH,8)} fill={P.cyan}/>
          <text x={imgX} y={y0-12} fill={P.cyan} fontSize={13} textAnchor="middle">A'</text>
          <text x={imgX} y={y0+imgH+16} fill={P.cyan} fontSize={13} textAnchor="middle">B'</text>
          <text x={imgX} y={y0+imgH+30} fill={P.dim} fontSize={11} textAnchor="middle">Image réelle, inversée</text>
        </>
      )}
      {/* valeurs */}
      {frame>400&&(
        <text x={20} y={400} fill={P.text} fontSize={13} fontFamily={MONO} opacity={fi(frame,400,25)}>
          OA' ≈ {OA_prime.toFixed(0)} mm  |  γ = OA'/OA ≈ {grandissement.toFixed(2)}
        </text>
      )}
    </svg>
  );
}

function SceneOptique(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Lentilles & Optique Géométrique" subtitle="Optique" accent={P.cyan} dur={SC.OPTIQUE.d}
      narration="narration_optique"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_chalk",from:60,vol:0.4},
        {file:"sfx_photon",from:120,vol:0.5},
        {file:"sfx_photon",from:280,vol:0.5},
        {file:"sfx_chalk",from:520,vol:0.4},
      ]}
      formulas={[
        {f:60,  text:"Vergence : V = 1/f'  (en dioptries, f' en mètres)"},
        {f:200, text:"Relation conjuguée : 1/OA' − 1/OA = 1/f'"},
        {f:350, text:"Grandissement : γ = AB'/AB = OA'/OA"},
        {f:520, text:"Snell-Descartes : n₁·sin(i₁) = n₂·sin(i₂)"},
        {f:700, text:"Réflexion totale si i₁ > i<sub>lim</sub> = arcsin(n₂/n₁)"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Les lentilles convergentes forment des images à travers la réfraction de la lumière."},
        {f:200, speaker:"lucas",text:"Comment trouver la position de l'image sans dessin ?"},
        {f:320, speaker:"prof", text:"On applique la relation conjuguée : 1/OA' = 1/f' + 1/OA. Ici OA = −200 mm, f' = 120 mm."},
        {f:520, speaker:"lea",  text:"Et si l'objet est entre F et la lentille ?"},
        {f:640, speaker:"prof", text:"L'image devient virtuelle, du même côté que l'objet — c'est le principe de la loupe ! γ > 1."},
        {f:900, speaker:"lucas",text:"La fibre optique utilise la réflexion totale ?"},
        {f:1020,speaker:"prof", text:"Exactement ! Si i > i_lim, 100% de la lumière est réfléchie. C'est le fondement des télécommunications modernes."},
      ]}
    >
      <LentilleViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 7 — ONDES MÉCANIQUES
// ════════════════════════════════════════════════════════════════
function OndesViz({frame}){
  const dur=SC.ONDES.d;
  const lambda=80, T_wave=48;
  const A=40;
  const v_wave=lambda/T_wave;
  const showSecond=frame>300;
  return(
    <svg width={560} height={430} style={{display:"block"}}>
      {/* onde 1 — propagation */}
      <text x={20} y={50} fill={P.magic} fontSize={14} fontWeight={700}>Onde progressive</text>
      {Array.from({length:480},(_,i)=>{
        const x=40+i;
        const y=100+A*Math.sin(2*Math.PI*(i/lambda-frame/T_wave));
        const nextY=100+A*Math.sin(2*Math.PI*((i+1)/lambda-frame/T_wave));
        return i<479?<line key={i} x1={x} y1={y} x2={x+1} y2={nextY} stroke={P.magic} strokeWidth={2} opacity={0.9}/>:null;
      })}
      {/* longueur d'onde */}
      {frame>60&&(
        <>
          <line x1={40} y1={155} x2={40+lambda} y2={155} stroke={P.gold} strokeWidth={1.5}/>
          <line x1={40} y1={148} x2={40} y2={162} stroke={P.gold} strokeWidth={1.5}/>
          <line x1={40+lambda} y1={148} x2={40+lambda} y2={162} stroke={P.gold} strokeWidth={1.5}/>
          <text x={40+lambda/2} y={172} fill={P.gold} fontSize={13} textAnchor="middle">λ</text>
        </>
      )}
      {/* vitesse */}
      {frame>120&&(
        <>
          <line x1={320} y1={100} x2={390} y2={100} stroke={P.vel} strokeWidth={2.5}/>
          <polygon points={arrowPts(320,100,390,100,10)} fill={P.vel}/>
          <text x={355} y={92} fill={P.vel} fontSize={13} fontWeight={700}>v</text>
        </>
      )}
      {/* deux sources + interférences */}
      {showSecond&&(
        <>
          <text x={20} y={230} fill={P.cyan} fontSize={14} fontWeight={700} opacity={fi(frame,300,30)}>
            Superposition de deux ondes
          </text>
          {Array.from({length:480},(_,i)=>{
            const x=40+i;
            const y1v=40*Math.sin(2*Math.PI*(i/lambda-frame/T_wave));
            const y2v=40*Math.sin(2*Math.PI*(i/lambda-frame/T_wave)+Math.PI/3);
            const ysum=(y1v+y2v);
            const y=340+ysum*0.7;
            const yprev=340+(40*Math.sin(2*Math.PI*((i-1)/lambda-frame/T_wave))+40*Math.sin(2*Math.PI*((i-1)/lambda-frame/T_wave)+Math.PI/3))*0.7;
            return i>0?<line key={i} x1={x-1} y1={yprev} x2={x} y2={y} stroke={P.cyan} strokeWidth={2}/>:null;
          })}
          <text x={20} y={400} fill={P.dim} fontSize={12} opacity={fi(frame,400,30)}>
            Onde résultante A = 2·A₀·cos(Δφ/2)
          </text>
        </>
      )}
    </svg>
  );
}

function SceneOndes(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Ondes Mécaniques" subtitle="Ondes" accent={P.magic} dur={SC.ONDES.d}
      narration="narration_ondes"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_chalk",from:60,vol:0.4},
        {file:"sfx_pop",from:300,vol:0.4},
        {file:"sfx_chalk",from:480,vol:0.4},
      ]}
      formulas={[
        {f:60,  text:"y(x,t) = A·cos(ωt − kx + φ₀)"},
        {f:180, text:"v = λ·f = λ/T  (célérité de l'onde)"},
        {f:320, text:"k = 2π/λ  (vecteur d'onde)"},
        {f:480, text:"Retard temporel : Δt = d/v"},
        {f:650, text:"Déphasage : Δφ = 2π·d/λ"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Une onde transporte de l'énergie sans déplacement de matière — seule la perturbation se propage."},
        {f:180, speaker:"lea",  text:"Quelle est la différence entre période T et longueur d'onde λ ?"},
        {f:300, speaker:"prof", text:"T est la période temporelle (en s), λ est la période spatiale (en m). Liées par v = λ/T."},
        {f:480, speaker:"lucas",text:"Le déphasage Δφ dépend de la distance ?"},
        {f:600, speaker:"prof", text:"Oui : deux points distants de d ont un déphasage Δφ = 2πd/λ. Si d = λ, Δφ = 2π → même phase."},
      ]}
    >
      <OndesViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 8 — FENTES DE YOUNG
// ════════════════════════════════════════════════════════════════
function YoungViz({frame}){
  const dur=SC.YOUNG.d;
  const D=300, a=20, lambda=0.5; // mm
  const frange=lambda*D/a; // en mm
  const W=440, H=380;
  const ecranX=W-40;
  const fentesX=120;
  // figure d'interférences
  return(
    <svg width={560} height={420} style={{display:"block"}}>
      {/* source */}
      <circle cx={30} cy={H/2} r={10} fill={P.gold} style={{filter:"drop-shadow(0 0 12px #fbbf24)"}}/>
      <text x={30} y={H/2+25} fill={P.gold} fontSize={11} textAnchor="middle">Source</text>
      {/* fentes */}
      <rect x={fentesX} y={20} width={8} height={H/2-30} rx={2} fill={P.surface} stroke={P.text} strokeWidth={2}/>
      <rect x={fentesX} y={H/2+10} width={8} height={H/2-30} rx={2} fill={P.surface} stroke={P.text} strokeWidth={2}/>
      <circle cx={fentesX+4} cy={H/2-10} r={5} fill={P.cyan} style={{filter:"drop-shadow(0 0 6px #06b6d4)"}}/>
      <circle cx={fentesX+4} cy={H/2+10} r={5} fill={P.cyan} style={{filter:"drop-shadow(0 0 6px #06b6d4)"}}/>
      <text x={fentesX+4} y={H-15} fill={P.text} fontSize={11} textAnchor="middle">Fentes a</text>
      {/* écran */}
      <rect x={ecranX} y={20} width={8} height={H-40} rx={2} fill={P.surface} stroke={P.dim} strokeWidth={1}/>
      {/* figure d'interférences */}
      {Array.from({length:H-40},(_,j)=>{
        const y=20+j;
        const theta=Math.atan((y-H/2)/(D*2));
        const delta=(a*0.5)*Math.sin(theta)/lambda;
        const I=Math.pow(Math.cos(Math.PI*delta),2);
        const bright=Math.round(I*255);
        return(
          <rect key={j} x={ecranX+8} y={y} width={30} height={1}
            fill={`rgba(${bright},${bright/3+bright*0.6},${bright},${0.9})`}/>
        );
      })}
      {/* rayon du haut */}
      {frame>100&&(
        <line x1={fentesX+4} y1={H/2-10} x2={ecranX} y2={H/2-frange*2}
          stroke={P.cyan} strokeWidth={1} opacity={0.5} strokeDasharray="4,3"/>
      )}
      {frame>100&&(
        <line x1={fentesX+4} y1={H/2+10} x2={ecranX} y2={H/2-frange*2}
          stroke={P.cyan} strokeWidth={1} opacity={0.5} strokeDasharray="4,3"/>
      )}
      {/* brace frange */}
      {frame>200&&(
        <>
          <line x1={ecranX+40} y1={H/2} x2={ecranX+40} y2={H/2-frange*4}
            stroke={P.gold} strokeWidth={1.5}/>
          <line x1={ecranX+38} y1={H/2} x2={ecranX+42} y2={H/2} stroke={P.gold} strokeWidth={1.5}/>
          <line x1={ecranX+38} y1={H/2-frange*4} x2={ecranX+42} y2={H/2-frange*4} stroke={P.gold} strokeWidth={1.5}/>
          <text x={ecranX+52} y={H/2-frange*2} fill={P.gold} fontSize={13} fontWeight={700} dominantBaseline="middle">i</text>
        </>
      )}
      {/* distance D */}
      <line x1={fentesX} y1={H-10} x2={ecranX} y2={H-10} stroke={P.dim} strokeWidth={1}/>
      <text x={(fentesX+ecranX)/2} y={H-2} fill={P.dim} fontSize={11} textAnchor="middle">D</text>
    </svg>
  );
}

function SceneYoung(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Fentes de Young – Interférences" subtitle="Ondes – Interférences" accent={P.cyan} dur={SC.YOUNG.d}
      narration="narration_young"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_photon",from:30,vol:0.5},
        {file:"sfx_photon",from:100,vol:0.45},
        {file:"sfx_chalk",from:200,vol:0.4},
        {file:"sfx_pop",from:360,vol:0.4},
      ]}
      formulas={[
        {f:60,  text:"Interfrange : i = λ·D/a"},
        {f:200, text:"Interfranges brillantes : δ = p·λ  (p ∈ ℤ)"},
        {f:360, text:"Interfranges sombres : δ = (2p+1)·λ/2"},
        {f:520, text:"Diffraction : θ ≈ λ/a  (si a ≫ λ)"},
        {f:700, text:"Plus a est petit → franges plus espacées"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"L'expérience de Young (1801) prouva la nature ondulatoire de la lumière."},
        {f:200, speaker:"lucas",text:"Pourquoi voit-on des franges et pas juste deux taches ?"},
        {f:320, speaker:"prof", text:"Les deux fentes sont des sources cohérentes. Leur superposition crée des interférences constructives et destructives."},
        {f:520, speaker:"lea",  text:"Si je rapproche les fentes, que se passe-t-il ?"},
        {f:640, speaker:"prof", text:"i = λD/a → si a diminue, i augmente. Les franges s'écartent. À l'examen, cette proportionnalité est souvent testée."},
      ]}
    >
      <YoungViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 9 — PHYSIQUE QUANTIQUE
// ════════════════════════════════════════════════════════════════
function QuantiqueViz({frame}){
  const dur=SC.QUANTIQUE.d;
  const showPhoton=frame>60;
  const showElec=frame>200;
  const showLevels=frame>400;
  const photonX=70+Math.min(frame,180)*1.1;
  const metalX=290;
  return(
    <svg width={560} height={420} style={{display:"block"}}>
      {/* Métal */}
      <rect x={metalX} y={100} width={180} height={220} rx={8} fill="#1a2840" stroke={P.blue} strokeWidth={2}/>
      <text x={metalX+90} y={130} fill={P.blue} fontSize={14} fontWeight={700} textAnchor="middle">Métal</text>
      {/* électrons dans le métal */}
      {Array.from({length:8},(_,i)=>(
        <circle key={i} cx={metalX+30+((i*73)%120)} cy={160+((i*47)%120)}
          r={6} fill={P.red} opacity={0.8} style={{filter:"drop-shadow(0 0 4px #ef4444)"}}/>
      ))}
      {/* photon incident */}
      {showPhoton&&(
        <>
          <circle cx={photonX} cy={160} r={12} fill={P.gold} style={{filter:"drop-shadow(0 0 15px #fbbf24)"}}/>
          <text x={photonX} y={145} fill={P.gold} fontSize={11} textAnchor="middle">hν</text>
          <line x1={photonX+12} y1={160} x2={photonX+60<metalX?photonX+60:metalX} y2={160}
            stroke={P.gold} strokeWidth={2} strokeDasharray="6,3"/>
        </>
      )}
      {/* électron éjecté */}
      {showElec&&frame>200&&frame<700&&(
        <>
          <circle cx={metalX-20-(frame-200)*0.4} cy={130-(frame-200)*0.2} r={8}
            fill={P.red} style={{filter:"drop-shadow(0 0 8px #ef4444)"}}/>
          <text x={metalX-20-(frame-200)*0.4-15} y={120-(frame-200)*0.2} fill={P.red} fontSize={12}>e⁻</text>
          <line x1={metalX} y1={140} x2={metalX-20-(frame-200)*0.4} y2={130-(frame-200)*0.2}
            stroke={P.red} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}/>
        </>
      )}
      {/* niveaux d'énergie */}
      {showLevels&&(
        <g transform="translate(30,200)" opacity={fi(frame,400,30)}>
          {[
            {y:0,   label:"n=3 E₃=-1,5 eV", col:P.magic},
            {y:50,  label:"n=2 E₂=-3,4 eV", col:P.blue},
            {y:120, label:"n=1 E₁=-13,6 eV",col:P.red},
          ].map(({y,label,col})=>(
            <g key={y}>
              <line x1={0} y1={y} x2={120} y2={y} stroke={col} strokeWidth={2}/>
              <text x={125} y={y+4} fill={col} fontSize={11}>{label}</text>
            </g>
          ))}
          <text x={60} y={-15} fill={P.dim} fontSize={12} textAnchor="middle">Niveaux H</text>
          {/* transition */}
          {frame>600&&(
            <>
              <line x1={60} y1={50} x2={60} y2={0} stroke={P.gold} strokeWidth={2}/>
              <polygon points={arrowPts(60,50,60,0,8)} fill={P.gold}/>
              <text x={72} y={28} fill={P.gold} fontSize={12}>hν=ΔE</text>
            </>
          )}
        </g>
      )}
    </svg>
  );
}

function SceneQuantique(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Physique Quantique" subtitle="Quantique – Photoélectrique" accent={P.pink} dur={SC.QUANTIQUE.d}
      narration="narration_quantique"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_photon",from:60,vol:0.6},
        {file:"sfx_photon",from:200,vol:0.6},
        {file:"sfx_electric",from:300,vol:0.35},
        {file:"sfx_photon",from:600,vol:0.55},
        {file:"sfx_chalk",from:700,vol:0.4},
      ]}
      formulas={[
        {f:60,  text:"Énergie photon : E = h·ν = h·c/λ"},
        {f:200, text:"h = 6,626×10⁻³⁴ J·s  (constante de Planck)"},
        {f:350, text:"Effet photoélectrique : Éc = h·ν − W"},
        {f:520, text:"Fréquence seuil : ν₀ = W/h  (si ν < ν₀ → rien)"},
        {f:700, text:"Niveaux H : Eₙ = −13,6/n²  (en eV)"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Einstein (1905) expliqua l'effet photoélectrique en postulant que la lumière est quantifiée en photons."},
        {f:200, speaker:"lea",  text:"Pourquoi une lumière trop rouge n'arrache pas d'électrons, même très intense ?"},
        {f:320, speaker:"prof", text:"Chaque photon agit seul. Si son énergie hν est inférieure au travail d'extraction W, aucun électron n'est éjecté — indépendamment de l'intensité."},
        {f:520, speaker:"lucas",text:"C'est ce qui a valu le Nobel à Einstein ?"},
        {f:640, speaker:"prof", text:"Exactement — pas la relativité ! Cette découverte fonda la mécanique quantique avec Bohr et Planck."},
      ]}
    >
      <QuantiqueViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 10 — DÉMO COMPLÈTE (problème)
// ════════════════════════════════════════════════════════════════
function SceneDemo1(){
  const frame=useCurrentFrame();
  const dur=SC.DEMO1.d;
  const opacity=sceneFade(frame,dur);
  const steps=[
    {f:0,   text:"<b>Problème :</b> Une bille de m = 0,2 kg est lancée à v₀ = 15 m/s à θ = 30° depuis une falaise de h = 20 m."},
    {f:180, text:"<b>1. Équations horaires :</b><br/>x(t) = v₀cosθ·t = 15×cos30°×t ≈ 12,99t<br/>y(t) = h + v₀sinθ·t − ½g·t² = 20 + 7,5t − 4,905t²"},
    {f:480, text:"<b>2. Temps de chute :</b> y(t) = 0 → 4,905t² − 7,5t − 20 = 0<br/>Δ = 7,5² + 4×4,905×20 = 448,65 → t ≈ 2,79 s"},
    {f:780, text:"<b>3. Portée :</b> x(2,79) = 12,99 × 2,79 ≈ 36,2 m"},
    {f:1080,text:"<b>4. Énergie cinétique à l'impact :</b><br/>vₓ = 12,99 m/s  ;  vᵧ = 7,5 − 9,81×2,79 ≈ −19,9 m/s<br/>v = √(vₓ²+vᵧ²) ≈ 23,9 m/s → Éc = ½×0,2×23,9² ≈ 57 J"},
    {f:1380,text:"<b>Vérification énergie :</b> ΔEm = 0 (sans frottement)<br/>Éc_final = Éc_initiale + m·g·h = ½×0,2×15² + 0,2×9,81×20 ≈ 22,5 + 39,2 = 61,7 J ✓"},
  ];
  const cur=[...steps].reverse().find(s=>frame>=s.f)||null;
  // trajectoire animée
  const theta=Math.PI/6, v0=15, g=9.81, h=20;
  const vx=v0*Math.cos(theta), vy0=v0*Math.sin(theta);
  const tTotal=2.79;
  const tNow=(frame/dur)*tTotal*1.1;
  const ballX=80+Math.min(tNow,tTotal)*vx*10;
  const ballY=280-h*3-Math.min(tNow,tTotal)*vy0*10+0.5*g*Math.min(tNow,tTotal)*Math.min(tNow,tTotal)*10;
  return(
    <AbsoluteFill style={{opacity,background:P.bg,fontFamily:SANS}}>
      <Audio src={staticFile("audio/physique_music.wav")} volume={0.09} startFrom={0} endAt={dur}/>
      <Audio src={staticFile("audio/narration_demo1.wav")} volume={1.0}/>
      <Sequence from={0} durationInFrames={48}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.45}/></Sequence>
      {[180,480,780,1080,1380].map((f,i)=>(
        <Sequence key={i} from={f} durationInFrames={36}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.5}/></Sequence>
      ))}
      <Stars count={30}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${P.gold},${P.red},${P.magic})`,boxShadow:`0 0 18px ${P.gold}`}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",gap:22,padding:"22px 50px 20px"}}>
        <div style={{flex:"0 0 500px"}}>
          <div style={{color:P.gold,fontSize:13,fontWeight:800,letterSpacing:3,marginBottom:4}}>DÉMONSTRATION COMPLÈTE · MÉCANIQUE</div>
          <div style={{color:P.text,fontSize:32,fontWeight:900,marginBottom:16}}>Projectile depuis une falaise</div>
          <svg width={500} height={340} style={{display:"block",background:P.surface,borderRadius:12,border:`1px solid ${P.border}`}}>
            {/* sol */}
            <line x1={20} y1={300} x2={480} y2={300} stroke={P.boardBorder} strokeWidth={2}/>
            {/* falaise */}
            <rect x={20} y={240} width={60} height={60} fill="#0d1a2e" stroke={P.boardBorder} strokeWidth={2}/>
            <text x={50} y={290} fill={P.dim} fontSize={11} textAnchor="middle">20m</text>
            {/* trajectoire */}
            <path d={Array.from({length:100},(_,i)=>{
              const t=i/99*tTotal;
              const x=80+t*vx*10, y=280-h*3-t*vy0*10+0.5*g*t*t*10;
              return `${i===0?"M":"L"}${x},${y}`;
            }).join(" ")} fill="none" stroke={P.gold} strokeWidth={1.5} strokeDasharray="5,3" opacity={0.6}/>
            {/* bille */}
            {tNow>0&&tNow<tTotal+0.3&&(
              <circle cx={ballX} cy={Math.max(ballY,300-8)} r={10} fill={P.red} style={{filter:"drop-shadow(0 0 8px #ef4444)"}}/>
            )}
            {/* angle */}
            <text x={100} y={230} fill={P.cyan} fontSize={13} fontWeight={700}>θ=30°</text>
            <text x={100} y={248} fill={P.cyan} fontSize={13}>v₀=15m/s</text>
          </svg>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:14}}>
          {cur&&(
            <div style={{background:P.card,borderRadius:14,border:`2px solid ${P.gold}44`,padding:"18px 20px",opacity:fi(frame,cur.f,20)}}>
              <div dangerouslySetInnerHTML={{__html:cur.text}} style={{color:P.text,fontSize:15,lineHeight:1.8,fontFamily:MONO}}/>
            </div>
          )}
          <div style={{background:P.board,borderRadius:12,border:`2px solid ${P.boardBorder}`,padding:"14px 16px"}}>
            <div style={{color:"#60c8ff",fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:8}}>PROGRESSION</div>
            {steps.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,opacity:frame>=s.f?1:0.25}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:frame>=s.f?P.green:P.dim,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"#fff",fontSize:10,fontWeight:700}}>{i+1}</span>
                </div>
                <div style={{color:frame>=s.f?P.text:P.dim,fontSize:12}}>Étape {i+1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 11 — RELATIVITÉ RESTREINTE
// ════════════════════════════════════════════════════════════════
function RelativiteViz({frame}){
  const dur=SC.RELATIVITE.d;
  const beta=0.8; // v/c
  const gamma=1/Math.sqrt(1-beta*beta);
  const t=frame/dur;
  // vaisseau
  const vaisseauX=80+t*350;
  return(
    <svg width={560} height={420} style={{display:"block"}}>
      {/* diagramme espace-temps */}
      {frame>60&&(
        <g opacity={fi(frame,60,40)}>
          <text x={20} y={30} fill={P.text} fontSize={14} fontWeight={700}>Diagramme espace-temps</text>
          {/* axes */}
          <line x1={80} y1={360} x2={80} y2={60} stroke={P.ay} strokeWidth={2}/>
          <text x={85} y={65} fill={P.ay} fontSize={13}>ct</text>
          <line x1={80} y1={360} x2={480} y2={360} stroke={P.ax} strokeWidth={2}/>
          <text x={485} y={365} fill={P.ax} fontSize={13}>x</text>
          {/* cône de lumière */}
          <line x1={80} y1={360} x2={380} y2={60} stroke={P.gold} strokeWidth={1.5} strokeDasharray="5,3" opacity={0.7}/>
          <text x={385} y={58} fill={P.gold} fontSize={12}>c</text>
          {/* ligne de vie référentiel R */}
          <line x1={80} y1={360} x2={80+250*beta} y2={60} stroke={P.blue} strokeWidth={2.5}/>
          <text x={80+250*beta+5} y={58} fill={P.blue} fontSize={12} fontWeight={700}>R'</text>
          {/* événement */}
          {frame>300&&(
            <>
              <circle cx={200} cy={200} r={6} fill={P.red} style={{filter:"drop-shadow(0 0 6px #ef4444)"}}/>
              <line x1={80} y1={200} x2={200} y2={200} stroke={P.red} strokeWidth={1} strokeDasharray="4,3"/>
              <line x1={200} y1={360} x2={200} y2={200} stroke={P.red} strokeWidth={1} strokeDasharray="4,3"/>
            </>
          )}
        </g>
      )}
      {/* vaisseau */}
      <g transform={`translate(${vaisseauX},${120})`} opacity={fi(frame,0,20)}>
        <ellipse cx={0} cy={0} rx={45} ry={18} fill="#1a2840" stroke={P.blue} strokeWidth={2}/>
        <text x={0} y={5} fill={P.blue} fontSize={20} textAnchor="middle">🚀</text>
        <text x={0} y={30} fill={P.dim} fontSize={11} textAnchor="middle">v = 0,8c</text>
      </g>
      {/* observateur sol */}
      <g opacity={fi(frame,0,20)}>
        <text x={30} y={240} fontSize={36}>🧍</text>
        <text x={30} y={265} fill={P.text} fontSize={12}>Terrestre</text>
        <text x={30} y={280} fill={P.dim} fontSize={11}>Δt = {(gamma).toFixed(2)}·Δt₀</text>
      </g>
      {/* valeurs gamma */}
      {frame>200&&(
        <g opacity={fi(frame,200,30)}>
          <rect x={350} y={200} width={195} height={80} rx={8} fill={P.card} stroke={P.border}/>
          <text x={447} y={222} fill={P.magic} fontSize={13} fontWeight={700} textAnchor="middle">γ = {gamma.toFixed(3)}</text>
          <text x={447} y={244} fill={P.text} fontSize={12} textAnchor="middle">Δt = {gamma.toFixed(2)}·Δt₀</text>
          <text x={447} y={264} fill={P.text} fontSize={12} textAnchor="middle">L = L₀/{gamma.toFixed(2)}</text>
        </g>
      )}
    </svg>
  );
}

function SceneRelativite(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="Relativité Restreinte" subtitle="Physique Moderne" accent={P.orange} dur={SC.RELATIVITE.d}
      narration="narration_relativite"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.45},
        {file:"sfx_space",from:10,vol:0.5},
        {file:"sfx_chalk",from:60,vol:0.4},
        {file:"sfx_pop",from:200,vol:0.4},
        {file:"sfx_space",from:700,vol:0.35},
      ]}
      formulas={[
        {f:60,  text:"Facteur de Lorentz : γ = 1/√(1−β²)  où β = v/c"},
        {f:200, text:"Dilatation des durées : Δt = γ·Δt₀  (Δt ≥ Δt₀)"},
        {f:360, text:"Contraction des longueurs : L = L₀/γ  (L ≤ L₀)"},
        {f:520, text:"Énergie totale : E = γ·mc²  ;  E₀ = mc²"},
        {f:700, text:"Impulsion relativiste : p⃗ = γ·m·v⃗"},
      ]}
      dialogues={[
        {f:0,   speaker:"prof", text:"Einstein (1905) : les lois de la physique sont identiques dans tous les référentiels inertiels."},
        {f:200, speaker:"lucas",text:"La dilatation du temps est réelle ou seulement apparente ?"},
        {f:320, speaker:"prof", text:"Réelle et mesurée ! Les muons cosmiques arrivent au sol grâce à cela — leur durée de vie est dilatée de γ ≈ 10."},
        {f:520, speaker:"lea",  text:"E = mc² signifie qu'on peut convertir masse et énergie ?"},
        {f:640, speaker:"prof", text:"Oui — c'est le principe des réacteurs nucléaires et de la fusion solaire : une petite masse libère une énergie colossale (c² ≈ 9×10¹⁶ J/kg)."},
      ]}
    >
      <RelativiteViz frame={frame}/>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 12 — MÉTHODES D'EXAMEN
// ════════════════════════════════════════════════════════════════
function SceneMethodes(){
  const frame=useCurrentFrame();
  const dur=SC.METHODES.d;
  const tips=[
    {f:0,  icon:"✅", text:"Toujours préciser les unités dans les calculs intermédiaires", col:P.green},
    {f:120,icon:"📐", text:"Décomposer les vecteurs en composantes x, y (et z si 3D)", col:P.blue},
    {f:240,icon:"⚡", text:"Vérifier la cohérence dimensionnelle (analyse dimensionnelle)", col:P.gold},
    {f:360,icon:"🔄", text:"Appliquer la conservation de l'énergie AVANT Newton si possible", col:P.magic},
    {f:480,icon:"📊", text:"Tracer un schéma propre avec toutes les forces et données", col:P.cyan},
    {f:600,icon:"🎯", text:"Exprimer le résultat littéral avant de substituer les valeurs", col:P.orange},
    {f:720,icon:"⚠️", text:"Signe de OA, OA' (algébrique !) en optique géométrique", col:P.red},
    {f:840,icon:"🌊", text:"Différentier ondes transversales/longitudinales, stationnaires/progressives", col:P.pink},
  ];
  const opacity=sceneFade(frame,dur);
  return(
    <AbsoluteFill style={{opacity,background:P.bg,fontFamily:SANS}}>
      <Audio src={staticFile("audio/physique_music.wav")} volume={0.10} startFrom={0} endAt={dur}/>
      <Audio src={staticFile("audio/narration_methodes.wav")} volume={1.0}/>
      <Sequence from={0} durationInFrames={48}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.45}/></Sequence>
      {[0,120,240,360,480,600,720,840].map((f,i)=>(
        <Sequence key={i} from={f+5} durationInFrames={30}><Audio src={staticFile("audio/sfx_pop.wav")} volume={0.35}/></Sequence>
      ))}
      <Stars count={25}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${P.green},${P.gold},${P.blue})`,boxShadow:`0 0 18px ${P.green}`}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,padding:"22px 50px",display:"flex",flexDirection:"column"}}>
        <div style={{color:P.gold,fontSize:13,fontWeight:800,letterSpacing:3,marginBottom:4}}>CONSEILS MÉTHODOLOGIQUES</div>
        <div style={{color:P.text,fontSize:40,fontWeight:900,marginBottom:18}}>Réussir l'Épreuve de Physique</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,flex:1}}>
          {tips.map(({f,icon,text,col},i)=>(
            <div key={i} style={{opacity:fi(frame,f,25),background:P.card,borderRadius:12,border:`1px solid ${col}44`,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:12}}>
              <span style={{fontSize:24,flexShrink:0}}>{icon}</span>
              <div style={{color:P.text,fontSize:14,lineHeight:1.5}}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 13 — DEMO 2 (Optique + RC)
// ════════════════════════════════════════════════════════════════
function SceneDemo2(){
  const frame=useCurrentFrame();
  const dur=SC.DEMO2.d;
  const opacity=sceneFade(frame,dur);
  const steps=[
    {f:0,   text:"<b>Problème :</b> Lentille f'=10 cm, objet à OA=−15 cm. Trouver OA', γ, nature de l'image."},
    {f:180, text:"<b>Relation conjuguée :</b> 1/OA' = 1/f' + 1/OA = 1/10 + 1/(−15) = 3/30 − 2/30 = 1/30<br/>→ OA' = 30 cm"},
    {f:480, text:"<b>Grandissement :</b> γ = OA'/OA = 30/(−15) = −2<br/>Image réelle (OA'>0), inversée (γ<0), agrandie (|γ|=2)"},
    {f:780, text:"<b>Vérification :</b> V = 1/f' = 1/0,10 = 10 dioptries ✓<br/>L'image est à 30 cm de la lentille, côté opposé à l'objet."},
  ];
  const cur=[...steps].reverse().find(s=>frame>=s.f)||null;
  return(
    <AbsoluteFill style={{opacity,background:P.bg,fontFamily:SANS}}>
      <Audio src={staticFile("audio/physique_music.wav")} volume={0.09} startFrom={0} endAt={dur}/>
      <Audio src={staticFile("audio/narration_demo2.wav")} volume={1.0}/>
      <Sequence from={0} durationInFrames={48}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.45}/></Sequence>
      {[180,480,780].map((f,i)=>(
        <Sequence key={i} from={f} durationInFrames={36}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.5}/></Sequence>
      ))}
      <Stars count={25}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${P.cyan},${P.magic})`,boxShadow:`0 0 18px ${P.cyan}`}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,padding:"22px 50px",display:"flex",gap:22}}>
        <div style={{flex:"0 0 500px",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={{color:P.cyan,fontSize:13,fontWeight:800,letterSpacing:3}}>DÉMONSTRATION · OPTIQUE</div>
            <div style={{color:P.text,fontSize:32,fontWeight:900}}>Lentille convergente – Application</div>
          </div>
          {/* schéma rapide */}
          <svg width={480} height={280} style={{background:P.surface,borderRadius:12,border:`1px solid ${P.border}`}}>
            <line x1={20} y1={140} x2={460} y2={140} stroke={P.dim} strokeWidth={1} strokeDasharray="6,4"/>
            <ellipse cx={240} cy={140} rx={6} ry={70} fill="#38bdf822" stroke={P.cyan} strokeWidth={2.5}/>
            {/* foyers */}
            <circle cx={280} cy={140} r={4} fill={P.gold}/>
            <text x={280} y={158} fill={P.gold} fontSize={11} textAnchor="middle">F'</text>
            <circle cx={200} cy={140} r={4} fill={P.gold}/>
            <text x={200} y={158} fill={P.gold} fontSize={11} textAnchor="middle">F</text>
            {/* objet */}
            <line x1={100} y1={140} x2={100} y2={80} stroke={P.orange} strokeWidth={3}/>
            <polygon points={arrowPts(100,140,100,80,8)} fill={P.orange}/>
            <text x={100} y={168} fill={P.orange} fontSize={12} textAnchor="middle">A (-15cm)</text>
            {/* image */}
            {frame>480&&(
              <>
                <line x1={360} y1={140} x2={360} y2={200} stroke={P.cyan} strokeWidth={2.5}/>
                <polygon points={arrowPts(360,140,360,200,8)} fill={P.cyan}/>
                <text x={360} y={168} fill={P.cyan} fontSize={12} textAnchor="middle" opacity={fi(frame,480,25)}>A' (30cm)</text>
              </>
            )}
            {/* rayons */}
            {frame>180&&(
              <>
                <line x1={100} y1={80} x2={240} y2={80} stroke={P.red} strokeWidth={1.5} opacity={0.7}/>
                <line x1={240} y1={80} x2={360} y2={200} stroke={P.red} strokeWidth={1.5} opacity={0.7}/>
                <line x1={100} y1={80} x2={360} y2={200} stroke={P.green} strokeWidth={1.5} opacity={0.7}/>
              </>
            )}
          </svg>
        </div>
        <div style={{flex:1}}>
          {cur&&(
            <div style={{background:P.card,borderRadius:14,border:`2px solid ${P.cyan}44`,padding:"18px 20px",marginTop:60,opacity:fi(frame,cur.f,20)}}>
              <div dangerouslySetInnerHTML={{__html:cur.text}} style={{color:P.text,fontSize:15,lineHeight:1.9,fontFamily:MONO}}/>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 14 — OUTRO
// ════════════════════════════════════════════════════════════════
function SceneOutro(){
  const frame=useCurrentFrame();
  const dur=SC.OUTRO.d;
  const opacity=sceneFade(frame,dur);
  const {width,height}=useVideoConfig();
  const items=[
    "Lois de Newton & dynamique","Projectile & portée",
    "Travail, énergie & conservation","Oscillateur harmonique",
    "Circuit RC & constante τ","Lentilles & relation conjuguée",
    "Ondes & déphasage","Fentes de Young",
    "Effet photoélectrique","Relativité restreinte",
  ];
  return(
    <AbsoluteFill style={{opacity,background:P.bg,fontFamily:SANS}}>
      <Audio src={staticFile("audio/physique_music.wav")} volume={0.22} startFrom={0} endAt={dur}/>
      <Audio src={staticFile("audio/narration_outro.wav")} volume={1.0}/>
      <Sequence from={0} durationInFrames={48}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.5}/></Sequence>
      {Array.from({length:10},(_,i)=>(
        <Sequence key={i} from={80+i*20} durationInFrames={30}><Audio src={staticFile("audio/sfx_tick.wav")} volume={0.4}/></Sequence>
      ))}
      <Stars count={100} seed={99}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:5,background:`linear-gradient(90deg,${P.blue},${P.magic},${P.gold},${P.red})`,boxShadow:`0 0 30px ${P.blue}`}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
        <div style={{opacity:fi(frame,0,30),textAlign:"center"}}>
          <div style={{fontSize:56,fontWeight:900,background:`linear-gradient(135deg,${P.gold},${P.magic})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            Bravo ! 🎉
          </div>
          <div style={{color:P.text,fontSize:22,fontWeight:600,marginTop:8}}>Tu maîtrises les fondamentaux de la Physique Terminale</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:700,opacity:fi(frame,60,40)}}>
          {items.map((item,i)=>(
            <div key={i} style={{opacity:fi(frame,80+i*20,20),background:P.card,borderRadius:8,padding:"8px 14px",border:`1px solid ${P.border}`,color:P.text,fontSize:13,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:P.green,fontWeight:700}}>✓</span>{item}
            </div>
          ))}
        </div>
        <div style={{opacity:fi(frame,400,40),color:P.dim,fontSize:13,letterSpacing:2,textTransform:"uppercase",marginTop:10}}>
          Continuez à pratiquer — la physique s'apprend en résolvant des problèmes
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPOSITION PRINCIPALE
// ════════════════════════════════════════════════════════════════
export default function PhysiqueTerminale(){
  return(
    <AbsoluteFill>
      {Object.entries(SC).map(([key,{s,d}])=>(
        <Sequence key={key} from={s} durationInFrames={d}>
          {key==="INTRO"       && <SceneIntro/>}
          {key==="NEWTON"      && <SceneNewton/>}
          {key==="PROJECTILE"  && <SceneProjectile/>}
          {key==="ENERGIE"     && <SceneEnergie/>}
          {key==="OSCILLATEUR" && <SceneOscillateur/>}
          {key==="CIRCUIT_RC"  && <SceneCircuitRC/>}
          {key==="OPTIQUE"     && <SceneOptique/>}
          {key==="ONDES"       && <SceneOndes/>}
          {key==="YOUNG"       && <SceneYoung/>}
          {key==="QUANTIQUE"   && <SceneQuantique/>}
          {key==="DEMO1"       && <SceneDemo1/>}
          {key==="RELATIVITE"  && <SceneRelativite/>}
          {key==="METHODES"    && <SceneMethodes/>}
          {key==="DEMO2"       && <SceneDemo2/>}
          {key==="OUTRO"       && <SceneOutro/>}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
