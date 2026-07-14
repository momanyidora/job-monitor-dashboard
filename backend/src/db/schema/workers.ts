// This schema stores current worker identity and heartbeat information.
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const workers = pgTable("workers", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),

  lastHeartbeat: timestamp("last_heartbeat"),
});
