import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import LittleGuy from '../../LittleGuy';
import Bubble from '../../Bubble';
import { Rain } from '../../components/Rain';
import { Lightning } from '../../components/Lightning';
import { GlitchText } from '../../components/GlitchText';
import { Shake } from '../../components/Shake';
import { ProgressBar } from '../../components/ProgressBar';

const ERRORS = [
  { text: 'TypeError: Cannot read properties of undefined', x: 180, y: 180, f: 120 },
  { text: 'ReferenceError: variable is not defined', x: 900, y: 280, f: 200 },
  { text: 'SyntaxError: Unexpected token }', x: 380, y: 420, f: 300 },
  { text: 'Cannot set properties of null', x: 1100, y: 200, f: 380 },
  { text: 'Maximum call stack size exceeded', x: 600, y: 520, f: 460 },
  { text: 'Uncaught Error: Network request failed', x: 1300, y: 380, f: 540 },
];

export const Scene4Bugs = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const rainIntensity = interpolate(frame, [0, 200, 700, 900], [0, 1, 1, 0.2], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const determination = frame >= 750;
  const progressStart = 800;
  const progressDuration = 350;

  const lucasShake = frame < 720;

  const subs = [
    { text: "Les semaines passent. Les bugs s'accumulent. 🐛", s: 60, e: 340 },
    { text: "Chaque ligne de code cache un nouveau piège...", s: 380, e: 620 },
    { text: "Il veut abandonner. Mais quelque chose le retient.", s: 660, e: 860 },
    { text: "Non. Il recommence. Plus fort. Plus déterminé. 💪", s: 900, e: 1150 },
  ];

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 20, e - 20, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div style={{
        position: 'absolute', bottom: 55, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.82)',
        color: determination && s >= 900 ? '#fbbf24' : '#fff',
        padding: '14px 44px', borderRadius: 10, fontSize: 34, fontWeight: 500,
        textAlign: 'center', maxWidth: '84%', opacity,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${determination && s >= 900 ? 'rgba(251,191,36,0.35)' : 'rgba(220,38,38,0.3)'}`,
        letterSpacing: '0.03em',
      }}>{text}</div>
    );
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative' }}>

      {/* Storm background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom, ${determination ? '#0f172a' : '#1a0a0a'} 0%, ${determination ? '#1e3a5f' : '#2d0a0a'} 50%, ${determination ? '#0f172a' : '#1a0a0a'} 100%)`,
        transition: 'background 2s',
      }} />

      {/* Dark clouds */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${-10 + i * 28 + (frame * 0.1)}%`,
          top: i % 2 === 0 ? -30 : 20,
          width: '35%', height: 120,
          background: `rgba(${determination ? '30,58,95' : '60,20,20'},0.85)`,
          borderRadius: '50%',
          filter: 'blur(20px)',
          opacity: rainIntensity,
        }} />
      ))}

      {/* Rain */}
      {frame > 60 && (
        <Rain
          count={Math.floor(80 * rainIntensity)}
          width={1920} height={1080}
          speed={18} angle={8}
          color="#7dd3fc"
          opacity={0.5 * rainIntensity}
        />
      )}

      {/* Lightning flashes */}
      {frame > 100 && frame < 720 && (
        <>
          <Lightning x={400} yTop={0} yBottom={350} period={90} color="#bfdbfe" />
          <Lightning x={1500} yTop={0} yBottom={280} period={120} color="#bfdbfe" />
        </>
      )}

      {/* Error messages */}
      {ERRORS.map((err, i) => {
        if (frame < err.f || frame > err.f + 500) return null;
        const opacity = interpolate(frame, [err.f, err.f + 30, err.f + 440, err.f + 500], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const drift = (frame - err.f) * 0.08;
        return (
          <div key={i} style={{
            position: 'absolute', left: err.x, top: err.y + drift,
            opacity, pointerEvents: 'none',
          }}>
            <GlitchText
              text={err.text}
              intensity={1.2}
              frequency={20}
              style={{
                fontFamily: 'monospace', fontSize: 16,
                color: '#f87171',
                textShadow: '0 0 10px #f8717188',
                background: 'rgba(220,38,38,0.12)',
                padding: '4px 10px', borderRadius: 4,
                border: '1px solid rgba(220,38,38,0.3)',
              }}
            />
          </div>
        );
      })}

      {/* Bug icons floating */}
      {frame > 200 && frame < 720 && ['🐛', '🐞', '⚠️', '❌', '🐛'].map((bug, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${10 + i * 18}%`,
          top: `${30 + Math.sin(frame * 0.04 + i) * 15}%`,
          fontSize: 30,
          opacity: 0.7,
          animation: 'none',
        }}>{bug}</div>
      ))}

      {/* Lucas — frustrated */}
      <div style={{ position: 'absolute', bottom: 200, left: '50%', transform: 'translateX(-50%)' }}>
        {lucasShake ? (
          <Shake intensity={5} speed={1.5}>
            <LittleGuy lookingUp={false} />
          </Shake>
        ) : (
          <LittleGuy lookingUp />
        )}
        {/* Bubble */}
        {frame > 480 && frame < 750 && (
          <div style={{ position: 'absolute', top: -80, left: 200 }}>
            <Bubble text={frame > 600 ? "Je veux tout arrêter... 😢" : "Encore un bug ?!"} />
          </div>
        )}
        {determination && (
          <div style={{ position: 'absolute', top: -80, left: 200 }}>
            <Bubble text="Non. Je continue. 💪" />
          </div>
        )}
      </div>

      {/* Determination spark — light ray when he decides to push on */}
      {determination && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 80%, rgba(251,191,36,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Progress bar — starts once he commits */}
      {frame >= progressStart && (
        <div style={{
          position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
        }}>
          <div style={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: 18, marginBottom: 10, textAlign: 'center', textShadow: '0 0 10px #fbbf2488' }}>
            DÉTERMINATION
          </div>
          <ProgressBar
            start={progressStart}
            duration={progressDuration}
            width={500}
            height={18}
            color="#fbbf24"
            bgColor="rgba(255,255,255,0.1)"
            radius={9}
            showLabel
            labelStyle={{ color: '#fbbf24', fontSize: 18 }}
          />
        </div>
      )}

      {subs.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      {/* ── Audio ── */}
      <Audio src={staticFile('audio/narration4.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/music4.mp3')} startFrom={0} volume={0.22} />
      <Audio src={staticFile('audio/rain.mp3')} startFrom={0} volume={0.3} />
      <Audio src={staticFile('audio/thunder.mp3')} startFrom={0} volume={0.25} />
    </div>
  );
};
