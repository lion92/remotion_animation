import { useCurrentFrame } from 'remotion';

export const Robot = ({ x = 200, y = 400, scale = 1, color = '#6a4c93', walking = true }) => {
  const frame = useCurrentFrame();
  const walkX = walking ? frame * 1.5 : 0;
  const armSwing = Math.sin(frame * 0.15) * 22;
  const legSwing = Math.sin(frame * 0.15) * 20;
  const antennaWobble = Math.sin(frame * 0.1) * 9;
  const eyeFlicker = frame % 40 < 2 ? 0 : 1;

  const S = scale;
  const W = 62 * S;
  const H = 52 * S;

  return (
    <div style={{ position: 'absolute', left: x + walkX, top: y }}>
      {/* Antenna */}
      <div style={{
        position: 'absolute',
        left: W / 2 - 2 * S,
        top: -26 * S,
        width: 4 * S, height: 20 * S,
        background: '#999',
        transformOrigin: 'bottom center',
        transform: `rotate(${antennaWobble}deg)`,
      }}>
        <div style={{
          position: 'absolute', top: -6 * S, left: '50%', transform: 'translateX(-50%)',
          width: 10 * S, height: 10 * S, borderRadius: '50%',
          background: '#ff595e', boxShadow: `0 0 ${7 * S}px #ff595e`,
        }} />
      </div>

      {/* Head */}
      <div style={{
        position: 'absolute', left: W * 0.1, top: 0,
        width: W * 0.8, height: H * 0.54,
        background: color, borderRadius: 6 * S,
        border: `${2 * S}px solid #444`,
        boxShadow: `inset 0 2px 6px rgba(255,255,255,0.15)`,
      }}>
        {[0.18, 0.54].map((lx, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${lx * 100}%`, top: '22%',
            width: '23%', height: '46%',
            borderRadius: 3 * S, background: '#1a1a2e',
          }}>
            <div style={{
              position: 'absolute', inset: '14%', borderRadius: 2 * S,
              background: '#00f5d4', opacity: eyeFlicker,
              boxShadow: `0 0 ${4 * S}px #00f5d4`,
            }} />
          </div>
        ))}
        <div style={{
          position: 'absolute', bottom: '14%', left: '18%',
          width: '64%', height: '16%',
          background: '#1a1a2e', borderRadius: 2 * S,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-evenly', padding: `0 ${3 * S}px`,
        }}>
          {[0, 1, 2, 3].map((j) => (
            <div key={j} style={{ flex: 1, height: '55%', background: '#444', borderRadius: 1 }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{
        position: 'absolute', left: W * 0.04, top: H * 0.57,
        width: W * 0.92, height: H * 0.92,
        background: color, borderRadius: 6 * S,
        border: `${2 * S}px solid #444`,
        boxShadow: `inset 0 2px 8px rgba(255,255,255,0.1)`,
      }}>
        <div style={{
          position: 'absolute', left: '22%', top: '22%',
          width: '56%', height: '34%',
          background: '#1a1a2e', borderRadius: 4 * S,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-evenly', padding: `0 ${4 * S}px`,
        }}>
          {['#ff595e', '#ffca3a', '#8ac926'].map((c, j) => (
            <div key={j} style={{ width: 8 * S, height: 8 * S, borderRadius: '50%', background: c, boxShadow: `0 0 4px ${c}` }} />
          ))}
        </div>
      </div>

      {/* Arms */}
      {[-1, 1].map((side) => (
        <div key={side} style={{
          position: 'absolute',
          [side === -1 ? 'left' : 'right']: -14 * S,
          top: H * 0.6,
          width: 13 * S, height: H * 0.68,
          background: color, borderRadius: 4 * S,
          border: `${2 * S}px solid #444`,
          transformOrigin: 'top center',
          transform: `rotate(${side * armSwing}deg)`,
        }} />
      ))}

      {/* Legs */}
      {[0.14, 0.56].map((lx, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: W * lx,
          top: H * 1.5,
          width: W * 0.3, height: H * 0.65,
          background: color,
          borderRadius: `0 0 ${5 * S}px ${5 * S}px`,
          border: `${2 * S}px solid #444`,
          transformOrigin: 'top center',
          transform: `rotate(${(i === 0 ? 1 : -1) * legSwing}deg)`,
        }} />
      ))}
    </div>
  );
};
