import { ButtonInteraction, CacheType, Events, Interaction, MessageFlags, PermissionFlagsBits } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";

export class HandleButton implements EventHandlerFunction<Events.InteractionCreate> {
  event = Events.InteractionCreate as const;
  runOnce = false;
  run: (interaction: Interaction<CacheType>) => unknown = async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.channel?.isTextBased()) return;

    let parsedId;
    try {
      parsedId = parseButtonId(interaction.customId);
    } catch (_error) {
      return interaction.reply({
        content: "Invalid button format.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (parsedId.action === "dismiss") {
      switch (parsedId?.permission) {
        case "admin": {
          if (!interaction.inGuild()) {
            return interaction.reply({
              content: "This permission type is only supported in guilds.",
              flags: MessageFlags.Ephemeral,
            });
          }

          const user = await interaction.guild?.members.fetch(interaction.user.id);
          if (!user) {
            return interaction.reply({
              content: "Error fetching permissions.",
              flags: MessageFlags.Ephemeral,
            });
          }
          if (user.permissionsIn(interaction.channelId).has(PermissionFlagsBits.ManageMessages)) {
            await dismissMessage(interaction);
          }
          break;
        }
        case "user": {
          const repliedMessageId = interaction.message.reference?.messageId;
          if (!repliedMessageId) {
            return interaction.reply({
              content: "I can't figure out whether you are allowed to dismiss this message.",
              flags: MessageFlags.Ephemeral,
            });
          }
          const repliedMessage = await interaction.channel.messages.fetch(repliedMessageId);
          if (repliedMessage.author.id === interaction.user.id) {
            return await dismissMessage(interaction);
          } else if (interaction.inGuild()) {
            const user = await interaction.guild?.members.fetch(interaction.user.id);
            if (!user) {
              return interaction.reply({
                content: "Error fetching permissions.",
                flags: MessageFlags.Ephemeral,
              });
            }
            if (user.permissionsIn(interaction.channelId).has(PermissionFlagsBits.ManageMessages)) {
              await dismissMessage(interaction);
            }
          } else {
            return interaction.reply({
              content: "This message can only be dismissed by the user who triggered it or an admin.",
              flags: MessageFlags.Ephemeral,
            });
          }

          break;
        }
        case "any": {
          await dismissMessage(interaction);
          break;
        }
        default:
          interaction.reply({
            content: "Unknown button permissons.",
            flags: MessageFlags.Ephemeral,
          });
          break;
      }
    } else {
      interaction.reply({
        content: "Unknown button interaction.",
        flags: MessageFlags.Ephemeral,
      });
    }
  };
}

const parseButtonId = (customId: string): { action: string; permission: string; value: string | null } => {
  const parts = customId.split(":");

  if (parts.length < 2 || parts.length > 3) {
    throw new Error("Invalid button format");
  }

  return {
    action: parts[0],
    permission: parts[1],
    value: parts[2] || "", // Default to empty string if the value is omitted
  };
};

const dismissMessage = async (interaction: ButtonInteraction<CacheType>) => {
  try {
    await interaction.message.delete();
    interaction.reply({
      content: "Message removed.",
      flags: MessageFlags.Ephemeral,
    });
  } catch (_error) {
    interaction.reply({
      content: "There was an error removing this message.",
      flags: MessageFlags.Ephemeral,
    });
  }
};
