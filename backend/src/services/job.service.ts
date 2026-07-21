// This service handles the main job lifecycle operations for the queue.

import { jobs } from "../db/schema";
import { JobState } from "../types/job-state";
import { WorkerStatus } from "../types/worker-status";
import { db } from "../db";

import { eq, sql, and } from "drizzle-orm";

import { broadcast } from "../websocket/broadcaster";

export async function createJob(type: string, payload: unknown) {
  const [job] = await db
    .insert(jobs)
    .values({
      type,
      payload,
      state: JobState.QUEUED,
    })
    .returning();

  broadcast("job_queued", job);

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

    const job = result.rows[0];

    broadcast("job_claimed", job);

    return job as {
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

export async function completeJob(jobId: string) {
  const [job] = await db
    .update(jobs)
    .set({
      state: JobState.COMPLETED,
      finishTime: new Date(),
    })
    .where(eq(jobs.id, jobId))
    .returning();

  if (job) {
    broadcast("job_completed", job);
  }

  return job ?? null;
}

export async function failJob(jobId: string, error: Error) {
  const [job] = await db
    .update(jobs)
    .set({
      state: JobState.FAILED,
      finishTime: new Date(),
      stackTrace: error.stack,
    })
    .where(and(eq(jobs.id, jobId), eq(jobs.state, JobState.IN_FLIGHT)))
    .returning();

  if (job) {
    broadcast("job_failed", job);
  }
  return job ?? null;
}

export async function reclaimJobs() {
  const result = await db.execute(sql`
    UPDATE jobs
    SET
      state = ${JobState.QUEUED},
      worker_id = NULL,
      processing_start_time = NULL
    WHERE
      state = ${JobState.IN_FLIGHT}
      AND worker_id IN (
        SELECT id
        FROM workers
        WHERE status = ${WorkerStatus.DEAD}
      )
    RETURNING *;
  `);

  if (result.rows.length > 0) {
    broadcast("jobs_reclaimed", result.rows);
  }

  return result.rows;
}

export async function retryJob(jobId: string) {
  const [job] = await db
    .update(jobs)
    .set({
      state: JobState.QUEUED,
      workerId: null,
      processingStartTime: null,
      finishTime: null,
      stackTrace: null,
    })
    .where(and(eq(jobs.id, jobId), eq(jobs.state, JobState.FAILED)))
    .returning();

  if (job) {
    broadcast("job_retried", job);
  }

  return job ?? null;
}
