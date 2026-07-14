// This file starts a simple WebSocket server for real-time updates.
import { WebSocketServer } from "ws";
import { env } from "../config/env";

const wss = new WebSocketServer({
  port: env.WS_PORT,
});

wss.on("connection", () => {
  // Each new client connection is logged for debugging purposes.
  console.log("Client connected");
});

console.log(`WebSocket Server running on port ${env.WS_PORT}`);
