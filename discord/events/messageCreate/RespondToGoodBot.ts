import { DiscordAPIError, Events, Message, OmitPartialGroupDMChannel } from "discord.js";
import { env } from "$utils/env.ts";
import { getLogger } from "@logtape/logtape";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const log = getLogger(["discord-bot", "event-handler"]);

export class RespondToGoodBot implements EventHandlerFunction<Events.MessageCreate> {
  event = Events.MessageCreate as const;
  runOnce = false;
  async run(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (!message.reference?.messageId) return;

    const repliedTo = await message.channel.messages.fetch(message.reference.messageId)
      .catch((error) => {
        if (error instanceof DiscordAPIError) {
          if (error.code === 10008) {
            return log.warn("Unknown Message error in respondToGoodBot.ts", {
              errorMessage: `${error.name} ${error.message}`,
              errorStack: error.stack,
            });
          }
        }

        throw error;
      });
    if (!repliedTo) return;

    if (repliedTo.author.id !== env.CLIENT_ID) return;

    if (message.content.toLowerCase() !== "good bot") return;

    log.info(`Responding to good bot.`, { messageId: message.id });
    message.react("❤️");
  }
}
