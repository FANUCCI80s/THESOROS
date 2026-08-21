# THÉSOROS

Premium investment / wealth-management platform.

**Crypto-only deposits · Plan-based performance · Full admin control · Proper ledger architecture**

## Stack

- Next.js 16.3.1 + React 19.2.8 + TypeScript
- Prisma 7.9.1 + PostgreSQL (Neon) via `@prisma/adapter-pg`
- Tailwind CSS 4
- zod · bcryptjs · lucide-react

## Getting started

```bash
cp .env.example .env
# Fill DATABASE_URL with your Neon connection string

npm install
npx prisma generate
npx prisma db push

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current status (scaffold)

### Public
- Landing page with premium dark + gold identity
- Header / Footer
- How it works + value props

### Auth (UI complete, API pending)
- `/signup` — first name, last name, email, password
- `/login` — email + password → OTP step
- `/verify-otp` — 6-digit code entry
- After OTP → KYC gate (to be wired)

### Dashboard (UI + flow skeletons)
- `/dashboard` — Available / Invested / Portfolio balances + Investment Status
- `/deposit` — Full Manual + Automatic deposit flow (method → details → payment/PAY NOW → proof → PAID → PENDING)
- `/withdrawal` — amount + crypto + network + destination → PENDING
- `/transactions` — placeholder for ledger history
- `/profile` — personal info + KYC status section

### Database
- Complete Prisma schema matching the full blueprint (User, Account, KYC, Deposits, Withdrawals, Transactions, InvestmentPlans, Investments, Notifications, AuditLog, Crypto configs, Team, Notices, Settings, etc.)

## Next implementation priorities

1. Wire Prisma client + Neon connection
2. Auth API routes (signup, login, OTP, session)
3. KYC submission + admin review
4. Deposit / Withdrawal API + admin approval that creates Transaction + updates Account balances
5. Investment plan purchase (plan-based performance)
6. Admin panel (users, KYC, deposits, withdrawals, plans, crypto configs, balance adjustments, team, notices)
7. Real market data page (CoinGecko) — separate from plans
8. Notifications system

## Hard rules (do not break)

- Crypto-only deposits (manual + automatic). No Cash App / bank.
- Automatic deposit: PAY NOW → external page → return → proof → PAID → PENDING → admin review. Never auto-credit.
- Investment performance is **plan-based**, not market-based.
- All financial changes go through Transaction + ledger entries.
- Admin-configurable values are never hardcoded in the frontend.
- Retained Prisma schema is the source of truth.
