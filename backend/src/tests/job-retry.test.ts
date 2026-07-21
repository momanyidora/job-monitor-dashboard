import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { jobs } from "../db/schema";
import { db, pool } from "../db";
import {
  claimOldestJob,
  completeJob,
  createJob,
  failJob,
  retryJob,
} from "../services/job.service";
import { JobState } from "../types/job-state";

beforeEach(async () => {
  await db.delete(jobs);
});
afterAll(async () => {
  await pool.end();
});

describe("job retry", () => {
  it("successfully retries  failed job", async () => {
    const job = await createJob("test-job", {});

    await claimOldestJob("worker-1");

    await failJob(job.id, new Error("Test failure"));

    const retried = await retryJob(job.id);
    expect(retried?.state).toBe(JobState.QUEUED);
    const claimedAgain = await claimOldestJob("worker-2");
    expect(claimedAgain?.id).toBe(job.id);
    const completed = await completeJob(job.id);
    expect(completed?.state).toBe(JobState.COMPLETED);
  });

  it("rejects retrying a queued job", async () => {
    const job = await createJob("test-job", {});
    const result = await retryJob(job.id);
    expect(result).toBeNull();
  });

  it("rejects retrying an in-flight job", async () => {
    const job = await createJob("test-job", {});

    await claimOldestJob("worker-1");

    const result = await retryJob(job.id);

    expect(result).toBeNull();
  });

  it("rejects retrying a completed job", async () => {
    const job = await createJob("test-job", {});

    await claimOldestJob("worker-1");
    await completeJob(job.id);

    const result = await retryJob(job.id);

    expect(result).toBeNull();
  });

  it("returns null when retrying an unknown job", async () => {
    const result = await retryJob("00000000-0000-0000-0000-000000000000");
    expect(result).toBeNull();
  });
});
