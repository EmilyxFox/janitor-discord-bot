import { CacheType, Events, Interaction } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";
import { DiscordBot } from "$discord/DiscordBot.ts";

export class HandleCommand implements EventHandlerFunction<Events.InteractionCreate> {
  event = Events.InteractionCreate as const;
  runOnce = false;
  run: (interaction: Interaction<CacheType>) => unknown = (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.client instanceof DiscordBot) {
        interaction.client.commandHandler.handleCommand(interaction);
      }
    }
  };
}
