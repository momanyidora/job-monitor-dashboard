import { enqueueJobs } from "./producer";

enqueueJobs().catch((error) => {
  console.error("Failed to enqueue jobs:", error);
  process.exit(1);
});
