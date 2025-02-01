import { getLogger } from "@logtape/logtape";
import { Message, OmitPartialGroupDMChannel } from "discord.js";

const log = getLogger(["discord-bot", "event-handler"]);

export const logMessage = (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
  log.debug(`[${message.author.displayName}]: ${message.content}`);
};
