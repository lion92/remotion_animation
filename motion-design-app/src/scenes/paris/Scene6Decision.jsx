import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import { EiffelTower } from '../../components/EiffelTower';

const fi = (f, s, d) => interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const seeded = (s) => { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); };

const SUBS = [
  { text: "Paris, la nuit. La Tour Eiffel scintille.", s: 30, e: 250 },
  { text: "Léa a pris sa décision.", s: 290, e: 490 },
  { text: "Elle soumettra sa candidature demain matin.", s: 530, e: 780 },
  { text: "\"Je serai chercheuse.\" — Et Paris le sait.", s: 820, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(5,5,20,0.92)',
  color: '#fff8e8',
  padding: '14px 44px', borderRadius: 10,
  fontSize: 34, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,215,80,0.3)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

// Feu d'artifice
const Firework = ({ x, y, frame, startFrame, color }) => {
  const progress = interpolate(frame, [startFrame, startFrame + 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (progress <= 0 || progress >= 1) return null;
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 0.8, 0]);
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity }}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const dist = progress * (80 + seeded(i) * 40);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: Math.cos(angle) * dist - 3,
            top: Math.sin(angle) * dist - 3,
            width: 6, height: 6, borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }} />
        );
      })}
    </div>
  );
};

export const ParisScene6Decision = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Scintillement tour Eiffel
  const sparkle = 0.5 + Math.sin(frame * 0.3) * 0.3 + Math.sin(frame * 0.7) * 0.2;
  const lightSweep = (frame * 1.5) % 360;

  // Léa debout fière
  const leaPose = fi(frame, 80, 100);
  const proudY = Math.sin(frame * 0.02) * 5;

  // Titre final
  const titleReveal = fi(frame, 800, 100);

  // Reflets sur la Seine
  const seineShimmer = Math.sin(frame * 0.08) * 8;

  // Lucioles/étoiles au-dessus de la ville
  const fireflies = Array.from({ length: 25 }, (_, i) => ({
    x: seeded(i) * 1920,
    y: 100 + seeded(i + 0.1) * 600,
    op: 0.3 + Math.sin(frame * 0.06 + i * 0.8) * 0.4,
    sz: 3 + seeded(i + 0.2) * 5,
    color: `hsl(${40 + seeded(i + 0.3) * 60}, 90%, 70%)`,
  }));

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Ciel nuit de Paris */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #020510 0%, #05082a 35%, #08102e 55%, #0a1538 70%, #0d1845 85%, #1a2240 100%)',
      }} />

      {/* Étoiles */}
      {Array.from({ length: 150 }, (_, i) => {
        const x = seeded(i) * 1920;
        const y = seeded(i + 0.1) * 500;
        const sz = 0.5 + seeded(i + 0.2) * 2;
        const op = (0.4 + Math.sin(frame * 0.05 + i * 0.4) * 0.4) * (y < 400 ? 1 : 0.5);
        return (
          <div key={i} style={{
            position: 'absolute', left: x, top: y,
            width: sz, height: sz, borderRadius: '50%',
            background: '#fff', opacity: op,
          }} />
        );
      })}

      {/* Lueur de la ville */}
      <div style={{
        position: 'absolute', bottom: 200, left: 0, right: 0, height: 400,
        background: 'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(255,180,60,0.15) 0%, transparent 70%)',
      }} />

      {/* TOUR EIFFEL illuminée — composant SVG fidèle en mode nuit */}
      <div style={{
        position: 'absolute', bottom: 260, left: 820,
        filter: `drop-shadow(0 0 ${30 + sparkle * 30}px rgba(255,215,60,${sparkle * 0.5}))`,
      }}>
        <EiffelTower scale={1} night={true} frame={frame} />
      </div>

      {/* Skyline nocturne */}
      {[
        { x: 0, w: 140, h: 260, windows: 14 },
        { x: 135, w: 110, h: 210, windows: 10 },
        { x: 240, w: 160, h: 290, windows: 16 },
        { x: 395, w: 90, h: 180, windows: 8 },
        { x: 480, w: 130, h: 240, windows: 12 },
        { x: 1310, w: 120, h: 250, windows: 12 },
        { x: 1425, w: 150, h: 280, windows: 15 },
        { x: 1570, w: 100, h: 200, windows: 9 },
        { x: 1665, w: 140, h: 260, windows: 13 },
        { x: 1800, w: 120, h: 230, windows: 11 },
      ].map((b, bi) => (
        <div key={bi} style={{
          position: 'absolute', left: b.x, bottom: 260, width: b.w, height: b.h,
          background: 'linear-gradient(180deg, #0d1224, #080d18)',
          border: '1px solid rgba(40,60,100,0.4)',
        }}>
          {/* Toit */}
          <div style={{
            position: 'absolute', bottom: b.h - 2, left: -4, right: -4, height: 30,
            background: '#0a0f1a',
            clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)',
          }} />
          {/* Fenêtres éclairées */}
          {Array.from({ length: b.windows }, (_, i) => {
            const col = i % Math.floor(b.w / 28);
            const row = Math.floor(i / Math.floor(b.w / 28));
            const lit = seeded(bi * 100 + i) > 0.35;
            const flicker = lit && Math.sin(frame * 0.1 + bi * 5 + i * 3) > 0.95;
            return lit ? (
              <div key={i} style={{
                position: 'absolute',
                left: 6 + col * 26, top: 15 + row * 45,
                width: 18, height: 26,
                background: flicker ? 'rgba(255,250,200,0.2)' : `rgba(255,${200 + seeded(bi * 10 + i) * 55},${80 + seeded(bi * 20 + i) * 80},0.65)`,
                borderRadius: 2,
                boxShadow: `0 0 ${flicker ? 2 : 4}px rgba(255,200,80,0.4)`,
              }} />
            ) : null;
          })}
        </div>
      ))}

      {/* Seine */}
      <div style={{
        position: 'absolute', bottom: 160, left: 0, right: 0, height: 100,
        background: 'linear-gradient(180deg, rgba(10,20,60,0.9) 0%, rgba(15,25,70,1) 100%)',
        overflow: 'hidden',
      }}>
        {/* Reflets lumières sur l'eau */}
        {[
          { x: 940, color: 'rgba(255,215,60,0.5)', w: 80 },
          { x: 300, color: 'rgba(255,100,100,0.3)', w: 40 },
          { x: 600, color: 'rgba(100,200,255,0.3)', w: 50 },
          { x: 1300, color: 'rgba(255,200,80,0.4)', w: 60 },
          { x: 1600, color: 'rgba(100,150,255,0.35)', w: 45 },
        ].map((r, i) => (
          <div key={i} style={{
            position: 'absolute', top: 10 + Math.sin(frame * 0.06 + i) * 4,
            left: r.x + seineShimmer,
            width: r.w, height: 5,
            background: r.color,
            borderRadius: 10, filter: 'blur(3px)',
            transform: 'scaleX(1.5)',
          }} />
        ))}
        {/* Reflet tour Eiffel */}
        <div style={{
          position: 'absolute', left: 940, top: 5,
          width: 40, height: 90,
          background: `linear-gradient(180deg, rgba(255,215,60,${sparkle * 0.4}), transparent)`,
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(4px)',
        }} />
      </div>

      {/* Quai */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(180deg, #0e1520, #080c14)' }} />
      <div style={{ position: 'absolute', bottom: 158, left: 0, right: 0, height: 3, background: '#1a2535' }} />
      {/* Pavés du quai */}
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 26 }, (_, col) => (
          <div key={`${row}-${col}`} style={{
            position: 'absolute', left: col * 76 + (row % 2) * 38, bottom: row * 40,
            width: 74, height: 38, border: '1px solid rgba(30,45,70,0.4)', background: 'transparent',
          }} />
        ))
      )}

      {/* Lampadaires du quai */}
      {[100, 400, 700, 1000, 1200, 1500, 1800].map((lx, i) => (
        <div key={i} style={{ position: 'absolute', bottom: 160, left: lx }}>
          <div style={{ width: 6, height: 130, background: '#2a3040', margin: '0 auto' }} />
          <div style={{
            width: 28, height: 8, background: '#3a4050', borderRadius: '50%',
            marginLeft: -11, marginTop: -8,
          }} />
          <div style={{
            position: 'absolute', bottom: 130, left: -8,
            width: 14, height: 14, borderRadius: '50%',
            background: '#ffe080',
            boxShadow: `0 0 ${15 + Math.sin(frame * 0.04 + i) * 5}px rgba(255,220,80,0.9), 0 0 40px rgba(255,200,60,0.5)`,
          }} />
          {/* Halo */}
          <div style={{
            position: 'absolute', bottom: 90, left: -60,
            width: 130, height: 60,
            background: 'radial-gradient(ellipse, rgba(255,200,60,0.06) 0%, transparent 70%)',
          }} />
        </div>
      ))}

      {/* Lucioles */}
      {fireflies.map((f, i) => (
        <div key={i} style={{
          position: 'absolute', left: f.x, top: f.y,
          width: f.sz, height: f.sz, borderRadius: '50%',
          background: f.color, opacity: f.op,
          boxShadow: `0 0 ${f.sz * 3}px ${f.color}`,
        }} />
      ))}

      {/* Feux d'artifice */}
      <Firework x={400} y={200} frame={frame} startFrame={850} color="#ff9f43" />
      <Firework x={800} y={150} frame={frame} startFrame={900} color="#48dbfb" />
      <Firework x={1200} y={180} frame={frame} startFrame={940} color="#ff6b6b" />
      <Firework x={1600} y={220} frame={frame} startFrame={980} color="#a29bfe" />
      <Firework x={600} y={120} frame={frame} startFrame={1020} color="#55efc4" />
      <Firework x={1450} y={100} frame={frame} startFrame={1060} color="#ffd32a" />

      {/* LÉA debout face à la ville */}
      <div style={{
        position: 'absolute', bottom: 160, left: 300,
        transform: 'translateX(-50%)',
        opacity: leaPose,
        filter: `drop-shadow(0 0 20px rgba(255,200,80,0.3))`,
        top: proudY + 750,
      }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Tête */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5c2a0, #e8a87c)',
            border: '2px solid #d4916a', position: 'relative',
            boxShadow: '0 0 15px rgba(255,200,80,0.3)',
          }}>
            <div style={{ position: 'absolute', top: -5, left: 8, width: 36, height: 20, background: '#3d1c00', borderRadius: '50% 50% 0 0' }} />
            <div style={{ position: 'absolute', top: 12, left: -6, width: 12, height: 32, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
            <div style={{ position: 'absolute', top: 12, right: -6, width: 12, height: 32, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
            <div style={{ position: 'absolute', top: 16, left: 10, width: 8, height: 8, borderRadius: '50%', background: '#1a7a3a' }} />
            <div style={{ position: 'absolute', top: 16, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#1a7a3a' }} />
            {/* Sourire confiant */}
            <div style={{ position: 'absolute', bottom: 9, left: 13, width: 24, height: 10, borderRadius: '0 0 12px 12px', border: '2px solid #c47a5a', borderTop: 'none' }} />
          </div>
          {/* Corps */}
          <div style={{
            width: 44, height: 62, background: '#c0392b',
            borderRadius: '4px 4px 0 0', position: 'relative',
            marginTop: 0,
          }}>
            <div style={{ position: 'absolute', top: 0, left: 11, width: 22, height: 13, background: '#e74c3c', borderRadius: '0 0 10px 10px' }} />
            {/* Bras levé/victorieux */}
            <div style={{
              position: 'absolute', left: -20, top: 2, width: 14, height: 50,
              background: '#c0392b', borderRadius: 6,
              transform: 'rotate(-60deg)',
              transformOrigin: 'top center',
            }} />
            <div style={{
              position: 'absolute', right: -18, top: 4, width: 14, height: 38,
              background: '#c0392b', borderRadius: 6,
              transform: 'rotate(15deg)',
              transformOrigin: 'top center',
            }} />
          </div>
          {/* Jambes */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 0].map((_, i) => (
              <div key={i} style={{
                width: 16, height: 52, background: '#2c3e50',
                borderRadius: '0 0 4px 4px', position: 'relative',
              }}>
                <div style={{ position: 'absolute', bottom: -8, left: 0, width: 18, height: 10, background: '#1a252f', borderRadius: '0 0 6px 6px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GRAND TITRE FINAL */}
      {titleReveal > 0 && (
        <div style={{
          position: 'absolute', top: '25%', left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          opacity: titleReveal,
        }}>
          <div style={{
            fontSize: 72, fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 40px rgba(255,215,60,0.8), 0 0 100px rgba(255,180,40,0.4)',
            letterSpacing: 4,
            fontFamily: 'Georgia, serif',
            lineHeight: 1.2,
          }}>Je serai<br />
            <span style={{
              background: 'linear-gradient(90deg, #ffd700, #ffaa00, #ff8c00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: `drop-shadow(0 0 20px rgba(255,180,50,0.8))`,
            }}>Chercheuse</span>
          </div>
          <div style={{
            marginTop: 20, fontSize: 28, color: 'rgba(255,220,150,0.8)',
            letterSpacing: 8, fontStyle: 'italic',
          }}>Paris, capitale de la science ✦</div>
        </div>
      )}

      {/* Feux d'artifice bonus tardifs */}
      <Firework x={960} y={300} frame={frame} startFrame={1100} color="#ffd700" />
      <Firework x={700} y={250} frame={frame} startFrame={1130} color="#ff6b9d" />
      <Firework x={1250} y={280} frame={frame} startFrame={1160} color="#74b9ff" />

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/paris_narration6.mp3')} startFrom={0} volume={1} />
    </div>
  );
};
