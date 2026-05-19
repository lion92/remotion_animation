import { useCurrentFrame } from 'remotion';

export const Rocket = ({ x = 200, y = 500, scale = 1, color = '#e63946', ascending = true }) => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame * 0.1) * 3;
  const flicker = 0.7 + Math.sin(frame * 0.5) * 0.3;
  const posY = ascending ? y - frame * 2 : y;

  const W = 50 * scale;
  const H = 120 * scale;

  return (
    <div style={{
      position: 'absolute',
      left: x + wobble,
      top: posY,
      width: W,
      height: H,
    }}>
      {/* Body */}
      <div style={{
        position: 'absolute',
        left: W * 0.1,
        top: H * 0.25,
        width: W * 0.8,
        height: H * 0.6,
        background: 'linear-gradient(90deg, #e0e0e0, #ffffff, #e0e0e0)',
        borderRadius: `${W * 0.4}px ${W * 0.4}px ${W * 0.1}px ${W * 0.1}px`,
      }} />
      {/* Nose cone */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: `${W * 0.42}px solid transparent`,
        borderRight: `${W * 0.42}px solid transparent`,
        borderBottom: `${H * 0.28}px solid ${color}`,
      }} />
      {/* Porthole */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: H * 0.44,
        transform: 'translateX(-50%)',
        width: W * 0.38,
        height: W * 0.38,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #caf0f8, #90e0ef)',
        border: `${2 * scale}px solid #bbb`,
        boxShadow: `inset 0 0 ${6 * scale}px rgba(0,0,0,0.2)`,
      }} />
      {/* Fins */}
      {[-1, 1].map((side) => (
        <div key={side} style={{
          position: 'absolute',
          bottom: H * 0.05,
          [side === -1 ? 'left' : 'right']: -W * 0.22,
          width: 0,
          height: 0,
          borderTop: `${H * 0.22}px solid transparent`,
          borderBottom: `${H * 0.04}px solid transparent`,
          [side === -1 ? 'borderRight' : 'borderLeft']: `${W * 0.28}px solid ${color}`,
        }} />
      ))}
      {/* Flame */}
      <div style={{
        position: 'absolute',
        bottom: -H * 0.28 * flicker,
        left: '50%',
        transform: 'translateX(-50%)',
        width: W * 0.45,
        height: H * 0.3 * flicker,
        background: 'linear-gradient(to bottom, #fffde7, #ff7300, transparent)',
        borderRadius: '40% 40% 60% 60%',
        filter: `blur(${2 * scale}px)`,
      }} />
      <div style={{
        position: 'absolute',
        bottom: -H * 0.18 * flicker,
        left: '50%',
        transform: 'translateX(-50%)',
        width: W * 0.22,
        height: H * 0.18 * flicker,
        background: 'linear-gradient(to bottom, #fff, #ffca3a)',
        borderRadius: '40% 40% 60% 60%',
        filter: `blur(${1 * scale}px)`,
      }} />
    </div>
  );
};
