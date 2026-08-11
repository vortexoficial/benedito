/* ============================================================
   Gera os ícones do site a partir de tools/icone.html.

   Não faz parte do build: exige um navegador e o monograma quase
   nunca muda. Roda sob demanda, com `npm run icones`, e o resultado
   é versionado junto com o site.

   Por que renderizar em vez de desenhar um SVG à mão: o monograma
   usa a Zilla Slab, a mesma serifa da marca. Um SVG com <text>
   dependeria de a fonte existir na máquina de quem vê — não existe.
   Converter as letras em curvas à mão sairia impreciso. Renderizar
   com a fonte real e exportar em PNG resolve os dois problemas.
   ============================================================ */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const DESTINO = path.join(RAIZ, "docs", "assets", "img");
const PAGINA = "file:///" + path.join(__dirname, "icone.html").replace(/\\/g, "/");

/* 512: fonte de tudo e ícone de instalação (PWA, atalho de tela)
   180: apple-touch-icon do iOS. Quadrado e opaco de propósito: o
        iOS aplica o próprio arredondamento, e um PNG já arredondado
        acaba exibindo cantos brancos por cima da máscara dele
    32: favicon da aba, o tamanho em que o desenho é mais exigido */
const TAMANHOS = [
  { arquivo: "icone-512.png", px: 512, seletor: "#liso" },
  { arquivo: "icone-180.png", px: 180, seletor: "#liso" },
  { arquivo: "favicon-32.png", px: 32, seletor: "#liso" }
];

function capturar(seletor, px, saida) {
  execFileSync("npx", [
    "--no-install", "playwright", "screenshot",
    "--channel=msedge",
    "--viewport-size=" + px + "," + px,
    "--wait-for-timeout=1200",
    PAGINA + "#" + seletor.replace("#", ""),
    saida
  ], { stdio: "pipe", shell: true });
}

/* O screenshot do Playwright captura a janela inteira, então cada
   ícone é renderizado sozinho numa página do tamanho exato. O
   parâmetro ?so= diz ao HTML qual dos dois quadros mostrar. */
function capturarUnico(qual, px, saida) {
  execFileSync("npx", [
    "--no-install", "playwright", "screenshot",
    "--channel=msedge",
    "--viewport-size=" + px + "," + px,
    "--wait-for-timeout=1200",
    PAGINA + "?so=" + qual,
    saida
  ], { stdio: "pipe", shell: true });
}

fs.mkdirSync(DESTINO, { recursive: true });
TAMANHOS.forEach(function (t) {
  const saida = path.join(DESTINO, t.arquivo);
  capturarUnico(t.seletor === "#redondo" ? "redondo" : "liso", t.px, saida);
  console.log("  " + t.arquivo + "  " + t.px + "x" + t.px + "  " +
    (fs.statSync(saida).size / 1024).toFixed(1) + " KB");
});
console.log("Ícones gerados em docs/assets/img/");
