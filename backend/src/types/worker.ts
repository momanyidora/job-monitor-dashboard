// This interface describes the worker record stored by the system.
import { WorkerStatus } from "./worker-status";

export interface Worker {
  id: string;
  status: WorkerStatus;
  lastHeartbeat: Date | null;
}
