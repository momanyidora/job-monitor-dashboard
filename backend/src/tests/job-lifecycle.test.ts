import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { jobs } from "../db/schema";
import { db, pool } from "../db";
import {
  claimOldestJob,
  completeJob,
  createJob,
  failJob,
} from "../services/job.service";
import { JobState } from "../types/job-state";

beforeEach(async () => {
  await db.delete(jobs);
});
afterAll(async () => {
  await pool.end();
});

describe("Job lifecycle edge cases", () => {
  it("create a job in queued state", async () => {
    const job = await createJob("test-job", { value: 1 });

    expect(job.state).toBe(JobState.QUEUED);
  });

  it("does not complete a queued job", async () => {
    const job = await createJob("test-job", { value: 1 });

    const result = await completeJob(job.id);
    expect(result).toBeNull();
  });

  it("does not fail a queued job", async () => {
    const job = await createJob("test-job", { value: 1 });

    const result = await failJob(job.id, new Error("Test failure"));

    expect(result).toBeNull();
  });

  it("completes an in-flight job ", async () => {
    const job = await createJob("test-job", { value: 1 });

    await claimOldestJob("worker-1");

    const result = await completeJob(job.id);

    expect(result?.state).toBe(JobState.COMPLETED);
  });

  it("fails an in-flight job and stores stact trace", async () => {
    const job = await createJob("test-job", { value: 1 });

    await claimOldestJob("worker-1");
    const result = await failJob(job.id, new Error("Something went wrong"));
    expect(result?.state).toBe(JobState.FAILED);
    expect(result?.stackTrace).toContain("Something went wrong");
  });

  it("does not complete a completed job again", async () => {
    const job = await createJob("test-job", { value: 1 });
    await claimOldestJob("worker-1");
    await completeJob(job.id);

    const secondAttempt = await completeJob(job.id);

    expect(secondAttempt).toBeNull();
  });
  it("does not fail a completed job", async () => {
    const job = await createJob("test-job", { value: 1 });

    await claimOldestJob("worker-1");
    await completeJob(job.id);

    const result = await failJob(job.id, new Error("Too late"));

    expect(result).toBeNull();
  });
});
