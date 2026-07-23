import { db, pool } from "../db";
import { workers } from "../db/schema";
import { beforeEach, afterAll, describe, expect, it } from "vitest";
import { WorkerStatus } from "../types/worker-status";
import { heartbeat, detectDeadWorkers } from "../services/worker.service";
import { eq } from "drizzle-orm";

beforeEach(async () => {
  await db.delete(workers);
});
afterAll(async () => {
  await pool.end();
});

describe("worker heartbeat and dead detection", () => {
  it("worker with a recent heartbeat remains alive", async () => {
    await db.insert(workers).values({
      id: "worker-1",
      status: WorkerStatus.ALIVE,
      lastHeartbeat: new Date(),
    });
    await detectDeadWorkers();
    const worker = await db.query.workers.findFirst({
      where: eq(workers.id, "worker-1"),
    });
    expect(worker?.status).toBe(WorkerStatus.ALIVE);
  });

  it("worker older than 30 seconds becomes dead", async () => {
    const oldHeartbeat = new Date(Date.now() - 31_000);

    await db.insert(workers).values({
      id: "worker-1",
      status: WorkerStatus.ALIVE,
      lastHeartbeat: oldHeartbeat,
    });

    await detectDeadWorkers();
    const worker = await db.query.workers.findFirst({
      where: eq(workers.id, "worker-1"),
    });
    expect(worker?.status).toBe(WorkerStatus.DEAD);
  });

  it("worker exactly at the 30 second boundary is not marked dead", async () => {
    const heartbeatTime = new Date(Date.now() - 29_000);

    await db.insert(workers).values({
      id: "worker-1",
      status: WorkerStatus.ALIVE,
      lastHeartbeat: heartbeatTime,
    });
    await detectDeadWorkers();

    const worker = await db.query.workers.findFirst({
      where: eq(workers.id, "worker-1"),
    });

    expect(worker?.status).toBe(WorkerStatus.ALIVE);
  });

  it("a dead worker taht resumes hartbeating becomes alive again", async () => {
    await db.insert(workers).values({
      id: "worker-1",
      status: WorkerStatus.DEAD,
      lastHeartbeat: new Date(Date.now() - 31_000),
    });
    await heartbeat("worker-1");

    const worker = await db.query.workers.findFirst({
      where: eq(workers.id, "worker-1"),
    });

    expect(worker?.status).toBe(WorkerStatus.ALIVE);
  });

  it("worker with no heartbeat is not incorrectly revived by dead detection", async () => {
    await db.insert(workers).values({
      id: "worker-1",
      status: WorkerStatus.ALIVE,
      lastHeartbeat: null,
    });

    await detectDeadWorkers();

    const worker = await db.query.workers.findFirst({
      where: eq(workers.id, "worker-1"),
    });

    expect(worker?.status).toBe(WorkerStatus.ALIVE);
  });
});
