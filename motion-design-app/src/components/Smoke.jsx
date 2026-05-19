import { useCurrentFrame } from 'remotion';

const sr = (seed) => { const x = Math.sin(seed + 5) * 10000; return x - Math.floor(x); };

export const Smoke = ({ x = 200, y = 400, count = 14, color = '#aaa' }) => {
  const frame = useCurrentFrame();

  const particles = Array.from({ length: count }, (_, i) => ({
    period: 80 + Math.floor(sr(i * 7 + 1) * 40),
    dx: sr(i * 7 + 2) * 60 - 30,
    size: sr(i * 7 + 3) * 30 + 20,
    speed: sr(i * 7 + 4) * 1.5 + 0.8,
    alpha: sr(i * 7 + 5) * 0.25 + 0.08,
    wobbleFreq: sr(i * 7 + 6) * 0.06 + 0.02,
    startOffset: sr(i * 7 + 7) * 80,
  }));

  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      {particles.map((p, i) => {
        const age = ((frame + p.startOffset * 2) % p.period);
        const progress = age / p.period;
        const py = -progress * 140;
        const px = p.dx * progress + Math.sin(frame * p.wobbleFreq + i) * 18;
        const sz = p.size * (0.4 + progress * 0.6);
        const opacity = p.alpha * (1 - progress * 0.85);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: px - sz / 2,
            top: py - sz / 2,
            width: sz,
            height: sz,
            borderRadius: '50%',
            background: color,
            opacity,
            filter: 'blur(10px)',
          }} />
        );
      })}
    </div>
  );
};
