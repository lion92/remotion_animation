import { useCurrentFrame } from 'remotion';

export const Shake = ({ children, intensity = 6, speed = 1.2, style = {} }) => {
  const frame = useCurrentFrame();
  const x = Math.sin(frame * speed * 1.1) * intensity;
  const y = Math.cos(frame * speed * 0.9) * intensity * 0.4;

  return (
    <div style={{ transform: `translate(${x}px, ${y}px)`, ...style }}>
      {children}
    </div>
  );
};
