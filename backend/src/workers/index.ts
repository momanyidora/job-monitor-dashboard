import { startWorker } from "./worker";

console.log("Worker started");

startWorker().catch((error) => {
  console.error("Worker crashed:", error);
  process.exit(1);
});
