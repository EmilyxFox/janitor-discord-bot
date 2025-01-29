import type { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import type { DiscordBot } from "../discord/DiscordBot.ts";

export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

  run(
    interaction: ChatInputCommandInteraction,
    botClient: DiscordBot,
  ): Promise<unknown>;
}
