/* ============================================================
   Gera a imagem de compartilhamento a partir de tools/og-card.html.

   Como os ícones, não faz parte do build: precisa de navegador para
   renderizar com as fontes reais da marca. Roda com `npm run social`
   e o resultado é versionado.

   O arquivo sai em JPG porque as metatags declaram image/jpeg, e
   porque o WhatsApp trata JPG com mais previsibilidade que PNG em
   pré-visualização de link.
   ============================================================ */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const DESTINO = path.join(RAIZ, "docs", "assets", "img");
const PAGINA = "file:///" + path.join(__dirname, "og-card.html").replace(/\\/g, "/");
const TEMP = path.join(DESTINO, "_og-temporario.png");
const FINAL = path.join(DESTINO, "benedito-furtado-compartilhamento.jpg");

fs.mkdirSync(DESTINO, { recursive: true });

/* 1200x630 é a proporção que Facebook, WhatsApp, LinkedIn e X usam
   para o cartão grande. Fora dela, cada rede corta por conta própria. */
execFileSync("npx", [
  "--no-install", "playwright", "screenshot",
  "--channel=msedge",
  "--viewport-size=1200,630",
  "--wait-for-timeout=1800",
  PAGINA, TEMP
], { stdio: "pipe", shell: true });

execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", TEMP, "-q:v", "3", FINAL], { stdio: "pipe" });
fs.unlinkSync(TEMP);

console.log("  " + path.basename(FINAL) + "  " +
  (fs.statSync(FINAL).size / 1024).toFixed(1) + " KB");
