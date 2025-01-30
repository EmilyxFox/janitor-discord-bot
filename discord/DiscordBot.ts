import { Client, Events, GatewayIntentBits } from "discord.js";
import { type discordClientConfig } from "$types/client.ts";
import { CommandHandler } from "./CommandHandler.ts";
import { EventHandler } from "./EventHandler.ts";
import { findBlueskyHandles } from "$events/findBlueskyHandles.ts";
import { respondToGoodBot } from "$events/respondToGoodBot.ts";
import { env } from "$utils/env.ts";
import { CronHandler } from "./CronHandler.ts";
import { TestCronJob } from "./cron-jobs/TestCronJob.ts";
import logger from "$logging/logger.ts";

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
    this.discordClient.once("ready", (client) => {
      const guilds: Array<{ guildName: string; guildId: string }> = [];
      client.guilds.cache.forEach((guild) => {
        guilds.push({ guildName: guild.name, guildId: guild.id });
      });
      logger.info(`Logged in as ${client.user.displayName}`, { client: { tag: client.user.tag, id: client.user.id }, guilds: { guilds } });
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
          logger.silly(`[${message.author.displayName}]: ${message.content}`);
        }
      },
    ]);

    if (env.DEV) this.cronHandler.registerCronJob([new TestCronJob()]);

    this.eventHandler.startHandling(this.discordClient);
    this.cronHandler.startHandling();
  }
}
