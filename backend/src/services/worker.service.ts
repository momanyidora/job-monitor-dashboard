// This small service exposes the worker identifier from the environment.
import { env } from "../config/env";
import { workers } from "../db/schema";
import { WorkerStatus } from "../types/worker-status";
import { eq, lt } from "drizzle-orm";
import { db } from "../db";

export async function registerWorker(workerId: string) {
  // console.log("Registering worker:", workerId)
  const existing = await db.query.workers.findFirst({
    where: eq(workers.id, workerId),
  });

  if (existing) return;

// console.log("Worker already exists");

  await db.insert(workers).values({
    id: workerId,
    status: WorkerStatus.ALIVE,
    lastHeartbeat: new Date(),
  });
  // console.log("Worker registered")
}
export function getWorkerId() {
  // The worker uses this value when claiming jobs from the queue.
  return env.WORKER_ID;
}

export async function heartbeat(workerId: string){
  // console.log("Heartbeat:", workerId)
  await db
  .update(workers)
  .set({
    lastHeartbeat: new Date(),
    status: WorkerStatus.ALIVE,
  })
  .where(eq(workers.id, workerId))

}

export async function detectDeadWorkers(){
  const threshold = new Date(
    Date.now() - 30 * 1000
  );
  await db
  .update(workers)
  .set({
    status: WorkerStatus.DEAD
  })
  .where(lt(workers.lastHeartbeat, threshold))
}
