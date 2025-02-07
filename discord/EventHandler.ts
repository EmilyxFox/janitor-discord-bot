import { Client, ClientEvents, Collection } from "discord.js";
import { getLogger, withContext } from "@logtape/logtape";
import { nanoid } from "nanoid";
import { EventHandlerFunction } from "$types/EventHandler.ts";
import { FindBlueskyHandles } from "$events/messageCreate/FindBlueskyHandles.ts";
import { LogMessage } from "$events/messageCreate/LogMessage.ts";
import { RespondToGoodBot } from "$events/messageCreate/RespondToGoodBot.ts";
import { HandleNoGuilds } from "$events/ready/HandleNoGuilds.ts";
import { HandleDisconnection } from "$events/shardDisconnect/HandleDisconnection.ts";
import { BotLoggedInAndAvailble } from "$events/ready/BecomeAvailable.ts";

const log = getLogger(["discord-bot", "event-handler"]);

type EventHandlerMap<Event extends keyof ClientEvents> = Collection<Event, Array<EventHandlerFunction<Event>>>;

export class EventHandler {
  private eventHandlers: EventHandlerMap<keyof ClientEvents>;

  constructor() {
    this.eventHandlers = new Collection();

    this.addHandlers([
      new FindBlueskyHandles(),
      new LogMessage(),
      new RespondToGoodBot(),
      new BotLoggedInAndAvailble(),
      new HandleNoGuilds(),
      new HandleDisconnection(),
    ]);
  }

  public handleEvent<Event extends keyof ClientEvents>(event: Event, ...args: ClientEvents[Event]) {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    const persistentHandlers: Array<EventHandlerFunction<keyof ClientEvents>> = [];

    for (const handler of handlers) {
      withContext({ id: nanoid() }, () => {
        handler.run(...args);
      });
      if (!handler.runOnce) {
        persistentHandlers.push(handler);
      }
    }

    if (persistentHandlers.length > 0) {
      this.eventHandlers.set(event, persistentHandlers);
    } else {
      this.eventHandlers.delete(event);
    }
  }

  public startHandling(discordClient: Client) {
    let amount = 0;
    const handlersObject: Partial<Record<keyof ClientEvents, string[]>> = {};

    this.eventHandlers.each((handlers, event) => {
      amount += handlers.length;
      handlersObject[event] = handlers.map((f) => f.constructor.name);

      discordClient.on(event, (...args) => this.handleEvent(event, ...args));
    });

    log.info("Registered {amount} event handlers", { handlers: handlersObject, amount });
  }

  public addHandlers(handlers: EventHandlerFunction<keyof ClientEvents>[]) {
    for (const handler of handlers) {
      if (!this.eventHandlers.has(handler.event)) {
        this.eventHandlers.set(handler.event, []);
      }

      this.eventHandlers.get(handler.event)?.push(handler);
    }
  }
}
