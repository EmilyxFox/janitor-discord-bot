import { type ChatInputCommandInteraction, DiscordAPIError, REST, RESTPutAPIApplicationCommandsResult, Routes } from "discord.js";
import { DiscordBot } from "$discord/DiscordBot.ts";
import { env } from "$utils/env.ts";
import { getLogger, withContext } from "@logtape/logtape";
import type { Command } from "$types/Command.ts";
import { PingCommand } from "$discord/commands/Ping.ts";
import { BulkDeleteCommand } from "$discord/commands/BulkDelete.ts";
import { CreatePollCommand } from "$discord/commands/CreatePoll.ts";
import { GitHubCommand } from "$discord/commands/GitHub.ts";
import { EnforceSpoiler } from "$discord/commands/EnforceSpoiler.ts";

const log = getLogger(["discord-bot", "command-handler"]);

export class CommandHandler {
  public readonly client: DiscordBot;
  public readonly commands: Command[];
  private readonly discordREST: REST;

  constructor(discordBot: DiscordBot) {
    this.client = discordBot;
    if (!discordBot.token) {
      throw new Error("Invalid Discord token when registering commands");
    }

    this.commands = [new PingCommand(), new BulkDeleteCommand(), new CreatePollCommand(), new GitHubCommand(), new EnforceSpoiler()];
    this.discordREST = new REST().setToken(discordBot.token);
  }

  getSlashCommands() {
    return this.commands.map((command: Command) => command.data.toJSON());
  }

  registerGlobalCommands() {
    log.info("Registering commands globally...");
    const clientId = this.client.user?.id;
    if (!clientId) throw new Error("No client ID when registering commands");
    const commands = this.getSlashCommands();
    this.discordREST
      .put(Routes.applicationCommands(clientId), {
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
        if (err instanceof DiscordAPIError) {
          log.warn("Error registering global application (/) commands", {
            rawError: err.rawError,
            status: err.status,
            errorCode: err.code,
          });
        }
        throw err;
      });
  }

  public async registerGuildCommands() {
    log.info("Registering guild commands...");
    const clientId = this.client.user?.id;
    if (!clientId) throw new Error("No client ID when registering commands");
    const commands = this.getSlashCommands();
    const guilds = env.GUILDS?.split("\n") || [];
    if (guilds.length < 1) throw new Error("No guilds specified to deploy to.");
    //Filter out blank array entries if user didn't use |- syntax
    const noBlankGuilds = guilds.filter(Boolean);
    for (const guild of noBlankGuilds) {
      await this.discordREST.put(Routes.applicationGuildCommands(clientId, guild), {
        body: commands,
      })
        .then((data: unknown) => {
          if (Array.isArray(data)) {
            const apiResp = data as RESTPutAPIApplicationCommandsResult;
            const commands: string[] = apiResp.map((d) => d.name);
            log.info("Successfully registered {amount} guild application commands", {
              commands,
              guilds,
              amount: commands.length,
            });
          }
        })
        .catch((err: unknown) => {
          if (err instanceof DiscordAPIError) {
            log.warn("Error registering guild application (/) commands", {
              rawError: err.rawError,
              status: err.status,
              errorCode: err.code,
            });
          }
          throw err;
        });
    }
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
          log.error(`Error executing command [${commandDetails}] {errorMessage}`, {
            errorMessage: `${error.name} ${error.message}`,
            errorStack: error.stack,
          });
        }
      }
    });
  }
}
