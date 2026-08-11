const path = require("path");
const { chromium } = require(path.join(process.env.TEMP, "benedito-playwright", "node_modules", "playwright-core"));

async function validarPagina(navegador, nome, viewport) {
  const pagina = await navegador.newPage({ viewport, deviceScaleFactor: 1 });
  const erros = [];
  pagina.on("console", function (msg) { if (msg.type() === "error") erros.push("console: " + msg.text()); });
  pagina.on("pageerror", function (erro) { erros.push("page: " + erro.message); });
  pagina.on("requestfailed", function (req) { erros.push("request: " + req.url()); });
  await pagina.addInitScript(function () { localStorage.setItem("bf-consentimento-cookies", "essenciais"); });

  await pagina.goto("http://127.0.0.1:4173/index.html", { waitUntil: "networkidle" });
  await pagina.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await pagina.waitForTimeout(1600);

  const cabeca = await pagina.evaluate(function () {
    const meta = function (seletor) { const el = document.querySelector(seletor); return el && el.content; };
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]').href,
      ogImage: meta('meta[property="og:image"]'),
      jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length
    };
  });

  const ids = ["sobre", "atuacao", "livros", "noticias", "galeria", "contato"];
  for (const id of ids) {
    await pagina.locator("#" + id).scrollIntoViewIfNeeded();
    await pagina.waitForTimeout(300);
  }

  await pagina.locator("#galeria").scrollIntoViewIfNeeded();
  await pagina.waitForTimeout(900);
  const galeria = await pagina.evaluate(function () {
    const ativo = document.querySelector('[data-galeria-item][aria-current="true"] img');
    const mini = document.querySelector(".galeria-miniatura img");
    return { ativo: ativo && ativo.getAttribute("src"), miniatura: mini && mini.getAttribute("src") };
  });

  await pagina.locator("[data-galeria-ampliar]").click();
  await pagina.waitForTimeout(300);
  const modal = await pagina.evaluate(function () {
    const caixa = document.querySelector("[data-galeria-modal]");
    const img = document.querySelector("[data-galeria-modal-img]");
    const fechar = document.querySelector("[data-galeria-fechar]");
    return {
      aberto: caixa && !caixa.hidden,
      src: img && img.getAttribute("src"),
      carregou: img && img.complete && img.naturalWidth > 0,
      display: caixa && getComputedStyle(caixa).display,
      opacity: caixa && getComputedStyle(caixa).opacity,
      fecharDisplay: fechar && getComputedStyle(fechar).display,
      fecharRect: fechar && fechar.getBoundingClientRect().toJSON()
    };
  });
  await pagina.evaluate(function () { document.querySelector("[data-galeria-fechar]").click(); });
  await pagina.waitForTimeout(350);

  if (viewport.width < 700) {
    await pagina.locator(".abrir-menu").click();
    await pagina.waitForTimeout(150);
    await pagina.locator(".fechar-menu").click();
  }

  await pagina.evaluate(function () {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await pagina.waitForTimeout(300);
  await pagina.screenshot({ path: path.join(process.env.TEMP, "benedito-" + nome + ".png"), fullPage: false });

  const estado = await pagina.evaluate(function () {
    const quebradas = Array.from(document.images).filter(function (img) { return img.complete && img.naturalWidth === 0; });
    return {
      viewport: [innerWidth, innerHeight],
      scrollY: window.scrollY,
      alturaDocumento: document.documentElement.scrollHeight,
      larguraDocumento: document.documentElement.scrollWidth,
      overflowHorizontal: document.documentElement.scrollWidth > innerWidth + 1,
      imagensQuebradas: quebradas.map(function (img) { return img.getAttribute("src"); }),
      h1: document.querySelectorAll("h1").length,
      animaAtiva: Boolean(window.__bfAnimou),
      modalFechado: document.querySelector("[data-galeria-modal]").hidden,
      topo: document.querySelector(".topo").getBoundingClientRect().toJSON(),
      heroi: document.querySelector("#inicio").getBoundingClientRect().toJSON()
    };
  });

  await pagina.close();
  return { nome, cabeca, galeria, modal, estado, erros };
}

(async function () {
  const navegador = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const resultado = [];
  resultado.push(await validarPagina(navegador, "desktop", { width: 1440, height: 900 }));
  resultado.push(await validarPagina(navegador, "mobile", { width: 390, height: 844 }));
  await navegador.close();
  console.log(JSON.stringify(resultado, null, 2));
}()).catch(function (erro) {
  console.error(erro);
  process.exit(1);
});
