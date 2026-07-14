import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),

  type: text("type").notNull(),

  payload: jsonb("payload").notNull(),

  state: text("state").notNull(),

  enqueueTime: timestamp("enqueue_time").defaultNow().notNull(),

  processingStartTime: timestamp("processing_start_time"),

  finishTime: timestamp("finish_time"),
});
