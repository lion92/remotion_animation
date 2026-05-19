import { useCurrentFrame } from 'remotion';

const sr = (seed) => { const x = Math.sin(seed + 4) * 10000; return x - Math.floor(x); };

export const Snow = ({ count = 80, width = 1920, height = 1080, speed = 3 }) => {
  const frame = useCurrentFrame();

  const flakes = Array.from({ length: count }, (_, i) => ({
    x: sr(i * 3 + 1) * width,
    offset: sr(i * 3 + 2) * height,
    size: sr(i * 3 + 3) * 6 + 3,
    wobble: sr(i * 5) * 40 - 20,
    wobbleFreq: sr(i * 7) * 0.04 + 0.02,
    speed: sr(i * 11) * speed + 1,
    opacity: sr(i * 13) * 0.5 + 0.5,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {flakes.map((f, i) => {
        const y = (f.offset + frame * f.speed) % (height + 20) - 20;
        const x = f.x + Math.sin(frame * f.wobbleFreq + i) * f.wobble;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x,
            top: y,
            width: f.size,
            height: f.size,
            borderRadius: '50%',
            background: '#fff',
            opacity: f.opacity,
            boxShadow: `0 0 ${f.size}px rgba(255,255,255,0.6)`,
          }} />
        );
      })}
    </div>
  );
};
