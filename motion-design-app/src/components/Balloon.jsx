import { useCurrentFrame } from 'remotion';

export const Balloon = ({
  x = 200,
  y = 300,
  scale = 1,
  color = '#ff595e',
  accent = '#ffca3a',
  rising = false,
}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.04) * 8;
  const float = Math.sin(frame * 0.03) * 12;
  const posY = rising ? y - frame * 1.5 : y + float;

  const R = 70 * scale;

  return (
    <div style={{ position: 'absolute', left: x + sway, top: posY }}>
      {/* Balloon envelope */}
      <div style={{
        width: R * 2,
        height: R * 2.2,
        borderRadius: '50% 50% 45% 45%',
        background: `radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.6) 0%, ${color} 45%, ${accent} 100%)`,
        position: 'relative',
        boxShadow: `inset -${R * 0.15}px -${R * 0.1}px ${R * 0.3}px rgba(0,0,0,0.2)`,
        overflow: 'hidden',
      }}>
        {/* Vertical stripes */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${i * 25 + 4}%`,
            top: 0,
            width: '14%',
            height: '100%',
            background: 'rgba(0,0,0,0.07)',
            borderRadius: '50%',
          }} />
        ))}
        {/* Highlight */}
        <div style={{
          position: 'absolute',
          left: '20%',
          top: '10%',
          width: '25%',
          height: '35%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
        }} />
      </div>

      {/* Ropes */}
      <svg
        width={R * 2}
        height={R * 0.55}
        style={{ display: 'block', marginTop: -4 }}
      >
        <line x1={R * 0.28} y1={0} x2={R * 0.5} y2={R * 0.5} stroke="#888" strokeWidth={1.5 * scale} />
        <line x1={R * 0.72} y1={0} x2={R * 0.5} y2={R * 0.5} stroke="#888" strokeWidth={1.5 * scale} />
        <line x1={R * 1.28} y1={0} x2={R * 1.5} y2={R * 0.5} stroke="#888" strokeWidth={1.5 * scale} />
        <line x1={R * 1.72} y1={0} x2={R * 1.5} y2={R * 0.5} stroke="#888" strokeWidth={1.5 * scale} />
      </svg>

      {/* Basket */}
      <div style={{
        width: R * 0.95,
        height: R * 0.42,
        background: '#8B4513',
        borderRadius: `${4 * scale}px`,
        margin: '0 auto',
        border: `${2 * scale}px solid #5c2d0e`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: `0 ${6 * scale}px`,
        boxSizing: 'border-box',
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            width: 2 * scale,
            height: '70%',
            background: '#5c2d0e',
            borderRadius: 1,
          }} />
        ))}
      </div>
    </div>
  );
};
