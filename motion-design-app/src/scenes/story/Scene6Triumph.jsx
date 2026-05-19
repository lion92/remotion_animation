import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import LittleGuy from '../../LittleGuy';
import { Confetti } from '../../components/Confetti';
import { Particles } from '../../components/Particles';
import { Balloon } from '../../components/Balloon';
import { Bounce } from '../../components/Bounce';
import { Badge } from '../../components/Badge';
import { Counter } from '../../components/Counter';
import { CinemaTitle } from '../../components/CinemaTitle';
import { ZoomIn } from '../../components/ZoomIn';
import { Sun } from '../../components/Sun';
import { Cloud } from '../../components/Cloud';
import { StarField } from '../../components/StarField';

export const Scene6Triumph = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Sunrise: sky goes from deep blue/purple to golden
  const sunriseProgress = interpolate(frame, [0, 400], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const skyR = Math.floor(interpolate(frame, [0, 400], [10, 255], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const skyG = Math.floor(interpolate(frame, [0, 400], [5, 180], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const skyB = Math.floor(interpolate(frame, [0, 400], [40, 50], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const sunY = interpolate(frame, [0, 500], [1150, 80], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const celebration = frame >= 300;

  const badgeScale = interpolate(frame, [350, 380, 410, 430], [0, 1.3, 0.9, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleProgress = interpolate(frame, [500, 580], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const subs = [
    { text: "Six mois plus tard...", s: 60, e: 250 },
    { text: "L'application est en ligne. Les utilisateurs arrivent. 🌍", s: 300, e: 560 },
    { text: "Une première offre d'emploi. Puis une deuxième.", s: 620, e: 860 },
    { text: "Lucas est maintenant développeur senior. Son rêve est réel. 🌟", s: 920, e: 1150 },
  ];

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 20, e - 20, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div style={{
        position: 'absolute', bottom: 55, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.72)',
        color: '#fef9c3',
        padding: '14px 44px', borderRadius: 10, fontSize: 34, fontWeight: 600,
        textAlign: 'center', maxWidth: '86%', opacity,
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(251,191,36,0.4)',
        textShadow: '0 0 12px rgba(251,191,36,0.3)',
        letterSpacing: '0.03em',
      }}>{text}</div>
    );
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative' }}>

      {/* Sky gradient — from dark to sunrise gold */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom, rgb(${skyR},${skyG},${skyB}) 0%, rgb(${Math.floor(skyR * 0.8 + 80)}, ${Math.floor(skyG * 0.6 + 100)}, ${Math.floor(skyB * 0.2 + 20)}) 50%, #ffcd3c 100%)`,
      }} />

      {/* Stars fading out */}
      {frame < 400 && (
        <div style={{ opacity: 1 - sunriseProgress }}>
          <StarField count={60} width={1920} height={1080} />
        </div>
      )}

      {/* Sun rising */}
      <Sun x={960} y={sunY} size={140} color="#FFD700" numRays={18} />

      {/* Horizon glow */}
      <div style={{
        position: 'absolute', bottom: 200, left: '50%', transform: 'translateX(-50%)',
        width: 1200, height: 300,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(255,220,50,${sunriseProgress * 0.4}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Clouds */}
      {frame > 150 && [
        { x: -100, y: 160, spd: 0.2, s: 1.1 },
        { x: 800, y: 100, spd: 0.12, s: 0.9 },
        { x: 1600, y: 180, spd: 0.18, s: 1.0 },
      ].map((c, i) => (
        <Cloud key={i} x={c.x + (frame - 150) * c.spd} y={c.y} scale={c.s} speed={0}
          color="rgba(255,252,220,0.85)"
          opacity={interpolate(frame, [150, 300], [0, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
      ))}

      {/* Ground */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 220,
        background: 'linear-gradient(to bottom, #2d6a4f, #1b4332)',
      }} />
      {/* Flowers on ground */}
      {[100, 350, 620, 900, 1200, 1500, 1780].map((gx, i) => (
        <div key={i} style={{ position: 'absolute', bottom: 216, left: gx }}>
          <div style={{ fontSize: 24 }}>
            {['🌸', '🌻', '🌺', '🌼', '🌸', '🌻', '🌺'][i]}
          </div>
        </div>
      ))}

      {/* Balloons rising */}
      {celebration && [
        { x: 180, y: 900, color: '#ff595e', accent: '#ffca3a', offset: 0 },
        { x: 400, y: 1000, color: '#1982c4', accent: '#8ac926', offset: 80 },
        { x: 1500, y: 950, color: '#6a4c93', accent: '#ff924c', offset: 40 },
        { x: 1720, y: 880, color: '#ff924c', accent: '#ffca3a', offset: 120 },
      ].map((b, i) => (
        <Balloon key={i} x={b.x} y={b.y - Math.max(0, frame - (300 + b.offset)) * 1.8} color={b.color} accent={b.accent} scale={0.9} />
      ))}

      {/* CONFETTI */}
      {celebration && <Confetti count={100} width={1920} height={1080} gravity={4.5} />}

      {/* Explosion of particles when app launches */}
      {frame >= 280 && frame <= 600 && (
        <>
          <Particles x={960} y={460} count={70} spread={600} size={12} gravity={0.04} />
          <Particles x={400} y={600} count={30} spread={250} colors={['#fbbf24', '#f59e0b']} size={8} gravity={0.03} />
          <Particles x={1520} y={600} count={30} spread={250} colors={['#fbbf24', '#f59e0b']} size={8} gravity={0.03} />
        </>
      )}

      {/* Lucas — jumping with joy */}
      {frame >= 300 && (
        <div style={{
          position: 'absolute',
          bottom: 216,
          left: '50%',
          transform: `translateX(-50%) scale(${interpolate(frame, [300, 360], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
          transformOrigin: 'bottom center',
        }}>
          <Bounce amplitude={40} speed={0.18}>
            <LittleGuy lookingUp />
          </Bounce>
        </div>
      )}

      {/* Badge: DÉVELOPPEUR */}
      {frame >= 350 && (
        <div style={{
          position: 'absolute', top: 260, left: '50%',
          transform: `translateX(-50%) scale(${badgeScale})`,
          transformOrigin: 'center',
        }}>
          <Badge
            text="✓  DÉVELOPPEUR SENIOR"
            color="#f59e0b"
            textColor="#1a1a00"
            start={350}
            style={{ fontSize: 28, padding: '14px 40px', fontWeight: 900, letterSpacing: '0.06em' }}
          />
        </div>
      )}

      {/* Cinema title */}
      {frame >= 500 && (
        <div style={{ position: 'absolute', top: 360, left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
          <CinemaTitle
            title="Le rêve est devenu réalité"
            subtitle="From zero to hero — one commit at a time"
            start={500}
            duration={80}
            style={{ color: '#fff', fontSize: 72 }}
            titleStyle={{ textShadow: '0 0 40px rgba(255,220,50,0.6)' }}
            subtitleStyle={{ color: '#fef9c3', opacity: 0.8 }}
          />
        </div>
      )}

      {/* Users counter */}
      {frame >= 680 && (
        <div style={{
          position: 'absolute', top: 560, left: '50%', transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontSize: 16, letterSpacing: 3, marginBottom: 6 }}>
            UTILISATEURS
          </div>
          <Counter
            from={0} to={50000} start={680} duration={400}
            prefix="" suffix=" 🌍"
            style={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: 64, fontWeight: 900, textShadow: '0 0 30px #fbbf2466' }}
          />
        </div>
      )}

      {/* Final motivational message */}
      {frame >= 950 && (
        <ZoomIn start={950} duration={40}>
          <div style={{
            position: 'absolute', top: 660, left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center', color: 'rgba(255,255,255,0.85)',
            fontFamily: 'serif', fontSize: 32, fontStyle: 'italic',
            letterSpacing: '0.04em',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
          }}>
            "Le meilleur moment pour coder était hier. Le deuxième meilleur, c'est maintenant."
          </div>
        </ZoomIn>
      )}

      {subs.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      {/* ── Audio ── */}
      <Audio src={staticFile('audio/narration6.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/music6.mp3')} startFrom={0} volume={0.22} />
      <Audio src={staticFile('audio/celebration.mp3')} startFrom={0} volume={0.4} />
    </div>
  );
};
