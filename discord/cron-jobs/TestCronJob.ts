import { CronJob } from "$types/CronJob.ts";
import { getLogger } from "@logtape/logtape";

export class TestCronJob implements CronJob {
  name = "test";
  schedule = { minute: { every: 1 } };
  runImmediately = true;
  run(): void | Promise<void> {
    getLogger(["discord-bot", "cron-handler"]).debug("ping pong from the test cron job");
  }
}
