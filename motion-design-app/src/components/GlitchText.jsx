import { useCurrentFrame } from 'remotion';

const sr = (seed) => { const x = Math.sin(seed + 6) * 10000; return x - Math.floor(x); };

export const GlitchText = ({ text, style = {}, intensity = 1, frequency = 40 }) => {
  const frame = useCurrentFrame();
  const triggered = (frame % frequency < 5) && intensity > 0;

  const cx1 = triggered ? (sr(frame * 3 + 1) * 16 - 8) * intensity : 0;
  const cx2 = triggered ? (sr(frame * 3 + 2) * 12 - 6) * intensity : 0;
  const cy1 = triggered ? sr(frame * 3 + 3) * 80 : 0;
  const ch1 = triggered ? sr(frame * 3 + 4) * 30 + 10 : 0;
  const cy2 = triggered ? cy1 + ch1 + sr(frame * 3 + 5) * 20 : 0;
  const ch2 = triggered ? sr(frame * 3 + 6) * 25 + 10 : 0;

  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      {text}
      {triggered && (
        <>
          <span style={{
            position: 'absolute', left: cx1, top: 0,
            color: '#ff0040',
            clipPath: `inset(${cy1}px 0 calc(100% - ${cy1 + ch1}px) 0)`,
            opacity: 0.85,
          }}>{text}</span>
          <span style={{
            position: 'absolute', left: cx2, top: 0,
            color: '#00f5d4',
            clipPath: `inset(${cy2}px 0 calc(100% - ${cy2 + ch2}px) 0)`,
            opacity: 0.85,
          }}>{text}</span>
        </>
      )}
    </span>
  );
};
