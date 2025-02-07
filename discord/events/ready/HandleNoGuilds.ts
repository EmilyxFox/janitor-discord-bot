import { Client, Events, OAuth2Scopes, PermissionFlagsBits } from "discord.js";
import { getLogger } from "@logtape/logtape";
import { EventHandlerFunction } from "$types/EventHandler.ts";

export class HandleNoGuilds implements EventHandlerFunction<Events.ClientReady> {
  event = Events.ClientReady as const;
  runOnce = true;
  async run(client: Client<true>) {
    const guilds = await client.guilds.fetch();
    if (guilds.size === 0) {
      const inviteLink = client.generateInvite({
        scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
        permissions: [
          PermissionFlagsBits.Administrator,
        ],
      });

      getLogger(["discord-bot", "event-handler"]).info(`I don't seem to be in any guilds! Use this link to invite me. ${inviteLink}`);
    }
  }
}
