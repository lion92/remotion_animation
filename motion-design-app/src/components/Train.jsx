import { useCurrentFrame } from 'remotion';

export const Train = ({ x = 0, y = 0, scale = 1, speed = 3, color = '#e63946' }) => {
  const frame = useCurrentFrame();
  const posX = x + frame * speed;
  const wheelSpin = frame * speed * 4;

  const S = scale;
  const W = 190 * S;
  const H = 82 * S;
  const wr = 19 * S;

  const Wheel = ({ cx }) => (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: cx - wr,
      width: wr * 2,
      height: wr * 2,
      borderRadius: '50%',
      background: '#1a1a2e',
      transform: `rotate(${wheelSpin}deg)`,
      boxShadow: `inset 0 0 ${wr * 0.25}px rgba(0,0,0,0.6)`,
    }}>
      <div style={{ position: 'absolute', inset: '25%', borderRadius: '50%', background: '#888' }} />
      {[0, 90].map((a) => (
        <div key={a} style={{
          position: 'absolute', left: '50%', top: '50%',
          width: '72%', height: 2 * S, background: '#888',
          transformOrigin: '0 50%',
          transform: `translateY(-50%) rotate(${a}deg)`,
        }} />
      ))}
    </div>
  );

  return (
    <div style={{ position: 'absolute', left: posX, top: y }}>
      <div style={{ position: 'relative', width: W, height: H + wr * 2 }}>
        {/* Cabin */}
        <div style={{
          position: 'absolute', bottom: wr * 2, left: 0,
          width: W * 0.62, height: H,
          background: `linear-gradient(160deg, ${color}dd, ${color})`,
          borderRadius: `${10 * S}px ${10 * S}px 0 0`,
          boxShadow: `inset 0 ${4 * S}px ${10 * S}px rgba(255,255,255,0.2)`,
        }} />
        {/* Nose */}
        <div style={{
          position: 'absolute', bottom: wr * 2, right: 0,
          width: W * 0.44, height: H * 0.76,
          background: color,
          borderRadius: `0 ${32 * S}px ${12 * S}px 0`,
        }} />
        {/* Cabin window */}
        <div style={{
          position: 'absolute', bottom: wr * 2 + H * 0.46,
          left: W * 0.07, width: W * 0.22, height: H * 0.36,
          background: '#90e0ef', borderRadius: 4 * S, opacity: 0.85,
        }} />
        {/* Nose window */}
        <div style={{
          position: 'absolute', bottom: wr * 2 + H * 0.32,
          left: W * 0.64, width: W * 0.2, height: H * 0.3,
          background: '#90e0ef', borderRadius: 4 * S, opacity: 0.85,
        }} />
        {/* Chimney */}
        <div style={{
          position: 'absolute',
          bottom: wr * 2 + H,
          left: W * 0.1,
          width: 14 * S, height: 24 * S,
          background: '#333',
          borderRadius: `${4 * S}px ${4 * S}px 0 0`,
        }} />
        {/* Headlight */}
        <div style={{
          position: 'absolute',
          bottom: wr * 2 + H * 0.25,
          right: 3 * S,
          width: 14 * S, height: 14 * S,
          borderRadius: '50%',
          background: '#fffde7',
          boxShadow: `0 0 ${10 * S}px #fffde7`,
        }} />
        {/* Connecting rod */}
        <div style={{
          position: 'absolute',
          bottom: wr,
          left: W * 0.12,
          width: W * 0.7,
          height: 3 * S,
          background: '#555',
          borderRadius: 2,
        }} />
        <Wheel cx={W * 0.18} />
        <Wheel cx={W * 0.4} />
        <Wheel cx={W * 0.65} />
        <Wheel cx={W * 0.84} />
      </div>
    </div>
  );
};
