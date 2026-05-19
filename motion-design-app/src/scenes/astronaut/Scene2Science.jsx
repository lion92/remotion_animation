import { useCurrentFrame, interpolate, Audio, staticFile, Sequence } from 'remotion';
import { ProgressBar } from '../../components/ProgressBar';
import { Counter } from '../../components/Counter';
import { TypeWriter } from '../../components/TypeWriter';
import { ZoomIn } from '../../components/ZoomIn';

const InfoCard = ({ title, value, unit, icon, visible, x, y, color = '#3b82f6' }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      background: 'rgba(5,10,30,0.92)',
      border: `1px solid ${color}66`,
      borderRadius: 14, padding: '14px 22px',
      backdropFilter: 'blur(10px)',
      boxShadow: `0 0 24px ${color}33`,
      minWidth: 300,
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ color: color, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>{title}</div>
      <div style={{ color: '#fff', fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>{value}</div>
      {unit && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>{unit}</div>}
    </div>
  );
};

const Formula = ({ text, color, visible, x, y, size = 22 }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      fontFamily: 'Georgia, serif', fontStyle: 'italic',
      fontSize: size, color: color,
      textShadow: `0 0 10px ${color}88`,
      background: 'rgba(0,0,0,0.4)',
      padding: '6px 14px', borderRadius: 6,
      border: `1px solid ${color}44`,
    }}>{text}</div>
  );
};

const SUBS = [
  { text: "Pour conquérir l'espace, il faut d'abord maîtriser la science.", s: 50, e: 310 },
  { text: "Lucas étudie la physique, les maths, l'astrophysique.", s: 350, e: 580 },
  { text: "L'équation de Tsiolkovsky gouverne chaque fusée.", s: 620, e: 870 },
  { text: "La vitesse de libération : 11,2 km/s. La clé de l'espace.", s: 900, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(5,5,20,0.90)',
  color: '#e2e8f0', padding: '14px 44px',
  borderRadius: 10, fontSize: 32, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(100,130,255,0.35)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

export const AstroScene2Science = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Livres animés
  const book1Y = interpolate(frame, [40, 110], [200, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const book2Y = interpolate(frame, [80, 150], [200, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const book3Y = interpolate(frame, [120, 190], [200, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Ampoule = idée
  const bulbGlow = 0.6 + Math.sin(frame * 0.08) * 0.4;

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Fond salle d'étude nocturne */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #080818 0%, #0d1230 40%, #0a0e25 100%)' }} />

      {/* Mur de fond avec texture */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 730, background: '#0f1535', borderBottom: '4px solid #1a2050' }} />

      {/* Tableau noir */}
      <div style={{
        position: 'absolute', top: 60, left: 360, right: 360, height: 540,
        background: '#0d1a0d',
        border: '12px solid #5c4033',
        borderRadius: 8,
        boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>
        {/* Encadrement bois intérieur */}
        <div style={{ position: 'absolute', inset: 0, border: '4px solid #3d2b1f', borderRadius: 2 }} />

        {/* Titre du tableau */}
        {frame >= 30 && (
          <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', color: '#e2e8f0aa', fontSize: 18, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
            PHYSIQUE SPATIALE
          </div>
        )}

        {/* Loi de Newton 2 */}
        {frame >= 80 && (
          <div style={{ position: 'absolute', top: 70, left: 60 }}>
            <div style={{ color: '#93c5fd', fontSize: 14, fontWeight: 600, marginBottom: 6, letterSpacing: 2 }}>2ème LOI DE NEWTON</div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#fde68a', fontSize: 36, textShadow: '0 0 12px rgba(253,230,138,0.5)' }}>
              F = m · a
            </div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Force = masse × accélération</div>
          </div>
        )}

        {/* Équation Tsiolkovsky */}
        {frame >= 300 && (
          <div style={{ position: 'absolute', top: 70, right: 50, maxWidth: 460 }}>
            <div style={{ color: '#86efac', fontSize: 14, fontWeight: 600, marginBottom: 6, letterSpacing: 2 }}>ÉQUATION DE TSIOLKOVSKY (1903)</div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#bbf7d0', fontSize: 28, textShadow: '0 0 12px rgba(187,247,208,0.4)' }}>
              Δv = Isp × g₀ × ln(m₀/mf)
            </div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 5, lineHeight: 1.6 }}>
              Δv = variation de vitesse<br />
              Isp = impulsion spécifique<br />
              m₀/mf = ratio de masse (carburant/sec)
            </div>
          </div>
        )}

        {/* Vitesse de libération */}
        {frame >= 500 && (
          <div style={{ position: 'absolute', bottom: 130, left: 60 }}>
            <div style={{ color: '#f9a8d4', fontSize: 14, fontWeight: 600, marginBottom: 6, letterSpacing: 2 }}>VITESSE DE LIBÉRATION</div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#fecdd3', fontSize: 30, textShadow: '0 0 12px rgba(254,205,211,0.4)' }}>
              v = √(2GM/r) ≈ 11,2 km/s
            </div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Vitesse min. pour quitter l'attraction terrestre</div>
          </div>
        )}

        {/* Loi de Kepler */}
        {frame >= 700 && (
          <div style={{ position: 'absolute', bottom: 70, right: 50 }}>
            <div style={{ color: '#c4b5fd', fontSize: 14, fontWeight: 600, marginBottom: 6, letterSpacing: 2 }}>3ème LOI DE KEPLER</div>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#ddd6fe', fontSize: 28, textShadow: '0 0 12px rgba(221,214,254,0.4)' }}>
              T² = (4π²/GM) × a³
            </div>
            <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Période orbitale² ∝ demi-grand axe³</div>
          </div>
        )}

        {/* Craie dessin : planète + orbite */}
        {frame >= 400 && (
          <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)' }}>
            <svg width={200} height={80} style={{ opacity: 0.35 }}>
              <ellipse cx={100} cy={50} rx={90} ry={30} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="5,4" />
              <circle cx={30} cy={50} r={12} fill="none" stroke="#fff" strokeWidth={1.5} />
              <circle cx={175} cy={38} r={5} fill="#fff" />
              <line x1={100} y1={50} x2={175} y2={38} stroke="#fff" strokeWidth={1} strokeDasharray="3,3" />
            </svg>
          </div>
        )}
      </div>

      {/* Cadre bois autour du tableau */}
      <div style={{ position: 'absolute', top: 52, left: 352, right: 352, height: 8, background: 'linear-gradient(to bottom, #8b5e3c, #5c4033)', borderRadius: '4px 4px 0 0' }} />
      <div style={{ position: 'absolute', top: 592, left: 352, right: 352, height: 8, background: 'linear-gradient(to top, #8b5e3c, #5c4033)' }} />

      {/* Bureau */}
      <div style={{ position: 'absolute', bottom: 180, left: 80, right: 80, height: 16, background: 'linear-gradient(to bottom, #6b3a2a, #4a2820)', borderRadius: 4, boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }} />

      {/* Livres */}
      {[
        { left: 120, color: '#2563eb', title: 'ASTRO', y: book1Y },
        { left: 165, color: '#dc2626', title: 'MATH', y: book2Y },
        { left: 210, color: '#16a34a', title: 'PHYS', y: book3Y },
      ].map((book, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 196 - book.y,
          left: book.left, width: 36, height: 110,
          background: `linear-gradient(to right, ${book.color}cc, ${book.color})`,
          borderRadius: '3px 3px 0 0',
          boxShadow: '2px 0 6px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: '#fff', fontSize: 8, fontWeight: 700, letterSpacing: 1, transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>{book.title}</div>
        </div>
      ))}

      {/* Lampe de bureau */}
      <div style={{ position: 'absolute', bottom: 196, right: 200 }}>
        <div style={{ width: 10, height: 90, background: '#888', margin: '0 auto' }} />
        <div style={{ width: 0, height: 0, borderLeft: '55px solid transparent', borderRight: '55px solid transparent', borderTop: '70px solid rgba(255,220,100,0.8)', marginLeft: -50 }} />
        <div style={{
          position: 'absolute', top: -90, left: -120, width: 240, height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,220,80,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Compteur heures d'étude */}
      <div style={{ position: 'absolute', top: 620, left: 120 }}>
        <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>HEURES D'ÉTUDE</div>
        <div style={{ color: '#fbbf24', fontSize: 52, fontWeight: 900, lineHeight: 1 }}>
          <Counter from={0} to={10000} start={50} duration={900} suffix=" h" style={{ color: '#fbbf24' }} />
        </div>
        <div style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>10 000h pour maîtriser une discipline</div>
      </div>

      {/* Barres de progression matières */}
      <div style={{ position: 'absolute', top: 620, right: 120, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[
          { label: 'Physique', color: '#60a5fa', start: 80, val: 95 },
          { label: 'Mathématiques', color: '#34d399', start: 140, val: 88 },
          { label: 'Astrophysique', color: '#f472b6', start: 200, val: 92 },
          { label: 'Anglais', color: '#fbbf24', start: 260, val: 85 },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{s.label}</span>
              <span style={{ color: s.color, fontSize: 13, fontWeight: 700 }}>
                {Math.min(s.val, Math.max(0, Math.round(interpolate(frame, [s.start, s.start + 200], [0, s.val], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))))}%
              </span>
            </div>
            <ProgressBar start={s.start} duration={200} width={380} height={10} color={s.color} bgColor="#1e293b" />
          </div>
        ))}
      </div>

      {/* Cartes éducatives */}
      <InfoCard
        visible={frame >= 350 && frame < 700}
        x={1480} y={630}
        icon="🔭" title="Savoir indispensable"
        value="Mécanique orbitale"
        unit="La base du pilotage spatial — comprendre comment les objets orbitent"
        color="#60a5fa"
      />
      <InfoCard
        visible={frame >= 700}
        x={1480} y={630}
        icon="🧮" title="Record à battre"
        value="2 ans de formation"
        unit="Durée minimale pour intégrer un programme astronaute"
        color="#34d399"
      />

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/astro_narration2.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/astro_music2.mp3')} startFrom={0} volume={0.18} />
    </div>
  );
};
