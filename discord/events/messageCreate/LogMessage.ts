import { getLogger } from "@logtape/logtape";
import { Events, Message, OmitPartialGroupDMChannel } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const log = getLogger(["discord-bot", "event-handler"]);

// This event handler is not used
export class LogMessage implements EventHandlerFunction<Events.MessageCreate> {
  event = Events.MessageCreate as const;
  runOnce = false;
  run(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    log.debug(`[${message.author.displayName}]: ${message.content}`);
  }
}
