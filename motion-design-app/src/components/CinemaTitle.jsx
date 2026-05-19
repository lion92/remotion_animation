import { useCurrentFrame, interpolate } from 'remotion';

const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const CinemaTitle = ({
  title,
  subtitle = '',
  start = 0,
  duration = 60,
  style = {},
  titleStyle = {},
  subtitleStyle = {},
}) => {
  const frame = useCurrentFrame();

  const raw = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = easeOutExpo(raw);
  const titleY = (1 - progress) * 55;
  const subY = (1 - progress) * 35;

  return (
    <div style={{ textAlign: 'center', overflow: 'hidden', ...style }}>
      {/* Title */}
      <div style={{
        transform: `translateY(${titleY}px)`,
        opacity: progress,
        fontWeight: 900,
        letterSpacing: `${0.12 * progress}em`,
        textTransform: 'uppercase',
        lineHeight: 1.1,
        ...titleStyle,
      }}>
        {title}
      </div>

      {/* Divider line */}
      <div style={{
        width: `${progress * 60}%`,
        height: 2,
        background: 'currentColor',
        margin: '10px auto',
        opacity: progress * 0.5,
      }} />

      {/* Subtitle */}
      {subtitle && (
        <div style={{
          transform: `translateY(${subY}px)`,
          opacity: progress * 0.75,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          fontSize: '0.38em',
          ...subtitleStyle,
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};
