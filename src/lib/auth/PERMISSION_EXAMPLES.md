# THÉSOROS permission examples

Import helpers:

```ts
import { requirePermission, requireSuperAdmin } from "@/lib/auth/require";
import { requireAdminSection, requirePagePermission } from "@/lib/auth/guards";
import { hasPermission, PERMISSION_EXAMPLES } from "@/lib/auth/permissions";
```

## API routes

```ts
// User creates a deposit
const auth = await requirePermission("deposit:create");
if ("error" in auth) return auth.error;

// Admin reviews deposits
const auth = await requirePermission("deposits:review");

// Super admin adjusts balances
const auth = await requirePermission("balances:adjust");
// or
const auth = await requireSuperAdmin();
```

## Server pages / layouts

```ts
// Entire admin section
await requireAdminSection("deposits");

// Single permission on a page
await requirePagePermission("plans:manage");
```

## Client UI

```tsx
import { hasPermission } from "@/lib/auth/permissions";

{hasPermission(user.role, "deposits:review") && (
  <Link href="/admin/deposits">Review deposits</Link>
)}

{hasPermission(user.role, "balances:adjust") && (
  <Button>Adjust balance</Button>
)}
```

## Role summary

| Permission | USER | ADMIN | SUPER_ADMIN |
|------------|------|-------|-------------|
| deposit:create | ✓ | ✓ | ✓ |
| deposits:review | | ✓ | ✓ |
| balances:adjust | | | ✓ |
| settings:manage | | | ✓ |
| admins:manage | | | ✓ |

Full list: `PERMISSION_EXAMPLES` in `src/lib/auth/rbac.ts`.
