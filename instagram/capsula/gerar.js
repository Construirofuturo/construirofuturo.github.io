#!/usr/bin/env node
/*
 * Gera os vídeos-cápsula (MP4, 1080 × 1920, 30 fps, 18 s) a partir de capsula.html.
 *
 *   node instagram/capsula/gerar.js                  → todas as pessoas de pessoas.json
 *   node instagram/capsula/gerar.js rui-diogo-rodrigues nina-monteiro
 *
 * Requisitos (uma vez):  npm install playwright  &&  npx playwright install chromium
 * ffmpeg: no PATH, ou indicado em FFMPEG=/caminho/para/ffmpeg
 * Os vídeos ficam em instagram/capsula/saida/ID.mp4
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..', '..');
const SAIDA = path.join(__dirname, 'saida');
const FPS = 30;
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.css': 'text/css' };

function servidor() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const f = path.join(RAIZ, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f).toLowerCase()] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    }).listen(0, '127.0.0.1', () => ok(s));
  });
}

(async () => {
  const dados = JSON.parse(fs.readFileSync(path.join(__dirname, 'pessoas.json'), 'utf8'));
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : dados.pessoas.map((p) => p.id);
  fs.mkdirSync(SAIDA, { recursive: true });
  const srv = await servidor();
  const porta = srv.address().port;
  const browser = await chromium.launch();
  const pagina = await (await browser.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();

  for (const id of ids) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'capsula-'));
    process.stdout.write(`${id}: a gerar fotogramas… `);
    await pagina.goto(`http://127.0.0.1:${porta}/instagram/capsula/capsula.html?id=${encodeURIComponent(id)}`);
    await pagina.waitForSelector('body[data-pronto]', { timeout: 60000 });
    const dur = await pagina.evaluate(() => window.DURACAO);
    const n = Math.round(dur * FPS);
    for (let i = 0; i < n; i++) {
      await pagina.evaluate((t) => window.render(t), i / FPS);
      await pagina.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 93 });
    }
    process.stdout.write('a codificar… ');
    const destino = path.join(SAIDA, `${id}.mp4`);
    execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.jpg'),
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', destino]);
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`feito → ${path.relative(RAIZ, destino)}`);
  }
  await browser.close();
  srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
