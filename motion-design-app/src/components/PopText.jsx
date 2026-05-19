import { useCurrentFrame } from 'remotion';

const easeOutElastic = (t) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
};

export const PopText = ({ text, start = 0, style = {}, color = '#ffca3a' }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, Math.min(1, (frame - start) / 22));
  const scale = easeOutElastic(t);
  const opacity = Math.min(1, t * 6);

  return (
    <span style={{
      display: 'inline-block',
      transform: `scale(${scale})`,
      opacity,
      color,
      fontWeight: 900,
      ...style,
    }}>
      {text}
    </span>
  );
};
