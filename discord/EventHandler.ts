import { Client, ClientEvents } from "discord.js";

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

    for (const handler of handlers) {
      handler(...args);
    }
  }

  public startHandling(discordClient: Client) {
    for (const [event] of this.eventHandlers) {
      discordClient.on(event, (...args) => {
        this.handleEvent(event, ...args);
      });
    }
  }

  public registerEventHandler<Event extends keyof ClientEvents>(event: Event, listener: Array<(...args: ClientEvents[Event]) => unknown>) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }

    this.eventHandlers.get(event)?.push(...listener);
  }
}
