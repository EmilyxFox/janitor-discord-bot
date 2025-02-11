import { Client, GatewayIntentBits } from "discord.js";
import { env } from "$utils/env.ts";
import { EventHandler } from "$discord/EventHandler.ts";
import { CommandHandler } from "$discord/CommandHandler.ts";
import { CronHandler } from "$discord/CronHandler.ts";
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
