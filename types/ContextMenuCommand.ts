import type { ContextMenuCommandBuilder, ContextMenuCommandInteraction } from "discord.js";
import type { DiscordBot } from "../discord/client.ts";

export interface ContextMenuCommand {
  data: ContextMenuCommandBuilder;

  run(
    interaction: ContextMenuCommandInteraction,
    botClient: DiscordBot,
  ): Promise<unknown>;
}
