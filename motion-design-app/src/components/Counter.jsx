import { useCurrentFrame, interpolate } from 'remotion';

export const Counter = ({
  from = 0,
  to = 100,
  start = 0,
  duration = 60,
  prefix = '',
  suffix = '',
  decimals = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(frame, [start, start + duration], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
};
