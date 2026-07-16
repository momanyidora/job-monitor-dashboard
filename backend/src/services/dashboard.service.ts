import { db } from "../db";
import { JobState } from "../types/job-state";
import { jobs, workers } from "../db/schema";
import { eq, sql, desc } from "drizzle-orm";




export async function getQueueDepth(){
    return db
    .select({
        type: jobs.type,
        count: sql<number>`count(*)`,
    })
    .from(jobs).where(eq(jobs.state, JobState.QUEUED))
    .groupBy(jobs.type);
}
export async function getInFlightJobs(){
    return db.query.jobs.findMany({
        where: eq(jobs.state, JobState.IN_FLIGHT),
    })
}


export async function getCompletedJobs(){
    return db.query.jobs.findMany({
        where: eq(jobs.state, JobState.COMPLETED),
        orderBy: [desc(jobs.finishTime)]
    })
}

export async function getFailedJobs(){
    return db.query.jobs.findMany({
        where: eq(jobs.state, JobState.FAILED)
    })
}

export async function getWorkers(){
    return db.select().from(workers)
}