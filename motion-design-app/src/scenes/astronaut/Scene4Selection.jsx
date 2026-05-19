import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import { Counter } from '../../components/Counter';
import { Bounce } from '../../components/Bounce';
import { Confetti } from '../../components/Confetti';

const SUBS = [
  { text: "En 2021, 18 232 personnes ont postulé à la NASA.", s: 50, e: 300 },
  { text: "Seulement 10 ont été sélectionnés. 1 chance sur 1 823.", s: 340, e: 580 },
  { text: "Tests médicaux, psychologiques, techniques... tout compte.", s: 620, e: 860 },
  { text: "Lucas reçoit ses ailes d'astronaute. Son destin commence.", s: 900, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(5,5,20,0.90)',
  color: '#f0f9ff', padding: '14px 44px',
  borderRadius: 10, fontSize: 32, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(56,189,248,0.35)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

const sr = (s) => { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); };

const TestStep = ({ icon, label, passed, x, y }) => (
  <div style={{
    position: 'absolute', left: x, top: y,
    display: 'flex', alignItems: 'center', gap: 12,
    background: passed ? 'rgba(5,46,22,0.85)' : 'rgba(30,10,10,0.85)',
    border: `1px solid ${passed ? '#22c55e' : '#3f3f46'}`,
    borderRadius: 10, padding: '10px 20px', width: 260,
    boxShadow: passed ? '0 0 15px rgba(34,197,94,0.2)' : 'none',
  }}>
    <div style={{ fontSize: 26 }}>{passed ? '✅' : '⏳'}</div>
    <div>
      <div style={{ fontSize: 18 }}>{icon}</div>
      <div style={{ color: passed ? '#86efac' : '#6b7280', fontSize: 13, fontWeight: 600 }}>{label}</div>
    </div>
  </div>
);

export const AstroScene4Selection = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Entonnoir de sélection
  const totalCandidates = 18232;
  const showFunnel = frame >= 50;

  // Nombre de candidats éliminés progressivement
  const remaining = Math.max(10, Math.round(interpolate(frame, [100, 600], [totalCandidates, 10], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })));

  // Diplôme apparaît
  const diplomaScale = interpolate(frame, [860, 960], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const diplomaRotate = interpolate(frame, [860, 960], [-15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Confettis pour la victoire
  const showConfetti = frame >= 940;

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Fond NASA/officiel */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #000820 0%, #001240 40%, #000c30 100%)' }} />

      {/* Grille de fond subtile */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Logo NASA stylisé */}
      <div style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ color: '#38bdf8', fontSize: 13, fontWeight: 700, letterSpacing: 6, marginBottom: 4 }}>PROGRAMME DE SÉLECTION</div>
        <div style={{ color: '#fff', fontSize: 42, fontWeight: 900, letterSpacing: 8 }}>ASTRONAUTE</div>
        <div style={{ width: 200, height: 2, background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)', margin: '8px auto 0' }} />
      </div>

      {/* ENTONNOIR de sélection */}
      {showFunnel && (
        <div style={{ position: 'absolute', top: 120, left: 80 }}>
          {/* Foule de candidats */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 8 }}>CANDIDATS TOTAUX</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: 480, maxHeight: 200, overflow: 'hidden' }}>
              {Array.from({ length: Math.min(180, Math.round(remaining / 100)) }, (_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i < 10 ? '#22c55e' : '#334155',
                  boxShadow: i < 10 ? '0 0 6px rgba(34,197,94,0.5)' : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* Entonnoir SVG */}
          <svg width={480} height={180} style={{ display: 'block' }}>
            <polygon points="0,0 480,0 340,180 140,180" fill="rgba(30,58,138,0.3)" stroke="#3b82f6" strokeWidth={2} />
            {/* Lignes de flou */}
            <line x1={120} y1={60} x2={360} y2={60} stroke="rgba(59,130,246,0.3)" strokeWidth={1} />
            <line x1={140} y1={120} x2={340} y2={120} stroke="rgba(59,130,246,0.3)" strokeWidth={1} />
          </svg>

          {/* Compteur */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <div style={{ color: '#38bdf8', fontSize: 52, fontWeight: 900, textShadow: '0 0 20px rgba(56,189,248,0.5)' }}>
              {remaining.toLocaleString('fr-FR')}
            </div>
            <div style={{ color: '#64748b', fontSize: 14 }}>candidats restants</div>
          </div>
        </div>
      )}

      {/* Étapes de sélection */}
      <div style={{ position: 'absolute', top: 130, left: 620 }}>
        <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: 3, marginBottom: 20 }}>ÉTAPES DE SÉLECTION</div>
        <TestStep icon="📋" label="Dossier & qualifications" passed={frame >= 150} x={0} y={0} />
        <TestStep icon="🏃" label="Tests physiques" passed={frame >= 280} x={0} y={70} />
        <TestStep icon="🧬" label="Bilan médical complet" passed={frame >= 400} x={0} y={140} />
        <TestStep icon="🧠" label="Tests psychologiques" passed={frame >= 520} x={0} y={210} />
        <TestStep icon="🔬" label="Entretiens techniques" passed={frame >= 640} x={0} y={280} />
        <TestStep icon="🌍" label="Compétences en langues" passed={frame >= 760} x={0} y={350} />
        <TestStep icon="🎖️" label="Sélection finale" passed={frame >= 880} x={0} y={420} />
      </div>

      {/* Stats en temps réel */}
      <div style={{ position: 'absolute', top: 130, right: 80, width: 380 }}>
        <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: 3, marginBottom: 20 }}>STATISTIQUES</div>
        {[
          { label: 'Candidats 2021 (NASA)', value: '18 232', color: '#f87171', icon: '👥' },
          { label: 'Sélectionnés', value: '10', color: '#22c55e', icon: '🌟' },
          { label: 'Taux de sélection', value: '0,05%', color: '#fbbf24', icon: '📊' },
          { label: 'Durée de formation', value: '2 ans', color: '#60a5fa', icon: '📅' },
          { label: 'Pays représentés', value: '15+', color: '#c084fc', icon: '🌍' },
        ].map((stat, i) => {
          const visible = frame >= 100 + i * 80;
          const opacity = visible ? interpolate(frame, [100 + i * 80, 130 + i * 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;
          return (
            <div key={i} style={{
              opacity, marginBottom: 16,
              background: 'rgba(15,23,42,0.8)', borderRadius: 10, padding: '12px 18px',
              border: `1px solid ${stat.color}33`,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ fontSize: 24 }}>{stat.icon}</div>
              <div>
                <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>{stat.label}</div>
                <div style={{ color: stat.color, fontSize: 22, fontWeight: 900 }}>{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diplôme / Ailes d'astronaute */}
      {frame >= 860 && (
        <div style={{
          position: 'absolute', bottom: 140, left: '50%',
          transform: `translateX(-50%) scale(${diplomaScale}) rotate(${diplomaRotate}deg)`,
          transformOrigin: 'center bottom',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f, #0f2040)',
            border: '4px solid #fbbf24',
            borderRadius: 16, padding: '30px 60px',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(251,191,36,0.4)',
            position: 'relative',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🚀</div>
            <div style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700, letterSpacing: 4 }}>CERTIFICAT OFFICIEL</div>
            <div style={{ color: '#fff', fontSize: 32, fontWeight: 900, margin: '8px 0' }}>ASTRONAUTE CERTIFIÉ</div>
            <div style={{ color: '#93c5fd', fontSize: 18 }}>Lucas — Promotion 2026</div>
            <div style={{ color: '#475569', fontSize: 13, marginTop: 8 }}>Mission ISS · Expédition 72</div>
            {/* Étoiles dorées */}
            {['⭐', '⭐', '⭐'].map((s, i) => (
              <span key={i} style={{ fontSize: 20, margin: '0 4px' }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Confettis */}
      {showConfetti && <Confetti x={960} y={400} count={80} />}

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/astro_narration4.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/astro_music4.mp3')} startFrom={0} volume={0.18} />
      {showConfetti && <Audio src={staticFile('audio/celebration.mp3')} startFrom={0} volume={0.35} />}
    </div>
  );
};
