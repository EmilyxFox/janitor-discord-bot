import type { Command } from "$types/Command.ts";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionContextType,
  GuildMember,
  subtext,
} from "discord.js";

import {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  getVoiceConnection,
  getVoiceConnections,
} from "@discordjs/voice";

export class JoinVCCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("joinvc")
    .setDescription("Joins a given voice channel.")
    .setContexts(InteractionContextType.Guild);

  async run(interaction: ChatInputCommandInteraction) {
    // await interaction.deferReply();

    const guild = interaction.guild;

    if (!guild) {
      return interaction.reply("This command only works on a server!");
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);

    console.log(`Member: ${member.displayName}`);
    console.log(`Current Channel of: ${member.voice.channel}`);

    if (!member.voice.channel) {
      return interaction.reply("You are not connected to a voice channel!");
    }

    const vc = member.voice.channel;

    try {
      const existingConnection = getVoiceConnection(guild.id);
      console.log("New Channel ID: " + vc.id);
      console.log(
        "Current Channel ID: " + existingConnection?.joinConfig.channelId
      );
      if (existingConnection) {
        if (existingConnection.joinConfig.channelId === vc.id) {
          return interaction.editReply(`I'm already in ${vc.name}!`);
        }

        existingConnection.disconnect();
        existingConnection.destroy();
      }

      const connection = joinVoiceChannel({
        channelId: vc.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);

      return await interaction.editReply(`Joined: ${vc.name}`);
    } catch (_err) {
      return interaction.reply(
        `${subtext("An error occurred while running this command.")}`
      );
    }
  }
}
