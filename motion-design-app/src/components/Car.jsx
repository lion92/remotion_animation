import { useCurrentFrame } from 'remotion';

export const Car = ({ x = 0, y = 0, scale = 1, color = '#e63946', speed = 2, direction = 1 }) => {
  const frame = useCurrentFrame();
  const posX = x + frame * speed * direction;
  const wheelSpin = frame * speed * 5 * direction;

  const W = 160 * scale;
  const H = 70 * scale;
  const wr = 22 * scale;

  return (
    <div style={{
      position: 'absolute',
      left: posX,
      top: y,
      width: W,
      transform: direction === -1 ? 'scaleX(-1)' : undefined,
    }}>
      {/* Body */}
      <div style={{
        position: 'absolute',
        bottom: wr,
        width: W,
        height: H,
        background: `linear-gradient(160deg, ${color}dd, ${color})`,
        borderRadius: `${14 * scale}px ${14 * scale}px 6px 6px`,
        boxShadow: `inset 0 ${4 * scale}px ${10 * scale}px rgba(255,255,255,0.25)`,
      }} />
      {/* Roof */}
      <div style={{
        position: 'absolute',
        bottom: wr + H * 0.58,
        left: W * 0.18,
        width: W * 0.58,
        height: H * 0.62,
        background: `linear-gradient(160deg, ${color}cc, ${color})`,
        borderRadius: `${14 * scale}px ${14 * scale}px 0 0`,
      }} />
      {/* Window left */}
      <div style={{
        position: 'absolute',
        bottom: wr + H * 0.63,
        left: W * 0.2,
        width: W * 0.25,
        height: H * 0.48,
        background: 'linear-gradient(135deg, #caf0f8, #90e0ef)',
        borderRadius: `${8 * scale}px ${3 * scale}px 0 0`,
        opacity: 0.85,
      }} />
      {/* Window right */}
      <div style={{
        position: 'absolute',
        bottom: wr + H * 0.63,
        left: W * 0.49,
        width: W * 0.24,
        height: H * 0.48,
        background: 'linear-gradient(135deg, #caf0f8, #90e0ef)',
        borderRadius: `${3 * scale}px ${8 * scale}px 0 0`,
        opacity: 0.85,
      }} />
      {/* Headlight */}
      <div style={{
        position: 'absolute',
        bottom: wr + H * 0.25,
        right: W * 0.02,
        width: W * 0.07,
        height: H * 0.22,
        background: '#fffde7',
        borderRadius: `0 ${4 * scale}px ${4 * scale}px 0`,
        boxShadow: `0 0 ${8 * scale}px #fffde7`,
      }} />
      {/* Wheels */}
      {[W * 0.17, W * 0.74].map((wx, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: 0,
          left: wx - wr,
          width: wr * 2,
          height: wr * 2,
          borderRadius: '50%',
          background: '#1a1a2e',
          transform: `rotate(${wheelSpin}deg)`,
          boxShadow: `inset 0 0 ${wr * 0.3}px rgba(0,0,0,0.6)`,
        }}>
          <div style={{
            position: 'absolute',
            inset: '22%',
            borderRadius: '50%',
            background: '#9e9e9e',
          }} />
          {[0, 60, 120].map((angle) => (
            <div key={angle} style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '72%',
              height: 2 * scale,
              background: '#9e9e9e',
              transformOrigin: '0 50%',
              transform: `translateY(-50%) rotate(${angle}deg)`,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
};
