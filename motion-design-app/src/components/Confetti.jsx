import { useCurrentFrame } from 'remotion';

const seededRandom = (seed) => {
  const x = Math.sin(seed + 3) * 10000;
  return x - Math.floor(x);
};

const COLORS = ['#ff595e', '#ffca3a', '#6a4c93', '#1982c4', '#8ac926', '#ff924c', '#06d6a0'];

export const Confetti = ({ count = 60, width = 1920, height = 1080, gravity = 4 }) => {
  const frame = useCurrentFrame();

  const pieces = Array.from({ length: count }, (_, i) => ({
    x: seededRandom(i * 3 + 1) * width,
    speed: seededRandom(i * 3 + 2) * gravity + 2,
    wobbleAmp: seededRandom(i * 3 + 3) * 60 - 30,
    wobbleFreq: seededRandom(i * 5 + 4) * 0.08 + 0.03,
    color: COLORS[Math.floor(seededRandom(i * 7 + 5) * COLORS.length)],
    size: seededRandom(i * 11 + 6) * 12 + 6,
    rotation: seededRandom(i * 13 + 7) * 360,
    rotSpeed: seededRandom(i * 17 + 8) * 8 - 4,
    startOffset: seededRandom(i * 19 + 9) * height,
    isRect: seededRandom(i * 23 + 10) > 0.4,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map((p, i) => {
        const y = (p.startOffset + frame * p.speed) % (height + 60) - 60;
        const x = p.x + Math.sin(frame * p.wobbleFreq + i) * p.wobbleAmp;
        const rot = p.rotation + frame * p.rotSpeed;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x,
            top: y,
            width: p.isRect ? p.size : p.size * 0.55,
            height: p.isRect ? p.size * 0.4 : p.size,
            background: p.color,
            borderRadius: p.isRect ? 2 : '50%',
            transform: `rotate(${rot}deg)`,
            opacity: 0.9,
          }} />
        );
      })}
    </div>
  );
};
