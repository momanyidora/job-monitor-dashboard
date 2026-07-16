import { Request, Response } from "express";
import { getCompletedJobs, getFailedJobs, getInFlightJobs, getQueueDepth, getWorkers } from "../services/dashboard.service";
import { retryJob } from "../services/job.service";





export async function queueDepth(req: Request, res: Response){
    res.json(await getQueueDepth());
}

export async function inFlight(req: Request, res: Response){
    res.json(await getInFlightJobs())
}
export async function completed(req: Request, res: Response){
    res.json(await getCompletedJobs())
}

export async function failed(req: Request, res: Response){
    res.json(await getFailedJobs())
}

export async function workersList(req: Request, res: Response){
    res.json(await getWorkers())
}


export async function retryFailedJobs(req: Request, res: Response) {
    const {id} = req.params;
  const job = await retryJob(id as string);

  if(!job){
    return res.status(404).json({
        message: "Failed job not found."
    });
  }

  res.json({
    message: "Job queued for retry",
    job,
  })
}
