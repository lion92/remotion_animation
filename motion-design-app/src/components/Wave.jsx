import { useCurrentFrame } from 'remotion';

export const Wave = ({
  width = 1920,
  fillHeight = 80,
  y = 700,
  color = '#0077b6',
  opacity = 0.85,
  speed = 0.06,
  amplitude = 22,
  layers = 2,
}) => {
  const frame = useCurrentFrame();

  const makePath = (phaseOffset, ampMult) => {
    const pts = Array.from({ length: 60 }, (_, i) => {
      const px = (i / 59) * width;
      const py = y
        + Math.sin(i * 0.28 + frame * speed + phaseOffset) * amplitude * ampMult
        + Math.sin(i * 0.5 + frame * speed * 1.4 + phaseOffset) * amplitude * 0.4 * ampMult;
      return `${px},${py}`;
    });
    return `M0,${y + fillHeight} L${pts.join(' L')} L${width},${y + fillHeight} Z`;
  };

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={width} height="100%">
      {layers >= 2 && (
        <path d={makePath(Math.PI, 0.7)} fill={color} opacity={opacity * 0.5} />
      )}
      <path d={makePath(0, 1)} fill={color} opacity={opacity} />
    </svg>
  );
};
