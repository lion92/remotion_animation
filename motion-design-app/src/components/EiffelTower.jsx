import { interpolate } from 'remotion';

/**
 * Tour Eiffel SVG fidèle — day/night, scintillement, faisceau tournant.
 * Props :
 *   scale   : facteur d'échelle (défaut 1 → 280 × 548 px)
 *   night   : mode nuit (éclairage, sparkles, faisceau)
 *   frame   : frame courante (pour les animations de nuit)
 *   opacity : transparence globale
 */
export const EiffelTower = ({ scale = 1, night = false, frame = 0, opacity = 1 }) => {
  const iron     = night ? '#d4a820' : '#b07a20';
  const ironMid  = night ? '#c09018' : '#9a6a14';
  const ironDark = night ? '#6a4808' : '#5a3a08';
  const ironLight = night ? '#f0c840' : '#c8982c';

  const spark      = 0.45 + Math.sin(frame * 0.28) * 0.35 + Math.sin(frame * 0.67) * 0.2;
  const sweepAngle = (frame * 1.5 % 360) * Math.PI / 180;

  const W = 280;
  const H = 548;

  return (
    <svg
      width={W * scale} height={H * scale}
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: 'visible', display: 'block', opacity }}
    >
      <defs>
        {/* Dégradé horizontal fer à la Eiffel */}
        <linearGradient id="efH" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={ironDark}  />
          <stop offset="28%"  stopColor={iron}       />
          <stop offset="52%"  stopColor={ironLight}  />
          <stop offset="72%"  stopColor={iron}       />
          <stop offset="100%" stopColor={ironDark}   />
        </linearGradient>
        {/* Dégradé vertical pour les plateaux */}
        <linearGradient id="efV" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={ironLight} />
          <stop offset="100%" stopColor={ironMid}   />
        </linearGradient>
        {night && (
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        )}
      </defs>

      {/* ── SILHOUETTE PRINCIPALE ─────────────────────────────── */}
      {/*
          Tracé de référence (vue frontale, largeur base ≈ 215 px, hauteur ≈ 530 px).
          On suit le contour extérieur droit, descend vers la base, traverse,
          remonte le côté gauche (miroir).
      */}
      <path
        fill="url(#efH)"
        opacity={night ? 0.93 : 0.96}
        d="
          M 140 4
          L 144 23  L 147 52  L 149 82
          L 151 112
          C 152 124, 163 133, 178 140
          L 188 140  L 188 162
          C 181 171, 172 177, 168 188
          L 165 212  L 164 240
          L 168 265
          C 183 273, 210 280, 232 285
          L 242 285  L 242 304
          C 226 316, 213 328, 210 352
          L 208 386
          C 207 418, 211 455, 218 492
          C 220 510, 215 528, 204 538
          L 140 540
          L 76 538
          C 65 528, 60 510, 62 492
          C 69 455, 73 418, 72 386
          L 70 352
          C 67 328, 54 316, 38 304
          L 38 285  L 48 285
          C 70 280, 97 273, 112 265
          L 116 240  L 115 212
          C 112 177, 99 171, 92 162
          L 92 140  L 102 140
          C 117 133, 128 124, 129 112
          L 131 82  L 133 52
          L 136 23
          Z
        "
      />

      {/* ── OUVERTURES / ARCS À LA BASE ──────────────────────── */}
      {/* Ces formes sombres simulent les 4 piliers arqués */}
      {/* Arc gauche extérieur */}
      <path
        d="M 38 304 Q 46 430 62 492 L 76 538 L 62 538 Q 52 510 50 492 Q 42 440 36 304 Z"
        fill={ironDark} opacity="0.45"
      />
      {/* Arc droit extérieur */}
      <path
        d="M 242 304 Q 234 430 218 492 L 204 538 L 218 538 Q 228 510 230 492 Q 238 440 244 304 Z"
        fill={ironDark} opacity="0.45"
      />
      {/* Espace central sous le 1er étage (arche centrale) */}
      <path
        d="M 140 304 Q 120 360 108 440 L 108 540 L 172 540 L 172 440 Q 160 360 140 304 Z"
        fill={ironDark} opacity="0.22"
      />

      {/* ── PLATEAU 1er ÉTAGE ─────────────────────────────────── */}
      <rect x="32"  y="281" width="216" height="7"  fill={ironLight} opacity="0.9"  rx="1"/>
      <rect x="38"  y="299" width="204" height="6"  fill={iron}      opacity="0.75" rx="1"/>
      {/* Garde-corps (petits montants) */}
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={38 + i * 20} y="281" width="2" height="23" fill={ironDark} opacity="0.55"/>
      ))}

      {/* ── PLATEAU 2e ÉTAGE ──────────────────────────────────── */}
      <rect x="86"  y="136" width="108" height="7"  fill={ironLight} opacity="0.9"  rx="1"/>
      <rect x="90"  y="157" width="100" height="6"  fill={iron}      opacity="0.75" rx="1"/>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={90 + i * 16} y="136" width="2" height="27" fill={ironDark} opacity="0.5"/>
      ))}

      {/* ── PLATEFORME SOMMET ─────────────────────────────────── */}
      <rect x="130" y="76"  width="20"  height="8"  fill={iron}      opacity="0.9"  rx="2"/>

      {/* ── CROISILLONS (treillis métallique) ─────────────────── */}
      <g stroke={ironDark} strokeWidth="1.8" fill="none" opacity="0.55">
        {/* Jambes gauches sous plateau 1 */}
        <line x1="38"  y1="304" x2="72"  y2="386"/>
        <line x1="72"  y1="304" x2="38"  y2="386"/>
        <line x1="44"  y1="386" x2="62"  y2="492"/>
        <line x1="74"  y1="386" x2="56"  y2="492"/>
        {/* Jambes droites sous plateau 1 */}
        <line x1="242" y1="304" x2="208" y2="386"/>
        <line x1="208" y1="304" x2="242" y2="386"/>
        <line x1="236" y1="386" x2="218" y2="492"/>
        <line x1="206" y1="386" x2="224" y2="492"/>
        {/* Zone entre les deux plateaux */}
        <line x1="112" y1="265" x2="165" y2="162"/>
        <line x1="168" y1="265" x2="115" y2="162"/>
        <line x1="117" y1="215" x2="163" y2="215"/>
        {/* Mât supérieur */}
        <line x1="131" y1="112" x2="149" y2="82"/>
        <line x1="149" y1="112" x2="131" y2="82"/>
      </g>

      {/* ── MONTANTS HORIZONTAUX ──────────────────────────────── */}
      <g stroke={ironDark} strokeWidth="1" fill="none" opacity="0.42">
        <line x1="40"  y1="344" x2="240" y2="344"/>
        <line x1="44"  y1="412" x2="236" y2="412"/>
        <line x1="52"  y1="458" x2="228" y2="458"/>
        <line x1="116" y1="198" x2="164" y2="198"/>
        <line x1="117" y1="232" x2="163" y2="232"/>
        <line x1="133" y1="98"  x2="147" y2="98"/>
      </g>

      {/* ── AIGUILLE ─────────────────────────────────────────── */}
      <line x1="140" y1="4" x2="140" y2="76"
        stroke={ironLight} strokeWidth="4" strokeLinecap="round"/>
      <line x1="140" y1="4" x2="138" y2="26"
        stroke={ironLight} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>

      {/* ── MODE NUIT : lumières, sparkles, faisceau ─────────── */}
      {night && (
        <>
          {/* Faisceau tournant */}
          <line
            x1="140" y1="4"
            x2={140 + Math.cos(sweepAngle) * 260}
            y2={4 - Math.abs(Math.sin(sweepAngle)) * 160}
            stroke="rgba(255,255,200,0.55)"
            strokeWidth="2.5"
            style={{ filter: 'blur(1.5px)' }}
          />

          {/* Guirlandes lumineuses sur la structure */}
          {[
            // [x, y] points lumineux aux intersections clés
            [140, 4],   [136, 23],  [144, 23],
            [131, 82],  [149, 82],
            [90, 136],  [190, 136], [90, 163],  [190, 163],
            [116, 215], [164, 215], [112, 265],  [168, 265],
            [38, 285],  [242, 285], [38, 304],   [242, 304],
            [44, 344],  [236, 344], [48, 386],   [232, 386],
            [50, 412],  [230, 412], [56, 458],   [224, 458],
            [62, 492],  [218, 492], [76, 538],   [204, 538],
          ].map(([px, py], i) => {
            const bl = interpolate(
              Math.sin(frame * 0.18 + i * 0.62),
              [-1, 1], [0.25, 0.9],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            return (
              <circle
                key={i} cx={px} cy={py} r={1.8}
                fill={`rgba(255,228,90,${bl})`}
                filter="url(#glow)"
              />
            );
          })}

          {/* Balise clignotante au sommet */}
          <circle
            cx="140" cy="4"
            r={2.5 + spark * 3}
            fill="white"
            opacity={0.75 + spark * 0.25}
            filter="url(#glow)"
          />
        </>
      )}

      {/* Lueur jour au sommet */}
      {!night && (
        <ellipse cx="140" cy="4" rx="7" ry="5"
          fill="rgba(255,220,80,0.45)"
          style={{ filter: 'blur(4px)' }}
        />
      )}
    </svg>
  );
};
