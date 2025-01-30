import { CronJob } from "$types/CronJob.ts";
import logger from "$logging/logger.ts";

export class TestCronJob implements CronJob {
  name = "test";
  schedule: Deno.CronSchedule = { minute: { every: 1 } };
  runImmediately = true;
  run(): void | Promise<void> {
    logger.debug("Ping pong from the test cron job!");
  }
}
