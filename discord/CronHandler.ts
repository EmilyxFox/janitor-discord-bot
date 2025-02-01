import { CronJob } from "$types/CronJob.ts";
import { getLogger, withContext } from "@logtape/logtape";

const log = getLogger(["discord-bot", "cron-handler"]);

export class CronHandler {
  private cronJobs: Array<CronJob>;

  public constructor() {
    this.cronJobs = [];
  }

  public registerCronJob(jobs: Array<CronJob>): void {
    this.cronJobs.push(...jobs);
  }

  public startHandling(): void {
    log.info("Registering {amount} cron jobs", {
      jobs: this.cronJobs,
      amount: this.cronJobs.length,
    });
    for (const { name, schedule, runImmediately, run } of this.cronJobs) {
      withContext({ name, schedule, runImmediately }, () => {
        if (runImmediately) run();
        Deno.cron(name, schedule, run);
      });
    }
  }
}
