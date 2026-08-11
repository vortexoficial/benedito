const path = require("path");
const { chromium } = require(path.join(process.env.TEMP, "benedito-playwright", "node_modules", "playwright-core"));

(async function () {
  const navegador = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await pagina.goto("file:///C:/CLIENTES/BENEDITO/tools/og-card.html", { waitUntil: "networkidle" });
  await pagina.screenshot({
    path: path.join(__dirname, "..", "site", "assets", "img", "benedito-furtado-compartilhamento.png"),
    type: "png"
  });
  await navegador.close();
}()).catch(function (erro) {
  console.error(erro);
  process.exit(1);
});
