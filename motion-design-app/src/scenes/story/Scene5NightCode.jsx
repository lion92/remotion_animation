import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';
import LittleGuy from '../../LittleGuy';
import { StarField } from '../../components/StarField';
import { ProgressBar } from '../../components/ProgressBar';
import { MusicBars } from '../../components/MusicBars';
import { Smoke } from '../../components/Smoke';
import { Counter } from '../../components/Counter';
import { TypeWriter } from '../../components/TypeWriter';

const CLOCK_TIMES = ['22:00', '23:30', '01:15', '03:00', '04:48'];

const CODE_BURSTS = [
  { t: 'function renderApp() {', color: '#dcdcaa', f: 100 },
  { t: '  const state = useState(null);', color: '#9cdcfe', f: 180 },
  { t: '  useEffect(() => {', color: '#dcdcaa', f: 260 },
  { t: '    fetchData().then(setData);', color: '#569cd6', f: 340 },
  { t: '  }, []);', color: '#dcdcaa', f: 420 },
  { t: '  return <Dashboard data={state} />;', color: '#4ec9b0', f: 500 },
  { t: '}', color: '#dcdcaa', f: 570 },
  { t: '', color: '#fff', f: 620 },
  { t: '// TODO: deploy to prod 🚀', color: '#6a9955', f: 650 },
];

export const Scene5NightCode = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const clockIdx = Math.min(4, Math.floor(frame / 220));
  const screenGlow = 0.4 + Math.sin(frame * 0.04) * 0.08;

  const subs = [
    { text: "22 heures. Lucas commence son grand projet. 🚀", s: 60, e: 320 },
    { text: "Minuit. La ville dort. Lui, il code.", s: 380, e: 580 },
    { text: "3h du matin. Le café est froid. Le code avance.", s: 640, e: 880 },
    { text: "Une ligne à la fois, son rêve prend forme.", s: 920, e: 1150 },
  ];

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 20, e - 20, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div style={{
        position: 'absolute', bottom: 55, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.88)',
        color: '#93c5fd',
        padding: '14px 44px', borderRadius: 10, fontSize: 34, fontWeight: 500,
        textAlign: 'center', maxWidth: '80%', opacity,
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(147,197,253,0.25)',
        letterSpacing: '0.03em',
      }}>{text}</div>
    );
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative' }}>

      {/* Near-black background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #020408, #04080f, #020408)' }} />

      {/* ── Window frame (top right) with stars outside ── */}
      <div style={{
        position: 'absolute', top: 80, right: 140,
        width: 340, height: 440,
        border: '10px solid #1a1008',
        borderRadius: 6, overflow: 'hidden',
      }}>
        {/* Night sky outside */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #020408, #050a15)' }} />
        <StarField count={60} width={340} height={440} shooting />
        {/* Window divider */}
        <div style={{ position: 'absolute', top: 0, left: '50%', bottom: 0, width: 8, background: '#1a1008', transform: 'translateX(-50%)', zIndex: 2 }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 8, background: '#1a1008', transform: 'translateY(-50%)', zIndex: 2 }} />
        {/* Reflection / glass effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '35%', height: '45%', background: 'linear-gradient(135deg, rgba(147,197,253,0.06), transparent)', zIndex: 3 }} />
      </div>

      {/* Monitor glow ambient */}
      <div style={{
        position: 'absolute', bottom: 200, left: 200,
        width: 700, height: 500,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(0,180,216,${screenGlow}) 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      {/* Desk surface */}
      <div style={{
        position: 'absolute', bottom: 155, left: 0, right: 0,
        height: 25,
        background: 'linear-gradient(to bottom, #1c0f04, #120a02)',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.8)',
      }} />

      {/* ── Computer monitor ── */}
      <div style={{ position: 'absolute', bottom: 180, left: 120 }}>
        <div style={{
          width: 580, height: 380,
          background: '#0d0d1a',
          borderRadius: '10px 10px 5px 5px',
          border: '4px solid #222',
          padding: 12, boxSizing: 'border-box',
          boxShadow: `0 0 40px rgba(0,180,216,${screenGlow}), 0 20px 40px rgba(0,0,0,0.8)`,
        }}>
          {/* Screen */}
          <div style={{
            width: '100%', height: '100%',
            background: '#07070f', borderRadius: 5,
            padding: 14, overflow: 'hidden', boxSizing: 'border-box',
          }}>
            {/* Line numbers + code */}
            {CODE_BURSTS.map((line, i) => {
              const chars = Math.max(0, Math.min(line.t.length, Math.floor((frame - line.f) * 2.5)));
              return chars > 0 && (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <span style={{ color: '#3a3a5a', fontFamily: 'monospace', fontSize: 13, minWidth: 24 }}>{i + 1}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: line.color, lineHeight: 1.75, textShadow: `0 0 6px ${line.color}44` }}>
                    {line.t.slice(0, chars)}
                  </span>
                </div>
              );
            })}
            <span style={{ display: 'inline-block', width: 8, height: 14, background: '#00b4d8', opacity: frame % 22 < 11 ? 1 : 0, verticalAlign: 'text-bottom', marginLeft: 40 }} />
          </div>
        </div>
        <div style={{ width: 16, height: 20, background: '#222', margin: '0 auto' }} />
        <div style={{ width: 160, height: 8, background: '#222', margin: '0 auto', borderRadius: 3 }} />
      </div>

      {/* Second monitor (side) */}
      <div style={{ position: 'absolute', bottom: 180, left: 740, opacity: 0.7 }}>
        <div style={{ width: 380, height: 250, background: '#0d0d1a', borderRadius: '8px 8px 4px 4px', border: '3px solid #222', padding: 10, boxSizing: 'border-box', boxShadow: '0 0 20px rgba(139,92,246,0.2)' }}>
          <div style={{ width: '100%', height: '100%', background: '#07070f', borderRadius: 4, padding: 10, overflow: 'hidden', boxSizing: 'border-box' }}>
            {/* Browser/preview */}
            <div style={{ color: '#888', fontFamily: 'monospace', fontSize: 11, marginBottom: 6 }}>localhost:3000</div>
            <div style={{ height: 2, background: '#222', marginBottom: 10 }} />
            <div style={{ color: '#a78bfa', fontFamily: 'sans-serif', fontSize: 18, fontWeight: 700 }}>DevPortfolio</div>
            <div style={{ color: '#6a9955', fontFamily: 'monospace', fontSize: 11, marginTop: 6 }}>● Live preview</div>
          </div>
        </div>
      </div>

      {/* Coffee mug with steam */}
      <div style={{ position: 'absolute', bottom: 180, left: 1160 }}>
        <div style={{ width: 52, height: 58, background: 'linear-gradient(to bottom, #1a1a1a, #111)', borderRadius: '4px 4px 10px 10px', border: '2px solid #2a2a2a', position: 'relative' }}>
          <div style={{ position: 'absolute', right: -16, top: 12, width: 16, height: 26, borderRadius: '0 50% 50% 0', border: '3px solid #2a2a2a', borderLeft: 'none' }} />
          {/* Coffee */}
          <div style={{ position: 'absolute', top: 10, left: 5, right: 5, height: 16, background: '#3d1f00', borderRadius: '0 0 4px 4px' }} />
          {/* Cold coffee reflection */}
          <div style={{ position: 'absolute', top: 10, left: 8, width: 12, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
        </div>
        <Smoke x={0} y={-10} count={6} color="#444" />
      </div>

      {/* Lucas typing */}
      <div style={{ position: 'absolute', bottom: 153, left: 860, transform: 'scale(0.55)', transformOrigin: 'bottom center' }}>
        <LittleGuy lookingUp={false} />
      </div>

      {/* ── Clock ── */}
      <div style={{
        position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.7)',
        border: '1px solid rgba(147,197,253,0.2)',
        borderRadius: 12, padding: '10px 28px',
      }}>
        <div style={{ color: '#93c5fd', fontFamily: 'monospace', fontSize: 42, fontWeight: 700, letterSpacing: '0.08em', textShadow: '0 0 20px #93c5fd66' }}>
          {CLOCK_TIMES[clockIdx]}
        </div>
        <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 14, textAlign: 'center', letterSpacing: 2 }}>NUIT DE CODE</div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ position: 'absolute', top: 170, left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 14, marginBottom: 8, textAlign: 'center', letterSpacing: 2 }}>
          PROJET ── PROGRESSION
        </div>
        <ProgressBar start={0} duration={1100} width={600} height={14} color="#00b4d8" bgColor="rgba(255,255,255,0.07)" radius={7} showLabel labelStyle={{ color: '#00b4d8', fontSize: 16 }} />
      </div>

      {/* ── Lines of code counter ── */}
      <div style={{ position: 'absolute', top: 250, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
        <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: 13, letterSpacing: 2, marginBottom: 4 }}>LIGNES DE CODE</div>
        <Counter from={0} to={2847} start={0} duration={1000} style={{ color: '#a78bfa', fontFamily: 'monospace', fontSize: 48, fontWeight: 700, textShadow: '0 0 20px #a78bfa55' }} />
      </div>

      {/* ── Music bars (lo-fi vibes) ── */}
      <div style={{ position: 'absolute', bottom: 200, right: 100 }}>
        <div style={{ color: '#334155', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', marginBottom: 6, letterSpacing: 2 }}>LO-FI BEATS</div>
        <MusicBars count={16} width={200} height={70} color="#a78bfa" playing />
      </div>

      {subs.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      {/* ── Audio ── */}
      <Audio src={staticFile('audio/narration5.mp3')} startFrom={0} volume={1} />
      <Audio src={staticFile('audio/music5.mp3')} startFrom={0} volume={0.22} />
      <Audio src={staticFile('audio/keyboard.mp3')} startFrom={0} volume={0.1} />
      <Audio src={staticFile('audio/night_ambient.mp3')} startFrom={0} volume={0.15} />
    </div>
  );
};
