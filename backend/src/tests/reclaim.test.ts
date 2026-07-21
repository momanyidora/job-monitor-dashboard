import { beforeEach, afterAll, describe, expect, it } from "vitest";

import {
  createJob,
  claimOldestJob,
  completeJob,
  reclaimJobs,
} from "../services/job.service";

import { registerWorker, detectDeadWorkers } from "../services/worker.service";

import { db, pool } from "../db";
import { jobs, workers } from "../db/schema";

import { eq } from "drizzle-orm";

import { JobState } from "../types/job-state";

import { WorkerStatus } from "../types/worker-status";

beforeEach(async () => {
  await db.delete(jobs);
  await db.delete(workers);
});

afterAll(async () => {
  await pool.end();
});

describe("Job reclaim", () => {
  it("reclaims a job from a dead worker and another worker completes it", async () => {
    await registerWorker("worker-1");
    await registerWorker("worker-2");

    const job = await createJob("test-job", {});

    const claimed = await claimOldestJob("worker-1");

    expect(claimed?.id).toBe(job.id);

    await db
      .update(workers)
      .set({
        status: WorkerStatus.DEAD,
      })
      .where(eq(workers.id, "worker-1"));

    await reclaimJobs();

    const reclaimed = await db.query.jobs.findFirst({
      where: eq(jobs.id, job.id),
    });

    expect(reclaimed?.state).toBe(JobState.QUEUED);
    expect(reclaimed?.workerId).toBeNull();

    const secondClaim = await claimOldestJob("worker-2");

    expect(secondClaim?.id).toBe(job.id);

    const completed = await completeJob(job.id);

    expect(completed?.state).toBe(JobState.COMPLETED);
  });

  it("does not reclaim a job from a slow worker that is still heartbeating", async () => {
    await registerWorker("worker-1");

    const job = await createJob("slow-job", {});

    await claimOldestJob("worker-1");

    await db
      .update(workers)
      .set({
        lastHeartbeat: new Date(),
        status: WorkerStatus.ALIVE,
      })
      .where(eq(workers.id, "worker-1"));

    await detectDeadWorkers();
    await reclaimJobs();

    const currentJob = await db.query.jobs.findFirst({
      where: eq(jobs.id, job.id),
    });

    expect(currentJob?.state).toBe(JobState.IN_FLIGHT);

    expect(currentJob?.workerId).toBe("worker-1");
  });

  it("never assigns one job to two workers", async () => {
    await registerWorker("worker-1");
    await registerWorker("worker-2");

    const job = await createJob("test-job", {});

    const firstClaim = await claimOldestJob("worker-1");

    expect(firstClaim?.id).toBe(job.id);

    await db
      .update(workers)
      .set({
        status: WorkerStatus.DEAD,
      })
      .where(eq(workers.id, "worker-1"));

    await reclaimJobs();

    const [worker1Claim, worker2Claim] = await Promise.all([
      claimOldestJob("worker-1"),
      claimOldestJob("worker-2"),
    ]);

    const successfulClaims = [worker1Claim, worker2Claim].filter(Boolean);

    expect(successfulClaims).toHaveLength(1);

    expect(successfulClaims[0]?.id).toBe(job.id);
  });
});
