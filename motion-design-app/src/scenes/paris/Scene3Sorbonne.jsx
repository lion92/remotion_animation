import { useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';

const fi = (f, s, d) => interpolate(f, [s, s + d], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

const SUBS = [
  { text: "La Sorbonne... fondée en 1257.", s: 30, e: 260 },
  { text: "Des siècles de savoirs entre ces murs de pierre.", s: 300, e: 540 },
  { text: "Léa lit l'annonce : \"Recrutement Doctorat — Sciences\".", s: 580, e: 840 },
  { text: "Son cœur s'emballe. C'est exactement ça.", s: 880, e: 1150 },
];

const subStyle = {
  position: 'absolute', bottom: 55, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(10,5,20,0.88)',
  color: '#f1e8d8',
  padding: '14px 44px', borderRadius: 10,
  fontSize: 34, fontWeight: 500,
  textAlign: 'center', maxWidth: '82%',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(200,180,120,0.3)',
  letterSpacing: '0.03em', whiteSpace: 'nowrap',
};

export const ParisScene3Sorbonne = () => {
  const frame = useCurrentFrame();

  const sceneOpacity = interpolate(frame, [0, 40, 1160, 1200], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Léa arrive et s'approche de l'affiche
  const leaX = interpolate(frame, [0, 500], [-60, 320], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const leaLeg = Math.sin(frame * 0.32) * (frame < 500 ? 18 : 0);
  const leaReadPose = interpolate(frame, [560, 640], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Affiche de recrutement
  const posterReveal = fi(frame, 400, 80);

  // Cœur qui bat
  const heartBeat = frame > 880 ? 1 + Math.sin(frame * 0.5) * 0.15 : 1;
  const heartOpacity = fi(frame, 900, 60);

  // Étudiants passants
  const student1X = interpolate(frame, [0, 1200], [2200, -200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const student2X = interpolate(frame, [200, 1200], [2400, 200], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Livres qui flottent (animation rêve)
  const bookFloat = Array.from({ length: 6 }, (_, i) => {
    const seed = Math.sin(i * 654.3) * 10000; const v = seed - Math.floor(seed);
    const seed2 = Math.sin(i * 321.7) * 10000; const v2 = seed2 - Math.floor(seed2);
    const floatY = Math.sin(frame * 0.04 + i * 1.2) * 15;
    const appear = fi(frame, 700 + i * 40, 50);
    return { x: 700 + v * 700, y: 100 + v2 * 350 + floatY, appear, color: ['#c0392b', '#2c3e50', '#27ae60', '#8e44ad', '#e67e22', '#2980b9'][i] };
  });

  const renderSub = (text, s, e) => {
    if (frame < s || frame > e) return null;
    const opacity = interpolate(frame, [s, s + 18, e - 18, e], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return <div style={{ ...subStyle, opacity }}>{text}</div>;
  };

  return (
    <div style={{ width: 1920, height: 1080, overflow: 'hidden', opacity: sceneOpacity, position: 'relative', fontFamily: 'system-ui, sans-serif' }}>

      {/* Ciel bleu clair */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #5b8fd4 0%, #a8c8f0 35%, #d4e8f8 60%, #e8d8b8 80%, #c8b890 100%)',
      }} />

      {/* Nuages */}
      {[
        { x: 100, y: 60, w: 200 },
        { x: 600, y: 40, w: 160 },
        { x: 1200, y: 70, w: 220 },
        { x: 1600, y: 50, w: 180 },
      ].map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.x + frame * 0.15, top: c.y }}>
          {[0, 1, 2, 3].map(j => (
            <div key={j} style={{
              position: 'absolute',
              left: j * c.w * 0.22, top: j % 2 === 0 ? 0 : -c.w * 0.12,
              width: c.w * 0.45, height: c.w * 0.35,
              borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
            }} />
          ))}
        </div>
      ))}

      {/* FAÇADE SORBONNE */}
      {/* Corps principal */}
      <div style={{
        position: 'absolute', left: 200, bottom: 320, width: 1520, height: 580,
        background: 'linear-gradient(180deg, #d4c49a, #c4b488 40%, #b4a478 100%)',
        border: '3px solid #a89060',
      }}>
        {/* Bande centrale ornementale */}
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 400, height: '100%',
          background: 'linear-gradient(180deg, #ddd0a8, #ccc098 40%, #bcb088)',
          borderLeft: '3px solid #a89060',
          borderRight: '3px solid #a89060',
        }}>
          {/* Fronton triangulaire */}
          <div style={{
            position: 'absolute', top: -60, left: -30, width: 460, height: 70,
            background: '#c4b488',
            clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)',
            border: '2px solid #a89060',
          }} />
          {/* Inscription */}
          <div style={{
            position: 'absolute', top: 30,
            width: '100%', textAlign: 'center',
            color: '#4a3820', fontSize: 22, fontWeight: 800, letterSpacing: 3,
          }}>UNIVERSITÉ DE PARIS</div>
          <div style={{
            position: 'absolute', top: 56,
            width: '100%', textAlign: 'center',
            color: '#6a5530', fontSize: 16, letterSpacing: 2,
          }}>LA SORBONNE · MCCLVII</div>
          {/* Grande arche centrale */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: 160, height: 280,
            background: '#a89060',
            borderRadius: '80px 80px 0 0',
          }}>
            <div style={{
              position: 'absolute', left: 8, top: 8, right: 8, bottom: 0,
              background: 'linear-gradient(180deg, #2a1f10, #1a1308)',
              borderRadius: '72px 72px 0 0',
            }}>
              {/* Porte en bois */}
              <div style={{
                position: 'absolute', bottom: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 80, height: 160,
                background: '#4a3218',
                borderRadius: '0 0 4px 4px',
                border: '2px solid #2a1a08',
              }}>
                {/* Décor porte */}
                <div style={{ position: 'absolute', top: 20, left: 8, width: 28, height: 40, border: '2px solid #6a4a28', borderRadius: 4 }} />
                <div style={{ position: 'absolute', top: 20, right: 8, width: 28, height: 40, border: '2px solid #6a4a28', borderRadius: 4 }} />
                <div style={{ position: 'absolute', top: 70, left: 8, width: 28, height: 60, border: '2px solid #6a4a28', borderRadius: 4 }} />
                <div style={{ position: 'absolute', top: 70, right: 8, width: 28, height: 60, border: '2px solid #6a4a28', borderRadius: 4 }} />
                {/* Heurtoir */}
                <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: '#8a6a28' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Colonnes */}
        {[-280, -180, 180, 280].map((cx, i) => (
          <div key={i} style={{
            position: 'absolute', left: '50%', bottom: 0,
            marginLeft: cx - 20,
            width: 40, height: 440,
            background: 'linear-gradient(90deg, #b8a878, #d4c49a, #b8a878)',
            borderRadius: '4px 4px 0 0',
          }}>
            {/* Chapiteau */}
            <div style={{
              position: 'absolute', top: -20, left: -10,
              width: 60, height: 22,
              background: '#c4b488', border: '1px solid #a89060',
            }} />
          </div>
        ))}

        {/* Fenêtres */}
        {[-520, -380, 380, 520].map((wx, i) => (
          <div key={i}>
            {[1, 2, 3].map(row => (
              <div key={row} style={{
                position: 'absolute', left: '50%', bottom: row * 140 - 40,
                marginLeft: wx - 30,
                width: 60, height: 90,
                background: Math.sin(i * 5 + row * 3) > 0.2 ? 'rgba(200,230,255,0.4)' : 'rgba(80,60,30,0.3)',
                border: '3px solid #a89060',
                borderRadius: '30px 30px 0 0',
              }}>
                {/* Croisillon */}
                <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 2, background: '#a89060' }} />
                <div style={{ position: 'absolute', top: 0, left: '50%', bottom: 0, width: 2, background: '#a89060' }} />
              </div>
            ))}
          </div>
        ))}

        {/* Dôme */}
        <div style={{
          position: 'absolute', top: -120, left: '50%',
          transform: 'translateX(-50%)',
          width: 200, height: 140,
          borderRadius: '50% 50% 0 0',
          background: 'linear-gradient(180deg, #8a7a50, #6a5a30)',
          border: '2px solid #5a4a20',
        }}>
          {/* Lanternon */}
          <div style={{
            position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
            width: 40, height: 50,
            background: '#7a6a40',
            borderRadius: '50% 50% 0 0',
          }} />
          <div style={{
            position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
            width: 6, height: 40,
            background: '#5a4a20',
          }} />
        </div>

        {/* Affiche de recrutement */}
        {posterReveal > 0 && (
          <div style={{
            position: 'absolute', left: 50, bottom: 80,
            opacity: posterReveal,
            transform: `scale(${0.8 + posterReveal * 0.2})`,
            transformOrigin: 'bottom left',
          }}>
            <div style={{
              width: 220, background: '#fef9f0',
              border: '3px solid #2c3e50',
              borderRadius: 4, padding: '12px',
              boxShadow: '4px 4px 12px rgba(0,0,0,0.4)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#1a1a2e', letterSpacing: 1, marginBottom: 6, borderBottom: '2px solid #e74c3c', paddingBottom: 4 }}>
                RECRUTEMENT DOCTORAT
              </div>
              <div style={{ fontSize: 11, color: '#2c3e50', lineHeight: 1.5, marginBottom: 4 }}>
                <strong>Spécialité :</strong> Sciences des matériaux
              </div>
              <div style={{ fontSize: 11, color: '#2c3e50', lineHeight: 1.5, marginBottom: 4 }}>
                <strong>Laboratoire :</strong> CNRS UMR 7588
              </div>
              <div style={{ fontSize: 11, color: '#c0392b', fontWeight: 700, marginBottom: 4 }}>
                Financement 3 ans
              </div>
              <div style={{ fontSize: 10, color: '#555', lineHeight: 1.4 }}>
                Profil recherché : M2 ou équivalent, passion pour la recherche fondamentale.
              </div>
              <div style={{
                marginTop: 8, background: '#2c3e50', color: '#fff',
                fontSize: 10, textAlign: 'center', padding: '4px 8px',
                borderRadius: 3, fontWeight: 700, letterSpacing: 1,
              }}>CANDIDATER →</div>
            </div>
          </div>
        )}
      </div>

      {/* Sol */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, background: 'linear-gradient(180deg, #b8a880, #9a8a60)' }} />
      <div style={{ position: 'absolute', bottom: 318, left: 0, right: 0, height: 3, background: '#8a7850' }} />
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 26 }, (_, col) => (
          <div key={`${row}-${col}`} style={{
            position: 'absolute', left: col * 76 + (row % 2) * 38, bottom: row * 40,
            width: 74, height: 38, border: '1px solid rgba(100,80,40,0.3)', background: 'transparent',
          }} />
        ))
      )}

      {/* Étudiant passant (fond) */}
      <div style={{ position: 'absolute', bottom: 320, left: student2X, opacity: 0.6 }}>
        <div style={{ width: 30, height: 80, background: '#34495e', borderRadius: 4, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', width: 28, height: 28, borderRadius: '50%', background: '#f5c2a0', border: '2px solid #d4916a' }} />
          {/* Sac à dos */}
          <div style={{ position: 'absolute', right: -14, top: 4, width: 16, height: 24, background: '#2c3e50', borderRadius: 4 }} />
        </div>
      </div>

      {/* Léa */}
      <div style={{
        position: 'absolute', bottom: 320, left: leaX,
        transform: 'translateX(-50%)',
      }}>
        {/* Tête avec orientation vers l'affiche */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f5c2a0, #e8a87c)',
          border: '2px solid #d4916a', margin: '0 auto', position: 'relative',
          transform: `rotate(${leaReadPose * 15}deg)`,
          transformOrigin: 'bottom center',
        }}>
          <div style={{ position: 'absolute', top: -4, left: 6, width: 32, height: 18, background: '#3d1c00', borderRadius: '50% 50% 0 0' }} />
          <div style={{ position: 'absolute', top: 10, left: -5, width: 10, height: 28, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
          <div style={{ position: 'absolute', top: 10, right: -5, width: 10, height: 28, background: '#3d1c00', borderRadius: '0 0 5px 5px' }} />
          <div style={{ position: 'absolute', top: 14, left: 8, width: 7, height: 7, borderRadius: '50%', background: '#2d8a4e' }} />
          <div style={{ position: 'absolute', top: 14, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#2d8a4e' }} />
          <div style={{ position: 'absolute', bottom: 6, left: 11, width: 20, height: 8, borderRadius: '0 0 10px 10px', border: '2px solid #c47a5a', borderTop: 'none' }} />
        </div>
        {/* Corps */}
        <div style={{
          width: 38, height: 54, margin: '0 auto',
          background: '#c0392b', borderRadius: '4px 4px 0 0', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 9, width: 20, height: 12, background: '#e74c3c', borderRadius: '0 0 10px 10px' }} />
          <div style={{
            position: 'absolute', left: -16, top: 4, width: 12, height: 34,
            background: '#c0392b', borderRadius: 6,
            transform: `rotate(${15 + leaLeg * 0.4}deg)`, transformOrigin: 'top center',
          }}>
            <div style={{
              position: 'absolute', bottom: -20, left: -8, width: 28, height: 22,
              background: '#8B6914', borderRadius: 4, border: '2px solid #6B4F10',
            }}>
              <div style={{ position: 'absolute', top: 8, left: 3, right: 3, height: 2, background: '#6B4F10' }} />
              <div style={{ position: 'absolute', top: 2, left: 8, width: 10, height: 5, borderRadius: '3px 3px 0 0', border: '2px solid #6B4F10', borderBottom: 'none', background: 'transparent' }} />
            </div>
          </div>
          <div style={{
            position: 'absolute', right: -14, top: 4, width: 12, height: 32,
            background: '#c0392b', borderRadius: 6,
            transform: `rotate(${-10 - leaLeg * 0.3}deg)`, transformOrigin: 'top center',
          }} />
        </div>
        {/* Jambes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          {[leaLeg, -leaLeg].map((rot, i) => (
            <div key={i} style={{
              width: 14, height: 44, background: '#2c3e50',
              borderRadius: '0 0 4px 4px',
              transform: `rotate(${rot}deg)`, transformOrigin: 'top center',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', bottom: -8, left: 0, width: 16, height: 10, background: '#1a252f', borderRadius: '0 0 6px 6px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Cœur qui bat */}
      {heartOpacity > 0 && (
        <div style={{
          position: 'absolute', bottom: 540, left: leaX + 30,
          opacity: heartOpacity,
          transform: `scale(${heartBeat})`,
          fontSize: 36,
          filter: 'drop-shadow(0 0 8px rgba(231,76,60,0.8))',
        }}>❤️</div>
      )}

      {/* Livres flottants */}
      {bookFloat.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: b.x, top: b.y,
          opacity: b.appear * 0.85,
          transform: `rotate(${-15 + i * 8}deg)`,
        }}>
          <div style={{
            width: 34, height: 44,
            background: b.color,
            borderRadius: '2px 4px 4px 2px',
            border: `2px solid rgba(0,0,0,0.3)`,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 5, height: '100%', background: 'rgba(0,0,0,0.2)' }} />
            {[8, 16, 24, 32].map(ly => (
              <div key={ly} style={{ position: 'absolute', top: ly, left: 8, right: 4, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
            ))}
          </div>
        </div>
      ))}

      {SUBS.map(({ text, s, e }, i) => <div key={i}>{renderSub(text, s, e)}</div>)}

      <Audio src={staticFile('audio/paris_narration3.mp3')} startFrom={0} volume={1} />
    </div>
  );
};
