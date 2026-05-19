import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import { StarField } from '../../components/StarField';
import { Rocket } from '../../components/Rocket';
import { Particles } from '../../components/Particles';
import { Counter } from '../../components/Counter';

const InfoCard = ({ title, value, unit, icon, visible, x, y, color = '#38bdf8' }) => {
  if (!visible) return null;
  const opacity = visible ? 1 : 0;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, opacity,
      background: 'rgba(0,10,30,0.90)',
      border: `1px solid ${color}55`,
      borderRadius: 14, padding: '14px 22px',
      backdropFilter: 'blur(12px)',
      boxShadow: `0 0 28px ${color}22`,
      minWidth: 310,
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ color: color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>{title}</div>
      <div style={{ color: '#fff', fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{value}</div>
      {unit && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{unit}</div>}
    </div>
  );
};

const SUBS = [
  { text: "Décollage. La Terre disparaît en 8 minutes 30 secondes.", s: 50, e: 290 },
  { text: "L'ISS orbite à 408 km d'altitude, à 27 724 km/h.", s: 330, e: 570 },
  { text: "En microgravité : les os perdent 1 à 2% de masse par mois.", s: 610, e: 850 },
  { text: "Lucas réalise son premier EVA. 8h dans le vide absolu.", s: 890, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(0,5,20,0.90)',
  color: '#e0f2fe', padding: '14px 44px',
  borderRadius: 10, fontSize: 32, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(56,189,248,0.4)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

export const AstroScene5Space = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ISS orbitant
  const issAngle = frame * 0.018;
  const issX = 960 + Math.cos(issAngle) * 380;
  const issY = 540 + Math.sin(issAngle) * 120;

  // Fusée décollage (début scène)
  const rocketY = interpolate(frame, [0, 180], [1300, -200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const showRocket = frame < 200;

  // Astronaute EVA (flottant)
  const astroX = 700 + Math.sin(frame * 0.025) * 30;
  const astroY = 380 + Math.cos(frame * 0.018) * 20;
  const showEVA = frame >= 600;

  // Aurore boréale
  const auroraOpacity = interpolate(frame, [200, 350], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Terre en bas
  const earthScale = interpolate(frame, [0, 100], [0.8, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Fond espace profond */}
      <div style={{ position: 'absolute', inset: 0, background: '#000008' }} />

      <StarField count={300} width={1920} height={1080} shooting />

      {/* Voie Lactée horizontale */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
        background: 'radial-gradient(ellipse 180% 50% at 50% 30%, rgba(80,80,180,0.06) 0%, transparent 70%)',
      }} />

      {/* Aurore boréale */}
      <div style={{
        position: 'absolute', bottom: 180, left: 0, right: 0, height: 250,
        opacity: auroraOpacity,
        background: 'linear-gradient(to top, rgba(0,200,100,0.3) 0%, rgba(100,200,255,0.15) 50%, transparent 100%)',
        filter: 'blur(8px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 200, left: 200, width: 600, height: 180,
        opacity: auroraOpacity * 0.8,
        background: 'radial-gradient(ellipse, rgba(0,255,150,0.25) 0%, transparent 70%)',
        filter: 'blur(12px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 220, right: 300, width: 500, height: 160,
        opacity: auroraOpacity * 0.7,
        background: 'radial-gradient(ellipse, rgba(150,100,255,0.2) 0%, transparent 70%)',
        filter: 'blur(12px)',
      }} />

      {/* Terre (courbure visible en bas) */}
      <div style={{ position: 'absolute', bottom: -320, left: '50%', transform: `translateX(-50%) scale(${earthScale})` }}>
        <div style={{
          width: 2200, height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 40% 35%, #1e88e5 0%, #0d47a1 30%, #1565c0 55%, #0a2d6e 80%)',
          boxShadow: '0 0 80px rgba(30,136,229,0.4), inset 0 0 100px rgba(0,0,50,0.3)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Continents (blocs verts approximatifs) */}
          <div style={{ position: 'absolute', top: 80, left: 300, width: 280, height: 180, background: 'rgba(46,125,50,0.6)', borderRadius: '50% 40% 60% 50%', transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', top: 60, left: 650, width: 200, height: 300, background: 'rgba(46,125,50,0.5)', borderRadius: '40% 50% 40% 60%', transform: 'rotate(10deg)' }} />
          <div style={{ position: 'absolute', top: 100, left: 900, width: 350, height: 250, background: 'rgba(46,125,50,0.55)', borderRadius: '40% 60% 50% 40%', transform: 'rotate(-5deg)' }} />
          <div style={{ position: 'absolute', top: 150, left: 1400, width: 200, height: 150, background: 'rgba(46,125,50,0.5)', borderRadius: '60% 40% 50% 60%' }} />
          {/* Nuages */}
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{
              position: 'absolute', top: 20 + i * 80, left: i * 260 + Math.sin(frame * 0.01 + i) * 10,
              width: 120, height: 40, background: 'rgba(255,255,255,0.18)', borderRadius: 20,
              filter: 'blur(4px)',
            }} />
          ))}
          {/* Atmosphère lumineuse sur le bord */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '18px solid rgba(100,180,255,0.15)', boxShadow: 'inset 0 0 40px rgba(100,180,255,0.1)' }} />
        </div>
        {/* Halo atmosphérique */}
        <div style={{
          position: 'absolute', top: -25, left: -25, right: -25, height: 50,
          borderRadius: '50%',
          background: 'linear-gradient(to bottom, rgba(100,180,255,0.3), transparent)',
          filter: 'blur(10px)',
        }} />
      </div>

      {/* ISS (Station Spatiale Internationale) */}
      <div style={{ position: 'absolute', left: issX - 80, top: issY - 25 }}>
        {/* Corps principal */}
        <div style={{ position: 'relative', width: 160, height: 50 }}>
          {/* Module central */}
          <div style={{ position: 'absolute', left: 50, top: 12, width: 60, height: 26, background: '#c0c0c0', borderRadius: 4, boxShadow: '0 0 10px rgba(200,220,255,0.3)' }} />
          {/* Panneaux solaires gauche */}
          <div style={{ position: 'absolute', left: 0, top: 5, width: 50, height: 40, background: 'linear-gradient(180deg, #1e3a8a, #2563eb)', borderRadius: 3, opacity: 0.9 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{ position: 'absolute', top: i * 8, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
          {/* Panneaux solaires droite */}
          <div style={{ position: 'absolute', right: 0, top: 5, width: 50, height: 40, background: 'linear-gradient(180deg, #1e3a8a, #2563eb)', borderRadius: 3, opacity: 0.9 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={{ position: 'absolute', top: i * 8, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
          {/* Modules cylindriques */}
          <div style={{ position: 'absolute', left: 43, top: 8, width: 74, height: 34, background: '#b0b0b0', borderRadius: 8, border: '1px solid #d0d0d0' }}>
            {/* Hublots */}
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute', top: 8, left: 8 + i * 20, width: 16, height: 16, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, rgba(150,220,255,0.8), rgba(0,80,180,0.6))',
                border: '1.5px solid #888',
              }} />
            ))}
          </div>
          {/* Bras robotique */}
          <div style={{ position: 'absolute', top: -10, left: 65, width: 4, height: 30, background: '#aaa', borderRadius: 2 }}>
            <div style={{ position: 'absolute', top: 0, left: -12, width: 28, height: 4, background: '#aaa', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* Fusée décollage */}
      {showRocket && (
        <>
          <Rocket x={940} y={rocketY} scale={1.8} color="#ef4444" ascending={true} />
          <Particles x={965} y={Math.min(rocketY + 200, 1100)} count={30} spread={80} colors={['#ff7300', '#ffca3a', '#fff']} />
        </>
      )}

      {/* Astronaute EVA */}
      {showEVA && (
        <div style={{ position: 'absolute', left: astroX, top: astroY }}>
          <div style={{ position: 'relative', width: 80, height: 100 }}>
            {/* Combinaison EMU blanche */}
            <div style={{ position: 'absolute', left: 12, top: 30, width: 56, height: 65, background: '#f1f5f9', borderRadius: 14, boxShadow: '0 0 15px rgba(200,230,255,0.3)' }}>
              {/* Sac à dos PLSS */}
              <div style={{ position: 'absolute', top: 5, right: -14, width: 16, height: 38, background: '#cbd5e1', borderRadius: 6, border: '1px solid #94a3b8' }} />
              {/* Bras gauche */}
              <div style={{
                position: 'absolute', top: 12, left: -20, width: 22, height: 12, background: '#f1f5f9', borderRadius: 6,
                transform: `rotate(${Math.sin(frame * 0.03) * 10}deg)`, transformOrigin: 'right center',
              }} />
              {/* Bras droit */}
              <div style={{
                position: 'absolute', top: 12, right: -20, width: 22, height: 12, background: '#f1f5f9', borderRadius: 6,
                transform: `rotate(${-Math.sin(frame * 0.03) * 10}deg)`, transformOrigin: 'left center',
              }} />
            </div>
            {/* Casque */}
            <div style={{
              position: 'absolute', left: 10, top: 0, width: 60, height: 60, borderRadius: '50%',
              background: '#e2e8f0', border: '3px solid #cbd5e1',
              boxShadow: '0 0 20px rgba(150,200,255,0.4)',
            }}>
              {/* Visière or */}
              <div style={{
                position: 'absolute', top: 10, left: 8, width: 44, height: 32, borderRadius: '50% 50% 40% 40%',
                background: 'linear-gradient(135deg, rgba(255,200,0,0.6), rgba(255,150,0,0.4))',
                border: '2px solid rgba(255,200,0,0.5)',
              }} />
            </div>
            {/* Jambes */}
            <div style={{ position: 'absolute', bottom: 0, left: 20 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  width: 16, height: 28, background: '#f1f5f9', borderRadius: 6,
                  transform: `rotate(${Math.cos(frame * 0.02) * 8}deg)`, transformOrigin: 'top center',
                }} />
                <div style={{
                  width: 16, height: 28, background: '#f1f5f9', borderRadius: 6,
                  transform: `rotate(${-Math.cos(frame * 0.02) * 8}deg)`, transformOrigin: 'top center',
                }} />
              </div>
            </div>
            {/* Cordon ombilical */}
            {frame >= 700 && (
              <svg style={{ position: 'absolute', top: 50, left: 80 }} width={200} height={60}>
                <path d="M 0 20 Q 80 -10 160 30 Q 180 40 200 35" fill="none" stroke="rgba(200,200,200,0.5)" strokeWidth={2} />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Compteur orbital */}
      <div style={{ position: 'absolute', top: 30, left: 50 }}>
        <div style={{ color: '#38bdf8', fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>ALTITUDE ORBITALE</div>
        <div style={{ color: '#fff', fontSize: 42, fontWeight: 900, textShadow: '0 0 15px rgba(56,189,248,0.5)' }}>408 km</div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Au-dessus de la Terre</div>
        <div style={{ height: 16 }} />
        <div style={{ color: '#38bdf8', fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>VITESSE ORBITALE</div>
        <div style={{ color: '#fff', fontSize: 36, fontWeight: 900 }}>27 724 km/h</div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>≈ 7,7 km/s</div>
        <div style={{ height: 16 }} />
        <div style={{ color: '#38bdf8', fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>ORBITES JOUR J</div>
        <div style={{ color: '#fbbf24', fontSize: 36, fontWeight: 900 }}>
          <Counter from={0} to={16} start={100} duration={800} suffix=" / 24h" style={{ color: '#fbbf24' }} />
        </div>
        <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>1 lever de soleil / 90 min</div>
      </div>

      {/* Cartes éducatives */}
      <InfoCard
        visible={frame >= 200 && frame < 610}
        x={1380} y={80}
        icon="🦴" title="Effet de la microgravité"
        value="-1 à -2% de masse osseuse / mois"
        unit="Les astronautes font 2h de sport/jour pour compenser la fonte musculaire"
        color="#f87171"
      />
      <InfoCard
        visible={frame >= 610 && frame < 900}
        x={1380} y={80}
        icon="🌅" title="Lever de soleil sur l'ISS"
        value="16 fois par 24h"
        unit="L'ISS complète une orbite en 90 minutes — un coucher et un lever à chaque fois"
        color="#fbbf24"
      />
      <InfoCard
        visible={frame >= 900}
        x={1380} y={80}
        icon="🧰" title="Sortie EVA (Spacewalk)"
        value="Durée max : 8h 56min"
        unit="Record de Jim Voss & Susan Helms (2001) — travaux à -270°C dans le vide"
        color="#22c55e"
      />

      {/* Données ISS en temps réel */}
      <div style={{ position: 'absolute', top: 30, right: 50, textAlign: 'right' }}>
        <div style={{ color: '#64748b', fontSize: 11, letterSpacing: 3, marginBottom: 4 }}>JOURS EN MISSION</div>
        <div style={{ color: '#22c55e', fontSize: 36, fontWeight: 900 }}>
          <Counter from={1} to={182} start={0} duration={1100} suffix=" j" style={{ color: '#22c55e' }} />
        </div>
        <div style={{ height: 12 }} />
        <div style={{ color: '#64748b', fontSize: 11, letterSpacing: 3, marginBottom: 4 }}>DISTANCE PARCOURUE</div>
        <div style={{ color: '#c084fc', fontSize: 30, fontWeight: 900 }}>
          <Counter from={0} to={125} start={0} duration={1100} suffix=" M km" style={{ color: '#c084fc' }} />
        </div>
      </div>

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/astro_narration5.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/astro_music5.mp3')} startFrom={0} volume={0.20} />
    </div>
  );
};
