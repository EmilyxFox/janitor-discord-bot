import type { Command } from "$types/command.ts";
import { type ChatInputCommandInteraction, REST, Routes } from "discord.js";
import type { DiscordBot } from "./client.ts";
import { PingCommand } from "$commands/ping.ts";
import { BulkDeleteCommand } from "$commands/bulkDelete.ts";
import { CreatePollCommand } from "$commands/createPoll.ts";

export class CommandHandler {
  private commands: Command[];
  private discordREST: REST;
  private clientId: string;

  constructor(token: string) {
    if (!token) {
      throw new Error("Invalid Discord token when registering commands");
    }

    this.commands = [new PingCommand(), new BulkDeleteCommand(), new CreatePollCommand()];
    this.discordREST = new REST().setToken(token);

    const clientId = Deno.env.get("CLIENT_ID");
    if (clientId) {
      this.clientId = clientId;
    } else {
      throw new Error("Invalid client or guild ID");
    }
  }

  getSlashCommands() {
    return this.commands.map((command: Command) => command.data.toJSON());
  }

  registerCommands() {
    const commands = this.getSlashCommands();
    this.discordREST
      .put(Routes.applicationCommands(this.clientId), {
        body: commands,
      })
      .then((data) => {
        // Don't really know if this is a good way to do it :)
        if (Array.isArray(data)) {
          console.log(
            `Successfully registered ${data.length} global application commands`,
          );
        }
      })
      .catch((err) => {
        console.error("Error registering application (/) commands", err);
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

    if (!matchedCommand) return Promise.reject("Command not found");

    await matchedCommand
      .run(interaction, botClient)
      .then(() => {
        const logMessage = interaction.options.getSubcommand(false)
          ? `Successfully executed subcommand [/${interaction.commandName} ${interaction.options.getSubcommand()}]`
          : `Successfully executed command [/${interaction.commandName}]`;
        console.log(logMessage, {
          guild: { id: interaction.guildId },
          user: { name: interaction.user.globalName },
        });
      })
      .catch((err) => {
        console.log(
          `Error executing command [/${interaction.commandName}]: ${err}`,
          {
            guild: { id: interaction.guildId },
            user: { name: interaction.user.globalName },
          },
        );
      });
  }
}
