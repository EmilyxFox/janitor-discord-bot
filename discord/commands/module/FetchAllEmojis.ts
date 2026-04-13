import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { downloadFilesToMemory } from "../helpers/DownloadFile.ts";
import { createErrorEmbed, createEmbed } from "../helpers/EmbedMessage.ts";
import { ExpressionTypes } from "$types/ExpressionTypes.ts";
import { createZipInMemory } from "../helpers/CreateZip.ts";
import { sendZipAttachmentMemory } from "../helpers/AttachmentSender.ts";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fetchallemojis")
    .setDescription("Downloads all emojis of the server."),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const expressionType = ExpressionTypes.EMOJI;
      if (!interaction || !interaction.guild) {
        await interaction.editReply({
          embeds: [
            createEmbed(
              `Unable to download ${expressionType}.`,
              `Interaction or guild is null.`,
              "Red",
            ),
          ],
        });
        return;
      }
      const emojis = await interaction.guild.emojis.fetch();
      if (!emojis || emojis.size == 0) {
        await interaction.editReply({
          embeds: [
            createEmbed(
              `Unable to download ${expressionType}.`,
              `No ${expressionType} have been found: ${emojis}.`,
              "Orange",
            ),
          ],
        });
        return;
      }
      const fileBuffers = await downloadFilesToMemory(emojis, expressionType);
      const zipBuffer = await createZipInMemory(fileBuffers);
      const attachment = await sendZipAttachmentMemory(
        expressionType,
        zipBuffer,
      );
      await interaction.editReply({
        content: `✅ Here are your ${expressionType}!`,
        files: [attachment],
      });
    } catch (error: any) {
      console.error(error);
      await interaction.editReply({ embeds: [createErrorEmbed(error)] });
    }
  },
};
