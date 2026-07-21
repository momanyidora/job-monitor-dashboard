import { beforeEach, afterAll, describe, expect, it } from "vitest";

import { createJob, claimOldestJob } from "../services/job.service";

import { db, pool } from "../db";
import { jobs } from "../db/schema";

beforeEach(async () => {
  await db.delete(jobs);
});

afterAll(async () => {
  await pool.end();
});

describe("Job claiming edge cases", () => {
  it("returns null when there are no queued jobs", async () => {
    const result = await claimOldestJob("worker-1");

    expect(result).toBeNull();
  });

  it("claims the oldest job first", async () => {
    const first = await createJob("first", {});

    await new Promise((resolve) => setTimeout(resolve, 10));

    const second = await createJob("second", {});

    const claimed = await claimOldestJob("worker-1");

    expect(claimed?.id).toBe(first.id);
    expect(claimed?.id).not.toBe(second.id);
  });

  it("does not claim a job that is already in flight", async () => {
    const job = await createJob("test-job", {});

    const first = await claimOldestJob("worker-1");
    const second = await claimOldestJob("worker-2");

    expect(first?.id).toBe(job.id);
    expect(second).toBeNull();
  });

  it("two workers competing for one job never claim the same job", async () => {
    const job = await createJob("test-job", {});

    const [worker1, worker2] = await Promise.all([
      claimOldestJob("worker-1"),
      claimOldestJob("worker-2"),
    ]);

    const claimedJobs = [worker1, worker2].filter(Boolean);

    expect(claimedJobs).toHaveLength(1);
    expect(claimedJobs[0]?.id).toBe(job.id);
  });

  it("claims jobs according to arrival order", async () => {
    const first = await createJob("first", {});
    const second = await createJob("second", {});
    const third = await createJob("third", {});

    const claimed1 = await claimOldestJob("worker-1");
    const claimed2 = await claimOldestJob("worker-2");
    const claimed3 = await claimOldestJob("worker-3");

    expect(claimed1?.id).toBe(first.id);
    expect(claimed2?.id).toBe(second.id);
    expect(claimed3?.id).toBe(third.id);
  });
});
