import { Message, OmitPartialGroupDMChannel } from "discord.js";
import { env } from "$utils/env.ts";

export const respondToGoodBot = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
  if (!message.reference?.messageId) return;

  const repliedTo = await message.channel.messages.fetch(message.reference.messageId).catch((e) => console.log(e));
  if (!repliedTo) return;

  if (repliedTo.author.id !== env.CLIENT_ID) return;

  if (message.content.toLowerCase() !== "good bot") return;

  message.react("❤️");
};
