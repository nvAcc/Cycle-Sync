# LUNA - AI Powered Menstrual Health Tracker

LUNA is an intelligent menstrual wellness platform built for privacy and precision. It predicts cycles, provides an empathetic AI chatbot for wellness support, and offers a secure community for shared experiences. The project prioritizes on-device privacy and reproducible, testable models.

## Key Features

- **Intelligent Cycle Tracking:** Predicts fertile windows and upcoming periods.
- **Empathetic AI Companion:** Built-in chatbot for emotional support and general wellness guidance.
- **Privacy-First Architecture:** Sensitive health data is stored locally on the device when possible.
- **Secure Community:** Anonymous, opt-in community features.
- **Health Insights:** Interactive charts and reports for cycle patterns.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, PostgreSQL
- **AI/ML:** TensorFlow.js (client-side models)

---

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or a managed Postgres instance)

## Quickstart (local development)

1. Clone the repository:

```bash
git clone https://github.com/nvAcc/Cycle-Sync.git
cd Cycle-Sync
```

2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and edit values (see `.env.example` for required vars):

```bash
cp .env.example .env
# edit .env and set DATABASE_URL and SESSION_SECRET
```

4. Create the database (if using a local Postgres):

```bash
createdb cycle_sync
# or use psql / pgAdmin to create a database matching DATABASE_URL
```

5. Run database migrations (Drizzle):

```bash
npm run db:push
```

6. Start the app (development):

```bash
# Option A (recommended): start the server which integrates Vite middleware
npm run dev

# Option B: run client and server separately (two terminals)
npm run dev         # server + vite middleware
npm run dev:client  # client-only Vite (port 5000)
```

7. Open http://localhost:5000 (or the port printed in console).

### Notes
- If `DATABASE_URL` is not set, the server falls back to a stubbed DB for fast local dev. Features that require persistence (sessions, saved data) will not work in that mode.
- Use `npm run build` and `npm start` to run the app in production mode.

## .env.example

See `.env.example` (added to this repo) for the common environment variables.

## Troubleshooting

- If `npm run db:push` errors complaining about `DATABASE_URL`, confirm Postgres is running and `.env` is set.
- On Windows, run commands in Git Bash / WSL for the most consistent experience.

## Contributing

Contributions are welcome — please open issues/PRs and follow the commit style in the repo.

## License

Distributed under the MIT License. See `LICENSE` for details.


