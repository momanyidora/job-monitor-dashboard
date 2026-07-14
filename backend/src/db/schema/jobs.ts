// This schema defines the jobs table used by the queue and worker workflow.
import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),

  // The job type describes what action should be performed.
  type: text("type").notNull(),

  // The payload stores any job-specific data in JSON form.
  payload: jsonb("payload").notNull(),

  // The job state tracks where it is in the lifecycle.
  state: text("state").notNull(),

  enqueueTime: timestamp("enqueue_time").defaultNow().notNull(),

  processingStartTime: timestamp("processing_start_time"),

  finishTime: timestamp("finish_time"),
  workerId: text("worker_id"),
  stackTrace: text("stack_trace"),
});
