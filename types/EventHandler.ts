import { ClientEvents } from "discord.js";

// Maybe a factory would be a better solution
export interface EventHandlerFunction<T extends keyof ClientEvents> {
  event: T;
  runOnce: boolean;
  run: (...args: ClientEvents[T]) => unknown;
}
