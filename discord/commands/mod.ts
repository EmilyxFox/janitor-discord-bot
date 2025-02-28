import { BulkDeleteCommand } from "$discord/commands/module/BulkDelete.ts";
import { CreatePollCommand } from "$discord/commands/module/CreatePoll.ts";
import { EnforceSpoiler } from "$discord/commands/module/EnforceSpoiler.ts";
import { GitHubCommand } from "$discord/commands/module/GitHub.ts";
import { PingCommand } from "$discord/commands/module/Ping.ts";

export const commands = [
  new BulkDeleteCommand(),
  new CreatePollCommand(),
  new EnforceSpoiler(),
  new GitHubCommand(),
  new PingCommand(),
];
