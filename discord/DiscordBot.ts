import { Client, GatewayIntentBits } from "discord.js";
import { CommandHandler } from "./CommandHandler.ts";
import { EventHandler } from "./EventHandler.ts";
import { env } from "$utils/env.ts";
import { CronHandler } from "./CronHandler.ts";
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
    this.eventHandler = new EventHandler(this);
    this.cronHandler = new CronHandler(this);
  }

  async initialise(): Promise<void> {
    serveHealthCheck(this);
    await this.login(env.DISCORD_TOKEN);
    if (env.DEPLOY_COMMANDS_TO === "GLOBAL") {
      this.commandHandler.registerGlobalCommands();
    } else if (env.DEPLOY_COMMANDS_TO === "GUILDS") {
      this.commandHandler.registerGuildCommands();
    }

    this.eventHandler.startHandling();
  }
}
