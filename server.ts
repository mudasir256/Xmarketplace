import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { createChatSocketServer } from "./src/server/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true);
  handle(req, res, parsedUrl);
});

createChatSocketServer(httpServer);

httpServer.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname === "0.0.0.0" ? "localhost" : hostname}:${port}`);
  console.log(`> Socket.IO path /api/socketio`);
});
