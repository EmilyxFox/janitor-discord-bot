export interface CronJob {
  name: string;
  schedule: Deno.CronSchedule;
  /**
   * Whether to run the cron function immediately on startup.
   * This might be useful for fetching data that needs to be available always and can't wait for the next time the cron runs.
   */
  runImmediately: boolean;
  run(): void | Promise<void>;
}
