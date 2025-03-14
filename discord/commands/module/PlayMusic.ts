import type { Command } from "$types/Command.ts";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  subtext,
} from "discord.js";

export class PlayMusicCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("playmusic")
    .setDescription("Plays a song from youtube/spotify")
    .setContexts(InteractionContextType.Guild)
    .addStringOption((opt) =>
      opt
        .setName("name")
        .setDescription("Name of the song to be played.")
        .setRequired(true)
    );

  async run(interaction: ChatInputCommandInteraction) {
    
  }
}
