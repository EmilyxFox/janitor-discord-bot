import { getLogger } from "@logtape/logtape";

const log = getLogger(["discord-bot"]);

export const healthcheckAbortSignalController = new AbortController();

class BotStauts {
  public available: boolean;
  constructor() {
    this.available = false;
  }

  public setAvailable() {
    this.available = true;
  }

  public setUnavailable() {
    this.available = false;
  }
}

export const botStatus = new BotStauts();

const healthcheckRequestHandler = (request: Request) => {
  const url = new URL(request.url);
  switch (url.pathname) {
    case "/healthcheck": {
      if (botStatus.available) {
        return new Response("OK", { status: 200 });
      } else {
        return new Response("Bot unavailable", { status: 503 });
      }
    }

    default: {
      return new Response("Not found", { status: 404 });
    }
  }
};

export const serveHealthCheck = () => {
  Deno.serve({
    port: 8080,
    hostname: "0.0.0.0",
    signal: healthcheckAbortSignalController.signal,
    onListen({ hostname, port }) {
      log.debug(`Serving healthcheck on http://${hostname}:${port}/healthcheck`);
    },
    handler: healthcheckRequestHandler,
  });
};
