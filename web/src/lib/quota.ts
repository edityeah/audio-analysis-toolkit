import type { User } from "@/lib/db/schema";

export const FREE_SECONDS_PER_WINDOW = 600; // 10 minutes
export const WINDOW_DAYS = 30;
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

export type QuotaSnapshot = {
  remainingSeconds: number;
  usedSeconds: number;
  windowEnd: Date | null; // null until the user has done their first transcription, or after expiry
  isExpired: boolean;
};

export function computeQuota(user: User, now: Date = new Date()): QuotaSnapshot {
  if (!user.windowStartedAt) {
    return {
      remainingSeconds: FREE_SECONDS_PER_WINDOW,
      usedSeconds: 0,
      windowEnd: null,
      isExpired: false,
    };
  }

  const windowEndMs = new Date(user.windowStartedAt).getTime() + WINDOW_MS;
  if (now.getTime() > windowEndMs) {
    return {
      remainingSeconds: FREE_SECONDS_PER_WINDOW,
      usedSeconds: 0,
      windowEnd: null,
      isExpired: true,
    };
  }

  return {
    remainingSeconds: Math.max(0, FREE_SECONDS_PER_WINDOW - user.secondsUsed),
    usedSeconds: user.secondsUsed,
    windowEnd: new Date(windowEndMs),
    isExpired: false,
  };
}

export function formatMinutes(seconds: number): string {
  return (seconds / 60).toFixed(1);
}
