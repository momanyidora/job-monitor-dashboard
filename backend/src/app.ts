import express from "express";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(express.json());

app.use("/api/dashboard", dashboardRoutes);

app.get("/", (_, res) => {
  res.send("Background Job Monitor API");
});

export default app;
