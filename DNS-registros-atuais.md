# DNS de beneditofurtado.com.br — retrato antes da migração

Levantado em 11/08/2026, consultando o DNS público.
Nameservers atuais: `hyperion.dns-parking.com` e `atlas.dns-parking.com` (Hostinger).

---

## Registros de E-MAIL — os que não podem se perder

Se qualquer um destes ficar para trás, o e-mail do gabinete para de funcionar.
A falha não aparece no site: aparece nas mensagens que deixam de chegar.

| Tipo | Nome | Valor | Prioridade |
|---|---|---|---|
| MX | `@` | `mx1.hostinger.com` | 5 |
| MX | `@` | `mx2.hostinger.com` | 10 |
| TXT | `@` | `v=spf1 include:_spf.mail.hostinger.com ~all` | — |
| TXT | `_dmarc` | `v=DMARC1; p=none` | — |
| CNAME | `hostingermail-a._domainkey` | `hostingermail-a.dkim.mail.hostinger.com` | — |
| CNAME | `hostingermail-b._domainkey` | `hostingermail-b.dkim.mail.hostinger.com` | — |
| CNAME | `hostingermail-c._domainkey` | `hostingermail-c.dkim.mail.hostinger.com` | — |
| CNAME | `autodiscover` | `autodiscover.mail.hostinger.com` | — |
| CNAME | `autoconfig` | `autoconfig.mail.hostinger.com` | — |

> **Atenção aos três DKIM.** A importação automática do Cloudflare varre o
> domínio, mas registros em `seletor._domainkey` não são descobríveis por
> varredura: só aparecem se alguém souber o nome do seletor. É o registro que
> mais se perde em migração. Os três já estão listados acima — basta conferir
> se vieram, e recriar à mão os que faltarem.
>
> Sem DKIM o e-mail continua saindo, mas passa a ser assinado como não
> verificado e cai em spam com muito mais frequência. É uma falha silenciosa.

## Registros do SITE — estes sim mudam

| Tipo | Nome | Valor atual | Depois |
|---|---|---|---|
| A | `@` | `2.57.91.91` (Hostinger) | passa a apontar para o Cloudflare Pages |
| CNAME | `www` | `beneditofurtado.com.br` | idem |

## Outros

- **CAA:** nenhum. Qualquer autoridade certificadora pode emitir certificado,
  então o Cloudflare consegue emitir o dele sem ajuste.

---

## Conferir depois da migração

No PowerShell, com o domínio já no Cloudflare:

```powershell
$d="beneditofurtado.com.br"
Resolve-DnsName $d -Type MX | Select NameExchange,Preference
Resolve-DnsName $d -Type TXT | % { $_.Strings }
Resolve-DnsName "_dmarc.$d" -Type TXT | % { $_.Strings }
"a","b","c" | % { Resolve-DnsName "hostingermail-$_._domainkey.$d" | Select Name,NameHost }
```

O resultado tem que bater com a tabela de e-mail acima, registro por registro.

**Depois disso, o teste que vale:** enviar um e-mail de fora para uma conta
do domínio e responder. DNS correto não garante entrega; a mensagem que chega
garante.
