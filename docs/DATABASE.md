# THÉSOROS — Database (Prisma 7 + Neon)

## Architecture

```
Next.js app  →  PrismaClient  →  @prisma/adapter-pg  →  Neon (pooled URL)
Prisma CLI   →  prisma.config.ts (DIRECT_URL)        →  Neon (direct URL)
```

- **Runtime** uses the **pooled** Neon connection (`DATABASE_URL`, hostname with `-pooler`).
- **CLI** (`db push`, migrate, studio) uses the **direct** connection (`DIRECT_URL`) so schema operations are not blocked by PgBouncer.

## Setup

1. Create a Neon project and copy both connection strings from **Connect**.

2. Configure env:

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and DIRECT_URL
```

3. Install & generate client:

```bash
npm install
npx prisma generate
```

4. Push schema to Neon:

```bash
npx prisma db push
```

5. Seed admin + plans + crypto:

```bash
npm run db:seed
```

6. Test connection:

```bash
npm run db:test
# or
curl http://localhost:3000/api/health
```

## Key files

| File | Role |
|------|------|
| `prisma/schema.prisma` | Models & enums (source of truth) |
| `prisma.config.ts` | Prisma 7 CLI datasource (`DIRECT_URL`) |
| `src/lib/prisma.ts` | Singleton client with `PrismaPg` adapter |
| `scripts/test-db.ts` | CLI connectivity check |
| `src/app/api/health/route.ts` | HTTP health check |
| `prisma/seed.ts` | Admin user, plans, crypto assets |

## Scripts

```bash
npm run db:generate   # prisma generate
npm run db:push       # prisma db push
npm run db:studio     # Prisma Studio
npm run db:seed       # Seed data
npm run db:test       # Connection test
```

## Notes

- Prisma 7 requires a **driver adapter** for all database access; the schema datasource block has no `url`.
- Do not hardcode wallet addresses or plan rates in the frontend — they come from the DB after admin configuration.
- All balance changes must go through `Transaction` records (enforced in application logic, not only UI).
