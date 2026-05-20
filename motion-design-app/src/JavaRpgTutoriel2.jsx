import {
  AbsoluteFill, Audio, Sequence, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, spring,
} from "remotion";

export const JAVA_RPG2_DURATION = 11520; // 8 min @ 24fps

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

const SC = {
  INTRO:  { s: 0,     d: 840  },
  SC1:    { s: 840,   d: 1200 }, // Interface + Classe abstraite
  SC2:    { s: 2040,  d: 1200 }, // Polymorphisme
  SC3:    { s: 3240,  d: 720  }, // Exceptions
  SC4:    { s: 3960,  d: 720  }, // Collections HashMap/TreeMap
  SC5:    { s: 4680,  d: 840  }, // Streams & Lambda
  SC6:    { s: 5520,  d: 720  }, // Generics
  DEMO:   { s: 6240,  d: 1920 },
  AMELI1: { s: 8160,  d: 840  }, // Pattern Observer
  AMELI2: { s: 9000,  d: 840  }, // Enum avec stats
  AMELI3: { s: 9840,  d: 840  }, // Pattern Stratégie / AI
  OUTRO:  { s: 10680, d: 840  },
};

const fi = (f, s = 0, d = 20) => interpolate(f, [s, s + d], [0, 1], clamp);
const fo = (f, s, d = 20)     => interpolate(f, [s, s + d], [1, 0], clamp);
const sceneFade = (f, dur)    => Math.min(fi(f, 0, 18), fo(f, dur - 18, 18));

// ── JAVA TOKENIZER ────────────────────────────────────────────────────────────
const JAVA_KW = new Set([
  "public","private","protected","class","interface","abstract","extends","implements",
  "static","final","void","int","String","boolean","double","float","char","long",
  "new","return","if","else","for","while","do","switch","case","break","default",
  "this","super","null","true","false","import","throws","throw","try","catch",
  "finally","enum","instanceof","var","List","ArrayList","HashMap","TreeMap",
  "Optional","Collections","Comparator","Stream","Random","System","Math",
  "Override","FunctionalInterface","ArrayDeque","Queue",
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
      tokens.push({ t: line.slice(i, j + 1), c: P.str }); i = j + 1; continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== "'") { if (line[j] === "\\") j++; j++; }
      tokens.push({ t: line.slice(i, j + 1), c: P.str }); i = j + 1; continue;
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
function tokenize(code) { return code.split("\n").map(tokJava); }

// ── CODE SNIPPETS ─────────────────────────────────────────────────────────────
const CODE_INTERFACE = `// Contrat : toute entité de jeu l'implémente
public interface Entity {
    String getName();
    int    getHp();
    int    getMaxHp();
    boolean isAlive();
    void    takeDamage(int dmg);

    // Méthode par défaut (Java 8+) : pas besoin de la
    // redéfinir si l'implémentation par défaut convient
    default double getHpPercent() {
        return (double) getHp() / getMaxHp() * 100.0;
    }
}

// Classe abstraite : socle commun Hero & Monster
public abstract class AbstractCharacter
        implements Entity {
    protected String name;
    protected int    hp, maxHp;
    protected int    attack, defense;

    public AbstractCharacter(
            String name, int hp, int atk, int def) {
        this.name    = name;
        this.maxHp   = hp;  this.hp = hp;
        this.attack  = atk; this.defense = def;
    }

    @Override
    public void takeDamage(int dmg) {
        int actual = Math.max(1, dmg - defense);
        this.hp = Math.max(0, hp - actual);
    }

    @Override public boolean isAlive() { return hp > 0; }
    @Override public String  getName() { return name;   }
    @Override public int     getHp()   { return hp;     }
    @Override public int     getMaxHp(){ return maxHp;  }

    // Méthode abstraite : chaque sous-classe définit son tour
    public abstract String doAttack(Entity target);
}`;

const CODE_POLYMORPHISME = `import java.util.ArrayList;
import java.util.List;

public class BattleArena {
    // Polymorphisme : Hero et Monster sont des Entity
    private List<Entity> participants = new ArrayList<>();

    public void addParticipant(Entity e) {
        participants.add(e);
    }

    // Traitement UNIFORME grâce au polymorphisme
    public void showStatus() {
        System.out.println("=== Tableau de bord ===");
        for (Entity e : participants) {
            String bar = buildBar(e.getHpPercent());
            System.out.printf("%-12s [%s] %.0f%%\\n",
                e.getName(), bar, e.getHpPercent());
        }
    }

    private String buildBar(double pct) {
        int f = (int)(pct / 10);
        return "█".repeat(f) + "░".repeat(10 - f);
    }

    // Java 8 Stream : filtre les vivants
    public List<Entity> getAlive() {
        return participants.stream()
            .filter(Entity::isAlive)
            .toList();
    }

    // Menace totale = somme des attaques ennemies
    public int totalThreat(Class<?> heroClass) {
        return participants.stream()
            .filter(e -> !e.getClass().equals(heroClass))
            .filter(Entity::isAlive)
            .mapToInt(e -> ((AbstractCharacter) e).attack)
            .sum();
    }
}`;

const CODE_EXCEPTIONS = `// Exception vérifiée : doit être déclarée ou capturée
public class InvalidActionException extends Exception {
    private final int actionCode;

    public InvalidActionException(int code) {
        super("Action invalide : " + code
            + ". Choisir 1 (attaque), 2 (soin), 3 (magie).");
        this.actionCode = code;
    }
    public int getActionCode() { return actionCode; }
}

// Exception non-vérifiée : agir sur un personnage mort
public class DeadCharacterException extends RuntimeException {
    public DeadCharacterException(String name) {
        super(name + " est mort — impossible d'agir !");
    }
}

// Utilisation dans Combat :
public static void perform(Hero hero, Monster m, int choice)
        throws InvalidActionException {
    if (!hero.isAlive())
        throw new DeadCharacterException(hero.getName());

    switch (choice) {
        case 1 -> heroAttack(hero, m);
        case 2 -> heroHeal(hero);
        case 3 -> heroMagic(hero, m);
        default -> throw new InvalidActionException(choice);
    }
}

// Dans Main — le try/catch isole l'erreur proprement :
try {
    Combat.perform(hero, monster, choice);
} catch (InvalidActionException e) {
    System.out.println("❌ " + e.getMessage());
} finally {
    menu.showStatus(hero, monster);
}`;

const CODE_COLLECTIONS = `import java.util.HashMap;
import java.util.TreeMap;

public class GameData {
    // HashMap : accès O(1) par clé — idéal pour inventaire
    private HashMap<String, Integer> inventory
        = new HashMap<>();

    public void addItem(String name, int qty) {
        // merge : additionne si déjà présent
        inventory.merge(name, qty, Integer::sum);
    }

    public boolean useItem(String name) {
        int qty = inventory.getOrDefault(name, 0);
        if (qty <= 0) return false;
        inventory.put(name, qty - 1);
        System.out.println("Utilisé : " + name);
        return true;
    }

    // TreeMap : clés triées automatiquement (ordre naturel)
    private TreeMap<Integer, String> leaderboard
        = new TreeMap<>();

    public void addScore(String player, int score) {
        leaderboard.put(score, player);
    }

    public void showTop3() {
        System.out.println("=== Top 3 ===");
        leaderboard.descendingMap()
            .entrySet().stream()
            .limit(3)
            .forEach(e -> System.out.printf(
                "%s → %d pts\\n",
                e.getValue(), e.getKey()));
    }
}`;

const CODE_STREAMS = `import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class MonsterManager {
    private List<Monster> monsters;

    // Monstres dangereux (HP > 50), triés par attaque desc.
    public List<Monster> getDangerous() {
        return monsters.stream()
            .filter(m -> m.getHp() > 50)
            .sorted(Comparator
                .comparingInt(Monster::getAttack)
                .reversed())
            .collect(Collectors.toList());
    }

    // Somme des attaques de tous les monstres vivants
    public int totalThreat() {
        return monsters.stream()
            .filter(Monster::isAlive)
            .mapToInt(Monster::getAttack)
            .sum();
    }

    // Noms des vivants — séparés par virgule
    public String aliveNames() {
        return monsters.stream()
            .filter(Monster::isAlive)
            .map(Monster::getName)
            .collect(Collectors.joining(", "));
    }

    // Lambda comme variable : réutilisable
    java.util.function.Predicate<Monster> isBoss
        = m -> m.getMaxHp() >= 100;

    public long countBossesAlive() {
        return monsters.stream()
            .filter(Monster::isAlive)
            .filter(isBoss)
            .count();
    }
}`;

const CODE_GENERICS = `import java.util.*;

// Dépôt générique <T> — fonctionne pour Hero, Monster, Item
public class GameRepository<T> {
    private final List<T> store = new ArrayList<>();

    public void save(T item) {
        store.add(item);
        System.out.println("Enregistré : " + item);
    }

    public Optional<T> findFirst() {
        return store.isEmpty()
            ? Optional.empty()
            : Optional.of(store.get(0));
    }

    // Retourne une vue non modifiable — sécurité
    public List<T> getAll() {
        return Collections.unmodifiableList(store);
    }

    public int count() { return store.size(); }

    public void remove(T item) { store.remove(item); }
}

// Utilisation — le compilateur vérifie les types :
GameRepository<Hero>    heroes   = new GameRepository<>();
GameRepository<Monster> monsters = new GameRepository<>();

heroes.save(new Hero("Lancelot"));
monsters.save(new Monster("Dragon","🐉",150,20,7));

// Optional évite le NullPointerException :
heroes.findFirst().ifPresent(h ->
    System.out.println("Premier héros : " + h.getName()));`;

// ── AMÉLIORATION SNIPPETS ─────────────────────────────────────────────────────
const CODE_OBSERVER = `import java.util.ArrayList;
import java.util.List;

// Interface Observer : n'importe quel abonné l'implémente
public interface CombatObserver {
    void onEvent(String eventType, String message);
}

// Sujet : émet des événements à tous les abonnés
public class CombatLog {
    private List<CombatObserver> observers = new ArrayList<>();

    public void subscribe(CombatObserver obs) {
        observers.add(obs);
    }

    public void emit(String type, String msg) {
        for (CombatObserver obs : observers)
            obs.onEvent(type, msg);
    }
}

// Implémentations concrètes :
// ConsoleLogger : affiche dans le terminal
CombatObserver logger = (type, msg) ->
    System.out.printf("[%s] %s%n", type, msg);

// AchievementTracker : débloque des succès
CombatObserver achievements = (type, msg) -> {
    if (type.equals("VICTORY"))
        System.out.println("🏆 Succès débloqué !");
};

// Branchement :
CombatLog log = new CombatLog();
log.subscribe(logger);
log.subscribe(achievements);
log.emit("ATTACK", "Hero frappe Dragon — 22 dégâts !");`;

const CODE_ENUM = `// Enum avec attributs : stats intégrées dans le type
public enum MonsterType {
    GOBLIN ("Goblin", "👺",  60,  8, 1),
    ORC    ("Orc",    "👹",  90, 14, 3),
    TROLL  ("Troll",  "👾", 110, 16, 5),
    DRAGON ("Dragon", "🐉", 150, 20, 7),
    LICHE  ("Liche",  "💀", 130, 22, 4);

    public final String name, emoji;
    public final int    hp, attack, defense;

    MonsterType(String n, String e,
                int h, int a, int d) {
        name = n; emoji = e;
        hp = h; attack = a; defense = d;
    }

    // Fabrique : crée un Monster avec les bonnes stats
    public Monster spawn() {
        return new Monster(name, emoji, hp, attack, defense);
    }
}

// Utilisation :
Monster boss = MonsterType.DRAGON.spawn();

// Parcourir tous les types dans l'ordre de l'enum :
for (MonsterType t : MonsterType.values()) {
    System.out.printf("%-8s HP:%-4d ATK:%d%n",
        t.name, t.hp, t.attack);
}

// Switch sur enum — exhaustif et lisible :
switch (type) {
    case DRAGON -> System.out.println("Boss final !");
    case LICHE  -> System.out.println("Magie noire !");
    default     -> System.out.println("Ennemi standard.");
}`;

const CODE_STRATEGY = `// Stratégie : chaque IA est une fonction interchangeable
@FunctionalInterface
public interface AIStrategy {
    String execute(AbstractCharacter self, Hero target);
}

public class MonsterAI {
    // IA agressive : toujours frappe fort
    public static final AIStrategy AGGRESSIVE =
        (self, hero) -> {
            hero.takeDamage(self.attack + 5);
            return self.getName() + " frappe brutalement !";
        };

    // IA prudente : se soigne quand HP < 30%
    public static final AIStrategy CAUTIOUS =
        (self, hero) -> {
            if (self.getHpPercent() < 30) {
                self.hp = Math.min(
                    self.maxHp, self.hp + 15);
                return self.getName() + " se régénère…";
            }
            hero.takeDamage(self.attack);
            return self.getName() + " attaque prudemment.";
        };

    // IA berserker : plus fort quand blessé
    public static final AIStrategy BERSERKER =
        (self, hero) -> {
            int bonus = (int)((1-self.getHpPercent()/100)*18);
            hero.takeDamage(self.attack + bonus);
            return self.getName()
                + " entre en rage ! +" + bonus + " ATK";
        };
}

// Injection de stratégie dans le monstre :
Monster dragon = MonsterType.DRAGON.spawn();
dragon.setStrategy(MonsterAI.BERSERKER);`;

// ── BATTLE EVENTS ─────────────────────────────────────────────────────────────
const BATTLE2 = [
  { f: 0,    hHp:100, g1Hp:60, d1Hp:150, lines:[], actor:null },
  { f: 60,   hHp:100, g1Hp:60, d1Hp:150, lines:["=== Tableau de bord ===","Hero [██████████] 100%","Goblin [██████] 60%","Dragon [███████████████] 100%"], actor:null },
  { f: 210,  hHp:100, g1Hp:40, d1Hp:150, lines:["⚔️ Hero.doAttack(Goblin) → 20 dégâts !"], actor:"hero_g", btn:"attack" },
  { f: 360,  hHp:82,  g1Hp:40, d1Hp:150, lines:["🐉 Dragon.doAttack(Hero) → 18 dégâts !"], actor:"dragon" },
  { f: 480,  hHp:82,  g1Hp:40, d1Hp:150, lines:["Stream filter : 3 entités vivantes ✓"], actor:null },
  { f: 600,  hHp:82,  g1Hp:40, d1Hp:117, lines:["✨ Magie sur Dragon ! 33 dégâts !"], actor:"hero_d", btn:"magic" },
  { f: 750,  hHp:68,  g1Hp:40, d1Hp:117, lines:["👺 Goblin.doAttack(Hero) → 14 dégâts !"], actor:"goblin" },
  { f: 870,  hHp:68,  g1Hp:40, d1Hp:117, lines:["❌ InvalidActionException : choix 5","→ Choix valides : 1 (atk)  2 (soin)  3 (mag)"], actor:null },
  { f: 990,  hHp:68,  g1Hp:18, d1Hp:117, lines:["⚔️ Hero.doAttack(Goblin) → 22 dégâts !"], actor:"hero_g", btn:"attack" },
  { f: 1120, hHp:50,  g1Hp:18, d1Hp:117, lines:["🐉 Dragon s'acharne ! 18 dégâts."], actor:"dragon" },
  { f: 1230, hHp:50,  g1Hp:0,  d1Hp:117, lines:["⚔️ Coup final Goblin ! 18 dégâts !"], actor:"hero_g", btn:"attack" },
  { f: 1320, hHp:50,  g1Hp:0,  d1Hp:117, lines:["Stream filter : 2 entités vivantes ↓"], actor:null },
  { f: 1430, hHp:50,  g1Hp:0,  d1Hp:75,  lines:["✨ Boule de feu sur Dragon ! 42 dégâts !"], actor:"hero_d", btn:"magic" },
  { f: 1550, hHp:35,  g1Hp:0,  d1Hp:75,  lines:["🐉 Dragon RAGE ! 15 dégâts."], actor:"dragon" },
  { f: 1650, hHp:35,  g1Hp:0,  d1Hp:37,  lines:["⚔️ Hero frappe Dragon ! 38 dégâts !"], actor:"hero_d", btn:"attack" },
  { f: 1740, hHp:35,  g1Hp:0,  d1Hp:0,   lines:["⚔️ Coup fatal ! Dragon vaincu !","🏆 VICTOIRE ! Polymorphisme maîtrisé !"], actor:"hero_d", btn:"attack" },
];

function getBattle2State(frame) {
  let s = BATTLE2[0];
  for (const ev of BATTLE2) { if (frame >= ev.f) s = ev; else break; }
  return s;
}

function smoothField(frame, field, maxVal) {
  let cur = BATTLE2[0][field], curF = BATTLE2[0].f, prev = cur;
  for (const ev of BATTLE2) {
    if (frame < ev.f) break;
    if (ev[field] !== cur) { prev = cur; cur = ev[field]; curF = ev.f; }
  }
  return interpolate(frame, [curF, curF + 25], [prev, cur], clamp) / maxVal;
}

function shakeX(frame, hitFrame) {
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
        const y = ((i * 79  + seed * 17) % 89) / 89 * height;
        const pulse = Math.sin((frame + i * 13) / 28) * 0.5 + 0.5;
        const size  = 1.5 + ((i * 11) % 5) * 0.8;
        return (
          <div key={i} style={{
            position:"absolute", left:x, top:y,
            width:size, height:size, borderRadius:"50%",
            background:"#e2e8f0",
            opacity: 0.08 + pulse * 0.18,
            boxShadow:`0 0 ${3 + pulse * 4}px #e2e8f0`,
          }} />
        );
      })}
    </>
  );
}

function FloatingParticle({ x, y, color, frame, offset = 0 }) {
  const drift = Math.sin((frame + offset) / 40) * 18;
  const op    = (Math.sin((frame + offset) / 35) * 0.5 + 0.5) * 0.4;
  return (
    <div style={{
      position:"absolute", left:x, top:y + drift,
      width:6, height:6, borderRadius:"50%",
      background:color, opacity:op,
      boxShadow:`0 0 12px ${color}`,
    }} />
  );
}

function TypewriterCode({ lines, visibleChars, fontSize = 17, lineHeight = 29 }) {
  let accumulated = 0;
  return (
    <div style={{ fontFamily:MONO, fontSize, lineHeight:`${lineHeight}px` }}>
      {lines.map((lineTokens, li) => {
        const lineStart = accumulated;
        const lineLen   = lineTokens.reduce((a, t) => a + t.t.length, 0);
        accumulated += lineLen + 1;
        const shown = Math.max(0, visibleChars - lineStart);
        if (shown === 0) return <div key={li} style={{ height:lineHeight }} />;
        let cc = 0;
        const isActive = visibleChars > lineStart && visibleChars <= lineStart + lineLen + 1;
        return (
          <div key={li} style={{ minHeight:lineHeight, whiteSpace:"pre" }}>
            {lineTokens.map((tok, ti) => {
              if (cc >= shown) return null;
              const vis = tok.t.slice(0, shown - cc);
              cc += tok.t.length;
              return <span key={ti} style={{ color:tok.c }}>{vis}</span>;
            })}
            {isActive && (
              <span style={{
                display:"inline-block", width:2, height:lineHeight * 0.75,
                background:"#e2e8f0", marginLeft:1,
                verticalAlign:"text-bottom",
                opacity: Math.floor(visibleChars / 8) % 2 === 0 ? 1 : 0.3,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CodeScene({ code, filename, accent, title, bullets, dur, music="music2.mp3", narrationFile, stepLabel }) {
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
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile(`audio/${music}`)} volume={0.08} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Sequence from={25} durationInFrames={dur - 50}>
        <Audio src={staticFile("audio/keyboard.mp3")} volume={0.13} />
      </Sequence>
      <Stars />

      {/* Header */}
      <div style={{ position:"absolute", top:36, left:60, right:60, zIndex:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:accent, fontSize:20, fontWeight:800, textTransform:"uppercase", letterSpacing:3 }}>
            {filename}
          </div>
          <div style={{
            background:`${accent}22`, border:`1px solid ${accent}44`,
            borderRadius:8, padding:"4px 14px",
            color:accent, fontSize:14, fontWeight:700,
          }}>
            Java Avancé — {stepLabel}
          </div>
        </div>
        <div style={{ color:P.text, fontSize:46, fontWeight:900, marginTop:6, lineHeight:1.1 }}>{title}</div>
        <div style={{ marginTop:10, height:3, background:P.border, borderRadius:3 }}>
          <div style={{
            width:`${Math.min(100,(visibleChars/totalChars)*100)}%`,
            height:"100%", background:accent,
            borderRadius:3, boxShadow:`0 0 8px ${accent}`,
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ position:"absolute", top:190, left:60, right:60, bottom:40, display:"flex", gap:36 }}>
        <div style={{ flex:"0 0 67%", display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", alignItems:"center" }}>
            <div style={{
              background:P.editor, border:`1px solid ${P.border}`,
              borderBottom:"none", borderRadius:"10px 10px 0 0",
              padding:"8px 20px", display:"flex", alignItems:"center", gap:8,
            }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:accent, boxShadow:`0 0 8px ${accent}` }} />
              <span style={{ color:P.text, fontFamily:MONO, fontSize:13 }}>{filename}</span>
            </div>
          </div>
          <div style={{
            flex:1, background:P.editor, border:`1px solid ${P.border}`,
            borderRadius:"0 10px 10px 10px", padding:"18px 20px", overflow:"hidden",
          }}>
            <div style={{ display:"flex", gap:16, transform:`translateY(-${scrollY}px)` }}>
              <div style={{
                fontFamily:MONO, fontSize:16, lineHeight:"29px",
                color:P.dim, textAlign:"right", userSelect:"none", flexShrink:0, width:32,
              }}>
                {tokens.map((_, i) => (
                  <div key={i} style={{
                    color: Math.abs(i - Math.floor(virtualLine)) < 2 ? P.text : P.dim,
                    fontWeight: Math.abs(i - Math.floor(virtualLine)) < 1 ? 700 : 400,
                  }}>{i + 1}</div>
                ))}
              </div>
              <TypewriterCode lines={tokens} visibleChars={visibleChars} />
            </div>
          </div>
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", gap:22 }}>
          {bullets.map((bullet, i) => {
            const start = 60 + i * 200;
            const op = fi(frame, start, 22);
            const x  = interpolate(frame, [start, start + 22], [30, 0], clamp);
            return (
              <div key={i} style={{ opacity:op, transform:`translateX(${x}px)` }}>
                <div style={{
                  background:P.card, borderLeft:`4px solid ${accent}`,
                  borderRadius:"0 12px 12px 0", padding:"14px 18px",
                }}>
                  <div style={{ color:accent, fontSize:13, fontWeight:800, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>
                    {["Concept clé","Astuce Terminale","À retenir"][i % 3]}
                  </div>
                  <div style={{ color:P.text, fontSize:21, lineHeight:1.45, fontFamily:SANS }}>{bullet}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── HP BAR COMPONENT ─────────────────────────────────────────────────────────
function HpBar({ pct, color, label }) {
  return (
    <div style={{ width:"100%", marginTop:5 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ color:P.dim, fontSize:11, fontFamily:MONO }}>HP</span>
        <span style={{ color:P.text, fontSize:11, fontFamily:MONO }}>{label}</span>
      </div>
      <div style={{ background:"#1e293b", borderRadius:5, height:10, overflow:"hidden" }}>
        <div style={{
          width:`${Math.max(0,Math.min(100, pct * 100))}%`,
          height:"100%",
          background:`linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius:5,
          boxShadow:`0 0 6px ${color}88`,
          transition:"width 0.1s",
        }} />
      </div>
    </div>
  );
}

function EntityCard({ emoji, name, hpPct, maxHp, color, dead=false, shakeXVal=0 }) {
  const border = dead ? P.border : color;
  return (
    <div style={{
      background: dead ? "#0d0f1a" : `linear-gradient(135deg, #1e1b4b, #312e81)`,
      border:`2px solid ${border}`,
      borderRadius:12, padding:"12px 16px",
      textAlign:"center", width:170,
      opacity: dead ? 0.4 : 1,
      boxShadow: dead ? "none" : `0 0 20px ${color}33`,
      transform:`translateX(${shakeXVal}px)`,
    }}>
      <div style={{ fontSize:36, lineHeight:1 }}>{dead ? "💀" : emoji}</div>
      <div style={{ color: dead ? P.dim : P.text, fontWeight:800, fontSize:14, marginTop:4 }}>{name}</div>
      <HpBar
        pct={hpPct} color={dead ? P.dim : color}
        label={`${Math.round(hpPct * maxHp)}/${maxHp}`}
      />
    </div>
  );
}

// ── DEMO SCENE ────────────────────────────────────────────────────────────────
function DemoScene2({ narrationFile }) {
  const frame = useCurrentFrame();
  const dur = SC.DEMO.d;
  const opacity = sceneFade(frame, dur);

  const hHpPct  = smoothField(frame, "hHp",  100);
  const g1HpPct = smoothField(frame, "g1Hp",  60);
  const d1HpPct = smoothField(frame, "d1Hp", 150);

  const state      = getBattle2State(frame);
  const isVictory  = frame >= 1740;
  const goblinDead = frame >= 1230;

  const logLines = [];
  for (const ev of BATTLE2) {
    if (frame >= ev.f && ev.lines) logLines.push(...ev.lines);
  }

  // Shake : hero reçoit des coups de dragon et goblin
  const heroHitFrames    = BATTLE2.filter(e => e.actor === "dragon" || e.actor === "goblin");
  const goblinHitFrames  = BATTLE2.filter(e => e.actor === "hero_g" && e.btn);
  const dragonHitFrames  = BATTLE2.filter(e => e.actor === "hero_d" && e.btn);
  const heroShakeVal     = heroHitFrames.reduce((a, e) => a + shakeX(frame, e.f), 0);
  const goblinShakeVal   = goblinHitFrames.reduce((a, e) => a + shakeX(frame, e.f), 0);
  const dragonShakeVal   = dragonHitFrames.reduce((a, e) => a + shakeX(frame, e.f), 0);

  const aliveCount = [hHpPct > 0, g1HpPct > 0.01, d1HpPct > 0.01].filter(Boolean).length;

  const isException = frame >= 870 && frame < 990;

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music5.mp3")} volume={0.10} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}

      {BATTLE2.filter(e => e.btn === "attack").map(ev => (
        <Sequence key={`atk-${ev.f}`} from={ev.f} durationInFrames={36}>
          <Audio src={staticFile("audio/sfx_attack.mp3")} volume={0.70} />
        </Sequence>
      ))}
      {BATTLE2.filter(e => e.btn === "magic").map(ev => (
        <Sequence key={`mag-${ev.f}`} from={ev.f} durationInFrames={60}>
          <Audio src={staticFile("audio/sfx_magic.mp3")} volume={0.75} />
        </Sequence>
      ))}
      {BATTLE2.filter(e => e.actor === "dragon" || e.actor === "goblin").map(ev => (
        <Sequence key={`mon-${ev.f}`} from={ev.f} durationInFrames={36}>
          <Audio src={staticFile("audio/sfx_monster.mp3")} volume={0.60} />
        </Sequence>
      ))}
      <Sequence from={1740} durationInFrames={120}>
        <Audio src={staticFile("audio/sfx_victory.mp3")} volume={0.85} />
      </Sequence>

      <Stars count={40} />

      {/* Header */}
      <div style={{ position:"absolute", top:36, left:60, right:60, zIndex:10 }}>
        <div style={{ color:P.gold, fontSize:20, fontWeight:800, textTransform:"uppercase", letterSpacing:3 }}>
          demo live · polymorphisme
        </div>
        <div style={{ color:P.text, fontSize:46, fontWeight:900, marginTop:6 }}>
          BattleArena — 3 Entity en action
        </div>
        <div style={{ marginTop:10, height:3, background:P.border, borderRadius:3 }}>
          <div style={{
            width:`${Math.min(100,(frame/dur)*100)}%`,
            height:"100%", background:P.gold,
            borderRadius:3, boxShadow:`0 0 8px ${P.gold}`,
          }} />
        </div>
      </div>

      <div style={{
        position:"absolute", top:168, left:60, right:60, bottom:40,
        display:"flex", gap:36,
      }}>
        {/* Left : fighters */}
        <div style={{ flex:"0 0 560px", display:"flex", flexDirection:"column", gap:16, justifyContent:"center" }}>

          {/* Stream info */}
          <div style={{
            background:P.card, border:`1px solid ${P.blue}33`,
            borderRadius:10, padding:"10px 18px",
            display:"flex", alignItems:"center", gap:12,
          }}>
            <span style={{ color:P.blue, fontFamily:MONO, fontSize:14 }}>
              arena.getAlive().size()
            </span>
            <span style={{
              background:`${P.blue}33`, border:`1px solid ${P.blue}66`,
              borderRadius:6, padding:"2px 12px",
              color:P.blue, fontWeight:900, fontSize:22,
            }}>
              {aliveCount}
            </span>
            <span style={{ color:P.dim, fontSize:13 }}>/ 3 entités vivantes</span>
          </div>

          {/* 3 Entity cards */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <EntityCard
              emoji="🧙" name="Hero" color="#6366f1"
              hpPct={hHpPct} maxHp={100}
              shakeXVal={heroShakeVal}
            />
            <EntityCard
              emoji="👺" name="Goblin" color="#f97316"
              hpPct={Math.max(0, g1HpPct)} maxHp={60}
              dead={goblinDead}
              shakeXVal={goblinShakeVal}
            />
            <EntityCard
              emoji="🐉" name="Dragon" color="#ef4444"
              hpPct={Math.max(0, d1HpPct)} maxHp={150}
              dead={isVictory}
              shakeXVal={dragonShakeVal}
            />
          </div>

          {/* Exception panel */}
          {isException && (
            <div style={{
              opacity: fi(frame, 870, 15),
              background:"#450a0a", border:"1px solid #ef444488",
              borderRadius:10, padding:"12px 16px",
              fontFamily:MONO, fontSize:13,
            }}>
              <div style={{ color:"#ef4444", fontWeight:700, marginBottom:4 }}>
                ❌ InvalidActionException
              </div>
              <div style={{ color:"#fca5a5" }}>
                "Action invalide : 5."
              </div>
              <div style={{ color:P.dim, marginTop:4, fontSize:12 }}>
                catch (InvalidActionException e) → message affiché, jeu continue ✓
              </div>
            </div>
          )}

          {/* Victory */}
          {isVictory && (
            <div style={{
              opacity: fi(frame, 1740, 24),
              background:"linear-gradient(135deg,#92400e,#78350f)",
              border:"2px solid #fbbf24",
              borderRadius:14, padding:"16px 24px", textAlign:"center",
              boxShadow:"0 0 40px #fbbf2466",
            }}>
              <div style={{ fontSize:32, marginBottom:6 }}>🏆</div>
              <div style={{ color:P.gold, fontSize:22, fontWeight:900 }}>
                VICTOIRE !
              </div>
              <div style={{ color:"#fde68a", fontSize:14, marginTop:4 }}>
                Polymorphisme, Streams, Exceptions — maîtrisés
              </div>
            </div>
          )}
        </div>

        {/* Right : terminal */}
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          <div style={{
            background:"#2d2d2d", borderRadius:"10px 10px 0 0",
            padding:"8px 16px", display:"flex", alignItems:"center", gap:8,
            border:`1px solid ${P.border}`, borderBottom:"none",
          }}>
            <div style={{ width:11, height:11, borderRadius:"50%", background:"#ef4444" }} />
            <div style={{ width:11, height:11, borderRadius:"50%", background:"#fbbf24" }} />
            <div style={{ width:11, height:11, borderRadius:"50%", background:"#22c55e" }} />
            <div style={{ flex:1, textAlign:"center", color:P.dim, fontSize:13, fontFamily:MONO }}>
              java BattleArena
            </div>
          </div>
          <div style={{
            flex:1, background:"#0d1117",
            border:`1px solid ${P.border}`,
            borderRadius:"0 0 10px 10px",
            padding:"16px 20px", overflow:"hidden",
            fontFamily:MONO, fontSize:13,
          }}>
            <div style={{ color:"#4ade80", marginBottom:8, fontSize:12 }}>$ java -cp . BattleArena</div>
            {logLines.slice(-16).map((line, i) => {
              const age = logLines.length - 1 - i;
              const col = line.startsWith("🏆") ? P.gold
                        : line.startsWith("⚔️") ? "#f43f5e"
                        : line.startsWith("✨") ? "#a78bfa"
                        : line.startsWith("👺") ? "#f97316"
                        : line.startsWith("🐉") ? "#ef4444"
                        : line.startsWith("❌") ? "#ef4444"
                        : line.startsWith("→")  ? "#fca5a5"
                        : line.startsWith("Stream") ? P.blue
                        : line.startsWith("===") ? P.gold
                        : P.text;
              return (
                <div key={i} style={{
                  color:col,
                  opacity: age === 0 ? 1 : Math.max(0.2, 1 - age * 0.15),
                  lineHeight:"21px",
                  fontSize: age === 0 ? 14 : 13,
                  fontWeight: age === 0 ? 600 : 400,
                }}>
                  {line}
                </div>
              );
            })}
            {!isVictory && (
              <span style={{
                display:"inline-block", width:8, height:14,
                background:"#4ade80", marginLeft:2,
                opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
              }} />
            )}
          </div>

          {/* Annotations */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:14 }}>
            {[
              { show:60,  color:P.blue,  label:"interface Entity", desc:"contrat polymorphique unifié" },
              { show:480, color:P.magic, label:"stream().filter()", desc:"fonctionnel & lisible" },
              { show:870, color:"#ef4444",label:"try/catch propre",  desc:"exception = objet descriptif" },
            ].map(({ show, color, label, desc }) =>
              frame > show ? (
                <div key={label} style={{
                  opacity: fi(frame, show, 20),
                  background:P.card, borderLeft:`3px solid ${color}`,
                  borderRadius:"0 8px 8px 0", padding:"8px 12px",
                  display:"flex", gap:10, alignItems:"center",
                }}>
                  <div style={{ color, fontSize:12, fontWeight:700, fontFamily:MONO, flexShrink:0 }}>{label}</div>
                  <div style={{ color:P.dim, fontSize:11 }}>{desc}</div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── AMELI SCENE ───────────────────────────────────────────────────────────────
function AmeliScene({ code, accent, title, desc, bullets, demo, dur, music="music1.mp3", narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = sceneFade(frame, dur);
  const tokens = tokenize(code);
  const totalChars = code.length;
  const visibleChars = Math.max(0, Math.round((frame - 50) * (totalChars / (dur - 100))));
  const LH = 29, AMAX = 22;
  const aRatio = Math.min(1, visibleChars / Math.max(1, totalChars));
  const aVirtualLine = aRatio * tokens.length;
  const aScrollY = Math.max(0, aVirtualLine - AMAX + 3) * LH;
  const titleSc = spring({ frame: frame - 5, fps, config:{ damping:14, stiffness:70 } });

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile(`audio/${music}`)} volume={0.08} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Stars count={50} seed={2} />
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:5,
        background:`linear-gradient(90deg, transparent, ${accent}, transparent)`,
        boxShadow:`0 0 20px ${accent}`,
      }} />
      <div style={{
        position:"absolute", top:36, left:60, right:60, zIndex:10,
        transform:`scale(${0.85 + titleSc * 0.15})`, transformOrigin:"left center",
      }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:10,
          background:`${accent}22`, border:`1px solid ${accent}55`,
          borderRadius:99, padding:"4px 16px", marginBottom:10,
        }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:accent }} />
          <span style={{ color:accent, fontSize:13, fontWeight:800, textTransform:"uppercase", letterSpacing:2 }}>
            Amélioration · Niveau Terminale
          </span>
        </div>
        <div style={{ color:P.text, fontSize:46, fontWeight:900, lineHeight:1.1 }}>{title}</div>
        <div style={{ color:P.dim, fontSize:22, marginTop:8 }}>{desc}</div>
      </div>

      <div style={{ position:"absolute", top:200, left:60, right:60, bottom:40, display:"flex", gap:36 }}>
        <div style={{ flex:"0 0 65%", display:"flex", flexDirection:"column" }}>
          <div style={{
            flex:1, background:P.editor,
            border:`1px solid ${accent}44`, borderTop:`2px solid ${accent}`,
            borderRadius:12, padding:"16px 20px", overflow:"hidden",
          }}>
            <div style={{ display:"flex", gap:16, transform:`translateY(-${aScrollY}px)` }}>
              <div style={{ fontFamily:MONO, fontSize:16, lineHeight:"29px", color:P.dim, textAlign:"right", width:30, flexShrink:0 }}>
                {tokens.map((_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <TypewriterCode lines={tokens} visibleChars={visibleChars} />
            </div>
          </div>
        </div>

        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:18, justifyContent:"center" }}>
          {bullets.map((b, i) => {
            const op = fi(frame, 80 + i * 140, 22);
            const x  = interpolate(frame, [80 + i * 140, 102 + i * 140], [30, 0], clamp);
            return (
              <div key={i} style={{ opacity:op, transform:`translateX(${x}px)` }}>
                <div style={{
                  background:P.card, borderLeft:`4px solid ${accent}`,
                  borderRadius:"0 12px 12px 0", padding:"14px 18px",
                }}>
                  <div style={{ color:accent, fontSize:13, fontWeight:800, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>
                    {["Pattern","Concept","Bac NSI"][i % 3]}
                  </div>
                  <div style={{ color:P.text, fontSize:21, lineHeight:1.5 }}>{b}</div>
                </div>
              </div>
            );
          })}
          {demo && frame > dur - 320 && (
            <div style={{ opacity: fi(frame, dur - 320, 30) }}>
              <div style={{
                background:`${accent}11`, border:`1px solid ${accent}44`,
                borderRadius:12, padding:"16px 18px",
              }}>
                <div style={{ color:accent, fontSize:14, fontWeight:800, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>
                  Résultat
                </div>
                <div style={{ color:P.text, fontSize:19, lineHeight:1.5, fontFamily:MONO }}>{demo}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── INTRO ─────────────────────────────────────────────────────────────────────
function IntroScene2({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.INTRO.d;
  const opacity = sceneFade(frame, dur);
  const titleScale = spring({ frame: frame - 15, fps, config:{ damping:14, stiffness:60 } });

  const concepts = [
    { label:"interface",  color:"#38bdf8", symbol:"◈",  delay:180 },
    { label:"abstract",   color:"#a78bfa", symbol:"⬡",  delay:230 },
    { label:"Exception",  color:"#f43f5e", symbol:"⚠",  delay:280 },
    { label:"Stream<T>",  color:"#4ade80", symbol:"∿",  delay:330 },
    { label:"HashMap<K>", color:"#fbbf24", symbol:"⟼",  delay:380 },
    { label:"Generics<T>",color:"#fb923c", symbol:"∀",  delay:430 },
  ];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS, overflow:"hidden" }}>
      <Audio src={staticFile("audio/music4.mp3")} volume={0.12} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Stars count={80} />
      {[...Array(20)].map((_, i) => (
        <FloatingParticle key={i}
          x={100 + (i * 97) % 1700} y={100 + (i * 79) % 880}
          color={["#38bdf8","#a78bfa","#4ade80","#fbbf24"][i % 4]}
          frame={frame} offset={i * 17}
        />
      ))}
      <AbsoluteFill style={{
        backgroundImage:`linear-gradient(#38bdf811 1px,transparent 1px),linear-gradient(90deg,#38bdf811 1px,transparent 1px)`,
        backgroundSize:"80px 80px", opacity:0.35,
      }} />

      <AbsoluteFill style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{
          opacity: fi(frame, 10, 18),
          background:"#38bdf822", border:"1px solid #38bdf866",
          borderRadius:99, padding:"6px 20px", marginBottom:20,
          color:"#38bdf8", fontSize:15, fontWeight:700, textTransform:"uppercase", letterSpacing:3,
        }}>
          Java Avancé · Niveau Terminale NSI
        </div>
        <div style={{
          fontSize:90, fontWeight:950, color:P.text,
          textShadow:`0 0 60px #38bdf844, 0 0 120px #38bdf822`,
          transform:`scale(${0.7 + titleScale * 0.3})`,
          letterSpacing:-2, lineHeight:1, textAlign:"center",
        }}>
          JAVA<br/>
          <span style={{ color:"#38bdf8" }}>POO AVANCÉE</span>
        </div>
        <div style={{ opacity: fi(frame, 50, 22), marginTop:16, textAlign:"center" }}>
          <div style={{ fontSize:32, color:"#a78bfa", fontWeight:700 }}>
            Interfaces · Polymorphisme · Exceptions · Streams
          </div>
        </div>
        <div style={{ opacity: fi(frame, 85, 22), marginTop:8, textAlign:"center" }}>
          <div style={{ fontSize:24, color:P.dim, fontWeight:500 }}>
            La suite du Mini RPG — niveau baccalauréat
          </div>
        </div>
        <div style={{ opacity: fi(frame, 130, 22), marginTop:24 }}>
          <div style={{
            background:P.surface, border:`1px solid ${P.border}`,
            borderRadius:12, padding:"10px 28px",
            color:P.dim, fontSize:18,
          }}>
            ⏱ 8 minutes · 6 concepts avancés · 3 patterns de conception
          </div>
        </div>
        <div style={{ display:"flex", gap:18, marginTop:44, flexWrap:"wrap", justifyContent:"center" }}>
          {concepts.map(({ label, color, symbol, delay }) => {
            const sc = spring({ frame: frame - delay, fps, config:{ damping:12, stiffness:50 } });
            return (
              <div key={label} style={{
                opacity:sc, transform:`scale(${0.5 + sc * 0.5}) translateY(${(1 - sc) * 40}px)`,
                display:"flex", flexDirection:"column", alignItems:"center", gap:8,
              }}>
                <div style={{
                  width:72, height:72, borderRadius:18,
                  background:`${color}22`, border:`2px solid ${color}66`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:26, fontWeight:900, color, fontFamily:MONO,
                  boxShadow:`0 0 20px ${color}44`,
                }}>
                  {symbol}
                </div>
                <div style={{ color, fontWeight:700, fontSize:13, fontFamily:MONO }}>{label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── OUTRO ─────────────────────────────────────────────────────────────────────
function OutroScene2({ narrationFile }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = SC.OUTRO.d;
  const opacity = sceneFade(frame, dur);

  const items = [
    { icon:"◈",  label:"Interface & Abstract",  desc:"Contrat + socle commun — polymorphisme garanti",   color:"#38bdf8" },
    { icon:"⚡",  label:"Polymorphisme",          desc:"List<Entity> traite Hero et Monster pareil",        color:"#a78bfa" },
    { icon:"⚠",  label:"Exceptions",             desc:"try/catch/finally — flux d'erreur élégant",         color:"#f43f5e" },
    { icon:"⟼",  label:"HashMap / TreeMap",       desc:"O(1) vs trié — choisir la bonne collection",        color:"#fbbf24" },
    { icon:"∿",  label:"Streams & Lambda",        desc:"filter/map/reduce — style fonctionnel Java 8+",     color:"#4ade80" },
    { icon:"∀",  label:"Generics <T>",            desc:"Repository<T> — code réutilisable, typé à la compile",color:"#fb923c" },
  ];

  return (
    <AbsoluteFill style={{ opacity, background:P.bg, fontFamily:SANS }}>
      <Audio src={staticFile("audio/music6.mp3")} volume={0.13} />
      {narrationFile && <Audio src={staticFile(`audio/${narrationFile}`)} volume={1} />}
      <Stars count={100} seed={4} />

      <AbsoluteFill style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{
          opacity: fi(frame, 10, 22),
          color:P.gold, fontSize:20, fontWeight:800,
          textTransform:"uppercase", letterSpacing:4, marginBottom:14,
        }}>
          Récapitulatif — Niveau Terminale
        </div>
        <div style={{ fontSize:68, fontWeight:950, color:P.text, textShadow:`0 0 40px #38bdf844`, marginBottom:6 }}>
          Tu maîtrises
        </div>
        <div style={{
          opacity: fi(frame, 30, 22),
          fontSize:28, color:"#38bdf8", fontWeight:700, marginBottom:44,
        }}>
          la POO Java avancée — prêt pour le bac NSI
        </div>

        <div style={{ display:"flex", flexWrap:"wrap", gap:18, maxWidth:1200, justifyContent:"center" }}>
          {items.map(({ icon, label, desc, color }, i) => {
            const sc = spring({ frame: frame - (60 + i * 50), fps, config:{ damping:12, stiffness:60 } });
            return (
              <div key={label} style={{
                opacity:sc,
                transform:`scale(${0.6 + sc * 0.4}) translateY(${(1 - sc) * 30}px)`,
                background:P.card, border:`1px solid ${P.border}`,
                borderRadius:16, padding:"18px 22px", width:338,
                display:"flex", gap:14, alignItems:"flex-start",
              }}>
                <div style={{
                  fontSize:26, color, fontFamily:MONO, flexShrink:0,
                  width:40, textAlign:"center", marginTop:2,
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ color:P.text, fontSize:19, fontWeight:800 }}>{label}</div>
                  <div style={{ color:P.dim, fontSize:14, marginTop:4, lineHeight:1.4 }}>{desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ opacity: fi(frame, dur - 200, 30), marginTop:44, textAlign:"center" }}>
          <div style={{
            background:"linear-gradient(135deg, #0369a1, #38bdf8)",
            borderRadius:16, padding:"18px 48px",
            color:"#fff", fontSize:26, fontWeight:900,
            boxShadow:"0 0 40px #38bdf866",
          }}>
            ☕ Ouvre IntelliJ et implémente Entity dans ton RPG !
          </div>
          <div style={{ color:P.dim, fontSize:17, marginTop:12 }}>
            6 concepts · 3 patterns de conception · 1 projet cohérent
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function JavaRpgTutoriel2() {
  return (
    <AbsoluteFill style={{ background:P.bg }}>
      <Sequence from={SC.INTRO.s}  durationInFrames={SC.INTRO.d}>
        <IntroScene2 narrationFile="java2_narration1.mp3" />
      </Sequence>

      <Sequence from={SC.SC1.s}    durationInFrames={SC.SC1.d}>
        <CodeScene
          code={CODE_INTERFACE} filename="Entity.java / AbstractCharacter.java"
          accent="#38bdf8" stepLabel="Étape 1/6"
          title="Interface & Classe abstraite"
          bullets={[
            "interface définit un contrat : toute classe qui l'implémente DOIT fournir ces méthodes.",
            "abstract class = base commune avec état partagé (hp, name…) — impossible d'instancier seule.",
            "default getHpPercent() : méthode avec corps dans l'interface (Java 8+), héritage sans abstract.",
          ]}
          dur={SC.SC1.d} music="music2.mp3" narrationFile="java2_narration2.mp3"
        />
      </Sequence>

      <Sequence from={SC.SC2.s}    durationInFrames={SC.SC2.d}>
        <CodeScene
          code={CODE_POLYMORPHISME} filename="BattleArena.java"
          accent="#a78bfa" stepLabel="Étape 2/6"
          title="Polymorphisme"
          bullets={[
            "List<Entity> stocke Hero ET Monster sans cast — le type commun est le contrat.",
            "for (Entity e : participants) : une seule boucle traite tous les types uniformément.",
            "stream().filter(Entity::isAlive) : référence de méthode — propre et déclaratif.",
          ]}
          dur={SC.SC2.d} music="music2.mp3" narrationFile="java2_narration3.mp3"
        />
      </Sequence>

      <Sequence from={SC.SC3.s}    durationInFrames={SC.SC3.d}>
        <CodeScene
          code={CODE_EXCEPTIONS} filename="InvalidActionException.java"
          accent="#f43f5e" stepLabel="Étape 3/6"
          title="Exceptions personnalisées"
          bullets={[
            "extends Exception = exception vérifiée : le compilateur force le try/catch.",
            "extends RuntimeException = non-vérifiée : pour les bugs impossibles (dead char).",
            "finally s'exécute TOUJOURS — idéal pour showStatus() même après une erreur.",
          ]}
          dur={SC.SC3.d} music="music3.mp3" narrationFile="java2_narration4.mp3"
        />
      </Sequence>

      <Sequence from={SC.SC4.s}    durationInFrames={SC.SC4.d}>
        <CodeScene
          code={CODE_COLLECTIONS} filename="GameData.java"
          accent="#fbbf24" stepLabel="Étape 4/6"
          title="Collections avancées"
          bullets={[
            "HashMap<K,V> : recherche en O(1) — parfait pour un inventaire key→quantity.",
            "merge(name, qty, Integer::sum) : additionne si la clé existe, insère sinon.",
            "TreeMap trie ses clés automatiquement — descendingMap() = du plus grand au plus petit.",
          ]}
          dur={SC.SC4.d} music="music3.mp3" narrationFile="java2_narration5.mp3"
        />
      </Sequence>

      <Sequence from={SC.SC5.s}    durationInFrames={SC.SC5.d}>
        <CodeScene
          code={CODE_STREAMS} filename="MonsterManager.java"
          accent="#4ade80" stepLabel="Étape 5/6"
          title="Streams & Lambdas"
          bullets={[
            "stream() crée un pipeline : filter → sorted → collect — aucune boucle for explicite.",
            "mapToInt().sum() : réduction — calcule la menace totale en une expression.",
            "Collectors.joining(\", \") : concatène des String avec un séparateur — élégant.",
          ]}
          dur={SC.SC5.d} music="music2.mp3" narrationFile="java2_narration6.mp3"
        />
      </Sequence>

      <Sequence from={SC.SC6.s}    durationInFrames={SC.SC6.d}>
        <CodeScene
          code={CODE_GENERICS} filename="GameRepository.java"
          accent="#fb923c" stepLabel="Étape 6/6"
          title="Generics <T>"
          bullets={[
            "<T> = paramètre de type : la classe s'adapte à Hero, Monster ou Item sans duplication.",
            "Optional<T> : remplace null — ifPresent() force à gérer le cas vide explicitement.",
            "Collections.unmodifiableList() : retourne une vue en lecture seule — sécurité.",
          ]}
          dur={SC.SC6.d} music="music3.mp3" narrationFile="java2_narration7.mp3"
        />
      </Sequence>

      <Sequence from={SC.DEMO.s}   durationInFrames={SC.DEMO.d}>
        <DemoScene2 narrationFile="java2_narration8.mp3" />
      </Sequence>

      <Sequence from={SC.AMELI1.s} durationInFrames={SC.AMELI1.d}>
        <AmeliScene
          code={CODE_OBSERVER} accent="#38bdf8"
          title="Pattern Observer"
          desc="Découpler les acteurs avec subscribe / emit"
          bullets={[
            "Observer = interface légère : chaque abonné réagit à sa façon sans connaître les autres.",
            "emit() parcourt la liste — ajouter un AbonnéX ne modifie pas le code existant.",
            "Lambda comme observer : (type, msg) -> ... — concis, idiomatique Java 8+.",
          ]}
          demo={"log.emit(\"VICTORY\", \"Dragon vaincu !\");\n→ [VICTORY] Dragon vaincu !  +  🏆 Succès !"}
          dur={SC.AMELI1.d} narrationFile="java2_narration9.mp3"
        />
      </Sequence>

      <Sequence from={SC.AMELI2.s} durationInFrames={SC.AMELI2.d}>
        <AmeliScene
          code={CODE_ENUM} accent="#fbbf24"
          title="Enum avec attributs"
          desc="Remplacer les constantes magiques par des types forts"
          bullets={[
            "enum Java = classe spéciale : chaque constante peut avoir ses propres champs et méthodes.",
            "spawn() est une fabrique intégrée — plus de new Monster(\"Dragon\",\"🐉\",150,20,7) éparpillé.",
            "switch sur enum est exhaustif — le compilateur avertit si un case manque (Java 14+).",
          ]}
          demo={"MonsterType.DRAGON.spawn() → Monster{Dragon,🐉,150HP,20ATK,7DEF}"}
          dur={SC.AMELI2.d} narrationFile="java2_narration10.mp3"
        />
      </Sequence>

      <Sequence from={SC.AMELI3.s} durationInFrames={SC.AMELI3.d}>
        <AmeliScene
          code={CODE_STRATEGY} accent="#a78bfa"
          title="Pattern Stratégie & @FunctionalInterface"
          desc="Injecter un comportement d'IA interchangeable"
          bullets={[
            "@FunctionalInterface : une seule méthode abstraite → compatible avec les lambdas Java 8.",
            "BERSERKER, CAUTIOUS, AGGRESSIVE sont des constantes de type AIStrategy — pas de sous-classe.",
            "setStrategy() injecte l'IA au runtime — changer de comportement sans toucher Monster.",
          ]}
          demo={"dragon.setStrategy(BERSERKER);\n// Plus fort quand blessé — aucun héritage supplémentaire !"}
          dur={SC.AMELI3.d} narrationFile="java2_narration11.mp3"
        />
      </Sequence>

      <Sequence from={SC.OUTRO.s}  durationInFrames={SC.OUTRO.d}>
        <OutroScene2 narrationFile="java2_narration12.mp3" />
      </Sequence>
    </AbsoluteFill>
  );
}
