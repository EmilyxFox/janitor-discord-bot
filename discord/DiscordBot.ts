import { Client, Events, GatewayIntentBits } from "discord.js";
import { type discordClientConfig } from "$types/client.ts";
import { CommandHandler } from "./CommandHandler.ts";
import { EventHandler } from "./EventHandler.ts";
import { findBlueskyHandles } from "$events/findBlueskyHandles.ts";
import { respondToGoodBot } from "$events/respondToGoodBot.ts";
import { env } from "$utils/env.ts";
import { CronHandler } from "./CronHandler.ts";
import { TestCronJob } from "./cron-jobs/TestCronJob.ts";
import { handleNoGuilds } from "$events/handleNoGuilds.ts";
import { getLogger, Logger } from "@logtape/logtape";

export class DiscordBot {
  discordClient: Client<boolean>;
  config: discordClientConfig;
  commandHandler: CommandHandler;
  eventHandler: EventHandler;
  cronHandler: CronHandler;
  log: Logger;
  constructor(config: discordClientConfig) {
    this.config = config;
    this.discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    this.commandHandler = new CommandHandler(this.config.token);
    this.eventHandler = new EventHandler();
    this.cronHandler = new CronHandler();
    this.log = getLogger(["discord-bot"]);
  }

  async initialise(): Promise<void> {
    this.commandHandler.registerCommands();
    await this.discordClient.login(this.config.token);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.discordClient.once("ready", () => {
      this.log.info(`Logged in as ${this.discordClient.user?.tag}`);
      this.setupCronHandlers();
    });
    this.eventHandler.registerEventHandler(Events.ClientReady, [
      handleNoGuilds,
    ]);

    this.eventHandler.registerEventHandler(Events.InteractionCreate, [(interaction) => {
      if (interaction.isChatInputCommand()) {
        this.commandHandler.handleCommand(interaction);
      }
    }]);

    this.eventHandler.registerEventHandler(Events.MessageCreate, [
      findBlueskyHandles,
      respondToGoodBot,
      (message) => {
        if (env.DEV) {
          this.log.debug(`[${message.author.displayName}]: ${message.content}`);
        }
      },
    ]);

    this.eventHandler.startHandling(this.discordClient);
  }

  private setupCronHandlers(): void {
    if (env.DEV) this.cronHandler.registerCronJob([new TestCronJob()]);

    this.cronHandler.startHandling();
  }
}
