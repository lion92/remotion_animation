import { useCurrentFrame } from 'remotion';

export const Cloud = ({ x = 200, y = 100, scale = 1, speed = 0.3, color = '#fff', opacity = 0.92 }) => {
  const frame = useCurrentFrame();
  const posX = x + frame * speed;
  const float = Math.sin(frame * 0.025) * 8;

  const S = scale;

  const bumps = [
    { left: 20 * S, top: 22 * S, w: 64 * S, h: 64 * S },
    { left: 58 * S, top: 6 * S, w: 80 * S, h: 80 * S },
    { left: 106 * S, top: 20 * S, w: 58 * S, h: 58 * S },
  ];

  return (
    <div style={{ position: 'absolute', left: posX, top: y + float, pointerEvents: 'none' }}>
      {/* Base */}
      <div style={{
        position: 'absolute',
        left: 28 * S,
        top: 36 * S,
        width: 128 * S,
        height: 46 * S,
        borderRadius: 24 * S,
        background: color,
        opacity,
      }} />
      {/* Bumps */}
      {bumps.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: b.left,
          top: b.top,
          width: b.w,
          height: b.h,
          borderRadius: '50%',
          background: color,
          opacity,
        }} />
      ))}
    </div>
  );
};
