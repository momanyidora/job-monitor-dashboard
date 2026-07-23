import app from "./app";
import { env } from "./config/env";
import { detectDeadWorkers } from "./services/worker.service";
import { reclaimJobs } from "./services/job.service";
import "./websocket/server"


app.listen(env.PORT, () => {
  // The server logs its listening port when it starts successfully.
  console.log(`API Server running on port ${env.PORT}`);
});

setInterval(async () => {
  await detectDeadWorkers();
  await reclaimJobs();
}, 10_000);
