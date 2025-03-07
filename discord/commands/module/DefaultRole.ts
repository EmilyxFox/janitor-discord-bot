import type { Command } from "$types/Command.ts";
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  inlineCode,
  InteractionContextType,
  italic,
  MessageFlags,
  PermissionFlagsBits,
  roleMention,
  SlashCommandBuilder,
  subtext,
  userMention,
} from "discord.js";
import { getLogger } from "@logtape/logtape";
import { db } from "$database/database.ts";
import { guildDefaultRoles } from "$database/schema.ts";
import { LibsqlError } from "@libsql/client";
import { eq } from "drizzle-orm/expressions";

const log = getLogger(["discord-bot", "command-handler"]);

export class DefaultRoleCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("defaultrole")
    .setDescription("Manage the default role of the guild.")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sc) =>
      sc
        .setName("set")
        .setDescription("Sets the default role of the guild.")
        .addRoleOption((sc) =>
          sc
            .setName("role")
            .setDescription("The role which will be assigned to any new member.")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("remove")
        .setDescription("Remove the default role of the guild.")
    )
    .addSubcommand((sc) =>
      sc
        .setName("info")
        .setDescription("See information about the default role of this guild.")
    );

  async run(interaction: ChatInputCommandInteraction): Promise<unknown> {
    switch (interaction.options.getSubcommand(false)) {
      case "set": {
        try {
          const roleOption = interaction.options.getRole("role", true);

          if (!interaction.inGuild()) {
            return interaction.reply({
              content: subtext("This command is only available in guilds."),
              flags: MessageFlags.Ephemeral,
            });
          }

          await db.insert(guildDefaultRoles).values({
            guildId: interaction.guildId,
            roleId: roleOption.id,
            setAt: new Date(interaction.createdTimestamp),
            setBy: interaction.user.id,
          }).returning().run();

          return interaction.reply({
            content: `Set ${roleMention(roleOption.id)} as the default role for this guild.`,
            flags: MessageFlags.Ephemeral,
          });
        } catch (error) {
          if (error instanceof LibsqlError) {
            if (error.code === "SQLITE_CONSTRAINT") {
              return interaction.reply({
                content: `A default role has already been set for this guild.\n\nTo avoid accidentally overwriting the default role please use ${
                  inlineCode("/defaultrole remove")
                } first.`,
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
      case "remove": {
        try {
          if (!interaction.inGuild()) {
            return interaction.reply({
              content: subtext("This command is only available in guilds."),
              flags: MessageFlags.Ephemeral,
            });
          }

          const del = await db.delete(guildDefaultRoles).where(eq(guildDefaultRoles.guildId, interaction.guildId)).returning();

          if (del.length > 0) {
            return interaction.reply({
              content: `Removed ${roleMention(del[0].roleId)} as the default role for this guild.`,
              flags: MessageFlags.Ephemeral,
            });
          } else {
            return interaction.reply({
              content: `There is no default role set for this guild.`,
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
          if (!interaction.inGuild()) {
            return interaction.reply({
              content: subtext("This command is only available in guilds."),
              flags: MessageFlags.Ephemeral,
            });
          }

          const [result] = await db.select().from(guildDefaultRoles).where(eq(guildDefaultRoles.guildId, interaction.guildId));

          if (result) {
            const embed = new EmbedBuilder()
              .setDescription(
                `Default role: ${roleMention(result.roleId)}\nSet by: ${userMention(result.setBy)}\nSet on: ${
                  result.setAt.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
                }`,
              );

            return interaction.reply({ embeds: [embed] });
          } else {
            const embed = new EmbedBuilder()
              .setDescription(`Default role: ${italic("not set")}`);

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
        log.error("Unknown subcommand");
        return interaction.reply({
          content: subtext("There was an error executing this command."),
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
}
