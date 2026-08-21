# THÉSOROS — Production readiness checklist

## 1. Environment
- [ ] Copy `.env.example` → `.env`
- [ ] Set Neon `DATABASE_URL` (pooled) and `DIRECT_URL` (direct)
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Set `NODE_ENV=production`
- [ ] Configure SMTP (`SMTP_*`) for OTP email (optional but recommended)

## 2. Database
```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```
- [ ] Change admin password after first login (`admin@thesoros.com`)
- [ ] Replace seed wallet addresses with real ones (Admin → Crypto / Payments)

## 3. Verify flows
- [ ] Signup → Login → OTP (email or dev console) → dashboard
- [ ] KYC submit from Profile
- [ ] Manual deposit → upload proof → PENDING
- [ ] Admin approve deposit → Available balance increases
- [ ] Investment purchase from available balance
- [ ] Withdrawal request → admin review

## 4. Security (already in codebase)
- [x] Session cookie httpOnly
- [x] Route middleware + layout guards
- [x] RBAC permissions
- [x] Ledger row locks + circuit breaker
- [x] Auth rate limits
- [x] Security headers in `next.config.ts`
- [ ] Use managed object storage for uploads in multi-instance deploys
- [ ] Redis rate limit if horizontally scaled

## 5. Deploy
```bash
npm run build
npm start
```
Or deploy to Vercel/Railway/etc. with the same env vars.
