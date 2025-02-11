import { getLogger } from "@logtape/logtape";
import { Attachment, EmbedBuilder, Events, Message, OmitPartialGroupDMChannel, subtext } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";
import { db } from "../../../database/database.ts";
import { spoilerEnforcedChannels } from "../../../database/schema.ts";
import { eq } from "drizzle-orm/expressions";

const log = getLogger(["discord-bot", "event-handler"]);

const filteredTypes = new Set(["video/mp4", "video/webm", "image/jpeg", "image/gif", "image/png"]);

const checkIfSpoilerEnforced = async (channelId: string) => {
  const [result] = await db.select().from(spoilerEnforcedChannels)
    .where(eq(spoilerEnforcedChannels.channelId, channelId));
  return !!result;
};

export class EnforceSpoiler implements EventHandlerFunction<Events.MessageCreate> {
  event = Events.MessageCreate as const;
  runOnce = false;
  async run(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.attachments.size <= 0) return;

    const filteredAttachments: Attachment[] = [];
    console.log(message.attachments);
    message.attachments.forEach((a) => {
      if (a.name.startsWith("SPOILER_")) return;

      if (a.contentType && filteredTypes.has(a.contentType)) {
        filteredAttachments.push(a);
      }
    });

    if (filteredAttachments.length > 0) {
      const isSpoilerEnforced = await checkIfSpoilerEnforced(message.channelId);

      if (!isSpoilerEnforced) return;

      message.delete();
      const badAttach = filteredAttachments.map((a) => `\`${a.name}\``).join("\n");
      const embed = new EmbedBuilder()
        .setTitle("Spoilering is enforced in this channel")
        .setColor(0xFF0000)
        .setDescription(
          `The following attachments were not spoilered:\n${badAttach}\n\n${
            subtext(`The following content types must be spoilered: ${[...filteredTypes].join(", ")}`)
          }`,
        )
        .setTimestamp()
        .setFooter({
          text: message.client.user.username,
          iconURL: message.client.user.avatarURL({ size: 32 }) || "https://cdn.discordapp.com/embed/avatars/1.png",
        });
      message.channel.send({ embeds: [embed] });

      log.info("Non-spoilered media sent in spoiler-enforced channel.", {
        channel: message.channelId,
        user: message.author.id,
        message: message.id,
      });
    }
  }
}
