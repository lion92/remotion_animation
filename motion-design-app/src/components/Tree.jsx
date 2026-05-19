import { useCurrentFrame } from 'remotion';

export const Tree = ({ x = 200, y = 600, scale = 1, color = '#2d6a4f', trunkColor = '#8B4513' }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.04) * 3;

  const S = scale;

  const foliageLayers = [
    { bottom: 42 * S, size: 82 * S, swayMult: 1.0 },
    { bottom: 72 * S, size: 66 * S, swayMult: 1.2 },
    { bottom: 98 * S, size: 50 * S, swayMult: 1.5 },
  ];

  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      {/* Trunk */}
      <div style={{
        position: 'absolute',
        left: 34 * S,
        bottom: 0,
        width: 18 * S,
        height: 64 * S,
        background: `linear-gradient(90deg, ${trunkColor}88, ${trunkColor}, ${trunkColor}88)`,
        borderRadius: `${3 * S}px ${3 * S}px 0 0`,
      }} />
      {/* Roots */}
      {[-1, 1].map((side) => (
        <div key={side} style={{
          position: 'absolute',
          bottom: 0,
          left: 34 * S + (side === -1 ? -10 * S : 14 * S),
          width: 12 * S,
          height: 12 * S,
          background: trunkColor,
          borderRadius: side === -1 ? `${6 * S}px 0 0 ${6 * S}px` : `0 ${6 * S}px ${6 * S}px 0`,
          opacity: 0.7,
        }} />
      ))}
      {/* Foliage */}
      {foliageLayers.map((l, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: l.bottom,
          left: (86 - l.size) / 2 * S,
          width: l.size,
          height: l.size * 0.82,
          borderRadius: '50% 50% 42% 42%',
          background: `radial-gradient(ellipse at 38% 32%, ${color}cc, ${color})`,
          boxShadow: `inset ${3 * S}px ${4 * S}px ${12 * S}px rgba(0,0,0,0.18)`,
          transformOrigin: 'bottom center',
          transform: `rotate(${sway * l.swayMult}deg)`,
        }} />
      ))}
    </div>
  );
};
