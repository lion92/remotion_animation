import { useCurrentFrame } from 'remotion';

export const Bounce = ({ children, amplitude = 20, speed = 0.15, style = {} }) => {
  const frame = useCurrentFrame();
  const offsetY = Math.abs(Math.sin(frame * speed)) * -amplitude;

  return (
    <div style={{ transform: `translateY(${offsetY}px)`, ...style }}>
      {children}
    </div>
  );
};
