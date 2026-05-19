import { useCurrentFrame } from 'remotion';

export const Boat = ({ x = 0, y = 600, scale = 1, speed = 1, color = '#e63946', sailColor = '#fff' }) => {
  const frame = useCurrentFrame();
  const posX = x + frame * speed;
  const rock = Math.sin(frame * 0.06) * 4;

  const S = scale;
  const W = 140 * S;
  const H = 50 * S;

  return (
    <div style={{
      position: 'absolute',
      left: posX,
      top: y,
      transform: `rotate(${rock}deg)`,
      transformOrigin: 'center bottom',
    }}>
      {/* Hull */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        width: W, height: H,
        background: `linear-gradient(160deg, ${color}dd, ${color})`,
        borderRadius: `${6 * S}px ${6 * S}px ${W * 0.45}px ${W * 0.45}px`,
        boxShadow: `inset 0 ${4 * S}px ${8 * S}px rgba(255,255,255,0.2)`,
      }} />
      {/* Deck plank */}
      <div style={{
        position: 'absolute',
        bottom: H - 5 * S,
        left: W * 0.06,
        width: W * 0.88,
        height: 7 * S,
        background: '#8B4513',
        borderRadius: 2 * S,
      }} />
      {/* Mast */}
      <div style={{
        position: 'absolute',
        bottom: H + 3 * S,
        left: W * 0.44,
        width: 4 * S,
        height: 105 * S,
        background: '#5c4a1e',
        borderRadius: 2,
      }} />
      {/* Sail */}
      <div style={{
        position: 'absolute',
        bottom: H + 10 * S,
        left: W * 0.47,
        width: 0, height: 0,
        borderTop: `${80 * S}px solid transparent`,
        borderRight: `${58 * S}px solid ${sailColor}`,
        opacity: 0.93,
        filter: `drop-shadow(2px 2px 3px rgba(0,0,0,0.1))`,
      }} />
      {/* Flag */}
      <div style={{
        position: 'absolute',
        bottom: H + 103 * S,
        left: W * 0.46,
        width: 18 * S, height: 11 * S,
        background: '#ffca3a',
        borderRadius: `0 ${3 * S}px ${3 * S}px 0`,
      }} />
      {/* Porthole */}
      <div style={{
        position: 'absolute',
        bottom: H * 0.4,
        left: W * 0.25,
        width: 14 * S, height: 14 * S,
        borderRadius: '50%',
        background: '#90e0ef',
        border: `${2 * S}px solid rgba(255,255,255,0.5)`,
      }} />
    </div>
  );
};
