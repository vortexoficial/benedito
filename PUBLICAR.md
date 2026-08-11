# Publicação — GitHub Pages

Repositório: https://github.com/vortexoficial/benedito
Domínio: `https://beneditofurtado.com.br`

---

## Publicar

```
git add -A
git commit -m "o que mudou"
git push
```

Só isso. O GitHub roda o build sozinho (`.github/workflows/publicar.yml`),
gera a pasta `site/` e publica. Leva cerca de um minuto.

O andamento fica em **Actions**, no repositório. Se algo falhar, o passo
falha lá e **o site no ar não é alterado** — a versão anterior continua
servindo.

Não é preciso rodar `node construir.js` antes de commitar: o build acontece
no servidor, a partir do que está no repositório. Rodar localmente serve só
para conferir no navegador antes de subir.

---

## Ligar o domínio

O ponto que importa: **o DNS continua na Hostinger e o e-mail não é tocado.**
O GitHub Pages aceita domínio raiz por registro `A`, então basta trocar para
onde o `A` aponta. Nenhum nameserver muda, nenhum registro de e-mail é
mexido.

### 1. No painel do GitHub

*Settings → Pages*:
- **Source:** GitHub Actions
- **Custom domain:** `beneditofurtado.com.br`
- **Enforce HTTPS:** marcar (só fica disponível depois que o DNS propagar
  e o certificado for emitido; pode levar algumas horas)

### 2. No DNS da Hostinger

**Alterar** o registro `A` de `@`, que hoje aponta para `2.57.91.91`.
São quatro endereços, todos com nome `@`:

| Tipo | Nome | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

**Alterar** o `CNAME` de `www`, que hoje aponta para o próprio domínio:

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `www` | `vortexoficial.github.io` |

### 3. Não tocar em mais nada

Estes continuam exatamente como estão. São eles que mantêm o e-mail vivo:

- `MX` → `mx1.hostinger.com`, `mx2.hostinger.com`
- `TXT` de `@` → `v=spf1 include:_spf.mail.hostinger.com ~all`
- `TXT` de `_dmarc` → `v=DMARC1; p=none`
- `CNAME` de `hostingermail-a._domainkey`, `-b`, `-c`
- `CNAME` de `autodiscover` e `autoconfig`

Lista completa em [DNS-registros-atuais.md](DNS-registros-atuais.md).

### 4. Conferir

Depois da propagação (de minutos a algumas horas):

```powershell
$d="beneditofurtado.com.br"
Resolve-DnsName $d -Type A  | Select IPAddress      # os quatro do GitHub
Resolve-DnsName $d -Type MX | Select NameExchange   # tem que continuar Hostinger
```

E o teste que vale de verdade: **enviar um e-mail de fora para uma conta do
domínio e responder.**

---

## Uma limitação honesta do GitHub Pages

O GitHub Pages **não permite configurar cabeçalhos HTTP**. Isso significa
que os cabeçalhos de segurança que o `_headers` aplicava no Cloudflare
(`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`X-Frame-Options`) não valem aqui. Não há como contornar dentro do GitHub
Pages.

Na prática, para um site institucional estático sem login nem formulário,
o impacto é pequeno: não há sessão para roubar nem dado de usuário
trafegando. Vale saber que a diferença existe, não vale perder o sono.

O cache continua correto por outro caminho: CSS e JS são servidos com
`?v=<hash do conteúdo>` no endereço, então versão nova nunca fica presa
em cache antigo, independentemente do que o servidor diga.

Os arquivos `_headers` e `_redirects` continuam sendo gerados. São inertes
no GitHub Pages, e existem para o caso de o site voltar a um servidor que
os entenda.

---

## Voltar atrás

Em *Actions*, qualquer execução anterior pode ser reexecutada
("Re-run all jobs"), o que republica aquela versão. Para voltar ao código
anterior, `git revert` do commit e push.
