// This small service exposes the worker identifier from the environment.
import { env } from "../config/env";

export function getWorkerId() {
  // The worker uses this value when claiming jobs from the queue.
  return env.WORKER_ID;
}
