import type { Command } from "$types/Command.ts";
import {
  bold,
  channelMention,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  subtext,
  userMention,
} from "discord.js";
import { db } from "$database/database.ts";
import { spoilerEnforcedChannels } from "$database/schema.ts";
import { getLogger } from "@logtape/logtape";
import { eq } from "drizzle-orm/expressions";
import { LibsqlError } from "@libsql/client";

const log = getLogger(["discord-bot", "command-handler"]);

export class EnforceSpoiler implements Command {
  data = new SlashCommandBuilder()
    .setName("enforcespoiler")
    .setDescription("Control spoiler enforcement in the current channel.")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand((sc) =>
      sc
        .setName("enable")
        .setDescription("Enable spoiler enforcement in the current channel.")
    )
    .addSubcommand((sc) =>
      sc
        .setName("disable")
        .setDescription("Disable spoiler enforcement in the current channel.")
    )
    .addSubcommand((sc) =>
      sc
        .setName("info")
        .setDescription("Get information about spoiler enforcement in the current channel.")
    );

  async run(interaction: ChatInputCommandInteraction): Promise<unknown> {
    switch (interaction.options.getSubcommand(false)) {
      case "enable": {
        try {
          await db.insert(spoilerEnforcedChannels).values({
            setAt: new Date(interaction.createdTimestamp),
            setBy: interaction.user.id,
            channelId: interaction.channelId,
          }).returning().run();

          return interaction.reply({
            content: `Enabled spoiler enforcement in ${channelMention(interaction.channelId)}.`,
            flags: MessageFlags.Ephemeral,
          });
        } catch (error) {
          if (error instanceof LibsqlError) {
            if (error.code === "SQLITE_CONSTRAINT") {
              return interaction.reply({
                content: `Spoiler enforcement is already enabled in ${channelMention(interaction.channelId)}.`,
                flags: MessageFlags.Ephemeral,
              });
            }
            log.error(`There was an error inserting into the database: {errorMessage}`, {
              errorMessage: `${error.name} ${error.message}`,
              errorStack: error.stack,
            });
          }
          return interaction.reply({
            content: subtext("There was an error executing this command."),
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      case "disable": {
        try {
          const del = await db.delete(spoilerEnforcedChannels).where(eq(spoilerEnforcedChannels.channelId, interaction.channelId));

          if (del.rowsAffected > 0) {
            return interaction.reply({
              content: `Disabled spoiler enforcement in ${channelMention(interaction.channelId)}.`,
              flags: MessageFlags.Ephemeral,
            });
          } else {
            return interaction.reply({
              content: `Spoiler enforcement is already disabled in ${channelMention(interaction.channelId)}.`,
              flags: MessageFlags.Ephemeral,
            });
          }
        } catch (error) {
          if (error instanceof Error) {
            log.error(`There was an error deleting from the database: {errorMessage}`, {
              errorMessage: `${error.name} ${error.message}`,
              errorStack: error.stack,
            });
          }
          return interaction.reply({
            content: subtext("There was an error executing this command."),
            flags: MessageFlags.Ephemeral,
          });
        }
      }
      case "info": {
        try {
          const [result] = await db.select().from(spoilerEnforcedChannels)
            .where(eq(spoilerEnforcedChannels.channelId, interaction.channelId));

          log.debug("Selected from database. { result }", { result: result });

          if (result) {
            const embed = new EmbedBuilder()
              .setDescription(
                `Spoiler enforcement: ${bold("Enabled")}\nEnabled by: ${userMention(result.setBy)}\nEnabled on: ${
                  result.setAt.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
                }`,
              );

            return interaction.reply({ embeds: [embed] });
          } else {
            const embed = new EmbedBuilder()
              .setDescription(`Spoiler enforcement: ${bold("Disabled")}`);

            return interaction.reply({ embeds: [embed] });
          }
        } catch (error) {
          if (error instanceof Error) {
            log.error(`There was an error selecting from the database: {errorMessage}`, {
              errorMessage: `${error.name} ${error.message}`,
              errorStack: error.stack,
            });
          }
          return interaction.reply({
            content: subtext("There was an error executing this command."),
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      default: {
        return interaction.reply({
          content: subtext("There was an error executing this command."),
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
}
