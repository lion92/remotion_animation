import http from "node:http";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4000;

if (!existsSync(path.join(__dirname, "out"))) {
  mkdirSync(path.join(__dirname, "out"));
}

const COMPOSITIONS = [
  { id: "RpgCodingStory", label: "Mini RPG Tutorial",  duration: "8 min",   accent: "#f43f5e" },
  { id: "JavaExplainer",  label: "Java Explainer",      duration: "5 min",   accent: "#f97316" },
  { id: "HtmlCssJsStory", label: "HTML/CSS/JS Story",   duration: "3 min 45", accent: "#38bdf8" },
  { id: "DevStory",       label: "Dev Story",           duration: "5 min",   accent: "#a78bfa" },
  { id: "AstronautStory", label: "Astronaut Story",     duration: "5 min",   accent: "#22d3ee" },
  { id: "Cartoon",        label: "Cartoon",             duration: "40 s",    accent: "#fbbf24" },
];

function stripAnsi(s) {
  return s.replace(/\x1B\[[0-9;?]*[A-Za-z]/g, "").replace(/\r/g, "\n");
}

function parsePercent(text) {
  const m = text.match(/(\d{1,3})%/);
  return m ? Math.min(99, parseInt(m[1])) : null;
}

// ─── HTML dashboard ──────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>🎬 Remotion Render</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07090f;color:#e2e8f0;font-family:'Segoe UI',sans-serif;padding:36px;min-height:100vh}
h1{font-size:2rem;color:#fbbf24;text-shadow:0 0 24px #fbbf2466;margin-bottom:6px}
.sub{color:#475569;font-size:.9rem;margin-bottom:36px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:20px}

.card{
  background:#0d1220;
  border:2px solid #1e293b;
  border-radius:16px;
  padding:24px;
  transition:border-color .3s;
}
.card.rendering{border-color:#fbbf24;box-shadow:0 0 28px #fbbf2422}
.card.done     {border-color:#22c55e;box-shadow:0 0 28px #22c55e22}
.card.error    {border-color:#ef4444;box-shadow:0 0 28px #ef444422}

.card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.comp-name{font-size:1.1rem;font-weight:800;color:#f1f5f9}
.comp-dur{font-size:.78rem;color:#64748b;background:#1e293b;padding:3px 10px;border-radius:20px}

.btn{
  width:100%;padding:11px 20px;border:none;border-radius:10px;
  font-size:.95rem;font-weight:700;cursor:pointer;
  background:#6366f1;color:white;
  transition:opacity .2s,transform .1s;
  margin-bottom:16px;letter-spacing:.3px;
}
.btn:hover{opacity:.85}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.38;cursor:default}

.bar-bg{background:#0f172a;border-radius:8px;height:10px;overflow:hidden;margin-bottom:6px}
.bar{height:100%;border-radius:8px;transition:width .5s ease;width:0%}
.bar.active{background:linear-gradient(90deg,#6366f1,#a78bfa)}
.bar.done  {background:linear-gradient(90deg,#22c55e,#86efac);width:100%!important}
.bar.error {background:linear-gradient(90deg,#ef4444,#fca5a5)}

.status{font-size:.8rem;color:#64748b;height:18px;margin-bottom:10px}

.log{
  background:#020710;border:1px solid #1e293b;border-radius:8px;
  padding:10px 14px;height:130px;overflow-y:auto;
  font-size:.75rem;font-family:'Consolas',monospace;color:#334155;
  display:none;
}
.log.open{display:block}
.log .l{margin-bottom:2px;line-height:1.45;white-space:pre-wrap;word-break:break-all}
.log .hi{color:#fbbf24}
.log .ok{color:#4ade80}
.log .er{color:#f87171}

.badge{
  display:none;align-items:center;gap:10px;
  background:#052e16;border:1px solid #22c55e44;
  border-radius:8px;padding:11px 16px;
  color:#4ade80;font-weight:700;font-size:.9rem;margin-top:10px;
}
.badge.show{display:flex}
</style>
</head>
<body>
<h1>🎬 Remotion Render Dashboard</h1>
<p class="sub">Lance un rendu, suis la progression en temps réel — port 4000</p>
<div class="grid" id="grid"></div>

<script>
const COMPS = ${JSON.stringify(COMPOSITIONS)};

function card(c) {
  const d = document.createElement('div');
  d.className = 'card';
  d.id = 'C' + c.id;
  d.innerHTML =
    '<div class="card-top">' +
      '<div class="comp-name">' + c.label + '</div>' +
      '<div class="comp-dur">' + c.duration + '</div>' +
    '</div>' +
    '<button class="btn" id="B' + c.id + '" onclick="go(\\'' + c.id + '\\')">▶ Lancer le rendu</button>' +
    '<div class="bar-bg"><div class="bar" id="P' + c.id + '"></div></div>' +
    '<div class="status" id="S' + c.id + '">Prêt</div>' +
    '<div class="log" id="L' + c.id + '"></div>' +
    '<div class="badge" id="D' + c.id + '">✅ Rendu terminé — fichier dans out/</div>';
  return d;
}

COMPS.forEach(c => document.getElementById('grid').appendChild(card(c)));

function go(id) {
  const btn  = document.getElementById('B' + id);
  const bar  = document.getElementById('P' + id);
  const stat = document.getElementById('S' + id);
  const log  = document.getElementById('L' + id);
  const done = document.getElementById('D' + id);
  const card = document.getElementById('C' + id);

  btn.disabled = true;
  btn.textContent = '⏳ Rendu en cours…';
  bar.className = 'bar active';
  bar.style.width = '0%';
  log.className = 'log open';
  log.innerHTML = '';
  done.className = 'badge';
  card.className = 'card rendering';
  stat.textContent = 'Démarrage…';

  const es = new EventSource('/render?comp=' + id);

  es.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if (msg.type === 'log') {
      const el = document.createElement('div');
      el.className = 'l' + (msg.hi ? ' hi' : msg.ok ? ' ok' : msg.er ? ' er' : '');
      el.textContent = msg.text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      if (msg.pct !== null) {
        bar.style.width = msg.pct + '%';
        stat.textContent = msg.pct + '% — rendu en cours…';
      }
    }

    if (msg.type === 'done') {
      es.close();
      if (msg.code === 0) {
        bar.className = 'bar done';
        card.className = 'card done';
        done.className = 'badge show';
        stat.textContent = '✅ Terminé en ' + msg.elapsed;
        btn.textContent = '▶ Relancer';
      } else {
        bar.className = 'bar error';
        card.className = 'card error';
        stat.textContent = '❌ Erreur — voir le log';
        btn.textContent = '↺ Réessayer';
      }
      btn.disabled = false;
    }
  };

  es.onerror = () => {
    es.close();
    stat.textContent = '⚠️ Connexion perdue';
    btn.disabled = false;
    btn.textContent = '↺ Réessayer';
    card.className = 'card error';
  };
}
</script>
</body>
</html>`;

// ─── serveur HTTP ─────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Page dashboard
  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML);
    return;
  }

  // SSE rendu
  if (url.pathname === "/render") {
    const comp = url.searchParams.get("comp");
    if (!comp) { res.writeHead(400); res.end("Paramètre comp manquant"); return; }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    const outFile = `out/${comp.toLowerCase()}.mp4`;
    const t0 = Date.now();

    const child = spawn(
      "npx",
      ["remotion", "render", "src/index.jsx", comp, outFile, "--log=verbose"],
      { cwd: __dirname, shell: true }
    );

    function onData(raw) {
      const text = stripAnsi(raw.toString());
      for (const line of text.split("\n")) {
        const l = line.trim();
        if (!l) continue;
        const pct = parsePercent(l);
        const ok = /done|success|written|saved/i.test(l);
        const er = /error|fail|warn/i.test(l);
        const hi = pct !== null;
        send({ type: "log", text: l, pct, hi, ok, er });
      }
    }

    child.stdout.on("data", onData);
    child.stderr.on("data", onData);

    child.on("close", (code) => {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1) + " s";
      send({ type: "done", code, outFile, elapsed });
      res.end();
    });

    req.on("close", () => child.kill());
    return;
  }

  res.writeHead(404);
  res.end("Non trouvé");
});

server.listen(PORT, () => {
  console.log(`\n🎬  Render dashboard  →  http://localhost:${PORT}\n`);
});
