import type { Command } from "$types/Command.ts";
import { type ChatInputCommandInteraction, REST, Routes } from "discord.js";
import { PingCommand } from "$commands/Ping.ts";
import { BulkDeleteCommand } from "$commands/BulkDelete.ts";
import { CreatePollCommand } from "$commands/CreatePoll.ts";
import { env } from "$utils/env.ts";
import { GitHubCommand } from "$commands/GitHub.ts";
import { getLogger, withContext } from "@logtape/logtape";

const log = getLogger(["discord-bot", "command-handler"]);

export class CommandHandler {
  private commands: Command[];
  private discordREST: REST;

  constructor(token: string) {
    if (!token) {
      throw new Error("Invalid Discord token when registering commands");
    }

    this.commands = [new PingCommand(), new BulkDeleteCommand(), new CreatePollCommand(), new GitHubCommand()];
    this.discordREST = new REST().setToken(token);
  }

  getSlashCommands() {
    return this.commands.map((command: Command) => command.data.toJSON());
  }

  registerCommands() {
    log.info("Registering commands...");
    const commands = this.getSlashCommands();
    this.discordREST
      .put(Routes.applicationCommands(env.CLIENT_ID), {
        body: commands,
      })
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          const commands: string[] = data.map((d) => d.name);
          log.info("Successfully registered {amount} global application commands", {
            commands,
            amount: commands.length,
          });
        }
      })
      .catch((err: unknown) => {
        log.warn("Error registering application (/) commands", { err });
      });
  }

  handleCommand(
    interaction: ChatInputCommandInteraction,
  ) {
    const commandName = interaction.commandName;

    const matchedCommand = this.commands.find(
      (command) => command.data.name === commandName,
    );

    if (!matchedCommand) return Promise.reject("Command not found");

    withContext({
      interactionId: interaction.id,
      user: interaction.user.id,
      guild: interaction.guildId,
      channel: interaction.channelId,
      commandName: interaction.commandName,
      subcommandGroup: interaction.options.getSubcommandGroup(false),
      subcommand: interaction.options.getSubcommand(false),
    }, async () => {
      const subcommandGroup = interaction.options.getSubcommandGroup(false);
      const subcommand = interaction.options.getSubcommand(false);
      const commandDetails = [`/${interaction.commandName}`, subcommandGroup, subcommand].filter(Boolean).join(" ");
      try {
        await matchedCommand.run(interaction);
        log.info(`Successfully executed command [${commandDetails}]`);
      } catch (error) {
        if (error instanceof Error) {
          log.error(`Error executing command [${commandDetails}]`, {
            errorMessage: `${error.name} ${error.message}`,
            errorStack: error.stack,
          });
        }
      }
    });
  }
}
