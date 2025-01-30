import type { Command } from "$types/Command.ts";
import {
  type ChatInputCommandInteraction,
  hideLinkEmbed,
  hyperlink,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  subtext,
} from "discord.js";
import type { DiscordBot } from "../DiscordBot.ts";
import { env } from "$utils/env.ts";

export class GitHubCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("github")
    .setDescription("Various commands related to the GitHub repository for this bot.")
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM])
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addSubcommand((sc) =>
      sc
        .setName("repo")
        .setDescription("Sends a link to the GitHub repository.")
    )
    .addSubcommandGroup((scg) =>
      scg
        .setName("issues")
        .setDescription("Commands related to issues in the GitHub repository.")
        .addSubcommand((sc) =>
          sc.setName("show")
            .setDescription("Sends a link to the issues tab in the GitHub repository.")
        )
        .addSubcommand((sc) =>
          sc
            .setName("new")
            .setDescription("Sends a link to open a new issue in the GitHub repository.")
        )
    );

  run(
    interaction: ChatInputCommandInteraction,
    _botClient: DiscordBot,
  ): Promise<unknown> {
    const repoUrl = new URL(env.REPO_URL);
    switch (interaction.options.getSubcommandGroup()) {
      case "issues": {
        switch (interaction.options.getSubcommand()) {
          case "show": {
            return interaction.reply({ content: `${hyperlink("GitHub Issues", new URL("issues", repoUrl))}` });
          }
          case "new": {
            return interaction.reply({ content: `${hyperlink("Create new GitHub issue", hideLinkEmbed(new URL("issues/new/choose", repoUrl)))}` });
          }

          default: {
            return interaction.reply(`${subtext("There was an error executing this command.")}`);
          }
        }
      }
      default: {
        switch (interaction.options.getSubcommand()) {
          case "repo": {
            return interaction.reply({ content: `${hyperlink("GitHub Repository", repoUrl)}` });
          }

          default: {
            return interaction.reply(`${subtext("There was an error executing this command.")}`);
          }
        }
      }
    }
  }
}
