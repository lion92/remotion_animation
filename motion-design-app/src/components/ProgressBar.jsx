import { useCurrentFrame, interpolate } from 'remotion';

export const ProgressBar = ({
  start = 0,
  duration = 60,
  width = 400,
  height = 20,
  color = '#00b4d8',
  bgColor = '#e0e0e0',
  radius = 10,
  showLabel = true,
  labelStyle = {},
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'relative', width, display: 'inline-block' }}>
      {showLabel && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: -28,
          fontSize: 16,
          fontWeight: 'bold',
          color,
          ...labelStyle,
        }}>
          {Math.round(progress * 100)}%
        </div>
      )}
      <div style={{
        width,
        height,
        background: bgColor,
        borderRadius: radius,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: radius,
          boxShadow: `0 0 8px ${color}88`,
        }} />
      </div>
    </div>
  );
};
