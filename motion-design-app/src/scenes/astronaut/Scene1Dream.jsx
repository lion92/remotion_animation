import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import { StarField } from '../../components/StarField';
import { Moon } from '../../components/Moon';
import { Rocket } from '../../components/Rocket';

const seeded = (s) => { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); };

const InfoCard = ({ title, value, unit, icon, visible, x, y }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: 'rgba(0,20,60,0.88)',
      border: '1px solid rgba(100,200,255,0.5)',
      borderRadius: 14, padding: '16px 24px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 0 30px rgba(0,150,255,0.25)',
      minWidth: 280,
    }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ color: '#7dd3fc', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
      <div style={{ color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{value}</div>
      {unit && <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>{unit}</div>}
    </div>
  );
};

const SUBS = [
  { text: "Il s'appelle Lucas. Il a 16 ans.", s: 50, e: 280 },
  { text: "Chaque nuit, il contemple l'immensité du cosmos.", s: 320, e: 560 },
  { text: "La Lune semble si proche... pourtant si loin.", s: 600, e: 820 },
  { text: "Son rêve : devenir astronaute et toucher les étoiles ✨", s: 860, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0,10,30,0.88)',
  color: '#e2e8f0',
  padding: '14px 44px', borderRadius: 10,
  fontSize: 34, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(100,160,255,0.35)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

export const AstroScene1Dream = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Planète Saturne qui dérive
  const saturnX = 1400 + Math.sin(frame * 0.012) * 18;
  const saturnY = 140 + Math.cos(frame * 0.009) * 12;
  const saturnScale = interpolate(frame, [60, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Nébuleuse pulsante
  const nebulaOpacity = 0.06 + Math.sin(frame * 0.025) * 0.04;

  // Télescope Lucas
  const telescopeScale = interpolate(frame, [0, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Fusée traversant le ciel
  const rocketX = interpolate(frame, [700, 900], [-120, 2100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const showRocket = frame >= 700 && frame <= 920;

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Fond spatial profond */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #000005 0%, #000520 40%, #000b35 70%, #001040 100%)' }} />

      {/* Voie Lactée */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 40% at 50% 35%, rgba(100,120,255,0.06) 0%, transparent 70%)',
      }} />
      {/* Nébuleuse colorée */}
      <div style={{
        position: 'absolute', top: 80, left: 300, width: 800, height: 400,
        background: `radial-gradient(ellipse, rgba(180,100,255,${nebulaOpacity}) 0%, rgba(100,180,255,${nebulaOpacity * 0.5}) 40%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <StarField count={220} width={1920} height={1080} shooting />

      {/* Lune */}
      <Moon x={1700} y={100} size={140} />

      {/* Saturne */}
      {frame >= 60 && (
        <div style={{
          position: 'absolute', left: saturnX, top: saturnY,
          transform: `scale(${saturnScale})`, transformOrigin: 'center',
        }}>
          {/* Corps de Saturne */}
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 35%, #f5d89b, #d4a843 50%, #a07830)',
              boxShadow: '0 0 30px rgba(200,150,60,0.4)',
              position: 'absolute',
            }} />
            {/* Anneaux */}
            <div style={{
              position: 'absolute', top: 42, left: -55,
              width: 230, height: 36,
              border: '3px solid rgba(220,180,100,0.55)',
              borderRadius: '50%',
              boxShadow: '0 0 12px rgba(220,180,100,0.2)',
              transform: 'rotateX(72deg)',
            }} />
            <div style={{
              position: 'absolute', top: 48, left: -40,
              width: 200, height: 24,
              border: '2px solid rgba(220,180,100,0.35)',
              borderRadius: '50%',
              transform: 'rotateX(72deg)',
            }} />
          </div>
        </div>
      )}

      {/* Sol herbeux */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, background: 'linear-gradient(to bottom, #0a1f0a, #050f05)' }} />
      <div style={{ position: 'absolute', bottom: 178, left: 0, right: 0, height: 6, background: '#0d2d0d' }} />
      {/* Herbe détaillée */}
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 180,
          left: i * 68 + seeded(i * 3) * 30,
          width: 3, height: 12 + seeded(i * 7) * 18,
          background: '#1a4d1a',
          transform: `rotate(${-8 + seeded(i * 13) * 16}deg)`,
          transformOrigin: 'bottom center',
          borderRadius: '2px 2px 0 0',
        }} />
      ))}

      {/* Lucas allongé */}
      <div style={{ position: 'absolute', bottom: 178, left: 550 }}>
        {/* Corps allongé */}
        <div style={{ position: 'relative', width: 260, height: 60 }}>
          {/* Torse */}
          <div style={{
            position: 'absolute', left: 80, bottom: 12,
            width: 140, height: 35,
            background: '#1e3a5f', borderRadius: '6px 20px 20px 6px',
          }} />
          {/* Jambes */}
          <div style={{
            position: 'absolute', right: 0, bottom: 10,
            width: 90, height: 18,
            background: '#1e3a5f', borderRadius: '0 8px 8px 0',
          }} />
          {/* Tête */}
          <div style={{
            position: 'absolute', left: 42, bottom: 16,
            width: 50, height: 50, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5c2a0, #e8a87c)',
            border: '2px solid #d4916a',
          }}>
            {/* Cheveux */}
            <div style={{ position: 'absolute', top: -5, left: 8, width: 36, height: 20, background: '#1a0800', borderRadius: '50% 50% 0 0' }} />
            {/* Yeux ouverts regardant le ciel */}
            <div style={{ position: 'absolute', top: 18, left: 10, width: 9, height: 6, borderRadius: '0 0 50% 50%', border: '2px solid #5a3825', borderTop: 'none' }} />
            <div style={{ position: 'absolute', top: 18, left: 28, width: 9, height: 6, borderRadius: '0 0 50% 50%', border: '2px solid #5a3825', borderTop: 'none' }} />
          </div>
          {/* Bras pointant vers le ciel */}
          <div style={{
            position: 'absolute', left: 110, bottom: 40,
            width: 8, height: 70,
            background: '#1e3a5f',
            borderRadius: 4,
            transform: 'rotate(-20deg)',
            transformOrigin: 'bottom center',
          }} />
        </div>
      </div>

      {/* Télescope */}
      <div style={{
        position: 'absolute', bottom: 178, left: 720,
        transform: `scale(${telescopeScale})`, transformOrigin: 'bottom left',
      }}>
        <div style={{ position: 'relative', width: 80, height: 120 }}>
          {/* Trépied */}
          {[-1, 0, 1].map(dx => (
            <div key={dx} style={{
              position: 'absolute', bottom: 0, left: 35,
              width: 4, height: 55,
              background: '#888',
              transform: `rotate(${dx * 18}deg)`, transformOrigin: 'top center',
            }} />
          ))}
          {/* Tube */}
          <div style={{
            position: 'absolute', left: 10, top: 10, width: 55, height: 75,
            background: 'linear-gradient(90deg, #555, #888, #666)',
            borderRadius: 8,
            transform: 'rotate(-35deg)',
            transformOrigin: 'bottom left',
          }} />
          {/* Oculaire */}
          <div style={{
            position: 'absolute', left: 5, top: 58,
            width: 18, height: 14,
            background: '#333', borderRadius: 4,
          }} />
          {/* Objectif brillant */}
          <div style={{
            position: 'absolute', right: 2, top: 14,
            width: 22, height: 22, borderRadius: '50%',
            background: 'radial-gradient(circle, #90e0ef, #0077b6)',
            border: '2px solid #555',
            boxShadow: '0 0 8px rgba(0,150,255,0.5)',
          }} />
        </div>
      </div>

      {/* Fusée traversant le ciel */}
      {showRocket && (
        <div style={{ position: 'absolute', left: rocketX, top: 200, transform: 'rotate(-15deg) scale(0.7)' }}>
          <Rocket x={0} y={0} scale={1.2} color="#00b4d8" ascending={false} />
        </div>
      )}

      {/* Traînée de la fusée */}
      {showRocket && (
        <div style={{
          position: 'absolute', left: rocketX - 200, top: 235,
          width: 200, height: 3,
          background: 'linear-gradient(90deg, transparent, rgba(0,180,255,0.6))',
          transform: 'rotate(-15deg)',
          borderRadius: 2,
          filter: 'blur(2px)',
        }} />
      )}

      {/* Cartes éducatives */}
      <InfoCard
        visible={frame >= 150 && frame < 550}
        x={80} y={120}
        icon="🌙" title="Distance Terre-Lune"
        value="384 400" unit="kilomètres"
      />
      <InfoCard
        visible={frame >= 450 && frame < 800}
        x={80} y={280}
        icon="⚡" title="Vitesse de la lumière"
        value="299 792" unit="km/s — parcourt la Terre 7× en 1 seconde"
      />
      <InfoCard
        visible={frame >= 700 && frame < 1100}
        x={80} y={430}
        icon="🌌" title="Étoiles dans la Voie Lactée"
        value="200 milliards" unit="étoiles — notre galaxie n'est qu'une parmi 2 000 milliards"
      />
      <InfoCard
        visible={frame >= 900}
        x={1080} y={120}
        icon="🚀" title="Durée voyage Terre → Lune"
        value="3 jours" unit="à bord d'un vaisseau Apollo"
      />

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/astro_narration1.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/astro_music1.mp3')} startFrom={0} volume={0.20} />
      <Audio src={staticFile('audio/night_ambient.mp3')} startFrom={0} volume={0.12} />
    </div>
  );
};
