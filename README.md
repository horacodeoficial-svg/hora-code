# HORA CODE — MVP (Next.js App Router)

## O que está neste scaffold
- Next.js 14 (App Router) minimal scaffold
- API routes: create-order, generate-texts, generate-layout, publish (basic)
- lib/openai.js (wrapper)
- lib/generateLayout.js (HTML generator)
- scripts/db.sql (Postgres / Supabase schema)
- worker básico em workers/worker.js

## Como usar (rápido)
1. Instale dependências:
   ```
   npm install
   ```
2. Crie arquivo `.env.local` com as variáveis (veja `.env.example`)
3. Crie as tabelas no Supabase usando `scripts/db.sql`
4. Rodar em dev:
   ```
   npm run dev
   ```
5. Em outro terminal, opcional:
   ```
   npm run worker
   ```

## Deploy
- Suba o repositório no GitHub e conecte ao Vercel (1-click).
- Configure variáveis de ambiente no Vercel.

## Observações
- Este scaffold é um MVP funcional. Ajustes e melhorias serão necessários (auth admin, validações, pagamentos).
