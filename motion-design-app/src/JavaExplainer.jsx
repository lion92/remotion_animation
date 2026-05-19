import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const FPS = 24;
const SCENE = 720;   // 30 secondes par scène
const SCENES = 10;   // 10 scènes × 30s = 5 minutes exactement
export const JAVA_EXPLAINER_DURATION = SCENE * SCENES;

const SANS = "'Inter', 'Arial', sans-serif";
const MONO = "'JetBrains Mono', 'Consolas', monospace";

const slides = [
  {
    eyebrow: "Question simple",
    title: "C'est quoi Java ?",
    accent: "#f97316",
    lines: [
      "Java est un langage pour creer des applications.",
      "On l'utilise pour des sites, des apps Android, des serveurs, des jeux et des outils d'entreprise.",
      "Son idee forte : tu ecris le code une fois, puis il peut tourner sur plusieurs machines.",
    ],
  },
  {
    eyebrow: "Le principe",
    title: "Du code vers une app",
    accent: "#38bdf8",
    lines: [
      "Tu ecris un fichier .java avec des instructions lisibles par un humain.",
      "Le compilateur transforme ce fichier en bytecode.",
      "Ce bytecode est ensuite execute par la JVM : la Java Virtual Machine.",
    ],
  },
  {
    eyebrow: "Super pouvoir",
    title: "La JVM fait le pont",
    accent: "#22c55e",
    lines: [
      "La JVM est comme un moteur installe sur l'ordinateur.",
      "Windows, macOS ou Linux peuvent lancer le meme programme Java si la JVM est presente.",
      "C'est pour ca que Java est tres utilise dans les gros systemes.",
    ],
  },
  {
    eyebrow: "Un exemple",
    title: "Tout commence par une classe",
    accent: "#facc15",
    lines: [
      "En Java, on organise le code dans des classes.",
      "Une classe peut representer un objet : une voiture, un utilisateur, une commande.",
      "La methode main est souvent le point de depart du programme.",
    ],
  },
  {
    eyebrow: "Pourquoi c'est solide",
    title: "Types, outils, structure",
    accent: "#a78bfa",
    lines: [
      "Java est un langage type : une variable annonce ce qu'elle contient.",
      "Le compilateur repere beaucoup d'erreurs avant meme de lancer l'application.",
      "Cette rigueur aide les equipes a maintenir de grands projets pendant longtemps.",
    ],
  },
  {
    eyebrow: "Ou on le voit",
    title: "Java dans le monde reel",
    accent: "#fb7185",
    lines: [
      "Des banques, boutiques en ligne et services cloud utilisent Java cote serveur.",
      "Android a longtemps repose sur Java pour creer des applications mobiles.",
      "Minecraft, des outils de data et beaucoup d'API tournent aussi autour de Java.",
    ],
  },
  {
    eyebrow: "A retenir",
    title: "Java = langage + ecosysteme",
    accent: "#14b8a6",
    lines: [
      "Java sert a construire des applications fiables et portables.",
      "Le code devient du bytecode, puis la JVM l'execute.",
      "Si tu veux apprendre la programmation serieusement, Java donne de tres bonnes bases.",
    ],
  },
  {
    eyebrow: "Concept cle",
    title: "La programmation objet",
    accent: "#e879f9",
    lines: [
      "En Java, tout est organise autour de classes et d'objets.",
      "Un objet regroupe des donnees et des actions dans une seule entite.",
      "La POO rend le code plus clair, modulaire et reutilisable.",
    ],
  },
  {
    eyebrow: "Reutiliser le code",
    title: "Heritage et interfaces",
    accent: "#f59e0b",
    lines: [
      "Une classe peut heriter d'une autre et recuperer son code automatiquement.",
      "Les interfaces definissent des comportements que plusieurs classes peuvent partager.",
      "Ce systeme evite la repetition et facilite l'evolution du projet.",
    ],
  },
  {
    eyebrow: "Gerer les erreurs",
    title: "Try, Catch, Finally",
    accent: "#10b981",
    lines: [
      "Quand une erreur survient, Java lance une exception pour l'indiquer.",
      "Le bloc try/catch permet d'attraper et de traiter ces erreurs proprement.",
      "Finally s'execute toujours, ideal pour liberer des ressources.",
    ],
  },
];

const snippets = {
  hello: `public class Bonjour {
  public static void main(String[] args) {
    System.out.println("Salut Java !");
  }
}`,
  class: `class Voiture {
  String couleur;
  int vitesse;

  void accelerer() {
    vitesse = vitesse + 10;
  }
}`,
  typed: `String nom = "Nina";
int age = 16;
boolean apprendJava = true;`,
  oop: `class Utilisateur {
  String nom;
  int age;

  Utilisateur(String n, int a) {
    this.nom = n;
    this.age = a;
  }

  void afficher() {
    System.out.println(
      nom + " a " + age + " ans"
    );
  }
}`,
  inheritance: `class Animal {
  void parler() {
    System.out.println("...");
  }
}

class Chien extends Animal {
  void parler() {
    System.out.println("Wouf !");
  }
}`,
  exception: `try {
  int result = 10 / 0;
} catch (ArithmeticException e) {
  System.out.println(
    "Erreur : " + e.getMessage()
  );
} finally {
  System.out.println("Termine.");
}`,
};

const fade = (frame, duration = SCENE) =>
  interpolate(frame, [0, 18, duration - 18, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const inOut = (frame, start, end) =>
  interpolate(frame, [start, start + 14, end - 14, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

function Backdrop({ accent }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = interpolate(frame, [0, SCENE], [0, -80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.14), transparent 20%), linear-gradient(135deg, #07111f 0%, #182235 48%, #101820 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${accent}22 2px, transparent 2px), linear-gradient(90deg, ${accent}18 2px, transparent 2px)`,
          backgroundSize: "96px 96px",
          transform: `translateY(${drift}px)`,
          opacity: 0.55,
        }}
      />
      {[...Array(28)].map((_, index) => {
        const x = (index * 173) % width;
        const y = (index * 97) % height;
        const pulse = Math.sin((frame + index * 11) / 18) * 0.5 + 0.5;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 5 + pulse * 7,
              height: 5 + pulse * 7,
              borderRadius: "50%",
              background: accent,
              opacity: 0.24 + pulse * 0.34,
              boxShadow: `0 0 ${18 + pulse * 24}px ${accent}`,
            }}
          />
        );
      })}
    </>
  );
}

function Header({ slide, index }) {
  return (
    <div style={{ position: "absolute", top: 38, left: 56, right: 56, zIndex: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: slide.accent, fontSize: 30, fontWeight: 900, textTransform: "uppercase" }}>
          {slide.eyebrow}
        </div>
        <div style={{ color: "#cbd5e1", fontSize: 25, fontWeight: 800 }}>
          Java explique simplement - {index + 1}/{SCENES}
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          height: 8,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${((index + 1) / SCENES) * 100}%`,
            height: "100%",
            background: slide.accent,
            boxShadow: `0 0 28px ${slide.accent}`,
          }}
        />
      </div>
    </div>
  );
}

function KineticTitle({ title, accent }) {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps: FPS, config: { damping: 12, stiffness: 130 } });
  const y = interpolate(frame, [0, 24], [48, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ transform: `translateY(${y}px) scale(${scale})`, transformOrigin: "left center" }}>
      <div
        style={{
          fontSize: 105,
          lineHeight: 0.96,
          fontWeight: 950,
          color: "#f8fafc",
          letterSpacing: 0,
          textShadow: `0 0 40px ${accent}55`,
          maxWidth: 880,
        }}
      >
        {title}
      </div>
      <div style={{ width: 360, height: 12, marginTop: 28, background: accent, borderRadius: 8 }} />
    </div>
  );
}

function SubtitleBlock({ lines, accent }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 88, bottom: 70, width: 980, zIndex: 30 }}>
      {lines.map((line, index) => {
        const start = 52 + index * 165; // espacement adapte pour SCENE=720
        const opacity = inOut(frame, start, start + 86);
        const x = interpolate(frame, [start, start + 18], [-50, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={line}
            style={{
              opacity,
              transform: `translateX(${x}px)`,
              marginTop: index === 0 ? 0 : 18,
              display: "flex",
              alignItems: "flex-start",
              gap: 18,
              color: "#f8fafc",
              fontSize: 35,
              lineHeight: 1.24,
              fontWeight: 800,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                marginTop: 11,
                borderRadius: 5,
                background: accent,
                boxShadow: `0 0 22px ${accent}`,
                flex: "0 0 auto",
              }}
            />
            <span>{line}</span>
          </div>
        );
      })}
    </div>
  );
}

function CodeCard({ code, accent, top = 250, left = 1040 }) {
  const frame = useCurrentFrame();
  const chars = Math.floor(
    interpolate(frame, [34, 200], [0, code.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const visible = code.slice(0, chars);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: 760,
        minHeight: 420,
        borderRadius: 8,
        background: "rgba(4,10,18,0.9)",
        border: `2px solid ${accent}66`,
        boxShadow: `0 24px 80px rgba(0,0,0,0.38), 0 0 60px ${accent}22`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 50,
          background: "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 11,
          paddingLeft: 22,
        }}
      >
        <Dot color="#ef4444" />
        <Dot color="#f59e0b" />
        <Dot color="#22c55e" />
        <div style={{ marginLeft: 18, color: "#94a3b8", fontSize: 22, fontFamily: MONO }}>Main.java</div>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "28px 30px",
          color: "#dbeafe",
          fontSize: 28,
          lineHeight: 1.42,
          fontFamily: MONO,
          whiteSpace: "pre-wrap",
        }}
      >
        {visible}
        <span style={{ color: accent }}>|</span>
      </pre>
    </div>
  );
}

function Dot({ color }) {
  return <div style={{ width: 15, height: 15, borderRadius: "50%", background: color }} />;
}

function JavaLogo({ accent }) {
  const frame = useCurrentFrame();
  const spin = interpolate(frame, [0, SCENE], [-8, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const steam = interpolate(frame % 80, [0, 80], [30, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", right: 150, top: 215, width: 560, height: 560 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `conic-gradient(from ${frame * 2}deg, ${accent}, #38bdf8, #f8fafc, ${accent})`,
          opacity: 0.18,
          filter: "blur(8px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 170,
          width: 400,
          height: 230,
          border: `18px solid ${accent}`,
          borderTop: "0",
          borderRadius: "0 0 120px 120px",
          transform: `rotate(${spin}deg)`,
          boxShadow: `0 0 55px ${accent}66`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 410,
          top: 218,
          width: 115,
          height: 95,
          border: `18px solid ${accent}`,
          borderLeft: "0",
          borderRadius: "0 70px 70px 0",
          transform: `rotate(${spin}deg)`,
        }}
      />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 185 + i * 75,
            top: 70 + steam - i * 10,
            width: 44,
            height: 120,
            borderRadius: "50%",
            borderLeft: `12px solid ${i === 1 ? "#38bdf8" : accent}`,
            opacity: 0.9 - i * 0.16,
            transform: `rotate(${12 - i * 8}deg)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 145,
          top: 410,
          width: 300,
          height: 22,
          borderRadius: "50%",
          background: "#f8fafc",
          opacity: 0.85,
        }}
      />
    </div>
  );
}

function Pipeline({ accent }) {
  const frame = useCurrentFrame();
  const labels = ["Code .java", "Compilateur", "Bytecode", "JVM", "Application"];
  return (
    <div style={{ position: "absolute", right: 92, top: 245, width: 820, height: 520 }}>
      {labels.map((label, index) => {
        const start = 25 + index * 42;
        const pop = spring({ frame: frame - start, fps: FPS, config: { damping: 11, stiffness: 150 } });
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: index % 2 === 0 ? 0 : 390,
              top: index * 92,
              width: 360,
              height: 82,
              borderRadius: 8,
              background: index === labels.length - 1 ? accent : "rgba(255,255,255,0.09)",
              border: `2px solid ${accent}88`,
              color: index === labels.length - 1 ? "#07111f" : "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 950,
              transform: `scale(${pop})`,
              boxShadow: `0 20px 60px ${accent}22`,
            }}
          >
            {label}
          </div>
        );
      })}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: i % 2 === 0 ? 350 : 320,
            top: 72 + i * 93,
            width: 120,
            height: 5,
            background: accent,
            transform: i % 2 === 0 ? "rotate(24deg)" : "rotate(156deg)",
            opacity: inOut(frame, 60 + i * 40, 620),
            boxShadow: `0 0 25px ${accent}`,
          }}
        />
      ))}
    </div>
  );
}

function JvmBridge({ accent }) {
  const frame = useCurrentFrame();
  const os = ["Windows", "macOS", "Linux"];
  const orbY = interpolate(frame % 120, [0, 60, 120], [0, -22, 0]);
  return (
    <div style={{ position: "absolute", right: 104, top: 220, width: 830, height: 560 }}>
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 80 + orbY,
          width: 330,
          height: 170,
          borderRadius: 8,
          background: accent,
          color: "#07111f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 62,
          fontWeight: 950,
          boxShadow: `0 0 70px ${accent}77`,
        }}
      >
        JVM
      </div>
      {os.map((name, index) => (
        <div
          key={name}
          style={{
            position: "absolute",
            left: 30 + index * 270,
            bottom: 45,
            width: 230,
            height: 120,
            borderRadius: 8,
            background: "rgba(255,255,255,0.1)",
            border: "2px solid rgba(255,255,255,0.18)",
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 900,
          }}
        >
          {name}
        </div>
      ))}
      {os.map((_, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: 142 + index * 270,
            top: 250,
            width: 5,
            height: 190,
            background: accent,
            transform: `rotate(${index === 0 ? 28 : index === 2 ? -28 : 0}deg)`,
            transformOrigin: "top center",
            opacity: inOut(frame, 50 + index * 35, 620),
            boxShadow: `0 0 24px ${accent}`,
          }}
        />
      ))}
    </div>
  );
}

function WorldUse({ accent }) {
  const frame = useCurrentFrame();
  const items = ["Serveurs", "Android", "Banques", "Cloud", "APIs", "Jeux"];
  return (
    <div style={{ position: "absolute", right: 70, top: 185, width: 890, height: 620 }}>
      {items.map((item, index) => {
        const angle = (Math.PI * 2 * index) / items.length + frame / 90;
        const x = 380 + Math.cos(angle) * 300;
        const y = 265 + Math.sin(angle) * 190;
        return (
          <div
            key={item}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 180,
              height: 76,
              borderRadius: 8,
              background: index % 2 ? "rgba(255,255,255,0.1)" : accent,
              color: index % 2 ? "#f8fafc" : "#07111f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 27,
              fontWeight: 950,
              boxShadow: `0 20px 60px ${accent}24`,
            }}
          >
            {item}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 350,
          top: 240,
          width: 220,
          height: 130,
          borderRadius: 8,
          background: "#f8fafc",
          color: "#07111f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 54,
          fontWeight: 950,
          boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
        }}
      >
        Java
      </div>
    </div>
  );
}

function OopDiagram({ accent }) {
  const frame = useCurrentFrame();
  const fields = ["String nom", "int age", "boolean actif"];
  const methods = ["void afficher()", "void seConnecter()", "String toString()"];
  const pop = spring({ frame: frame - 15, fps: FPS, config: { damping: 12, stiffness: 110 } });

  return (
    <div style={{ position: "absolute", right: 80, top: 210, width: 800, zIndex: 10 }}>
      <div
        style={{
          transform: `scale(${pop})`,
          width: 520,
          marginLeft: "auto",
          borderRadius: 12,
          overflow: "hidden",
          border: `3px solid ${accent}66`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.4), 0 0 60px ${accent}22`,
          background: "rgba(4,10,18,0.93)",
        }}
      >
        <div
          style={{
            background: accent,
            padding: "18px 28px",
            textAlign: "center",
            color: "#07111f",
            fontSize: 36,
            fontWeight: 950,
            fontFamily: MONO,
          }}
        >
          Utilisateur
        </div>
        <div style={{ height: 2, background: `${accent}66` }} />
        <div style={{ padding: "16px 26px" }}>
          {fields.map((f, i) => {
            const start = 60 + i * 90;
            const opacity = interpolate(frame, [start, start + 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x = interpolate(frame, [start, start + 22], [-24, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={f}
                style={{
                  opacity,
                  transform: `translateX(${x}px)`,
                  color: "#93c5fd",
                  fontSize: 26,
                  fontFamily: MONO,
                  paddingBottom: 10,
                }}
              >
                - {f};
              </div>
            );
          })}
        </div>
        <div style={{ height: 2, background: `${accent}44` }} />
        <div style={{ padding: "16px 26px" }}>
          {methods.map((m, i) => {
            const start = 340 + i * 90;
            const opacity = interpolate(frame, [start, start + 22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x = interpolate(frame, [start, start + 22], [-24, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={m}
                style={{
                  opacity,
                  transform: `translateX(${x}px)`,
                  color: "#86efac",
                  fontSize: 26,
                  fontFamily: MONO,
                  paddingBottom: 10,
                }}
              >
                + {m}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InheritanceTree({ accent }) {
  const frame = useCurrentFrame();
  const children = ["Chien", "Chat", "Oiseau"];
  const parentPop = spring({ frame: frame - 10, fps: FPS, config: { damping: 12, stiffness: 110 } });
  const trunkH = interpolate(frame, [40, 80], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const branchW = interpolate(frame, [82, 130], [0, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", right: 80, top: 210, width: 820, height: 580, zIndex: 10 }}>
      {/* Parent */}
      <div
        style={{
          position: "absolute",
          left: 265,
          top: 20,
          width: 280,
          height: 88,
          borderRadius: 10,
          background: accent,
          color: "#07111f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 950,
          fontFamily: MONO,
          transform: `scale(${parentPop})`,
          boxShadow: `0 0 55px ${accent}77`,
        }}
      >
        Animal
      </div>
      {/* Trunk vertical */}
      <div
        style={{
          position: "absolute",
          left: 403,
          top: 108,
          width: 4,
          height: trunkH,
          background: accent,
          boxShadow: `0 0 14px ${accent}`,
        }}
      />
      {/* Branch horizontal */}
      <div
        style={{
          position: "absolute",
          left: 155,
          top: 208,
          width: branchW,
          height: 4,
          background: accent,
          boxShadow: `0 0 14px ${accent}`,
        }}
      />
      {/* Children vertical drop lines */}
      {children.map((name, i) => {
        const startFrame = 130 + i * 80;
        const vertH = interpolate(frame, [startFrame, startFrame + 40], [0, 80], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const xCenter = 55 + i * 250;
        return (
          <div
            key={`vline-${i}`}
            style={{
              position: "absolute",
              left: xCenter + 100,
              top: 212,
              width: 4,
              height: vertH,
              background: accent,
              boxShadow: `0 0 12px ${accent}`,
            }}
          />
        );
      })}
      {/* Children boxes */}
      {children.map((name, i) => {
        const startFrame = 130 + i * 80;
        const boxPop = spring({
          frame: frame - (startFrame + 40),
          fps: FPS,
          config: { damping: 11, stiffness: 130 },
        });
        const xCenter = 55 + i * 250;
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: xCenter,
              top: 292,
              width: 210,
              height: 80,
              borderRadius: 10,
              background: "rgba(255,255,255,0.1)",
              border: `3px solid ${accent}88`,
              color: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 900,
              fontFamily: MONO,
              transform: `scale(${boxPop})`,
              boxShadow: `0 12px 40px rgba(0,0,0,0.3)`,
            }}
          >
            {name}
          </div>
        );
      })}
      {/* Override label */}
      {children.map((name, i) => {
        const startFrame = 130 + i * 80;
        const xCenter = 55 + i * 250;
        const opacity = interpolate(frame, [startFrame + 120, startFrame + 150], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={`method-${i}`}
            style={{
              position: "absolute",
              left: xCenter + 12,
              top: 392,
              opacity,
              color: "#86efac",
              fontFamily: MONO,
              fontSize: 20,
            }}
          >
            @Override parler()
          </div>
        );
      })}
    </div>
  );
}

function Scene({ slide, index, children }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: fade(frame), fontFamily: SANS, overflow: "hidden" }}>
      <Audio src={staticFile(`audio/java_narration${index + 1}.mp3`)} volume={1} />
      <Audio src={staticFile("audio/music3.mp3")} volume={0.06} />
      <Backdrop accent={slide.accent} />
      <Header slide={slide} index={index} />
      <div style={{ position: "absolute", left: 86, top: 210, zIndex: 10 }}>
        <KineticTitle title={slide.title} accent={slide.accent} />
      </div>
      <SubtitleBlock lines={slide.lines} accent={slide.accent} />
      {children}
    </AbsoluteFill>
  );
}

export function JavaExplainer() {
  return (
    <AbsoluteFill style={{ background: "#07111f" }}>
      <Sequence from={0} durationInFrames={SCENE}>
        <Scene slide={slides[0]} index={0}>
          <JavaLogo accent={slides[0].accent} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE} durationInFrames={SCENE}>
        <Scene slide={slides[1]} index={1}>
          <Pipeline accent={slides[1].accent} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE * 2} durationInFrames={SCENE}>
        <Scene slide={slides[2]} index={2}>
          <JvmBridge accent={slides[2].accent} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE * 3} durationInFrames={SCENE}>
        <Scene slide={slides[3]} index={3}>
          <CodeCard code={snippets.hello} accent={slides[3].accent} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE * 4} durationInFrames={SCENE}>
        <Scene slide={slides[4]} index={4}>
          <CodeCard code={snippets.typed} accent={slides[4].accent} top={255} left={1050} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE * 5} durationInFrames={SCENE}>
        <Scene slide={slides[5]} index={5}>
          <WorldUse accent={slides[5].accent} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE * 6} durationInFrames={SCENE}>
        <Scene slide={slides[6]} index={6}>
          <CodeCard code={snippets.class} accent={slides[6].accent} top={210} left={1040} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE * 7} durationInFrames={SCENE}>
        <Scene slide={slides[7]} index={7}>
          <OopDiagram accent={slides[7].accent} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE * 8} durationInFrames={SCENE}>
        <Scene slide={slides[8]} index={8}>
          <InheritanceTree accent={slides[8].accent} />
        </Scene>
      </Sequence>
      <Sequence from={SCENE * 9} durationInFrames={SCENE}>
        <Scene slide={slides[9]} index={9}>
          <CodeCard code={snippets.exception} accent={slides[9].accent} top={230} left={1030} />
        </Scene>
      </Sequence>
    </AbsoluteFill>
  );
}
