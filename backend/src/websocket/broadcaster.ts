import { WebSocket } from "ws";

const clients = new Set<WebSocket>();

export function addClient(client: WebSocket) {
  clients.add(client);

  client.on("close", () => {
    clients.delete(client);
  });
}

export function broadcast(event: string, data: unknown) {
  const message = JSON.stringify({
    event,
    data,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
