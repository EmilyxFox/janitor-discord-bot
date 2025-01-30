import { CronJob } from "$types/CronJob.ts";
import logger from "$logging/logger.ts";

export class CronHandler {
  private cronJobs: Array<CronJob>;

  public constructor() {
    this.cronJobs = [];
  }

  public registerCronJob(jobs: Array<CronJob>): void {
    logger.verbose(`Registering cron jobs...`, {
      jobs: jobs.map(({ name, runImmediately, schedule }) => ({ name, runImmediately, schedule })),
    });
    this.cronJobs.push(...jobs);
  }

  public startHandling(): void {
    const jobsForLog = this.cronJobs.map(({ name, runImmediately, schedule }) => ({ name, runImmediately, schedule }));
    logger.info("Starting cron jobs...", { cronjobs: jobsForLog });
    for (const job of this.cronJobs) {
      if (job.runImmediately) job.run();

      Deno.cron(job.name, job.schedule, job.run);
    }
  }
}
