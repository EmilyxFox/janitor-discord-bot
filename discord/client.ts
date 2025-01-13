import { Client, Events, GatewayIntentBits } from "discord.js";
import { type discordClientConfig } from "$types/client.ts";
import { CommandHandler } from "./commandHandler.ts";

export class DiscordBot {
  discordClient: Client<boolean>;
  config: discordClientConfig;
  commandHandler: CommandHandler;
  constructor(config: discordClientConfig) {
    this.config = config;
    this.discordClient = new Client({
      intents: [GatewayIntentBits.Guilds],
    });

    this.commandHandler = new CommandHandler(this.config.token);
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

    this.discordClient.on(Events.InteractionCreate, (interaction) => {
      if (interaction.isChatInputCommand()) {
        this.commandHandler.handleCommand(interaction, this);
      }
    });
  }
}
