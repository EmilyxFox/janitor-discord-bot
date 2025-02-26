import { getLogger } from "@logtape/logtape";
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  Events,
  Message,
  MessageActionRowComponentBuilder,
  OmitPartialGroupDMChannel,
  subtext,
} from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const logger = getLogger(["discord-bot", "event-handler"]);

export class ConvertFToC implements EventHandlerFunction<Events.MessageCreate> {
  event = Events.MessageCreate as const;
  runOnce = false;
  async run(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.bot) return;

    // Regular expression to match temperatures in Fahrenheit
    // It needs to look like this to capture negative numbers first
    const fahrenheitPattern = /(?:^|\s)-[0-9]{1,3}\s?[Ff]($|\s)|\b[0-9]{1,3}\s?[Ff]($|\s)/g;
    const matches = message.content.match(fahrenheitPattern);

    if (!matches || matches.length === 0) return;

    const log = logger.with({
      messageId: message.id,
      channelId: message.channelId,
      authorId: message.author.id,
    });

    try {
      log.debug("Found Fahrenheit temperature(s) in message", {
        matches: matches.map((m) => m[0]),
      });

      const conversions: string[] = [];
      const conversionDetails: Array<{ fahrenheit: number; celsius: number }> = [];

      for (const match of matches) {
        const fahrenheit = parseFloat(match.replace(/[Ff]/, ""));
        const celsius = ((fahrenheit - 32) * 5) / 9;

        conversions.push(`${bold(`${celsius.toFixed(1)}°C`)}\n${subtext(`${fahrenheit}°F`)}`);
        conversionDetails.push({
          fahrenheit,
          celsius: parseFloat(celsius.toFixed(1)),
        });
      }

      const dismissButton = new ButtonBuilder()
        .setCustomId(`dismiss:user`)
        .setLabel("Dismiss")
        .setEmoji("🫣")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        .addComponents(dismissButton);

      await message.reply({
        content: conversions.join("\n"),
        allowedMentions: { repliedUser: false },
        components: [row],
      });
      log.info(`Replied with {conversionCount} temperature conversion(s) for ${message.author.username}`, {
        conversionCount: conversions.length,
        conversions: conversionDetails,
      });
    } catch (error) {
      if (error instanceof Error) {
        log.error("Error converting temperature", {
          errorMessage: `${error.name} ${error.message}`,
          errorStack: error.stack,
        });
      }
    }
  }
}
