import type { Command } from "$types/command.ts";
import {
  type ChatInputCommandInteraction,
  PollLayoutType,
  SlashCommandBuilder,
} from "discord.js";
import { DiscordBot } from "../client.ts";

export class CreatePollCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("createpoll")
    .setDescription("Creates a poll with the given options and duration.")
    .addStringOption((opt) =>
      opt
        .setName("prompt")
        .setDescription("Set the title of your poll.")
        .setRequired(true)
    )
    .addNumberOption((opt) =>
      opt
        .setName("duration")
        .setDescription("Duration of the poll in hours. Default is 12 hours.")
        .setRequired(false)
    );

  async run(
    interaction: ChatInputCommandInteraction,
    _botClient: DiscordBot
  ): Promise<unknown> {
    if (!interaction.channel?.isSendable()) {
      return;
    }
    if (interaction.channel.isDMBased()) {
      return interaction.reply("This command is only available in guilds.");
    }
    if (!interaction.channel.isTextBased()) {
      return;
    }

    const myPoll = {
      poll: {
        question: { text: "" },
        answers: [
          { text: "Yes", emoji: "✅" },
          { text: "No", emoji: "❌" },
          { text: "Idc", emoji: "😎" },
        ],
        allowMultiselect: false,
        duration: 12,
        layoutType: PollLayoutType.Default,
      },
    };

    let prompt: string = "";
    let pollDuration: number = 0;

    try {
      myPoll.poll.question.text =
        interaction.options.getString("prompt") ?? "No promt was give";
      myPoll.poll.duration = interaction.options.getNumber("duration") ?? 12;


      const channel = interaction.channel;

      
    } catch (err) {
      return await interaction.reply(`${err}`);
    }

    return interaction.reply(myPoll);
  }
}
