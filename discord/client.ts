import { Client, Events, GatewayIntentBits } from "discord.js";
import { type discordClientConfig } from "$types/client.ts";
import { CommandHandler } from "./commandHandler.ts";
import { EventHandler } from "./EventHandler.ts";
import { findBlueskyHandles } from "./events/findBlueskyHandles.ts";

export class DiscordBot {
  discordClient: Client<boolean>;
  config: discordClientConfig;
  commandHandler: CommandHandler;
  eventHandler: EventHandler;
  constructor(config: discordClientConfig) {
    this.config = config;
    this.discordClient = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    this.commandHandler = new CommandHandler(this.config.token);
    this.eventHandler = new EventHandler();
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

    this.eventHandler.registerEventHandler(Events.InteractionCreate, (interaction) => {
      if (interaction.isChatInputCommand()) {
        this.commandHandler.handleCommand(interaction, this);
      }
    });

    this.eventHandler.registerEventHandler("messageCreate", (message) => {
      console.log(`[${message.author.displayName}]: ${message.content}`);
    });

    this.eventHandler.registerEventHandler("messageCreate", findBlueskyHandles);

    this.eventHandler.startHandling(this.discordClient);
  }
}
