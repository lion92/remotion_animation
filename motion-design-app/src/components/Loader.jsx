import { useCurrentFrame } from 'remotion';

export const Loader = ({
  size = 60,
  color = '#00b4d8',
  thickness = 6,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const rotation = frame * 6;
  const dashOffset = 150 - Math.sin(frame * 0.08) * 50;

  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ width: size, height: size, ...style }}>
      <svg width={size} height={size} style={{ transform: `rotate(${rotation}deg)` }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={`${color}33`}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
        />
      </svg>
    </div>
  );
};
