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
    .setName("fetchallstickers")
    .setDescription("Downloads all stickers of the server."),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const expressionType = ExpressionTypes.STICKER;
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
      const stickers = await interaction.guild.stickers.fetch();
      if (!stickers || stickers.size == 0) {
        await interaction.editReply({
          embeds: [
            createEmbed(
              `Unable to download ${expressionType}.`,
              `No ${expressionType} have been found: ${stickers}.`,
              "Orange",
            ),
          ],
        });
      }
      const fileBuffers = await downloadFilesToMemory(stickers, expressionType);
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
