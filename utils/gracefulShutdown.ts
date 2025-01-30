import { DiscordBot } from "../discord/DiscordBot.ts";
import logger from "$logging/logger.ts";

const shutdownGracefully = async (discordBot: DiscordBot) => {
  try {
    logger.verbose("Destroying Discord client...");
    await discordBot.discordClient.destroy();

    logger.info("Shutting down...");
    Deno.exit(0);
  } catch (_error) {
    logger.warn("There was an error shutting down gracefully. Force closing...");
    Deno.exit(1);
  }
};

export const attachGracefulShutdownListeners = (bot: DiscordBot) => {
  logger.verbose("Attaching graceful shutdown listeners");
  if (Deno.build.os === "windows" === false) {
    logger.debug("Not running on Windows... Attaching SIGTERM listener too...");
    // "SIGTERM" is not supported on windows.
    // We therefore check if we're currently running on windows before adding this listener.
    // I also don't know if I like the if syntax, but I'm trying it out.
    Deno.addSignalListener("SIGTERM", () => shutdownGracefully(bot));
  }
  Deno.addSignalListener("SIGINT", () => shutdownGracefully(bot));
};
