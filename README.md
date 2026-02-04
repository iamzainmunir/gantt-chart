# SprintMind (Gantt Chart)

**SprintMind** is an AI-driven sprint intelligence app for planning and tracking sprints with an interactive Gantt chart, spillover detection, and optional local AI analysis via Ollama.

---

## Summary

SprintMind helps teams manage sprints with:

- **Interactive Gantt timeline** — Drag tasks to reschedule, resize bars to change duration, double-click to edit task names.
- **Workspaces & sprints** — Create workspaces, start new sprints with configurable length (1 or 2 weeks), and set timeline by start date only (end date is auto-calculated).
- **Task management** — Add, edit, delete tasks; set start/end dates; optional links/screenshots; change status (To Do, In Progress, In Review, Done, Blocked); move tasks to another sprint.
- **Spillover detection** — Closed sprints automatically flag tasks that didn’t finish by sprint end (shown in red on the chart).
- **Sprint health** — Score and band (healthy / at risk / critical) based on completion and spillovers.
- **Prev/Next sprint navigation** — Move between sprints in the same workspace; “Start next sprint” when viewing a closed sprint.
- **Optional AI (Ollama)** — Local retrospective and spillover classification using an Ollama model.

Built with **Next.js 14**, **Prisma**, **SQLite**, and **Tailwind CSS**.

---

## Features

| Feature | Description |
|--------|-------------|
| Gantt chart | Timeline view with status-based bar colors, today marker, weekday labels |
| Task CRUD | Add (with start/end, links), edit name (double-click or modal), delete, move to another sprint |
| Sprint length | Workspace setting: 1 week or 2 weeks; new sprints need only a start date |
| Spillover | Tasks past sprint end are detected and styled in red |
| Sprint health | Score and band derived from completion and spillover |
| AI insights | Ollama-powered sprint summary and spillover reasons (optional) |

---

## Tech Stack

- **Next.js 14** (App Router, React Server Components)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + **SQLite** (dev; can switch to PostgreSQL via `DATABASE_URL`)
- **Ollama** (optional, for AI analysis)

---

## Prerequisites

- **Node.js 18.17+**
- **npm**

---

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/iamzainmunir/gantt-chart.git
cd gantt-chart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Copy the example env file and edit if needed:

```bash
cp .env.example .env
```

- **Required:** `DATABASE_URL` (default `file:./dev.db` for SQLite).
- **Optional:** `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `AI_PROVIDER` for AI (see [AI (Ollama)](#ai-ollama)).

### 4. Database setup

Generate the Prisma client, create/update the database schema, and seed demo data:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

This creates a demo workspace, two sprints (one closed with spillover tasks, one active), and sample tasks.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000). Use **View Sprints** to open the sprint list, then open a sprint to see the Gantt chart and metrics.

---

## AI (Ollama)

Sprint analysis and spillover classification use **Ollama** (local LLM). Optional.

1. Install [Ollama](https://ollama.com) and run a model:
   ```bash
   ollama run llama3.2
   ```
2. Keep Ollama running (default: `http://localhost:11434`).
3. In the app, open a sprint and use **AI Insights (Ollama)** → **Analyze sprint**.

**Env (optional):** `OLLAMA_BASE_URL`, `OLLAMA_MODEL` (e.g. `llama3.2`). Set `AI_PROVIDER=off` to disable AI.

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 5000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting only |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB (no migrations) |
| `npm run db:seed` | Seed workspace, sprints, and tasks |
| `npm run db:studio` | Open Prisma Studio |

---

## Pre-commit

Husky runs `lint-staged` (ESLint + Prettier on staged files). Ensure `npm run lint` and `npm run format` pass before committing.

---

## License

Private / unlicensed. Use as per repository owner’s terms.
