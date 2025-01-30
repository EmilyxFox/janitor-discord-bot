import { EmbedBuilder, Message, OmitPartialGroupDMChannel } from "discord.js";
import { GetProfiles } from "$types/bluesky.ts";
import logger from "$logging/logger.ts";

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
  const blueskyHandleRegex = /(?:^|\s)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?=\s|$)/g;

  const matches = text.match(blueskyHandleRegex);

  const noWhitespace = matches?.map((item) => item.trim());

  const onlyUnique = Array.from(new Set(noWhitespace));

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

export const findBlueskyHandles = async (message: OmitPartialGroupDMChannel<Message<boolean>>) => {
  if (!message.channel.isSendable()) return;
  if (message.channel.isDMBased()) return;

  const handles = extractBlueskyHandles(message.content);
  if (handles.length < 1) return;

  const childLogger = logger.child({
    handler: {
      eventType: "messageCreate",
      name: "findBlueskyHandles",
      event: {
        user: { id: message.author.id, name: message.author.username },
        guild: { id: message.guildId },
        message: { id: message.id, content: message.content },
      },
    },
  });

  if (handles.length > 25) {
    return childLogger.debug(`Too many Bluesky handles found in one message. (${handles.length})`, {
      data: {
        handles,
        length: handles.length,
      },
    });
  }

  childLogger.info(`Bluesky handles found in message`, {
    data: {
      handles,
      length: handles.length,
    },
  });

  const resp = await fetchBskyProfiles(handles);
  if (resp.profiles.length < 1) return;

  const profileList: { did: string; handle: string }[] = [];

  const formatter = Intl.NumberFormat("de-ch"); // German Swiss formatting (22'039'464)

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
    profileList.push({ did: profile.did, handle: profile.handle });
  }

  childLogger.info("Bluesky accounts mentioned in message. Responding with account embed...", {
    data: {
      profiles: profileList,
      handles,
      length: handles.length,
    },
  });

  message.channel.send({ embeds });
};
