import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import LittleGuy from '../../LittleGuy';
import Bubble from '../../Bubble';
import { Sun } from '../../components/Sun';
import { Cloud } from '../../components/Cloud';
import { FadeIn } from '../../components/FadeIn';

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(20, 10, 0, 0.78)',
  color: '#fff8e7',
  padding: '14px 44px',
  borderRadius: 10, fontSize: 34, fontWeight: 500,
  textAlign: 'center', maxWidth: '80%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,200,50,0.3)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

const SUBS = [
  { text: "Le lendemain matin... 7h00.", s: 60, e: 320 },
  { text: "Lucas ouvre son premier IDE, les mains tremblantes. 🖥️", s: 370, e: 640 },
  { text: "Une erreur. Puis une autre. Mais il ne lâche pas.", s: 680, e: 900 },
  { text: "Et puis... son premier programme fonctionne ! 🎉", s: 940, e: 1150 },
];

const CODE = [
  { t: '> node index.js', color: '#e5e5e5', f: 380 },
  { t: 'SyntaxError: Unexpected token', color: '#f87171', f: 460 },
  { t: '> node index.js', color: '#e5e5e5', f: 640 },
  { t: 'ReferenceError: console not defined', color: '#f87171', f: 720 },
  { t: '> node app.js', color: '#e5e5e5', f: 860 },
  { t: 'Hello, World! 🎉', color: '#4ade80', f: 940 },
];

export const Scene2Awakening = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Sky brightens from night purple to warm morning
  const skyTop = frame < 120 ? '#1a0033' : '#ff6b35';
  const skyBot = frame < 120 ? '#0a001a' : '#ffd166';
  const skyOpacity = interpolate(frame, [60, 200], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const sunY = interpolate(frame, [80, 500], [1150, 70], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const bubbleText = frame > 960 ? 'Ça marche !! 🎉' : frame > 480 ? 'Encore une erreur... 😤' : '';

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 20, e - 20, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative' }}>

      {/* Night sky base */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #1a0033, #0a001a)' }} />
      {/* Morning sky overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: skyOpacity,
        background: `linear-gradient(to bottom, ${skyTop} 0%, ${skyBot} 100%)`,
        transition: 'background 3s',
      }} />

      {/* Sun */}
      {frame > 80 && <Sun x={320} y={sunY} size={110} color="#FFD700" numRays={16} />}

      {/* Clouds */}
      {frame > 200 && [
        { x: -100, y: 90, spd: 0.25 },
        { x: 900, y: 55, spd: 0.15 },
        { x: 1550, y: 110, spd: 0.2 },
      ].map((c, i) => (
        <Cloud key={i} x={c.x + (frame - 200) * c.spd} y={c.y} scale={1.1 + i * 0.15} speed={0} color="rgba(255,255,255,0.88)" opacity={interpolate(frame, [200, 320], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
      ))}

      {/* Ground / Grass */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, #2d6a4f, #1b4332)' }} />

      {/* House walls */}
      <div style={{
        position: 'absolute', bottom: 196, left: 360, right: 360,
        height: 680,
        background: 'linear-gradient(to bottom, #fff8f0, #fef3e8)',
        borderLeft: '5px solid #e8d5b7', borderRight: '5px solid #e8d5b7', borderTop: '5px solid #e8d5b7',
      }}>
        {/* Window */}
        <div style={{
          position: 'absolute', top: 55, right: 80,
          width: 210, height: 250,
          background: `linear-gradient(135deg, rgba(135,206,235,0.7), rgba(176,224,255,0.7))`,
          border: '8px solid #d4a56a', borderRadius: 4,
        }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', bottom: 0, width: 6, background: '#d4a56a', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 6, background: '#d4a56a', transform: 'translateY(-50%)' }} />
          {/* Curtains */}
          <div style={{ position: 'absolute', top: -8, left: -32, width: 54, height: 268, background: '#f4a261', opacity: 0.7, borderRadius: '0 0 60% 0' }} />
          <div style={{ position: 'absolute', top: -8, right: -32, width: 54, height: 268, background: '#f4a261', opacity: 0.7, borderRadius: '0 0 0 60%' }} />
        </div>

        {/* Desk */}
        <div style={{ position: 'absolute', bottom: 62, left: 32, right: 32, height: 20, background: 'linear-gradient(to bottom, #8B4513, #6b3410)', borderRadius: 4, boxShadow: '0 5px 14px rgba(0,0,0,0.22)' }} />
        {[62, 1220].map((lx) => (
          <div key={lx} style={{ position: 'absolute', bottom: 0, left: lx, width: 20, height: 66, background: '#6b3410' }} />
        ))}

        {/* Monitor */}
        <div style={{ position: 'absolute', bottom: 82, left: 70 }}>
          <div style={{
            width: 360, height: 230,
            background: '#1a1a2e', borderRadius: '8px 8px 4px 4px',
            border: '4px solid #333', padding: 9, boxSizing: 'border-box',
            boxShadow: `0 0 ${frame > 940 ? 25 : 12}px rgba(${frame > 940 ? '74,222,128' : '0,180,216'},0.4), 0 10px 24px rgba(0,0,0,0.4)`,
          }}>
            <div style={{ width: '100%', height: '100%', background: '#0d0d1a', borderRadius: 4, padding: 10, overflow: 'hidden', boxSizing: 'border-box' }}>
              {CODE.map((line, i) => {
                const chars = Math.max(0, Math.min(line.t.length, Math.floor((frame - line.f) * 2)));
                return chars > 0 && (
                  <div key={i} style={{
                    fontFamily: 'monospace', fontSize: 14, color: line.color, lineHeight: 1.7,
                    textShadow: line.color === '#4ade80' ? '0 0 10px #4ade8088' : 'none',
                  }}>
                    {line.t.slice(0, chars)}
                  </div>
                );
              })}
              <span style={{ display: 'inline-block', width: 7, height: 15, background: '#00ff41', opacity: frame % 24 < 12 ? 1 : 0, verticalAlign: 'text-bottom' }} />
            </div>
          </div>
          <div style={{ width: 14, height: 20, background: '#333', margin: '0 auto' }} />
          <div style={{ width: 130, height: 7, background: '#333', margin: '0 auto', borderRadius: 3 }} />
        </div>

        {/* Keyboard */}
        <div style={{
          position: 'absolute', bottom: 82, left: 75,
          width: 350, height: 24,
          background: '#2a2a3e', borderRadius: 4,
          border: '1px solid #444', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 2, padding: '0 6px', flexWrap: 'wrap',
        }}>
          {Array.from({ length: 28 }, (_, i) => (
            <div key={i} style={{ width: 9, height: 9, background: '#3a3a4e', borderRadius: 1, border: '0.5px solid #555' }} />
          ))}
        </div>

        {/* Coffee mug */}
        <div style={{ position: 'absolute', bottom: 84, left: 470 }}>
          <div style={{ width: 46, height: 52, background: 'linear-gradient(to bottom, #fff, #f0f0f0)', borderRadius: '4px 4px 8px 8px', border: '2px solid #ddd', position: 'relative' }}>
            <div style={{ position: 'absolute', right: -15, top: 10, width: 15, height: 24, borderRadius: '0 50% 50% 0', border: '3px solid #ddd', borderLeft: 'none' }} />
            <div style={{ position: 'absolute', top: 9, left: 4, right: 4, height: 14, background: '#6f4e37', borderRadius: '0 0 4px 4px' }} />
          </div>
          {[0, 1, 2].map((i) => {
            const sy = -((frame * 0.8 + i * 18) % 38);
            const sx = Math.sin(frame * 0.09 + i * 2) * 5;
            return <div key={i} style={{ position: 'absolute', left: 10 + i * 9 + sx, top: sy - 8, width: 3, height: 14, background: 'rgba(180,180,180,0.5)', borderRadius: 2, filter: 'blur(2px)' }} />;
          })}
        </div>

        {/* Lucas at desk */}
        <div style={{ position: 'absolute', bottom: 79, left: 520, transform: 'scale(0.58)', transformOrigin: 'bottom center' }}>
          <LittleGuy lookingUp={false} />
        </div>

        {/* Speech bubble */}
        {bubbleText && (
          <FadeIn start={frame > 960 ? 960 : 480} duration={20}>
            <div style={{ position: 'absolute', bottom: 270, left: 480 }}>
              <Bubble text={bubbleText} />
            </div>
          </FadeIn>
        )}

        {/* Books */}
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: 'absolute', bottom: 82, right: 120 + i * 28,
            width: 22, height: 80,
            background: ['#e63946', '#1982c4', '#2d6a4f'][i],
            borderRadius: '2px 2px 0 0',
            transform: `rotate(${[-3, 2, -1][i]}deg)`,
          }} />
        ))}
      </div>

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      {/* ── Audio ── */}
      <Audio src={staticFile('audio/narration2.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/music2.mp3')} startFrom={0} volume={0.22} />
      <Audio src={staticFile('audio/keyboard.mp3')} startFrom={0} volume={0.12} />
    </div>
  );
};
