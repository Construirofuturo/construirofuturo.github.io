#!/usr/bin/env node
/*
 * Gera as peças do LinkedIn:
 *   linkedin/saida/construir-o-futuro.pdf   documento deslizável (1080 × 1350 por página)
 *   linkedin/saida/banner-linkedin.png      fotografia de capa dos perfis (1584 × 396)
 *   linkedin/saida/paginas/NN.png           cada página em PNG
 *
 *   node linkedin/gerar.js
 * Requisitos: npm install playwright && npx playwright install chromium
 */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..'), SAIDA = path.join(__dirname, 'saida');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2' };
const PAGINAS = [
  'instagram/equipa.html?s=0&li=1',       // capa: cubo das 27
  'linkedin/paginas.html?p=manifesto',
  'linkedin/paginas.html?p=eixo1', 'linkedin/paginas.html?p=eixo2', 'linkedin/paginas.html?p=eixo3',
  'linkedin/paginas.html?p=eixo4', 'linkedin/paginas.html?p=eixo5',
  'instagram/equipa.html?s=1', 'instagram/equipa.html?s=2', 'instagram/equipa.html?s=3',
  'linkedin/paginas.html?p=fecho'
];

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
  fs.mkdirSync(path.join(SAIDA, 'paginas'), { recursive: true });
  const srv = await servidor(), base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const p = await (await browser.newContext({ viewport: { width: 1080, height: 1350 } })).newPage();
  const ficheiros = [];
  for (let i = 0; i < PAGINAS.length; i++) {
    await p.goto(base + PAGINAS[i]);
    await p.waitForSelector('body[data-pronto]', { timeout: 60000 });
    const f = path.join(SAIDA, 'paginas', String(i + 1).padStart(2, '0') + '.png');
    await p.screenshot({ path: f });
    ficheiros.push(f);
    console.log('página', i + 1, PAGINAS[i]);
  }
  // PDF: uma imagem por página, sem margens
  const html = '<style>@page{size:1080px 1350px;margin:0}body{margin:0}img{display:block;width:1080px;height:1350px;page-break-after:always}</style>' +
    ficheiros.map((f) => '<img src="data:image/png;base64,' + fs.readFileSync(f).toString('base64') + '">').join('');
  const pdf = await browser.newPage();
  await pdf.setContent(html, { waitUntil: 'load' });
  await pdf.pdf({ path: path.join(SAIDA, 'construir-o-futuro.pdf'), width: '1080px', height: '1350px', printBackground: true, pageRanges: '1-' + ficheiros.length });
  // Banner
  const b = await (await browser.newContext({ viewport: { width: 1584, height: 396 } })).newPage();
  await b.goto(base + 'linkedin/banner.html');
  await b.waitForSelector('body[data-pronto]', { timeout: 60000 });
  await b.screenshot({ path: path.join(SAIDA, 'banner-linkedin.png') });
  console.log('feito → linkedin/saida/');
  await browser.close(); srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
