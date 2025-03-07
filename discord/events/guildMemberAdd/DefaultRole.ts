import { getLogger, Logger } from "@logtape/logtape";
import { Events, GuildMember, PermissionFlagsBits } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";
import { guildDefaultRoles } from "$database/schema.ts";
import { db } from "$database/database.ts";
import { eq } from "drizzle-orm/expressions";

const logger = getLogger(["discord-bot", "event-handler"]);
let log: Logger;

export class DefaultRole implements EventHandlerFunction<Events.GuildMemberAdd> {
  event = Events.GuildMemberAdd as const;
  runOnce = false;
  async run(member: GuildMember) {
    try {
      log = logger.with({
        guildId: member.guild.id,
        userId: member.user.id,
      });

      if (!member || !member.guild) {
        throw new Error("Invalid member");
      }

      if (!member.guild.members.me) {
        throw new Error("Bot is not a member of this guild");
      }

      const defaultRoleData = await db.select({
        roleId: guildDefaultRoles.roleId,
      })
        .from(guildDefaultRoles)
        .where(eq(guildDefaultRoles.guildId, member.guild.id))
        .get();

      if (!defaultRoleData) return;

      log = log.with({
        defaultRoleId: defaultRoleData.roleId,
      });

      const defaultRole = await member.guild.roles.fetch(defaultRoleData.roleId);

      if (!defaultRole) {
        log.error("Default role { defaultRoleId } not found in guild { guildId }");
        return;
      }

      if (!member.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw new Error("Bot lacks permission to manage roles");
      }

      if (member.guild.members.me.roles.highest.position <= defaultRole.position) {
        throw new Error(`Bot's highest role is not high enough to assign the "${defaultRole.name}" role`);
      }

      if (member.roles.cache.has(defaultRole.id)) {
        log.debug("Member already has the default role");
        return;
      }

      await member.roles.add(defaultRole);
      log.info(`Assigned ${member.user.username} the default role ({ defaultRoleId }) in ${member.guild.name} ({ guildId })`);
    } catch (error) {
      if (error instanceof Error) {
        log.error("Error assigning default role", {
          errorMessage: `${error.name} ${error.message}`,
          errorStack: error.stack,
        });
      } else {
        throw error;
      }
    }
  }
}
