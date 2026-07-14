import { WebSocketServer } from "ws";
import { env } from "../config/env";

const wss = new WebSocketServer({
  port: env.WS_PORT,
});

wss.on("connection", () => {
  console.log("Client connected");
});

console.log(`WebSocket Server running on port ${env.WS_PORT}`);
