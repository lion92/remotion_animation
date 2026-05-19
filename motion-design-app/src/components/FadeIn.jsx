import { useCurrentFrame, interpolate } from 'remotion';

export const FadeIn = ({ children, start = 0, duration = 30, fadeOut = false, fadeOutStart, fadeOutDuration = 20 }) => {
  const frame = useCurrentFrame();

  let opacity = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (fadeOut && fadeOutStart !== undefined) {
    const outOpacity = interpolate(frame, [fadeOutStart, fadeOutStart + fadeOutDuration], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    opacity = Math.min(opacity, outOpacity);
  }

  return <div style={{ opacity }}>{children}</div>;
};
