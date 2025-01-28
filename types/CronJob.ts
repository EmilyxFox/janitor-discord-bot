export interface CronJob {
  name: string;
  schedule: Deno.CronSchedule;
  run(): void | Promise<void>;
}
