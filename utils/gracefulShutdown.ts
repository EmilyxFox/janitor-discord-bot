import { getLogger } from "@logtape/logtape";
import { DiscordBot } from "$discord/DiscordBot.ts";
import { healthcheckAbortSignalController } from "$utils/healthcheck.ts";

const log = getLogger(["system"]);

const shutdownGracefully = async (discordBot: DiscordBot) => {
  log.info("Shutting down gracefully...");
  try {
    log.debug("Destroying Discord client...");
    await discordBot.destroy();

    log.debug("Aborting healthcheck server...");
    healthcheckAbortSignalController.abort("shutdown");

    log.info("Bye!");
    Deno.exit(0);
  } catch (_error) {
    log.fatal("There was an error shutting down gracefully. Force closing...");
    Deno.exit(1);
  }
};

export const attachGracefulShutdownListeners = (bot: DiscordBot) => {
  log.debug("Attaching graceful shutdown listener");
  if (Deno.build.os === "windows" === false) {
    // "SIGTERM" is not supported on windows.
    // We therefore check if we're currently running on windows before adding this listener.
    // I also don't know if I like the if syntax, but I'm trying it out.
    log.debug("Not running on windows. Adding SIGTERM listener");
    Deno.addSignalListener("SIGTERM", () => shutdownGracefully(bot));
  }
  Deno.addSignalListener("SIGINT", () => shutdownGracefully(bot));
};
