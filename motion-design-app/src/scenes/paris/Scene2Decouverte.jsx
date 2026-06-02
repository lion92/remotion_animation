import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import { EiffelTower } from '../../components/EiffelTower';

const fi = (f, s, d) => interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const SUBS = [
  { text: "Paris... Elle est enfin là.", s: 30, e: 250 },
  { text: "La Tour Eiffel se dessine dans la lumière dorée.", s: 290, e: 530 },
  { text: "Des milliers de chercheurs vivent et travaillent ici.", s: 570, e: 820 },
  { text: "Elle sent que sa vie va changer.", s: 860, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(10,5,20,0.88)',
  color: '#f1e8d8',
  padding: '14px 44px', borderRadius: 10,
  fontSize: 34, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,200,100,0.3)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

// Nuages
const Cloud = ({ x, y, w }) => (
  <div style={{ position: 'absolute', left: x, top: y }}>
    {[0, 1, 2, 3].map(i => (
      <div key={i} style={{
        position: 'absolute',
        left: i * (w * 0.22), top: i % 2 === 0 ? 0 : -w * 0.12,
        width: w * 0.45, height: w * 0.35,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.85)',
        filter: 'blur(2px)',
      }} />
    ))}
  </div>
);

export const ParisScene2Decouverte = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Léa qui marche de gauche vers centre
  const leaX = interpolate(frame, [0, 600], [80, 460], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leaLeg = Math.sin(frame * 0.32) * (frame < 600 ? 20 : 0);

  // Émerveillement - Léa s'arrête et lève les yeux
  const headTilt = interpolate(frame, [650, 720], [0, -25], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const armRaise = interpolate(frame, [680, 760], [0, -60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Tour Eiffel qui apparaît (effet brume qui se dissipe)
  const eiffelReveal = fi(frame, 100, 300);
  const eiffelGlow = 0.3 + Math.sin(frame * 0.04) * 0.1;

  // Nuages qui dérivent
  const cloudDrift = frame * 0.3;

  // Étoile scintillante au sommet de la tour
  const sparkle = Math.sin(frame * 0.25) * 0.5 + 0.5;

  // Particules dorées flottantes
  const particles = Array.from({ length: 20 }, (_, i) => {
    const seed1 = Math.sin(i * 823.4) * 10000; const v1 = seed1 - Math.floor(seed1);
    const seed2 = Math.sin(i * 412.7) * 10000; const v2 = seed2 - Math.floor(seed2);
    const py = interpolate(frame, [0, 1200], [800 + v1 * 200, -100 + v2 * 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const px = 900 + v2 * 600 + Math.sin(frame * 0.03 + i) * 30;
    const pop = fi(frame, 200 + v1 * 300, 60);
    return { px, py, v1, v2, pop };
  });

  // Seine
  const seineWave = Math.sin(frame * 0.06) * 5;

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Ciel doré du matin */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #1a3a6e 0%, #3d6bbf 20%, #f5a623 55%, #f7c96e 75%, #ffeaa0 100%)',
      }} />

      {/* Soleil */}
      <div style={{
        position: 'absolute', left: 1400, top: 80,
        width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle, #fff7d0, #ffd740 40%, #ff9900)',
        boxShadow: '0 0 80px rgba(255,180,50,0.9), 0 0 200px rgba(255,140,30,0.4)',
      }} />
      {/* Rayons soleil */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 + frame * 0.3) * Math.PI / 180;
        return (
          <div key={i} style={{
            position: 'absolute', left: 1460, top: 140,
            width: 200, height: 3,
            background: 'linear-gradient(90deg, rgba(255,200,60,0.6), transparent)',
            transform: `rotate(${angle}rad)`,
            transformOrigin: '0 50%',
          }} />
        );
      })}

      {/* Nuages */}
      <Cloud x={100 + cloudDrift} y={80} w={200} />
      <Cloud x={500 + cloudDrift * 0.7} y={50} w={150} />
      <Cloud x={800 + cloudDrift * 1.2} y={100} w={180} />
      <Cloud x={1100 + cloudDrift * 0.5} y={60} w={220} />
      <Cloud x={1500 + cloudDrift * 0.9} y={90} w={160} />

      {/* Seine */}
      <div style={{
        position: 'absolute', bottom: 240, left: 0, right: 0, height: 80,
        background: `linear-gradient(180deg, rgba(70,120,200,0.7) 0%, rgba(50,100,180,0.9) 100%)`,
        overflow: 'hidden',
      }}>
        {/* Reflets ondulés */}
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', top: 20 + Math.sin(frame * 0.05 + i * 0.8) * 4,
            left: i * 250 + seineWave * 5,
            width: 180, height: 4,
            background: 'rgba(255,220,100,0.35)',
            borderRadius: 10, filter: 'blur(2px)',
          }} />
        ))}
        {/* Reflet tour Eiffel */}
        <div style={{
          position: 'absolute', left: 1040, top: 5,
          width: 30, height: 70,
          background: 'linear-gradient(180deg, rgba(255,200,80,0.25), transparent)',
          clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(3px)',
          opacity: eiffelReveal,
        }} />
      </div>

      {/* Pont (Pont de Bir-Hakeim style) */}
      <div style={{ position: 'absolute', bottom: 230, left: 0, right: 0, height: 40 }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, background: '#2d2416' }} />
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: 16, left: i * 140,
            width: 12, height: 50,
            background: '#3d3020',
          }}>
            {/* Câble */}
            <div style={{
              position: 'absolute', top: 0, left: 6, width: 140, height: 2,
              background: 'rgba(80,60,30,0.6)',
              transformOrigin: 'left top',
              transform: 'rotate(8deg)',
            }} />
          </div>
        ))}
      </div>

      {/* TOUR EIFFEL — composant SVG fidèle */}
      <div style={{
        position: 'absolute', bottom: 318, left: 830,
        opacity: eiffelReveal,
        filter: `drop-shadow(0 0 ${22 + eiffelGlow * 28}px rgba(255,200,80,${eiffelGlow}))`,
      }}>
        <EiffelTower scale={0.9} night={false} frame={frame} />
      </div>

      {/* Bâtiments parisiens */}
      {[
        { x: 0, w: 160, h: 200, color: '#8B7355' },
        { x: 155, w: 120, h: 170, color: '#7A6345' },
        { x: 270, w: 180, h: 220, color: '#8F7555' },
        { x: 1250, w: 150, h: 190, color: '#8B7355' },
        { x: 1395, w: 130, h: 210, color: '#7A6345' },
        { x: 1520, w: 170, h: 180, color: '#8F7555' },
        { x: 1680, w: 140, h: 200, color: '#8B7355' },
        { x: 1815, w: 110, h: 160, color: '#7A6345' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.x, bottom: 320, width: b.w, height: b.h,
          background: `linear-gradient(180deg, ${b.color}dd, ${b.color}ff)`,
          border: '1px solid rgba(100,80,40,0.3)',
        }}>
          {/* Toit mansardé */}
          <div style={{
            position: 'absolute', bottom: b.h - 2, left: -5, right: -5, height: 35,
            background: '#5a4a30',
            clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)',
          }} />
          {/* Fenêtres */}
          {Array.from({ length: Math.floor(b.h / 55) }, (_, row) =>
            Array.from({ length: Math.floor(b.w / 40) }, (_, col) => (
              <div key={`${row}-${col}`} style={{
                position: 'absolute',
                left: 8 + col * 38, top: 20 + row * 52,
                width: 22, height: 32, borderRadius: '11px 11px 0 0',
                background: Math.sin(i * 7 + row * 3 + col * 11) > 0 ? 'rgba(255,220,120,0.6)' : 'rgba(60,50,30,0.5)',
                border: '1px solid rgba(80,60,30,0.4)',
              }} />
            ))
          )}
          {/* Cheminée */}
          <div style={{ position: 'absolute', top: -55, left: b.w * 0.3, width: 14, height: 28, background: '#4a3a20' }} />
          {/* Fumée cheminée */}
          {[0, 1, 2].map(si => {
            const sop = interpolate(frame, [si * 15, si * 15 + 40, si * 15 + 80], [0, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={si} style={{
                position: 'absolute', top: -70 - si * 15, left: b.w * 0.3 - 5,
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(200,200,200,0.3)', filter: 'blur(6px)',
                opacity: sop,
              }} />
            );
          })}
        </div>
      ))}

      {/* Sol / trottoir */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, background: 'linear-gradient(180deg, #4a3c28, #2e2518)' }} />
      {/* Ligne trottoir */}
      <div style={{ position: 'absolute', bottom: 318, left: 0, right: 0, height: 3, background: '#5a4a30' }} />
      {/* Pavés */}
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 26 }, (_, col) => (
          <div key={`${row}-${col}`} style={{
            position: 'absolute',
            left: col * 75 + (row % 2) * 37, bottom: row * 40,
            width: 72, height: 38, border: '1px solid rgba(90,70,40,0.4)',
            background: 'transparent',
          }} />
        ))
      )}

      {/* Arbres (platanes parisiens) */}
      {[150, 500, 860, 1380, 1720].map((tx, i) => {
        const trunkH = 80;
        const leafSway = Math.sin(frame * 0.04 + i * 0.8) * 8;
        return (
          <div key={i} style={{ position: 'absolute', bottom: 320, left: tx }}>
            <div style={{ width: 18, height: trunkH, background: '#4a3520', borderRadius: '2px', margin: '0 auto' }} />
            <div style={{
              position: 'absolute', bottom: trunkH - 20, left: '50%',
              transform: `translateX(-50%) rotate(${leafSway}deg)`,
              transformOrigin: 'bottom center',
            }}>
              <div style={{
                width: 100, height: 90, borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 30%, #2e7d32, #1b5e20)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }} />
              <div style={{
                position: 'absolute', top: 20, left: -20,
                width: 80, height: 70, borderRadius: '50%',
                background: 'radial-gradient(circle, #388e3c, #2e7d32)',
                opacity: 0.8,
              }} />
            </div>
          </div>
        );
      })}

      {/* Léa */}
      <div style={{
        position: 'absolute', bottom: 320, left: leaX,
        transform: 'translateX(-50%)',
      }}>
        <div style={{ position: 'relative' }}>
          {/* Tête */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5c2a0, #e8a87c)',
            border: '2px solid #d4916a', margin: '0 auto',
            transform: `rotate(${headTilt}deg)`,
            transformOrigin: 'bottom center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -4, left: 6, width: 32, height: 18, background: '#3d1c00', borderRadius: '50% 50% 0 0' }} />
            <div style={{ position: 'absolute', top: 10, left: -5, width: 10, height: 28, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
            <div style={{ position: 'absolute', top: 10, right: -5, width: 10, height: 28, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
            <div style={{ position: 'absolute', top: 14, left: 8, width: 7, height: 7, borderRadius: '50%', background: '#2d8a4e' }} />
            <div style={{ position: 'absolute', top: 14, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#2d8a4e' }} />
            <div style={{ position: 'absolute', bottom: 6, left: 11, width: 20, height: 8, borderRadius: '0 0 10px 10px', border: '2px solid #c47a5a', borderTop: 'none' }} />
          </div>
          {/* Corps */}
          <div style={{
            width: 38, height: 54, margin: '0 auto',
            background: '#c0392b', borderRadius: '4px 4px 0 0', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 9, width: 20, height: 12, background: '#e74c3c', borderRadius: '0 0 10px 10px' }} />
            {/* Bras gauche (avec valise) */}
            <div style={{
              position: 'absolute', left: -16, top: 4, width: 12, height: 34,
              background: '#c0392b', borderRadius: 6,
              transform: `rotate(${10 + leaLeg * 0.4}deg)`,
              transformOrigin: 'top center',
            }}>
              <div style={{
                position: 'absolute', bottom: -20, left: -8,
                width: 28, height: 22, background: '#8B6914',
                borderRadius: 4, border: '2px solid #6B4F10',
              }}>
                <div style={{ position: 'absolute', top: 8, left: 3, right: 3, height: 2, background: '#6B4F10' }} />
                <div style={{ position: 'absolute', top: 2, left: 8, width: 10, height: 5, borderRadius: '3px 3px 0 0', border: '2px solid #6B4F10', borderBottom: 'none', background: 'transparent' }} />
              </div>
            </div>
            {/* Bras droit levé (admiration) */}
            <div style={{
              position: 'absolute', right: -14, top: 4, width: 12, height: 32,
              background: '#c0392b', borderRadius: 6,
              transform: `rotate(${armRaise - 10}deg)`,
              transformOrigin: 'top center',
            }} />
          </div>
          {/* Jambes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            <div style={{
              width: 14, height: 44, background: '#2c3e50',
              borderRadius: '0 0 4px 4px',
              transform: `rotate(${leaLeg}deg)`, transformOrigin: 'top center',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', bottom: -8, left: 0, width: 16, height: 10, background: '#1a252f', borderRadius: '0 0 6px 6px' }} />
            </div>
            <div style={{
              width: 14, height: 44, background: '#2c3e50',
              borderRadius: '0 0 4px 4px',
              transform: `rotate(${-leaLeg}deg)`, transformOrigin: 'top center',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', bottom: -8, left: 0, width: 16, height: 10, background: '#1a252f', borderRadius: '0 0 6px 6px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Particules dorées */}
      {particles.map(({ px, py, v1, v2, pop }, i) => (
        <div key={i} style={{
          position: 'absolute', left: px, top: py,
          width: 6 + v2 * 6, height: 6 + v2 * 6,
          borderRadius: '50%',
          background: `rgba(255,${180 + v1 * 60},${40 + v2 * 40},0.7)`,
          boxShadow: `0 0 8px rgba(255,200,60,0.5)`,
          opacity: pop * (0.4 + v1 * 0.6),
          filter: 'blur(1px)',
        }} />
      ))}

      {/* Carte info Paris recherche */}
      {frame >= 500 && (
        <div style={{
          position: 'absolute', right: 80, top: 160,
          background: 'rgba(10,5,30,0.88)',
          border: '1px solid rgba(255,200,100,0.4)',
          borderRadius: 14, padding: '18px 28px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 30px rgba(255,180,50,0.2)',
          opacity: fi(frame, 500, 60),
          minWidth: 300,
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🔬</div>
          <div style={{ color: '#ffd78a', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Paris, capitale de la recherche</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>+40 000</div>
          <div style={{ color: '#bbb', fontSize: 13, marginTop: 2 }}>chercheurs dans l'agglomération</div>
        </div>
      )}

      {frame >= 800 && (
        <div style={{
          position: 'absolute', right: 80, top: 340,
          background: 'rgba(10,5,30,0.88)',
          border: '1px solid rgba(100,200,255,0.3)',
          borderRadius: 14, padding: '18px 28px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 30px rgba(100,180,255,0.15)',
          opacity: fi(frame, 800, 60),
          minWidth: 300,
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🏛️</div>
          <div style={{ color: '#90caf9', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Universités d'excellence</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Sorbonne · ENS · CNRS</div>
          <div style={{ color: '#bbb', fontSize: 13, marginTop: 2 }}>parmi les meilleures du monde</div>
        </div>
      )}

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/paris_narration2.mp3')} startFrom={0} volume={1} />
    </div>
  );
};
