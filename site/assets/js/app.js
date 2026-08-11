/* ============================================================
   Benedito Furtado — comportamento e animações
   Dependências: gsap.min.js + ScrollTrigger.min.js (locais, sem CDN)
   ============================================================ */
(function () {
  "use strict";

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temGsap = typeof window.gsap !== "undefined";
  if (temGsap && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    // As mídias têm dimensões reservadas no HTML; evitar a segunda medição
    // completa no evento load reduz trabalho sem mudar os gatilhos visuais.
    ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,resize" });
  }

  function pronto(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* =========================================================
     CABEÇALHO — compacta ao rolar
     ========================================================= */
  function cabecalho() {
    var topo = document.querySelector(".topo");
    if (!topo) return;
    var ultimo = -1;
    function medir() {
      var compacto = window.scrollY > 24;
      if (compacto !== ultimo) {
        topo.classList.toggle("compacto", compacto);
        ultimo = compacto;
      }
    }
    medir();
    window.addEventListener("scroll", medir, { passive: true });
  }

  /* =========================================================
     MENU MOBILE
     ========================================================= */
  function menuMobile() {
    var abrir = document.querySelector(".abrir-menu");
    var gaveta = document.querySelector(".gaveta");
    if (!abrir || !gaveta) return;
    var fechar = gaveta.querySelector(".fechar-menu");
    var links = gaveta.querySelectorAll("a");
    var focoAnterior = null;

    function alternar(estado) {
      gaveta.classList.toggle("aberta", estado);
      abrir.setAttribute("aria-expanded", String(estado));
      gaveta.setAttribute("aria-hidden", String(!estado));
      document.body.style.overflow = estado ? "hidden" : "";
      if (estado) {
        focoAnterior = document.activeElement;
        if (fechar) fechar.focus();
        if (temGsap && !reduzido) {
          gsap.fromTo(links,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: .38, stagger: .05, ease: "power2.out", delay: .12 });
        }
      } else if (focoAnterior) {
        focoAnterior.focus();
      }
    }

    abrir.addEventListener("click", function () { alternar(!gaveta.classList.contains("aberta")); });
    if (fechar) fechar.addEventListener("click", function () { alternar(false); });
    links.forEach(function (a) { a.addEventListener("click", function () { alternar(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && gaveta.classList.contains("aberta")) alternar(false);
    });
  }

  /* =========================================================
     ANIMAÇÕES
     A pincelada é o gesto da marca — é ela que "pinta" na entrada.
     Tudo o mais é um deslocamento curto. Nada de paralaxe pesada.
     ========================================================= */
  function animacoes() {
    /* O aviso à trava do <head> ficava AQUI, na primeira linha. Isso
       era um erro grave: se qualquer coisa mais abaixo lançasse
       exceção, a trava já estava desarmada e os .anim que ainda não
       tinham sido registrados ficavam em opacity:0 para sempre — o
       bloco aparecia com a cor certa e sem nenhum conteúdo dentro.
       Agora ele só é dado no fim, quando tudo deu certo. */

    if (!temGsap || reduzido) {
      document.querySelectorAll(".anim").forEach(function (el) { el.style.opacity = 1; });
      document.querySelectorAll(".anim-grifo svg").forEach(function (el) { el.style.transform = "scaleX(1)"; });
      window.__bfAnimou = true;
      return;
    }

    // marca quem realmente entrou numa animação; a rede no fim revela o resto
    function registrar(itens) {
      Array.prototype.forEach.call(itens, function (el) { el.__bfRegistrado = true; });
    }

    var movel = window.matchMedia("(max-width: 760px)").matches;
    var desloca = movel ? 18 : 34;
    // curva longa e macia: o movimento desacelera bastante no fim
    var suave = "power3.out";
    var traco = "power2.inOut";

    /* --- entrada do herói, em sequência --- */
    var heroi = document.querySelector("[data-heroi]");
    if (heroi) {
      var alvos = heroi.querySelectorAll(".anim");
      var grifo = heroi.querySelector(".anim-grifo svg");
      // marcados por atributo, não por classe: assim o layout do herói
      // pode mudar sem que a animação pare de achar seus alvos
      var arco = heroi.querySelector("[data-abre]");
      var selo = heroi.querySelector("[data-selo]");
      var linha = gsap.timeline({ defaults: { ease: suave } });

      linha.fromTo(alvos,
        { y: desloca, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: .11 });
      registrar(alvos);

      // o arco se abre por baixo enquanto o texto sobe
      if (arco) {
        linha.fromTo(arco,
          { clipPath: "inset(0% 0% 100% 0%)", scale: 1.04 },
          { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.2, ease: "power2.out" }, "-=.95");
      }
      // o traço da marca é o gesto da identidade: entra por último, sozinho
      if (grifo) {
        linha.fromTo(grifo, { scaleX: 0 }, { scaleX: 1, duration: .8, ease: traco }, "-=.85");
      }
      if (selo) {
        linha.fromTo(selo,
          { y: 16, opacity: 0, scale: .96 },
          { y: 0, opacity: 1, scale: 1, duration: .7 }, "-=.4");
      }
    }

    /* --- revelações no scroll ---
       Cada grupo é isolado: um que falhe não pode impedir os de baixo
       de serem registrados. São nove seções dependendo deste laço. */
    var grupos = document.querySelectorAll("[data-revela]");
    grupos.forEach(function (grupo) {
      var itens = grupo.querySelectorAll(".anim");
      if (!itens.length) return;
      try {
        gsap.fromTo(itens,
          { y: desloca, opacity: 0 },
          {
            y: 0, opacity: 1, duration: .9, stagger: .08, ease: suave,
            scrollTrigger: { trigger: grupo, start: "top 84%", once: true }
          });
        registrar(itens);
      } catch (erro) {
        console.error("[Furtado] grupo de revelação falhou:", grupo, erro);
      }
    });

    /* --- traços que se desenham ao entrar na tela --- */
    document.querySelectorAll(".anim-grifo").forEach(function (el) {
      if (heroi && heroi.contains(el)) return;
      var svg = el.querySelector("svg");
      if (!svg) return;
      try {
        gsap.fromTo(svg,
          { scaleX: 0 },
          {
            scaleX: 1, duration: .75, ease: traco,
            scrollTrigger: { trigger: el, start: "top 82%", once: true }
          });
      } catch (erro) {
        svg.style.transform = "scaleX(1)";
      }
    });

    /* --- rede de segurança ---
       Antes ela perguntava pela ESTRUTURA: "está dentro de um
       [data-revela]?". A pergunta errada — um elemento pode estar no
       grupo certo e mesmo assim nunca ter sido animado, se a criação
       do tween falhou. Aí ele fica em opacity:0 e o conteúdo some.

       Agora a pergunta é sobre o FATO: "este elemento entrou mesmo em
       alguma animação?". Quem não entrou, aparece. */
    document.querySelectorAll(".anim").forEach(function (el) {
      if (!el.__bfRegistrado) {
        el.style.opacity = 1;
        el.style.transform = "none";
        console.warn("[Furtado] .anim sem animação registrada — revelado sem transição:", el);
      }
    });

    /* --- contadores --- */
    document.querySelectorAll("[data-contar]").forEach(function (el) {
      var alvo = parseFloat(el.getAttribute("data-contar"));
      var sufixo = el.getAttribute("data-sufixo") || "";
      var obj = { v: 0 };
      gsap.to(obj, {
        v: alvo, duration: 1.25, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: function () { el.textContent = Math.round(obj.v) + sufixo; }
      });
    });

    // só agora: tudo montado, a trava do <head> pode ser desarmada
    window.__bfAnimou = true;
  }

  /* =========================================================
     VIGIA DAS REVELAÇÕES

     Rede final, independente de tudo o que veio antes.

     O sistema de revelação esconde o conteúdo (opacity: 0) e conta
     com um gatilho para trazê-lo de volta. Isso falha fechado: se o
     gatilho não dispara, por qualquer motivo, a seção fica com a cor
     de fundo certa e nada dentro. Já aconteceu três vezes neste
     projeto, por três causas diferentes: erro interno do
     ScrollTrigger, medida de posição errada e JS antigo em cache.

     Este vigia não tenta descobrir a causa. Ele olha o que está na
     tela: se um elemento deveria estar visível, ninguém o está
     animando e ele continua escondido por três verificações
     seguidas, o vigia revela. A margem de três ciclos existe para
     não atropelar a animação normal, que dispara na primeira.
     ========================================================= */
  function vigiaRevelacoes() {
    if (!temGsap || reduzido) return;
    var pendentes = Array.prototype.slice.call(document.querySelectorAll(".anim"));
    if (!pendentes.length) return;
    var agendado = false;

    function checar() {
      agendado = false;
      for (var i = pendentes.length - 1; i >= 0; i--) {
        var el = pendentes[i];
        if (parseFloat(getComputedStyle(el).opacity) >= 0.9) { pendentes.splice(i, 1); continue; }

        var r = el.getBoundingClientRect();
        var naTela = r.top < window.innerHeight * 0.92 && r.bottom > 0;
        if (!naTela || gsap.isTweening(el)) { el.__bfEspera = 0; continue; }

        el.__bfEspera = (el.__bfEspera || 0) + 1;
        if (el.__bfEspera >= 3) {
          gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
          pendentes.splice(i, 1);
          console.warn("[Furtado] revelacao resgatada pelo vigia:", el);
        }
      }
      if (!pendentes.length) {
        window.removeEventListener("scroll", pedir);
        window.removeEventListener("resize", pedir);
      }
    }
    function pedir() {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(checar);
    }

    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir, { passive: true });
    // algumas passadas logo no início, para o caso de a página abrir já rolada
    var n = 0;
    var relogio = setInterval(function () {
      checar();
      if (++n > 8 || !pendentes.length) clearInterval(relogio);
    }, 400);
  }

  /* =========================================================
     SOBRE — A TRAVESSIA
     Timeline própria em vez do fade genérico do [data-revela]:
     as linhas do título sobem em cascata, a pincelada risca a
     palavra, o texto entra atrás e os ícones da ficha estouram
     por último.

     Os elementos NÃO usam a classe .anim: aqui o estado inicial
     vem do fromTo do GSAP, que aplica os valores de partida na
     hora em que a timeline é montada. Sem GSAP, ou com movimento
     reduzido, nada fica escondido — a seção simplesmente aparece.
     ========================================================= */
  function travessia() {
    var bloco = document.querySelector("[data-travessia]");
    if (!bloco || !temGsap || reduzido) return;

    function alvos(sel) { return bloco.querySelectorAll(sel); }

    gsap.timeline({ scrollTrigger: { trigger: bloco, start: "top 76%", once: true } })
      .fromTo(alvos("[data-tv-linha]"),
        { y: 42, opacity: 0 },
        { y: 0, opacity: 1, duration: .9, stagger: .09, ease: "power3.out" })
      .fromTo(alvos("[data-tv-traco]"),
        { scaleX: 0 },
        { scaleX: 1, duration: .7, ease: "power2.inOut" }, "-=.35")
      .fromTo(alvos("[data-tv-texto]"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: .8, stagger: .1, ease: "power3.out" }, "-=.55")
      .fromTo(alvos("[data-tv-cartao]"),
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, duration: .7, stagger: .1, ease: "power3.out" }, "-=.5")
      .fromTo(alvos("[data-tv-icone]"),
        { scale: 0, rotate: -30 },
        { scale: 1, rotate: 0, duration: .55, stagger: .1, ease: "back.out(2.2)" }, "-=.55");
  }

  /* =========================================================
     ATUAÇÃO — as duas faixas
     Cada trilho traz a lista duplicada; deslocar 50% e reiniciar dá
     o laço contínuo sem emenda. A segunda faixa parte de -50% e vai
     a 0, que é o que a faz correr para o outro lado.

     A referência (site da Delegada Raquel) faz isso com keyframes
     de CSS. Aqui é GSAP para poder pausar no hover sem depender de
     animation-play-state, e para o resto da página continuar com um
     motor de animação só.
     ========================================================= */
  function eixos() {
    var secao = document.querySelector("[data-eixos]");
    if (!secao || !temGsap || reduzido) return;

    secao.querySelectorAll("[data-faixa]").forEach(function (trilho, i) {
      var volta = i % 2 === 1;

      /* O HTML traz um conjunto só. Quantas cópias o laço precisa
         depende da tela: a faixa sangra de ponta a ponta, então um
         número fixo de cópias abriria buracos num monitor largo.
         Aqui a conta é feita na hora — o suficiente para cobrir duas
         telas, que é o que garante que nunca se veja o fim da fila.

         Com N conjuntos idênticos, deslocar 100/N por cento move
         exatamente um conjunto: o laço fecha invisível, e a
         velocidade não muda quando o número de cópias muda. */
      var conjunto = Array.prototype.slice.call(trilho.children);
      var largura = trilho.scrollWidth;
      var copias = Math.max(2, Math.ceil((window.innerWidth * 2) / largura) + 1);

      for (var c = 1; c < copias; c++) {
        conjunto.forEach(function (cartao) {
          var copia = cartao.cloneNode(true);
          copia.setAttribute("aria-hidden", "true");   // o leitor de tela lê o conjunto uma vez só
          trilho.appendChild(copia);
        });
      }

      var passo = 100 / copias;
      var laco = gsap.fromTo(trilho,
        { xPercent: volta ? -passo : 0 },
        {
          // 40s davam 22px/s: mexe, mas num relance parece parado
          xPercent: volta ? 0 : -passo,
          duration: volta ? 26 : 22, ease: "none", repeat: -1
        });

      // parar sob o cursor: quem quer ler um cartão precisa que ele fique parado
      var faixa = trilho.parentNode;
      faixa.addEventListener("mouseenter", function () { laco.pause(); });
      faixa.addEventListener("mouseleave", function () { laco.play(); });
    });
  }

  /* =========================================================
     PRINCÍPIOS
     Quatro camadas, todas em ScrollTrigger:

     1) A foto abre de baixo para cima com um corte animado, e por
        dentro a imagem assenta de 1.12 para 1 — quem abre é a
        moldura, quem acomoda é a foto.
     2) Parallax preso à rolagem: a imagem desliza devagar dentro
        do quadro enquanto a seção atravessa a tela.
     3) Cabeçalho e itens entram em cascata.
     4) Cada princípio acende ao cruzar o meio da tela e apaga ao
        sair: o fio de cima se desenha em vermelho e o número
        cresce. É o que dá sentido à foto presa ao lado.
     ========================================================= */
  function principios() {
    var secao = document.querySelector("[data-principios]");
    if (!secao || !temGsap || reduzido) return;

    var campo = secao.querySelector("[data-pr-campo]");
    var lista = secao.querySelector(".pr-lista");
    var itens = secao.querySelectorAll("[data-pr-item]");

    /* Só o corte de entrada, que termina aberto por inteiro.
       O parallax saiu: deslizar a imagem dentro do quadro é, por
       definição, mostrar uma parte e esconder outra — e a foto não
       pode ser obstruída em lado nenhum. O mesmo vale para o
       scale de entrada, que faria a imagem transbordar o quadro. */
    var foto = campo && campo.querySelector("img");

    /* A foto sobe e cresce presa à rolagem: no celular, onde ela
       ocupa a tela inteira, o movimento acompanha o dedo em vez de
       tocar e acabar.

       Aqui a posição é lida do próprio elemento a cada quadro, sem
       ScrollTrigger. Não é preciosismo: o scrub do ScrollTrigger
       quebrava esta seção inteira quando a página era recarregada
       já rolada ("Cannot read properties of undefined (reading
       'pin')"), e o erro derrubava tudo o que vinha depois no
       arranque. Medir ao vivo custa quase nada e não tem estado
       para dessincronizar.

       Escala só para baixo, nunca acima de 1: crescer além do
       quadro cortaria a foto, e ela não pode ser obstruída. */
    if (foto) {
      var agendado = false;

      /* um gsap.set só, com as duas propriedades juntas: dois
         quickSetter separados no mesmo elemento disputam o cache de
         transform e um deles não chega a ser escrito */
      function assenta() {
        agendado = false;
        var r = campo.getBoundingClientRect();
        var curso = window.innerHeight * .65;          // da base da tela até 35% dela
        var p = (window.innerHeight - r.top) / curso;
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        gsap.set(foto, { y: 40 * (1 - p), scale: .92 + .08 * p });
      }
      function pedir() {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(assenta);
      }

      assenta();                                        // acerta já na carga
      window.addEventListener("scroll", pedir, { passive: true });
      window.addEventListener("resize", pedir, { passive: true });
    }

    gsap.fromTo(secao.querySelectorAll("[data-pr-cabeca]"),
      { y: 34, opacity: 0 },
      {
        y: 0, opacity: 1, duration: .9, stagger: .1, ease: "power3.out",
        scrollTrigger: { trigger: secao, start: "top 72%", once: true }
      });

    if (itens.length) {
      gsap.fromTo(itens,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: .8, stagger: .12, ease: "power3.out",
          scrollTrigger: { trigger: lista || secao, start: "top 80%", once: true },
          onComplete: function () {
            // o GSAP deixa opacity inline, que venceria o .viva do CSS
            gsap.set(itens, { clearProps: "opacity" });
            if (lista) lista.classList.add("viva");
          }
        });

      itens.forEach(function (item) {
        ScrollTrigger.create({
          trigger: item, start: "top 64%", end: "bottom 46%",
          onToggle: function (self) { item.classList.toggle("ativo", self.isActive); }
        });
      });
    }
  }

  /* =========================================================
     LINHA DO TEMPO
     Duas camadas de animação.

     1) O trilho: única coisa da página amarrada à rolagem
        (scrub). Ele se preenche de vermelho de cima para baixo
        conforme a seção atravessa a tela, então a linha do tempo
        literalmente se desenha enquanto é lida.

     2) Cada capítulo, disparado quando chega: o ponto estoura no
        trilho, o ano e o rótulo entram pela esquerda — no sentido
        em que a linha é lida — e o texto sobe atrás.
     ========================================================= */
  function linhaDoTempo() {
    var secao = document.querySelector("[data-linha-tempo]");
    if (!secao || !temGsap || reduzido) return;

    var trilho = secao.querySelector("[data-lt-preenche]");
    if (trilho) {
      gsap.fromTo(trilho, { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: secao, start: "top 65%", end: "bottom 80%", scrub: .5 }
      });
    }

    secao.querySelectorAll("[data-lt-item]").forEach(function (item) {
      gsap.timeline({ scrollTrigger: { trigger: item, start: "top 80%", once: true } })
        .fromTo(item.querySelectorAll("[data-lt-ponto]"),
          { scale: 0 },
          { scale: 1, duration: .5, ease: "back.out(3)" })
        .fromTo(item.querySelectorAll("[data-lt-marca]"),
          { x: -28, opacity: 0 },
          { x: 0, opacity: 1, duration: .7, stagger: .08, ease: "power3.out" }, "-=.3")
        .fromTo(item.querySelectorAll("[data-lt-texto]"),
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: .75, stagger: .12, ease: "power3.out" }, "-=.5");
    });
  }

  /* =========================================================
     NAVEGAÇÃO DA LANDING — marca no menu a seção que está na tela
     ========================================================= */
  function secaoAtiva() {
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-sec]"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var secoes = [];
    links.forEach(function (a) {
      var id = a.getAttribute("data-sec");
      var alvo = document.getElementById(id);
      if (alvo && secoes.indexOf(alvo) === -1) secoes.push(alvo);
    });
    if (!secoes.length) return;   // páginas soltas não têm as seções

    function marcar(id) {
      links.forEach(function (a) {
        a.setAttribute("aria-current", a.getAttribute("data-sec") === id ? "page" : "false");
      });
    }

    var visiveis = {};
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { visiveis[e.target.id] = e.isIntersecting; });
      // a primeira seção visível na ordem da página é a que manda
      for (var i = 0; i < secoes.length; i++) {
        if (visiveis[secoes[i].id]) { marcar(secoes[i].id); return; }
      }
    }, { rootMargin: "-45% 0px -50% 0px" });

    secoes.forEach(function (s) { observador.observe(s); });
    marcar("inicio");
  }

  /* =========================================================
     FILTRO DA LINHA DO TEMPO DAS LEIS
     ========================================================= */
/* =========================================================
     LINHA DO TEMPO DAS LEIS
     Régua de anos + painel. A régua navega, o painel mostra.

     Três coisas se movem, todas em GSAP:
     1) a troca de lei — a que sai desce e some, a que entra sobe;
     2) os pontos da régua, que crescem ao serem escolhidos;
     3) o filtro por categoria, que apaga os pontos de fora em
        cascata, da esquerda para a direita, como uma varredura.

     Sem GSAP nada disso impede o uso: a troca acontece seca.
     ========================================================= */
  function leis() {
    var secao = document.querySelector("[data-leis]");
    if (!secao) return;

    var pontos = Array.prototype.slice.call(secao.querySelectorAll(".ll-ponto"));
    var paineis = Array.prototype.slice.call(secao.querySelectorAll(".ll-lei"));
    var botoes = Array.prototype.slice.call(secao.querySelectorAll("[data-filtro]"));
    var setas = Array.prototype.slice.call(secao.querySelectorAll("[data-passo]"));
    var conta = secao.querySelector("[data-atual]");
    var total = secao.querySelector("[data-total]");
    var vazio = secao.querySelector(".leis-vazio");
    if (!pontos.length || !paineis.length) return;

    var regua = secao.querySelector(".ll-regua");
    var atual = 0;
    var filtro = "todas";
    var anima = temGsap && !reduzido;

    /* No celular a régua rola na horizontal e mostra uns oito anos de
       cada vez. Sem isto, apertar "próxima" abriria uma lei cujo ponto
       está fora da tela — o painel mudaria sem nada indicar de onde. */
    function trazerAVista(p) {
      if (!regua || regua.scrollWidth <= regua.clientWidth) return;
      var r = regua.getBoundingClientRect(), b = p.getBoundingClientRect();
      var alvo = regua.scrollLeft + (b.left - r.left) - r.width / 2 + b.width / 2;
      alvo = Math.max(0, Math.min(alvo, regua.scrollWidth - regua.clientWidth));
      if (!anima) { regua.scrollLeft = alvo; return; }
      // tween num objeto avulso: scrollLeft não é propriedade de CSS,
      // e o plugin de rolagem do GSAP não está carregado neste projeto
      var estado = { x: regua.scrollLeft };
      gsap.to(estado, {
        x: alvo, duration: .4, ease: "power2.out", overwrite: true,
        onUpdate: function () { regua.scrollLeft = estado.x; }
      });
    }

    function visiveis() {
      return pontos.filter(function (p) {
        return filtro === "todas" || p.getAttribute("data-cat") === filtro;
      });
    }

    function mostrar(i, mover) {
      var antes = paineis[atual];
      var depois = paineis[i];
      if (!depois) return;

      pontos.forEach(function (p, k) {
        p.setAttribute("aria-selected", String(k === i));
        p.setAttribute("tabindex", k === i ? "0" : "-1");
      });

      if (antes !== depois) {
        if (anima) {
          // a que sai desce, a que entra sobe: o sentido conta a direção da troca
          gsap.to(antes, {
            y: 8, opacity: 0, duration: .18, ease: "power2.in",
            onComplete: function () {
              antes.hidden = true;
              depois.hidden = false;
              gsap.fromTo(depois,
                { y: -8, opacity: 0 },
                { y: 0, opacity: 1, duration: .32, ease: "power3.out", clearProps: "transform" });
            }
          });
        } else {
          antes.hidden = true;
          depois.hidden = false;
        }
      }

      atual = i;
      var lista = visiveis();
      var pos = lista.indexOf(pontos[i]);
      if (conta) conta.textContent = pos + 1;
      if (total) total.textContent = lista.length;
      setas.forEach(function (s) {
        var d = parseInt(s.getAttribute("data-passo"), 10);
        s.disabled = (d < 0 && pos <= 0) || (d > 0 && pos >= lista.length - 1);
      });
      trazerAVista(pontos[i]);
      if (mover) pontos[i].focus();
    }

    function passo(d) {
      var lista = visiveis();
      var pos = lista.indexOf(pontos[atual]) + d;
      if (pos < 0 || pos >= lista.length) return;
      mostrar(pontos.indexOf(lista[pos]), false);
    }

    pontos.forEach(function (p, i) {
      p.addEventListener("click", function () { mostrar(i, false); });
      p.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var lista = visiveis();
        var pos = lista.indexOf(p) + d;
        if (pos < 0 || pos >= lista.length) return;
        mostrar(pontos.indexOf(lista[pos]), true);
      });
    });

    setas.forEach(function (s) {
      s.addEventListener("click", function () { passo(parseInt(s.getAttribute("data-passo"), 10)); });
    });

    botoes.forEach(function (b) {
      b.addEventListener("click", function () {
        filtro = b.getAttribute("data-filtro");
        botoes.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });

        var fora = pontos.filter(function (p) {
          return filtro !== "todas" && p.getAttribute("data-cat") !== filtro;
        });
        var dentro = visiveis();

        pontos.forEach(function (p) { p.classList.toggle("apagado", fora.indexOf(p) > -1); });
        if (anima) {
          // varredura da esquerda para a direita, na ordem dos anos
          gsap.fromTo(dentro,
            { scaleY: .6, opacity: .3 },
            { scaleY: 1, opacity: 1, duration: .3, stagger: .012, ease: "power2.out", overwrite: true,
              clearProps: "transform,opacity" });
        }

        if (vazio) vazio.hidden = dentro.length > 0;
        // se a lei aberta saiu do filtro, abre a primeira que ficou
        if (dentro.length && dentro.indexOf(pontos[atual]) < 0) {
          mostrar(pontos.indexOf(dentro[0]), false);
        } else {
          mostrar(atual, false);
        }
      });
    });

    /* PAINEL DE FILTRO (celular)
       O painel nasce fechado. Só é escondido por JS: sem script, as
       seis categorias ficam visíveis, que é o estado utilizável. */
    var abrir = secao.querySelector(".filtro-abrir");
    var caixa = secao.querySelector(".filtro-caixa");
    var rotulo = secao.querySelector("[data-filtro-rot]");
    var painelFiltro = secao.querySelector(".filtros");

    function noCelular() { return window.matchMedia("(max-width: 759px)").matches; }
    function fecharFiltro() {
      if (!abrir) return;
      abrir.setAttribute("aria-expanded", "false");
      if (noCelular()) painelFiltro.hidden = true;
    }
    function sincronizarFiltro() {
      if (!painelFiltro) return;
      painelFiltro.hidden = noCelular() && abrir.getAttribute("aria-expanded") !== "true";
    }

    if (abrir && painelFiltro) {
      sincronizarFiltro();
      window.addEventListener("resize", sincronizarFiltro);

      abrir.addEventListener("click", function () {
        var aberto = abrir.getAttribute("aria-expanded") === "true";
        abrir.setAttribute("aria-expanded", String(!aberto));
        painelFiltro.hidden = aberto;
        if (!aberto && anima) {
          gsap.fromTo(painelFiltro.querySelectorAll(".filtro"),
            { y: -6, opacity: 0 },
            { y: 0, opacity: 1, duration: .26, stagger: .035, ease: "power2.out", clearProps: "transform,opacity" });
        }
      });

      document.addEventListener("click", function (e) {
        if (caixa && !caixa.contains(e.target)) fecharFiltro();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") fecharFiltro();
      });
      botoes.forEach(function (b) {
        b.addEventListener("click", function () {
          if (rotulo) rotulo.textContent = b.textContent;
          fecharFiltro();
        });
      });
    }

    mostrar(0, false);
  }

  /* =========================================================
     CARROSSEL 3D DOS LIVROS
     ========================================================= */
  function carrosselLivros() {
    var raiz = document.querySelector("[data-livros-carrossel]");
    if (!raiz) return;
    var palco = raiz.querySelector("[data-livros-palco]");
    var livros = Array.prototype.slice.call(raiz.querySelectorAll("[data-livro]"));
    if (!palco || livros.length < 2) return;

    livros.forEach(function (livro) {
      livro.setAttribute("tabindex", "-1");
      livro.querySelectorAll("img").forEach(function (img) { img.setAttribute("draggable", "false"); });
    });

    if (!temGsap || reduzido) return;

    raiz.classList.add("livros--3d");

    var atual = 0;
    var total = livros.length;
    var pontosCaixa = raiz.querySelector("[data-livros-pontos]");
    var status = raiz.querySelector("[data-livros-status]");
    var pontos = [];
    var deltaX = 0;
    var inicioX = 0;
    var arrastando = false;
    var arrastou = false;

    function titulo(i) {
      var h = livros[i].querySelector(".livro-t");
      return h ? h.textContent.trim() : "Livro " + (i + 1);
    }

    if (pontosCaixa) {
      pontosCaixa.innerHTML = "";
      livros.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "livros-ponto";
        b.setAttribute("aria-label", "Mostrar " + titulo(i));
        b.addEventListener("click", function () { irPara(i); });
        pontosCaixa.appendChild(b);
        pontos.push(b);
      });
    }

    function ciclo(n) {
      return (n % total + total) % total;
    }

    function distancia(i, centro) {
      var d = i - centro;
      if (d > total / 2) d -= total;
      if (d < -total / 2) d += total;
      return d;
    }

    function passoVisual() {
      var w = palco.clientWidth || window.innerWidth;
      return w < 640 ? Math.min(132, w * .34) : Math.min(238, w * .22);
    }

    function atualizarTexto() {
      if (status) status.textContent = (atual + 1) + " de " + total;
      pontos.forEach(function (p, i) { p.setAttribute("aria-current", String(i === atual)); });
      livros.forEach(function (livro, i) {
        var ativo = i === atual;
        livro.setAttribute("aria-current", String(ativo));
        livro.setAttribute("tabindex", ativo ? "0" : "-1");
      });
    }

    function desenhar(extra, rapido) {
      var w = palco.clientWidth || window.innerWidth;
      var movel = w < 640;
      var passo = passoVisual();
      var limite = movel ? 2.15 : 3.15;
      var centro = atual + (extra || 0);

      livros.forEach(function (livro, i) {
        var rel = distancia(i, centro);
        var abs = Math.abs(rel);
        var visivel = abs <= limite;
        var escala = Math.max(movel ? .62 : .58, 1.08 - abs * (movel ? .16 : .13));
        var opacidade = visivel ? Math.max(.12, 1 - abs * (movel ? .28 : .18)) : 0;

        gsap.to(livro, {
          xPercent: -50,
          x: rel * passo,
          y: abs * (movel ? 28 : 20),
          z: -abs * (movel ? 70 : 95),
          rotationY: rel * (movel ? -18 : -24),
          rotationZ: rel * (movel ? -2.2 : -3.2),
          scale: escala,
          opacity: opacidade,
          zIndex: 100 - Math.round(abs * 10),
          pointerEvents: abs < 3.2 ? "auto" : "none",
          duration: rapido ? .12 : .52,
          ease: rapido ? "power2.out" : "power3.out",
          overwrite: true
        });
      });
    }

    function irPara(i) {
      atual = ciclo(i);
      atualizarTexto();
      desenhar(0, false);
    }

    raiz.querySelectorAll("[data-livros-passo]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        irPara(atual + parseInt(botao.getAttribute("data-livros-passo"), 10));
      });
    });

    livros.forEach(function (livro, i) {
      livro.addEventListener("click", function (e) {
        if (arrastou) { e.preventDefault(); return; }
        if (i !== atual) irPara(i);
      });
    });

    palco.addEventListener("pointerdown", function (e) {
      if (e.button && e.button !== 0) return;
      arrastando = true;
      arrastou = false;
      inicioX = e.clientX;
      deltaX = 0;
      palco.classList.add("arrastando");
      try { palco.setPointerCapture(e.pointerId); } catch (erro) {}
    });

    palco.addEventListener("pointermove", function (e) {
      if (!arrastando) return;
      deltaX = e.clientX - inicioX;
      if (Math.abs(deltaX) > 5) arrastou = true;
      var extra = Math.max(-1.2, Math.min(1.2, -deltaX / passoVisual()));
      desenhar(extra, true);
    });

    function soltar(e) {
      if (!arrastando) return;
      arrastando = false;
      palco.classList.remove("arrastando");
      try { palco.releasePointerCapture(e.pointerId); } catch (erro) {}

      var limite = Math.min(92, (palco.clientWidth || window.innerWidth) * .13);
      if (deltaX < -limite) irPara(atual + 1);
      else if (deltaX > limite) irPara(atual - 1);
      else desenhar(0, false);

      setTimeout(function () { arrastou = false; }, 120);
    }

    palco.addEventListener("pointerup", soltar);
    palco.addEventListener("pointercancel", soltar);
    palco.addEventListener("lostpointercapture", function () {
      if (arrastando) {
        arrastando = false;
        palco.classList.remove("arrastando");
        desenhar(0, false);
      }
    });

    raiz.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      irPara(atual + (e.key === "ArrowRight" ? 1 : -1));
      livros[atual].focus();
    });

    window.addEventListener("resize", function () { desenhar(0, true); });

    atualizarTexto();
    desenhar(0, true);
  }

  /* =========================================================
     CARROSSEL DE PUBLICAÇÕES DO INSTAGRAM
     ========================================================= */
  function carrosselInstagram() {
    var raiz = document.querySelector("[data-instagram-carrossel]");
    if (!raiz) return;
    var trilho = raiz.querySelector("[data-instagram-trilho]");
    var posts = Array.prototype.slice.call(raiz.querySelectorAll("[data-instagram-post]"));
    if (!trilho || posts.length < 2) return;

    var atual = 0;
    var total = posts.length;
    var conta = raiz.querySelector("[data-instagram-atual]");
    var totalEl = raiz.querySelector("[data-instagram-total]");
    var pontosCaixa = raiz.querySelector("[data-instagram-pontos]");
    var setas = Array.prototype.slice.call(raiz.querySelectorAll("[data-instagram-passo]"));
    var pontos = [];
    var quadro = 0;
    var tween = null;
    var arrastando = false;
    var arrastou = false;
    var inicioX = 0;
    var inicioScroll = 0;

    posts.forEach(function (post) {
      post.setAttribute("draggable", "false");
      post.querySelectorAll("img").forEach(function (img) { img.setAttribute("draggable", "false"); });
    });

    function titulo(i) {
      var el = posts[i].querySelector(".instagram-conteudo strong");
      return el ? el.textContent.trim() : "Publicação " + (i + 1);
    }

    if (pontosCaixa) {
      pontosCaixa.innerHTML = "";
      posts.forEach(function (_, i) {
        var botao = document.createElement("button");
        botao.type = "button";
        botao.className = "instagram-ponto";
        botao.setAttribute("aria-label", "Mostrar " + titulo(i));
        botao.addEventListener("click", function () { irPara(i, false); });
        pontosCaixa.appendChild(botao);
        pontos.push(botao);
      });
    }

    function limite(n) { return Math.max(0, Math.min(n, total - 1)); }

    function scrollMaximo() { return Math.max(0, trilho.scrollWidth - trilho.clientWidth); }

    function alvoDo(i) {
      var padding = parseFloat(window.getComputedStyle(trilho).paddingLeft) || 0;
      return Math.max(0, Math.min(posts[i].offsetLeft - padding, scrollMaximo()));
    }

    function maisPerto() {
      var escolhido = 0;
      var menor = Infinity;
      posts.forEach(function (_, i) {
        var distancia = Math.abs(alvoDo(i) - trilho.scrollLeft);
        if (distancia < menor) { menor = distancia; escolhido = i; }
      });
      return escolhido;
    }

    function atualizar(i) {
      atual = limite(i);
      if (conta) conta.textContent = atual + 1;
      if (totalEl) totalEl.textContent = total;

      posts.forEach(function (post, k) { post.setAttribute("aria-current", String(k === atual)); });
      pontos.forEach(function (ponto, k) { ponto.setAttribute("aria-current", String(k === atual)); });
      setas.forEach(function (seta) {
        var passo = parseInt(seta.getAttribute("data-instagram-passo"), 10);
        seta.disabled = (passo < 0 && atual === 0) || (passo > 0 && atual === total - 1);
      });
    }

    function irPara(i, focar) {
      i = limite(i);
      var destino = alvoDo(i);
      if (tween) { tween.kill(); tween = null; }

      if (temGsap && !reduzido) {
        var estado = { x: trilho.scrollLeft };
        tween = gsap.to(estado, {
          x: destino, duration: .55, ease: "power3.out", overwrite: true,
          onUpdate: function () { trilho.scrollLeft = estado.x; },
          onComplete: function () { tween = null; atualizar(i); }
        });
      } else {
        trilho.scrollTo({ left: destino, behavior: reduzido ? "auto" : "smooth" });
      }

      atualizar(i);
      if (focar) posts[i].focus({ preventScroll: true });
    }

    setas.forEach(function (seta) {
      seta.addEventListener("click", function () {
        irPara(atual + parseInt(seta.getAttribute("data-instagram-passo"), 10), false);
      });
    });

    trilho.addEventListener("scroll", function () {
      if (quadro) return;
      quadro = window.requestAnimationFrame(function () {
        quadro = 0;
        atualizar(maisPerto());
      });
    }, { passive: true });

    /* O toque usa a rolagem nativa do navegador. O arraste abaixo entra
       só com mouse, para o desktop ter a mesma sensação direta do mobile. */
    trilho.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (tween) { tween.kill(); tween = null; }
      arrastando = true;
      arrastou = false;
      inicioX = e.clientX;
      inicioScroll = trilho.scrollLeft;
    });

    trilho.addEventListener("pointermove", function (e) {
      if (!arrastando) return;
      var delta = e.clientX - inicioX;
      if (Math.abs(delta) > 5 && !arrastou) {
        arrastou = true;
        trilho.classList.add("arrastando");
        try { trilho.setPointerCapture(e.pointerId); } catch (erro) {}
      }
      trilho.scrollLeft = inicioScroll - delta;
      if (arrastou) e.preventDefault();
    });

    function soltar(e) {
      if (!arrastando) return;
      arrastando = false;
      trilho.classList.remove("arrastando");
      try { trilho.releasePointerCapture(e.pointerId); } catch (erro) {}
      irPara(maisPerto(), false);
      setTimeout(function () { arrastou = false; }, 120);
    }

    trilho.addEventListener("pointerup", soltar);
    trilho.addEventListener("pointercancel", soltar);
    trilho.addEventListener("lostpointercapture", function () {
      if (!arrastando) return;
      arrastando = false;
      trilho.classList.remove("arrastando");
      irPara(maisPerto(), false);
    });

    posts.forEach(function (post) {
      post.addEventListener("click", function (e) {
        if (!arrastou) return;
        e.preventDefault();
        e.stopPropagation();
      });
    });

    trilho.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      irPara(atual + (e.key === "ArrowRight" ? 1 : -1), true);
    });

    window.addEventListener("resize", function () { irPara(atual, false); });

    raiz.classList.add("instagram-carrossel--pronto");
    atualizar(0);
  }

  /* =========================================================
     GALERIA DE FOTOS
     ========================================================= */
  function galeriaFotos() {
    var raiz = document.querySelector("[data-galeria]");
    if (!raiz) return;
    var palco = raiz.querySelector("[data-galeria-palco]");
    var trilho = raiz.querySelector("[data-galeria-trilho]");
    var itens = Array.prototype.slice.call(raiz.querySelectorAll("[data-galeria-item]"));
    if (!palco || !trilho || itens.length < 2) return;

    itens.forEach(function (item) {
      item.setAttribute("draggable", "false");
      item.querySelectorAll("img").forEach(function (img) { img.setAttribute("draggable", "false"); });
    });

    if (!temGsap || reduzido) return;

    raiz.classList.add("galeria--gsap");

    var atual = 0;
    var total = itens.length;
    var conta = raiz.querySelector("[data-galeria-atual]");
    var progresso = raiz.querySelector("[data-galeria-progresso]");
    var miniaturasCaixa = raiz.querySelector("[data-galeria-miniaturas]");
    var ampliar = raiz.querySelector("[data-galeria-ampliar]");
    var miniaturas = [];
    var arrastando = false;
    var arrastou = false;
    var inicioX = 0;
    var deltaX = 0;
    var focoAnterior = null;

    var modal = raiz.querySelector("[data-galeria-modal]");
    var modalImg = raiz.querySelector("[data-galeria-modal-img]");
    var modalRotulo = raiz.querySelector("[data-galeria-modal-rotulo]");
    var modalAtual = raiz.querySelector("[data-galeria-modal-atual]");
    var fechar = raiz.querySelector("[data-galeria-fechar]");

    function dois(n) { return String(n).padStart(2, "0"); }
    function ciclo(n) { return (n % total + total) % total; }
    function rotulo(i) { return itens[i].getAttribute("data-rotulo") || "Foto " + (i + 1); }

    function distancia(i, centro) {
      var d = i - centro;
      if (d > total / 2) d -= total;
      if (d < -total / 2) d += total;
      return d;
    }

    function fonteMiniatura(img) {
      var src = img.getAttribute("data-thumb") || img.getAttribute("src") || "";
      return src.replace(/-480\.webp$/, "-160.webp");
    }

    // No modo 3D, só os cinco cartões ao redor do centro precisam
    // começar em tamanho de palco; os demais usam a miniatura até se aproximarem.
    itens.forEach(function (item, i) {
      if (Math.abs(distancia(i, atual)) <= 2) return;
      var img = item.querySelector("img");
      if (img) img.src = fonteMiniatura(img);
    });

    function passoVisual() {
      var w = palco.clientWidth || window.innerWidth;
      return w < 680 ? Math.min(124, w * .31) : Math.min(360, w * .25);
    }

    if (miniaturasCaixa) {
      miniaturasCaixa.innerHTML = "";
      itens.forEach(function (item, i) {
        var original = item.querySelector("img");
        var botao = document.createElement("button");
        var img = document.createElement("img");
        botao.type = "button";
        botao.className = "galeria-miniatura";
        botao.setAttribute("aria-label", "Mostrar foto " + (i + 1) + ": " + rotulo(i));
        img.src = fonteMiniatura(original);
        img.alt = "";
        img.loading = "lazy";
        img.setAttribute("draggable", "false");
        botao.appendChild(img);
        botao.addEventListener("click", function () { irPara(i); });
        miniaturasCaixa.appendChild(botao);
        miniaturas.push(botao);
      });
    }

    function trazerMiniatura() {
      if (!miniaturasCaixa || !miniaturas[atual]) return;
      var mini = miniaturas[atual];
      var alvo = mini.offsetLeft - miniaturasCaixa.clientWidth / 2 + mini.offsetWidth / 2;
      alvo = Math.max(0, Math.min(alvo, miniaturasCaixa.scrollWidth - miniaturasCaixa.clientWidth));
      miniaturasCaixa.scrollTo({ left: alvo, behavior: "smooth" });
    }

    function modalAberto() { return modal && !modal.hidden; }

    var galeriaVisivel = !("IntersectionObserver" in window);

    function carregarVizinhos() {
      if (!galeriaVisivel) return;
      [-2, -1, 0, 1, 2].forEach(function (passo) {
        var img = itens[ciclo(atual + passo)].querySelector("img");
        var display = img && img.getAttribute("data-display");
        if (display && img.getAttribute("src") !== display) img.src = display;
      });
    }

    if (!galeriaVisivel) {
      var observadorGaleria = new IntersectionObserver(function (entradas) {
        if (!entradas.some(function (entrada) { return entrada.isIntersecting; })) return;
        galeriaVisivel = true;
        carregarVizinhos();
        observadorGaleria.disconnect();
      }, { rootMargin: "800px 0px" });
      observadorGaleria.observe(raiz);
    }

    function atualizarModal(animar) {
      if (!modalAberto() || !modalImg) return;
      var img = itens[atual].querySelector("img");
      modalImg.src = img.getAttribute("data-full") || img.currentSrc || img.src;
      modalImg.alt = img.alt;
      if (modalRotulo) modalRotulo.textContent = rotulo(atual);
      if (modalAtual) modalAtual.textContent = dois(atual + 1);
      if (animar) {
        gsap.fromTo(modalImg, { opacity: 0, scale: .985 },
          { opacity: 1, scale: 1, duration: .32, ease: "power2.out", overwrite: true });
      }
    }

    function atualizar() {
      carregarVizinhos();
      if (conta) conta.textContent = dois(atual + 1);
      itens.forEach(function (item, i) {
        var ativo = i === atual;
        item.setAttribute("aria-current", String(ativo));
        item.setAttribute("tabindex", ativo ? "0" : "-1");
      });
      miniaturas.forEach(function (mini, i) { mini.setAttribute("aria-current", String(i === atual)); });
      if (progresso) {
        gsap.to(progresso, {
          scaleX: (atual + 1) / total, duration: .42, ease: "power2.out", overwrite: true
        });
      }
      if (ampliar) ampliar.setAttribute("aria-label", "Ampliar foto " + (atual + 1) + ": " + rotulo(atual));
      trazerMiniatura();
      atualizarModal(true);
    }

    function desenhar(extra, rapido) {
      var w = palco.clientWidth || window.innerWidth;
      var movel = w < 680;
      var centro = atual + (extra || 0);
      var passo = passoVisual();
      var limite = movel ? 1.65 : 2.6;

      itens.forEach(function (item, i) {
        var rel = distancia(i, centro);
        var abs = Math.abs(rel);
        var visivel = abs <= limite;
        gsap.to(item, {
          xPercent: -50,
          x: rel * passo,
          y: abs * (movel ? 18 : 24),
          z: -abs * (movel ? 110 : 170),
          rotationY: rel * (movel ? -8 : -12),
          rotationZ: rel * (movel ? -1 : -1.5),
          scale: Math.max(movel ? .72 : .64, 1 - abs * (movel ? .16 : .13)),
          opacity: visivel ? Math.max(.16, 1 - abs * (movel ? .38 : .27)) : 0,
          zIndex: 100 - Math.round(abs * 10),
          pointerEvents: abs < (movel ? 1.7 : 2.7) ? "auto" : "none",
          duration: rapido ? .12 : .58,
          ease: rapido ? "power2.out" : "power3.out",
          overwrite: true
        });
      });
    }

    function irPara(i) {
      atual = ciclo(i);
      atualizar();
      desenhar(0, false);
    }

    raiz.querySelectorAll("[data-galeria-passo]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        irPara(atual + parseInt(botao.getAttribute("data-galeria-passo"), 10));
      });
    });

    itens.forEach(function (item, i) {
      item.addEventListener("click", function (e) {
        if (arrastou) { e.preventDefault(); return; }
        if (i !== atual) irPara(i);
        else abrirModal();
      });
    });

    palco.addEventListener("pointerdown", function (e) {
      if (e.target.closest("button") || (e.button && e.button !== 0)) return;
      arrastando = true;
      arrastou = false;
      inicioX = e.clientX;
      deltaX = 0;
      palco.classList.add("arrastando");
      try { palco.setPointerCapture(e.pointerId); } catch (erro) {}
    });

    palco.addEventListener("pointermove", function (e) {
      if (!arrastando) return;
      deltaX = e.clientX - inicioX;
      if (Math.abs(deltaX) > 5) arrastou = true;
      var extra = Math.max(-1.2, Math.min(1.2, -deltaX / passoVisual()));
      desenhar(extra, true);
      if (arrastou) e.preventDefault();
    });

    function soltar(e) {
      if (!arrastando) return;
      arrastando = false;
      palco.classList.remove("arrastando");
      try { palco.releasePointerCapture(e.pointerId); } catch (erro) {}

      var limite = Math.min(92, (palco.clientWidth || window.innerWidth) * .12);
      if (deltaX < -limite) irPara(atual + 1);
      else if (deltaX > limite) irPara(atual - 1);
      else desenhar(0, false);

      setTimeout(function () { arrastou = false; }, 120);
    }

    palco.addEventListener("pointerup", soltar);
    palco.addEventListener("pointercancel", soltar);
    palco.addEventListener("lostpointercapture", function () {
      if (!arrastando) return;
      arrastando = false;
      palco.classList.remove("arrastando");
      desenhar(0, false);
    });

    function abrirModal() {
      if (!modal) return;
      focoAnterior = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      atualizarModal(false);
      gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: .24, ease: "power2.out" });
      if (fechar) fechar.focus();
    }

    function concluirFechamento() {
      if (!modal) return;
      modal.hidden = true;
      document.body.style.overflow = "";
      if (focoAnterior && typeof focoAnterior.focus === "function") focoAnterior.focus();
    }

    function fecharModal() {
      if (!modalAberto()) return;
      gsap.to(modal, { opacity: 0, duration: .18, ease: "power2.in", onComplete: concluirFechamento });
    }

    if (ampliar) ampliar.addEventListener("click", abrirModal);
    if (fechar) fechar.addEventListener("click", fecharModal);
    if (modal) {
      modal.addEventListener("click", function (e) { if (e.target === modal) fecharModal(); });
      modal.querySelectorAll("[data-galeria-modal-passo]").forEach(function (botao) {
        botao.addEventListener("click", function () {
          irPara(atual + parseInt(botao.getAttribute("data-galeria-modal-passo"), 10));
        });
      });
    }

    document.addEventListener("keydown", function (e) {
      if (!modalAberto()) return;
      if (e.key === "Escape") { e.preventDefault(); fecharModal(); return; }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        irPara(atual + (e.key === "ArrowRight" ? 1 : -1));
        return;
      }
      if (e.key === "Tab") {
        var focaveis = Array.prototype.slice.call(modal.querySelectorAll("button:not([disabled])"));
        if (!focaveis.length) return;
        var primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
      }
    });

    raiz.addEventListener("keydown", function (e) {
      if (modalAberto() || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      e.preventDefault();
      irPara(atual + (e.key === "ArrowRight" ? 1 : -1));
      itens[atual].focus();
    });

    window.addEventListener("resize", function () { desenhar(0, true); });

    atualizar();
    desenhar(0, true);
  }

  /* =========================================================
     COOKIES (LGPD)
     ========================================================= */
  function cookies() {
    var banner = document.querySelector("[data-cookies]");
    if (!banner) return;
    var chave = "bf-consentimento-cookies";

    var salvo = null;
    try { salvo = localStorage.getItem(chave); } catch (e) { /* modo privado */ }
    if (salvo) return;

    setTimeout(function () {
      banner.classList.add("visivel");
      if (temGsap && !reduzido) {
        gsap.fromTo(banner, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: "power2.out" });
      }
    }, 900);

    banner.querySelectorAll("[data-consentir]").forEach(function (botao) {
      botao.addEventListener("click", function () {
        try { localStorage.setItem(chave, botao.getAttribute("data-consentir")); } catch (e) {}
        if (temGsap && !reduzido) {
          gsap.to(banner, { y: 16, opacity: 0, duration: .3, ease: "power2.in",
            onComplete: function () { banner.classList.remove("visivel"); } });
        } else {
          banner.classList.remove("visivel");
        }
      });
    });
  }

  /* =========================================================
     ANO NO RODAPÉ
     ========================================================= */
  function ano() {
    var alvos = document.querySelectorAll("[data-ano]");
    var atual = new Date().getFullYear();
    alvos.forEach(function (el) { el.textContent = atual; });
  }

  /* Cada passo é isolado do seguinte.

     Antes eram treze chamadas em sequência: bastava uma lançar
     exceção para tudo o que vinha depois nunca rodar. Foi o que
     aconteceu de verdade — um erro interno do ScrollTrigger numa
     animação derrubava, no mesmo golpe, o carrossel, o filtro das
     leis, o menu e o aviso de cookies. Coisas que não têm
     relação nenhuma entre si, quebrando juntas.

     Um efeito visual não pode levar o restante da página embora. */
  pronto(function () {
    [
      cabecalho, menuMobile, animacoes, travessia, linhaDoTempo,
      principios, eixos, carrosselLivros, carrosselInstagram, galeriaFotos, vigiaRevelacoes, secaoAtiva, leis,
      cookies, ano
    ].forEach(function (passo) {
      try {
        passo();
      } catch (erro) {
        console.error("[Furtado] falha em " + (passo.name || "passo") + ":", erro);
      }
    });
  });
})();
