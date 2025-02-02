import { DiscordAPIError, Message, OmitPartialGroupDMChannel } from "discord.js";
import { env } from "$utils/env.ts";
import { getLogger } from "@logtape/logtape";

const log = getLogger(["discord-bot", "event-handler"]);

export const respondToGoodBot = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
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

  message.react("❤️");
};
