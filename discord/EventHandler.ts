import { ClientEvents, Collection } from "discord.js";
import { DiscordBot } from "$discord/DiscordBot.ts";
import { env } from "$utils/env.ts";
import { getLogger, withContext } from "@logtape/logtape";
import { nanoid } from "nanoid";
import { EventHandlerFunction } from "$types/EventHandler.ts";
import { FindBlueskyHandles } from "$discord/events/messageCreate/FindBlueskyHandles.ts";
import { LogMessage } from "$discord/events/messageCreate/LogMessage.ts";
import { RespondToGoodBot } from "$discord/events/messageCreate/RespondToGoodBot.ts";
import { HandleNoGuilds } from "$discord/events/ready/HandleNoGuilds.ts";
import { HandleDisconnection } from "$discord/events/shardDisconnect/HandleDisconnection.ts";
import { BotLoggedInAndAvailble } from "$discord/events/ready/BecomeAvailable.ts";
import { HandleCommand } from "$discord/events/interactionCreate/HandleCommand.ts";
import { EnforceSpoiler } from "$discord/events/messageCreate/EnforceSpoiler.ts";
import { ConvertFToC } from "$discord/events/messageCreate/ConvertFToC.ts";
import { HandleButton } from "$discord/events/interactionCreate/HandleButton.ts";

const log = getLogger(["discord-bot", "event-handler"]);

type EventHandlerMap<Event extends keyof ClientEvents> = Collection<Event, Array<EventHandlerFunction<Event>>>;

export class EventHandler {
  private eventHandlers: EventHandlerMap<keyof ClientEvents>;
  public client: DiscordBot;

  constructor(client: DiscordBot) {
    this.eventHandlers = new Collection();
    this.client = client;

    this.addHandlers([
      new FindBlueskyHandles(),
      new RespondToGoodBot(),
      new BotLoggedInAndAvailble(),
      new HandleNoGuilds(),
      new HandleDisconnection(),
      new HandleCommand(),
      new HandleButton(),
      new EnforceSpoiler(),
      new ConvertFToC(),
    ]);

    if (env.DEV) this.addHandlers([new LogMessage()]);
  }

  public handleEvent<Event extends keyof ClientEvents>(event: Event, ...args: ClientEvents[Event]) {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    const persistentHandlers: Array<EventHandlerFunction<keyof ClientEvents>> = [];

    for (const handler of handlers) {
      withContext({ eventId: nanoid() }, () => {
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

  public startHandling() {
    let amount = 0;
    const handlersObject: Partial<Record<keyof ClientEvents, string[]>> = {};

    this.eventHandlers.each((handlers, event) => {
      amount += handlers.length;
      handlersObject[event] = handlers.map((f) => f.constructor.name);

      this.client.on(event, (...args) => this.handleEvent(event, ...args));
    });

    log.info("Registered {amount} event handlers", { handlers: handlersObject, amount });
  }

  // deno-lint-ignore no-explicit-any
  public addHandlers(handlers: EventHandlerFunction<any>[]) {
    for (const handler of handlers) {
      if (!this.eventHandlers.has(handler.event)) {
        this.eventHandlers.set(handler.event, []);
      }

      this.eventHandlers.get(handler.event)?.push(handler);
    }
  }
}
