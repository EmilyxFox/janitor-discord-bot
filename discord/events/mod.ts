import { LogBoost } from "$discord/events/guildMemberUpdate/LogBoost.ts";
import { HandleButton } from "$discord/events/interactionCreate/HandleButton.ts";
import { HandleCommand } from "$discord/events/interactionCreate/HandleCommand.ts";
import { ConvertFToC } from "$discord/events/messageCreate/ConvertFToC.ts";
import { EnforceSpoiler } from "$discord/events/messageCreate/EnforceSpoiler.ts";
import { FindBlueskyHandles } from "$discord/events/messageCreate/FindBlueskyHandles.ts";
import { RespondToGoodBot } from "$discord/events/messageCreate/RespondToGoodBot.ts";
import { BotLoggedInAndAvailble } from "$discord/events/ready/BecomeAvailable.ts";
import { HandleNoGuilds } from "$discord/events/ready/HandleNoGuilds.ts";
import { StartCronJobs } from "$discord/events/ready/StartCronJobs.ts";
import { HandleDisconnection } from "$discord/events/shardDisconnect/HandleDisconnection.ts";
import { DefaultRole } from "$discord/events/guildMemberAdd/DefaultRole.ts";

export const events = [
  new LogBoost(),
  new HandleButton(),
  new HandleCommand(),
  new ConvertFToC(),
  new EnforceSpoiler(),
  new FindBlueskyHandles(),
  new RespondToGoodBot(),
  new BotLoggedInAndAvailble(),
  new HandleNoGuilds(),
  new StartCronJobs(),
  new HandleDisconnection(),
  new DefaultRole(),
];
