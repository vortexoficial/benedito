# Site institucional — Benedito Furtado

Vereador de Santos (SP), 9º mandato. Site institucional e portfólio:
trajetória, as 32 leis municipais de proteção animal, obra literária,
galeria e canais do gabinete.

**Produção:** https://beneditofurtado.com.br
**Pages:** https://benedito-furtado.pages.dev

---

## Como funciona

Site estático, sem framework e sem dependências de runtime. Um script de
build monta as páginas a partir de um template e de um arquivo de conteúdo.

```
src/base.html          template comum (cabeçalho, rodapé, sprite de ícones)
src/paginas/*.html     conteúdo de cada página, com frente-matéria
construir.js           build: monta site/, gera sitemap, headers e redirects
site/                  o site publicado — é isto que vai para o ar
tools/                 scripts de apoio (validação, captura da imagem social)
```

As 32 leis vivem como dados dentro do `construir.js`, não como HTML solto.
A linha do tempo e os painéis são gerados a partir delas.

### Rodar

```
npm run build      monta site/
npm run validar    abre o site no navegador e confere pontos críticos
npm run deploy     build + publicação no Cloudflare Pages
```

O build também gera `previa-artefato.html` na raiz: uma cópia do site num
arquivo único, com fontes, CSS, JS e imagens embutidos. Serve para
apresentação local e **não vai para produção**.

---

## Publicação

`site/` é exatamente o que vai para o ar. Nada precisa ser filtrado na hora
de publicar.

- `site/_headers` e `site/_redirects` — configuração do Cloudflare Pages,
  geradas pelo build.
- `site/.htaccess` — equivalente para servidor Apache. O Cloudflare ignora
  arquivos que começam com ponto, então convive sem conflito.

Detalhes e o passo a passo do domínio em [PUBLICAR-CLOUDFLARE.md](PUBLICAR-CLOUDFLARE.md).
O retrato do DNS antes da migração, com os registros de e-mail que não podem
se perder, está em [DNS-registros-atuais.md](DNS-registros-atuais.md).

---

## Duas decisões que valem conhecer antes de mexer

**Cache.** CSS e JS são servidos com `?v=<hash do conteúdo>` e cache de um
ano. Isso só é seguro porque o endereço muda quando o arquivo muda. Se algum
dia o selo for removido, o cache longo tem que cair junto — senão o
navegador serve versão velha, e o sintoma disso não é "site desatualizado":
é seção aparecendo vazia, porque um JS antigo não sabe revelar o conteúdo
que o CSS novo escondeu.

**Animações.** As revelações escondem o conteúdo (`opacity: 0`) e contam com
um gatilho para trazê-lo de volta — ou seja, falham fechado. Por isso existem
três redes de proteção no `app.js`: cada inicialização isolada em `try/catch`,
um registro de quem realmente entrou em animação, e um vigia que revela o que
estiver na tela e escondido sem ninguém animando. Ao mexer ali, manter as três.

---

## Conteúdo

O texto aprovado está em [COPY.md](COPY.md), que descreve seção por seção o
que o site diz e por quê. A regra editorial do projeto é que **nada é
inventado**: número, data e norma só entram com fonte no material do
gabinete. Onde falta material, o site diz que falta em vez de preencher.
