import { DiscordAPIError, Events, Message, OmitPartialGroupDMChannel } from "discord.js";
import { getLogger } from "@logtape/logtape";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const logger = getLogger(["discord-bot", "event-handler"]);

export class RespondToGoodBot implements EventHandlerFunction<Events.MessageCreate> {
  event = Events.MessageCreate as const;
  runOnce = false;
  async run(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (!message.reference?.messageId) return;

    const referencedMessageId = message.reference.messageId;

    const log = logger.with({
      messageId: message.id,
      channelId: message.channelId,
      authorId: message.author.id,
      referencedMessageId,
    });

    const repliedTo = await message.channel.messages.fetch(referencedMessageId)
      .catch((error: unknown) => {
        if (error instanceof DiscordAPIError) {
          if (error.code === 10008) {
            return log.warn("Unknown Message error in respondToGoodBot.ts. Tried to fetch { fetchedMessageId }", {
              errorMessage: `${error.name} ${error.message}`,
              errorStack: error.stack,
            });
          }
        }

        throw error;
      });
    if (!repliedTo) return;

    if (repliedTo.author.id !== message.client.user.id) return;

    if (message.content.toLowerCase() !== "good bot") return;

    log.info(`Responding to good bot.`, { messageId: message.id });
    message.react("❤️");
  }
}
