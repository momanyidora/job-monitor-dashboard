// This file starts the Express API server and exposes a simple health-style route.
import express from "express";
import { env } from "./config/env";

const app = express();
app.use(express.json());

app.get("/", (_, res) => {
  // The root endpoint returns a basic API banner for quick verification.
  res.send("Background Job Monitor API");
});

app.listen(env.PORT, () => {
  // The server logs its listening port when it starts successfully.
  console.log(`API Server running on port ${env.PORT}`);
});
