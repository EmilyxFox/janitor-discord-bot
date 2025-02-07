import { ClientEvents } from "discord.js";

export interface EventHandler<Event extends keyof ClientEvents> {
  event: Event;
  runOnce: boolean;
  run: (...args: ClientEvents[Event]) => unknown;
}
