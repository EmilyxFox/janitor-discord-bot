import { Client, Events, GatewayIntentBits } from "discord.js";
import { type discordClientConfig } from "$types/client.ts";
import { CommandHandler } from "./CommandHandler.ts";
import { EventHandler } from "./EventHandler.ts";
import { findBlueskyHandles } from "$events/findBlueskyHandles.ts";
import { respondToGoodBot } from "$events/respondToGoodBot.ts";
import { env } from "$utils/env.ts";
import { CronHandler } from "./CronHandler.ts";
import { TestCronJob } from "./cron-jobs/TestCronJob.ts";

export class DiscordBot {
  discordClient: Client<boolean>;
  config: discordClientConfig;
  commandHandler: CommandHandler;
  eventHandler: EventHandler;
  cronHandler: CronHandler;
  constructor(config: discordClientConfig) {
    this.config = config;
    this.discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    this.commandHandler = new CommandHandler(this.config.token);
    this.eventHandler = new EventHandler();
    this.cronHandler = new CronHandler();
  }

  async initialise(): Promise<void> {
    this.commandHandler.registerCommands();
    await this.discordClient.login(this.config.token);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.discordClient.once("ready", () => {
      console.log(`Logged in as ${this.discordClient.user?.tag}`);
    });

    this.eventHandler.registerEventHandler(Events.InteractionCreate, [(interaction) => {
      if (interaction.isChatInputCommand()) {
        this.commandHandler.handleCommand(interaction, this);
      }
    }]);

    this.eventHandler.registerEventHandler(Events.MessageCreate, [
      findBlueskyHandles,
      respondToGoodBot,
      (message) => {
        if (env.DEV) {
          console.log(`[${message.author.displayName}]: ${message.content}`);
        }
      },
    ]);

    this.cronHandler.registerCronJob([new TestCronJob()]);

    this.eventHandler.startHandling(this.discordClient);
    this.cronHandler.startHandling();
  }
}
