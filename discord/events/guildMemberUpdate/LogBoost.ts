import { getLogger } from "@logtape/logtape";
import { Events, GuildMember, PartialGuildMember } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const log = getLogger(["discord-bot", "event-handler"]);

export class LogBoost implements EventHandlerFunction<Events.GuildMemberUpdate> {
  event = Events.GuildMemberUpdate as const;
  runOnce = false;
  run(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) {
    if (oldMember.premiumSince === newMember.premiumSince) return;
    if (oldMember.premiumSince === null && newMember.premiumSince instanceof Date) {
      log.info(`{ username } started boosting!`, {
        username: newMember.user.username,
        oldMemberPremiumSince: oldMember.premiumSince,
        newMemberPremiumSince: newMember.premiumSince,
      });
    }
    if (oldMember.premiumSince instanceof Date && newMember.premiumSince === null) {
      log.info(`{ username } stopped boosting.`, {
        username: newMember.user.username,
        oldMemberPremiumSince: oldMember.premiumSince,
        newMemberPremiumSince: newMember.premiumSince,
      });
    }
  }
}
