import { useCurrentFrame, interpolate } from 'remotion';

export const Badge = ({
  text,
  color = '#8ac926',
  textColor = '#fff',
  start = 0,
  icon = '',
  style = {},
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(
    frame,
    [start, start + 10, start + 18, start + 22],
    [0, 1.3, 0.9, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const pulse = 1 + Math.sin(frame * 0.12) * 0.03;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 20px',
      background: color,
      color: textColor,
      borderRadius: 999,
      fontWeight: 700,
      transform: `scale(${scale * pulse})`,
      boxShadow: `0 4px 18px ${color}77, 0 0 0 3px ${color}33`,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon && <span>{icon}</span>}
      {text}
    </div>
  );
};
