import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
  Message,
  MessageActionRowComponentBuilder,
  OmitPartialGroupDMChannel,
} from "discord.js";
import { GetProfiles } from "$types/bluesky.ts";
import { getLogger } from "@logtape/logtape";
import { EventHandlerFunction } from "$types/EventHandler.ts";

const log = getLogger(["discord-bot", "event-handler"]);

const filterDisallowedTlds = (array: string[]): string[] => {
  const disallowedTlds = [
    ".alt",
    ".arpa",
    ".example",
    ".internal",
    ".invalid",
    ".local",
    ".localhost",
    ".onion", //may be allowed in the future
  ];

  return array.filter((item) => !disallowedTlds.some((suffix) => item.endsWith(suffix)));
};

const extractBlueskyHandles = (text: string): string[] => {
  const blueskyHandleRegex = /(?:^|\s)\@?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?=\s|$)/g;

  const matches = text.match(blueskyHandleRegex);

  const noWhitespace = matches?.map((item) => item.trim());

  const noAtSymbol = noWhitespace?.map((item) => item.replace(/^@/, ""));

  const onlyUnique = Array.from(new Set(noAtSymbol));

  const noBannedTld = filterDisallowedTlds(onlyUnique);

  return noBannedTld || [];
};

const fetchBskyProfiles = async (actors: string[]): Promise<GetProfiles> => {
  const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.actor.getProfiles");
  actors.forEach((actor) => {
    url.searchParams.append("actors", actor);
  });

  const response = await fetch(url);

  return response.json();
};

export class FindBlueskyHandles implements EventHandlerFunction<Events.MessageCreate> {
  event = Events.MessageCreate as const;
  runOnce = false;
  async run(message: OmitPartialGroupDMChannel<Message<boolean>>) {
    const matchedHandles = extractBlueskyHandles(message.content);
    const formatter = Intl.NumberFormat("de-ch"); // German Swiss formatting (22'039'464)
    if (matchedHandles.length < 1) return;
    if (matchedHandles.length > 25) {
      return log.debug(`Too many Bluesky handles found in one message. ({length})`, { matchedHandles, length: matchedHandles.length });
    }

    log.debug(`Handles found in message: {length}`, { matchedHandles, length: matchedHandles.length });

    const resp = await fetchBskyProfiles(matchedHandles);
    if (resp.profiles.length < 1) return;

    log.info(`Bluesky profiles matched in message: {profiles}`, {
      profiles: resp.profiles.map(({ did, handle }) => ({ did, handle })),
      length: matchedHandles.length,
      matchedHandles,
    });

    const embeds: EmbedBuilder[] = [];
    for (const profile of resp.profiles) {
      const embed = new EmbedBuilder()
        .setTitle(profile.displayName)
        .setURL(`https://bsky.app/profile/${profile.did}`)
        .setAuthor({ name: "Bluesky", iconURL: "https://web-cdn.bsky.app/static/favicon-32x32.png", url: "https://bsky.app" })
        .setThumbnail(profile.avatar)
        .addFields(
          { name: "Followers", value: String(formatter.format(profile.followersCount)), inline: true },
          { name: "Follows", value: String(formatter.format(profile.followsCount)), inline: true },
        );
      embeds.push(embed);
    }

    const dismissButton = new ButtonBuilder()
      .setCustomId(`dismiss:user`)
      .setLabel("Dismiss")
      .setEmoji("🫣")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(dismissButton);

    message.reply({ embeds, components: [row] });
  }
}
