import { DiscordAPIError, Message, OmitPartialGroupDMChannel } from "discord.js";
import { env } from "$utils/env.ts";
import logger from "$logging/logger.ts";

export const respondToGoodBot = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
  if (!message.reference?.messageId) return;

  const childLogger = logger.child({
    handler: {
      eventType: "messageCreate",
      name: "respondToGoodBot",
      event: {
        user: { id: message.author.id, name: message.author.username },
        guild: { id: message.guildId },
        message: { id: message.id, content: message.content },
      },
    },
  });

  const repliedTo = await message.channel.messages.fetch(message.reference.messageId)
    .catch((error) => {
      if (error instanceof DiscordAPIError) {
        if (error.code === 50001) {
          childLogger.warn("message not found", { error });
          return null;
        }
      }

      throw error;
    });
  if (!repliedTo) return;

  if (repliedTo.author.id !== env.CLIENT_ID) return;

  if (message.content.toLowerCase() !== "good bot") return;

  childLogger.info("Responding to good bot");

  message.react("❤️");
};
