import { useCurrentFrame } from 'remotion';

export const Fish = ({ x = 0, y = 400, scale = 1, speed = 2, color = '#1982c4', direction = 1 }) => {
  const frame = useCurrentFrame();
  const posX = x + frame * speed * direction;
  const posY = y + Math.sin(frame * 0.07) * 20;
  const tailWag = Math.sin(frame * 0.3) * 22;
  const bodyWave = Math.sin(frame * 0.3) * 4;

  const S = scale;
  const W = 80 * S;
  const H = 36 * S;

  return (
    <div style={{
      position: 'absolute',
      left: posX,
      top: posY,
      transform: direction === -1 ? 'scaleX(-1)' : undefined,
    }}>
      {/* Tail */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: H * 0.08,
        transformOrigin: 'right center',
        transform: `rotate(${tailWag}deg)`,
      }}>
        <div style={{
          width: 0, height: 0,
          borderTop: `${H * 0.45}px solid transparent`,
          borderBottom: `${H * 0.45}px solid transparent`,
          borderRight: `${W * 0.24}px solid ${color}`,
        }} />
      </div>
      {/* Body */}
      <div style={{
        position: 'absolute',
        left: W * 0.14,
        top: 0,
        width: W * 0.72,
        height: H,
        borderRadius: '50% 60% 60% 50% / 40% 40% 60% 60%',
        background: `linear-gradient(135deg, ${color}bb, ${color})`,
        transform: `rotate(${bodyWave}deg)`,
        transformOrigin: 'left center',
      }} />
      {/* Scales sheen */}
      <div style={{
        position: 'absolute',
        left: W * 0.28,
        top: H * 0.1,
        width: W * 0.38,
        height: H * 0.5,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
      }} />
      {/* Dorsal fin */}
      <div style={{
        position: 'absolute',
        left: W * 0.38,
        top: -H * 0.28,
        width: 0, height: 0,
        borderLeft: `${W * 0.1}px solid transparent`,
        borderRight: `${W * 0.1}px solid transparent`,
        borderBottom: `${H * 0.35}px solid ${color}aa`,
      }} />
      {/* Eye */}
      <div style={{
        position: 'absolute',
        left: W * 0.72,
        top: H * 0.16,
        width: H * 0.24,
        height: H * 0.24,
        borderRadius: '50%',
        background: '#fff',
      }}>
        <div style={{ position: 'absolute', inset: '28%', borderRadius: '50%', background: '#1a1a2e' }} />
        <div style={{ position: 'absolute', top: '10%', right: '15%', width: '25%', height: '25%', borderRadius: '50%', background: '#fff' }} />
      </div>
      {/* Mouth */}
      <div style={{
        position: 'absolute',
        left: W * 0.82,
        top: H * 0.52,
        width: H * 0.12,
        height: H * 0.1,
        borderRadius: '0 50% 50% 0',
        background: `${color}dd`,
        border: `${1 * S}px solid rgba(0,0,0,0.2)`,
      }} />
    </div>
  );
};
