import { Client, ClientEvents } from "discord.js";
import logger from "$logging/logger.ts";

// Removing this any is too difficult for me :(
// deno-lint-ignore no-explicit-any
type EventHandlerMap<Event extends keyof ClientEvents> = Map<Event, Array<(...args: any) => unknown>>;

export class EventHandler {
  private eventHandlers: EventHandlerMap<keyof ClientEvents>;

  constructor() {
    this.eventHandlers = new Map();
  }

  public handleEvent<Event extends keyof ClientEvents>(event: Event, ...args: ClientEvents[Event]) {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    const handlerNames: string[] = handlers.map((handler) => handler.name ? handler.name : "Anonymous function");
    logger.debug("Sending event to handlers...", { event, handler: handlerNames });

    for (const handler of handlers) {
      handler(...args);
    }
  }

  public startHandling(discordClient: Client) {
    const handlerNames: Partial<Record<keyof ClientEvents, string[]>> = {};
    this.eventHandlers.forEach((V, K) => {
      handlerNames[K] = V.map((f) => f.name ? f.name : "Anonymous function");
    });
    logger.info("Starting event handling...", { handlers: handlerNames });

    for (const [event] of this.eventHandlers) {
      discordClient.on(event, (...args) => {
        this.handleEvent(event, ...args);
      });
    }
  }

  public registerEventHandler<Event extends keyof ClientEvents>(event: Event, listener: Array<(...args: ClientEvents[Event]) => unknown>) {
    const listenerNames: string[] = [];
    for (const list of listener) {
      listenerNames.push(list.name);
    }
    logger.verbose(`Registering event handlers for [${event}]`, { event, listeners: listenerNames });
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }

    this.eventHandlers.get(event)?.push(...listener);
  }
}
