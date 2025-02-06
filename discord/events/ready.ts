import { Client } from "discord.js";
import { getLogger } from "@logtape/logtape";
import { botStatus } from "$utils/healthcheck.ts";

const log = getLogger(["discord-bot"]);

export const botReadyHandler = (client: Client<true>) => {
  log.info(`Logged in as ${client.user?.tag}`);

  botStatus.setAvailable();
};
