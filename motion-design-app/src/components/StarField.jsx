import { useCurrentFrame } from 'remotion';

const seededRandom = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

export const StarField = ({ count = 80, width = 1920, height = 1080, shooting = false }) => {
  const frame = useCurrentFrame();

  const stars = Array.from({ length: count }, (_, i) => ({
    x: seededRandom(i * 3 + 1) * width,
    y: seededRandom(i * 3 + 2) * height,
    size: seededRandom(i * 3 + 3) * 3 + 1,
    phase: seededRandom(i * 7) * Math.PI * 2,
    speed: seededRandom(i * 11) * 0.1 + 0.03,
  }));

  const shootingStars = shooting
    ? Array.from({ length: 3 }, (_, i) => ({
        startX: seededRandom(i * 17 + 5) * width,
        startY: seededRandom(i * 17 + 6) * height * 0.4,
        period: 90 + Math.floor(seededRandom(i * 17 + 7) * 60),
        length: 120 + seededRandom(i * 17 + 8) * 100,
      }))
    : [];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((star, i) => {
        const opacity = 0.4 + Math.sin(frame * star.speed + star.phase) * 0.6;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: '#fff',
            opacity: Math.max(0, opacity),
            boxShadow: `0 0 ${star.size * 2}px #ffffff88`,
          }} />
        );
      })}

      {shootingStars.map((s, i) => {
        const t = frame % s.period;
        const progress = t / s.period;
        if (progress > 0.3) return null;
        const p = progress / 0.3;
        const x = s.startX + p * s.length * 2;
        const y = s.startY + p * s.length;
        return (
          <div key={`sh${i}`} style={{
            position: 'absolute',
            left: x,
            top: y,
            width: s.length,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #fff)',
            opacity: 1 - p,
            transform: 'rotate(30deg)',
            transformOrigin: 'right center',
          }} />
        );
      })}
    </div>
  );
};
