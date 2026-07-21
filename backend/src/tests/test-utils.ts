import { jobs, workers } from "../db/schema";
import { WorkerStatus } from "../types/worker-status";
import { db, pool } from "../db";
import { JobState } from "../types/job-state";




export async function clearDatabase(){
    await db.delete(jobs);
    await db.delete(workers);
}

export async function closeDatabase(){
    await pool.end();
}

export async function createTestWorker(
    workerId: string,
    status = WorkerStatus.ALIVE,
    lastHeartbeat = new Date(),

){
    const [worker] = await db
    .insert(workers)
    .values({
        id: workerId,
        status,
        lastHeartbeat,
    })
    .returning();

    return worker
}


export async function createTestJob(
    type ="test-job",
    payload = {test: true},
    state = JobState.QUEUED,
){
    const [job] = await db.insert(jobs).values({
        type,
        payload,
        state,
    })
    .returning();

    return job;
}