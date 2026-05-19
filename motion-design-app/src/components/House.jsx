import { useCurrentFrame, interpolate } from 'remotion';

export const House = ({
  x = 200,
  y = 500,
  scale = 1,
  wallColor = '#f4a261',
  roofColor = '#e76f51',
  appearAt = 0,
  appearDuration = 30,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [appearAt, appearAt + appearDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const S = scale;
  const W = 120 * S;
  const H = 90 * S;

  const Window = ({ left, top }) => (
    <div style={{
      position: 'absolute', left, top,
      width: W * 0.27, height: H * 0.3,
      background: '#90e0ef', borderRadius: 3 * S,
      border: `${2 * S}px solid #bbb`,
      display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr',
      gap: 1,
    }}>
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `scaleY(${progress})`,
      transformOrigin: 'bottom center',
      opacity: progress,
    }}>
      {/* Walls */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: W, height: H,
        background: wallColor,
        borderRadius: `0 0 ${4 * S}px ${4 * S}px`,
        boxShadow: `inset -${5 * S}px 0 ${12 * S}px rgba(0,0,0,0.1)`,
      }}>
        <Window left={W * 0.08} top={H * 0.18} />
        <Window left={W * 0.62} top={H * 0.18} />
        {/* Door */}
        <div style={{
          position: 'absolute', bottom: 0, left: '36%',
          width: '28%', height: '44%',
          background: '#8B4513',
          borderRadius: `${7 * S}px ${7 * S}px 0 0`,
          boxShadow: `inset -${3 * S}px 0 ${6 * S}px rgba(0,0,0,0.2)`,
        }}>
          <div style={{
            position: 'absolute', right: '18%', top: '48%',
            width: 5 * S, height: 5 * S,
            borderRadius: '50%', background: '#ffca3a',
          }} />
        </div>
      </div>
      {/* Roof */}
      <div style={{
        position: 'absolute',
        bottom: H - 2 * S,
        left: -10 * S,
        width: 0, height: 0,
        borderLeft: `${W / 2 + 10 * S}px solid transparent`,
        borderRight: `${W / 2 + 10 * S}px solid transparent`,
        borderBottom: `${H * 0.54}px solid ${roofColor}`,
        filter: `drop-shadow(0 -2px 4px rgba(0,0,0,0.15))`,
      }} />
      {/* Chimney */}
      <div style={{
        position: 'absolute',
        bottom: H + H * 0.28,
        left: W * 0.72,
        width: 14 * S, height: 32 * S,
        background: roofColor,
        borderRadius: `${2 * S}px ${2 * S}px 0 0`,
      }} />
    </div>
  );
};
