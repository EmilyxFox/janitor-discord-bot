import { getLogger } from "@logtape/logtape";
import { Client } from "discord.js";

const log = getLogger(["discord-bot"]);

export const healthcheckAbortSignalController = new AbortController();

class BotStauts {
  public available: boolean;
  public lastPing: number | null;
  constructor() {
    this.available = false;
    this.lastPing = null;
  }

  public setAvailable() {
    this.available = true;
  }

  public setUnavailable() {
    this.available = false;
  }

  public updatePing(ping: number | null) {
    this.lastPing = ping;
  }
}

export const botStatus = new BotStauts();

const getStatusName = (statusCode: number): string => {
  switch (statusCode) {
    case 0:
      return "Connected";
    case 1:
      return "Connecting";
    case 2:
      return "Reconnecting";
    case 3:
      return "Disconnected";
    default:
      return "Unknown";
  }
};

const healthcheckRequestHandler = (request: Request, client: Client) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case "/healthcheck": {
      const status = getStatusName(client.ws.status);
      const respBody = {
        status,
        ping: status === "Connected" ? client.ws.ping : null,
      };

      return new Response(JSON.stringify(respBody), {
        status: status === "Connected" ? 200 : 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    default: {
      return new Response("Not found", { status: 404 });
    }
  }
};

export const serveHealthCheck = (client: Client) => {
  Deno.serve({
    port: 8080,
    hostname: "0.0.0.0",
    signal: healthcheckAbortSignalController.signal,
    onListen({ hostname, port }) {
      log.debug(`Serving healthcheck on http://${hostname}:${port}/healthcheck`);
    },
    handler: (request) => healthcheckRequestHandler(request, client),
  });
};
