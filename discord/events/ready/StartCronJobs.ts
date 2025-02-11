import { Client, Events } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";
import { DiscordBot } from "$discord/DiscordBot.ts";
import { env } from "$utils/env.ts";
import { TestCronJob } from "$discord/cron-jobs/TestCronJob.ts";

export class StartCronJobs implements EventHandlerFunction<Events.ClientReady> {
  event = Events.ClientReady as const;
  runOnce = true;
  run(client: Client<true>) {
    if (client instanceof DiscordBot) {
      if (env.DEV) client.cronHandler.registerCronJob([new TestCronJob()]);

      client.cronHandler.startHandling();
    }
  }
}
