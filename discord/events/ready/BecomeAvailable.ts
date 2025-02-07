import { Client, Events } from "discord.js";
import { getLogger } from "@logtape/logtape";
import { botStatus } from "$utils/healthcheck.ts";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const log = getLogger(["discord-bot"]);

export class BotLoggedInAndAvailble implements EventHandlerFunction<Events.ClientReady> {
  event = Events.ClientReady as const;
  runOnce = true;
  run(client: Client<true>) {
    log.info(`Logged in as ${client.user?.tag}`);

    botStatus.setAvailable();
  }
}
