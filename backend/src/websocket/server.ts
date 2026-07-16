import { WebSocketServer } from "ws";
import { env } from "../config/env";
import { addClient } from "./broadcaster";

const wss = new WebSocketServer({
  port: env.WS_PORT,
});

wss.on("connection", (socket) => {
  console.log("Dashboard connected");

  addClient(socket);

  socket.send(
    JSON.stringify({
      event: "connected",
      data: "Connected to Job Monitor",
    }),
  );
});

console.log(`WebSocket Server running on ${env.WS_PORT}`);
