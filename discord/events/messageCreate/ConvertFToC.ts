import { getLogger } from "@logtape/logtape";
import { bold, Events, Message, OmitPartialGroupDMChannel, subtext } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const log = getLogger(["discord-bot", "event-handler"]);

export class ConvertFToC implements EventHandlerFunction<Events.MessageCreate> {
  event = Events.MessageCreate as const;
  runOnce = false;
  run(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    if (message.author.id === message.client.user.id) return;

    log.debug(`Processing message from ${message.author.displayName}: ${message.content}`);

    // Regular expression to match temperatures in Fahrenheit
    const regex = /\b[0-9]{1,3}\s?[Ff]\b/g;
    const matches = message.content.match(regex);

    if (!matches) {
      log.debug("No temperature conversions needed");
      return;
    }

    let response = message.content;

    for (const match of matches) {
      // Extract the numeric value
      const fahrenheit = parseInt(match.replace(/[Ff]/, ""));
      // Convert to Celsius
      const celsius = Math.round(((fahrenheit - 32) * 5) / 9);

      log.debug(`Converting ${fahrenheit}F to ${celsius}C`);

      // Replace the Fahrenheit temperature with both F and C
      response = response.replace(
        match,
        `${bold(`${celsius}°C`)}\n${subtext(`${fahrenheit}°F`)}`,
      );
    }

    //test

    if (response !== message.content) {
      log.info(`Sending temperature conversion response for ${message.author.displayName}`);
      message.reply(response);
    }
  }
}
