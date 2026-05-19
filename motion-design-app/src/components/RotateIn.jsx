import { useCurrentFrame, interpolate } from 'remotion';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export const RotateIn = ({ children, start = 0, duration = 30, fromAngle = -180, style = {} }) => {
  const frame = useCurrentFrame();

  const raw = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = easeOutCubic(raw);
  const angle = fromAngle * (1 - progress);

  return (
    <div style={{
      transform: `rotate(${angle}deg) scale(${progress})`,
      display: 'inline-block',
      ...style,
    }}>
      {children}
    </div>
  );
};
