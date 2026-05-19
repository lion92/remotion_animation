import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import { ProgressBar } from '../../components/ProgressBar';
import { Counter } from '../../components/Counter';
import { Countdown } from '../../components/Countdown';
import LittleGuy from '../../LittleGuy';

const InfoCard = ({ title, value, unit, icon, visible, x, y, color = '#f97316' }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: 'rgba(20,5,5,0.92)',
      border: `1px solid ${color}55`,
      borderRadius: 14, padding: '14px 22px',
      backdropFilter: 'blur(10px)',
      boxShadow: `0 0 24px ${color}22`,
      minWidth: 300,
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ color: color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>{title}</div>
      <div style={{ color: '#fff', fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>{value}</div>
      {unit && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{unit}</div>}
    </div>
  );
};

const SUBS = [
  { text: "L'espace est impitoyable pour le corps humain.", s: 50, e: 280 },
  { text: "Lucas s'entraîne chaque jour : 6h de sport, 4h en piscine.", s: 320, e: 580 },
  { text: "Au décollage, les astronautes subissent jusqu'à 3 G.", s: 620, e: 860 },
  { text: "Une EVA peut durer 8 heures dans le vide total.", s: 900, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(20,5,5,0.90)',
  color: '#fff7ed', padding: '14px 44px',
  borderRadius: 10, fontSize: 32, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(249,115,22,0.35)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

export const AstroScene3Training = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Course Lucas
  const runX = (frame * 3.5) % 1920;
  const sweatDrop = Math.sin(frame * 0.2) > 0.7;

  // Centrifugeuse G-force
  const gAngle = frame * 4;
  const gForce = 1 + Math.min(3, frame * 0.004);
  const showCentrifuge = frame >= 600;

  // Piscine / entraînement EVA sous-marin
  const showPool = frame >= 850;
  const diveY = frame >= 850 ? interpolate(frame, [850, 950], [-100, 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : -100;

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Fond stade / gymnase */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0f0a0a 0%, #1a0a00 50%, #0d0500 100%)' }} />

      {/* Ciel du stade */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400, background: 'linear-gradient(to bottom, #1c0a00, #2d1200)' }} />

      {/* Tribune */}
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', top: 120 + Math.floor(i / 10) * 28,
          left: (i % 10) * 200 + 10, width: 180, height: 24,
          background: ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626'][Math.floor(i / 10)],
          borderRadius: 3, opacity: 0.4,
        }} />
      ))}

      {/* Piste d'athlétisme */}
      <div style={{ position: 'absolute', bottom: 160, left: 0, right: 0, height: 220, background: '#8b1a00', borderRadius: '0 0 0 0' }}>
        {/* Lignes de couloir */}
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            position: 'absolute', top: i * 44, left: 0, right: 0,
            height: 2, background: 'rgba(255,255,255,0.3)',
          }} />
        ))}
      </div>

      {/* Sol gazon intérieur */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 164, background: 'linear-gradient(to bottom, #0a2e0a, #061a06)' }} />

      {/* Lucas qui court */}
      <div style={{ position: 'absolute', bottom: 365, left: runX, transform: 'scale(0.65)', transformOrigin: 'bottom center' }}>
        <LittleGuy lookingUp={false} />
      </div>

      {/* Gouttes de sueur */}
      {sweatDrop && (
        <div style={{ position: 'absolute', bottom: 420, left: runX + 30, width: 8, height: 12, background: '#93c5fd', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', transform: 'rotate(20deg)' }} />
      )}

      {/* Chrono */}
      <div style={{ position: 'absolute', top: 30, left: 50 }}>
        <div style={{ color: '#f97316', fontSize: 12, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>CHRONOMÈTRE</div>
        <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: 48, fontWeight: 900, textShadow: '0 0 15px rgba(249,115,22,0.6)' }}>
          <Counter from={0} to={frame / 24} start={0} duration={1200} decimals={1} suffix="s" style={{ color: '#fff' }} />
        </div>
      </div>

      {/* Panel entraînement physique */}
      <div style={{ position: 'absolute', top: 30, right: 50, width: 380 }}>
        <div style={{ color: '#f97316', fontSize: 13, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>PERFORMANCE PHYSIQUE</div>
        {[
          { label: 'Endurance cardiovasculaire', color: '#ef4444', start: 60, val: 96 },
          { label: 'Force musculaire', color: '#f97316', start: 120, val: 88 },
          { label: 'Résistance aux G-forces', color: '#eab308', start: 180, val: 75 },
          { label: 'Équilibre vestibulaire', color: '#22c55e', start: 240, val: 82 },
          { label: 'Capacité pulmonaire', color: '#3b82f6', start: 300, val: 91 },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#d1d5db', fontSize: 13 }}>{s.label}</span>
              <span style={{ color: s.color, fontSize: 13, fontWeight: 700 }}>
                {Math.min(s.val, Math.max(0, Math.round(interpolate(frame, [s.start, s.start + 250], [0, s.val], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))))}%
              </span>
            </div>
            <ProgressBar start={s.start} duration={250} width={380} height={8} color={s.color} bgColor="#1c1009" />
          </div>
        ))}
      </div>

      {/* Centrifugeuse G-force */}
      {showCentrifuge && (
        <div style={{ position: 'absolute', top: 120, left: 280 }}>
          <div style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700, letterSpacing: 2, marginBottom: 10, textAlign: 'center' }}>SIMULATEUR G-FORCE</div>
          <div style={{ position: 'relative', width: 250, height: 250 }}>
            {/* Cercle principal */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '4px solid #713f12',
              background: 'radial-gradient(circle, #1c0d00, #0d0500)',
              boxShadow: '0 0 30px rgba(251,191,36,0.2)',
            }} />
            {/* Bras rotatif */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 110, height: 4,
              background: 'linear-gradient(90deg, #92400e, #fbbf24)',
              transformOrigin: 'left center',
              transform: `rotate(${gAngle}deg)`,
              borderRadius: 2,
            }}>
              {/* Capsule au bout */}
              <div style={{
                position: 'absolute', right: -15, top: -14,
                width: 30, height: 30, borderRadius: 6,
                background: '#fbbf24',
                border: '2px solid #92400e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>👤</div>
            </div>
            {/* Centre */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 20, height: 20, borderRadius: '50%',
              background: '#fbbf24',
            }} />
            {/* Affichage G */}
            <div style={{
              position: 'absolute', bottom: -44, left: '50%', transform: 'translateX(-50%)',
              color: '#fbbf24', fontSize: 22, fontWeight: 900,
              textShadow: '0 0 10px rgba(251,191,36,0.6)',
            }}>
              {gForce.toFixed(1)}G
            </div>
          </div>
        </div>
      )}

      {/* Piscine entraînement EVA */}
      {showPool && (
        <div style={{ position: 'absolute', bottom: 170, left: 650, width: 580, height: 300 }}>
          <div style={{ color: '#38bdf8', fontSize: 13, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>PISCINE NBF — SIMULATION EVA</div>
          <div style={{
            width: '100%', height: 260,
            background: 'linear-gradient(to bottom, rgba(14,165,233,0.3), rgba(7,89,133,0.6))',
            border: '3px solid #0369a1',
            borderRadius: 12, position: 'relative', overflow: 'hidden',
          }}>
            {/* Vagues surface */}
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{
                position: 'absolute', top: 6 + Math.sin(frame * 0.05 + i) * 3, left: i * 75,
                width: 70, height: 3,
                background: 'rgba(147,213,255,0.4)',
                borderRadius: 2,
              }} />
            ))}
            {/* Astronaute sous-marin */}
            <div style={{ position: 'absolute', top: diveY, left: '50%', transform: 'translateX(-50%)' }}>
              <div style={{ position: 'relative', width: 60, height: 70 }}>
                {/* Combinaison */}
                <div style={{ width: 48, height: 55, background: '#f1f5f9', borderRadius: 10, margin: '0 auto', position: 'relative' }}>
                  {/* Visière */}
                  <div style={{
                    position: 'absolute', top: 4, left: 8, width: 32, height: 28, borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, rgba(147,213,255,0.7), rgba(7,89,133,0.6))',
                    border: '3px solid #cbd5e1',
                  }} />
                  {/* Sac à dos */}
                  <div style={{ position: 'absolute', top: 10, right: -10, width: 14, height: 30, background: '#94a3b8', borderRadius: 4 }} />
                  {/* Bras */}
                  <div style={{ position: 'absolute', top: 20, left: -12, width: 12, height: 30, background: '#f1f5f9', borderRadius: 6, transform: 'rotate(20deg)' }} />
                  <div style={{ position: 'absolute', top: 20, right: -10, width: 12, height: 30, background: '#f1f5f9', borderRadius: 6, transform: 'rotate(-20deg)' }} />
                </div>
                {/* Jambes */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 2 }}>
                  <div style={{ width: 12, height: 18, background: '#f1f5f9', borderRadius: 4 }} />
                  <div style={{ width: 12, height: 18, background: '#f1f5f9', borderRadius: 4 }} />
                </div>
              </div>
            </div>
            {/* Bulles */}
            {frame >= 950 && Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: 240 + i * 15 + Math.sin(frame * 0.1 + i) * 5,
                top: 50 + ((frame - 950 + i * 20) % 200),
                width: 6 + i * 2, height: 6 + i * 2,
                borderRadius: '50%',
                border: '1px solid rgba(147,213,255,0.6)',
                background: 'transparent',
                opacity: 0.6,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Cartes éducatives */}
      <InfoCard
        visible={frame >= 80 && frame < 600}
        x={700} y={30}
        icon="⚡" title="Exigence NASA"
        value="6h de sport / jour"
        unit="Minimum requis pendant l'entraînement intensif"
        color="#ef4444"
      />
      <InfoCard
        visible={frame >= 600 && frame < 900}
        x={700} y={30}
        icon="🌀" title="G-Force au décollage"
        value="3G"
        unit="L'équivalent de 3× son propre poids — entraînement obligatoire"
        color="#fbbf24"
      />
      <InfoCard
        visible={frame >= 900}
        x={700} y={30}
        icon="🤿" title="NBF — Neutral Buoyancy Facility"
        value="8h de simulation EVA"
        unit="La plus grande piscine du monde (11M L) simule la microgravité"
        color="#38bdf8"
      />

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/astro_narration3.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/astro_music3.mp3')} startFrom={0} volume={0.18} />
    </div>
  );
};
