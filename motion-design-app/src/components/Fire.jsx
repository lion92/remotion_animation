import { useCurrentFrame } from 'remotion';

export const Fire = ({ x = 100, y = 500, size = 80, intensity = 1 }) => {
  const frame = useCurrentFrame();

  const layers = [
    { scale: 1.0, color: '#ff3800', blur: 0, delay: 0 },
    { scale: 0.75, color: '#ff6d00', blur: 1, delay: 4 },
    { scale: 0.5, color: '#ffb300', blur: 2, delay: 8 },
    { scale: 0.28, color: '#fff176', blur: 3, delay: 12 },
  ];

  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size * intensity }}>
      {layers.map((l, i) => {
        const flicker = 1 + Math.sin((frame + l.delay) * 0.3) * 0.12;
        const sway = Math.sin((frame + l.delay) * 0.2) * (size * 0.08);
        return (
          <div key={i} style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: `translateX(calc(-50% + ${sway}px)) scaleX(${l.scale * flicker * 0.8}) scaleY(${l.scale * flicker})`,
            transformOrigin: 'bottom center',
            width: size * l.scale,
            height: size * l.scale * 1.8 * intensity,
            background: `radial-gradient(ellipse at 50% 80%, ${l.color}, transparent 70%)`,
            borderRadius: '50% 50% 30% 30%',
            filter: `blur(${l.blur}px)`,
          }} />
        );
      })}
    </div>
  );
};
