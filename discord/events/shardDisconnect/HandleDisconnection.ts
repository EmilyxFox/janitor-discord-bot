import { getLogger } from "@logtape/logtape";
import { botStatus } from "$utils/healthcheck.ts";
import { CloseEvent, Events } from "discord.js";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const log = getLogger(["discord-bot"]);

export class HandleDisconnection implements EventHandlerFunction<Events.ShardDisconnect> {
  event = Events.ShardDisconnect as const;
  runOnce: boolean = false;
  run(closeEvent: CloseEvent, _shardId: number) {
    log.error(`Discord connection lost...`, { error: closeEvent });

    botStatus.setUnavailable();
  }
}
