// This service handles the main job lifecycle operations for the queue.
import { jobs } from "../db/schema";
import { JobState } from "../types/job-state";
import { db } from "../db";
import {  eq, sql } from "drizzle-orm";

export async function createJob(type: string, payload: unknown) {
  // Insert a new job into the database with the queued state.
  const [job] = await db
    .insert(jobs)
    .values({
      type,
      payload,
      state: JobState.QUEUED,
    })
    .returning();
  return job;
}

export async function claimOldestJob(workerId: string) {
  return await db.transaction(async (tx) => {
    const result = await tx.execute(sql`
      UPDATE jobs
      SET
        state = ${JobState.IN_FLIGHT},
        worker_id = ${workerId},
        processing_start_time = NOW()
      WHERE id = (
        SELECT id
        FROM jobs
        WHERE state = ${JobState.QUEUED}
        ORDER BY enqueue_time
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING *;
    `);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as {
      id: string;
      type: string;
      payload: unknown;
      state: string;
      workerId: string | null;
      enqueueTime: Date;
      processingStartTime: Date | null;
      finishTime: Date | null;
      stackTrace: string | null;
    };
  });
}

// Mark a job as completed once its work finishes.
export async function completeJob(jobId: string) {
  await db
    .update(jobs)
    .set({
      state: JobState.COMPLETED,
      finishTime: new Date(),
    })
    .where(eq(jobs.id, jobId));
}

// Mark a job as failed when processing raises an error.
export async function failJob(jobId: string, error: Error) {
  await db
    .update(jobs)
    .set({
      state: JobState.FAILED,
      finishTime: new Date(),
      stackTrace: error.stack,
    })
    .where(eq(jobs.id, jobId));
}
