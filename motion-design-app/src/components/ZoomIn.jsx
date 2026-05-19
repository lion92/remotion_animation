import { useCurrentFrame, interpolate } from 'remotion';

const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const ZoomIn = ({ children, start = 0, duration = 30, overshoot = true, style = {} }) => {
  const frame = useCurrentFrame();

  const raw = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = overshoot ? Math.max(0, easeOutBack(raw)) : raw;

  return (
    <div style={{ transform: `scale(${scale})`, display: 'inline-block', ...style }}>
      {children}
    </div>
  );
};
