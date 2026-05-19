import { useCurrentFrame } from 'remotion';

const sr = (seed) => { const x = Math.sin(seed + 9) * 10000; return x - Math.floor(x); };

export const MusicBars = ({
  count = 12,
  width = 120,
  height = 80,
  color = '#8ac926',
  playing = true,
  style = {},
}) => {
  const frame = useCurrentFrame();

  const bars = Array.from({ length: count }, (_, i) => ({
    baseFreq: sr(i * 3 + 1) * 0.2 + 0.08,
    phase: sr(i * 3 + 2) * Math.PI * 2,
    minH: sr(i * 3 + 3) * 0.08 + 0.04,
  }));

  const barW = Math.floor((width - (count - 1) * 2) / count);

  return (
    <div style={{
      width,
      height,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 2,
      ...style,
    }}>
      {bars.map((bar, i) => {
        const h = playing
          ? (bar.minH + Math.abs(Math.sin(frame * bar.baseFreq + bar.phase)) * (1 - bar.minH)) * height
          : height * bar.minH;
        return (
          <div key={i} style={{
            width: barW,
            height: h,
            background: `linear-gradient(to top, ${color}, ${color}88)`,
            borderRadius: `${barW / 2}px ${barW / 2}px 0 0`,
            boxShadow: `0 0 6px ${color}55`,
          }} />
        );
      })}
    </div>
  );
};
