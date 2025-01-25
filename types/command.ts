import type {
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import type { DiscordBot } from "../discord/client.ts";

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | ContextMenuCommandBuilder;

  run(
    interaction: ChatInputCommandInteraction,
    botClient: DiscordBot,
  ): Promise<unknown>;
}
