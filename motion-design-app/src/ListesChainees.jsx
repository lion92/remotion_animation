import {
  AbsoluteFill, Sequence, Audio, staticFile,
  useCurrentFrame, useVideoConfig, interpolate,
} from "remotion";

export const LISTES_CHAINEES_DURATION = 7440; // rallongé pour insertion + suppression

const P = {
  bg:"#07080f", surface:"#0d0f1e", card:"#131525",
  border:"#1e2340", text:"#e2e8f0", dim:"#4a5568",
  gold:"#fbbf24", blue:"#38bdf8", magic:"#a78bfa",
  red:"#ef4444", green:"#4ade80", orange:"#fb923c",
  cyan:"#06b6d4", pink:"#ec4899",
};
const SANS = "'Inter','Segoe UI',Arial,sans-serif";
const MONO = "'JetBrains Mono','Consolas','Courier New',monospace";
const cl = { extrapolateLeft:"clamp", extrapolateRight:"clamp" };
const fi = (f,s=0,d=20) => interpolate(f,[s,s+d],[0,1],cl);
const fo = (f,s,d=20)   => interpolate(f,[s,s+d],[1,0],cl);
const sceneFade = (f,dur) => Math.min(fi(f,0,18),fo(f,dur-18,18));

const SC = {
  INTRO:       {s:0,    d:576 },
  ANALOGIE:    {s:576,  d:1152},
  NODE_STRUCT: {s:1728, d:1152},
  CREATION:    {s:2880, d:1152},
  TRAVERSAL:   {s:4032, d:1152},
  INSERTION:   {s:5184, d:1248}, // 52s → narration 47.9s + marge
  SUPPRESSION: {s:6432, d:1008}, // 42s → narration 37.2s + marge
};

// ── Étoiles ──────────────────────────────────────────────────
function Stars({count=40,seed=1}){
  const frame=useCurrentFrame();
  const {width,height}=useVideoConfig();
  return(<>{Array.from({length:count},(_,i)=>{
    const x=((i*137+seed*31)%97)/97*width;
    const y=((i*79+seed*17)%89)/89*height;
    const p=Math.sin((frame+i*13)/28)*0.5+0.5;
    const sz=1.5+((i*11)%5)*0.9;
    return <div key={i} style={{position:"absolute",left:x,top:y,width:sz,height:sz,borderRadius:"50%",background:"#e2e8f0",opacity:0.04+p*0.12}}/>;
  })}</>);
}

// ── Nœud SVG grand format ─────────────────────────────────────
function NodeBox({x,y,value,color,highlight=false,arrowTo=null,showNull=false,frame=0,appear=0,W=150,H=70}){
  const op=fi(frame,appear,18);
  const glow=highlight?`drop-shadow(0 0 18px ${color})`:"none";
  const dW=W*0.6, nW=W*0.4;
  return(
    <g opacity={op} style={{filter:glow}}>
      <rect x={x}    y={y} width={dW} height={H} rx={10} fill={P.surface} stroke={color} strokeWidth={highlight?3.5:2.5}/>
      <text x={x+dW/2} y={y+H/2+9} fill={color} fontSize={28} fontWeight={900} textAnchor="middle" fontFamily={MONO}>{value}</text>
      <rect x={x+dW} y={y} width={nW} height={H} rx={10} fill={`${color}18`} stroke={color} strokeWidth={highlight?3.5:2.5}/>
      <text x={x+dW+nW/2} y={y+H/2+6} fill={P.dim} fontSize={15} textAnchor="middle" fontFamily={MONO}>→</text>
      {arrowTo&&(
        <g>
          <line x1={x+W} y1={y+H/2} x2={arrowTo[0]} y2={arrowTo[1]} stroke={color} strokeWidth={3}/>
          <polygon points={`${arrowTo[0]},${arrowTo[1]} ${arrowTo[0]-12},${arrowTo[1]-7} ${arrowTo[0]-12},${arrowTo[1]+7}`} fill={color}/>
        </g>
      )}
      {showNull&&<text x={x+W+16} y={y+H/2+7} fill={P.dim} fontSize={20} fontFamily={MONO}>null</text>}
    </g>
  );
}

// ── Shell scène (plein écran, sans code) ──────────────────────
function SceneShell({title,tag,accent,dur,children,narration,sfx=[]}){
  const frame=useCurrentFrame();
  const opacity=sceneFade(frame,dur);
  return(
    <AbsoluteFill style={{opacity,background:P.bg,fontFamily:SANS}}>
      <Audio src={staticFile("audio/lc_music.wav")} volume={0.09} startFrom={0} endAt={dur}/>
      {narration&&<Audio src={staticFile(`audio/${narration}.wav`)} volume={1.0}/>}
      {sfx.map(({file,from:f2,vol=0.55},i)=>(
        <Sequence key={i} from={f2} durationInFrames={48}>
          <Audio src={staticFile(`audio/${file}.wav`)} volume={vol}/>
        </Sequence>
      ))}
      <Stars count={35}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:5,
        background:`linear-gradient(90deg,transparent,${accent},transparent)`,
        boxShadow:`0 0 24px ${accent}`}}/>
      {/* header */}
      <div style={{position:"absolute",top:10,left:60,right:60}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{background:`${accent}22`,border:`1px solid ${accent}55`,color:accent,
            fontSize:13,fontWeight:800,letterSpacing:2,padding:"4px 12px",borderRadius:6,
            textTransform:"uppercase"}}>{tag}</span>
          <div style={{color:P.text,fontSize:44,fontWeight:900}}>{title}</div>
        </div>
        <div style={{marginTop:8,height:3,background:P.border,borderRadius:3}}>
          <div style={{width:`${(frame/dur)*100}%`,height:"100%",background:accent,
            borderRadius:3,boxShadow:`0 0 8px ${accent}`}}/>
        </div>
      </div>
      {/* zone animation plein écran */}
      <div style={{position:"absolute",top:110,left:0,right:0,bottom:0}}>
        {children}
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
  return(
    <AbsoluteFill style={{opacity,background:P.bg,fontFamily:SANS}}>
      <Audio src={staticFile("audio/lc_music.wav")} volume={0.18} endAt={dur}/>
      <Audio src={staticFile("audio/lc_intro.wav")} volume={1.0}/>
      <Sequence from={10} durationInFrames={48}><Audio src={staticFile("audio/sfx_whoosh.wav")} volume={0.5}/></Sequence>
      <Stars count={70} seed={7}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:6,
        background:`linear-gradient(90deg,${P.blue},${P.green},${P.magic})`,
        boxShadow:`0 0 30px ${P.blue}`}}/>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",gap:36}}>
        <div style={{opacity:fi(frame,0,30),textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:800,letterSpacing:4,color:P.blue,
            textTransform:"uppercase",marginBottom:12}}>
            Java · Structures de Données · Pour Débutants
          </div>
          <div style={{fontSize:96,fontWeight:900,
            background:`linear-gradient(135deg,${P.blue},${P.green})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>
            Listes Chaînées
          </div>
          <div style={{fontSize:36,color:P.text,marginTop:14,fontWeight:600}}>
            Comprendre, créer et utiliser en Java
          </div>
        </div>
        {/* nœuds preview animés */}
        <svg width={800} height={100} style={{opacity:fi(frame,60,40)}}>
          {[
            {x:30, v:"10",col:P.blue},
            {x:230,v:"20",col:P.green},
            {x:430,v:"30",col:P.magic},
            {x:630,v:"99",col:P.orange},
          ].map(({x,v,col},i)=>(
            <g key={i} opacity={fi(frame,60+i*35,22)}>
              <rect x={x} y={10} width={90} height={64} rx={12} fill={P.surface} stroke={col} strokeWidth={3}/>
              <text x={x+45} y={52} fill={col} fontSize={32} fontWeight={900}
                textAnchor="middle" fontFamily={MONO}>{v}</text>
              {i<3&&<>
                <line x1={x+90} y1={42} x2={x+148} y2={42} stroke={col} strokeWidth={3}/>
                <polygon points={`${x+148},42 ${x+136},35 ${x+136},49`} fill={col}/>
              </>}
              {i===3&&<text x={x+98} y={47} fill={P.dim} fontSize={20} fontFamily={MONO}>null</text>}
            </g>
          ))}
        </svg>
        <div style={{opacity:fi(frame,240,40),color:P.dim,fontSize:16,
          letterSpacing:2,textTransform:"uppercase"}}>
          5 minutes · Explications visuelles · Exemple complet
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 1 — ANALOGIE
// ════════════════════════════════════════════════════════════════
function SceneAnalogie(){
  const frame=useCurrentFrame();
  return(
    <SceneShell title="C'est quoi ?" tag="Concept" accent={P.blue} dur={SC.ANALOGIE.d}
      narration="lc_analogie"
      sfx={[{file:"sfx_whoosh",from:0,vol:0.4},{file:"sfx_pop",from:260,vol:0.4}]}
    >
      <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",gap:40,padding:"0 80px"}}>

        {/* Analogie chaîne de wagons */}
        <div style={{opacity:fi(frame,0,25),width:"100%"}}>
          <div style={{color:P.dim,fontSize:16,fontWeight:800,letterSpacing:2,
            textTransform:"uppercase",textAlign:"center",marginBottom:20}}>
            Imagine une chaîne de wagons 🚂
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0}}>
            <div style={{fontSize:70,marginRight:16,opacity:fi(frame,10,20)}}>🚂</div>
            {[
              {v:"10",col:P.blue},{v:"20",col:P.green},{v:"30",col:P.magic},
            ].map(({v,col},i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",
                opacity:fi(frame,30+i*50,22)}}>
                <div style={{background:P.surface,border:`4px solid ${col}`,
                  borderRadius:14,padding:"16px 28px",textAlign:"center",
                  boxShadow:`0 0 20px ${col}33`}}>
                  <div style={{color:col,fontSize:38,fontWeight:900,fontFamily:MONO}}>{v}</div>
                  <div style={{color:P.dim,fontSize:13,marginTop:4}}>valeur</div>
                </div>
                {i<2
                  ?<div style={{display:"flex",alignItems:"center"}}>
                    <div style={{width:50,height:5,background:`${col}66`}}/>
                    <div style={{width:0,height:0,
                      borderLeft:`14px solid ${col}66`,
                      borderTop:"9px solid transparent",
                      borderBottom:"9px solid transparent"}}/>
                  </div>
                  :<div style={{color:P.dim,fontSize:20,marginLeft:18,fontFamily:MONO}}>fin</div>
                }
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:16,color:P.text,fontSize:20,
            opacity:fi(frame,180,25)}}>
            Chaque wagon contient une valeur et sait où est le wagon suivant
          </div>
        </div>

        {/* Comparaison tableau vs liste */}
        <div style={{display:"flex",gap:36,opacity:fi(frame,260,30),width:"100%",justifyContent:"center"}}>
          {/* tableau */}
          <div style={{background:P.card,border:`2px solid ${P.gold}55`,borderRadius:18,
            padding:"24px 32px",flex:1,maxWidth:420}}>
            <div style={{color:P.gold,fontSize:16,fontWeight:800,letterSpacing:2,marginBottom:16}}>
              TABLEAU
            </div>
            <div style={{display:"flex",gap:4,marginBottom:14}}>
              {["10","20","30","40"].map((v,i)=>(
                <div key={i} style={{background:P.surface,border:`3px solid ${P.gold}`,
                  borderRadius:8,padding:"12px 16px",fontFamily:MONO,fontSize:26,
                  color:P.gold,fontWeight:700}}>
                  {v}
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{color:P.green,fontSize:16}}>✓ Accès direct : tableau[2] = 30</div>
              <div style={{color:P.red,fontSize:16}}>✗ Taille fixe à la création</div>
            </div>
          </div>
          {/* liste */}
          <div style={{background:P.card,border:`2px solid ${P.blue}55`,borderRadius:18,
            padding:"24px 32px",flex:1,maxWidth:420}}>
            <div style={{color:P.blue,fontSize:16,fontWeight:800,letterSpacing:2,marginBottom:16}}>
              LISTE CHAÎNÉE
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {["10","20","30","40"].map((v,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{background:P.surface,border:`3px solid ${P.blue}`,
                    borderRadius:10,padding:"10px 14px",fontFamily:MONO,fontSize:26,
                    color:P.blue,fontWeight:700}}>
                    {v}
                  </div>
                  {i<3
                    ?<span style={{color:P.blue,fontSize:24,fontWeight:700}}>→</span>
                    :<span style={{color:P.dim,fontSize:18,fontFamily:MONO}}>null</span>
                  }
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{color:P.green,fontSize:16}}>✓ Taille dynamique</div>
              <div style={{color:P.red,fontSize:16}}>✗ Accès séquentiel depuis le début</div>
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 2 — STRUCTURE D'UN NŒUD
// ════════════════════════════════════════════════════════════════
function SceneNodeStruct(){
  const frame=useCurrentFrame();
  const showNext=frame>100;
  const showLinked=frame>340;
  const showHead=frame>580;
  return(
    <SceneShell title="Le Nœud (Node)" tag="Structure" accent={P.magic} dur={SC.NODE_STRUCT.d}
      narration="lc_node"
      sfx={[{file:"sfx_whoosh",from:0,vol:0.4},{file:"sfx_pop",from:100,vol:0.4},{file:"sfx_chalk",from:340,vol:0.4}]}
    >
      <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",gap:36,padding:"0 80px"}}>

        {/* Structure interne détaillée */}
        <div style={{opacity:fi(frame,0,25),display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{color:P.text,fontSize:24,fontWeight:800,marginBottom:4,textAlign:"center"}}>
            Un nœud contient exactement deux choses :
          </div>
          <div style={{display:"flex",alignItems:"stretch",borderRadius:18,overflow:"hidden",
            border:`4px solid ${P.blue}`,boxShadow:`0 0 30px ${P.blue}33`}}>
            {/* data */}
            <div style={{background:`${P.blue}15`,padding:"28px 48px",textAlign:"center",minWidth:240}}>
              <div style={{color:P.dim,fontSize:14,fontWeight:800,letterSpacing:2,marginBottom:12}}>① DATA</div>
              <div style={{color:P.blue,fontSize:60,fontWeight:900,fontFamily:MONO,lineHeight:1}}>42</div>
              <div style={{color:P.text,fontSize:18,marginTop:10}}>la valeur stockée</div>
              <div style={{color:P.dim,fontSize:14,marginTop:4}}>peut être un nombre, un texte…</div>
            </div>
            <div style={{width:4,background:`${P.blue}66`}}/>
            {/* next */}
            <div style={{background:`${P.magic}15`,padding:"28px 48px",textAlign:"center",
              minWidth:240,opacity:fi(frame,80,20)}}>
              <div style={{color:P.dim,fontSize:14,fontWeight:800,letterSpacing:2,marginBottom:12}}>② NEXT</div>
              <div style={{color:P.magic,fontSize:60,fontWeight:900,fontFamily:MONO,lineHeight:1}}>
                {showNext?"→":"…"}
              </div>
              <div style={{color:P.text,fontSize:18,marginTop:10}}>référence au suivant</div>
              <div style={{color:P.dim,fontSize:14,marginTop:4}}>null = dernier de la liste</div>
            </div>
          </div>
        </div>

        {/* nœud isolé → nœud relié */}
        {showLinked&&(
          <div style={{opacity:fi(frame,340,25),display:"flex",gap:60,alignItems:"center"}}>
            {/* nœud seul */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <div style={{color:P.dim,fontSize:15,fontWeight:700,letterSpacing:1}}>NŒUD SEUL</div>
              <svg width={220} height={90}>
                <NodeBox x={10} y={10} value="42" color={P.blue} showNull={true} W={150} H={68} frame={frame} appear={340}/>
              </svg>
              <div style={{color:P.dim,fontSize:14}}>next = null → fin de liste</div>
            </div>
            <div style={{fontSize:40,color:P.dim}}>→</div>
            {/* nœuds reliés */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <div style={{color:P.dim,fontSize:15,fontWeight:700,letterSpacing:1}}>NŒUDS RELIÉS</div>
              <svg width={380} height={90}>
                <NodeBox x={10}  y={10} value="42" color={P.blue}  arrowTo={[222,44]} W={150} H={68} frame={frame} appear={380}/>
                <NodeBox x={222} y={10} value="99" color={P.green} showNull={true}    W={150} H={68} frame={frame} appear={420}/>
              </svg>
              <div style={{color:P.dim,fontSize:14}}>42.next pointe vers 99</div>
            </div>
          </div>
        )}

        {/* head */}
        {showHead&&(
          <div style={{opacity:fi(frame,580,25),background:P.card,
            border:`2px solid ${P.gold}55`,borderRadius:14,
            padding:"16px 30px",display:"flex",gap:18,alignItems:"center"}}>
            <span style={{fontSize:40}}>📌</span>
            <div>
              <div style={{color:P.gold,fontSize:20,fontWeight:800,marginBottom:6}}>
                La liste ne stocke qu'une seule chose :
              </div>
              <div style={{color:P.text,fontSize:22,fontFamily:MONO}}>
                <span style={{color:P.blue}}>head</span>
                <span style={{color:P.dim}}> → la référence vers le 1ᵉʳ nœud</span>
              </div>
              <div style={{color:P.dim,fontSize:16,marginTop:6}}>
                Si head = null, la liste est vide
              </div>
            </div>
          </div>
        )}
      </div>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 3 — CRÉATION
// ════════════════════════════════════════════════════════════════
function SceneCreation(){
  const frame=useCurrentFrame();
  const step = frame<80?0 : frame<280?1 : frame<520?2 : 3;

  const STEP_INFO=[
    {label:"Départ : liste vide",     sub:"head = null",                       col:P.dim},
    {label:"addLast(10)",             sub:"10 devient la tête — head → [10]",  col:P.blue},
    {label:"addLast(20)",             sub:"current parcourt, accroche 20",     col:P.green},
    {label:"addLast(30)",             sub:"current parcourt, accroche 30",     col:P.magic},
  ];

  const NW=160, NH=76, gap=190;
  const startX=160, nodeY=380;

  return(
    <SceneShell title="Construire la Liste" tag="Création" accent={P.green} dur={SC.CREATION.d}
      narration="lc_creation"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.4},
        {file:"sfx_pop",from:80,vol:0.5},
        {file:"sfx_pop",from:280,vol:0.5},
        {file:"sfx_pop",from:520,vol:0.5},
      ]}
    >
      {/* étapes en haut */}
      <div style={{position:"absolute",top:20,left:0,right:0,
        display:"flex",justifyContent:"center",gap:16}}>
        {STEP_INFO.map(({label,col},i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:10,
            background:step>=i?`${col}18`:P.card,
            border:`2px solid ${step>=i?col:P.border}`,
            borderRadius:12,padding:"10px 18px",
          }}>
            <div style={{width:28,height:28,borderRadius:"50%",
              background:step>=i?col:P.dim,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontSize:14,fontWeight:900}}>
                {i===0?"∅":i}
              </span>
            </div>
            <span style={{color:step>=i?col:P.dim,fontSize:15,fontWeight:700}}>{label}</span>
          </div>
        ))}
      </div>

      {/* visualisation SVG centrale */}
      <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}} overflow="visible">
        {/* head */}
        <g opacity={fi(frame,0,20)}>
          <rect x={60} y={nodeY-14} width={80} height={40} rx={8}
            fill={`${P.gold}22`} stroke={P.gold} strokeWidth={2.5}/>
          <text x={100} y={nodeY+16} fill={P.gold} fontSize={18} fontWeight={800}
            textAnchor="middle" fontFamily={MONO}>head</text>
        </g>

        {/* liste vide */}
        {step===0&&(
          <g opacity={fi(frame,0,20)}>
            <line x1={140} y1={nodeY+6} x2={210} y2={nodeY+6} stroke={P.gold} strokeWidth={2.5}/>
            <text x={218} y={nodeY+12} fill={P.dim} fontSize={22} fontFamily={MONO}>null</text>
          </g>
        )}

        {/* flèche head → nœud 1 */}
        {step>=1&&(
          <g opacity={fi(frame,80,18)}>
            <line x1={140} y1={nodeY+6} x2={startX} y2={nodeY+6}
              stroke={P.gold} strokeWidth={3}/>
            <polygon points={`${startX},${nodeY+6} ${startX-12},${nodeY-1} ${startX-12},${nodeY+13}`} fill={P.gold}/>
          </g>
        )}

        {/* nœud 10 */}
        {step>=1&&(
          <NodeBox x={startX} y={nodeY-NH/2} value="10" color={P.blue} W={NW} H={NH}
            arrowTo={step>=2?[startX+gap,nodeY+6]:null}
            showNull={step<2}
            frame={frame} appear={80}/>
        )}
        {/* nœud 20 */}
        {step>=2&&(
          <NodeBox x={startX+gap} y={nodeY-NH/2} value="20" color={P.green} W={NW} H={NH}
            arrowTo={step>=3?[startX+gap*2,nodeY+6]:null}
            showNull={step<3}
            frame={frame} appear={280}/>
        )}
        {/* nœud 30 */}
        {step>=3&&(
          <NodeBox x={startX+gap*2} y={nodeY-NH/2} value="30" color={P.magic} W={NW} H={NH}
            showNull={true}
            frame={frame} appear={520}/>
        )}

        {/* curseur "current" lors de l'ajout en fin */}
        {step>=2&&(
          <g opacity={fi(frame,step===2?280:520,20)}>
            {/* current est sur le dernier nœud existant */}
            <rect x={startX+gap*(step-2)+NW*0.2} y={nodeY+NH/2+20}
              width={80} height={28} rx={7}
              fill={`${P.cyan}22`} stroke={P.cyan} strokeWidth={2}/>
            <text x={startX+gap*(step-2)+NW*0.2+40} y={nodeY+NH/2+40}
              fill={P.cyan} fontSize={14} fontWeight={800} textAnchor="middle" fontFamily={MONO}>
              current
            </text>
          </g>
        )}
      </svg>

      {/* bulle explication bas */}
      <div style={{position:"absolute",bottom:40,left:0,right:0,
        display:"flex",justifyContent:"center"}}>
        <div style={{background:P.card,border:`2px solid ${STEP_INFO[step].col}55`,
          borderRadius:14,padding:"16px 32px",textAlign:"center",minWidth:500}}>
          <div style={{color:STEP_INFO[step].col,fontSize:26,fontWeight:800,marginBottom:6}}>
            {STEP_INFO[step].label}
          </div>
          <div style={{color:P.text,fontSize:20}}>{STEP_INFO[step].sub}</div>
        </div>
      </div>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 4 — PARCOURS (display)
// ════════════════════════════════════════════════════════════════
function SceneTraversal(){
  const frame=useCurrentFrame();
  // step 0→3 : avant de démarrer, current=10, current=20, current=30, fin
  const step=Math.min(Math.floor(frame/250),3);
  const nodes=[
    {x:140, val:"10",col:P.blue},
    {x:380, val:"20",col:P.green},
    {x:620, val:"30",col:P.magic},
  ];
  const outputs=["…","10 →","10 → 20 →","10 → 20 → 30 → null"];
  const NW=180,NH=76;
  const nodeY=380;
  return(
    <SceneShell title="Parcourir avec display()" tag="Traversal" accent={P.gold} dur={SC.TRAVERSAL.d}
      narration="lc_traversal"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.4},
        {file:"sfx_tick",from:250,vol:0.6},
        {file:"sfx_tick",from:500,vol:0.6},
        {file:"sfx_tick",from:750,vol:0.6},
      ]}
    >
      {/* légende en haut */}
      <div style={{position:"absolute",top:16,left:0,right:0,display:"flex",
        justifyContent:"center",gap:30}}>
        <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,
          padding:"10px 22px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:16,height:16,borderRadius:"50%",background:P.cyan}}/>
          <span style={{color:P.cyan,fontSize:16,fontWeight:700,fontFamily:MONO}}>current</span>
          <span style={{color:P.dim,fontSize:15}}>→ le nœud qu'on est en train de lire</span>
        </div>
        <div style={{background:P.card,border:`1px solid ${P.border}`,borderRadius:10,
          padding:"10px 22px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>🔄</span>
          <span style={{color:P.text,fontSize:16}}>
            On boucle tant que current ≠ null
          </span>
        </div>
      </div>

      {/* SVG principal */}
      <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}>
        {/* head */}
        <g opacity={fi(frame,0,18)}>
          <rect x={40} y={nodeY-14} width={80} height={40} rx={8}
            fill={`${P.gold}22`} stroke={P.gold} strokeWidth={2.5}/>
          <text x={80} y={nodeY+16} fill={P.gold} fontSize={18} fontWeight={800}
            textAnchor="middle" fontFamily={MONO}>head</text>
          <line x1={120} y1={nodeY+6} x2={140} y2={nodeY+6} stroke={P.gold} strokeWidth={3}/>
          <polygon points={`140,${nodeY+6} 128,${nodeY-1} 128,${nodeY+13}`} fill={P.gold}/>
        </g>

        {nodes.map(({x,val,col},i)=>(
          <NodeBox key={i} x={x} y={nodeY-NH/2} value={val} color={col} W={NW} H={NH}
            highlight={step===i}
            arrowTo={i<2?[nodes[i+1].x,nodeY+6]:null}
            showNull={i===2}
            frame={frame} appear={0}/>
        ))}

        {/* curseur current */}
        {step<3&&(
          <g opacity={fi(frame,step===0?0:step*250,20)}>
            <rect x={nodes[step].x+NW*0.1} y={nodeY+NH/2+22} width={100} height={34} rx={8}
              fill={`${P.cyan}25`} stroke={P.cyan} strokeWidth={2.5}/>
            <text x={nodes[step].x+NW*0.6} y={nodeY+NH/2+46} fill={P.cyan} fontSize={16}
              fontWeight={800} textAnchor="middle" fontFamily={MONO}>current</text>
            <line x1={nodes[step].x+NW*0.6} y1={nodeY+NH/2+22}
                  x2={nodes[step].x+NW*0.6} y2={nodeY+NH/2+4}
              stroke={P.cyan} strokeWidth={2} strokeDasharray="4,3"/>
            <polygon points={`${nodes[step].x+NW*0.6},${nodeY+NH/2+4} ${nodes[step].x+NW*0.6-8},${nodeY+NH/2+16} ${nodes[step].x+NW*0.6+8},${nodeY+NH/2+16}`} fill={P.cyan}/>
          </g>
        )}
        {/* current = null */}
        {step===3&&(
          <g opacity={fi(frame,750,20)}>
            <rect x={760} y={nodeY+NH/2+22} width={110} height={34} rx={8}
              fill={`${P.dim}22`} stroke={P.dim} strokeWidth={2}/>
            <text x={815} y={nodeY+NH/2+46} fill={P.dim} fontSize={16}
              fontWeight={800} textAnchor="middle" fontFamily={MONO}>current=null</text>
          </g>
        )}
      </svg>

      {/* console output + instruction */}
      <div style={{position:"absolute",bottom:36,left:60,right:60,display:"flex",gap:24}}>
        <div style={{flex:1,background:P.card,border:`2px solid ${P.border}`,
          borderRadius:14,padding:"20px 28px"}}>
          <div style={{color:P.dim,fontSize:13,fontWeight:700,letterSpacing:2,marginBottom:10}}>
            INSTRUCTION EN COURS
          </div>
          <div style={{fontFamily:MONO,fontSize:22,color:P.text}}>
            {step<3
              ?<>current.data =&nbsp;
                <span style={{color:nodes[step].col,fontWeight:900,fontSize:28}}>
                  {nodes[step].val}
                </span>
              </>
              :<span style={{color:P.dim}}>current = null → fin de boucle</span>
            }
          </div>
        </div>
        <div style={{flex:1,background:P.card,border:`2px solid ${P.green}44`,
          borderRadius:14,padding:"20px 28px"}}>
          <div style={{color:P.dim,fontSize:13,fontWeight:700,letterSpacing:2,marginBottom:10}}>
            CONSOLE — System.out
          </div>
          <div style={{fontFamily:MONO,fontSize:22,color:P.green,whiteSpace:"nowrap"}}>
            {outputs[step]}
          </div>
        </div>
      </div>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 5 — INSERTION
// ════════════════════════════════════════════════════════════════
function SceneInsertion(){
  const frame=useCurrentFrame();
  const showFirst=frame>60;
  const afterFirst=frame>380;
  const showLast=frame>620;
  const afterLast=frame>900;

  const NW=148, NH=68;
  const baseNodes=[{x:200,v:"10",col:P.blue},{x:390,v:"20",col:P.green},{x:580,v:"30",col:P.magic}];
  const afterFirstNodes=[{x:60,v:"5",col:P.gold},{x:260,v:"10",col:P.blue},{x:460,v:"20",col:P.green},{x:660,v:"30",col:P.magic}];
  const afterLastNodes=[{x:30,v:"5",col:P.gold},{x:200,v:"10",col:P.blue},{x:370,v:"20",col:P.green},{x:540,v:"30",col:P.magic},{x:710,v:"99",col:P.orange}];

  return(
    <SceneShell title="Insérer un Élément" tag="Insertion" accent={P.orange} dur={SC.INSERTION.d}
      narration="lc_insertion"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.4},
        {file:"sfx_pop",from:60,vol:0.5},
        {file:"sfx_pop",from:380,vol:0.5},
        {file:"sfx_pop",from:620,vol:0.5},
        {file:"sfx_pop",from:900,vol:0.5},
      ]}
    >
      {/* ① addFirst */}
      <div style={{position:"absolute",top:16,left:60,right:60}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:8}}>
          <div style={{background:`${P.blue}22`,border:`2px solid ${P.blue}`,borderRadius:10,
            padding:"8px 18px",color:P.blue,fontSize:18,fontWeight:800}}>
            ① addFirst(5)
          </div>
          <div style={{color:P.green,fontSize:16,fontWeight:600}}>O(1) — instantané !</div>
          <div style={{color:P.dim,fontSize:16}}>Le nouveau nœud devient la tête</div>
        </div>
      </div>

      <svg style={{position:"absolute",top:80,left:0,right:0,width:"100%",height:280}}>
        {/* avant addFirst : 10→20→30 */}
        {!afterFirst&&baseNodes.map(({x,v,col},i)=>(
          <NodeBox key={i} x={x} y={100} value={v} color={col} W={NW} H={NH}
            arrowTo={i<baseNodes.length-1?[baseNodes[i+1].x,134]:null}
            showNull={i===baseNodes.length-1}
            frame={frame} appear={0}/>
        ))}
        {/* nouveau nœud 5 */}
        {showFirst&&!afterFirst&&(
          <NodeBox x={20} y={100} value="5" color={P.gold} W={NW} H={NH}
            highlight={true} arrowTo={[baseNodes[0].x,134]}
            frame={frame} appear={60}/>
        )}
        {/* head */}
        {showFirst&&!afterFirst&&(
          <g opacity={fi(frame,60,18)}>
            <rect x={22} y={185} width={80} height={34} rx={7} fill={`${P.gold}22`} stroke={P.gold} strokeWidth={2}/>
            <text x={62} y={207} fill={P.gold} fontSize={16} fontWeight={800} textAnchor="middle">head</text>
            <line x1={62} y1={185} x2={62} y2={168} stroke={P.gold} strokeWidth={2.5}/>
            <polygon points="62,168 54,180 70,180" fill={P.gold}/>
          </g>
        )}
        {/* après addFirst : 5→10→20→30 */}
        {afterFirst&&afterFirstNodes.map(({x,v,col},i)=>(
          <NodeBox key={i} x={x} y={100} value={v} color={col} W={NW} H={NH}
            arrowTo={i<afterFirstNodes.length-1?[afterFirstNodes[i+1].x,134]:null}
            showNull={i===afterFirstNodes.length-1}
            frame={frame} appear={380}/>
        ))}
        {afterFirst&&(
          <g opacity={fi(frame,380,18)}>
            <rect x={62} y={185} width={80} height={34} rx={7} fill={`${P.gold}22`} stroke={P.gold} strokeWidth={2}/>
            <text x={102} y={207} fill={P.gold} fontSize={16} fontWeight={800} textAnchor="middle">head</text>
            <line x1={102} y1={185} x2={102} y2={168} stroke={P.gold} strokeWidth={2.5}/>
            <polygon points="102,168 94,180 110,180" fill={P.gold}/>
          </g>
        )}
      </svg>

      {/* ② addLast */}
      <div style={{position:"absolute",top:380,left:60,right:60,opacity:fi(frame,600,25)}}>
        <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:8}}>
          <div style={{background:`${P.orange}22`,border:`2px solid ${P.orange}`,borderRadius:10,
            padding:"8px 18px",color:P.orange,fontSize:18,fontWeight:800}}>
            ② addLast(99)
          </div>
          <div style={{color:P.dim,fontSize:16,fontWeight:600}}>O(n) — doit parcourir jusqu'au bout</div>
        </div>
      </div>

      <svg style={{position:"absolute",top:430,left:0,right:0,width:"100%",height:200}} opacity={fi(frame,600,25)}>
        {(afterLast?afterLastNodes:afterFirstNodes.concat({x:afterFirstNodes[afterFirstNodes.length-1].x+170,v:"99",col:P.orange})).map(({x,v,col},i,arr)=>(
          <NodeBox key={i} x={x} y={60} value={v} color={col} W={NW} H={NH}
            highlight={showLast&&!afterLast&&i===arr.length-1}
            arrowTo={i<arr.length-1?[arr[i+1].x,94]:null}
            showNull={i===arr.length-1}
            frame={frame} appear={afterLast?900:620}/>
        ))}
        {/* curseur current sur avant-dernier */}
        {showLast&&!afterLast&&(
          <g opacity={fi(frame,680,20)}>
            <rect x={afterFirstNodes[afterFirstNodes.length-1].x+NW*0.1} y={145} width={80} height={26} rx={6}
              fill={`${P.cyan}22`} stroke={P.cyan} strokeWidth={1.5}/>
            <text x={afterFirstNodes[afterFirstNodes.length-1].x+NW*0.6} y={163} fill={P.cyan} fontSize={13}
              fontWeight={800} textAnchor="middle">current</text>
          </g>
        )}
      </svg>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// SCÈNE 6 — SUPPRESSION
// ════════════════════════════════════════════════════════════════
function SceneSuppression(){
  const frame=useCurrentFrame();
  const showCurrent=frame>120;
  const showCross=frame>300;
  const showAfter=frame>520;

  const NW=140, NH=68;
  const allNodes=[
    {x:30, v:"5", col:P.gold},
    {x:200,v:"10",col:P.blue},
    {x:370,v:"20",col:P.red},
    {x:540,v:"30",col:P.magic},
    {x:710,v:"99",col:P.orange},
  ];
  const afterNodes=[
    {x:80, v:"5", col:P.gold},
    {x:270,v:"10",col:P.blue},
    {x:460,v:"30",col:P.magic},
    {x:650,v:"99",col:P.orange},
  ];
  const nodeY=300;

  return(
    <SceneShell title="Supprimer un Élément" tag="Suppression" accent={P.red} dur={SC.SUPPRESSION.d}
      narration="lc_suppression"
      sfx={[
        {file:"sfx_whoosh",from:0,vol:0.4},
        {file:"sfx_pop",from:300,vol:0.55},
        {file:"sfx_electric",from:350,vol:0.3},
        {file:"sfx_tick",from:520,vol:0.55},
      ]}
    >
      {/* étiquette en haut */}
      <div style={{position:"absolute",top:16,left:0,right:0,display:"flex",
        justifyContent:"center",gap:20}}>
        <div style={{background:`${P.red}18`,border:`2px solid ${P.red}55`,borderRadius:12,
          padding:"10px 24px",color:P.text,fontSize:20,fontWeight:700}}>
          delete(20) — on supprime le nœud qui contient&nbsp;
          <span style={{color:P.red,fontWeight:900}}>20</span>
        </div>
      </div>

      {/* SVG */}
      <svg style={{position:"absolute",top:60,left:0,width:"100%",height:"100%"}}>
        {/* avant suppression */}
        {!showAfter&&allNodes.map(({x,v,col},i)=>(
          <NodeBox key={i} x={x} y={nodeY-NH/2} value={v} color={col} W={NW} H={NH}
            highlight={i===2&&showCross}
            arrowTo={i<allNodes.length-1&&!(showCross&&i===1)?[allNodes[i+1].x,nodeY+6]:null}
            showNull={i===allNodes.length-1}
            frame={frame} appear={0}/>
        ))}

        {/* curseur current sur nœud 10 (juste avant 20) */}
        {showCurrent&&!showAfter&&(
          <g opacity={fi(frame,120,20)}>
            <rect x={210} y={nodeY+NH/2+18} width={90} height={30} rx={7}
              fill={`${P.cyan}22`} stroke={P.cyan} strokeWidth={2}/>
            <text x={255} y={nodeY+NH/2+38} fill={P.cyan} fontSize={15}
              fontWeight={800} textAnchor="middle">current</text>
            <line x1={255} y1={nodeY+NH/2+18} x2={255} y2={nodeY+NH/2+4}
              stroke={P.cyan} strokeWidth={2} strokeDasharray="4,3"/>
          </g>
        )}

        {/* croix sur nœud 20 + flèche qui saute */}
        {showCross&&!showAfter&&(
          <g>
            {/* croix rouge */}
            <line x1={370} y1={nodeY-NH/2} x2={370+NW} y2={nodeY+NH/2}
              stroke={P.red} strokeWidth={4} opacity={0.85}/>
            <line x1={370+NW} y1={nodeY-NH/2} x2={370} y2={nodeY+NH/2}
              stroke={P.red} strokeWidth={4} opacity={0.85}/>
            {/* nouvelle flèche : 10 → 30 (saute 20) */}
            <path d={`M ${200+NW} ${nodeY} Q ${200+NW+85} ${nodeY-100} ${540} ${nodeY}`}
              fill="none" stroke={P.green} strokeWidth={3} strokeDasharray="8,4"
              opacity={fi(frame,350,20)}/>
            <polygon points={`540,${nodeY} 528,${nodeY-10} 532,${nodeY+10}`} fill={P.green}
              opacity={fi(frame,350,20)}/>
            <text x={370+NW*0.5} y={nodeY-108} fill={P.green} fontSize={16} fontWeight={700}
              textAnchor="middle" opacity={fi(frame,380,20)}>
              current.next = current.next.next
            </text>
          </g>
        )}

        {/* après suppression */}
        {showAfter&&afterNodes.map(({x,v,col},i)=>(
          <NodeBox key={i} x={x} y={nodeY-NH/2} value={v} color={col} W={NW} H={NH}
            arrowTo={i<afterNodes.length-1?[afterNodes[i+1].x,nodeY+6]:null}
            showNull={i===afterNodes.length-1}
            frame={frame} appear={520}/>
        ))}
      </svg>

      {/* résultat bas */}
      <div style={{position:"absolute",bottom:36,left:60,right:60,display:"flex",gap:24}}>
        {showCross&&!showAfter&&(
          <div style={{flex:1,background:P.card,border:`2px solid ${P.green}44`,
            borderRadius:14,padding:"16px 28px",opacity:fi(frame,350,20),textAlign:"center"}}>
            <div style={{color:P.gold,fontSize:20,fontWeight:800,marginBottom:6}}>
              Principe du saut
            </div>
            <div style={{color:P.text,fontSize:18}}>
              On fait pointer le nœud <span style={{color:P.blue}}>10</span> directement vers&nbsp;
              <span style={{color:P.magic}}>30</span>, en court-circuitant&nbsp;
              <span style={{color:P.red}}>20</span>
            </div>
          </div>
        )}
        {showAfter&&(
          <div style={{flex:1,background:P.card,border:`2px solid ${P.green}44`,
            borderRadius:14,padding:"16px 28px",opacity:fi(frame,520,22),textAlign:"center"}}>
            <div style={{color:P.green,fontSize:22,fontWeight:800,marginBottom:8}}>
              ✓ Résultat :&nbsp;
              <span style={{fontFamily:MONO,color:P.text}}>5 → 10 → 30 → 99 → null</span>
            </div>
            <div style={{color:P.dim,fontSize:17}}>
              Le nœud 20 est libéré automatiquement par le Garbage Collector Java ♻️
            </div>
          </div>
        )}
      </div>
    </SceneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════
export default function ListesChainees(){
  return(
    <AbsoluteFill>
      {Object.entries(SC).map(([key,{s,d}])=>(
        <Sequence key={key} from={s} durationInFrames={d}>
          {key==="INTRO"       && <SceneIntro/>}
          {key==="ANALOGIE"    && <SceneAnalogie/>}
          {key==="NODE_STRUCT" && <SceneNodeStruct/>}
          {key==="CREATION"    && <SceneCreation/>}
          {key==="TRAVERSAL"   && <SceneTraversal/>}
          {key==="INSERTION"   && <SceneInsertion/>}
          {key==="SUPPRESSION" && <SceneSuppression/>}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
