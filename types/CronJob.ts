export interface CronJob {
  name: string;
  schedule: Deno.CronSchedule;
  runImmediately: boolean;
  run(): void | Promise<void>;
}
