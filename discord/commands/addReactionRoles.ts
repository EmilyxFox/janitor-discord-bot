import { ContextMenuCommand } from "$types/ContextMenuCommand.ts";
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  InteractionContextType,
  MessageActionRowComponentBuilder,
  PermissionFlagsBits,
  roleMention,
  RoleSelectMenuBuilder,
} from "discord.js";
import type { DiscordBot } from "../client.ts";

export class AddReactionRoles implements ContextMenuCommand {
  data = new ContextMenuCommandBuilder()
    .setName("Add reaction roles to message")
    .setType(ApplicationCommandType.Message)
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles | PermissionFlagsBits.ManageMessages);

  async run(
    interaction: ContextMenuCommandInteraction,
    _botClient: DiscordBot,
  ): Promise<unknown> {
    if (!interaction.isMessageContextMenuCommand()) return;

    const target = interaction.targetMessage;
    if (!target) return;

    const reply = await interaction.reply({
      content: "Please send a message containing only the emote you would like to represent the role.",
      withResponse: true,
    });
    if (!reply.resource?.message?.channel.isSendable()) return;

    const awaitedEmojiMessage = await reply.resource.message.channel.awaitMessages({
      filter: (message) => message.author.id === interaction.user.id,
      max: 1,
      time: 30_000,
    });

    const emojiMessageContent = awaitedEmojiMessage.at(0)?.content;

    if (awaitedEmojiMessage.size < 1 || !emojiMessageContent) {
      return await interaction.editReply({
        content: "No emote received in 30 seconds. Cancelling",
        components: [],
        embeds: [],
      });
    }

    const emojiSnowflake = emojiMessageContent.match(/(?<=\:)\d+/) ?? [""];

    const emoji = interaction.client.emojis.resolve(emojiSnowflake[0]);

    awaitedEmojiMessage.at(0)?.delete();

    const roleSelector = new RoleSelectMenuBuilder()
      .setCustomId("reactionrole-roles-selector")
      .setPlaceholder("Select the role(s) you want this button to assign.")
      .setMinValues(1)
      .setMaxValues(10);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(roleSelector);

    await interaction.editReply({ content: "Please select the roles which you want this button to assign.", components: [row] });

    const rolesSelectInteraction = await reply.resource.message.awaitMessageComponent({
      filter: (i) => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      },
      time: 30_000,
      componentType: ComponentType.RoleSelect,
    });

    if (rolesSelectInteraction.values.length < 1) {
      return await interaction.editReply({
        content: "No roles received in 30 seconds. Cancelling",
        components: [],
        embeds: [],
      });
    }

    const roleNamesMentions: string[] = [];
    rolesSelectInteraction.roles.each((role) => {
      roleNamesMentions.push(`${roleMention(role.id)}`);
    });

    const confirm = new ButtonBuilder()
      .setCustomId("reactionrole-confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Primary);

    const cancel = new ButtonBuilder()
      .setCustomId("reactionrole-cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);

    const cancelConfirmButtonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      cancel,
      confirm,
    );

    interaction.editReply({
      content: `Give people the roles ${roleNamesMentions.join(", ")} when they click the button with ${emoji}?`,
      components: [cancelConfirmButtonRow],
      embeds: [],
    });

    const confirmation = await reply.resource.message.awaitMessageComponent({
      filter: (i) => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      },
      time: 30_000,
      componentType: ComponentType.Button,
    });

    if (confirmation.customId === "reactionrole-cancel") {
      interaction.editReply({
        content: "Interaction has been cancelled.",
        components: [],
        embeds: [],
      });
    } else if (confirmation.customId === "reactionrole-confirm") {
      interaction.editReply({
        content: "Pretend that it did something really cool right here that requires me to set up a database and everything.",
        components: [],
        embeds: [],
      });
    }
  }
}
