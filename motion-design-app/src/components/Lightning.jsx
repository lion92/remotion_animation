import { useCurrentFrame } from 'remotion';

export const Lightning = ({ x = 400, yTop = 0, yBottom = 400, color = '#c8e6ff', period = 60 }) => {
  const frame = useCurrentFrame();
  const t = frame % period;
  const visible = t < 6 || (t > 14 && t < 17);
  if (!visible) return null;

  const mid1X = x + Math.sin(frame * 1.3) * 30 - 15;
  const mid1Y = yTop + (yBottom - yTop) * 0.35;
  const mid2X = x + Math.cos(frame * 1.7) * 40 - 20;
  const mid2Y = yTop + (yBottom - yTop) * 0.68;
  const opacity = t < 6 ? 1 : 0.6;

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width="100%" height="100%">
      <defs>
        <filter id={`lglow${x}`}>
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Glow */}
      <polyline
        points={`${x},${yTop} ${mid1X},${mid1Y} ${mid2X},${mid2Y} ${x},${yBottom}`}
        stroke={color}
        strokeWidth={8}
        fill="none"
        opacity={opacity * 0.4}
        filter={`url(#lglow${x})`}
      />
      {/* Main bolt */}
      <polyline
        points={`${x},${yTop} ${mid1X},${mid1Y} ${mid2X},${mid2Y} ${x},${yBottom}`}
        stroke={color}
        strokeWidth={3}
        fill="none"
        opacity={opacity}
      />
      {/* Core */}
      <polyline
        points={`${x},${yTop} ${mid1X},${mid1Y} ${mid2X},${mid2Y} ${x},${yBottom}`}
        stroke="#fff"
        strokeWidth={1}
        fill="none"
        opacity={opacity * 0.9}
      />
    </svg>
  );
};
