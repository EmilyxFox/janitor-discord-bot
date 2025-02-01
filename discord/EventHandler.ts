import { Client, ClientEvents, Collection } from "discord.js";
import { getLogger, withContext } from "@logtape/logtape";
import { nanoid } from "nanoid";

const log = getLogger(["discord-bot", "event-handler"]);

// Removing this any is too difficult for me :(
// deno-lint-ignore no-explicit-any
type EventHandlerMap<Event extends keyof ClientEvents> = Collection<Event, Array<(...args: any) => unknown>>;

export class EventHandler {
  private eventHandlers: EventHandlerMap<keyof ClientEvents>;

  constructor() {
    this.eventHandlers = new Collection();
  }

  public handleEvent<Event extends keyof ClientEvents>(event: Event, ...args: ClientEvents[Event]) {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      // "Events" are very diverse so we invent our own context
      withContext({ id: nanoid() }, () => {
        handler(...args);
      });
    }
  }

  public startHandling(discordClient: Client) {
    let amount = 0;
    const handlersObject: Partial<Record<keyof ClientEvents, string[]>> = {};
    this.eventHandlers.each((v, k) => {
      amount += v.length;
      handlersObject[k] = v.map((f) => f.name ? f.name : "Anonymous function");
    });
    log.info("Registering {amount} event handlers", {
      handlers: handlersObject,
      amount,
    });
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
