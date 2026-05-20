import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

export const MINI_RPG_V2_DURATION = 11520; // 8 min @ 24fps

// ── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  bg: "#07080f",
  surface: "#0e1120",
  card: "#141824",
  editor: "#1a1b2e",
  border: "#2a2f45",
  text: "#e2e8f0",
  dim: "#4a5568",
  hero: "#4ade80",
  monster: "#ef4444",
  magic: "#a78bfa",
  gold: "#fbbf24",
  blue: "#38bdf8",
  // Syntax
  kw: "#c792ea",
  str: "#c3e88d",
  num: "#f78c6c",
  cmt: "#546e7a",
  fn: "#82aaff",
  tag: "#f07178",
  attr: "#ffcb6b",
  op: "#89ddff",
};

const SANS = "'Inter','Segoe UI',Arial,sans-serif";
const MONO = "'JetBrains Mono','Consolas','Courier New',monospace";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

// ── TIMING ───────────────────────────────────────────────────────────────────
const SC = {
  INTRO:    { s: 0,     d: 840  },
  HTML:     { s: 840,   d: 1200 },
  CSS:      { s: 2040,  d: 1200 },
  JS_DATA:  { s: 3240,  d: 720  },
  JS_DISP:  { s: 3960,  d: 720  },
  JS_FIGHT: { s: 4680,  d: 840  },
  JS_AI:    { s: 5520,  d: 720  },
  DEMO:     { s: 6240,  d: 1920 },
  AMELI1:   { s: 8160,  d: 840  },
  AMELI2:   { s: 9000,  d: 840  },
  AMELI3:   { s: 9840,  d: 840  },
  OUTRO:    { s: 10680, d: 840  },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fi = (frame, s = 0, d = 20) => interpolate(frame, [s, s + d], [0, 1], clamp);
const fo = (frame, s, d = 20)     => interpolate(frame, [s, s + d], [1, 0], clamp);
const sceneFade = (frame, dur)    => Math.min(fi(frame, 0, 18), fo(frame, dur - 18, 18));

// ── TOKENIZERS ────────────────────────────────────────────────────────────────
const JS_KW = new Set([
  "const","let","var","function","return","if","else","for","while","do",
  "switch","case","break","continue","new","this","typeof","null","undefined",
  "true","false","void","class","extends","async","await","Math","document",
  "window","console","setTimeout","Array","Object","Number","Boolean",
]);

function tokJS(line) {
  const tr = line.trimStart();
  if (tr.startsWith("//")) return [{ t: line, c: P.cmt }];
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === " " || ch === "\t") { tokens.push({ t: ch, c: P.text }); i++; continue; }
    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < line.length && line[j] !== ch) { if (line[j] === "\\") j++; j++; }
      j++;
      tokens.push({ t: line.slice(i, j), c: P.str }); i = j; continue;
    }
    if (/\d/.test(ch) && (i === 0 || !/[\w$]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      tokens.push({ t: line.slice(i, j), c: P.num }); i = j; continue;
    }
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let c = P.text;
      if (JS_KW.has(word)) c = P.kw;
      else if (j < line.length && line[j] === "(") c = P.fn;
      tokens.push({ t: word, c }); i = j; continue;
    }
    tokens.push({ t: ch, c: P.op }); i++;
  }
  return tokens;
}

function tokHTML(line) {
  const tokens = [];
  let i = 0, inTag = false;
  while (i < line.length) {
    if (line.startsWith("<!--", i)) {
      const end = line.indexOf("-->", i + 4);
      const to = end === -1 ? line.length : end + 3;
      tokens.push({ t: line.slice(i, to), c: P.cmt }); i = to; continue;
    }
    if (!inTag) {
      if (line[i] === "<") {
        tokens.push({ t: "<", c: P.op }); i++; inTag = true;
        if (i < line.length && line[i] === "/") { tokens.push({ t: "/", c: P.op }); i++; }
        let j = i;
        while (j < line.length && /[\w!-]/.test(line[j])) j++;
        if (j > i) { tokens.push({ t: line.slice(i, j), c: P.tag }); i = j; }
      } else {
        let j = i;
        while (j < line.length && line[j] !== "<") j++;
        tokens.push({ t: line.slice(i, j), c: P.text }); i = j;
      }
    } else {
      if (line[i] === ">") { tokens.push({ t: ">", c: P.op }); i++; inTag = false; }
      else if (line[i] === "/" && line[i+1] === ">") { tokens.push({ t: "/>", c: P.op }); i += 2; inTag = false; }
      else if (line[i] === '"') {
        let j = i + 1;
        while (j < line.length && line[j] !== '"') j++;
        tokens.push({ t: line.slice(i, j + 1), c: P.str }); i = j + 1;
      }
      else if (line[i] === "=") { tokens.push({ t: "=", c: P.op }); i++; }
      else if (/[\w-]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[\w-]/.test(line[j])) j++;
        tokens.push({ t: line.slice(i, j), c: P.attr }); i = j;
      } else { tokens.push({ t: line[i], c: P.text }); i++; }
    }
  }
  return tokens;
}

function tokCSS(line) {
  const tr = line.trimStart();
  if (tr.startsWith("/*") || tr.startsWith("//")) return [{ t: line, c: P.cmt }];
  if (tr.endsWith("{") || tr === "}") return [{ t: line, c: P.str }];
  const tokens = [];
  let i = 0, passedColon = false;
  while (i < line.length) {
    const ch = line[i];
    if (ch === ":") { tokens.push({ t: ":", c: P.op }); i++; passedColon = true; continue; }
    if (ch === ";" || ch === "{" || ch === "}") { tokens.push({ t: ch, c: P.op }); i++; continue; }
    if (!passedColon) {
      if (/[a-zA-Z-]/.test(ch)) {
        let j = i;
        while (j < line.length && /[a-zA-Z-]/.test(line[j])) j++;
        tokens.push({ t: line.slice(i, j), c: P.attr }); i = j;
      } else { tokens.push({ t: ch, c: P.text }); i++; }
    } else {
      if (/\d/.test(ch)) {
        let j = i;
        while (j < line.length && /[\d.%]/.test(line[j])) j++;
        tokens.push({ t: line.slice(i, j), c: P.num }); i = j;
      } else if (ch === "#") {
        let j = i + 1;
        while (j < line.length && /[0-9a-fA-F]/.test(line[j])) j++;
        tokens.push({ t: line.slice(i, j), c: P.num }); i = j;
      } else if (ch === '"' || ch === "'") {
        let j = i + 1;
        while (j < line.length && line[j] !== ch) j++;
        tokens.push({ t: line.slice(i, j + 1), c: P.str }); i = j + 1;
      } else if (/[a-zA-Z(]/.test(ch)) {
        let j = i;
        while (j < line.length && /[\w(),.%-]/.test(line[j])) j++;
        tokens.push({ t: line.slice(i, j), c: P.str }); i = j;
      } else { tokens.push({ t: ch, c: P.text }); i++; }
    }
  }
  return tokens;
}

function tokenize(code, lang) {
  return code.split("\n").map((line) =>
    lang === "html" ? tokHTML(line) : lang === "css" ? tokCSS(line) : tokJS(line)
  );
}

// ── CODE SNIPPETS ─────────────────────────────────────────────────────────────
const HTML_CODE = `<div id="arena">
  <div class="fighter" id="hero-card">
    <div class="emoji">🧙</div>
    <div class="name">Héros</div>
    <div class="hp-bar-bg">
      <div class="hp-bar" id="hero-bar"></div>
    </div>
    <div class="hp-text" id="hero-hp"></div>
  </div>

  <div class="vs">⚡ VS ⚡</div>

  <div class="fighter enemy" id="monster-card">
    <div class="emoji">🐉</div>
    <div class="name">Dragon</div>
    <div class="hp-bar-bg">
      <div class="hp-bar" id="monster-bar"></div>
    </div>
    <div class="hp-text" id="monster-hp"></div>
  </div>
</div>

<div id="log"></div>

<div id="actions">
  <button onclick="attack()">⚔️ Attaque</button>
  <button onclick="heal()">💊 Soin</button>
  <button onclick="magic()">✨ Magie</button>
</div>`;

const CSS_CODE = `body {
  background: #0d0d1a;
  color: #e2e8f0;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
#arena {
  display: flex;
  gap: 60px;
  align-items: center;
  margin: 20px 0;
}
.fighter {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border: 2px solid #6366f1;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  width: 200px;
  box-shadow: 0 0 30px #6366f133;
}
.fighter.enemy {
  border-color: #ef4444;
  box-shadow: 0 0 30px #ef444433;
}
.hp-bar-bg {
  background: #1e293b;
  border-radius: 8px;
  height: 12px;
  overflow: hidden;
  margin-top: 6px;
}
.hp-bar {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #86efac);
  transition: width 0.4s ease;
}
#log {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 12px 16px;
  height: 100px;
  width: 500px;
  overflow-y: auto;
}
button {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}`;

const JS_DATA_CODE = `let hero = {
  hp:    100,  maxHp: 100,
  mp:     40,  maxMp:  40,
  atk:    15,  def:     5,
  name: "Héros"
};

let monster = {
  hp:    80,   maxHp:  80,
  atk:   12,   def:     2,
  name: "Dragon"
};

// Exemples d'accès :
console.log(hero.hp);       // 100
console.log(monster.name);  // "Dragon"

// Modification :
hero.hp -= 10;    // 90
monster.hp = 0;   // vaincu`;

const JS_DISP_CODE = `function updateHud() {
  const hPct = (hero.hp / hero.maxHp) * 100;
  const mPct = (monster.hp / monster.maxHp) * 100;

  document.getElementById('hero-bar')
    .style.width = hPct + '%';
  document.getElementById('monster-bar')
    .style.width = mPct + '%';
  document.getElementById('hero-hp')
    .textContent = hero.hp + '/' + hero.maxHp;
}

function log(msg) {
  const el = document.getElementById('log');
  const p  = document.createElement('p');
  p.textContent = msg;
  el.appendChild(p);
  el.scrollTop = el.scrollHeight;
}`;

const JS_FIGHT_CODE = `function attack() {
  if (hero.hp <= 0 || monster.hp <= 0) return;
  const dmg = Math.max(1,
    hero.atk - monster.def
    + Math.floor(Math.random() * 8) - 3
  );
  monster.hp = Math.max(0, monster.hp - dmg);
  log('⚔️ Tu fais ' + dmg + ' dégâts !');
  updateHud();
  if (!checkEnd()) monsterTurn();
}

function heal() {
  const pts = Math.floor(Math.random() * 15) + 10;
  hero.hp = Math.min(hero.maxHp, hero.hp + pts);
  log('💊 Soin de ' + pts + ' PV !');
  updateHud();
  if (!checkEnd()) monsterTurn();
}

function magic() {
  if (hero.mp < 15) {
    log('❌ Pas assez de MP !'); return;
  }
  hero.mp -= 15;
  const dmg = Math.floor(Math.random() * 20) + 20;
  monster.hp = Math.max(0, monster.hp - dmg);
  log('✨ Magie ! ' + dmg + ' dégâts !');
  updateHud();
  if (!checkEnd()) monsterTurn();
}`;

const JS_AI_CODE = `function monsterTurn() {
  const dmg = Math.max(1,
    monster.atk + Math.floor(Math.random() * 6) - 2
  );
  hero.hp = Math.max(0, hero.hp - dmg);
  log('🐉 Dragon frappe ! ' + dmg + ' dégâts.');
  updateHud();
  checkEnd();
}

function checkEnd() {
  if (monster.hp <= 0) {
    document.getElementById('result')
      .textContent = '🏆 Victoire !';
    return true;
  }
  if (hero.hp <= 0) {
    document.getElementById('result')
      .textContent = '💀 Défaite...';
    return true;
  }
  return false;
}

updateHud();
log('⚔️ Le combat commence !');`;

const AMELI1_CODE = `/* style.css — Ajout des animations */
.shake { animation: shake 0.4s; }

@keyframes shake {
  0%,  100% { transform: translateX(0);    }
  25%        { transform: translateX(-8px); }
  75%        { transform: translateX( 8px); }
}

.glow-hit { animation: glowRed 0.5s; }

@keyframes glowRed {
  0%   { box-shadow: 0 0 30px #ef444433; }
  50%  { box-shadow: 0 0 70px #ef4444cc; }
  100% { box-shadow: 0 0 30px #ef444433; }
}

/* game.js — Déclencher l'animation */
function shakeEl(id) {
  const el = document.getElementById(id);
  el.classList.remove('shake');
  void el.offsetWidth;   // force le reflow CSS
  el.classList.add('shake');
}

// Dans attack() :   shakeEl('monster-card');
// Dans monsterTurn(): shakeEl('hero-card');`;

const AMELI2_CODE = `// Remplacer 1 monstre par une file
const enemies = [
  { name: "Goblin", hp: 60,  maxHp: 60,  atk: 8,  def: 1 },
  { name: "Orc",    hp: 90,  maxHp: 90,  atk: 14, def: 3 },
  { name: "Dragon", hp: 120, maxHp: 120, atk: 18, def: 5 },
];

let monster = enemies[0];

function nextEnemy() {
  enemies.shift();
  if (enemies.length === 0) {
    log('🏆 Tous les ennemis vaincus !');
    return;
  }
  monster = enemies[0];
  log('⚡ ' + monster.name + ' apparaît !');
  updateHud();
}

// Dans checkEnd() — remplacer endGame par :
if (monster.hp <= 0) {
  log('☠️ ' + monster.name + ' vaincu !');
  nextEnemy();
  return false;
}`;

const AMELI3_CODE = `// Système d'expérience et level-up
hero.xp    = 0;
hero.level = 1;

function gainXp(amount) {
  hero.xp += amount;
  log('✨ +' + amount + ' XP !');
  const needed = hero.level * 50;
  if (hero.xp >= needed) {
    hero.xp -= needed;
    hero.level++;
    hero.maxHp += 20;
    hero.hp = hero.maxHp;
    hero.maxMp += 10;
    hero.mp = hero.maxMp;
    hero.atk += 3;
    log('🌟 LEVEL UP ! Niveau ' + hero.level);
    updateHud();
  }
}

// Dans checkEnd(), après victoire :
gainXp(Math.floor(monster.maxHp / 2));

// Dans updateHud(), afficher le niveau :
document.getElementById('hero-level')
  .textContent = 'Niv. ' + hero.level;`;

// ── BATTLE EVENTS (local frames within DEMO sequence) ────────────────────────
// actor: "hero" = hero acts (monster shakes), "monster" = monster acts (hero shakes)
const BATTLE = [
  { f: 0,    hHp: 100, hMp: 40, mHp: 80, msg: null,                                          actor: null },
  { f: 90,   hHp: 100, hMp: 40, mHp: 80, msg: "⚔️ Le combat commence !",                     actor: null },
  { f: 210,  hHp: 100, hMp: 40, mHp: 62, msg: "⚔️ Héros frappe pour 18 dégâts !",            actor: "hero",    btn: "attack" },
  { f: 390,  hHp: 78,  hMp: 40, mHp: 62, msg: "🐉 Dragon riposte ! 22 dégâts.",              actor: "monster"  },
  { f: 570,  hHp: 100, hMp: 40, mHp: 62, msg: "💊 Soin de 22 PV !",                          actor: "hero",    btn: "heal" },
  { f: 750,  hHp: 76,  hMp: 40, mHp: 62, msg: "🐉 Dragon frappe ! 24 dégâts.",               actor: "monster"  },
  { f: 930,  hHp: 76,  hMp: 40, mHp: 44, msg: "⚔️ Héros attaque pour 18 !",                  actor: "hero",    btn: "attack" },
  { f: 1110, hHp: 52,  hMp: 40, mHp: 44, msg: "🐉 Dragon frappe encore ! 24 dégâts.",        actor: "monster"  },
  { f: 1260, hHp: 52,  hMp: 25, mHp: 14, msg: "✨ Magie ! 30 dégâts magiques !",             actor: "hero",    btn: "magic" },
  { f: 1440, hHp: 28,  hMp: 25, mHp: 14, msg: "🐉 Dragon s'acharne ! 24 dégâts.",            actor: "monster"  },
  { f: 1560, hHp: 28,  hMp: 25, mHp: 0,  msg: "⚔️ Coup final ! 14 dégâts !",                actor: "hero",    btn: "attack" },
  { f: 1620, hHp: 28,  hMp: 25, mHp: 0,  msg: "🏆 Victoire !",                               actor: null       },
];

function getBattleState(frame) {
  let state = BATTLE[0];
  for (const ev of BATTLE) {
    if (frame >= ev.f) state = ev;
    else break;
  }
  return state;
}

// Returns 0..1 pct, smoothly animated between event frames
function getSmoothedHp(frame, field, maxVal) {
  let curVal  = BATTLE[0][field];
  let curFrame = BATTLE[0].f;
  let prevVal = curVal;
  for (const ev of BATTLE) {
    if (frame < ev.f) break;
    if (ev[field] !== curVal) {
      prevVal  = curVal;
      curVal   = ev[field];
      curFrame = ev.f;
    }
  }
  return interpolate(frame, [curFrame, curFrame + 25], [prevVal, curVal], clamp) / maxVal;
}

// Shake X offset for a fighter hit at a given event frame
function computeShakeX(frame, hitFrame) {
  if (frame < hitFrame || frame > hitFrame + 22) return 0;
  const t = (frame - hitFrame) / 22;
  return Math.sin(t * Math.PI * 5) * 9 * (1 - t);
}

// ── REUSABLE COMPONENTS ───────────────────────────────────────────────────────

function Stars({ count = 60, seed = 1 }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = ((i * 137 + seed * 31) % 97) / 97 * width;
        const y = ((i * 79 + seed * 17) % 89) / 89 * height;
        const pulse = Math.sin((frame + i * 13) / 28) * 0.5 + 0.5;
        const size = 1.5 + ((i * 11) % 5) * 0.8;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: size, height: size, borderRadius: "50%",
            background: "#e2e8f0",
            opacity: 0.08 + pulse * 0.18,
            boxShadow: `0 0 ${3 + pulse * 4}px #e2e8f0`,
          }} />
        );
      })}
    </>
  );
}

function FloatingParticle({ x, y, color, frame, offset = 0 }) {
  const drift = Math.sin((frame + offset) / 40) * 18;
  const opacity = (Math.sin((frame + offset) / 35) * 0.5 + 0.5) * 0.4;
  return (
    <div style={{
      position: "absolute", left: x, top: y + drift,
      width: 6, height: 6, borderRadius: "50%",
      background: color, opacity,
      boxShadow: `0 0 12px ${color}`,
    }} />
  );
}

function TypewriterCode({ lines, visibleChars, fontSize = 15, lineHeight = 26 }) {
  let accumulated = 0;
  return (
    <div style={{ fontFamily: MONO, fontSize, lineHeight: `${lineHeight}px` }}>
      {lines.map((lineTokens, li) => {
        const lineStart = accumulated;
        const lineLen = lineTokens.reduce((a, t) => a + t.t.length, 0);
        accumulated += lineLen + 1;
        const shown = Math.max(0, visibleChars - lineStart);
        if (shown === 0) return <div key={li} style={{ height: lineHeight }} />;
        let cc = 0;
        const isActive = visibleChars > lineStart && visibleChars <= lineStart + lineLen + 1;
        return (
          <div key={li} style={{ display: "flex", alignItems: "center", minHeight: lineHeight }}>
            {lineTokens.map((tok, ti) => {
              if (cc >= shown) return null;
              const vis = tok.t.slice(0, shown - cc);
              cc += tok.t.length;
              return <span key={ti} style={{ color: tok.c }}>{vis}</span>;
            })}
            {isActive && (
              <span style={{
                display: "inline-block", width: 2, height: lineHeight * 0.75,
                background: "#e2e8f0", marginLeft: 1,
                opacity: Math.floor(visibleChars / 8) % 2 === 0 ? 1 : 0.3,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CodeScene({ code, lang, filename, accent, title, bullets, dur, music = "music2.mp3", narrationFile }) {
  const frame = useCurrentFrame();
  const tokens = tokenize(code, lang);
  const totalChars = code.length;
  const visibleChars = Math.max(0, Math.round((frame - 25) * (totalChars / (dur - 80))));
  const opacity = sceneFade(frame, dur);

  // Auto-scroll: follow the cursor as code is typed (bigger font = fewer visible lines)
  const LH = 29;
  const MAX_VISIBLE_LINES = 24;
  const charRatio = Math.min(1, visibleChars / Math.max(1, totalChars));
  const virtualLine = charRatio * tokens.length;
  const scrollLines = Math.max(0, virtualLine - MAX_VISIBLE_LINES + 3);
  const scrollY = scrollLines * LH;

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile(`audio/${music}`)} volume={0.08} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      {/* Keyboard sounds during typing */}
      <Sequence from={25} durationInFrames={dur - 50}>
        <Audio src={staticFile("audio/keyboard.mp3")} volume={0.13} />
      </Sequence>

      <Stars />

      {/* Header */}
      <div style={{ position: "absolute", top: 36, left: 60, right: 60, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: accent, fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: 3 }}>
            {filename}
          </div>
          <div style={{
            background: `${accent}22`, border: `1px solid ${accent}44`,
            borderRadius: 8, padding: "4px 14px",
            color: accent, fontSize: 14, fontWeight: 700,
          }}>
            Mini RPG — Étape {
              ["index.html","style.css"].includes(filename) ? (filename === "index.html" ? "1/6" : "2/6") : "3/6+"
            }
          </div>
        </div>
        <div style={{ color: P.text, fontSize: 46, fontWeight: 900, marginTop: 6, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ marginTop: 10, height: 3, background: P.border, borderRadius: 3 }}>
          <div style={{
            width: `${Math.min(100, (visibleChars / totalChars) * 100)}%`,
            height: "100%", background: accent,
            borderRadius: 3, boxShadow: `0 0 8px ${accent}`,
            transition: "width 0.1s",
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{
        position: "absolute", top: 190, left: 60, right: 60, bottom: 40,
        display: "flex", gap: 36,
      }}>
        {/* Code window */}
        <div style={{ flex: "0 0 67%", display: "flex", flexDirection: "column" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div style={{
              background: P.editor, border: `1px solid ${P.border}`,
              borderBottom: "none", borderRadius: "10px 10px 0 0",
              padding: "8px 20px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
              <span style={{ color: P.text, fontFamily: MONO, fontSize: 13 }}>{filename}</span>
            </div>
          </div>
          {/* Editor body */}
          <div style={{
            flex: 1, background: P.editor, border: `1px solid ${P.border}`,
            borderRadius: "0 10px 10px 10px", padding: "18px 20px",
            overflow: "hidden",
          }}>
            {/* Scrollable code area — translateY follows cursor */}
            <div style={{
              display: "flex", gap: 16,
              transform: `translateY(-${scrollY}px)`,
            }}>
              {/* Line numbers */}
              <div style={{
                fontFamily: MONO, fontSize: 16, lineHeight: "29px",
                color: P.dim, textAlign: "right", userSelect: "none",
                flexShrink: 0, width: 32,
              }}>
                {tokens.map((_, i) => (
                  <div key={i} style={{
                    color: Math.abs(i - Math.floor(virtualLine)) < 2 ? P.text : P.dim,
                    fontWeight: Math.abs(i - Math.floor(virtualLine)) < 1 ? 700 : 400,
                  }}>{i + 1}</div>
                ))}
              </div>
              {/* Code */}
              <TypewriterCode lines={tokens} visibleChars={visibleChars} fontSize={17} lineHeight={29} />
            </div>
          </div>
        </div>

        {/* Explanation bullets */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
          {bullets.map((bullet, i) => {
            const start = 60 + i * 180;
            const op = fi(frame, start, 22);
            const x = interpolate(frame, [start, start + 22], [30, 0], clamp);
            return (
              <div key={i} style={{ opacity: op, transform: `translateX(${x}px)` }}>
                <div style={{
                  background: P.card, borderLeft: `4px solid ${accent}`,
                  borderRadius: "0 12px 12px 0", padding: "14px 18px",
                }}>
                  <div style={{ color: accent, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    {["Point clé", "Astuce", "Important"][i % 3]}
                  </div>
                  <div style={{ color: P.text, fontSize: 22, lineHeight: 1.45, fontFamily: SANS }}>{bullet}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── GAME UI COMPONENTS ────────────────────────────────────────────────────────
function HPBar({ pct, color, label }) {
  return (
    <div style={{ width: "100%", marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: P.dim, fontSize: 13, fontFamily: MONO }}>HP</span>
        <span style={{ color: P.text, fontSize: 13, fontFamily: MONO }}>{label}</span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 8, height: 14, overflow: "hidden" }}>
        <div style={{
          width: `${Math.max(0, Math.min(100, pct * 100))}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius: 8,
          transition: "width 0.3s",
          boxShadow: `0 0 8px ${color}88`,
        }} />
      </div>
    </div>
  );
}

function MPBar({ pct }) {
  return (
    <div style={{ width: "100%", marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: P.dim, fontSize: 13, fontFamily: MONO }}>MP</span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 8, height: 10, overflow: "hidden" }}>
        <div style={{
          width: `${Math.max(0, pct * 100)}%`,
          height: "100%",
          background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
          borderRadius: 8,
        }} />
      </div>
    </div>
  );
}

function FighterCard({ emoji, name, hpPct, mpPct, isHero, shakeX = 0 }) {
  const borderColor = isHero ? "#6366f1" : "#ef4444";
  const glowColor   = isHero ? "#6366f133" : "#ef444433";
  const hpColor     = isHero ? "#22c55e" : "#ef4444";
  return (
    <div style={{
      background: `linear-gradient(135deg, #1e1b4b, #312e81)`,
      border: `2px solid ${borderColor}`,
      borderRadius: 16, padding: "20px 22px",
      textAlign: "center", width: 200,
      boxShadow: `0 0 30px ${glowColor}`,
      transform: `translateX(${shakeX}px)`,
    }}>
      <div style={{ fontSize: 56, lineHeight: 1 }}>{emoji}</div>
      <div style={{ color: P.text, fontWeight: 800, fontSize: 18, marginTop: 8, fontFamily: SANS }}>{name}</div>
      <HPBar pct={hpPct} color={hpColor}
        label={`${Math.round(hpPct * (isHero ? 100 : 80))}/${isHero ? 100 : 80}`} />
      {isHero && <MPBar pct={mpPct} />}
    </div>
  );
}

function ActionButton({ label, accent, active }) {
  return (
    <div style={{
      background: active ? `${accent}33` : "#1e293b",
      border: `2px solid ${active ? accent : "#334155"}`,
      borderRadius: 12, padding: "12px 22px",
      color: active ? accent : P.text,
      fontSize: 16, fontWeight: 700, fontFamily: SANS,
      cursor: "pointer",
      boxShadow: active ? `0 0 16px ${accent}66` : "none",
      transform: active ? "scale(1.06)" : "scale(1)",
      transition: "all 0.15s",
    }}>
      {label}
    </div>
  );
}

// ── SCENES ────────────────────────────────────────────────────────────────────

function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.INTRO.d;
  const opacity = sceneFade(frame, dur);

  const titleScale = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 60 } });
  const sub1Op = fi(frame, 45, 22);
  const sub2Op = fi(frame, 80, 22);
  const sub3Op = fi(frame, 130, 22);

  const icons = [
    { label: "HTML", color: "#f97316", symbol: "</>", delay: 160 },
    { label: "CSS",  color: "#38bdf8", symbol: "{ }", delay: 220 },
    { label: "JS",   color: "#fbbf24", symbol: "JS",  delay: 280 },
  ];

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS, overflow: "hidden" }}>
      <Audio src={staticFile("audio/music4.mp3")} volume={0.12} />
      <Audio src={staticFile("audio/rpg_v2_narration1.mp3")} volume={1} />
      <Stars count={80} />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <FloatingParticle key={i}
          x={100 + (i * 97) % 1700}
          y={100 + (i * 79) % 880}
          color={["#fbbf24","#a78bfa","#38bdf8","#4ade80"][i % 4]}
          frame={frame} offset={i * 17}
        />
      ))}

      {/* Grid lines */}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(#6366f111 1px, transparent 1px), linear-gradient(90deg, #6366f111 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
        opacity: 0.5,
      }} />

      {/* Center content */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {/* Badge */}
        <div style={{
          opacity: fi(frame, 10, 18),
          background: "#fbbf2422", border: "1px solid #fbbf2466",
          borderRadius: 99, padding: "6px 20px", marginBottom: 24,
          color: P.gold, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3,
        }}>
          Tutoriel HTML · CSS · JS
        </div>

        {/* Main title */}
        <div style={{
          fontSize: 110, fontWeight: 950, color: P.text,
          textShadow: `0 0 60px #fbbf2444, 0 0 120px #fbbf2422`,
          transform: `scale(${0.7 + titleScale * 0.3})`,
          letterSpacing: -2, lineHeight: 1,
        }}>
          MINI RPG
        </div>

        {/* Subtitle */}
        <div style={{ opacity: sub1Op, marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 36, color: "#a78bfa", fontWeight: 700 }}>
            Coder un jeu de combat tour par tour
          </div>
        </div>
        <div style={{ opacity: sub2Op, marginTop: 10, textAlign: "center" }}>
          <div style={{ fontSize: 28, color: P.dim, fontWeight: 500 }}>
            du premier div jusqu&apos;au système de level-up
          </div>
        </div>

        {/* Duration tag */}
        <div style={{ opacity: sub3Op, marginTop: 28 }}>
          <div style={{
            background: "#1a1b2e", border: `1px solid ${P.border}`,
            borderRadius: 12, padding: "10px 24px",
            color: P.dim, fontSize: 18,
          }}>
            ⏱ 8 minutes · HTML · CSS · JavaScript
          </div>
        </div>

        {/* Tech icons */}
        <div style={{ display: "flex", gap: 32, marginTop: 52 }}>
          {icons.map(({ label, color, symbol, delay }) => {
            const sc = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 50 } });
            return (
              <div key={label} style={{
                opacity: sc, transform: `scale(${0.5 + sc * 0.5}) translateY(${(1 - sc) * 40}px)`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20,
                  background: `${color}22`, border: `2px solid ${color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 900, color, fontFamily: MONO,
                  boxShadow: `0 0 24px ${color}44`,
                }}>
                  {symbol}
                </div>
                <div style={{ color, fontWeight: 700, fontSize: 16 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Hero vs Dragon decoration */}
      <div style={{
        position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 100, opacity: fi(frame, 380, 30),
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 60 }}>🧙</div>
          <div style={{ color: P.hero, fontWeight: 700, marginTop: 6 }}>Héros</div>
        </div>
        <div style={{ textAlign: "center", alignSelf: "center", color: P.gold, fontSize: 28, fontWeight: 900 }}>⚡VS⚡</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 60 }}>🐉</div>
          <div style={{ color: P.monster, fontWeight: 700, marginTop: 6 }}>Dragon</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function DemoScene() {
  const frame = useCurrentFrame();
  const dur = SC.DEMO.d;
  const opacity = sceneFade(frame, dur);

  const hHpPct = getSmoothedHp(frame, "hHp", 100);
  const hMpPct = getSmoothedHp(frame, "hMp", 40);
  const mHpPct = getSmoothedHp(frame, "mHp", 80);

  const state     = getBattleState(frame);
  const isVictory = frame >= 1620;

  // Collect visible log messages
  const logs = BATTLE.filter((ev) => ev.msg && frame >= ev.f);

  // Active button highlight (hero action within 45 frames)
  const btnActive = (btn) => state.btn === btn && frame < state.f + 45;

  // Shake offsets — hero shakes when monster acts, monster shakes when hero acts
  const heroHitEvs    = BATTLE.filter(ev => ev.actor === "monster");
  const monsterHitEvs = BATTLE.filter(ev => ev.actor === "hero" && ev.btn);
  const heroShakeX    = heroHitEvs.reduce((acc, ev) => acc + computeShakeX(frame, ev.f), 0);
  const monsterShakeX = monsterHitEvs.reduce((acc, ev) => acc + computeShakeX(frame, ev.f), 0);

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      {/* Background music */}
      <Audio src={staticFile("audio/music5.mp3")} volume={0.10} />
      {/* Narration */}
      <Audio src={staticFile("audio/rpg_v2_narration8.mp3")} volume={1} />

      {/* Battle sound effects — each played at its event frame */}
      {BATTLE.filter(ev => ev.btn === "attack").map(ev => (
        <Sequence key={`atk-${ev.f}`} from={ev.f} durationInFrames={36}>
          <Audio src={staticFile("audio/sfx_attack.mp3")} volume={0.75} />
        </Sequence>
      ))}
      {BATTLE.filter(ev => ev.btn === "heal").map(ev => (
        <Sequence key={`heal-${ev.f}`} from={ev.f} durationInFrames={48}>
          <Audio src={staticFile("audio/sfx_heal.mp3")} volume={0.80} />
        </Sequence>
      ))}
      {BATTLE.filter(ev => ev.btn === "magic").map(ev => (
        <Sequence key={`magic-${ev.f}`} from={ev.f} durationInFrames={60}>
          <Audio src={staticFile("audio/sfx_magic.mp3")} volume={0.80} />
        </Sequence>
      ))}
      {BATTLE.filter(ev => ev.actor === "monster").map(ev => (
        <Sequence key={`mon-${ev.f}`} from={ev.f} durationInFrames={36}>
          <Audio src={staticFile("audio/sfx_monster.mp3")} volume={0.70} />
        </Sequence>
      ))}
      {/* Victory fanfare */}
      <Sequence from={1620} durationInFrames={120}>
        <Audio src={staticFile("audio/sfx_victory.mp3")} volume={0.85} />
      </Sequence>
      <Sequence from={1680} durationInFrames={240}>
        <Audio src={staticFile("audio/celebration.mp3")} volume={0.40} />
      </Sequence>

      <Stars count={40} />

      {/* Header */}
      <div style={{ position: "absolute", top: 36, left: 60, right: 60, zIndex: 10 }}>
        <div style={{ color: P.gold, fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: 3 }}>
          demo live
        </div>
        <div style={{ color: P.text, fontSize: 46, fontWeight: 900, marginTop: 6 }}>
          Le jeu en action
        </div>
        <div style={{ marginTop: 10, height: 3, background: P.border, borderRadius: 3 }}>
          <div style={{
            width: `${Math.min(100, (frame / dur) * 100)}%`,
            height: "100%", background: P.gold,
            borderRadius: 3, boxShadow: `0 0 8px ${P.gold}`,
          }} />
        </div>
      </div>

      {/* Game container */}
      <div style={{
        position: "absolute", top: 170, left: "50%",
        transform: "translateX(-50%)",
        width: 780,
      }}>
        {/* Browser mockup */}
        <div style={{
          background: "#1e293b", borderRadius: "12px 12px 0 0",
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
          border: `1px solid ${P.border}`, borderBottom: "none",
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fbbf24" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
          <div style={{
            flex: 1, textAlign: "center", color: P.dim, fontSize: 13, fontFamily: MONO,
          }}>
            mini-rpg/index.html
          </div>
        </div>

        {/* Game window */}
        <div style={{
          background: "#0d0d1a",
          border: `1px solid ${P.border}`,
          borderRadius: "0 0 12px 12px",
          padding: "28px 32px",
        }}>
          {/* Arena */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: 20 }}>
            <FighterCard
              emoji="🧙" name="Héros" isHero
              hpPct={hHpPct} mpPct={hMpPct}
              shakeX={heroShakeX}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: P.gold, fontSize: 28, fontWeight: 900 }}>⚡VS⚡</div>
              {isVictory && (
                <div style={{
                  marginTop: 10, color: P.gold, fontSize: 22, fontWeight: 900,
                  textShadow: `0 0 20px ${P.gold}`,
                  opacity: fi(frame, 1620, 20),
                }}>
                  🏆<br />Victoire !
                </div>
              )}
            </div>
            <FighterCard
              emoji="🐉" name="Dragon" isHero={false}
              hpPct={mHpPct} mpPct={0}
              shakeX={monsterShakeX}
            />
          </div>

          {/* Log */}
          <div style={{
            background: "#0f172a", border: "1px solid #334155",
            borderRadius: 8, padding: "12px 16px",
            height: 130, overflowY: "hidden", marginBottom: 16,
          }}>
            <div style={{ color: P.gold, fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 2 }}>
              Combat Log
            </div>
            {logs.slice(-5).map((ev, i) => {
              const age = logs.length - 1 - i;
              return (
                <div key={ev.f} style={{
                  color: age === 0 ? P.text : P.dim,
                  fontSize: 14, marginBottom: 3, fontFamily: MONO,
                  opacity: age === 0 ? 1 : Math.max(0.2, 1 - age * 0.25),
                }}>
                  {ev.msg}
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <ActionButton label="⚔️ Attaque" accent="#f43f5e" active={btnActive("attack")} />
            <ActionButton label="💊 Soin"    accent="#22c55e" active={btnActive("heal")} />
            <ActionButton label="✨ Magie"   accent="#a78bfa" active={btnActive("magic")} />
          </div>
        </div>
      </div>

      {/* Side annotations */}
      {frame > 200 && frame < 1600 && (
        <div style={{
          position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)",
          width: 280, display: "flex", flexDirection: "column", gap: 14,
        }}>
          {[
            { label: "Tour par tour", desc: "Le joueur agit, le monstre riposte", color: P.blue, show: 200 },
            { label: "Math.random()", desc: "Variance sur les dégâts ±3", color: P.magic, show: 400 },
            { label: "DOM en temps réel", desc: "Barres HP mises à jour à chaque coup", color: P.hero, show: 600 },
            { label: "Condition de victoire", desc: "checkEnd() après chaque action", color: P.gold, show: 900 },
          ].map(({ label, desc, color, show }) => (
            frame > show ? (
              <div key={label} style={{
                opacity: fi(frame, show, 24),
                background: P.card, borderLeft: `3px solid ${color}`,
                borderRadius: "0 10px 10px 0", padding: "10px 14px",
              }}>
                <div style={{ color, fontSize: 14, fontWeight: 700 }}>{label}</div>
                <div style={{ color: P.dim, fontSize: 13, marginTop: 2 }}>{desc}</div>
              </div>
            ) : null
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
}

function AmeliScene({ code, lang, accent, title, desc, bullets, demo, dur, music = "music1.mp3", narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(frame, dur);
  const tokens = tokenize(code, lang);
  const totalChars = code.length;
  const visibleChars = Math.max(0, Math.round((frame - 50) * (totalChars / (dur - 100))));

  // Auto-scroll for long code (bigger font = fewer visible lines)
  const ALH = 29, AMAX = 22;
  const aRatio = Math.min(1, visibleChars / Math.max(1, totalChars));
  const aVirtualLine = aRatio * tokens.length;
  const aScrollY = Math.max(0, aVirtualLine - AMAX + 3) * ALH;

  const titleSc = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 70 } });

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile(`audio/${music}`)} volume={0.08} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Stars count={50} seed={2} />

      {/* Accent strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        boxShadow: `0 0 20px ${accent}`,
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 36, left: 60, right: 60, zIndex: 10,
        transform: `scale(${0.85 + titleSc * 0.15})`,
        transformOrigin: "left center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: `${accent}22`, border: `1px solid ${accent}55`,
          borderRadius: 99, padding: "4px 16px", marginBottom: 10,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
          <span style={{ color: accent, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>
            Amélioration
          </span>
        </div>
        <div style={{ color: P.text, fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>{title}</div>
        <div style={{ color: P.dim, fontSize: 22, marginTop: 8 }}>{desc}</div>
      </div>

      {/* Split layout */}
      <div style={{
        position: "absolute", top: 200, left: 60, right: 60, bottom: 40,
        display: "flex", gap: 36,
      }}>
        {/* Code */}
        <div style={{ flex: "0 0 65%", display: "flex", flexDirection: "column" }}>
          <div style={{
            flex: 1, background: P.editor,
            border: `1px solid ${accent}44`, borderTop: `2px solid ${accent}`,
            borderRadius: 12, padding: "16px 20px", overflow: "hidden",
          }}>
            <div style={{ display: "flex", gap: 16, transform: `translateY(-${aScrollY}px)` }}>
              <div style={{ fontFamily: MONO, fontSize: 16, lineHeight: "29px", color: P.dim, textAlign: "right", width: 30, flexShrink: 0 }}>
                {tokens.map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <TypewriterCode lines={tokens} visibleChars={visibleChars} fontSize={17} lineHeight={29} />
            </div>
          </div>
        </div>

        {/* Bullets + demo */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, justifyContent: "center" }}>
          {bullets.map((b, i) => {
            const op = fi(frame, 80 + i * 140, 22);
            const x = interpolate(frame, [80 + i * 140, 102 + i * 140], [30, 0], clamp);
            return (
              <div key={i} style={{ opacity: op, transform: `translateX(${x}px)` }}>
                <div style={{
                  background: P.card, borderLeft: `4px solid ${accent}`,
                  borderRadius: "0 12px 12px 0", padding: "14px 18px",
                }}>
                  <div style={{ color: P.text, fontSize: 21, lineHeight: 1.5, fontFamily: SANS }}>{b}</div>
                </div>
              </div>
            );
          })}

          {demo && frame > dur - 320 && (
            <div style={{ opacity: fi(frame, dur - 320, 30) }}>
              <div style={{
                background: `${accent}11`, border: `1px solid ${accent}44`,
                borderRadius: 12, padding: "16px 18px",
              }}>
                <div style={{ color: accent, fontSize: 14, fontWeight: 800, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                  Résultat
                </div>
                <div style={{ color: P.text, fontSize: 20, lineHeight: 1.5 }}>{demo}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function OutroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.OUTRO.d;
  const opacity = sceneFade(frame, dur);

  const items = [
    { icon: "🏗️", label: "Structure HTML",   desc: "div, id, onclick — la fondation du jeu" },
    { icon: "🎨", label: "Style CSS",         desc: "gradient, transition, @keyframes" },
    { icon: "⚙️", label: "Logique JS",        desc: "objets, fonctions, DOM, Math.random" },
    { icon: "🎭", label: "Demo & Shake",      desc: "Animations CSS déclenchées par JS" },
    { icon: "👾", label: "Multi-ennemis",     desc: "File d'ennemis avec nextEnemy()" },
    { icon: "🌟", label: "Level-up & XP",     desc: "Système d'expérience complet" },
  ];

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile("audio/music6.mp3")} volume={0.13} />
      <Audio src={staticFile("audio/rpg_v2_narration12.mp3")} volume={1} />
      <Stars count={100} seed={3} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          opacity: fi(frame, 10, 22),
          color: P.gold, fontSize: 20, fontWeight: 800,
          textTransform: "uppercase", letterSpacing: 4, marginBottom: 16,
        }}>
          Récapitulatif
        </div>
        <div style={{
          fontSize: 70, fontWeight: 950, color: P.text,
          textShadow: `0 0 40px #a78bfa44`,
          marginBottom: 8,
        }}>
          Tu maîtrises
        </div>
        <div style={{
          opacity: fi(frame, 30, 22),
          fontSize: 30, color: "#a78bfa", fontWeight: 700, marginBottom: 48,
        }}>
          le Mini RPG complet + 3 améliorations
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, maxWidth: 1200, justifyContent: "center" }}>
          {items.map(({ icon, label, desc }, i) => {
            const sc = spring({ frame: frame - (60 + i * 50), fps, config: { damping: 12, stiffness: 60 } });
            return (
              <div key={label} style={{
                opacity: sc,
                transform: `scale(${0.6 + sc * 0.4}) translateY(${(1 - sc) * 30}px)`,
                background: P.card, border: `1px solid ${P.border}`,
                borderRadius: 16, padding: "20px 24px", width: 340,
                display: "flex", gap: 16, alignItems: "flex-start",
              }}>
                <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ color: P.text, fontSize: 20, fontWeight: 800 }}>{label}</div>
                  <div style={{ color: P.dim, fontSize: 16, marginTop: 4 }}>{desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          opacity: fi(frame, dur - 200, 30),
          marginTop: 48, textAlign: "center",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            borderRadius: 16, padding: "18px 48px",
            color: "#fff", fontSize: 28, fontWeight: 900,
            boxShadow: "0 0 40px #6366f166",
          }}>
            🚀 Lance-toi ! Ouvre ton éditeur.
          </div>
          <div style={{ color: P.dim, fontSize: 18, marginTop: 14 }}>
            Tout le code de cette vidéo tient en 3 fichiers · &lt; 120 lignes au total
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function MiniRpgCodeurV2() {
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Sequence from={SC.INTRO.s}    durationInFrames={SC.INTRO.d}>
        <IntroScene />
      </Sequence>

      <Sequence from={SC.HTML.s}     durationInFrames={SC.HTML.d}>
        <CodeScene
          code={HTML_CODE} lang="html" filename="index.html" accent="#f97316"
          title="La structure HTML"
          bullets={[
            "Chaque div est une zone du jeu : arène, log, boutons.",
            "Les id permettent à JS de cibler chaque élément du DOM.",
            "onclick=\"attack()\" relie directement le bouton à la fonction JS.",
          ]}
          dur={SC.HTML.d} music="music2.mp3" narrationFile="rpg_v2_narration2.mp3"
        />
      </Sequence>

      <Sequence from={SC.CSS.s}      durationInFrames={SC.CSS.d}>
        <CodeScene
          code={CSS_CODE} lang="css" filename="style.css" accent="#38bdf8"
          title="Le style sombre RPG"
          bullets={[
            "linear-gradient donne de la profondeur aux cartes de combat.",
            "transition: width 0.4s anime la barre HP sans une ligne de JS.",
            "box-shadow coloré crée l'aura lumineuse autour des combattants.",
          ]}
          dur={SC.CSS.d} music="music2.mp3" narrationFile="rpg_v2_narration3.mp3"
        />
      </Sequence>

      <Sequence from={SC.JS_DATA.s}  durationInFrames={SC.JS_DATA.d}>
        <CodeScene
          code={JS_DATA_CODE} lang="js" filename="game.js" accent="#fbbf24"
          title="Les objets du jeu"
          bullets={[
            "Un objet JS regroupe toutes les stats d'un personnage en un bloc.",
            "hero.hp = 90 — modifie une propriété en une seule ligne.",
          ]}
          dur={SC.JS_DATA.d} music="music3.mp3" narrationFile="rpg_v2_narration4.mp3"
        />
      </Sequence>

      <Sequence from={SC.JS_DISP.s}  durationInFrames={SC.JS_DISP.d}>
        <CodeScene
          code={JS_DISP_CODE} lang="js" filename="game.js" accent="#4ade80"
          title="Affichage dynamique"
          bullets={[
            "getElementById() cible un élément HTML par son id.",
            "style.width met la barre HP à jour — le CSS gère l'animation.",
          ]}
          dur={SC.JS_DISP.d} music="music3.mp3" narrationFile="rpg_v2_narration5.mp3"
        />
      </Sequence>

      <Sequence from={SC.JS_FIGHT.s} durationInFrames={SC.JS_FIGHT.d}>
        <CodeScene
          code={JS_FIGHT_CODE} lang="js" filename="game.js" accent="#f43f5e"
          title="Le système de combat"
          bullets={[
            "Math.random() ajoute de la variance : chaque combat est unique.",
            "Math.max(0, …) empêche les HP de passer en négatif.",
            "Même structure pour attack(), heal() et magic().",
          ]}
          dur={SC.JS_FIGHT.d} music="music3.mp3" narrationFile="rpg_v2_narration6.mp3"
        />
      </Sequence>

      <Sequence from={SC.JS_AI.s}    durationInFrames={SC.JS_AI.d}>
        <CodeScene
          code={JS_AI_CODE} lang="js" filename="game.js" accent="#a78bfa"
          title="IA & condition de fin"
          bullets={[
            "monsterTurn() riposte automatiquement après chaque action.",
            "checkEnd() retourne true pour stopper la chaîne de fonctions.",
          ]}
          dur={SC.JS_AI.d} music="music3.mp3" narrationFile="rpg_v2_narration7.mp3"
        />
      </Sequence>

      <Sequence from={SC.DEMO.s}     durationInFrames={SC.DEMO.d}>
        <DemoScene />
      </Sequence>

      <Sequence from={SC.AMELI1.s}   durationInFrames={SC.AMELI1.d}>
        <AmeliScene
          code={AMELI1_CODE} lang="css" accent="#f43f5e"
          title="Amélioration 1 : Animations"
          desc="Feedback visuel quand un combattant est touché"
          bullets={[
            "@keyframes shake fait vibrer la carte en 0.4s.",
            "void el.offsetWidth force le reflow pour relancer l'animation.",
            "JS ajoute/retire la classe — CSS gère le reste.",
          ]}
          demo="La carte du Dragon tremble à chaque coup reçu — le joueur ressent l'impact."
          dur={SC.AMELI1.d} music="music1.mp3" narrationFile="rpg_v2_narration9.mp3"
        />
      </Sequence>

      <Sequence from={SC.AMELI2.s}   durationInFrames={SC.AMELI2.d}>
        <AmeliScene
          code={AMELI2_CODE} lang="js" accent="#38bdf8"
          title="Amélioration 2 : Multi-ennemis"
          desc="Une file d'ennemis progressifs à enchaîner"
          bullets={[
            "Un tableau enemies[] stocke Goblin → Orc → Dragon.",
            "enemies.shift() retire le premier élément et passe au suivant.",
            "La difficulté monte naturellement sans changer le reste du code.",
          ]}
          demo="Goblin vaincu → Orc apparaît → Dragon final. Trois combats pour le prix d'un !"
          dur={SC.AMELI2.d} music="music1.mp3" narrationFile="rpg_v2_narration10.mp3"
        />
      </Sequence>

      <Sequence from={SC.AMELI3.s}   durationInFrames={SC.AMELI3.d}>
        <AmeliScene
          code={AMELI3_CODE} lang="js" accent="#a78bfa"
          title="Amélioration 3 : Level-Up & XP"
          desc="Progression du héros entre les combats"
          bullets={[
            "hero.xp et hero.level ajoutés à l'objet existant — aucune refonte.",
            "gainXp() calcule si le seuil est atteint et améliore les stats.",
            "Le héros devient plus fort à chaque victoire — boucle de progression.",
          ]}
          demo="Victoire → +40 XP → Level 2 ! → HP max +20, ATK +3 → prêt pour l'Orc."
          dur={SC.AMELI3.d} music="music1.mp3" narrationFile="rpg_v2_narration11.mp3"
        />
      </Sequence>

      <Sequence from={SC.OUTRO.s}    durationInFrames={SC.OUTRO.d}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
}
