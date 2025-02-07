import { getLogger } from "@logtape/logtape";
import { botStatus } from "$utils/healthcheck.ts";
import { CloseEvent, Events } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const log = getLogger(["discord-bot"]);

export class HandleDisconnection implements EventHandlerFunction<Events.ShardDisconnect> {
  event = Events.ShardDisconnect as const;
  runOnce: boolean = false;
  run(closeEvent: CloseEvent, _shardId: number) {
    botStatus.setUnavailable();
    // Error code 1000 should indicate a normal closure, and we don't need to log an error for it.
    if (closeEvent.code !== 1000) {
      log.error(`Discord connection lost...`, { error: closeEvent });
    }
  }
}
