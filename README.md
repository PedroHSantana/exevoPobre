# Tibia Bazaar Finder

Ferramenta independente de busca e alertas para o [bazar oficial de personagens do Tibia](https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades) — filtros avançados (nível, skills, charm points, imbuements, quests, boss points, achievement points) e alertas por push/e-mail quando surge um leilão compatível, sem paywall.

Não afiliado à CipSoft GmbH. Todos os dados vêm do bazar público do tibia.com; compras e vendas só acontecem no site/cliente oficial do Tibia.

## Arquitetura

- **Frontend**: React + Vite, lendo a coleção `auctions` do Firestore em tempo real.
- **Scraper**: `src/lib/tibiaClient.js` + `src/lib/tibiaParser.js` (Node + cheerio), roda como função serverless (`api/cron/scrape.js`).
- **Banco**: Firebase Firestore.
- **Notificações**: Firebase Cloud Messaging (push) + Resend (e-mail).
- **Deploy**: Vercel.

## Setup

### 1. Firebase

1. Crie um projeto em https://console.firebase.google.com.
2. Ative o **Firestore** (modo produção) e publique as regras de `firestore.rules` deste repo (`firebase deploy --only firestore:rules`, ou cole manualmente no console).
3. Ative **Cloud Messaging**. Em *Project Settings > Cloud Messaging > Web Push certificates*, gere um par de chaves VAPID.
4. Em *Project Settings > General > Your apps*, crie um app Web e copie as credenciais para o seu `.env` (veja `.env.example`).
5. Em *Project Settings > Service Accounts*, gere uma chave privada nova (JSON). Esse arquivo é usado pelas funções serverless (Admin SDK) — **nunca** commite esse arquivo. Cole o conteúdo inteiro do JSON (em uma linha) na env var `FIREBASE_SERVICE_ACCOUNT_JSON`.

### 2. E-mail (Resend)

1. Crie uma conta grátis em https://resend.com.
2. Gere uma API key e coloque em `RESEND_API_KEY`.
3. Configure um domínio verificado (ou use o domínio de teste do Resend) e ajuste `ALERT_EMAIL_FROM`.

### 3. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha localmente. No Vercel, cadastre as mesmas variáveis em *Project Settings > Environment Variables* (as que começam com `VITE_` também precisam estar disponíveis no build).

### 4. Rodando localmente

```bash
npm install
npm run dev
```

Isso sobe só o frontend (Vite). Para testar as funções serverless (`/api/*`) localmente, use a CLI da Vercel:

```bash
npm install -g vercel
vercel dev
```

Para testar o scraper isoladamente contra o tibia.com real, sem precisar de Firebase:

```bash
npm run scrape:local -- --pages=3
```

### 5. Deploy (Vercel)

```bash
vercel
vercel --prod
```

## Agendamento do scraper (importante para manter tudo de graça)

O plano **Hobby** da Vercel só permite Cron Jobs com execução **1x por dia** — insuficiente para pegar leilões novos rapidamente. O `vercel.json` já inclui um cron diário como rede de segurança, mas para rodar a cada poucos minutos **de graça**, use um gatilho externo apontando pra `https://SEU-DOMINIO/api/cron/scrape` com o header `Authorization: Bearer SEU_CRON_SECRET`:

- **GitHub Actions** (recomendado, grátis): crie um workflow agendado (`schedule: cron`) no seu repositório que faz um `curl` autenticado nesse endpoint a cada 5 minutos.
- **cron-job.org**: serviço gratuito de cron externo, só configurar a URL + header de autenticação.

Se no futuro você assinar o plano Pro da Vercel, pode simplesmente reduzir o `schedule` em `vercel.json` para `*/5 * * * *` e não vai precisar do gatilho externo.

## Estrutura de dados (Firestore)

- `auctions/{auctionId}` — cache dos leilões, upsert pelo scraper. Leitura pública, escrita só via Admin SDK.
- `savedFilters/{id}` — filtros salvos por usuário (`ownerId` gerado no navegador via `localStorage`), com `pushToken`/`email` opcionais. Acesso só via `/api/alerts` (Admin SDK) — nunca exposto ao client diretamente.
- `savedFilters/{id}/notifiedAuctions/{auctionId}` — dedupe de notificações já enviadas.
- `scrapeState/cursor` — cursor de paginação do scraper (para varrer todo o catálogo aos poucos, a cada execução).
