import { CronJob } from "$types/CronJob.ts";

export class TestCronJob implements CronJob {
  name = "test";
  schedule: Deno.CronSchedule = { minute: { every: 1 } };
  runImmediately = true;
  run(): void | Promise<void> {
    console.log("ping pong from the test cron job");
  }
}
