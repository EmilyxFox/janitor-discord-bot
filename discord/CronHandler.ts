import { CronJob } from "$types/CronJob.ts";

export class CronHandler {
  private cronJobs: Array<CronJob>;

  public constructor() {
    this.cronJobs = [];
  }

  public registerCronJob(jobs: Array<CronJob>): void {
    this.cronJobs.push(...jobs);
  }

  public startHandling(): void {
    for (const job of this.cronJobs) {
      if (job.runImmediately) job.run();

      Deno.cron(job.name, job.schedule, job.run);
    }
  }
}
