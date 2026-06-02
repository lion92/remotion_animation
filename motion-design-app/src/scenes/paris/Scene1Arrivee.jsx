import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';


const fi = (f, s, d) => interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
const fo = (f, s, d) => interpolate(f, [s, s + d], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const SUBS = [
  { text: "Léa a 19 ans. Elle vient de province.", s: 40, e: 280 },
  { text: "Un long voyage en train jusqu'à Paris...", s: 320, e: 540 },
  { text: "Elle veut devenir chercheuse en sciences.", s: 580, e: 820 },
  { text: "Tout commence ici, à l'aube de Gare du Nord.", s: 860, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(10,5,25,0.88)',
  color: '#f1e8d8',
  padding: '14px 44px', borderRadius: 10,
  fontSize: 34, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,200,100,0.3)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

const Star = ({ x, y, r, opacity }) => (
  <div style={{
    position: 'absolute', left: x, top: y,
    width: r * 2, height: r * 2, borderRadius: '50%',
    background: '#fff', opacity,
  }} />
);

const stars = Array.from({ length: 80 }, (_, i) => {
  const s = Math.sin(i * 1234.5) * 10000; const v = s - Math.floor(s);
  const s2 = Math.sin(i * 987.6) * 10000; const v2 = s2 - Math.floor(s2);
  const s3 = Math.sin(i * 543.2) * 10000; const v3 = s3 - Math.floor(s3);
  return { x: v * 1920, y: v2 * 500, r: 0.5 + v3 * 1.5, opacity: 0.4 + v3 * 0.6 };
});

export const ParisScene1Arrivee = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Ciel : nuit → aube (bleu nuit → orange doux)
  const skyProgress = interpolate(frame, [0, 1000], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const starOpacity = interpolate(frame, [400, 900], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Train qui arrive de droite
  const trainX = interpolate(frame, [80, 500], [2400, 300], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const trainStop = frame >= 500;

  // Vapeur du train
  const steamOpacity = frame >= 480 ? interpolate(frame, [480, 520, 700, 800], [0, 1, 0.6, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }) : 0;
  const steamY = frame >= 480 ? interpolate(frame, [480, 800], [0, -80], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

  // Lea qui descend du train
  const leaAppear = fi(frame, 560, 60);
  const leaWalkX = interpolate(frame, [620, 850], [560, 700], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leaLegSwing = Math.sin(frame * 0.35) * (frame > 620 && frame < 850 ? 18 : 0);

  // Soleil qui se lève
  const sunY = interpolate(frame, [600, 1100], [200, -20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sunOpacity = interpolate(frame, [600, 750], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  const skyColor = `linear-gradient(180deg,
    hsl(${220 + skyProgress * (-190)},${60 + skyProgress * 20}%,${8 + skyProgress * 42}%) 0%,
    hsl(${230 + skyProgress * (-200)},${40 + skyProgress * 30}%,${12 + skyProgress * 55}%) 40%,
    hsl(${25 + skyProgress * 5},${skyProgress * 70}%,${20 + skyProgress * 55}%) 80%,
    hsl(${20},${skyProgress * 50}%,${25 + skyProgress * 40}%) 100%)`;

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Ciel dégradé nuit→aube */}
      <div style={{ position: 'absolute', inset: 0, background: skyColor }} />

      {/* Étoiles qui s'estompent */}
      <div style={{ position: 'absolute', inset: 0, opacity: starOpacity }}>
        {stars.map((s, i) => <Star key={i} {...s} />)}
      </div>

      {/* Lueur de l'aube à l'horizon */}
      <div style={{
        position: 'absolute', bottom: 250, left: '30%',
        width: 800, height: 300,
        background: `radial-gradient(ellipse, rgba(255,160,60,${skyProgress * 0.35}) 0%, transparent 70%)`,
        opacity: skyProgress,
      }} />

      {/* Soleil levant */}
      <div style={{
        position: 'absolute', left: 750, top: sunY,
        opacity: sunOpacity,
        transform: 'translateX(-50%)',
      }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'radial-gradient(circle, #fff7a0, #ffcc44 40%, #ff8800)',
          boxShadow: '0 0 60px rgba(255,180,50,0.8), 0 0 120px rgba(255,140,30,0.4)',
        }} />
      </div>

      {/* Skyline Paris en silhouette */}
      {/* Haussmanniens */}
      {[
        { x: 0, w: 120, h: 280, roof: 30 },
        { x: 115, w: 90, h: 220, roof: 25 },
        { x: 200, w: 140, h: 310, roof: 35 },
        { x: 330, w: 80, h: 200, roof: 22 },
        { x: 1300, w: 130, h: 270, roof: 32 },
        { x: 1420, w: 100, h: 240, roof: 28 },
        { x: 1510, w: 160, h: 300, roof: 38 },
        { x: 1660, w: 90, h: 210, roof: 24 },
        { x: 1740, w: 120, h: 260, roof: 30 },
        { x: 1850, w: 80, h: 190, roof: 20 },
      ].map((b, i) => (
        <div key={i}>
          {/* Toit mansardé */}
          <div style={{
            position: 'absolute', left: b.x, bottom: 340 + b.h - b.roof,
            width: b.w, height: b.roof,
            background: 'rgba(15,10,30,0.95)',
            clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)',
          }} />
          {/* Corps du bâtiment */}
          <div style={{
            position: 'absolute', left: b.x, bottom: 340,
            width: b.w, height: b.h,
            background: 'rgba(20,12,35,0.92)',
          }}>
            {/* Fenêtres allumées */}
            {Array.from({ length: Math.floor(b.h / 55) }, (_, row) =>
              Array.from({ length: Math.floor(b.w / 28) }, (_, col) => {
                const lit = Math.sin(i * 17 + row * 7 + col * 13) > 0.1;
                return lit ? (
                  <div key={`${row}-${col}`} style={{
                    position: 'absolute',
                    left: 6 + col * 26, top: 8 + row * 52,
                    width: 14, height: 20,
                    background: 'rgba(255,230,120,0.85)',
                    borderRadius: 2,
                    boxShadow: '0 0 6px rgba(255,210,80,0.5)',
                  }} />
                ) : null;
              })
            )}
          </div>
        </div>
      ))}

      {/* Gare du Nord - Façade */}
      <div style={{ position: 'absolute', left: 500, bottom: 340, width: 900, height: 400 }}>
        {/* Corps principal */}
        <div style={{
          position: 'absolute', left: 0, bottom: 0, width: 900, height: 380,
          background: 'linear-gradient(180deg, rgba(40,28,18,0.96) 0%, rgba(55,38,22,0.98) 100%)',
          borderRadius: '4px 4px 0 0',
        }} />
        {/* Arches du bas */}
        {[0,1,2,3,4,5,6].map(i => (
          <div key={i} style={{
            position: 'absolute', left: 20 + i * 126, bottom: 0,
            width: 110, height: 180,
            background: 'rgba(30,20,12,0.98)',
            borderRadius: '55px 55px 0 0',
          }}>
            {/* Intérieur de l'arche éclairé */}
            <div style={{
              position: 'absolute', left: 8, top: 10, right: 8, bottom: 0,
              background: `rgba(255,200,80,${0.15 + Math.sin(i * 2.3) * 0.05})`,
              borderRadius: '46px 46px 0 0',
            }} />
          </div>
        ))}
        {/* Colonnes */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{
            position: 'absolute', left: 60 + i * 112, bottom: 180,
            width: 18, height: 180,
            background: 'rgba(60,42,24,0.95)',
          }} />
        ))}
        {/* Fronton triangulaire central */}
        <div style={{
          position: 'absolute', left: 250, bottom: 360,
          width: 400, height: 80,
          background: 'rgba(40,28,18,0.96)',
          clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)',
        }} />
        {/* Horloge */}
        <div style={{
          position: 'absolute', left: 420, bottom: 310,
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(30,20,12,0.9)',
          border: '3px solid rgba(200,160,80,0.7)',
          boxShadow: '0 0 15px rgba(255,200,80,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: 'rgba(255,200,80,0.8)', fontSize: 20 }}>🕐</div>
        </div>
        {/* Lettres GARE DU NORD */}
        <div style={{
          position: 'absolute', left: 0, bottom: 250, width: 900,
          textAlign: 'center', color: 'rgba(220,180,80,0.85)',
          fontSize: 28, fontWeight: 800, letterSpacing: 12,
          textShadow: '0 0 20px rgba(255,200,80,0.4)',
        }}>GARE DU NORD</div>
      </div>

      {/* Quai */}
      <div style={{ position: 'absolute', bottom: 240, left: 0, right: 0, height: 100, background: 'linear-gradient(180deg, #1a1208, #100d06)' }} />
      {/* Rails */}
      {[0, 1].map(r => (
        <div key={r} style={{
          position: 'absolute', bottom: 240 + r * 12, left: 0, right: 0,
          height: 4, background: 'rgba(100,80,50,0.7)',
        }} />
      ))}
      {/* Traverses */}
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 240, left: i * 52, width: 8, height: 28,
          background: 'rgba(80,55,30,0.6)',
        }} />
      ))}

      {/* Sol / Parvis */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 240, background: 'linear-gradient(180deg, #1a1510, #0e0b07)' }} />
      {/* Pavés */}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 25 }, (_, col) => (
          <div key={`${row}-${col}`} style={{
            position: 'absolute', left: col * 80 + (row % 2) * 40, bottom: row * 20,
            width: 78, height: 18, border: '1px solid rgba(80,60,40,0.3)',
            background: 'transparent',
          }} />
        ))
      )}

      {/* Le train */}
      <div style={{ position: 'absolute', bottom: 262, left: trainX, transition: 'none' }}>
        {/* Locomotive */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
          {/* Corps loco */}
          <div style={{
            width: 320, height: 100,
            background: 'linear-gradient(180deg, #1a3a6e 0%, #122858 60%, #0d1e40 100%)',
            borderRadius: '12px 50px 0 0',
            border: '2px solid rgba(100,140,255,0.3)',
            boxShadow: '0 0 30px rgba(50,100,255,0.2)',
            position: 'relative',
          }}>
            {/* Bande jaune */}
            <div style={{ position: 'absolute', top: 28, left: 0, right: 0, height: 8, background: 'rgba(255,220,60,0.8)' }} />
            {/* Fenêtres */}
            {[40, 100, 180, 250].map((wx, i) => (
              <div key={i} style={{
                position: 'absolute', left: wx, top: 12, width: 38, height: 28,
                background: 'rgba(200,230,255,0.15)',
                border: '2px solid rgba(150,180,255,0.4)',
                borderRadius: 4,
              }} />
            ))}
            {/* Phare avant */}
            {trainStop && (
              <div style={{
                position: 'absolute', right: -15, top: 20,
                width: 30, height: 30, borderRadius: '50%',
                background: 'radial-gradient(circle, #fffaaa, #ffd700)',
                boxShadow: `0 0 60px rgba(255,220,60,0.9)`,
              }} />
            )}
            {/* Numéro */}
            <div style={{
              position: 'absolute', left: 10, bottom: 8,
              color: 'rgba(255,220,60,0.7)', fontSize: 12, fontWeight: 700, letterSpacing: 2,
            }}>TGV 4821</div>
          </div>
          {/* Wagons */}
          {[-340, -680, -1020].map((wx, i) => (
            <div key={i} style={{
              position: 'absolute', left: wx, bottom: 0,
              width: 320, height: 90,
              background: 'linear-gradient(180deg, #1a3a6e 0%, #0d1e40 100%)',
              borderRadius: 4,
              border: '1px solid rgba(100,140,255,0.2)',
            }}>
              <div style={{ position: 'absolute', top: 18, left: 0, right: 0, height: 6, background: 'rgba(255,220,60,0.7)' }} />
              {[30, 90, 150, 210, 270].map((wx2) => (
                <div key={wx2} style={{
                  position: 'absolute', left: wx2, top: 8, width: 36, height: 28,
                  background: 'rgba(200,230,255,0.1)', border: '1px solid rgba(150,180,255,0.3)', borderRadius: 3,
                }}>
                  {/* Silhouette passager */}
                  <div style={{ position: 'absolute', top: 4, left: 12, width: 12, height: 16, borderRadius: '50% 50% 0 0', background: 'rgba(255,220,180,0.3)' }} />
                </div>
              ))}
            </div>
          ))}
          {/* Roues */}
          {[40, 120, 200, 280].map((wx) => (
            <div key={wx} style={{
              position: 'absolute', bottom: -18, left: wx,
              width: 36, height: 36, borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 35%, #555, #222)',
              border: '3px solid #444',
              transform: `rotate(${frame * 4}deg)`,
            }} />
          ))}
        </div>
      </div>

      {/* Vapeur */}
      {steamOpacity > 0 && (
        <div style={{
          position: 'absolute', left: trainX + 290, bottom: 360 + steamY,
          opacity: steamOpacity,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', left: i * 20 - 20, top: i * -30,
              width: 50 + i * 20, height: 50 + i * 20,
              borderRadius: '50%',
              background: 'rgba(220,220,230,0.25)',
              filter: 'blur(12px)',
            }} />
          ))}
        </div>
      )}

      {/* Léa qui descend */}
      {leaAppear > 0 && (
        <div style={{
          position: 'absolute', bottom: 242, left: leaWalkX,
          opacity: leaAppear,
          transform: `translateX(-50%)`,
        }}>
          {/* Tête */}
          <div style={{ position: 'relative', width: 60 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f5c2a0, #e8a87c)',
              border: '2px solid #d4916a', margin: '0 auto',
              position: 'relative',
            }}>
              {/* Cheveux longs */}
              <div style={{ position: 'absolute', top: -4, left: 6, width: 30, height: 18, background: '#3d1c00', borderRadius: '50% 50% 0 0' }} />
              <div style={{ position: 'absolute', top: 12, left: -5, width: 10, height: 28, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
              <div style={{ position: 'absolute', top: 12, right: -5, width: 10, height: 28, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
              {/* Yeux */}
              <div style={{ position: 'absolute', top: 14, left: 8, width: 7, height: 7, borderRadius: '50%', background: '#4a2' }} />
              <div style={{ position: 'absolute', top: 14, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#4a2' }} />
              {/* Sourire */}
              <div style={{ position: 'absolute', bottom: 8, left: 10, width: 18, height: 8, borderRadius: '0 0 10px 10px', border: '2px solid #c47a5a', borderTop: 'none' }} />
            </div>

            {/* Corps */}
            <div style={{
              width: 36, height: 50, margin: '0 auto',
              background: '#c0392b',
              borderRadius: '4px 4px 0 0',
              position: 'relative',
            }}>
              {/* Col */}
              <div style={{ position: 'absolute', top: 0, left: 8, width: 20, height: 12, background: '#e74c3c', borderRadius: '0 0 10px 10px' }} />
              {/* Bras gauche */}
              <div style={{
                position: 'absolute', left: -14, top: 4, width: 12, height: 30,
                background: '#c0392b', borderRadius: 6,
                transform: `rotate(${15 + leaLegSwing * 0.5}deg)`,
                transformOrigin: 'top center',
              }} />
              {/* Bras droit (tenant une valise) */}
              <div style={{
                position: 'absolute', right: -20, top: 4, width: 12, height: 35,
                background: '#c0392b', borderRadius: 6,
                transform: `rotate(${-10 - leaLegSwing * 0.5}deg)`,
                transformOrigin: 'top center',
              }}>
                {/* Valise */}
                <div style={{
                  position: 'absolute', bottom: -20, left: -8,
                  width: 28, height: 22,
                  background: '#8B6914', borderRadius: 4,
                  border: '2px solid #6B4F10',
                }}>
                  <div style={{ position: 'absolute', top: 8, left: 3, right: 3, height: 2, background: '#6B4F10' }} />
                  <div style={{ position: 'absolute', top: 2, left: 8, width: 10, height: 5, borderRadius: '3px 3px 0 0', border: '2px solid #6B4F10', borderBottom: 'none', background: 'transparent' }} />
                </div>
              </div>
            </div>

            {/* Jambes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              <div style={{
                width: 14, height: 40,
                background: '#2c3e50',
                borderRadius: '0 0 4px 4px',
                transform: `rotate(${leaLegSwing}deg)`,
                transformOrigin: 'top center',
              }}>
                <div style={{ position: 'absolute', bottom: -8, left: 0, width: 16, height: 10, background: '#1a252f', borderRadius: '0 0 6px 6px' }} />
              </div>
              <div style={{
                width: 14, height: 40,
                background: '#2c3e50',
                borderRadius: '0 0 4px 4px',
                transform: `rotate(${-leaLegSwing}deg)`,
                transformOrigin: 'top center',
              }}>
                <div style={{ position: 'absolute', bottom: -8, left: 0, width: 16, height: 10, background: '#1a252f', borderRadius: '0 0 6px 6px' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lampadaires du quai */}
      {[200, 600, 1000, 1400, 1700].map((lx, i) => (
        <div key={i} style={{ position: 'absolute', bottom: 240, left: lx }}>
          <div style={{ width: 6, height: 120, background: '#444', margin: '0 auto' }} />
          <div style={{
            width: 30, height: 8, borderRadius: '50%', background: '#333',
            marginLeft: -12, marginTop: -8,
            boxShadow: `0 0 20px rgba(255,210,80,${0.5 + Math.sin(frame * 0.05 + i) * 0.1})`,
          }} />
          <div style={{
            position: 'absolute', bottom: 128, left: -2,
            width: 10, height: 10, borderRadius: '50%',
            background: '#ffe46e',
            boxShadow: '0 0 18px rgba(255,230,110,0.9)',
          }} />
        </div>
      ))}

      {/* Pigeons */}
      {frame > 200 && [0, 1, 2].map(i => {
        const px = interpolate(frame, [200 + i * 50, 900 + i * 50], [300 + i * 200, 1800 + i * 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        const py = 280 + Math.sin(frame * 0.08 + i * 2) * 30;
        const wingFlap = Math.sin(frame * 0.4 + i) > 0 ? 15 : -10;
        return (
          <div key={i} style={{ position: 'absolute', left: px, top: py }}>
            <div style={{ position: 'relative', width: 24, height: 12 }}>
              <div style={{ position: 'absolute', left: 2, top: 4, width: 8, height: 6, borderRadius: '50%', background: '#888' }} />
              <div style={{ position: 'absolute', left: 0, top: 0, width: 12, height: 4, background: '#999', borderRadius: '50% 50% 0 0', transform: `rotate(${wingFlap}deg)`, transformOrigin: 'right center' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, width: 12, height: 4, background: '#999', borderRadius: '50% 50% 0 0', transform: `rotate(${-wingFlap}deg)`, transformOrigin: 'left center' }} />
            </div>
          </div>
        );
      })}

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/paris_narration1.mp3')} startFrom={0} volume={1} />
    </div>
  );
};
