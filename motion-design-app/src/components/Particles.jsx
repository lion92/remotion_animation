import { useCurrentFrame } from 'remotion';

const sr = (seed) => { const x = Math.sin(seed + 11) * 10000; return x - Math.floor(x); };

export const Particles = ({
  count = 40,
  x = 960,
  y = 540,
  spread = 300,
  colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'],
  size = 8,
  gravity = 0.05,
}) => {
  const frame = useCurrentFrame();

  const particles = Array.from({ length: count }, (_, i) => ({
    angle: sr(i * 5 + 1) * Math.PI * 2,
    speed: sr(i * 5 + 2) * 2.5 + 0.5,
    r: sr(i * 5 + 3) * size + 3,
    color: colors[Math.floor(sr(i * 5 + 4) * colors.length)],
    decay: sr(i * 5 + 5) * 0.01 + 0.005,
    wobble: sr(i * 5 + 6) * 0.08,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        const dist = p.speed * frame;
        const spreadFactor = spread / 150;
        const px = x + Math.cos(p.angle + Math.sin(frame * p.wobble) * 0.3) * dist * spreadFactor;
        const py = y + Math.sin(p.angle + Math.sin(frame * p.wobble) * 0.3) * dist * spreadFactor + gravity * frame * frame;
        const opacity = Math.max(0, 1 - p.decay * frame);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: px - p.r / 2,
            top: py - p.r / 2,
            width: p.r,
            height: p.r,
            borderRadius: '50%',
            background: p.color,
            opacity,
            boxShadow: `0 0 ${p.r}px ${p.color}88`,
          }} />
        );
      })}
    </div>
  );
};
