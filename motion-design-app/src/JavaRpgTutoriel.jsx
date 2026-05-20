import {
  AbsoluteFill, Audio, Sequence, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from "remotion";

export const JAVA_RPG_DURATION = 11520; // 8 min @ 24fps

// ── PALETTE ───────────────────────────────────────────────────────────────────
const P = {
  bg: "#07080f", surface: "#0e1120", card: "#141824", editor: "#1a1b2e",
  border: "#2a2f45", text: "#e2e8f0", dim: "#4a5568",
  hero: "#4ade80", monster: "#ef4444", magic: "#a78bfa",
  gold: "#fbbf24", blue: "#38bdf8",
  kw: "#c792ea", str: "#c3e88d", num: "#f78c6c",
  cmt: "#546e7a", fn: "#82aaff", cls: "#f07178", attr: "#ffcb6b",
  op: "#89ddff", ann: "#80cbc4",
};
const SANS = "'Inter','Segoe UI',Arial,sans-serif";
const MONO = "'JetBrains Mono','Consolas','Courier New',monospace";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

// ── TIMING ────────────────────────────────────────────────────────────────────
const SC = {
  INTRO:   { s: 0,     d: 840  },
  HERO:    { s: 840,   d: 1200 },
  MONSTER: { s: 2040,  d: 1200 },
  COMBAT:  { s: 3240,  d: 720  },
  MENU:    { s: 3960,  d: 720  },
  MAIN:    { s: 4680,  d: 840  },
  END:     { s: 5520,  d: 720  },
  DEMO:    { s: 6240,  d: 1920 },
  AMELI1:  { s: 8160,  d: 840  },
  AMELI2:  { s: 9000,  d: 840  },
  AMELI3:  { s: 9840,  d: 840  },
  OUTRO:   { s: 10680, d: 840  },
};

const fi = (frame, s = 0, d = 20) => interpolate(frame, [s, s + d], [0, 1], clamp);
const fo = (frame, s, d = 20)     => interpolate(frame, [s, s + d], [1, 0], clamp);
const sceneFade = (frame, dur)    => Math.min(fi(frame, 0, 18), fo(frame, dur - 18, 18));

// ── JAVA TOKENIZER ────────────────────────────────────────────────────────────
const JAVA_KW = new Set([
  "public","private","protected","class","interface","extends","implements",
  "static","final","void","int","String","boolean","double","float","char",
  "long","short","byte","new","return","if","else","for","while","do",
  "switch","case","break","continue","default","this","super","null","true",
  "false","import","package","throws","throw","try","catch","finally",
  "abstract","enum","instanceof","var","List","ArrayList","Queue",
  "ArrayDeque","Random","Scanner","System","Math","Override",
]);

function tokJava(line) {
  const tr = line.trimStart();
  if (tr.startsWith("//")) return [{ t: line, c: P.cmt }];
  if (tr.startsWith("/*") || tr.startsWith(" *") || tr.startsWith("*")) return [{ t: line, c: P.cmt }];
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "@") {
      let j = i + 1;
      while (j < line.length && /\w/.test(line[j])) j++;
      tokens.push({ t: line.slice(i, j), c: P.ann }); i = j; continue;
    }
    if (ch === " " || ch === "\t") { tokens.push({ t: ch, c: P.text }); i++; continue; }
    if (ch === '"') {
      let j = i + 1;
      while (j < line.length && line[j] !== '"') { if (line[j] === "\\") j++; j++; }
      j++;
      tokens.push({ t: line.slice(i, j), c: P.str }); i = j; continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== "'") { if (line[j] === "\\") j++; j++; }
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
      if (JAVA_KW.has(word)) c = P.kw;
      else if (j < line.length && line[j] === "(") c = P.fn;
      else if (/^[A-Z]/.test(word)) c = P.cls;
      tokens.push({ t: word, c }); i = j; continue;
    }
    tokens.push({ t: ch, c: P.op }); i++;
  }
  return tokens;
}

function tokenize(code) {
  return code.split("\n").map(tokJava);
}

// ── CODE SNIPPETS ─────────────────────────────────────────────────────────────
const HERO_CODE = `public class Hero {
    private String name;
    private int hp, maxHp;
    private int mp, maxMp;
    private int attack, defense;
    private int level, xp;

    public Hero(String name) {
        this.name    = name;
        this.hp      = 100;
        this.maxHp   = 100;
        this.mp      = 40;
        this.maxMp   = 40;
        this.attack  = 15;
        this.defense = 5;
        this.level   = 1;
        this.xp      = 0;
    }

    public boolean isAlive() { return hp > 0; }

    public void takeDamage(int dmg) {
        int actual = Math.max(1, dmg - defense);
        hp = Math.max(0, hp - actual);
    }

    public void heal(int pts) {
        hp = Math.min(maxHp, hp + pts);
    }

    public void useMp(int cost) { mp -= cost; }

    public void gainXp(int amount) {
        xp += amount;
        if (xp >= level * 50) levelUp();
    }

    private void levelUp() {
        xp = 0; level++;
        maxHp += 20; hp = maxHp;
        attack += 3;
        System.out.printf("🌟 LEVEL UP ! Niveau %d !%n", level);
    }

    public String getName()  { return name;    }
    public int getHp()       { return hp;      }
    public int getMaxHp()    { return maxHp;   }
    public int getMp()       { return mp;      }
    public int getLevel()    { return level;   }
    public int getAttack()   { return attack;  }
}`;

const MONSTER_CODE = `public class Monster {
    private String name;
    private String emoji;
    private int hp, maxHp;
    private int attack, defense;

    public Monster(String name, String emoji,
                   int hp, int atk, int def) {
        this.name    = name;
        this.emoji   = emoji;
        this.hp      = hp;
        this.maxHp   = hp;
        this.attack  = atk;
        this.defense = def;
    }

    public int takeDamage(int dmg) {
        int actual = Math.max(1, dmg - defense);
        hp = Math.max(0, hp - actual);
        return actual;
    }

    public boolean isAlive()  { return hp > 0;   }
    public String getName()   { return name;      }
    public String getEmoji()  { return emoji;     }
    public int getHp()        { return hp;        }
    public int getMaxHp()     { return maxHp;     }
    public int getAttack()    { return attack;    }
}`;

const COMBAT_CODE = `import java.util.Random;

public class Combat {
    private static Random rand = new Random();

    public static int heroAttack(Hero hero, Monster m) {
        int dmg = hero.getAttack() + rand.nextInt(8) - 3;
        int actual = m.takeDamage(dmg);
        System.out.printf("⚔️ Tu fais %d dégâts !%n", actual);
        return actual;
    }

    public static int heroHeal(Hero hero) {
        int pts = rand.nextInt(15) + 10;
        hero.heal(pts);
        System.out.printf("💊 Soin de %d PV !%n", pts);
        return pts;
    }

    public static int heroMagic(Hero hero, Monster m) {
        if (hero.getMp() < 15) {
            System.out.println("❌ Pas assez de MP !");
            return -1;
        }
        hero.useMp(15);
        int dmg = rand.nextInt(20) + 20;
        int actual = m.takeDamage(dmg);
        System.out.printf("✨ Magie ! %d dégâts !%n", actual);
        return actual;
    }

    public static void monsterTurn(Monster m, Hero hero) {
        int dmg = m.getAttack() + rand.nextInt(6) - 2;
        hero.takeDamage(dmg);
        System.out.printf("🐉 %s frappe ! %d dégâts.%n",
            m.getName(), dmg);
    }
}`;

const MENU_CODE = `import java.util.Scanner;

public class GameMenu {
    private Scanner scanner = new Scanner(System.in);

    public void showStatus(Hero hero, Monster monster) {
        System.out.println();
        System.out.println("╔══════════════════════════╗");
        System.out.printf ("║ 🧙 %-8s HP:%3d/%-3d ║%n",
            hero.getName(),
            hero.getHp(), hero.getMaxHp());
        System.out.printf ("║ %s %-8s HP:%-6d   ║%n",
            monster.getEmoji(), monster.getName(),
            monster.getHp());
        System.out.println("╚══════════════════════════╝");
        System.out.println("1) Attaque  2) Soin  3) Magie");
    }

    public int getChoice() {
        System.out.print("Ton choix : ");
        return scanner.nextInt();
    }
}`;

const MAIN_CODE = `public class Main {
    public static void main(String[] args) {
        Hero    hero    = new Hero("Héros");
        Monster monster = new Monster(
            "Dragon", "🐉", 80, 12, 2);
        GameMenu menu = new GameMenu();

        System.out.println("⚔️ Le combat commence !");

        while (hero.isAlive() && monster.isAlive()) {
            menu.showStatus(hero, monster);
            int choice = menu.getChoice();

            switch (choice) {
                case 1 -> Combat.heroAttack(hero, monster);
                case 2 -> Combat.heroHeal(hero);
                case 3 -> Combat.heroMagic(hero, monster);
                default -> System.out.println("Choix invalide.");
            }

            if (monster.isAlive()) {
                Combat.monsterTurn(monster, hero);
            }
        }

        if (hero.isAlive()) {
            System.out.println("🏆 Victoire !");
            hero.gainXp(monster.getMaxHp() / 2);
        } else {
            System.out.println("💀 Défaite...");
        }
    }
}`;

const AMELI1_CODE = `// Héritage : Mage étend Hero
public class Mage extends Hero {
    private int bonusMagic = 10;

    public Mage(String name) {
        super(name);
        this.setMaxMp(80);
        this.setMp(80);
        this.setAttack(10);
    }

    @Override
    public void gainXp(int amount) {
        // Le Mage gagne 20% de XP en plus
        super.gainXp((int)(amount * 1.2));
    }

    // Sort exclusif : Boule de feu
    public int castFireball(Monster monster) {
        if (getMp() < 20) {
            System.out.println("❌ MP insuffisants !");
            return -1;
        }
        useMp(20);
        int dmg = new Random().nextInt(35) + 25;
        System.out.printf("🔥 Boule de feu ! %d dégâts !%n", dmg);
        return monster.takeDamage(dmg);
    }
}`;

const AMELI2_CODE = `import java.util.ArrayList;

public class Inventory {
    private ArrayList<Item> items = new ArrayList<>();

    public void add(Item item) {
        items.add(item);
        System.out.println("+ " + item.getName());
    }

    public boolean use(int index, Hero hero) {
        if (index < 0 || index >= items.size())
            return false;
        Item item = items.remove(index);
        item.apply(hero);
        System.out.println("Utilisé : " + item.getName());
        return true;
    }

    public void show() {
        System.out.println("=== Inventaire ===");
        for (int i = 0; i < items.size(); i++) {
            System.out.printf("[%d] %s%n",
                i + 1, items.get(i).getName());
        }
        if (items.isEmpty())
            System.out.println("(vide)");
    }

    public int size() { return items.size(); }
}`;

const AMELI3_CODE = `import java.util.ArrayDeque;
import java.util.Queue;

public class Dungeon {
    private Queue<Monster> monsters = new ArrayDeque<>();

    public Dungeon() {
        monsters.add(new Monster("Goblin","👺", 60, 8, 1));
        monsters.add(new Monster("Orc",   "👹", 90,14, 3));
        monsters.add(new Monster("Dragon","🐉",120,18, 5));
    }

    public Monster next() { return monsters.poll(); }
    public boolean hasMore() { return !monsters.isEmpty(); }

    // Dans Main.java :
    // Dungeon dungeon = new Dungeon();
    // Monster current = dungeon.next();
    // while (hero.isAlive() && current != null) {
    //   ... combat ...
    //   if (!current.isAlive()) {
    //     hero.gainXp(current.getMaxHp() / 2);
    //     current = dungeon.next();
    //   }
    // }
}`;

// ── BATTLE EVENTS (frames locaux dans la séquence DEMO) ───────────────────────
const BATTLE = [
  { f: 0,    hHp: 100, hMp: 40, mHp: 80, lines: [],                                                              actor: null },
  { f: 60,   hHp: 100, hMp: 40, mHp: 80, lines: ["⚔️ Le combat commence !"],                                    actor: null },
  { f: 180,  hHp: 100, hMp: 40, mHp: 62, lines: ["Ton choix : 1", "⚔️ Tu fais 18 dégâts !"],                    actor: "hero",    btn: "attack" },
  { f: 360,  hHp: 78,  hMp: 40, mHp: 62, lines: ["🐉 Dragon frappe ! 22 dégâts."],                              actor: "monster"  },
  { f: 540,  hHp: 100, hMp: 40, mHp: 62, lines: ["Ton choix : 2", "💊 Soin de 22 PV !"],                        actor: "hero",    btn: "heal" },
  { f: 720,  hHp: 76,  hMp: 40, mHp: 62, lines: ["🐉 Dragon frappe ! 24 dégâts."],                              actor: "monster"  },
  { f: 900,  hHp: 76,  hMp: 40, mHp: 44, lines: ["Ton choix : 1", "⚔️ Tu fais 18 dégâts !"],                    actor: "hero",    btn: "attack" },
  { f: 1080, hHp: 52,  hMp: 40, mHp: 44, lines: ["🐉 Dragon s'acharne ! 24 dégâts."],                           actor: "monster"  },
  { f: 1230, hHp: 52,  hMp: 25, mHp: 14, lines: ["Ton choix : 3", "✨ Magie ! 30 dégâts !"],                    actor: "hero",    btn: "magic" },
  { f: 1410, hHp: 28,  hMp: 25, mHp: 14, lines: ["🐉 Dragon s'acharne ! 24 dégâts."],                           actor: "monster"  },
  { f: 1530, hHp: 28,  hMp: 25, mHp: 0,  lines: ["Ton choix : 1", "⚔️ Coup final ! 14 dégâts !"],               actor: "hero",    btn: "attack" },
  { f: 1590, hHp: 28,  hMp: 25, mHp: 0,  lines: ["🏆 Victoire !", "+40 XP gagnés !"],                           actor: null       },
];

function getBattleState(frame) {
  let state = BATTLE[0];
  for (const ev of BATTLE) { if (frame >= ev.f) state = ev; else break; }
  return state;
}

function getSmoothedHp(frame, field, maxVal) {
  let curVal = BATTLE[0][field], curFrame = BATTLE[0].f, prevVal = curVal;
  for (const ev of BATTLE) {
    if (frame < ev.f) break;
    if (ev[field] !== curVal) { prevVal = curVal; curVal = ev[field]; curFrame = ev.f; }
  }
  return interpolate(frame, [curFrame, curFrame + 25], [prevVal, curVal], clamp) / maxVal;
}

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
          <div key={li} style={{ minHeight: lineHeight, whiteSpace: "pre" }}>
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
                verticalAlign: "text-bottom",
                opacity: Math.floor(visibleChars / 8) % 2 === 0 ? 1 : 0.3,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CodeScene({ code, filename, accent, title, bullets, dur, music = "music2.mp3", narrationFile, stepLabel }) {
  const frame = useCurrentFrame();
  const tokens = tokenize(code);
  const totalChars = code.length;
  const visibleChars = Math.max(0, Math.round((frame - 25) * (totalChars / (dur - 80))));
  const opacity = sceneFade(frame, dur);
  const LH = 29, MAX_LINES = 24;
  const charRatio = Math.min(1, visibleChars / Math.max(1, totalChars));
  const virtualLine = charRatio * tokens.length;
  const scrollY = Math.max(0, virtualLine - MAX_LINES + 3) * LH;

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile(`audio/${music}`)} volume={0.08} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
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
            Mini RPG Java — {stepLabel}
          </div>
        </div>
        <div style={{ color: P.text, fontSize: 46, fontWeight: 900, marginTop: 6, lineHeight: 1.1 }}>{title}</div>
        <div style={{ marginTop: 10, height: 3, background: P.border, borderRadius: 3 }}>
          <div style={{
            width: `${Math.min(100, (visibleChars / totalChars) * 100)}%`,
            height: "100%", background: accent,
            borderRadius: 3, boxShadow: `0 0 8px ${accent}`,
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "absolute", top: 190, left: 60, right: 60, bottom: 40, display: "flex", gap: 36 }}>
        {/* Code window */}
        <div style={{ flex: "0 0 67%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              background: P.editor, border: `1px solid ${P.border}`,
              borderBottom: "none", borderRadius: "10px 10px 0 0",
              padding: "8px 20px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
              <span style={{ color: P.text, fontFamily: MONO, fontSize: 13 }}>{filename}</span>
            </div>
          </div>
          <div style={{
            flex: 1, background: P.editor, border: `1px solid ${P.border}`,
            borderRadius: "0 10px 10px 10px", padding: "18px 20px", overflow: "hidden",
          }}>
            <div style={{ display: "flex", gap: 16, transform: `translateY(-${scrollY}px)` }}>
              <div style={{
                fontFamily: MONO, fontSize: 16, lineHeight: "29px",
                color: P.dim, textAlign: "right", userSelect: "none", flexShrink: 0, width: 32,
              }}>
                {tokens.map((_, i) => (
                  <div key={i} style={{
                    color: Math.abs(i - Math.floor(virtualLine)) < 2 ? P.text : P.dim,
                    fontWeight: Math.abs(i - Math.floor(virtualLine)) < 1 ? 700 : 400,
                  }}>{i + 1}</div>
                ))}
              </div>
              <TypewriterCode lines={tokens} visibleChars={visibleChars} fontSize={17} lineHeight={29} />
            </div>
          </div>
        </div>

        {/* Bullets */}
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

// ── TERMINAL DEMO ─────────────────────────────────────────────────────────────
function HPBarTerminal({ pct, color, label }) {
  return (
    <div style={{ width: "100%", marginTop: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ color: P.dim, fontSize: 12, fontFamily: MONO }}>HP</span>
        <span style={{ color: P.text, fontSize: 12, fontFamily: MONO }}>{label}</span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: 6, height: 12, overflow: "hidden" }}>
        <div style={{
          width: `${Math.max(0, Math.min(100, pct * 100))}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius: 6,
          boxShadow: `0 0 6px ${color}88`,
        }} />
      </div>
    </div>
  );
}

function FighterPanel({ emoji, name, hpPct, mpPct, isHero, shakeX = 0 }) {
  const border = isHero ? "#6366f1" : "#ef4444";
  const glow   = isHero ? "#6366f133" : "#ef444433";
  const hpCol  = isHero ? "#22c55e" : "#ef4444";
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e1b4b, #312e81)",
      border: `2px solid ${border}`, borderRadius: 14,
      padding: "16px 20px", textAlign: "center", width: 190,
      boxShadow: `0 0 24px ${glow}`,
      transform: `translateX(${shakeX}px)`,
    }}>
      <div style={{ fontSize: 48, lineHeight: 1 }}>{emoji}</div>
      <div style={{ color: P.text, fontWeight: 800, fontSize: 16, marginTop: 6, fontFamily: SANS }}>{name}</div>
      <HPBarTerminal
        pct={hpPct} color={hpCol}
        label={`${Math.round(hpPct * (isHero ? 100 : 80))}/${isHero ? 100 : 80}`}
      />
      {isHero && (
        <div style={{ marginTop: 4 }}>
          <div style={{ background: "#1e293b", borderRadius: 6, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${mpPct * 100}%`, height: "100%", background: "linear-gradient(90deg,#8b5cf6,#a78bfa)", borderRadius: 6 }} />
          </div>
        </div>
      )}
    </div>
  );
}

function CmdBtn({ label, accent, active }) {
  return (
    <div style={{
      background: active ? `${accent}33` : "#1e293b",
      border: `2px solid ${active ? accent : "#334155"}`,
      borderRadius: 10, padding: "10px 18px",
      color: active ? accent : P.text,
      fontSize: 15, fontWeight: 700, fontFamily: SANS,
      boxShadow: active ? `0 0 14px ${accent}66` : "none",
      transform: active ? "scale(1.06)" : "scale(1)",
    }}>
      {label}
    </div>
  );
}

function DemoScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DEMO.d;
  const opacity = sceneFade(frame, dur);

  const hHpPct = getSmoothedHp(frame, "hHp", 100);
  const hMpPct = getSmoothedHp(frame, "hMp", 40);
  const mHpPct = getSmoothedHp(frame, "mHp", 80);
  const state     = getBattleState(frame);
  const isVictory = frame >= 1590;

  // Collect all log lines visible so far
  const logLines = [];
  for (const ev of BATTLE) {
    if (frame >= ev.f && ev.lines) logLines.push(...ev.lines);
  }

  const btnActive = (btn) => state.btn === btn && frame < state.f + 45;
  const heroHitEvs    = BATTLE.filter(ev => ev.actor === "monster");
  const monsterHitEvs = BATTLE.filter(ev => ev.actor === "hero" && ev.btn);
  const heroShakeX    = heroHitEvs.reduce((acc, ev) => acc + computeShakeX(frame, ev.f), 0);
  const monsterShakeX = monsterHitEvs.reduce((acc, ev) => acc + computeShakeX(frame, ev.f), 0);

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile("audio/music5.mp3")} volume={0.10} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}

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
      <Sequence from={1590} durationInFrames={120}>
        <Audio src={staticFile("audio/sfx_victory.mp3")} volume={0.85} />
      </Sequence>

      <Stars count={40} />

      {/* Header */}
      <div style={{ position: "absolute", top: 36, left: 60, right: 60, zIndex: 10 }}>
        <div style={{ color: P.gold, fontSize: 20, fontWeight: 800, textTransform: "uppercase", letterSpacing: 3 }}>
          demo live
        </div>
        <div style={{ color: P.text, fontSize: 46, fontWeight: 900, marginTop: 6 }}>
          Le jeu Java en action
        </div>
        <div style={{ marginTop: 10, height: 3, background: P.border, borderRadius: 3 }}>
          <div style={{
            width: `${Math.min(100, (frame / dur) * 100)}%`,
            height: "100%", background: P.gold,
            borderRadius: 3, boxShadow: `0 0 8px ${P.gold}`,
          }} />
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        position: "absolute", top: 170, left: 60, right: 60, bottom: 40,
        display: "flex", gap: 40,
      }}>
        {/* Left : fighters + actions */}
        <div style={{ flex: "0 0 480px", display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
          {/* Arena */}
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <FighterPanel
              emoji="🧙" name="Héros" isHero
              hpPct={hHpPct} mpPct={hMpPct}
              shakeX={heroShakeX}
            />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: P.gold, fontSize: 24, fontWeight: 900 }}>⚡VS⚡</div>
              {isVictory && (
                <div style={{
                  marginTop: 8, color: P.gold, fontSize: 20, fontWeight: 900,
                  textShadow: `0 0 20px ${P.gold}`,
                  opacity: fi(frame, 1590, 20),
                }}>
                  🏆<br />Victoire !
                </div>
              )}
            </div>
            <FighterPanel
              emoji="🐉" name="Dragon" isHero={false}
              hpPct={mHpPct} mpPct={0}
              shakeX={monsterShakeX}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <CmdBtn label="⚔️ Attaque" accent="#f43f5e" active={btnActive("attack")} />
            <CmdBtn label="💊 Soin"    accent="#22c55e" active={btnActive("heal")} />
            <CmdBtn label="✨ Magie"   accent="#a78bfa" active={btnActive("magic")} />
          </div>
        </div>

        {/* Right : terminal */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Terminal bar */}
          <div style={{
            background: "#2d2d2d", borderRadius: "10px 10px 0 0",
            padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
            border: `1px solid ${P.border}`, borderBottom: "none",
          }}>
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#fbbf24" }} />
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#22c55e" }} />
            <div style={{ flex: 1, textAlign: "center", color: P.dim, fontSize: 13, fontFamily: MONO }}>
              java Main
            </div>
          </div>
          {/* Terminal body */}
          <div style={{
            flex: 1, background: "#0d1117",
            border: `1px solid ${P.border}`,
            borderRadius: "0 0 10px 10px",
            padding: "16px 20px",
            overflow: "hidden",
            fontFamily: MONO, fontSize: 14,
          }}>
            <div style={{ color: "#4ade80", marginBottom: 8, fontSize: 12 }}>
              $ java -cp . Main
            </div>
            {logLines.slice(-14).map((line, i) => {
              const age = logLines.length - 1 - i;
              const col = line.startsWith("🏆") ? P.gold
                        : line.startsWith("💀") ? P.monster
                        : line.startsWith("⚔️") ? "#f43f5e"
                        : line.startsWith("💊") ? "#22c55e"
                        : line.startsWith("✨") ? "#a78bfa"
                        : line.startsWith("🐉") ? P.monster
                        : line.startsWith("Ton choix") ? P.blue
                        : P.text;
              return (
                <div key={i} style={{
                  color: col,
                  opacity: age === 0 ? 1 : Math.max(0.25, 1 - age * 0.18),
                  lineHeight: "22px",
                  fontSize: age === 0 ? 15 : 14,
                  fontWeight: age === 0 ? 600 : 400,
                }}>
                  {line}
                </div>
              );
            })}
            {/* Blinking cursor */}
            {!isVictory && (
              <span style={{
                display: "inline-block", width: 8, height: 16,
                background: "#4ade80", marginLeft: 2,
                opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Side annotations */}
      {frame > 200 && frame < 1560 && (
        <div style={{
          position: "absolute", right: 60, top: "38%",
          width: 260, display: "flex", flexDirection: "column", gap: 12,
        }}>
          {[
            { label: "Encapsulation", desc: "private + getters — données protégées", color: P.blue,   show: 200 },
            { label: "Math.max(0, …)", desc: "HP ne passe jamais en négatif", color: P.magic,  show: 450 },
            { label: "switch expression", desc: "Java 14+ : case N -> action", color: P.hero,   show: 700 },
            { label: "Boucle while", desc: "Tant que les deux sont vivants", color: P.gold,   show: 950 },
          ].map(({ label, desc, color, show }) => (
            frame > show ? (
              <div key={label} style={{
                opacity: fi(frame, show, 24),
                background: P.card, borderLeft: `3px solid ${color}`,
                borderRadius: "0 10px 10px 0", padding: "10px 14px",
              }}>
                <div style={{ color, fontSize: 13, fontWeight: 700 }}>{label}</div>
                <div style={{ color: P.dim, fontSize: 12, marginTop: 2 }}>{desc}</div>
              </div>
            ) : null
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
}

// ── AMELI SCENE ───────────────────────────────────────────────────────────────
function AmeliScene({ code, accent, title, desc, bullets, demo, dur, music = "music1.mp3", narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(frame, dur);
  const tokens = tokenize(code);
  const totalChars = code.length;
  const visibleChars = Math.max(0, Math.round((frame - 50) * (totalChars / (dur - 100))));
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
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        boxShadow: `0 0 20px ${accent}`,
      }} />
      <div style={{
        position: "absolute", top: 36, left: 60, right: 60, zIndex: 10,
        transform: `scale(${0.85 + titleSc * 0.15})`, transformOrigin: "left center",
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

      <div style={{ position: "absolute", top: 200, left: 60, right: 60, bottom: 40, display: "flex", gap: 36 }}>
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
                  <div style={{ color: accent, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    {["Point clé", "Astuce", "Important"][i % 3]}
                  </div>
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

// ── INTRO ─────────────────────────────────────────────────────────────────────
function IntroScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.INTRO.d;
  const opacity = sceneFade(frame, dur);
  const titleScale = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 60 } });
  const sub1Op = fi(frame, 45, 22);
  const sub2Op = fi(frame, 80, 22);
  const sub3Op = fi(frame, 130, 22);

  const icons = [
    { label: "Hero.java",    color: "#4ade80", symbol: "🧙",  delay: 160 },
    { label: "Combat.java",  color: "#f43f5e", symbol: "⚔️",  delay: 220 },
    { label: "Monster.java", color: "#ef4444", symbol: "🐉",  delay: 280 },
    { label: "Main.java",    color: "#fbbf24", symbol: "▶",   delay: 340 },
  ];

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS, overflow: "hidden" }}>
      <Audio src={staticFile("audio/music4.mp3")} volume={0.12} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Stars count={80} />
      {[...Array(20)].map((_, i) => (
        <FloatingParticle key={i}
          x={100 + (i * 97) % 1700} y={100 + (i * 79) % 880}
          color={["#fbbf24","#a78bfa","#4ade80","#38bdf8"][i % 4]}
          frame={frame} offset={i * 17}
        />
      ))}
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(#f0702211 1px,transparent 1px),linear-gradient(90deg,#f0702211 1px,transparent 1px)`,
        backgroundSize: "80px 80px", opacity: 0.4,
      }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          opacity: fi(frame, 10, 18),
          background: "#f0702222", border: "1px solid #f0702266",
          borderRadius: 99, padding: "6px 20px", marginBottom: 24,
          color: "#f97316", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3,
        }}>
          Tutoriel Java · Programmation Objet
        </div>
        <div style={{
          fontSize: 110, fontWeight: 950, color: P.text,
          textShadow: `0 0 60px #f9731644, 0 0 120px #f9731622`,
          transform: `scale(${0.7 + titleScale * 0.3})`,
          letterSpacing: -2, lineHeight: 1,
        }}>
          MINI RPG
        </div>
        <div style={{ fontSize: 48, fontWeight: 950, color: "#f97316", marginTop: 4, letterSpacing: -1 }}>
          en Java
        </div>
        <div style={{ opacity: sub1Op, marginTop: 20, textAlign: "center" }}>
          <div style={{ fontSize: 36, color: "#a78bfa", fontWeight: 700 }}>
            Coder un jeu de combat tour par tour
          </div>
        </div>
        <div style={{ opacity: sub2Op, marginTop: 10, textAlign: "center" }}>
          <div style={{ fontSize: 28, color: P.dim, fontWeight: 500 }}>
            classes, encapsulation, héritage — de zéro jusqu&apos;au donjon
          </div>
        </div>
        <div style={{ opacity: sub3Op, marginTop: 28 }}>
          <div style={{
            background: "#1a1b2e", border: `1px solid ${P.border}`,
            borderRadius: 12, padding: "10px 24px",
            color: P.dim, fontSize: 18,
          }}>
            ⏱ 8 minutes · Java · Programmation Orientée Objet
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 48 }}>
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
                  fontSize: 30, fontWeight: 900, color, fontFamily: MONO,
                  boxShadow: `0 0 24px ${color}44`,
                }}>
                  {symbol}
                </div>
                <div style={{ color, fontWeight: 700, fontSize: 14 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <div style={{
        position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 100, opacity: fi(frame, 420, 30),
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>🧙</div>
          <div style={{ color: P.hero, fontWeight: 700, marginTop: 6 }}>Héros</div>
        </div>
        <div style={{ textAlign: "center", alignSelf: "center", color: P.gold, fontSize: 26, fontWeight: 900 }}>⚡VS⚡</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>🐉</div>
          <div style={{ color: P.monster, fontWeight: 700, marginTop: 6 }}>Dragon</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── OUTRO ─────────────────────────────────────────────────────────────────────
function OutroScene({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.OUTRO.d;
  const opacity = sceneFade(frame, dur);

  const items = [
    { icon: "📦", label: "Classes & Objets",   desc: "Hero, Monster, Combat — un objet par concept" },
    { icon: "🔒", label: "Encapsulation",       desc: "private + getters — données bien protégées" },
    { icon: "🔁", label: "Boucle de jeu",       desc: "while(hero.isAlive() && monster.isAlive())" },
    { icon: "🎲", label: "Aléatoire Java",      desc: "new Random() — variance dans les combats" },
    { icon: "🧬", label: "Héritage",            desc: "Mage extends Hero — spécialisation sans doublon" },
    { icon: "🏰", label: "Donjon multi-ennemi", desc: "Queue<Monster> — progression naturelle" },
  ];

  return (
    <AbsoluteFill style={{ opacity, background: P.bg, fontFamily: SANS }}>
      <Audio src={staticFile("audio/music6.mp3")} volume={0.13} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Stars count={100} seed={3} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          opacity: fi(frame, 10, 22),
          color: P.gold, fontSize: 20, fontWeight: 800,
          textTransform: "uppercase", letterSpacing: 4, marginBottom: 16,
        }}>
          Récapitulatif
        </div>
        <div style={{ fontSize: 70, fontWeight: 950, color: P.text, textShadow: `0 0 40px #f9731644`, marginBottom: 8 }}>
          Tu maîtrises
        </div>
        <div style={{
          opacity: fi(frame, 30, 22),
          fontSize: 30, color: "#f97316", fontWeight: 700, marginBottom: 48,
        }}>
          le Mini RPG Java + 3 améliorations POO
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
                <div style={{ fontSize: 34, lineHeight: 1, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ color: P.text, fontSize: 20, fontWeight: 800 }}>{label}</div>
                  <div style={{ color: P.dim, fontSize: 15, marginTop: 4 }}>{desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ opacity: fi(frame, dur - 200, 30), marginTop: 48, textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, #f97316, #fbbf24)",
            borderRadius: 16, padding: "18px 48px",
            color: "#fff", fontSize: 28, fontWeight: 900,
            boxShadow: "0 0 40px #f9731666",
          }}>
            ☕ Lance IntelliJ et code ton RPG !
          </div>
          <div style={{ color: P.dim, fontSize: 18, marginTop: 14 }}>
            Tout le code tient en 6 fichiers · &lt; 200 lignes au total
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function JavaRpgTutoriel() {
  return (
    <AbsoluteFill style={{ background: P.bg }}>
      <Sequence from={SC.INTRO.s}   durationInFrames={SC.INTRO.d}>
        <IntroScene narrationFile="java_rpg_narration1.mp3" />
      </Sequence>

      <Sequence from={SC.HERO.s}    durationInFrames={SC.HERO.d}>
        <CodeScene
          code={HERO_CODE} filename="Hero.java" accent="#4ade80" stepLabel="Étape 1/6"
          title="La classe Héros"
          bullets={[
            "private cache les données — seule la classe peut les modifier directement.",
            "Le constructeur initialise toutes les stats en une seule fois.",
            "isAlive(), heal(), gainXp() — chaque méthode a une seule responsabilité.",
          ]}
          dur={SC.HERO.d} music="music2.mp3" narrationFile="java_rpg_narration2.mp3"
        />
      </Sequence>

      <Sequence from={SC.MONSTER.s} durationInFrames={SC.MONSTER.d}>
        <CodeScene
          code={MONSTER_CODE} filename="Monster.java" accent="#ef4444" stepLabel="Étape 2/6"
          title="La classe Monstre"
          bullets={[
            "takeDamage() retourne les dégâts réels après la défense — utile pour l'affichage.",
            "Math.max(1, dmg - defense) : le héros fait toujours au moins 1 dégât.",
            "Même structure que Hero — la POO rend le code prévisible et symétrique.",
          ]}
          dur={SC.MONSTER.d} music="music2.mp3" narrationFile="java_rpg_narration3.mp3"
        />
      </Sequence>

      <Sequence from={SC.COMBAT.s}  durationInFrames={SC.COMBAT.d}>
        <CodeScene
          code={COMBAT_CODE} filename="Combat.java" accent="#fbbf24" stepLabel="Étape 3/6"
          title="Le système de combat"
          bullets={[
            "static : pas besoin d'instancier — on appelle Combat.heroAttack() directement.",
            "rand.nextInt(8) - 3 ajoute une variance de ±3 à chaque frappe.",
            "Chaque action retourne la valeur réelle pour alimenter le log.",
          ]}
          dur={SC.COMBAT.d} music="music3.mp3" narrationFile="java_rpg_narration4.mp3"
        />
      </Sequence>

      <Sequence from={SC.MENU.s}    durationInFrames={SC.MENU.d}>
        <CodeScene
          code={MENU_CODE} filename="GameMenu.java" accent="#38bdf8" stepLabel="Étape 4/6"
          title="Affichage & Scanner"
          bullets={[
            "Scanner lit la saisie clavier — c'est l'entrée/sortie standard Java.",
            "printf() avec %d, %s, %n formate l'affichage sans concaténation.",
          ]}
          dur={SC.MENU.d} music="music3.mp3" narrationFile="java_rpg_narration5.mp3"
        />
      </Sequence>

      <Sequence from={SC.MAIN.s}    durationInFrames={SC.MAIN.d}>
        <CodeScene
          code={MAIN_CODE} filename="Main.java" accent="#a78bfa" stepLabel="Étape 5/6"
          title="La boucle principale"
          bullets={[
            "while(hero.isAlive() && monster.isAlive()) — c'est la boucle de jeu entière.",
            "switch expression Java 14+ : case 1 -> action en une ligne.",
            "Le monstre riposte automatiquement après chaque action du joueur.",
          ]}
          dur={SC.MAIN.d} music="music3.mp3" narrationFile="java_rpg_narration6.mp3"
        />
      </Sequence>

      <Sequence from={SC.END.s}     durationInFrames={SC.END.d}>
        <CodeScene
          code={`// Fin du combat — vérification après la boucle while
if (hero.isAlive()) {
    System.out.println("🏆 Victoire !");
    int xpGain = monster.getMaxHp() / 2;
    hero.gainXp(xpGain);
    System.out.printf("+%d XP gagnés !%n", xpGain);

    if (hero.getLevel() > 1) {
        System.out.printf(
            "🌟 LEVEL UP ! Niveau %d !%n",
            hero.getLevel());
        System.out.printf(
            "   HP max : %d | ATK : %d%n",
            hero.getMaxHp(), hero.getAttack());
    }
} else {
    System.out.println("💀 Défaite... Game Over.");
    System.out.println("Relance le programme pour réessayer !");
}`}
          filename="Main.java" accent="#f43f5e" stepLabel="Étape 6/6"
          title="Victoire & XP"
          bullets={[
            "gainXp() calcule automatiquement le level-up si le seuil est atteint.",
            "hero.getMaxHp() / 2 : plus le monstre est fort, plus le gain XP est élevé.",
          ]}
          dur={SC.END.d} music="music3.mp3" narrationFile="java_rpg_narration7.mp3"
        />
      </Sequence>

      <Sequence from={SC.DEMO.s}    durationInFrames={SC.DEMO.d}>
        <DemoScene narrationFile="java_rpg_narration8.mp3" />
      </Sequence>

      <Sequence from={SC.AMELI1.s}  durationInFrames={SC.AMELI1.d}>
        <AmeliScene
          code={AMELI1_CODE} accent="#a78bfa"
          title="Amélioration 1 : Héritage"
          desc="Le Mage étend Hero sans dupliquer de code"
          bullets={[
            "extends Hero : le Mage hérite de toutes les méthodes du héros.",
            "@Override gainXp() surcharge le comportement — le Mage progresse plus vite.",
            "castFireball() est une méthode exclusive — seulement disponible pour le Mage.",
          ]}
          demo="Mage mage = new Mage('Merlin'); mage.castFireball(dragon); // 🔥 37 dégâts !"
          dur={SC.AMELI1.d} music="music1.mp3" narrationFile="java_rpg_narration9.mp3"
        />
      </Sequence>

      <Sequence from={SC.AMELI2.s}  durationInFrames={SC.AMELI2.d}>
        <AmeliScene
          code={AMELI2_CODE} accent="#38bdf8"
          title="Amélioration 2 : Inventaire"
          desc="ArrayList pour gérer potions et objets"
          bullets={[
            "ArrayList<Item> est typé — impossible d'ajouter autre chose qu'un Item.",
            "items.remove(index) retire et retourne — l'utiliser le consomme.",
            "Interface Item avec apply(Hero) : chaque objet définit son propre effet.",
          ]}
          demo="inv.add(new Potion(30)); inv.use(0, hero); // Utilisé : Potion +30 PV"
          dur={SC.AMELI2.d} music="music1.mp3" narrationFile="java_rpg_narration10.mp3"
        />
      </Sequence>

      <Sequence from={SC.AMELI3.s}  durationInFrames={SC.AMELI3.d}>
        <AmeliScene
          code={AMELI3_CODE} accent="#4ade80"
          title="Amélioration 3 : Donjon"
          desc="Queue de monstres — du Goblin au Dragon"
          bullets={[
            "Queue<Monster> garantit l'ordre FIFO : Goblin → Orc → Dragon.",
            "monsters.poll() retire le premier sans planter si la file est vide.",
            "hasMore() dans Main remplace l'unique monster — aucune refonte du code de combat.",
          ]}
          demo="Goblin vaincu → +30 XP → Orc apparaît → Dragon final. Trois boss, un seul code !"
          dur={SC.AMELI3.d} music="music1.mp3" narrationFile="java_rpg_narration11.mp3"
        />
      </Sequence>

      <Sequence from={SC.OUTRO.s}   durationInFrames={SC.OUTRO.d}>
        <OutroScene narrationFile="java_rpg_narration12.mp3" />
      </Sequence>
    </AbsoluteFill>
  );
}
