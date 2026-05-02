import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    purpose: text("purpose"),
    // Sliding 30-day quota window — null until first transcription.
    windowStartedAt: timestamp("window_started_at", { withTimezone: true }),
    secondsUsed: integer("seconds_used").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    clerkIdIdx: index("idx_users_clerk_id").on(t.clerkId),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const transcripts = pgTable(
  "transcripts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assemblyaiId: text("assemblyai_id").notNull().unique(),
    fileName: text("file_name"),
    source: text("source").notNull(), // 'upload' | 'recording'
    audioDurationSeconds: integer("audio_duration_seconds").notNull().default(0),
    status: text("status").notNull().default("processing"), // 'processing' | 'completed' | 'failed'
    debited: integer("debited").notNull().default(0), // 0 = quota not yet charged, 1 = already debited
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    userIdIdx: index("idx_transcripts_user_id").on(t.userId),
    assemblyIdIdx: index("idx_transcripts_assemblyai_id").on(t.assemblyaiId),
  }),
);

export type Transcript = typeof transcripts.$inferSelect;
export type NewTranscript = typeof transcripts.$inferInsert;
