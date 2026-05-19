import { useCurrentFrame, interpolate, Audio, staticFile, Sequence } from 'remotion';
import LittleGuy from '../../LittleGuy';
import { Confetti } from '../../components/Confetti';
import { Particles } from '../../components/Particles';
import { ZoomIn } from '../../components/ZoomIn';
import { Bounce } from '../../components/Bounce';
import { TypeWriter } from '../../components/TypeWriter';

const TERMINAL_LINES = [
  { t: '$ ls', color: '#e5e5e5', f: 80 },
  { t: 'app.js  index.html  package.json', color: '#9cdcfe', f: 140 },
  { t: '$ cat app.js', color: '#e5e5e5', f: 220 },
  { t: "console.log('Hello, World!');", color: '#ce9178', f: 280 },
  { t: '$ node app.js', color: '#e5e5e5', f: 420 },
];

export const Scene3HelloWorld = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const hwScale = interpolate(frame, [540, 620], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bgGlow = interpolate(frame, [540, 700], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const celebration = frame >= 540;
  const lucasScale = interpolate(frame, [620, 680], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const subs = [
    { text: "Le terminal. Son nouveau terrain de jeu. 💻", s: 60, e: 340 },
    { text: "Il tape son programme, caractère par caractère...", s: 380, e: 520 },
    { text: "HELLO WORLD ! Ça fonctionne ! Pour de vrai !!! 🚀", s: 560, e: 800 },
    { text: "Ce jour-là, il devient développeur.", s: 850, e: 1140 },
  ];

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 20, e - 20, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div style={{
        position: 'absolute', bottom: 55, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.82)', color: celebration ? '#4ade80' : '#fff',
        padding: '14px 44px', borderRadius: 10, fontSize: 34, fontWeight: 600,
        textAlign: 'center', maxWidth: '80%', opacity,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${celebration ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}`,
        textShadow: celebration ? '0 0 20px #4ade8088' : 'none',
        letterSpacing: '0.03em', whiteSpace: 'nowrap',
      }}>{text}</div>
    );
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative' }}>

      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, rgba(0,${Math.floor(60 * bgGlow)},${Math.floor(20 * bgGlow)},1) 0%, #050505 70%)`,
        transition: 'background 1s',
      }} />

      {/* Grid floor effect */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Terminal window — center stage */}
      <div style={{
        position: 'absolute', top: 90, left: 210, right: 210,
        background: '#0d0d0d',
        borderRadius: 12,
        border: '1px solid #2a2a2a',
        boxShadow: `0 0 ${celebration ? 80 : 30}px rgba(0,255,65,${celebration ? 0.3 : 0.08}), 0 30px 60px rgba(0,0,0,0.7)`,
        overflow: 'hidden',
      }}>
        {/* Title bar */}
        <div style={{ background: '#1a1a1a', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {['#ff5f57', '#ffbd2e', '#28ca41'].map((c, i) => (
            <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />
          ))}
          <span style={{ marginLeft: 12, color: '#888', fontFamily: 'monospace', fontSize: 14 }}>lucas@dream-machine: ~/projects</span>
        </div>

        {/* Terminal body */}
        <div style={{ padding: '20px 24px', minHeight: 480, fontFamily: 'monospace', fontSize: 18, lineHeight: 2, position: 'relative' }}>
          {TERMINAL_LINES.map((line, i) => {
            const chars = Math.max(0, Math.min(line.t.length, Math.floor((frame - line.f) * 2.5)));
            return chars > 0 && (
              <div key={i} style={{ color: line.color }}>{line.t.slice(0, chars)}</div>
            );
          })}
          {/* Output */}
          {frame >= 490 && (
            <div style={{
              color: '#4ade80', fontSize: 18,
              textShadow: '0 0 12px #4ade8088',
            }}>
              <TypeWriter text="Hello, World! 🎉" speed={3} style={{ color: '#4ade80', fontSize: 18 }} cursorColor="#4ade80" />
            </div>
          )}

          {/* HUGE celebration text */}
          {frame >= 540 && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: `translate(-50%, -50%) scale(${hwScale})`,
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{
                fontSize: 96,
                fontWeight: 900,
                color: '#4ade80',
                textShadow: '0 0 40px #4ade80, 0 0 80px #4ade8066, 0 0 120px #4ade8033',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                HELLO
              </div>
              <div style={{
                fontSize: 96,
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 0 40px #ffffff88, 0 0 80px #ffffff33',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}>
                WORLD !
              </div>
            </div>
          )}

          {/* Blinking cursor */}
          {frame < 490 && (
            <span style={{ display: 'inline-block', width: 10, height: 20, background: '#4ade80', opacity: frame % 24 < 12 ? 1 : 0, verticalAlign: 'text-bottom' }} />
          )}
        </div>
      </div>

      {/* Celebration effects */}
      {celebration && (
        <>
          <Confetti count={80} width={1920} height={1080} gravity={5} />
          <Particles x={960} y={540} count={60} spread={500} size={10} gravity={0.03} />
          <Particles x={200} y={400} count={30} spread={200} colors={['#4ade80', '#22c55e']} size={8} gravity={0.02} />
          <Particles x={1720} y={400} count={30} spread={200} colors={['#4ade80', '#22c55e']} size={8} gravity={0.02} />
        </>
      )}

      {/* Lucas celebrating */}
      {frame >= 620 && (
        <div style={{
          position: 'absolute', bottom: 180,
          left: '50%', transform: `translateX(-50%) scale(${lucasScale})`,
          transformOrigin: 'bottom center',
        }}>
          <Bounce amplitude={30} speed={0.2}>
            <LittleGuy lookingUp />
          </Bounce>
        </div>
      )}

      {/* Stars bursting from terminal */}
      {celebration && [0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const dist = (frame - 540) * 3;
        const px = 960 + Math.cos(angle) * dist;
        const py = 400 + Math.sin(angle) * dist;
        const opacity = Math.max(0, 1 - (frame - 540) / 200);
        return (
          <div key={i} style={{
            position: 'absolute', left: px, top: py,
            fontSize: 28, opacity,
            transform: `rotate(${frame * 4}deg)`,
            pointerEvents: 'none',
          }}>✦</div>
        );
      })}

      {subs.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      {/* ── Audio ── */}
      <Audio src={staticFile('audio/narration3.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/music3.mp3')} startFrom={0} volume={0.22} />
      <Audio src={staticFile('audio/keyboard.mp3')} startFrom={0} volume={0.1} endAt={490} />
      <Sequence from={540}><Audio src={staticFile('audio/celebration.mp3')} startFrom={0} volume={0.5} /></Sequence>
    </div>
  );
};
