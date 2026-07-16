// This file starts the Express API server and exposes a simple health-style route.
import express from "express";
import { env } from "./config/env";
import { detectDeadWorkers } from "./services/worker.service";
import { reclaimJobs } from "./services/job.service";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (_, res) => {
  // The root endpoint returns a basic API banner for quick verification.
  res.send("Background Job Monitor API");
});

app.listen(env.PORT, () => {
  // The server logs its listening port when it starts successfully.
  console.log(`API Server running on port ${env.PORT}`);
});

setInterval(async () => {
  await detectDeadWorkers();
  await reclaimJobs();
}, 10_000);
