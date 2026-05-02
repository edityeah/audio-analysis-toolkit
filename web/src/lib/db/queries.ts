import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { transcripts, users, type Transcript, type User } from "./schema";

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertUserProfile(input: {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  purpose: string;
}): Promise<User> {
  const existing = await getUserByClerkId(input.clerkId);

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        purpose: input.purpose,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, input.clerkId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkId: input.clerkId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      purpose: input.purpose,
    })
    .returning();
  return created;
}

// ── Transcript + quota helpers ─────────────────────────────────────────────

export async function debitUserSeconds(
  userId: string,
  seconds: number,
): Promise<User> {
  // Stamp window_started_at on first debit, increment seconds_used.
  const [updated] = await db
    .update(users)
    .set({
      secondsUsed: sql`${users.secondsUsed} + ${seconds}`,
      windowStartedAt: sql`COALESCE(${users.windowStartedAt}, NOW())`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}

export async function refundUserSeconds(
  userId: string,
  seconds: number,
): Promise<void> {
  await db
    .update(users)
    .set({
      secondsUsed: sql`GREATEST(${users.secondsUsed} - ${seconds}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function resetUserWindow(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      secondsUsed: 0,
      windowStartedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function createTranscript(input: {
  userId: string;
  assemblyaiId: string;
  fileName: string | null;
  source: "upload" | "recording";
  audioDurationSeconds: number;
}): Promise<Transcript> {
  const [created] = await db.insert(transcripts).values(input).returning();
  return created;
}

export async function getTranscriptByAssemblyId(
  userId: string,
  assemblyaiId: string,
): Promise<Transcript | null> {
  const rows = await db
    .select()
    .from(transcripts)
    .where(and(eq(transcripts.userId, userId), eq(transcripts.assemblyaiId, assemblyaiId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function markTranscriptCompleted(
  id: string,
  actualDurationSeconds: number,
): Promise<void> {
  await db
    .update(transcripts)
    .set({
      status: "completed",
      audioDurationSeconds: actualDurationSeconds,
      completedAt: new Date(),
    })
    .where(eq(transcripts.id, id));
}

export async function markTranscriptFailed(id: string): Promise<void> {
  await db
    .update(transcripts)
    .set({ status: "failed", completedAt: new Date() })
    .where(eq(transcripts.id, id));
}

export async function getRecentTranscripts(
  userId: string,
  limit = 10,
): Promise<Transcript[]> {
  return db
    .select()
    .from(transcripts)
    .where(eq(transcripts.userId, userId))
    .orderBy(desc(transcripts.createdAt))
    .limit(limit);
}
