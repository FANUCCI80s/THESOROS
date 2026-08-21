/**
 * Optional Redis client for multi-instance rate limiting.
 * Connects when REDIS_URL is set; otherwise returns null (memory fallback).
 */

import type { RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connectAttempted = false;
let connectFailed = false;

export async function getRedis(): Promise<RedisClientType | null> {
  if (connectFailed) return null;
  if (client?.isOpen) return client;

  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;

  if (connectAttempted && client) {
    try {
      if (!client.isOpen) await client.connect();
      return client;
    } catch {
      connectFailed = true;
      return null;
    }
  }

  connectAttempted = true;

  try {
    // Dynamic import so the app runs without redis package / URL
    const redisMod = await import("redis").catch(() => null);
    if (!redisMod) {
      console.warn(
        "[redis] package not installed — using in-memory rate limit. Run: npm i redis"
      );
      connectFailed = true;
      return null;
    }

    client = redisMod.createClient({
      url,
      socket: {
        connectTimeout: 5_000,
        reconnectStrategy: (retries: number) => {
          if (retries > 10) return false;
          return Math.min(retries * 200, 3_000);
        },
      },
    }) as RedisClientType;

    client.on("error", (err) => {
      console.error("[redis] client error", err.message);
    });

    await client.connect();
    console.info("[redis] connected");
    return client;
  } catch (err) {
    console.error("[redis] connection failed — memory rate limit active", err);
    connectFailed = true;
    client = null;
    return null;
  }
}

export async function closeRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit().catch(() => undefined);
  }
  client = null;
}
