# SprintMind

AI-driven sprint intelligence. Phase 1: Next.js + Prisma + SQLite + seed + Sprints UI.

## Requirements

- **Node.js 18.17+** (Next.js 14 and Prisma 6 require Node 18+)
- npm

## Setup

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
```

## Run

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000). Use **View Sprints** to see the seeded sprint and tasks.

## AI (Ollama)

Sprint analysis and spillover classification use **Ollama** (local LLM). Optional.

1. Install [Ollama](https://ollama.com) and run a model:
   ```bash
   ollama run llama3.2
   ```
2. Keep Ollama running (default: http://localhost:11434).
3. In the app, open a sprint and use **AI Insights (Ollama)** → **Analyze sprint**.

Env (optional): `OLLAMA_BASE_URL`, `OLLAMA_MODEL` (default `llama3.2`). Set `AI_PROVIDER=off` to disable AI.

## Scripts

- `npm run dev` — start dev server (port 5000)
- `npm run build` / `npm run start` — production
- `npm run lint` — ESLint
- `npm run format` — Prettier (write)
- `npm run format:check` — Prettier (check only)
- `npm run db:generate` — generate Prisma client
- `npm run db:push` — push schema to DB (SQLite)
- `npm run db:seed` — seed workspace, sprint, 7 tasks
- `npm run db:studio` — Prisma Studio

## Phase 1 checklist

- Pre-commit (Husky) runs `lint-staged` (Prettier + ESLint on staged files). Commit only after `npm run lint` and `npm run format` pass.
