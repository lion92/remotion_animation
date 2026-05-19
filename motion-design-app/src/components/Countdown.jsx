import { useCurrentFrame } from 'remotion';

export const Countdown = ({
  from = 5,
  fps = 24,
  size = 120,
  color = '#e63946',
  style = {},
}) => {
  const frame = useCurrentFrame();
  const seconds = Math.max(0, from - Math.floor(frame / fps));
  const progress = (frame % fps) / fps;

  const r = size / 2 - 9;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - progress);
  const pulse = seconds === 0 ? 1 : 1 + (1 - progress) * 0.09;

  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      <svg width={size} height={size} style={{ position: 'absolute' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={`${color}2a`} strokeWidth={7}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42,
        fontWeight: 900,
        color,
        transform: `scale(${pulse})`,
      }}>
        {seconds === 0 ? '🎬' : seconds}
      </div>
    </div>
  );
};
