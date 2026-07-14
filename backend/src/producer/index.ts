// This entry point runs the job producer once and exits after the queue has been filled.
import { enqueueJobs } from "./producer";

enqueueJobs()
  .then(() => process.exit(0))
  .catch((error) => {
    // Any error from job creation is logged and then the process exits with a failure status.
    console.error(error);
    process.exit(1);
  });
