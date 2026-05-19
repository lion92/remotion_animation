import { useCurrentFrame } from 'remotion';

export const Sun = ({ x = 100, y = 100, size = 80, color = '#FFD700', numRays = 12 }) => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.5;
  const pulse = 1 + Math.sin(frame * 0.08) * 0.05;

  return (
    <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size }}>
      {/* Rotating rays */}
      <div style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
      }}>
        {Array.from({ length: numRays }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 4,
            height: size * 0.42,
            background: color,
            borderRadius: 2,
            transformOrigin: `50% ${size / 2}px`,
            transform: `translateX(-50%) rotate(${i * (360 / numRays)}deg)`,
            opacity: 0.85,
          }} />
        ))}
      </div>
      {/* Core */}
      <div style={{
        position: 'absolute',
        width: size * 0.65 * pulse,
        height: size * 0.65 * pulse,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle, #fffde7 0%, ${color} 60%)`,
        boxShadow: `0 0 ${size * 0.4}px ${color}99`,
      }} />
    </div>
  );
};
