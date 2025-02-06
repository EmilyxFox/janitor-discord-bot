import { configure, getConsoleSink, getRotatingFileSink, withFilter } from "@logtape/logtape";
import { AsyncLocalStorage } from "node:async_hooks";
import { env } from "$utils/env.ts";

export const setupLogging = async () => {
  await configure({
    contextLocalStorage: new AsyncLocalStorage(),
    sinks: {
      console: withFilter(
        getConsoleSink(),
        env.DEV ? "debug" : "info",
      ),
      coalescedFile: getRotatingFileSink("logs/coalesced.log", {
        maxSize: 0x400 * 0x400, // 1MiB
        maxFiles: 5,
        formatter: (record) => JSON.stringify(record) + "\n",
      }),
      discordBotFile: getRotatingFileSink("logs/discordBot.log", {
        maxSize: 0x400 * 0x400, // 1MiB
        maxFiles: 5,
        formatter: (record) => JSON.stringify(record) + "\n",
      }),
      commandHandlerFile: getRotatingFileSink("logs/commandHandler.log", {
        maxSize: 0x400 * 0x400, // 1MiB
        maxFiles: 5,
        formatter: (record) => JSON.stringify(record) + "\n",
      }),
      cronHandlerFile: getRotatingFileSink("logs/cronHandler.log", {
        maxSize: 0x400 * 0x400, // 1MiB
        maxFiles: 5,
        formatter: (record) => JSON.stringify(record) + "\n",
      }),
      eventHandlerFile: getRotatingFileSink("logs/eventHandler.log", {
        maxSize: 0x400 * 0x400, // 1MiB
        maxFiles: 5,
        formatter: (record) => JSON.stringify(record) + "\n",
      }),
      systemFile: getRotatingFileSink("logs/system.log", {
        maxSize: 0x400 * 0x400, // 1MiB
        maxFiles: 5,
        formatter: (record) => JSON.stringify(record) + "\n",
      }),
    },
    loggers: [
      { category: ["system"], lowestLevel: "debug", sinks: ["console", "coalescedFile", "systemFile"] },
      { category: ["discord-bot"], lowestLevel: "debug", sinks: ["console", "coalescedFile", "discordBotFile"] },
      { category: ["discord-bot", "command-handler"], lowestLevel: "debug", sinks: ["commandHandlerFile"] },
      { category: ["discord-bot", "cron-handler"], lowestLevel: "debug", sinks: ["cronHandlerFile"] },
      { category: ["discord-bot", "event-handler"], lowestLevel: "debug", sinks: ["eventHandlerFile"] },
      { category: ["logtape", "meta"], lowestLevel: "warning", sinks: ["console"] },
    ],
  });
};
