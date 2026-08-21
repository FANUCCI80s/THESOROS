/**
 * Rate limiting — Redis sliding window (optimized Lua) + in-memory fallback.
 *
 * Lua optimization techniques applied:
 * 1. EVALSHA — script body sent once; subsequent calls use SHA1 only
 * 2. KEYS vs ARGV — key in KEYS[] for cluster hash-slot correctness
 * 3. Early exit on deny — no ZADD / PEXPIRE when over limit
 * 4. ZRANGEBYSCORE … LIMIT 0 1 — O(log N) oldest lookup, not full range
 * 5. Trim only when needed — ZREMRANGEBYSCORE before count (keeps set small)
 * 6. tonumber once — avoid repeated coercions
 * 7. Minimal return tuple — {allowed, remaining, retryAfterMs} as integers
 * 8. No Redis writes on deny path — pure read after trim
 */

import { createHash } from "crypto";
import { getEnv } from "@/lib/env";
import { getRedis } from "@/lib/redis";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  backend: "redis" | "memory";
};

type MemoryBucket = { timestamps: number[] };
const memoryStore = new Map<string, MemoryBucket>();

const KEY_PREFIX = "rl:thesoros:";

/**
 * Optimized sliding-window Lua.
 *
 * KEYS[1] = sorted-set key
 * ARGV[1] = nowMs
 * ARGV[2] = windowMs
 * ARGV[3] = max
 * ARGV[4] = unique member
 *
 * Returns: { allowed (0|1), remaining, retryAfterMs }
 */
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local max = tonumber(ARGV[3])
local member = ARGV[4]
local window_start = now - window

-- Drop expired events (keeps cardinality bounded)
redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

local count = redis.call('ZCARD', key)

if count < max then
  redis.call('ZADD', key, now, member)
  -- TTL = window so idle keys self-delete
  redis.call('PEXPIRE', key, window)
  return {1, max - count - 1, 0}
end

-- Deny path: no writes. Oldest event drives retryAfter.
local oldest = redis.call('ZRANGEBYSCORE', key, '-inf', '+inf', 'WITHSCORES', 'LIMIT', 0, 1)
local oldest_score = now
if oldest and oldest[2] then
  oldest_score = tonumber(oldest[2])
end

local retry_after = window - (now - oldest_score)
if retry_after < 0 then retry_after = 0 end

return {0, 0, retry_after}
`;

/** SHA1 of script body — used with EVALSHA after first SCRIPT LOAD */
const SCRIPT_SHA = createHash("sha1")
  .update(SLIDING_WINDOW_LUA)
  .digest("hex");

/** Track whether this process has LOADed the script on the current Redis */
let scriptLoaded = false;

function memoryLimit(
  key: string,
  windowMs: number,
  max: number
): RateLimitResult {
  const now = Date.now();
  let bucket = memoryStore.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    memoryStore.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= max) {
    const oldest = bucket.timestamps[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, windowMs - (now - oldest)),
      backend: "memory",
    };
  }

  bucket.timestamps.push(now);
  return {
    allowed: true,
    remaining: Math.max(0, max - bucket.timestamps.length),
    retryAfterMs: 0,
    backend: "memory",
  };
}

function parseLuaResult(
  raw: unknown
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const arr = raw as Array<number | string>;
  return {
    allowed: Number(arr?.[0]) === 1,
    remaining: Math.max(0, Number(arr?.[1]) || 0),
    retryAfterMs: Math.max(0, Math.floor(Number(arr?.[2]) || 0)),
  };
}

/**
 * Run script via EVALSHA when possible (smaller payload, less parse cost on Redis).
 * Falls back to EVAL on NOSCRIPT; re-LOAD after Redis restart / flush.
 */
async function evalSlidingWindow(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redis: any,
  redisKey: string,
  now: number,
  windowMs: number,
  max: number,
  member: string
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
  const args = {
    keys: [redisKey],
    arguments: [String(now), String(windowMs), String(max), member],
  };

  if (scriptLoaded) {
    try {
      const raw = await redis.evalSha(SCRIPT_SHA, args);
      return parseLuaResult(raw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Script flushed (SCRIPT FLUSH / restart) — reload path below
      if (!msg.includes("NOSCRIPT")) throw err;
      scriptLoaded = false;
    }
  }

  // First call or after NOSCRIPT: EVAL (Redis caches by SHA automatically)
  // Prefer SCRIPT LOAD then EVALSHA for subsequent calls
  try {
    if (typeof redis.scriptLoad === "function") {
      await redis.scriptLoad(SLIDING_WINDOW_LUA);
      scriptLoaded = true;
      const raw = await redis.evalSha(SCRIPT_SHA, args);
      return parseLuaResult(raw);
    }
  } catch {
    // Fall through to plain EVAL
    scriptLoaded = false;
  }

  const raw = await redis.eval(SLIDING_WINDOW_LUA, args);
  // EVAL also registers the script; mark loaded for next EVALSHA
  scriptLoaded = true;
  return parseLuaResult(raw);
}

async function redisSlidingWindow(
  key: string,
  windowMs: number,
  max: number
): Promise<RateLimitResult | null> {
  const redis = await getRedis();
  if (!redis) return null;

  const now = Date.now();
  const redisKey = `${KEY_PREFIX}${key}`;
  const member = `${now}:${Math.random().toString(36).slice(2, 12)}`;

  try {
    const result = await evalSlidingWindow(
      redis,
      redisKey,
      now,
      windowMs,
      max,
      member
    );
    return { ...result, backend: "redis" };
  } catch (err) {
    console.error("[rate-limit] Redis sliding window failed:", err);
    scriptLoaded = false;
    return null;
  }
}

export async function rateLimit(
  key: string,
  options?: { windowMs?: number; max?: number }
): Promise<RateLimitResult> {
  const env = getEnv();
  const windowMs = options?.windowMs ?? env.rateLimitWindowMs;
  const max = options?.max ?? env.rateLimitMax;

  if (windowMs <= 0 || max <= 0) {
    return {
      allowed: true,
      remaining: max,
      retryAfterMs: 0,
      backend: "memory",
    };
  }

  const fromRedis = await redisSlidingWindow(key, windowMs, max);
  if (fromRedis) return fromRedis;

  return memoryLimit(key, windowMs, max);
}

export async function rateLimitAuth(
  ip: string,
  action: string
): Promise<RateLimitResult> {
  return rateLimit(`auth:${action}:${ip}`, { windowMs: 60_000, max: 10 });
}

export async function rateLimitUpload(
  userId: string,
  ip: string
): Promise<RateLimitResult> {
  return rateLimit(`upload:${userId}:${ip}`, { windowMs: 60_000, max: 20 });
}

export async function rateLimitOtp(
  challengeOrIp: string
): Promise<RateLimitResult> {
  return rateLimit(`otp:${challengeOrIp}`, { windowMs: 60_000, max: 15 });
}

setInterval(() => {
  const now = Date.now();
  const windowMs = 120_000;
  for (const [key, bucket] of memoryStore.entries()) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
    if (bucket.timestamps.length === 0) memoryStore.delete(key);
  }
}, 60_000).unref?.();
