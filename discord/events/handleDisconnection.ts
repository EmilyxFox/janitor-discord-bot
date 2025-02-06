import { getLogger } from "@logtape/logtape";
import { botStatus } from "$utils/healthcheck.ts";
import { CloseEvent } from "discord.js";

const log = getLogger(["discord-bot"]);

export const handleDisconnection = (error: CloseEvent) => {
  log.info(`Discord connection lost...`, { error: error });

  botStatus.setUnavailable();
};
