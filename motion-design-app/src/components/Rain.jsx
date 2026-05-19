import { useCurrentFrame } from 'remotion';

const seededRandom = (seed) => {
  const x = Math.sin(seed + 2) * 10000;
  return x - Math.floor(x);
};

export const Rain = ({
  count = 60,
  width = 1920,
  height = 1080,
  speed = 15,
  angle = 10,
  color = '#a0c4ff',
  opacity = 0.6,
}) => {
  const frame = useCurrentFrame();
  const angleRad = (angle * Math.PI) / 180;
  const dx = Math.tan(angleRad) * speed;

  const drops = Array.from({ length: count }, (_, i) => ({
    x: seededRandom(i * 5 + 1) * (width * 1.3),
    offset: seededRandom(i * 7 + 2) * height,
    length: seededRandom(i * 11 + 3) * 20 + 10,
    alpha: seededRandom(i * 13 + 4) * 0.5 + 0.3,
    width: seededRandom(i * 17 + 5) > 0.8 ? 3 : 1.5,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {drops.map((drop, i) => {
        const y = ((drop.offset + frame * speed) % (height + 100)) - 50;
        const x = (drop.x + frame * dx) % (width * 1.3);
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x,
            top: y,
            width: drop.width,
            height: drop.length,
            background: color,
            opacity: opacity * drop.alpha,
            borderRadius: 1,
            transform: `rotate(${angle}deg)`,
          }} />
        );
      })}
    </div>
  );
};
