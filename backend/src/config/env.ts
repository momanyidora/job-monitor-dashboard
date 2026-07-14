// This file loads environment variables and exposes them through a single config object.
import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Database connection string used by the app and the worker services.
  DATABASE_URL: process.env.DATABASE_URL,
  // HTTP port for the API server.
  PORT: Number(process.env.PORT),
  // Port used by the WebSocket server.
  WS_PORT: Number(process.env.WS_PORT),
  // Unique worker identifier taken from the environment.
  WORKER_ID: process.env.WORKER_ID!,
};
