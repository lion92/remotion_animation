import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import { StarField } from '../../components/StarField';
import { Sun } from '../../components/Sun';
import { Cloud } from '../../components/Cloud';
import { Fire } from '../../components/Fire';
import { Confetti } from '../../components/Confetti';
import { Particles } from '../../components/Particles';

const InfoCard = ({ title, value, unit, icon, visible, x, y, color = '#f97316' }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: 'rgba(15,5,0,0.92)',
      border: `1px solid ${color}55`,
      borderRadius: 14, padding: '14px 22px',
      backdropFilter: 'blur(12px)',
      boxShadow: `0 0 24px ${color}22`,
      minWidth: 300,
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ color: color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>{title}</div>
      <div style={{ color: '#fff', fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{value}</div>
      {unit && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{unit}</div>}
    </div>
  );
};

const SUBS = [
  { text: "Après 182 jours dans l'espace, le retour commence.", s: 50, e: 280 },
  { text: "La capsule traverse l'atmosphère à 28 000 km/h — 1 650°C.", s: 320, e: 570 },
  { text: "Le bouclier thermique en tuiles de silice absorbe la chaleur.", s: 610, e: 840 },
  { text: "Lucas revient. Son voyage inspire des millions de futurs astronautes.", s: 880, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(10,5,0,0.90)',
  color: '#fff7ed', padding: '14px 44px',
  borderRadius: 10, fontSize: 32, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(249,115,22,0.4)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

export const AstroScene6Return = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Phase 1 (0-400) : Rentrée atmosphérique depuis l'espace
  // Phase 2 (400-700) : Descente avec parachutes
  // Phase 3 (700-1200) : Atterrissage + célébration

  // Capsule qui descend
  const capsuleY = interpolate(frame, [0, 600], [-150, 700], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const capsuleX = 960;

  // Inclinaison rentrée
  const capsuleTilt = interpolate(frame, [0, 200], [25, 10], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Feu de rentrée atmosphérique (intense 0-400)
  const fireIntensity = interpolate(frame, [60, 180, 380, 420], [0, 2.5, 2.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Parachutes (frame 400+)
  const chuteOpen = interpolate(frame, [400, 480], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const showChutes = frame >= 400;

  // Retroscisseurs (petit) en approche finale
  const showRetro = frame >= 580 && frame < 680;

  // Atterrissage au sol (frame 660+)
  const landedY = 700;
  const landed = frame >= 660;

  // Célébration (frame 720+)
  const showCelebration = frame >= 720;
  const sunY = interpolate(frame, [700, 900], [1100, 120], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Transition espace → ciel bleu
  const skyBlue = interpolate(frame, [0, 300], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Fond : transition espace → ciel */}
      <div style={{ position: 'absolute', inset: 0, background: '#000008' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: skyBlue, background: 'linear-gradient(to bottom, #0369a1 0%, #0ea5e9 40%, #7dd3fc 70%, #bae6fd 90%, #e0f2fe 100%)' }} />

      {/* Étoiles (disparaissent avec le ciel) */}
      <div style={{ opacity: 1 - skyBlue }}>
        <StarField count={180} width={1920} height={1080} />
      </div>

      {/* Nuages (apparaissent avec le ciel) */}
      {frame >= 200 && [
        { x: -200 + (frame - 200) * 0.3, y: 100, scale: 1.2 },
        { x: 800 + (frame - 200) * 0.15, y: 180, scale: 0.9 },
        { x: 1400 + (frame - 200) * 0.2, y: 120, scale: 1.1 },
        { x: 200 + (frame - 200) * 0.1, y: 260, scale: 0.7 },
      ].map((c, i) => (
        <div key={i} style={{ opacity: skyBlue }}>
          <Cloud x={c.x} y={c.y} scale={c.scale} speed={0} color="rgba(255,255,255,0.9)" opacity={1} />
        </div>
      ))}

      {/* Soleil (phase atterrissage) */}
      {frame >= 700 && (
        <div style={{ opacity: interpolate(frame, [700, 900], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          <Sun x={250} y={sunY} size={130} color="#FFC107" numRays={18} />
        </div>
      )}

      {/* Sol / Terre (apparaît pour l'atterrissage) */}
      {frame >= 500 && (
        <>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, #15803d, #14532d)', opacity: interpolate(frame, [500, 650], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
          <div style={{ position: 'absolute', bottom: 198, left: 0, right: 0, height: 4, background: '#166534', opacity: interpolate(frame, [500, 650], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
        </>
      )}

      {/* Plasma de rentrée (lueur autour de la capsule) */}
      {fireIntensity > 0.1 && (
        <div style={{
          position: 'absolute', left: capsuleX - 200, top: capsuleY - 60,
          width: 400, height: 280,
          background: `radial-gradient(ellipse, rgba(255,100,0,${fireIntensity * 0.3}) 0%, rgba(255,50,0,${fireIntensity * 0.15}) 40%, transparent 70%)`,
          filter: 'blur(15px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Feu de rentrée */}
      {fireIntensity > 0.1 && (
        <>
          <Fire x={capsuleX} y={capsuleY + 120} size={120} intensity={fireIntensity} />
          <Fire x={capsuleX - 60} y={capsuleY + 100} size={80} intensity={fireIntensity * 0.7} />
          <Fire x={capsuleX + 60} y={capsuleY + 100} size={80} intensity={fireIntensity * 0.7} />
        </>
      )}

      {/* Traînée plasma */}
      {frame >= 60 && frame < 400 && (
        <div style={{
          position: 'absolute', left: capsuleX - 30, top: capsuleY - 200,
          width: 60, height: 220,
          background: `linear-gradient(to top, rgba(255,150,0,${fireIntensity * 0.6}), transparent)`,
          filter: 'blur(8px)',
          borderRadius: '50%',
        }} />
      )}

      {/* Capsule Soyouz / Orion */}
      <div style={{
        position: 'absolute', left: capsuleX - 50, top: capsuleY,
        transform: `rotate(${capsuleTilt}deg)`, transformOrigin: 'center',
      }}>
        {/* Module de commande (cône) */}
        <div style={{
          width: 100, height: 80,
          background: 'linear-gradient(135deg, #9ca3af, #d1d5db, #9ca3af)',
          borderRadius: '50% 50% 15% 15% / 60% 60% 25% 25%',
          position: 'relative',
          boxShadow: frame < 400 ? `0 0 30px rgba(255,100,0,${fireIntensity * 0.8})` : '0 8px 20px rgba(0,0,0,0.4)',
        }}>
          {/* Hublot */}
          <div style={{
            position: 'absolute', top: 22, left: 34, width: 32, height: 32, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(150,220,255,0.7), rgba(0,80,180,0.6))',
            border: '3px solid #6b7280',
          }} />
          {/* Brûlures thermiques */}
          {frame >= 200 && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'rgba(100,50,0,0.3)', mixBlendMode: 'multiply' }} />
          )}
        </div>
        {/* Module de service */}
        <div style={{
          width: 80, height: 40,
          background: 'linear-gradient(to bottom, #6b7280, #4b5563)',
          margin: '0 auto', borderRadius: '5px 5px 15px 15px',
          border: '2px solid #374151',
        }} />
      </div>

      {/* Parachutes */}
      {showChutes && (
        <>
          {/* Parachute pilote */}
          <div style={{
            position: 'absolute', left: capsuleX - 30, top: capsuleY - 80 * chuteOpen,
            opacity: chuteOpen, transform: `scaleY(${chuteOpen})`, transformOrigin: 'bottom center',
          }}>
            <div style={{ width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: `${60 * chuteOpen}px solid rgba(220,50,50,0.7)`, margin: '0 auto' }} />
            <div style={{ width: 4, height: 60, background: '#aaa', margin: '0 auto' }} />
          </div>
          {/* Grand parachute principal (35m) */}
          {chuteOpen > 0.5 && (
            <div style={{
              position: 'absolute', left: capsuleX - 200, top: capsuleY - 280 * chuteOpen,
              opacity: Math.max(0, chuteOpen - 0.5) * 2,
              transform: `scaleY(${chuteOpen})`, transformOrigin: 'bottom center',
            }}>
              {/* Dôme du parachute */}
              <div style={{
                width: 400, height: 220,
                borderRadius: '50% 50% 0 0',
                background: 'linear-gradient(135deg, #dc2626 0%, #fbbf24 16.6%, #dc2626 33.3%, #fbbf24 50%, #dc2626 66.6%, #fbbf24 83.3%, #dc2626 100%)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Suspentes */}
                {Array.from({ length: 8 }, (_, i) => {
                  const sx = (i / 7) * 400;
                  return <div key={i} style={{ position: 'absolute', top: 0, left: sx, width: 1, height: '100%', background: 'rgba(0,0,0,0.15)' }} />;
                })}
              </div>
              {/* Cordes de suspension */}
              {Array.from({ length: 6 }, (_, i) => {
                const sx = i * 70 + 20;
                return (
                  <svg key={i} style={{ position: 'absolute', top: 218, left: sx - 10, overflow: 'visible' }} width={30} height={80}>
                    <line x1={15} y1={0} x2={200 - sx} y2={80} stroke="rgba(200,200,200,0.6)" strokeWidth={1} />
                  </svg>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Rétrofusées atterrissage */}
      {showRetro && (
        <>
          <Fire x={capsuleX - 30} y={capsuleY + 135} size={35} intensity={1.5} />
          <Fire x={capsuleX + 30} y={capsuleY + 135} size={35} intensity={1.5} />
        </>
      )}

      {/* PHASE CÉLÉBRATION */}
      {showCelebration && (
        <>
          <Confetti x={960} y={300} count={100} />
          <Particles x={200} y={800} count={40} spread={200} colors={['#fbbf24', '#f97316', '#ef4444', '#22c55e']} />
          <Particles x={1720} y={800} count={40} spread={200} colors={['#3b82f6', '#8b5cf6', '#ec4899', '#fbbf24']} />

          {/* Foule qui accueille */}
          <div style={{ position: 'absolute', bottom: 198, left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}>
            {Array.from({ length: 24 }, (_, i) => {
              const jump = Math.sin(frame * 0.15 + i * 0.7) * 15;
              const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed'];
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${-jump}px)` }}>
                  {/* Tête */}
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: ['#f5c2a0', '#d4916a', '#c27a52', '#8B5E3C'][i % 4], marginBottom: 2 }} />
                  {/* Corps */}
                  <div style={{ width: 20, height: 40, background: colors[i % 5], borderRadius: 4 }} />
                  {/* Bras levés */}
                  <div style={{ position: 'relative', width: 50, height: 16, top: -38 }}>
                    <div style={{ position: 'absolute', left: 0, top: 4, width: 14, height: 6, background: colors[i % 5], borderRadius: 3, transform: `rotate(${-30 - Math.sin(frame * 0.2 + i) * 15}deg)`, transformOrigin: 'right center' }} />
                    <div style={{ position: 'absolute', right: 0, top: 4, width: 14, height: 6, background: colors[i % 5], borderRadius: 3, transform: `rotate(${30 + Math.sin(frame * 0.2 + i) * 15}deg)`, transformOrigin: 'left center' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message final inspirant */}
          {frame >= 950 && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(0,0,20,0.85)',
              border: '2px solid rgba(251,191,36,0.5)',
              borderRadius: 20, padding: '40px 80px',
              boxShadow: '0 0 60px rgba(251,191,36,0.2)',
              opacity: interpolate(frame, [950, 1000], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}>
              <div style={{ color: '#fbbf24', fontSize: 18, fontWeight: 700, letterSpacing: 4, marginBottom: 12 }}>🚀 LE SAVOIR OUVRE L'UNIVERS 🚀</div>
              <div style={{ color: '#fff', fontSize: 44, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
                "Vise la Lune.<br />Si tu rates,<br />tu atterris parmi les étoiles."
              </div>
              <div style={{ color: '#94a3b8', fontSize: 18 }}>Oscar Wilde — Et Lucas, lui, a atteint la Station Spatiale.</div>
            </div>
          )}
        </>
      )}

      {/* Cartes éducatives */}
      <InfoCard
        visible={frame >= 100 && frame < 450}
        x={80} y={80}
        icon="🌡️" title="Chaleur de rentrée atmosphérique"
        value="1 650°C"
        unit="Température externe — le bouclier thermique protège l'équipage à l'intérieur"
        color="#ef4444"
      />
      <InfoCard
        visible={frame >= 450 && frame < 750}
        x={80} y={80}
        icon="🪂" title="Parachute principal"
        value="35 mètres de diamètre"
        unit="3 parachutes au total — le système ralentit la capsule de 800 km/h à 25 km/h"
        color="#f97316"
      />
      <InfoCard
        visible={frame >= 750 && frame < 950}
        x={80} y={80}
        icon="🏠" title="Réadaptation post-mission"
        value="6 mois de rééducation"
        unit="Après 6 mois sans gravité, le corps doit se réhabituer à marcher et à porter son poids"
        color="#22c55e"
      />

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/astro_narration6.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/astro_music6.mp3')} startFrom={0} volume={0.22} />
      {showCelebration && <Audio src={staticFile('audio/celebration.mp3')} startFrom={0} volume={0.3} />}
    </div>
  );
};
