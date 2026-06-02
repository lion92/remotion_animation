import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';

const fi = (f, s, d) => interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const SUBS = [
  { text: "Elle visite un laboratoire du CNRS.", s: 30, e: 260 },
  { text: "Des équations sur les tableaux, des machines qui ronronnent.", s: 300, e: 560 },
  { text: "Un chercheur l'invite à regarder dans le microscope.", s: 600, e: 860 },
  { text: "\"C'est beau, non ?\" — Elle acquiesce, les yeux brillants.", s: 900, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(5,10,25,0.9)',
  color: '#e8f4f8',
  padding: '14px 44px', borderRadius: 10,
  fontSize: 34, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(100,200,255,0.3)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

// Atome animé
const Atom = ({ x, y, size, color, frame, speed = 1 }) => {
  const angle1 = frame * 0.05 * speed;
  const angle2 = frame * 0.05 * speed + Math.PI * 0.66;
  const angle3 = frame * 0.05 * speed + Math.PI * 1.33;
  const r = size * 0.7;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: size * 2, height: size * 2 }}>
      {/* Noyau */}
      <div style={{
        position: 'absolute', left: size - 8, top: size - 8,
        width: 16, height: 16, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}, ${color}88)`,
        boxShadow: `0 0 12px ${color}88`,
      }} />
      {/* Orbites */}
      {[0, 60, 120].map((rot, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, top: 0, width: size * 2, height: size * 2,
          border: `1px solid ${color}44`,
          borderRadius: '50%',
          transform: `rotateX(${70}deg) rotateZ(${rot}deg)`,
        }} />
      ))}
      {/* Électrons */}
      {[angle1, angle2, angle3].map((a, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: size + Math.cos(a + i * Math.PI * 0.66) * r - 5,
          top: size + Math.sin(a + i * Math.PI * 0.66) * r * 0.4 - 5,
          width: 10, height: 10, borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }} />
      ))}
    </div>
  );
};

export const ParisScene4Laboratoire = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Léa qui se penche sur le microscope
  const leaLean = interpolate(frame, [620, 720], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Chercheur
  const chercheurReveal = fi(frame, 80, 80);

  // Équations qui apparaissent
  const eqs = [
    { eq: 'E = mc²', s: 50, x: 900, y: 140 },
    { eq: 'F = ma', s: 120, x: 1100, y: 200 },
    { eq: 'ΔG = ΔH − TΔS', s: 200, x: 950, y: 270 },
    { eq: '∇²ψ = −k²ψ', s: 300, x: 850, y: 340 },
    { eq: 'PV = nRT', s: 380, x: 1050, y: 400 },
    { eq: 'σ = √(Σ(x−μ)²/N)', s: 460, x: 900, y: 460 },
  ];

  // Bulles de microscope (ce que voit Léa)
  const microReveal = fi(frame, 650, 80);
  const microPulse = 1 + Math.sin(frame * 0.08) * 0.03;

  // Données qui défilent sur écran
  const dataScroll = frame * 2;

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: "'JetBrains Mono','Consolas',monospace" }}>

      {/* Fond laboratoire */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1220 40%, #111828 100%)' }} />

      {/* Grille de fond */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(100,180,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(100,180,255,0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Néon de plafond */}
      {[200, 500, 800, 1100, 1400, 1700].map((lx, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: lx, width: 180, height: 8,
          background: 'rgba(200,240,255,0.9)',
          boxShadow: '0 0 30px rgba(180,220,255,0.8), 0 0 80px rgba(150,200,255,0.4)',
          borderRadius: '0 0 4px 4px',
        }} />
      ))}
      {/* Lueur néon au plafond */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(180deg, rgba(180,220,255,0.12), transparent)',
      }} />

      {/* GRAND TABLEAU NOIR */}
      <div style={{
        position: 'absolute', left: 820, top: 60, width: 680, height: 480,
        background: '#0e1a10',
        border: '8px solid #4a3820',
        borderRadius: 4,
        boxShadow: '0 0 30px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }}>
        {/* Bord bois */}
        <div style={{ position: 'absolute', inset: 0, border: '20px solid transparent', borderImage: 'none' }} />
        {/* Traces de craie */}
        {eqs.map(({ eq, s, x, y }, i) => (
          <div key={i} style={{
            position: 'absolute', left: x - 820, top: y - 60,
            color: 'rgba(240,240,220,0.88)',
            fontSize: 24 + (i % 3) * 4, fontWeight: 500,
            fontFamily: 'Georgia, serif',
            opacity: fi(frame, s, 40),
            textShadow: '0 0 6px rgba(220,220,200,0.3)',
            letterSpacing: 1,
          }}>{eq}</div>
        ))}
        {/* Schéma moléculaire dessiné à la craie */}
        {frame > 400 && (
          <div style={{ position: 'absolute', left: 20, bottom: 20, opacity: fi(frame, 400, 80) }}>
            {/* Hexagone benzène */}
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i * 60 - 30) * Math.PI / 180;
              const a2 = ((i + 1) * 60 - 30) * Math.PI / 180;
              const r = 60;
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: 80 + Math.cos(a) * r,
                  top: 80 + Math.sin(a) * r,
                  width: 2, height: r,
                  background: 'rgba(240,240,220,0.6)',
                  transform: `rotate(${i * 60}deg)`,
                  transformOrigin: '1px 0',
                }} />
              );
            })}
            {/* Cercle central */}
            <div style={{
              position: 'absolute', left: 50, top: 50,
              width: 60, height: 60, borderRadius: '50%',
              border: '2px solid rgba(240,240,220,0.4)',
            }} />
            {/* Labels C */}
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i * 60 - 30) * Math.PI / 180;
              const r = 80;
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: 80 + Math.cos(a) * r - 8,
                  top: 80 + Math.sin(a) * r - 8,
                  color: 'rgba(240,240,220,0.7)', fontSize: 14,
                }}>C</div>
              );
            })}
          </div>
        )}
        {/* Plateau craies */}
        <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 16, background: '#5a4020' }}>
          {[20, 50, 80, 110, 140].map((cx, i) => (
            <div key={i} style={{
              position: 'absolute', left: cx, top: 2,
              width: 18, height: 10,
              background: ['#fff', '#f99', '#99f', '#9f9', '#ff9'][i],
              borderRadius: 3,
              transform: 'rotate(-5deg)',
            }} />
          ))}
        </div>
      </div>

      {/* PAILLASSE LABORATOIRE */}
      <div style={{ position: 'absolute', bottom: 200, left: 0, right: 0, height: 280, background: 'linear-gradient(180deg, #1a2535, #121a28)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#e8e0d0' }} />

        {/* MICROSCOPE */}
        <div style={{ position: 'absolute', left: 400, top: 20 }}>
          {/* Base */}
          <div style={{ width: 140, height: 20, background: '#2c2c2c', borderRadius: '0 0 8px 8px', margin: '0 auto' }} />
          {/* Pied */}
          <div style={{ width: 12, height: 100, background: '#333', margin: '0 auto', position: 'relative' }}>
            {/* Bras */}
            <div style={{
              position: 'absolute', left: 6, top: 20,
              width: 80, height: 12, background: '#3a3a3a',
              borderRadius: 4, transformOrigin: 'left center',
              transform: `rotate(${-20 - leaLean * 10}deg)`,
            }}>
              {/* Objectif */}
              <div style={{
                position: 'absolute', right: -8, top: -10,
                width: 20, height: 32, borderRadius: '0 0 6px 6px',
                background: '#222', border: '2px solid #444',
              }}>
                <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, height: 8, background: '#90caf9', borderRadius: '0 0 4px 4px', opacity: 0.7 }} />
              </div>
            </div>
          </div>
          {/* Oculaire */}
          <div style={{
            position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
            width: 20, height: 40, background: '#222', borderRadius: 4,
            border: '2px solid #444',
          }}>
            <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: 8, borderRadius: '50%', background: '#90caf9', opacity: 0.5 }} />
          </div>
          {/* Platine (lame) */}
          <div style={{
            position: 'absolute', top: 50, left: -30,
            width: 70, height: 8, background: '#444',
          }}>
            <div style={{ position: 'absolute', left: 15, top: 1, width: 40, height: 6, background: 'rgba(180,220,255,0.3)', borderRadius: 2 }} />
          </div>
        </div>

        {/* Vue microscope (cercle avec cellules) */}
        {microReveal > 0 && (
          <div style={{
            position: 'absolute', left: 200, top: -100,
            width: 220, height: 220, borderRadius: '50%',
            background: '#0a1520',
            border: '6px solid #2a2a2a',
            overflow: 'hidden',
            opacity: microReveal,
            boxShadow: '0 0 40px rgba(100,200,255,0.3)',
            transform: `scale(${microPulse})`,
          }}>
            {/* Cellules */}
            {Array.from({ length: 8 }, (_, i) => {
              const seed = Math.sin(i * 763.4) * 10000; const v = seed - Math.floor(seed);
              const seed2 = Math.sin(i * 412.7) * 10000; const v2 = seed2 - Math.floor(seed2);
              const cx = 20 + v * 160;
              const cy = 20 + v2 * 160;
              const r = 20 + v * 30;
              return (
                <div key={i} style={{
                  position: 'absolute', left: cx, top: cy,
                  width: r * 2, height: r * 1.5,
                  borderRadius: '50%',
                  background: `rgba(${100 + v * 100},${200 + v2 * 50},255,0.15)`,
                  border: `1px solid rgba(${100 + v * 100},${200 + v2 * 50},255,0.5)`,
                }}>
                  {/* Noyau cellulaire */}
                  <div style={{
                    position: 'absolute', left: '30%', top: '25%',
                    width: r * 0.6, height: r * 0.5,
                    borderRadius: '50%',
                    background: `rgba(255,${150 + v * 100},100,0.4)`,
                    border: '1px solid rgba(255,200,100,0.6)',
                  }} />
                </div>
              );
            })}
            {/* Réticule */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(100,255,200,0.3)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(100,255,200,0.3)' }} />
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: 40, height: 40, borderRadius: '50%',
              border: '1px solid rgba(100,255,200,0.3)',
            }} />
          </div>
        )}

        {/* Béchers et flacons */}
        {[650, 720, 790, 860].map((bx, i) => {
          const liquids = ['rgba(100,200,100,0.6)', 'rgba(200,100,100,0.6)', 'rgba(100,100,200,0.6)', 'rgba(200,200,100,0.6)'];
          const h = 40 + i * 10;
          const bubbleY = interpolate(frame, [0, 1200], [h * 0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{ position: 'absolute', left: bx, top: 40 + (i % 2) * 20 }}>
              {/* Flacon */}
              <div style={{
                width: 44 + i * 4, height: 80 + h,
                background: 'rgba(200,230,255,0.08)',
                border: '2px solid rgba(180,210,255,0.3)',
                borderRadius: '4px 4px 8px 8px',
                overflow: 'hidden', position: 'relative',
              }}>
                {/* Liquide */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${35 + i * 8}%`,
                  background: liquids[i],
                }}>
                  {/* Bulle */}
                  <div style={{
                    position: 'absolute', left: '40%', bottom: bubbleY % h,
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.5)',
                  }} />
                </div>
              </div>
              {/* Bouchon */}
              <div style={{ width: 30, height: 12, background: '#d4c4a0', borderRadius: '2px 2px 0 0', margin: '0 auto', marginTop: -2 }} />
            </div>
          );
        })}

        {/* Écran ordinateur */}
        <div style={{ position: 'absolute', right: 200, top: 20, width: 300, height: 200 }}>
          <div style={{ width: '100%', height: '100%', background: '#050d1a', border: '3px solid #2a3a4a', borderRadius: 6, overflow: 'hidden' }}>
            {/* Terminal de données */}
            <div style={{ padding: '8px 12px', height: '100%', overflow: 'hidden' }}>
              <div style={{ color: '#00ff88', fontSize: 10, marginBottom: 4 }}>$ analyse --mode=spectro --input=sample_07.csv</div>
              {Array.from({ length: 12 }, (_, i) => {
                const lineY = (i * 14 - dataScroll) % 168;
                const val = Math.sin(i * 123.4 + frame * 0.1) * 100;
                return lineY > 0 && lineY < 160 ? (
                  <div key={i} style={{
                    position: 'absolute', top: 20 + lineY, left: 12,
                    fontSize: 10, fontFamily: 'monospace',
                    color: i % 3 === 0 ? '#7dd3fc' : i % 3 === 1 ? '#a3e635' : '#e2e8f0',
                  }}>
                    {`[${String(i).padStart(3, '0')}]  ${val.toFixed(4)}  ${val > 0 ? '▲' : '▼'}  ${Math.abs(val).toFixed(2)}%`}
                  </div>
                ) : null;
              })}
            </div>
          </div>
          <div style={{ width: 60, height: 20, background: '#1a1a1a', margin: '0 auto', borderRadius: '0 0 4px 4px' }} />
          <div style={{ width: 100, height: 6, background: '#222', margin: '0 auto', borderRadius: 3 }} />
        </div>
      </div>

      {/* Sol */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: '#0d1018' }} />
      {/* Carrelage labo */}
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 26 }, (_, col) => (
          <div key={`${row}-${col}`} style={{
            position: 'absolute', left: col * 76, bottom: row * 40,
            width: 74, height: 38, border: '1px solid rgba(50,80,120,0.2)', background: 'transparent',
          }} />
        ))
      )}

      {/* Atomes animés */}
      <Atom x={60} y={100} size={60} color="#7dd3fc" frame={frame} speed={0.8} />
      <Atom x={1750} y={150} size={50} color="#a78bfa" frame={frame} speed={1.2} />
      <Atom x={100} y={600} size={40} color="#34d399" frame={frame} speed={0.6} />

      {/* Chercheur */}
      {chercheurReveal > 0 && (
        <div style={{ position: 'absolute', bottom: 480, left: 600, opacity: chercheurReveal }}>
          {/* Tête */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e8d0b0, #d4b890)',
            border: '2px solid #c4a870', margin: '0 auto', position: 'relative',
          }}>
            {/* Lunettes */}
            <div style={{ position: 'absolute', top: 15, left: 4, width: 14, height: 10, border: '2px solid #888', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: 15, right: 4, width: 14, height: 10, border: '2px solid #888', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: 19, left: 18, width: 8, height: 2, background: '#888' }} />
            {/* Cheveux gris */}
            <div style={{ position: 'absolute', top: -2, left: 8, width: 28, height: 14, background: '#aaa', borderRadius: '50% 50% 0 0' }} />
          </div>
          {/* Blouse */}
          <div style={{ width: 44, height: 60, margin: '0 auto', background: '#f0f0f0', borderRadius: '4px 4px 0 0', position: 'relative', border: '1px solid #ccc' }}>
            <div style={{ position: 'absolute', top: 4, left: 4, width: 12, height: 18, background: '#c0c0c0', borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: 4, right: 4, width: 12, height: 18, background: '#c0c0c0', borderRadius: 2 }} />
            {/* Bras pointant vers microscope */}
            <div style={{
              position: 'absolute', right: -60, top: 8, width: 55, height: 10,
              background: '#e0e0e0', borderRadius: 5,
              transform: 'rotate(20deg)',
            }} />
          </div>
        </div>
      )}

      {/* Léa penchée sur le microscope */}
      <div style={{ position: 'absolute', bottom: 480, left: 460, transform: `rotate(${leaLean * -10}deg)`, transformOrigin: 'bottom center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #f5c2a0, #e8a87c)', border: '2px solid #d4916a', margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -4, left: 6, width: 32, height: 18, background: '#3d1c00', borderRadius: '50% 50% 0 0' }} />
          <div style={{ position: 'absolute', top: 10, left: -5, width: 10, height: 28, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
          <div style={{ position: 'absolute', top: 10, right: -5, width: 10, height: 28, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
          <div style={{ position: 'absolute', top: 14, left: 8, width: 7, height: 7, borderRadius: '50%', background: '#2d8a4e' }} />
          <div style={{ position: 'absolute', top: 14, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#2d8a4e' }} />
        </div>
        <div style={{ width: 38, height: 54, margin: '0 auto', background: '#c0392b', borderRadius: '4px 4px 0 0' }}>
          <div style={{ position: 'absolute', marginTop: 4, marginLeft: 9, width: 20, height: 12, background: '#e74c3c', borderRadius: '0 0 10px 10px' }} />
        </div>
      </div>

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/paris_narration4.mp3')} startFrom={0} volume={1} />
    </div>
  );
};
