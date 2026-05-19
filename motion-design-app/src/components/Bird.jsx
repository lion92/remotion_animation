import { useCurrentFrame } from 'remotion';

export const Bird = ({ x = 0, y = 200, speed = 2, scale = 1, color = '#1a1a2e', direction = 1 }) => {
  const frame = useCurrentFrame();
  const posX = x + frame * speed * direction;
  const posY = y + Math.sin(frame * 0.05) * 25;
  const wingAngle = Math.sin(frame * 0.35) * 32;

  const W = 60 * scale;
  const H = 22 * scale;

  return (
    <div style={{
      position: 'absolute',
      left: posX,
      top: posY,
      transform: direction === -1 ? 'scaleX(-1)' : undefined,
    }}>
      {/* Body */}
      <div style={{
        position: 'absolute',
        left: W * 0.28,
        top: H * 0.28,
        width: W * 0.42,
        height: H * 0.45,
        borderRadius: '50% 60% 60% 40%',
        background: color,
      }} />
      {/* Left wing */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: H * 0.38,
        width: W * 0.36,
        height: H * 0.32,
        background: color,
        borderRadius: '50% 10% 50% 10%',
        transformOrigin: 'right center',
        transform: `rotate(${-wingAngle}deg)`,
      }} />
      {/* Right wing */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: H * 0.38,
        width: W * 0.36,
        height: H * 0.32,
        background: color,
        borderRadius: '10% 50% 10% 50%',
        transformOrigin: 'left center',
        transform: `rotate(${wingAngle}deg)`,
      }} />
      {/* Head */}
      <div style={{
        position: 'absolute',
        left: W * 0.63,
        top: H * 0.08,
        width: H * 0.5,
        height: H * 0.5,
        borderRadius: '50%',
        background: color,
      }} />
      {/* Eye */}
      <div style={{
        position: 'absolute',
        left: W * 0.74,
        top: H * 0.12,
        width: H * 0.14,
        height: H * 0.14,
        borderRadius: '50%',
        background: '#fff',
      }} />
      {/* Beak */}
      <div style={{
        position: 'absolute',
        left: W * 0.8,
        top: H * 0.28,
        width: H * 0.22,
        height: H * 0.1,
        background: '#ffb703',
        borderRadius: '0 50% 50% 0',
      }} />
      {/* Tail */}
      <div style={{
        position: 'absolute',
        left: W * 0.06,
        top: H * 0.32,
        width: W * 0.2,
        height: H * 0.25,
        background: color,
        borderRadius: '50% 10% 10% 50%',
        transform: 'rotate(-10deg)',
      }} />
    </div>
  );
};
