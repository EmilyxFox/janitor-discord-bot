import type { Command } from "$types/Command.ts";
import { type ChatInputCommandInteraction, REST, Routes } from "discord.js";
import type { DiscordBot } from "./DiscordBot.ts";
import { PingCommand } from "$commands/Ping.ts";
import { BulkDeleteCommand } from "$commands/BulkDelete.ts";
import { CreatePollCommand } from "$commands/CreatePoll.ts";
import { env } from "$utils/env.ts";
import logger from "$logging/logger.ts";

export class CommandHandler {
  private commands: Command[];
  private discordREST: REST;

  constructor(token: string) {
    if (!token) {
      throw new Error("Invalid Discord token when registering commands");
    }

    this.commands = [new PingCommand(), new BulkDeleteCommand(), new CreatePollCommand()];
    this.discordREST = new REST().setToken(token);
  }

  getSlashCommands() {
    return this.commands.map((command: Command) => command.data.toJSON());
  }

  registerCommands() {
    logger.info("Registering commands...");
    const commands = this.getSlashCommands();
    this.discordREST
      .put(Routes.applicationCommands(env.CLIENT_ID), {
        body: commands,
      })
      .then((data: unknown) => {
        // Don't really know if this is a good way to do it :)
        if (Array.isArray(data)) {
          const commands: string[] = [];
          for (const command of data) {
            commands.push(command.name);
          }

          logger.info(`Successfully registered ${data.length} global application commands`, { commands });
        }
      })
      .catch((err: unknown) => {
        logger.error("Error registering application (/) commands", err);
      });
  }

  async handleCommand(
    interaction: ChatInputCommandInteraction,
    botClient: DiscordBot,
  ) {
    const commandName = interaction.commandName;

    const matchedCommand = this.commands.find(
      (command) => command.data.name === commandName,
    );

    if (!matchedCommand) {
      logger.warn("Command not found", {
        guild: { id: interaction.guildId },
        channel: { id: interaction.channelId },
        user: { name: interaction.user.displayName, id: interaction.user.id },
        interaction: { id: interaction.id },
        command: { name: interaction.commandName, id: interaction.commandId, subcommand: interaction.options.getSubcommand(false) },
      });
      return Promise.reject("Command not found");
    }

    await matchedCommand
      .run(interaction, botClient)
      .then(() => {
        logger.info(`Successfully executed command [/${interaction.commandName}]`, {
          guild: { id: interaction.guildId },
          channel: { id: interaction.channelId },
          user: { name: interaction.user.displayName, id: interaction.user.id },
          interaction: { id: interaction.id },
          command: { name: interaction.commandName, id: interaction.commandId, subcommand: interaction.options.getSubcommand(false) },
        });
      })
      .catch((error) => {
        logger.error(`Error executing command [/${interaction.commandName}]`, {
          guild: { id: interaction.guildId },
          channel: { id: interaction.channelId },
          user: { name: interaction.user.displayName, id: interaction.user.id },
          interaction: { id: interaction.id },
          command: { name: interaction.commandName, id: interaction.commandId, subcommand: interaction.options.getSubcommand(false) },
        }, error);
      });
  }
}
