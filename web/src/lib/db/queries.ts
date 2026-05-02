import { eq } from "drizzle-orm";
import { db } from "./client";
import { users, type User } from "./schema";

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
