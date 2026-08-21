/**
 * Password hashing with bcryptjs.
 *
 * - Cost factor: 12 rounds (override with BCRYPT_ROUNDS, 10–15)
 * - Always use these helpers — never call bcrypt directly from routes
 * - Never log plaintext passwords or hashes
 */

import bcrypt from "bcryptjs";

function getRounds(): number {
  const raw = process.env.BCRYPT_ROUNDS;
  if (!raw) return 12;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 10 || n > 15) return 12;
  return n;
}

/**
 * Dummy hash so missing-user login still runs bcrypt.compare
 * (mitigates timing-based account enumeration).
 */
const DUMMY_HASH_PROMISE = bcrypt.hash(
  "__thesoros_dummy_password_not_a_real_user__",
  getRounds()
);

export async function hashPassword(plain: string): Promise<string> {
  if (!plain || plain.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  if (plain.length > 128) {
    throw new Error("Password is too long");
  }
  return bcrypt.hash(plain, getRounds());
}

export async function verifyPassword(
  plain: string,
  passwordHash: string
): Promise<boolean> {
  if (!plain || !passwordHash) return false;
  try {
    return await bcrypt.compare(plain, passwordHash);
  } catch {
    return false;
  }
}

/**
 * Verify against real hash, or run a dummy compare when hash is missing.
 */
export async function verifyPasswordOrDummy(
  plain: string,
  passwordHash: string | null | undefined
): Promise<boolean> {
  if (passwordHash) {
    return verifyPassword(plain, passwordHash);
  }
  const dummy = await DUMMY_HASH_PROMISE;
  await bcrypt.compare(plain || " ", dummy);
  return false;
}

export function needsRehash(passwordHash: string): boolean {
  try {
    return bcrypt.getRounds(passwordHash) < getRounds();
  } catch {
    return true;
  }
}

export async function upgradePasswordHash(plain: string): Promise<string> {
  return hashPassword(plain);
}

export const BCRYPT_ROUNDS = getRounds();
