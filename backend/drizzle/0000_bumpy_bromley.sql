CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"state" text NOT NULL,
	"enqueue_time" timestamp DEFAULT now() NOT NULL,
	"processing_start_time" timestamp,
	"finish_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"last_heartbeat" timestamp
);
