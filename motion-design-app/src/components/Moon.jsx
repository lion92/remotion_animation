import { useCurrentFrame } from 'remotion';

export const Moon = ({ x = 1700, y = 120, size = 100 }) => {
  const frame = useCurrentFrame();
  const glow = 0.35 + Math.sin(frame * 0.03) * 0.1;

  return (
    <div style={{
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 38% 35%, #fffde7, #fff9c4 45%, #ffe082)',
      boxShadow: `0 0 ${size * 0.35}px rgba(255,253,231,${glow}), 0 0 ${size}px rgba(255,244,157,${glow * 0.35})`,
    }}>
      {[
        { t: '18%', l: '55%', s: '13%' },
        { t: '52%', l: '22%', s: '9%' },
        { t: '38%', l: '38%', s: '6%' },
      ].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: c.t, left: c.l,
          width: c.s, height: c.s,
          borderRadius: '50%',
          background: '#ffe082',
          opacity: 0.45,
        }} />
      ))}
    </div>
  );
};
