import { useCurrentFrame, interpolate } from 'remotion';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export const SlideIn = ({ children, from = 'left', start = 0, duration = 30, distance = 200, fade = true }) => {
  const frame = useCurrentFrame();

  const raw = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = easeOutCubic(raw);

  const offsets = {
    left: `translateX(${(1 - progress) * -distance}px)`,
    right: `translateX(${(1 - progress) * distance}px)`,
    top: `translateY(${(1 - progress) * -distance}px)`,
    bottom: `translateY(${(1 - progress) * distance}px)`,
  };

  return (
    <div style={{
      transform: offsets[from] ?? offsets.left,
      opacity: fade ? progress : 1,
    }}>
      {children}
    </div>
  );
};
