# Publicação no Cloudflare Pages

O site está no ar em **https://benedito-furtado.pages.dev**

Projeto: `benedito-furtado` · Conta: `indesignleandro@gmail.com`
Domínio final pretendido: `https://beneditofurtado.com.br`

---

## Publicar uma nova versão

```
node construir.js
npm run deploy
```

Ou, sem o npm:

```
node construir.js
wrangler pages deploy site --project-name=benedito-furtado --branch=main --commit-dirty=true
```

O build precisa rodar antes: é ele que gera `_headers`, `_redirects`, o `sitemap.xml`
e os selos de versão do CSS e do JS.

Cada publicação gera também uma URL de pré-visualização própria
(`https://<id>.benedito-furtado.pages.dev`), que continua acessível depois.
Serve para mostrar uma versão ao cliente sem mexer na que está no ar.

---

## O que vai para o ar

Só a pasta `site/`. Ela é exatamente o site publicado, sem sobras:

- `previa-artefato.html` é gerado na **raiz** do projeto, fora de `site/`.
  São 8 MB com tudo embutido, para apresentação local. Nunca vai para produção.
- `.htaccess` é gerado dentro de `site/`, mas o Cloudflare **ignora arquivos
  que começam com ponto**. Ele fica ali para o caso de o site voltar à Hostinger.
- `originais-nao-publicar/`, `fotos/`, `tools/` e os `.psd`/`.cdr` estão fora de
  `site/` e nunca são enviados.

Hoje são 124 arquivos, 5,5 MB.

---

## Configuração de produção

Gerada pelo `construir.js`, não editar à mão:

**`site/_headers`**
- Cabeçalhos de segurança: `nosniff`, `Referrer-Policy`, `Permissions-Policy`,
  `X-Frame-Options`.
- HTML com `no-cache`: é ele que carrega os selos de versão do CSS e do JS,
  então precisa chegar sempre fresco para o resto acompanhar.
- CSS, JS e fontes com cache de um ano e `immutable`. Isso só é seguro porque
  o endereço deles carrega `?v=<hash do conteúdo>`: mudou o arquivo, muda a URL.
- Imagens com um mês, já que podem ser trocadas sem mudar de nome.

**`site/_redirects`**
- `www` → domínio sem www, em 301.
- O `http` → `https` é feito pelo próprio Cloudflare, na opção
  **Always Use HTTPS**. Ligar no painel depois de conectar o domínio.

---

## Ligar o domínio próprio

**Isto ainda não foi feito, e envolve uma decisão que não é técnica.**

Hoje `beneditofurtado.com.br` aponta para a Hostinger (`A @ → 2.57.91.91`).
Para servir pelo Cloudflare há dois caminhos:

### Caminho A — mover o DNS para o Cloudflare (recomendado pela Cloudflare)

1. Cloudflare → *Add a site* → `beneditofurtado.com.br`.
2. O Cloudflare importa os registros existentes. **Conferir um por um antes de
   confirmar**, com atenção aos de e-mail.
3. Trocar os nameservers no registrador para os que o Cloudflare indicar.
4. Em *Workers & Pages → benedito-furtado → Custom domains*, adicionar o
   domínio e o `www`.

> **O risco está aqui.** Se o domínio tem e-mail (registros `MX`, `SPF`, `DKIM`,
> `DMARC`) e algum não for transferido corretamente, **o e-mail para de
> funcionar** e a falha não aparece no site — aparece nas mensagens que deixam
> de chegar. Antes de trocar os nameservers, exportar a zona atual da Hostinger
> e conferir se todos os registros de e-mail chegaram ao Cloudflare.

### Caminho B — manter o DNS na Hostinger

Adicionar o domínio em *Custom domains* do projeto e criar, na Hostinger, o
`CNAME` que o Cloudflare indicar. O e-mail não é tocado. É o caminho mais
conservador, e o que eu escolheria se o e-mail do gabinete estiver em uso.

Enquanto o domínio não é ligado, o endereço `.pages.dev` funciona normalmente
e pode ser usado para aprovação.

---

## Depois de ligar o domínio

- Ligar **Always Use HTTPS** no painel do Cloudflare.
- Conferir que `https://beneditofurtado.com.br` e o redirecionamento do `www`
  respondem.
- Enviar `https://beneditofurtado.com.br/sitemap.xml` ao Google Search Console.
- Atualizar o cache do link no Facebook Sharing Debugger.
- Verificação de domínio no Meta Business: usar o registro `TXT` que o próprio
  Meta fornece. O valor é exclusivo da conta e não pode ser inventado aqui.
- Meta Pixel: só inserir o ID depois de definir consentimento e finalidade na
  Política de Privacidade.

---

## Voltar atrás

Em *Workers & Pages → benedito-furtado → Deployments*, qualquer publicação
anterior pode ser promovida a produção com um clique. Não é preciso rodar
build nenhum para reverter.
