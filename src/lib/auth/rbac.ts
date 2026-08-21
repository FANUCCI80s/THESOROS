/**
 * THÉSOROS Role-Based Access Control
 *
 * Roles (Prisma UserRole):
 *   USER         — investor / client
 *   ADMIN        — operations staff
 *   SUPER_ADMIN  — full platform control
 *
 * SUPER_ADMIN implicitly has every permission via hasPermission().
 */

import type { UserRole } from "@/types";

/** Canonical permission identifiers */
export const PERMISSIONS = [
  // Self-service
  "account:read",
  "account:update_profile",
  "account:change_password",
  "kyc:submit",
  "kyc:read_own",
  "deposit:create",
  "deposit:read_own",
  "deposit:cancel_own",
  "withdrawal:create",
  "withdrawal:read_own",
  "withdrawal:cancel_own",
  "investment:purchase",
  "investment:read_own",
  "transaction:read_own",
  "notification:read_own",
  "notification:mark_read",
  "markets:read",

  // Admin — console & users
  "admin:access",
  "users:read",
  "users:update_status",
  "users:read_detail",
  "kyc:review",
  "kyc:read_all",

  // Admin — money
  "deposits:review",
  "deposits:read_all",
  "withdrawals:review",
  "withdrawals:read_all",
  "balances:adjust",
  "balances:read_all",

  // Admin — catalog & config
  "plans:manage",
  "plans:read",
  "crypto:manage",
  "payments:configure",
  "notices:manage",
  "team:manage",
  "settings:manage",
  "messages:manage",
  "messages:read",

  // Super
  "audit:read",
  "admins:manage",
  "system:maintenance",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const USER_PERMISSIONS: Permission[] = [
  "account:read",
  "account:update_profile",
  "account:change_password",
  "kyc:submit",
  "kyc:read_own",
  "deposit:create",
  "deposit:read_own",
  "deposit:cancel_own",
  "withdrawal:create",
  "withdrawal:read_own",
  "withdrawal:cancel_own",
  "investment:purchase",
  "investment:read_own",
  "transaction:read_own",
  "notification:read_own",
  "notification:mark_read",
  "markets:read",
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...USER_PERMISSIONS,
  "admin:access",
  "users:read",
  "users:update_status",
  "users:read_detail",
  "kyc:review",
  "kyc:read_all",
  "deposits:review",
  "deposits:read_all",
  "withdrawals:review",
  "withdrawals:read_all",
  "balances:read_all",
  "plans:manage",
  "plans:read",
  "crypto:manage",
  "payments:configure",
  "notices:manage",
  "team:manage",
  "messages:manage",
  "messages:read",
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  "balances:adjust",
  "settings:manage",
  "audit:read",
  "admins:manage",
  "system:maintenance",
];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  USER: USER_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
};

export function permissionsForRole(
  role: UserRole | string
): readonly Permission[] {
  if (role === "SUPER_ADMIN") return ROLE_PERMISSIONS.SUPER_ADMIN;
  if (role === "ADMIN") return ROLE_PERMISSIONS.ADMIN;
  if (role === "USER") return ROLE_PERMISSIONS.USER;
  return ROLE_PERMISSIONS.USER;
}

export function hasPermission(
  role: UserRole | string,
  permission: Permission
): boolean {
  if (role === "SUPER_ADMIN") return true;
  return permissionsForRole(role).includes(permission);
}

export function hasAnyPermission(
  role: UserRole | string,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: UserRole | string,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function isAdminRole(role: UserRole | string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdminRole(role: UserRole | string): boolean {
  return role === "SUPER_ADMIN";
}

export const ADMIN_SECTION_PERMISSION: Record<string, Permission> = {
  dashboard: "admin:access",
  users: "users:read",
  kyc: "kyc:review",
  deposits: "deposits:review",
  withdrawals: "withdrawals:review",
  plans: "plans:manage",
  crypto: "crypto:manage",
  payments: "payments:configure",
  balances: "balances:adjust",
  notices: "notices:manage",
  team: "team:manage",
  settings: "settings:manage",
  messages: "messages:manage",
};

export function canAccessAdminSection(
  role: UserRole | string,
  section: keyof typeof ADMIN_SECTION_PERMISSION | string
): boolean {
  const permission = ADMIN_SECTION_PERMISSION[section];
  if (!permission) return isAdminRole(role);
  return hasPermission(role, permission);
}

/**
 * Human-readable permission examples (docs, tests, onboarding).
 */
export const PERMISSION_EXAMPLES: ReadonlyArray<{
  permission: Permission;
  roles: UserRole[];
  description: string;
  example: string;
}> = [
  {
    permission: "account:read",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "View own dashboard balances and profile summary",
    example: 'await requirePermission("account:read") // GET /api/auth/me',
  },
  {
    permission: "account:change_password",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Change own password while logged in",
    example: 'await requirePermission("account:change_password") // POST /api/auth/change-password',
  },
  {
    permission: "kyc:submit",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Submit KYC documents from Profile",
    example: 'await requirePermission("kyc:submit") // POST /api/kyc',
  },
  {
    permission: "kyc:read_own",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Read own KYC status and documents",
    example: 'await requirePermission("kyc:read_own") // GET /api/kyc/me',
  },
  {
    permission: "deposit:create",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Create manual or automatic crypto deposit",
    example: 'await requirePermission("deposit:create") // POST /api/deposits/manual',
  },
  {
    permission: "deposit:read_own",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "List own deposit history",
    example: 'await requirePermission("deposit:read_own") // GET /api/deposits',
  },
  {
    permission: "deposit:cancel_own",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Cancel own PENDING deposit before admin review",
    example: 'await requirePermission("deposit:cancel_own") // POST /api/deposits/[id]/cancel',
  },
  {
    permission: "withdrawal:create",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Request a crypto withdrawal",
    example: 'await requirePermission("withdrawal:create") // POST /api/withdrawals',
  },
  {
    permission: "withdrawal:cancel_own",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Cancel own PENDING withdrawal",
    example: 'await requirePermission("withdrawal:cancel_own") // POST /api/withdrawals/[id]/cancel',
  },
  {
    permission: "investment:purchase",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Buy an investment plan from available balance",
    example: 'await requirePermission("investment:purchase") // POST /api/investments',
  },
  {
    permission: "investment:read_own",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "View own active and matured plans",
    example: 'await requirePermission("investment:read_own") // GET /api/investments',
  },
  {
    permission: "transaction:read_own",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "View own ledger / transaction history",
    example: 'await requirePermission("transaction:read_own") // GET /api/transactions',
  },
  {
    permission: "notification:read_own",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "List own notifications",
    example: 'await requirePermission("notification:read_own") // GET /api/notifications',
  },
  {
    permission: "notification:mark_read",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "Mark notifications as read",
    example: 'await requirePermission("notification:mark_read") // POST /api/notifications/read',
  },
  {
    permission: "markets:read",
    roles: ["USER", "ADMIN", "SUPER_ADMIN"],
    description: "View real market data (separate from plan performance)",
    example: 'await requirePermission("markets:read") // GET /api/markets',
  },
  {
    permission: "admin:access",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Open the admin console shell",
    example: "await requirePageAdmin() // admin/layout.tsx",
  },
  {
    permission: "users:read",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "List platform users",
    example: 'await requirePermission("users:read") // GET /api/admin/users',
  },
  {
    permission: "users:read_detail",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "View a single user profile and balances",
    example: 'await requirePermission("users:read_detail") // GET /api/admin/users/[id]',
  },
  {
    permission: "users:update_status",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Suspend, ban, or reactivate a user",
    example: 'await requirePermission("users:update_status") // PATCH /api/admin/users/[id]/status',
  },
  {
    permission: "kyc:review",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Approve or decline KYC submissions",
    example: 'await requirePermission("kyc:review") // POST /api/admin/kyc/[id]/approve',
  },
  {
    permission: "kyc:read_all",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Browse all KYC queues",
    example: 'await requirePermission("kyc:read_all") // GET /api/admin/kyc',
  },
  {
    permission: "deposits:review",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Approve/decline deposits (credits ledger on approve)",
    example: 'await requirePermission("deposits:review") // POST /api/admin/deposits/[id]/approve',
  },
  {
    permission: "deposits:read_all",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "List all platform deposits",
    example: 'await requirePermission("deposits:read_all") // GET /api/admin/deposits',
  },
  {
    permission: "withdrawals:review",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Approve, process, or decline withdrawals",
    example: 'await requirePermission("withdrawals:review") // POST /api/admin/withdrawals/[id]/approve',
  },
  {
    permission: "withdrawals:read_all",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "List all withdrawal requests",
    example: 'await requirePermission("withdrawals:read_all") // GET /api/admin/withdrawals',
  },
  {
    permission: "balances:read_all",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "View any user available/invested balances",
    example: 'await requirePermission("balances:read_all") // GET /api/admin/balances',
  },
  {
    permission: "balances:adjust",
    roles: ["SUPER_ADMIN"],
    description: "Manual ledger balance adjustment (super only)",
    example: 'await requirePermission("balances:adjust") // POST /api/admin/balances/adjust',
  },
  {
    permission: "plans:manage",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Create and edit investment plans",
    example: 'await requirePermission("plans:manage") // POST /api/admin/plans',
  },
  {
    permission: "plans:read",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "List plans in admin (users use authenticated plans API)",
    example: 'await requirePermission("plans:read") // GET /api/admin/plans',
  },
  {
    permission: "crypto:manage",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Enable cryptocurrencies and networks",
    example: 'await requirePermission("crypto:manage") // POST /api/admin/crypto',
  },
  {
    permission: "payments:configure",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Set manual wallets and automatic payment URLs",
    example: 'await requirePermission("payments:configure") // PUT /api/admin/payments/manual',
  },
  {
    permission: "notices:manage",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Publish platform notices",
    example: 'await requirePermission("notices:manage") // POST /api/admin/notices',
  },
  {
    permission: "team:manage",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Manage public team member listings",
    example: 'await requirePermission("team:manage") // POST /api/admin/team',
  },
  {
    permission: "messages:manage",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Send admin messages to users",
    example: 'await requirePermission("messages:manage") // POST /api/admin/messages',
  },
  {
    permission: "messages:read",
    roles: ["ADMIN", "SUPER_ADMIN"],
    description: "Read admin message threads",
    example: 'await requirePermission("messages:read") // GET /api/admin/messages',
  },
  {
    permission: "settings:manage",
    roles: ["SUPER_ADMIN"],
    description: "Change global platform settings",
    example: 'await requirePermission("settings:manage") // PUT /api/admin/settings',
  },
  {
    permission: "audit:read",
    roles: ["SUPER_ADMIN"],
    description: "Read audit log of sensitive actions",
    example: 'await requirePermission("audit:read") // GET /api/admin/audit',
  },
  {
    permission: "admins:manage",
    roles: ["SUPER_ADMIN"],
    description: "Promote or demote admin roles",
    example: 'await requirePermission("admins:manage") // PATCH /api/admin/users/[id]/role',
  },
  {
    permission: "system:maintenance",
    roles: ["SUPER_ADMIN"],
    description: "Toggle maintenance mode and system flags",
    example: 'await requirePermission("system:maintenance") // POST /api/admin/system/maintenance',
  },
];
