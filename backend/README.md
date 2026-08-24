# KAMSpace Backend

Backend foundation for KAMSpace.

Stack:

- Node.js
- Fastify
- PostgreSQL
- Prisma

## Local Setup

1. Install dependencies:

```powershell
npm install
```

2. Copy env example:

```powershell
Copy-Item .env.example .env
```

3. Set `DATABASE_URL` in `.env`.

For a local PostgreSQL database:

```text
postgresql://kamspace:kamspace@localhost:5432/kamspace?schema=public
```

Supabase or another hosted PostgreSQL URL will also work.

If Docker is available, the included `compose.yaml` can start local PostgreSQL:

```powershell
docker compose up -d
```

4. Create tables and generate Prisma Client:

```powershell
npm run db:migrate
```

5. Seed demo data:

```powershell
npm run db:seed
```

6. Start API:

```powershell
npm run dev
```

Default API URL:

```text
http://localhost:4000
```

## Demo Context

Until auth is implemented, routes use a demo space and user:

- `DEFAULT_SPACE_ID=demo-space`
- `DEFAULT_USER_ID=demo-alex`

You can override them per request:

```text
x-space-id: demo-space
x-user-id: demo-nastya
```

## First API

- `GET /health`
- `GET /api/today?date=2026-08-24`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id/complete`
- `GET /api/calendar?from=2026-08-24&to=2026-08-31`
- `GET /api/menu`
- `POST /api/menu/dishes`
- `POST /api/menu/plans`
- `GET /api/shopping?scope=today&date=2026-08-24`
- `POST /api/shopping`
- `PATCH /api/shopping/:id/complete`
- `GET /api/people`
- `POST /api/people`
- `GET /api/stats`

## Notes

The frontend still uses `app/src/data/mock-data.js`. The next step is to add a small API client on the frontend and progressively replace mock data with backend responses.
