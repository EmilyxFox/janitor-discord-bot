import { createLogger, format, transports } from "winston";
import { env } from "$utils/env.ts";

const determineLogLevel = () => {
  if (env.LOGLEVEL) return env.LOGLEVEL.toLowerCase();

  if (env.DEV) return "debug";

  return "info";
};

const logger = createLogger({
  level: "info",
  format: format.timestamp(),
  transports: [
    new transports.Console({
      level: determineLogLevel(),
      format: format.combine(
        format.errors(),
        format.timestamp(),
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          let data: string;
          const splat = meta[Symbol.for("splat")] as object[];
          if (meta.stack) {
            data = meta.stack as string;
          } else if (splat && splat.length) {
            data = splat.length === 1 ? JSON.stringify(splat[0]) : JSON.stringify(splat);
          } else {
            data = "";
          }
          return `[${timestamp}] ${level} ${message} ${data}`;
        }),
      ),
    }),

    new transports.File({
      filename: "./logs/bot.log",
      format: format.combine(
        format.json(),
      ),
    }),
  ],
});

export default logger;
