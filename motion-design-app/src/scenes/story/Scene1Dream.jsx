import { useCurrentFrame, interpolate } from 'remotion';
import { StarField } from '../../components/StarField';
import { Moon } from '../../components/Moon';

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(5, 0, 20, 0.85)',
  color: '#e9d5ff',
  padding: '14px 44px',
  borderRadius: 10,
  fontSize: 34,
  fontWeight: 500,
  textAlign: 'center',
  maxWidth: '80%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(139,92,246,0.4)',
  letterSpacing: '0.03em',
  whiteSpace: 'nowrap',
};

const SUBS = [
  { text: "Il s'appelle Lucas. 18 ans.", s: 60, e: 340 },
  { text: "Chaque nuit, il rêve du même rêve...", s: 400, e: 700 },
  { text: "Devenir un grand développeur 💻", s: 750, e: 1140 },
];

const CODE_LINES = [
  { t: 'const lucas = {', color: '#569cd6', f: 270 },
  { t: '  role: "future developer",', color: '#ce9178', f: 325 },
  { t: '  passion: Infinity,', color: '#4ec9b0', f: 380 },
  { t: '  dream: true', color: '#9cdcfe', f: 435 },
  { t: '};', color: '#569cd6', f: 490 },
];

const SYMBOLS = ['{ }', '</>', '( )', '===', '=>', '**', '[ ]', '++'];

export const Scene1Dream = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const bubbleScale = interpolate(frame, [180, 295], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 20, e - 20, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative' }}>

      {/* ── Night background ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #050010 0%, #0d0028 35%, #150040 70%, #0a001a 100%)',
      }} />

      <StarField count={160} width={1920} height={1080} shooting />
      <Moon x={1730} y={125} size={125} />

      {/* Nebula glow */}
      <div style={{
        position: 'absolute', top: 100, left: 800,
        width: 600, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Room floor ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 310,
        background: 'linear-gradient(to bottom, #180a30, #0e0520)',
        borderTop: '3px solid #2d1055',
      }} />
      <div style={{
        position: 'absolute', bottom: 307, left: 0, right: 0, height: 5,
        background: '#3d1870', opacity: 0.6,
      }} />

      {/* ── Bed ── */}
      <div style={{ position: 'absolute', bottom: 130, left: 480 }}>
        {/* Headboard */}
        <div style={{
          position: 'absolute', top: -108, left: 0,
          width: 860, height: 112,
          background: 'linear-gradient(to bottom, #6d28d9, #5b21b6)',
          borderRadius: '10px 10px 0 0',
          border: '3px solid #7c3aed',
          boxShadow: '0 -4px 24px rgba(109,40,217,0.5)',
        }}>
          {[70, 290, 510, 710].map((lx) => (
            <div key={lx} style={{
              position: 'absolute', left: lx, top: 14,
              width: 100, height: 82,
              border: '2px solid #8b5cf6', borderRadius: 4, opacity: 0.45,
            }} />
          ))}
        </div>
        {/* Footboard */}
        <div style={{
          position: 'absolute', top: 162, left: 0,
          width: 860, height: 58,
          background: '#5b21b6',
          borderRadius: '0 0 8px 8px',
          border: '3px solid #7c3aed',
        }} />
        {/* Bed body */}
        <div style={{
          width: 860, height: 170,
          background: '#4c1d95',
          border: '3px solid #7c3aed',
          position: 'relative',
        }}>
          {/* Sheet */}
          <div style={{ position: 'absolute', inset: 8, background: '#ede9fe', borderRadius: 4 }} />
          {/* Blanket */}
          <div style={{
            position: 'absolute', bottom: 8, left: 8, right: 8, height: '64%',
            background: 'linear-gradient(to right, #7c3aed 0%, #8b5cf6 30%, #6d28d9 65%, #7c3aed 100%)',
            borderRadius: '6px 6px 4px 4px',
            boxShadow: 'inset 0 -10px 22px rgba(0,0,0,0.35)',
          }}>
            {[0.28, 0.54, 0.76].map((t) => (
              <div key={t} style={{
                position: 'absolute', top: `${t * 100}%`, left: 0, right: 0,
                height: 1, background: 'rgba(255,255,255,0.1)',
              }} />
            ))}
          </div>
          {/* Pillow */}
          <div style={{
            position: 'absolute', top: 12, left: 22,
            width: 235, height: 95,
            background: 'linear-gradient(135deg, #f5f0ff, #e8d5f5)',
            borderRadius: 20,
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            border: '2px solid rgba(139,92,246,0.25)',
          }} />
          {/* Lucas — head on pillow */}
          <div style={{ position: 'absolute', top: 10, left: 42 }}>
            <div style={{
              width: 74, height: 74, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f5c2a0, #e8a87c)',
              border: '2px solid #d4916a', position: 'relative',
            }}>
              {/* Hair */}
              <div style={{ position: 'absolute', top: -7, left: 9, width: 57, height: 30, background: '#2c1301', borderRadius: '50% 50% 0 0' }} />
              {/* Eyes closed */}
              <div style={{ position: 'absolute', top: 36, left: 16, width: 14, height: 2, background: '#5a3825', borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 36, left: 43, width: 14, height: 2, background: '#5a3825', borderRadius: 1 }} />
              {/* Smile */}
              <div style={{ position: 'absolute', top: 49, left: 22, width: 28, height: 10, borderBottom: '2px solid #5a3825', borderRadius: '0 0 50% 50%' }} />
            </div>
          </div>
          {/* Body lump under blanket */}
          <div style={{
            position: 'absolute', top: 42, left: 108,
            width: 295, height: 95,
            background: 'linear-gradient(to right, #8b5cf6, #7c3aed)',
            borderRadius: '40px 60px 60px 40px', opacity: 0.55,
          }} />
        </div>
      </div>

      {/* ZZZ */}
      {frame > 80 && ['z', 'Z', 'Z'].map((z, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: 600 + i * 30,
          top: 575 - i * 28 - Math.sin(frame * 0.06 + i * 1.5) * 14,
          fontSize: 18 + i * 7,
          color: '#c4b5fd',
          opacity: 0.5 + Math.sin(frame * 0.06 + i * 1.5) * 0.3,
          fontWeight: 'bold', fontFamily: 'serif',
        }}>{z}</div>
      ))}

      {/* Nightstand */}
      <div style={{ position: 'absolute', bottom: 130, right: 350, width: 130, height: 118, background: '#2c1301', borderRadius: '4px 4px 0 0' }}>
        {/* Lamp */}
        <div style={{ position: 'absolute', top: -72, left: 15 }}>
          <div style={{ width: 0, height: 0, borderLeft: '48px solid transparent', borderRight: '48px solid transparent', borderBottom: '62px solid rgba(255,224,130,0.75)' }} />
          <div style={{ width: 5, height: 22, background: '#888', margin: '0 auto' }} />
        </div>
        <div style={{ position: 'absolute', top: -120, left: -30, width: 188, height: 188, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,50,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </div>

      {/* ── Dream bubble ── */}
      {frame >= 180 && (
        <div style={{
          position: 'absolute', top: 55, left: 320,
          transform: `scale(${bubbleScale})`, transformOrigin: 'bottom left',
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: 'absolute', bottom: -22 - i * 28, left: 22 + i * 14,
              width: 16 + i * 8, height: 16 + i * 8,
              borderRadius: '50%',
              background: 'rgba(167,139,250,0.45)',
              border: '2px solid rgba(196,181,253,0.8)',
            }} />
          ))}
          <div style={{
            width: 580, height: 380,
            background: 'rgba(12, 5, 35, 0.94)',
            borderRadius: 30,
            border: '2px solid rgba(139,92,246,0.7)',
            boxShadow: '0 0 45px rgba(109,40,217,0.55), inset 0 0 50px rgba(109,40,217,0.07)',
            padding: 30, overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.14), transparent 70%)' }} />
            <div style={{ position: 'absolute', top: 10, right: 18, fontSize: 11, color: '#8b5cf6', fontFamily: 'monospace', opacity: 0.55, letterSpacing: 2 }}>// DREAM.JS</div>
            {CODE_LINES.map((line, i) => {
              const chars = Math.max(0, Math.min(line.t.length, Math.floor((frame - line.f) * 2.2)));
              return chars > 0 && (
                <div key={i} style={{ fontFamily: 'monospace', fontSize: 23, color: line.color, lineHeight: 1.75, textShadow: `0 0 8px ${line.color}55` }}>
                  {line.t.slice(0, chars)}
                  {chars < line.t.length && <span style={{ opacity: frame % 20 < 10 ? 1 : 0, background: line.color, display: 'inline-block', width: 10, height: 23, verticalAlign: 'text-bottom' }} />}
                </div>
              );
            })}
            {frame >= 560 && SYMBOLS.map((sym, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${8 + (i % 4) * 24}%`,
                top: `${14 + Math.floor(i / 4) * 42 + Math.sin(frame * 0.04 + i * 0.8) * 9}%`,
                fontSize: 13, color: '#8b5cf6',
                opacity: 0.45 + Math.sin(frame * 0.07 + i) * 0.3,
                fontFamily: 'monospace', fontWeight: 'bold',
              }}>{sym}</div>
            ))}
          </div>
        </div>
      )}

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}
    </div>
  );
};
