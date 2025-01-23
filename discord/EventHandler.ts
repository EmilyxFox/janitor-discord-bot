import { Client, ClientEvents } from "discord.js";

export class EventHandler {
  private eventHandlers: Map<keyof ClientEvents, Array<(...args: any) => unknown>>;

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

  public registerEventHandler<Event extends keyof ClientEvents>(event: Event, listener: (...args: ClientEvents[Event]) => unknown) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }

    this.eventHandlers.get(event)?.push(listener);
  }
}
