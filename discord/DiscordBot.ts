import { Client, Events, GatewayIntentBits } from "discord.js";
import { CommandHandler } from "./CommandHandler.ts";
import { EventHandler } from "./EventHandler.ts";
import { env } from "$utils/env.ts";
import { CronHandler } from "./CronHandler.ts";
import { TestCronJob } from "./cron-jobs/TestCronJob.ts";
import { getLogger, Logger } from "@logtape/logtape";
import { serveHealthCheck } from "$utils/healthcheck.ts";

export class DiscordBot extends Client {
  commandHandler: CommandHandler;
  eventHandler: EventHandler;
  cronHandler: CronHandler;
  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    this.commandHandler = new CommandHandler(this);
    this.eventHandler = new EventHandler();
    this.cronHandler = new CronHandler();
    this.log = getLogger(["discord-bot"]);
  }

  async initialise(): Promise<void> {
    serveHealthCheck(this);
    await this.login(env.DISCORD_TOKEN);
    if (env.DEPLOY_COMMANDS_TO === "GLOBAL") {
      this.commandHandler.registerGlobalCommands();
    } else if (env.DEPLOY_COMMANDS_TO === "GUILDS") {
      this.commandHandler.registerGuildCommands();
    }

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.discordClient.once("ready", () => {
      this.setupCronHandlers();
    });
    this.discordClient.on(Events.InteractionCreate, (interaction) => {
      if (interaction.isChatInputCommand()) {
        this.commandHandler.handleCommand(interaction);
      }
    });

    this.eventHandler.startHandling(this.discordClient);
  }

  private setupCronHandlers(): void {
    if (env.DEV) this.cronHandler.registerCronJob([new TestCronJob()]);

    this.cronHandler.startHandling();
  }
}
