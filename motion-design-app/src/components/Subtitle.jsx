import { useCurrentFrame, interpolate } from 'remotion';

export const Subtitle = ({
  text,
  start = 0,
  duration = 90,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [start, start + 10, start + duration - 10, start + duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const slideY = interpolate(
    frame,
    [start, start + 12],
    [24, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (frame < start || frame > start + duration) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 60,
      left: '50%',
      transform: `translateX(-50%) translateY(${slideY}px)`,
      opacity,
      background: 'rgba(0,0,0,0.72)',
      color: '#fff',
      padding: '12px 36px',
      borderRadius: 8,
      fontSize: 34,
      maxWidth: '80%',
      textAlign: 'center',
      lineHeight: 1.45,
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,0.08)',
      ...style,
    }}>
      {text}
    </div>
  );
};
