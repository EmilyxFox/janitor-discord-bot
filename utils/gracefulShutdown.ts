import { DiscordBot } from "../discord/DiscordBot.ts";

const shutdownGracefully = async (discordBot: DiscordBot) => {
  try {
    console.log("Destroying Discord client...");
    await discordBot.discordClient.destroy();

    console.log("Shutting down...");
    Deno.exit(0);
  } catch (_error) {
    console.log("There was an error shutting down gracefully. Force closing...");
    Deno.exit(1);
  }
};

export const attachGracefulShutdownListeners = (bot: DiscordBot) => {
  if (Deno.build.os === "windows" === false) {
    // "SIGTERM" is not supported on windows.
    // We therefore check if we're currently running on windows before adding this listener.
    // I also don't know if I like the if syntax, but I'm trying it out.
    Deno.addSignalListener("SIGTERM", () => shutdownGracefully(bot));
  }
  Deno.addSignalListener("SIGINT", () => shutdownGracefully(bot));
};
