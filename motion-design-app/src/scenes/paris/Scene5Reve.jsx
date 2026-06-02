import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';

const fi = (f, s, d) => interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const seeded = (s) => { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x); };

const SUBS = [
  { text: "Cette nuit-là, Léa rêve.", s: 30, e: 250 },
  { text: "Des molécules dansent. Des équations brillent.", s: 290, e: 530 },
  { text: "Elle voit les secrets de la matière et de la vie.", s: 570, e: 820 },
  { text: "\"Je vais y arriver.\" — Elle le sait, au fond d'elle.", s: 860, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(5,0,20,0.9)',
  color: '#e8d8ff',
  padding: '14px 44px', borderRadius: 10,
  fontSize: 34, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(180,100,255,0.3)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

// Hélice ADN
const DNA = ({ x, y, frame }) => {
  const strands = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    const phase = frame * 0.04;
    const py = y + i * 40;
    const lx = x + Math.cos(t * Math.PI * 3 + phase) * 50;
    const rx = x + Math.cos(t * Math.PI * 3 + phase + Math.PI) * 50;
    return { py, lx, rx, i };
  });
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0 }}>
      {strands.map(({ py, lx, rx, i }) => (
        <div key={i}>
          {/* Brin gauche */}
          <div style={{
            position: 'absolute', left: lx - 6, top: py - 6,
            width: 12, height: 12, borderRadius: '50%',
            background: '#7dd3fc',
            boxShadow: '0 0 8px #7dd3fc88',
          }} />
          {/* Brin droit */}
          <div style={{
            position: 'absolute', left: rx - 6, top: py - 6,
            width: 12, height: 12, borderRadius: '50%',
            background: '#f472b6',
            boxShadow: '0 0 8px #f472b688',
          }} />
          {/* Liaison */}
          <div style={{
            position: 'absolute',
            left: Math.min(lx, rx), top: py - 1,
            width: Math.abs(rx - lx), height: 2,
            background: `linear-gradient(90deg, #7dd3fc, #a78bfa, #f472b6)`,
            opacity: 0.6,
          }} />
        </div>
      ))}
    </div>
  );
};

// Particule flottante
const FloatParticle = ({ seed, frame, color, text }) => {
  const x = seeded(seed) * 1800 + 60;
  const baseY = seeded(seed + 0.1) * 800 + 60;
  const y = baseY + Math.sin(frame * 0.02 + seed * 2) * 30;
  const scale = 0.8 + Math.sin(frame * 0.03 + seed) * 0.2;
  const opacity = 0.5 + Math.sin(frame * 0.04 + seed * 1.5) * 0.3;
  const appear = fi(frame, Math.floor(seeded(seed + 0.5) * 400) + 50, 60);
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      color, fontSize: 20 + seeded(seed + 0.3) * 18,
      fontFamily: 'Georgia, serif', fontWeight: 600,
      opacity: opacity * appear,
      transform: `scale(${scale}) rotate(${Math.sin(frame * 0.02 + seed) * 8}deg)`,
      textShadow: `0 0 20px ${color}`,
      letterSpacing: 1,
    }}>{text}</div>
  );
};

const scienceSymbols = [
  { seed: 1, color: '#7dd3fc', text: 'E = mc²' },
  { seed: 2, color: '#f472b6', text: '∫₀^∞ e^(-x²)dx' },
  { seed: 3, color: '#a78bfa', text: 'DNA ⟶ RNA ⟶ protéine' },
  { seed: 4, color: '#34d399', text: 'H₂O + CO₂ → C₆H₁₂O₆' },
  { seed: 5, color: '#fbbf24', text: 'F = G·m₁m₂/r²' },
  { seed: 6, color: '#fb923c', text: '∇·E = ρ/ε₀' },
  { seed: 7, color: '#7dd3fc', text: 'ΔS ≥ 0' },
  { seed: 8, color: '#e879f9', text: 'Ψ(x,t) = Ae^(ikx−iωt)' },
  { seed: 9, color: '#34d399', text: 'pH = −log[H⁺]' },
  { seed: 10, color: '#fbbf24', text: 'λ = h/mv' },
  { seed: 11, color: '#a78bfa', text: 'σ = F/A' },
  { seed: 12, color: '#f472b6', text: 'N_A = 6.022×10²³' },
];

// Étoile
const StarDot = ({ x, y, size, opacity, frame, phase }) => {
  const twinkle = 0.4 + Math.sin(frame * 0.06 + phase) * 0.4;
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: '50%',
      background: '#fff', opacity: opacity * twinkle,
    }} />
  );
};

const starField = Array.from({ length: 120 }, (_, i) => ({
  x: seeded(i) * 1920,
  y: seeded(i + 0.1) * 1080,
  size: 0.5 + seeded(i + 0.2) * 2,
  opacity: 0.3 + seeded(i + 0.3) * 0.7,
  phase: seeded(i + 0.4) * Math.PI * 2,
}));

export const ParisScene5Reve = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Léa au centre, flottant
  const leaFloat = Math.sin(frame * 0.025) * 20;
  const leaGlow = 0.6 + Math.sin(frame * 0.04) * 0.4;
  const leaScale = 1 + Math.sin(frame * 0.02) * 0.05;

  // Cercles concentriques pulsants
  const pulseScale = 1 + Math.sin(frame * 0.05) * 0.05;
  const pulse2 = 1 + Math.sin(frame * 0.05 + 1) * 0.05;

  // Nébuleuse colorée qui évolue
  const nebula1Hue = (frame * 0.3) % 360;
  const nebula2Hue = (frame * 0.2 + 120) % 360;

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Fond cosmos profond */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, #0d0020 0%, #050010 50%, #000005 100%)' }} />

      {/* Étoiles */}
      {starField.map((s, i) => <StarDot key={i} {...s} frame={frame} />)}

      {/* Nébuleuses colorées */}
      <div style={{
        position: 'absolute', left: '10%', top: '10%',
        width: 600, height: 400,
        background: `radial-gradient(ellipse, hsla(${nebula1Hue},80%,60%,0.08) 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', right: '5%', bottom: '20%',
        width: 500, height: 350,
        background: `radial-gradient(ellipse, hsla(${nebula2Hue},70%,55%,0.07) 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', left: '40%', top: '5%',
        width: 400, height: 250,
        background: 'radial-gradient(ellipse, rgba(100,200,255,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
      }} />

      {/* Cercles concentriques autour de Léa */}
      {[120, 200, 300, 420, 560].map((r, i) => (
        <div key={i} style={{
          position: 'absolute', left: 960 - r, top: 440 - r,
          width: r * 2, height: r * 2, borderRadius: '50%',
          border: `1px solid rgba(${180 - i * 20},${100 + i * 30},255,${0.15 - i * 0.02})`,
          transform: `scale(${i % 2 === 0 ? pulseScale : pulse2})`,
          boxShadow: i === 0 ? `0 0 40px rgba(160,100,255,0.15)` : 'none',
        }} />
      ))}

      {/* Hélices ADN */}
      <div style={{ opacity: fi(frame, 100, 80) }}>
        <DNA x={200} y={150} frame={frame} />
      </div>
      <div style={{ opacity: fi(frame, 200, 80) }}>
        <DNA x={1650} y={200} frame={frame} />
      </div>
      <div style={{ opacity: fi(frame, 300, 80) }}>
        <DNA x={1100} y={600} frame={frame} />
      </div>

      {/* Symboles scientifiques flottants */}
      {scienceSymbols.map((s, i) => <FloatParticle key={i} {...s} frame={frame} />)}

      {/* Particules lumineuses */}
      {Array.from({ length: 30 }, (_, i) => {
        const px = 960 + Math.cos(frame * 0.015 + i * 0.21) * (200 + i * 18);
        const py = 540 + Math.sin(frame * 0.015 + i * 0.21) * (120 + i * 10);
        const color = `hsl(${(i * 23 + frame * 0.5) % 360}, 80%, 70%)`;
        const op = 0.4 + Math.sin(frame * 0.08 + i * 0.5) * 0.4;
        const sz = 3 + Math.sin(i * 2.3) * 2;
        return (
          <div key={i} style={{
            position: 'absolute', left: px, top: py,
            width: sz, height: sz, borderRadius: '50%',
            background: color, opacity: op,
            boxShadow: `0 0 ${sz * 3}px ${color}`,
          }} />
        );
      })}

      {/* LÉA — personnage central flottant */}
      <div style={{
        position: 'absolute', left: 960, top: 380 + leaFloat,
        transform: `translateX(-50%) scale(${leaScale})`,
        filter: `drop-shadow(0 0 ${20 + leaGlow * 20}px rgba(160,100,255,${leaGlow * 0.6}))`,
      }}>
        {/* Aura */}
        <div style={{
          position: 'absolute', left: -60, top: -60,
          width: 180, height: 240,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(160,100,255,${leaGlow * 0.25}) 0%, transparent 70%)`,
        }} />

        {/* Tête */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f5c2a0, #e8a87c)',
          border: '2px solid #d4916a', margin: '0 auto', position: 'relative',
          boxShadow: `0 0 20px rgba(160,100,255,${leaGlow * 0.4})`,
        }}>
          <div style={{ position: 'absolute', top: -5, left: 8, width: 40, height: 22, background: '#3d1c00', borderRadius: '50% 50% 0 0' }} />
          <div style={{ position: 'absolute', top: 12, left: -6, width: 12, height: 32, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
          <div style={{ position: 'absolute', top: 12, right: -6, width: 12, height: 32, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
          {/* Yeux fermés (rêve) — courbes */}
          <div style={{ position: 'absolute', top: 20, left: 10, width: 12, height: 6, borderRadius: '0 0 6px 6px', border: '2px solid #8B5A3A', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }} />
          <div style={{ position: 'absolute', top: 20, right: 10, width: 12, height: 6, borderRadius: '0 0 6px 6px', border: '2px solid #8B5A3A', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }} />
          {/* Sourire paisible */}
          <div style={{ position: 'absolute', bottom: 10, left: 13, width: 28, height: 10, borderRadius: '0 0 14px 14px', border: '2px solid #c47a5a', borderTop: 'none' }} />
        </div>

        {/* Corps */}
        <div style={{
          width: 46, height: 66, margin: '0 auto',
          background: 'linear-gradient(180deg, #c0392b, #922b21)',
          borderRadius: '4px 4px 0 0', position: 'relative',
          boxShadow: `0 4px 20px rgba(160,100,255,0.3)`,
        }}>
          <div style={{ position: 'absolute', top: 0, left: 11, width: 24, height: 14, background: '#e74c3c', borderRadius: '0 0 10px 10px' }} />
          {/* Bras tendus (en lévitation) */}
          <div style={{
            position: 'absolute', left: -50, top: 8, width: 48, height: 10,
            background: '#c0392b', borderRadius: 5,
            transform: 'rotate(-20deg)',
            boxShadow: '0 0 10px rgba(160,100,255,0.3)',
          }} />
          <div style={{
            position: 'absolute', right: -50, top: 8, width: 48, height: 10,
            background: '#c0392b', borderRadius: 5,
            transform: 'rotate(20deg)',
            boxShadow: '0 0 10px rgba(160,100,255,0.3)',
          }} />
        </div>

        {/* Jambes croisées / flottantes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <div style={{
            width: 16, height: 50, background: '#2c3e50',
            borderRadius: '0 0 4px 4px',
            transform: 'rotate(15deg)', transformOrigin: 'top center', position: 'relative',
          }}>
            <div style={{ position: 'absolute', bottom: -8, left: 0, width: 18, height: 10, background: '#1a252f', borderRadius: '0 0 6px 6px' }} />
          </div>
          <div style={{
            width: 16, height: 50, background: '#2c3e50',
            borderRadius: '0 0 4px 4px',
            transform: 'rotate(-15deg)', transformOrigin: 'top center', position: 'relative',
          }}>
            <div style={{ position: 'absolute', bottom: -8, left: 0, width: 18, height: 10, background: '#1a252f', borderRadius: '0 0 6px 6px' }} />
          </div>
        </div>
      </div>

      {/* Titre "Je rêve de chercher" */}
      {frame > 700 && (
        <div style={{
          position: 'absolute', top: 80, left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(220,180,255,0.9)',
          fontSize: 52, fontWeight: 900,
          fontFamily: 'Georgia, serif',
          textAlign: 'center',
          textShadow: '0 0 40px rgba(180,100,255,0.8), 0 0 80px rgba(160,80,255,0.4)',
          letterSpacing: 4,
          opacity: fi(frame, 700, 80),
        }}>✨ Je vais percer les secrets du vivant ✨</div>
      )}

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/paris_narration5.mp3')} startFrom={0} volume={1} />
    </div>
  );
};
