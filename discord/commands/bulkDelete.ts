import type { Command } from "$types/command.ts";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageActionRowComponentBuilder,
  SlashCommandBuilder,
} from "discord.js";
import type { DiscordBot } from "../client.ts";

export class BulkDeleteCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("bulkdelete")
    .setDescription("Deletes the last X amount of messages")
    .addNumberOption((opt) =>
      opt
        .setName("amount")
        .setDescription("The amount of messages to attempt to delete.")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    );

  async run(
    interaction: ChatInputCommandInteraction,
    _botClient: DiscordBot,
  ): Promise<unknown> {
    if (!interaction.channel?.isSendable()) {
      return;
    }
    if (interaction.channel.isDMBased()) {
      return interaction.reply("This command is only available in guilds.");
    }
    const deleteAmount = interaction.options.getNumber("amount");
    if (!deleteAmount) {
      return interaction.reply("No amount specified.");
    }

    const confirm = new ButtonBuilder()
      .setCustomId("bulkdeleteconfirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId("bulkdeletecancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      cancel,
      confirm,
    );

    const confirmMessage = await interaction.reply({
      content: `Are you sure you want to bulk delete ${deleteAmount} messages?`,
      components: [row],
      withResponse: true,
    });

    try {
      const confirmation = await confirmMessage.resource?.message?.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 60_000,
      });

      if (confirmation?.customId === "bulkdeleteconfirm") {
        confirmMessage.resource?.message?.delete();

        interaction.channel.bulkDelete(deleteAmount);
      } else if (confirmation?.customId === "bulkdeletecancel") {
        interaction.editReply({
          content: "Bulk deletion cancelled.",
          components: [],
        });

        setTimeout(async () => {
          await confirmMessage.resource?.message?.delete();
        }, 3_000);
      }
    } catch {
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });
    }
  }
}
