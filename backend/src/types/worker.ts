import { WorkerStatus } from "./worker-status";


export interface Worker {
    id: string;
    status: WorkerStatus;
    lastHeartbeat: Date | null
}