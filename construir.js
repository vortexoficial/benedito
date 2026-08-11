/* ============================================================
   Build do site — Benedito Furtado
   Uso:  node construir.js
   Lê src/base.html + src/paginas/*.html e escreve site/*.html.
   Gera também previa-artefato.html na RAIZ (arquivo único, para
   apresentação local). Fora de site/ de propósito: site/ é exatamente
   o que vai para produção, e a prévia tem 8 MB de ativos embutidos.
   ============================================================ */
const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const SRC = path.join(RAIZ, "src");
const SAIDA = path.join(RAIZ, "site");
const DOMINIO = "https://beneditofurtado.com.br";
const IMAGEM_SOCIAL = DOMINIO + "/assets/img/benedito-furtado-compartilhamento.jpg";

/* ------------------------------------------------------------
   As 32 leis, compiladas da cartilha "Leis do Furtado — Animais".
   cat: exploracao | estrutura | cuidado | fiscalizacao | convivio
   ------------------------------------------------------------ */
const LEIS = [
  { ano: 2004, norma: "Lei Complementar 498, de 28/05/2004", cat: "exploracao",
    txt: "Proibiu que animais apreendidos pela Prefeitura e não retirados pelos tutores fossem doados a instituições de pesquisa e ensino que usam animais vivos. Foi o fim da vivissecção como destino legal desses animais em Santos." },
  { ano: 2004, norma: "Lei Complementar 510, de 23/12/2004", cat: "exploracao",
    txt: "Proibiu alvará a circos e casas de diversão que usem animais em espetáculos, silvestres ou domésticos. Até então era rotina que circos com animais se instalassem na cidade." },
  { ano: 2005, norma: "Lei Complementar 533, de 10/05/2005", cat: "convivio",
    txt: "Disciplinou a criação, propriedade, posse, guarda, uso e transporte de cães e gatos no município: a lei-quadro que as normas seguintes passaram a complementar." },
  { ano: 2005, norma: "Lei Complementar 542, de 27/09/2005", cat: "estrutura",
    txt: "Criou a CODEVIDA, Coordenadoria de Proteção à Vida Animal, vinculada à Secretaria de Meio Ambiente. Deu à causa um órgão público com estrutura e orçamento." },
  { ano: 2006, norma: "Lei 2.413, de 13/07/2006", cat: "estrutura",
    txt: "Criou o Conselho Municipal para Proteção à Vida Animal, abrindo a política pública à participação de protetores, veterinários e sociedade civil." },
  { ano: 2006, norma: "Lei 2.414, de 13/07/2006", cat: "convivio",
    txt: "Instituiu no calendário oficial o Dia do Amigo, Protetor e Ativista da Causa Animal: reconhecimento público a quem cuida por conta própria." },
  { ano: 2007, norma: "Lei Complementar 611, de 14/12/2007", cat: "exploracao",
    txt: "Proibiu alvará a estabelecimentos que usem animais comercialmente em serviços de guarda, segurança e vigilância." },
  { ano: 2009, norma: "Lei Complementar 661, de 16/10/2009", cat: "exploracao",
    txt: "Estendeu a proibição às empresas de outras cidades que prestam serviço de guarda e vigilância com cães em Santos. Fechou a brecha da lei anterior." },
  { ano: 2011, norma: "Lei 2.757, de 09/05/2011", cat: "estrutura",
    txt: "Criou o Fundo Municipal de Proteção e Bem-Estar Animal, dando fonte de recursos própria às ações de cuidado." },
  { ano: 2011, norma: "Lei Complementar 738, de 18/11/2011", cat: "estrutura",
    txt: "Implantou o microchip como registro individual e permanente (RGA eletrônico), nos padrões ISO 11784 e 11785. Todos os cães adotados na CODEVIDA passaram a ser microchipados." },
  { ano: 2012, norma: "Lei Complementar 786, de 17/12/2012", cat: "convivio",
    txt: "Autorizou e regulou o transporte de animais domésticos no serviço municipal de transporte coletivo de passageiros." },
  { ano: 2013, norma: "Lei Complementar 806, de 28/08/2013", cat: "fiscalizacao",
    txt: "Instituiu normas para o transporte de animais feito por estabelecimentos comerciais e prestadores de serviço no município." },
  { ano: 2013, norma: "Lei Complementar 811, de 21/11/2013", cat: "cuidado",
    txt: "Estabeleceu normas para atendimento e proteção dos animais no município." },
  { ano: 2014, norma: "Lei 3.064, de 02/12/2014", cat: "exploracao",
    txt: "Proibiu alvará a instituições que realizem vivissecção ou usem animais em práticas experimentais, inclusive para fins pedagógicos, industriais, comerciais ou de pesquisa científica." },
  { ano: 2017, norma: "Lei Complementar 955, de 17/01/2017", cat: "convivio",
    txt: "Proibiu fogos de artifício ruidosos na área urbana, em espaços públicos e privados, liberando apenas os fogos de vista sem estampido. Protege animais, autistas e idosos." },
  { ano: 2017, norma: "Lei Complementar 988, de 04/12/2017", cat: "convivio",
    txt: "Vedou fachadas com superfícies contínuas de vidro de efeito refletivo ou espelhado nos edifícios da cidade, uma das principais causas de morte de aves em áreas urbanas." },
  { ano: 2018, norma: "Lei Complementar 996, de 18/04/2018", cat: "exploracao",
    txt: "Proibiu o trânsito de veículos, motorizados ou não, transportando cargas vivas nas áreas urbanas e de expansão urbana do município." },
  { ano: 2018, norma: "Lei Complementar 997, de 2018", cat: "estrutura",
    txt: "Disciplinou para quem os animais resgatados pela Prefeitura podem ser doados, completando a lei de 2004." },
  { ano: 2019, norma: "Lei Complementar 1.051, de 09/09/2019", cat: "exploracao",
    txt: "Proibiu alvará a canis, gatis e estabelecimentos comerciais que pratiquem a venda de animais domésticos. Adoção passou a ser o caminho." },
  { ano: 2020, norma: "Lei Complementar 1.100, de 10/09/2020", cat: "fiscalizacao",
    txt: "Tipificou o confinamento e o acorrentamento inadequado como maus-tratos, com critérios objetivos de espaço, sol, água, higiene e coleira. Obrigou câmeras de monitoramento nos serviços de banho e tosa, com 30 dias de guarda das imagens." },
  { ano: 2020, norma: "Lei Complementar 1.105, de 29/10/2020", cat: "exploracao",
    txt: "Proibiu conduzir animais presos por cordas, coleiras ou correntes a veículos como bicicletas, motos, carros e carroças, qualquer que seja a finalidade." },
  { ano: 2021, norma: "Lei Complementar 1.144, de 10/12/2021", cat: "cuidado",
    txt: "Tornou infração deixar de prestar socorro a animal atropelado, quando for possível fazê-lo sem risco pessoal." },
  { ano: 2022, norma: "Lei 4.039, de 22/06/2022", cat: "cuidado",
    txt: "Criou o Programa de Conscientização e Combate ao Abandono de Animais e instituiu o Outubro Animal, mês municipal de combate ao abandono." },
  { ano: 2023, norma: "Lei Complementar 1.188, de 02/01/2023", cat: "convivio",
    txt: "Regularizou os estabelecimentos comerciais pet friendly, que até então operavam numa zona proibida por lei." },
  { ano: 2023, norma: "Lei 4.177, de 21/03/2023", cat: "cuidado",
    txt: "Instituiu o Banco de Ração para Animais Domésticos, para atender tutores e protetores sem condições de manter a alimentação." },
  { ano: 2023, norma: "Lei Complementar 1.212, de 28/08/2023", cat: "cuidado",
    txt: "Garantiu reconhecimento oficial a empresas, associações e organizações que fazem doações ao Banco de Ração, criando incentivo à contribuição contínua." },
  { ano: 2024, norma: "Lei Complementar 1.271, de 21/05/2024", cat: "cuidado",
    txt: "Autorizou fornecer alimento e água em espaços públicos a animais abandonados e comunitários, com regras de higiene e manutenção dos comedouros. Protegeu juridicamente quem já fazia isso." },
  { ano: 2024, norma: "Lei Complementar 1.273, de 11/07/2024", cat: "convivio",
    txt: "Proibiu o uso e o escoamento, na lavagem de calçadas, de substâncias tóxicas, corrosivas, mutagênicas ou não biodegradáveis, com multa de R$ 1.500 a R$ 10.000." },
  { ano: 2025, norma: "Lei 4.610, de 24/03/2025", cat: "cuidado",
    txt: "Instituiu o Programa Farmácia Pública Veterinária no município, dando acesso a medicamentos a quem não pode pagar por eles." },
  { ano: 2025, norma: "Lei Complementar 1.306, de 24/10/2025", cat: "convivio",
    txt: "Vedou aos condomínios residenciais proibir animais domésticos nas unidades e nas áreas comuns, com multa de até R$ 10.000 ao infrator." },
  { ano: 2025, norma: "Lei Complementar 1.310, de 03/12/2025", cat: "fiscalizacao",
    txt: "Incluiu entre as infrações deixar animais sozinhos em imóveis vazios ou com os moradores ausentes por período prolongado." },
  { ano: 2026, norma: "Lei 4.723, de 28/01/2026", cat: "fiscalizacao",
    txt: "Criou o Cadastro Municipal de Pessoas Envolvidas em Maus-Tratos contra Animais, sob a CODEVIDA, com encaminhamento à Polícia Civil e ao Ministério Público. Quem está no cadastro fica proibido de adotar." }
];

const NOMES_CAT = {
  exploracao: "Fim da exploração",
  estrutura: "Estrutura pública",
  cuidado: "Cuidado e acesso",
  fiscalizacao: "Fiscalização",
  convivio: "Convívio urbano"
};

/* A linha do tempo em dois pedaços: uma régua de anos com um botão
   por lei, e a pilha de painéis com o texto de cada uma. Só um painel
   fica visível por vez — é o que derruba a seção de mais de 3.500px
   para cerca de 500px sem esconder nada de quem lê a página: as 32
   leis continuam todas no HTML.

   O par régua/painel segue o padrão ARIA de abas, então funciona no
   teclado e no leitor de tela sem depender do visual. */
function htmlRegua() {
  const anos = [];
  LEIS.forEach(function (lei, i) {
    let grupo = anos[anos.length - 1];
    if (!grupo || grupo.ano !== lei.ano) { grupo = { ano: lei.ano, itens: [] }; anos.push(grupo); }
    grupo.itens.push({ lei: lei, i: i });
  });

  return anos.map(function (g) {
    const pontos = g.itens.map(function (o) {
      return '            <button class="ll-ponto" type="button" role="tab" id="aba-' + o.i + '"' +
        ' aria-controls="lei-' + o.i + '" aria-selected="' + (o.i === 0) + '"' +
        ' tabindex="' + (o.i === 0 ? '0' : '-1') + '" data-cat="' + o.lei.cat + '" data-i="' + o.i + '">' +
        '<span class="ll-oculto">' + o.lei.norma + '</span></button>';
    }).join("\n");
    return '        <div class="ll-ano">\n' +
      '          <span class="ll-ano-rot" aria-hidden="true">' + g.ano + '</span>\n' +
      '          <span class="ll-pontos">\n' + pontos + '\n          </span>\n' +
      '        </div>';
  }).join("\n");
}

function htmlPaineis() {
  return LEIS.map(function (lei, i) {
    return '        <article class="ll-lei" role="tabpanel" id="lei-' + i + '" aria-labelledby="aba-' + i + '"' +
      ' data-cat="' + lei.cat + '" data-i="' + i + '"' + (i === 0 ? '' : ' hidden') + '>\n' +
      '          <p class="ll-lei-topo"><b>' + lei.ano + '</b><span>' + lei.norma + '</span></p>\n' +
      '          <p class="ll-lei-txt">' + lei.txt + '</p>\n' +
      '          <span class="etiqueta et-contorno">' + NOMES_CAT[lei.cat] + '</span>\n' +
      '        </article>';
  }).join("\n");
}

/* ------------------------------------------------------------ */
function lerFrente(bruto) {
  const m = bruto.match(/^\s*<!--([\s\S]*?)-->/);
  const dados = {};
  let corpo = bruto;
  if (m) {
    m[1].split("\n").forEach(function (linha) {
      const p = linha.indexOf(":");
      if (p > 0) dados[linha.slice(0, p).trim()] = linha.slice(p + 1).trim();
    });
    corpo = bruto.slice(m[0].length);
  }
  return { dados: dados, corpo: corpo.trim() };
}

function escapar(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

const ESTRUTURADO = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": DOMINIO + "/#website",
      url: DOMINIO + "/",
      name: "Benedito Furtado",
      description: "Site oficial de Benedito Furtado, jornalista, escritor e vereador de Santos.",
      inLanguage: "pt-BR",
      publisher: { "@id": DOMINIO + "/#benedito-furtado" }
    },
    {
      "@type": "Person",
      "@id": DOMINIO + "/#benedito-furtado",
      name: "Benedito Furtado de Andrade",
      alternateName: "Benedito Furtado",
      birthDate: "1950-02-18",
      birthPlace: { "@type": "Place", name: "Sobral, Ceará, Brasil" },
      jobTitle: "Vereador de Santos",
      image: {
        "@type": "ImageObject",
        url: IMAGEM_SOCIAL,
        width: 1200,
        height: 630
      },
      mainEntityOfPage: { "@id": DOMINIO + "/#website" },
      contactPoint: [
        { "@type": "ContactPoint", telephone: "+55 13 99607-2660", contactType: "gabinete", availableLanguage: "pt-BR" },
        { "@type": "ContactPoint", telephone: "+55 13 99111-0050", contactType: "gabinete", availableLanguage: "pt-BR" }
      ],
      description: "Jornalista, escritor e vereador de Santos, autor de 32 leis municipais de proteção e bem-estar animal.",
      url: DOMINIO + "/",
      knowsAbout: ["Políticas públicas", "Proteção animal", "Literatura", "Santos"],
      sameAs: [
        "https://www.instagram.com/vereadorbeneditofurtado/",
        "https://www.facebook.com/vereador.furtado/",
        "https://www.youtube.com/@VERBENEDITOFURTADO"
      ]
    }
  ]
});

/* ------------------------------------------------------------
   VERSÃO DOS ARQUIVOS (quebra de cache)

   O CSS e o JS eram servidos sempre no mesmo endereço. O navegador
   guardava a versão antiga e continuava rodando ela mesmo depois de
   um build novo — e o efeito disso não é "o site está desatualizado",
   é "seções aparecem vazias", porque um app.js velho combinado com um
   HTML novo esconde conteúdo que não sabe revelar. Aconteceu duas
   vezes durante o desenvolvimento.

   Cada build calcula um selo a partir do conteúdo do arquivo. Mudou o
   arquivo, muda o endereço, e o navegador é obrigado a buscar de novo.
   Se nada mudou, o selo é o mesmo e o cache continua valendo.
   ------------------------------------------------------------ */
const crypto = require("crypto");
function selo(caminho) {
  try {
    return crypto.createHash("md5").update(fs.readFileSync(path.join(SAIDA, caminho))).digest("hex").slice(0, 8);
  } catch (e) {
    return String(Date.now());
  }
}

function minificarCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

const CSS_FONTE = path.join(SAIDA, "assets", "css", "estilo.css");
const CSS_PUBLICO = path.join(SAIDA, "assets", "css", "estilo.min.css");
fs.writeFileSync(CSS_PUBLICO, minificarCss(fs.readFileSync(CSS_FONTE, "utf8")), "utf8");

const VERSAO = { css: selo("assets/css/estilo.min.css"), js: selo("assets/js/app.js") };

/* ------------------------------------------------------------ */
const base = fs.readFileSync(path.join(SRC, "base.html"), "utf8");
const arquivos = fs.readdirSync(path.join(SRC, "paginas")).filter(function (f) { return f.endsWith(".html"); });

fs.mkdirSync(SAIDA, { recursive: true });
const geradas = [];

arquivos.forEach(function (arquivo) {
  const { dados, corpo } = lerFrente(fs.readFileSync(path.join(SRC, "paginas", arquivo), "utf8"));
  let conteudo = corpo
    .replace("{{regua}}", function () { return htmlRegua(); })
    .replace("{{paineis}}", function () { return htmlPaineis(); });

  let pagina = base
    .replace(/\{\{titulo\}\}/g, escapar(dados.titulo || "Benedito Furtado"))
    .replace(/\{\{descricao\}\}/g, escapar(dados.descricao || ""))
    .replace(/\{\{dominio\}\}/g, DOMINIO)
    .replace(/\{\{arquivo\}\}/g, arquivo === "index.html" ? "" : arquivo)
    // na landing as âncoras são relativas; nas páginas soltas precisam voltar ao index
    .replace(/\{\{inicio\}\}/g, arquivo === "index.html" ? "" : "index.html")
    .replace("{{estruturado}}", '<script type="application/ld+json">' + ESTRUTURADO + "</script>")
    .replace("{{conteudo}}", function () { return conteudo; })
    // selo de versão: o navegador não tem como servir CSS ou JS antigos
    .replace('href="assets/css/estilo.css"', 'href="assets/css/estilo.min.css?v=' + VERSAO.css + '"')
    .replace('src="assets/js/app.js"', 'src="assets/js/app.js?v=' + VERSAO.js + '"');

  if (dados.robots) {
    pagina = pagina.replace('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">',
      '<meta name="robots" content="' + escapar(dados.robots) + '">');
  }

  // Comentários editoriais ficam nas fontes, mas não precisam atravessar a rede.
  pagina = pagina.replace(/<!--[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n");

  fs.writeFileSync(path.join(SAIDA, arquivo), pagina, "utf8");
  geradas.push(arquivo);
});

/* ---------- favicon: quadrado vermelho com a pincelada ---------- */
const favicon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" rx="6" fill="#E1251B"/>' +
  '<path d="M6 34 C 16 28, 26 38, 36 31 C 44 25, 52 33, 58 28 L 58 40 C 50 45, 42 38, 34 42 C 24 47, 14 41, 6 45 Z" fill="#FFC800"/>' +
  "</svg>";
fs.mkdirSync(path.join(SAIDA, "assets", "img"), { recursive: true });
fs.writeFileSync(path.join(SAIDA, "assets", "img", "favicon.svg"), favicon, "utf8");

/* ---------- robots.txt e sitemap ---------- */
fs.writeFileSync(path.join(SAIDA, "robots.txt"),
  "User-agent: *\nAllow: /\n\nSitemap: " + DOMINIO + "/sitemap.xml\n", "utf8");

const paginasMapa = geradas;
const DATA_BUILD = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(SAIDA, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  paginasMapa.map(function (f) {
    const principal = f === "index.html";
    return "  <url><loc>" + DOMINIO + "/" + (principal ? "" : f) + "</loc><lastmod>" + DATA_BUILD +
      "</lastmod><changefreq>" + (principal ? "weekly" : "yearly") + "</changefreq><priority>" +
      (principal ? "1.0" : "0.3") + "</priority></url>";
  }).join("\n") + "\n</urlset>\n", "utf8");

/* ---------- Hostinger/LiteSpeed: domínio canônico, cache e segurança ---------- */
const htaccess = `Options -Indexes
DirectoryIndex index.html

RewriteEngine On
RewriteCond %{HTTPS} !=on [OR]
RewriteCond %{HTTP_HOST} ^www\\.beneditofurtado\\.com\\.br$ [NC]
RewriteRule ^ https://beneditofurtado.com.br%{REQUEST_URI} [R=301,L]

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set X-Frame-Options "SAMEORIGIN"
  <FilesMatch "\\.(?:html)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  <FilesMatch "\\.(?:css|js)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  <FilesMatch "\\.(?:webp|jpg|svg)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
  <FilesMatch "\\.(?:woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json application/xml image/svg+xml
</IfModule>
`;
fs.writeFileSync(path.join(SAIDA, ".htaccess"), htaccess, "utf8");

/* ------------------------------------------------------------
   CLOUDFLARE PAGES
   O .htaccess acima só vale em servidor Apache (Hostinger). No
   Cloudflare Pages a configuração equivalente vive em dois arquivos
   de texto na raiz do site: _headers e _redirects.

   Os dois são gerados aqui, junto com o build, para não existir
   configuração de produção que dependa de alguém lembrar de copiar
   à mão. Publicar em qualquer um dos dois serviços continua sendo
   só subir a pasta site/.
   ------------------------------------------------------------ */
const headers = [
  "# Gerado por construir.js. Não editar à mão.",
  "",
  "/*",
  "  X-Content-Type-Options: nosniff",
  "  Referrer-Policy: strict-origin-when-cross-origin",
  "  Permissions-Policy: camera=(), microphone=(), geolocation=()",
  "  X-Frame-Options: SAMEORIGIN",
  "",
  "# O HTML é sempre revalidado: é ele que carrega os selos de versão",
  "# do CSS e do JS, então precisa chegar fresco para o resto seguir.",
  "/",
  "  Cache-Control: no-cache",
  "/*.html",
  "  Cache-Control: no-cache",
  "",
  "# CSS e JS levam ?v= no endereço: mudou o arquivo, muda a URL.",
  "# Por isso podem ser guardados por um ano sem risco de versão velha.",
  "/assets/css/*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "/assets/js/*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "/assets/fontes/*",
  "  Cache-Control: public, max-age=31536000, immutable",
  "",
  "# Imagens não têm selo: um mês, para poderem ser trocadas.",
  "/assets/img/*",
  "  Cache-Control: public, max-age=2592000",
  ""
].join("\n");
fs.writeFileSync(path.join(SAIDA, "_headers"), headers, "utf8");

/* www -> apex, em 301. O http -> https fica por conta do próprio
   Cloudflare (opção "Always Use HTTPS"), não deste arquivo. */
const redirects = [
  "# Gerado por construir.js. Não editar à mão.",
  "https://www." + DOMINIO.replace(/^https?:\/\//, "") + "/*  " + DOMINIO + "/:splat  301",
  ""
].join("\n");
fs.writeFileSync(path.join(SAIDA, "_redirects"), redirects, "utf8");

/* ------------------------------------------------------------
   Prévia em arquivo único (para publicar como artefato):
   fontes, CSS e JS embutidos; sem nenhuma requisição externa.
   ------------------------------------------------------------ */
function embutir() {
  let html = fs.readFileSync(path.join(SAIDA, "index.html"), "utf8");

  const css = fs.readFileSync(path.join(SAIDA, "assets/css/estilo.min.css"), "utf8")
    .replace(/@font-face\s*\{[\s\S]*?\}/g, "");                     // as fontes entram como data URI
  const b64 = function (p) { return fs.readFileSync(path.join(SAIDA, p)).toString("base64"); };
  const fontes =
    '@font-face{font-family:"Zilla Slab";src:url(data:font/woff2;base64,' + b64('assets/fontes/zilla.woff2') + ') format("woff2");font-weight:600;font-style:normal;font-display:block}' +
    '@font-face{font-family:"Zilla Slab";src:url(data:font/woff2;base64,' + b64('assets/fontes/zilla700.woff2') + ') format("woff2");font-weight:700;font-style:normal;font-display:block}' +
    '@font-face{font-family:"Zilla Slab";src:url(data:font/woff2;base64,' + b64('assets/fontes/zilla-italico.woff2') + ') format("woff2");font-weight:400;font-style:italic;font-display:block}' +
    '@font-face{font-family:"Manrope";src:url(data:font/woff2;base64,' + b64("assets/fontes/manrope.woff2") +
    ') format("woff2");font-weight:300 800;font-style:normal;font-display:block}';

  const js = [
    fs.readFileSync(path.join(SAIDA, "assets/js/gsap.min.js"), "utf8"),
    fs.readFileSync(path.join(SAIDA, "assets/js/ScrollTrigger.min.js"), "utf8"),
    fs.readFileSync(path.join(SAIDA, "assets/js/app.js"), "utf8")
  ].join("\n;\n");

  // troca as tags externas por conteúdo embutido
  // regex, não string fixa: o href agora carrega o selo de versão
  html = html.replace(/<link rel="stylesheet" href="assets\/css\/estilo\.min\.css[^"]*">/,
    function () { return "<style>" + fontes + css + "</style>"; });
  html = html.replace(/<link rel="preload"[^>]*>\s*/g, "");
  html = html.replace(/<link rel="icon"[^>]*>\s*/g, "");
  html = html.replace(/<script src="assets\/js\/[^"]+"><\/script>\s*/g, "");

  // imagens viram data URI: sem isso o arquivo único ficaria com foto quebrada.
  // Os originais em alta ficam em src/originais/ e as versões servidas saem de lá com
  // ffmpeg -i src/originais/X.png -vf scale=<larg>:-2 -c:v libwebp -quality 84 X.webp
  const TIPO = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml" };
  html = html.replace(/(?<!\/)assets\/img\/([\w.-]+)/g, function (todo, nome) {
    const ext = nome.split(".").pop().toLowerCase();
    if (!TIPO[ext] || !fs.existsSync(path.join(SAIDA, "assets/img", nome))) return todo;
    return "data:" + TIPO[ext] + ";base64," + b64("assets/img/" + nome);
  });
  // função de substituição, não string: o código minificado do GSAP contém "$&",
  // que numa string de substituição seria trocado pelo próprio trecho casado
  html = html.replace("</body>", function () {
    return "<script>" + js + "</scr" + "ipt>\n</body>";
  });

  // a landing inteira cabe no arquivo único; só as três páginas soltas não existem aqui
  html = html.replace(/href="(privacidade|termos)\.html"/g, 'href="#" data-previa-inativo');

  // faixa de aviso da prévia
  const faixaAviso =
    '<div style="background:#141110;color:#fff;font-family:Manrope,system-ui,sans-serif;' +
    'font-size:.78rem;letter-spacing:.01em;padding:10px 24px;text-align:center;line-height:1.5">' +
    '<b style="color:#FFC800">Landing page completa.</b> Todas as seções estão nesta página, ' +
    'navegáveis pelo menu. Fora dela existem só Privacidade e Termos, inativos aqui. ' +
    'Arquivos em <code>c:\\CLIENTES\\BENEDITO\\site\\</code>.</div>';
  html = html.replace("<body>", "<body>\n" + faixaAviso);

  // O artefato é publicado dentro de um esqueleto próprio: entrega só o miolo
  // (title + style + conteúdo do body), sem doctype/html/head/body.
  const titulo = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "Benedito Furtado";
  const estilo = (html.match(/<style>[\s\S]*?<\/style>/) || [""])[0];
  const miolo = (html.match(/<body>([\s\S]*)<\/body>/) || [])[1] || "";

  // o script que marca .js vivia no <head>; sem ele os estados iniciais de
  // animação não valem e o conteúdo pisca antes do GSAP assumir
  const marcaJs =
    "<script>document.documentElement.className+=\" js\";" +
    "setTimeout(function(){if(!window.__bfAnimou){document.documentElement.className=" +
    "document.documentElement.className.replace(\" js\",\"\");}},2500);<\/script>";

  const fragmento =
    "<title>" + titulo + "</title>\n" + marcaJs + "\n" + estilo + "\n" + miolo.trim() + "\n";

  fs.writeFileSync(path.join(RAIZ, "previa-artefato.html"), fragmento, "utf8");
  return Buffer.byteLength(fragmento, "utf8");
}

const tamanho = embutir();

console.log("Páginas geradas: " + geradas.join(", "));
console.log("Leis publicadas: " + LEIS.length);
console.log("Prévia de arquivo único: " + Math.round(tamanho / 1024) + " KB");
