// This worker loop claims queued jobs, simulates work, and updates the job state.
import { claimOldestJob, completeJob, failJob } from "../services/job.service";
import { getWorkerId } from "../services/worker.service";
import { registerWorker } from "../services/worker.service";
import { heartbeat, detectDeadWorkers} from "../services/worker.service";



function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function startWorker() {

  const workerId = getWorkerId();

  await registerWorker(workerId);

  setInterval(async () => {
    await heartbeat(workerId);
  }, 10_000);

  setInterval(async () => {
    await detectDeadWorkers();
  }, 10_000);
  while (true) {



    // Try to take the oldest queued job for this worker.
    const job = await claimOldestJob(workerId);

    if (!job) {
      // No job is available right now, so the worker waits briefly and tries again.
      await sleep(1000);
      continue;
    }

    console.log(`Worker ${workerId} processing ${job.type}`);

    try {
      // Simulate work before marking the job as done.
      await sleep(3000);

      if (job.type === "generate-report") {
        throw new Error("Report generation failed.");
      }

      await completeJob(job.id);

      console.log(`Completed ${job.id}`);
    } catch (error) {
      // If processing fails, the job is marked as failed with the error details.
      await failJob(job.id, error as Error);

      console.log(`Failed ${job.id}`);
    }
  }
}


