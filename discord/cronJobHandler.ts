import { Collection, Message, Snowflake } from "discord.js";
import { DiscordBot } from "./client.ts";

const deleteVentChannelMessages = async (client: DiscordBot) => {
  const ventChannel = await client.discordClient.channels.fetch(
    "1330681528677699584"
  );

  if (!ventChannel) {
    // Checks if ventChannel exists.
    return;
  }
  if (ventChannel.isDMBased()) {
    // Checks if its a direct message to the bot.
    return;
  }
  if (!ventChannel.isSendable()) {
    // Checks if messages can be send in channel.
    return;
  }
  // Schedule the cron job to run every 24 hours
  console.log("Running daily cleanup task...");

  try {
    const now = Date.now();
    let lastMessageId = undefined;

    // Fetch messages in a paginated way
    while (true) {
      // Fetch up to 100 messages starting after the last fetched message
      const messages: Collection<Snowflake, Message> =
        await ventChannel.messages.fetch({
          limit: 100,
          before: lastMessageId,
        });

      if (messages.size === 0) break; // No more messages to fetch

      // Filter messages older than 24 hours
      const oldMessages = messages.filter(
        // (msg: Message) => now - msg.createdTimestamp > 24 * 60 * 60 * 1000
        (msg: Message) => now - msg.createdTimestamp > 60 * 1000
      );

      // Delete messages one by one to respect rate limits
      ventChannel.bulkDelete(messages);

      console.log(
        `Processed ${messages.size} messages. Deleted ${oldMessages.size} old messages.`
      );

      // Update lastMessageId for pagination
      lastMessageId = messages.last()?.id;

      // If there are no more old messages to delete, stop early
      if (oldMessages.size < messages.size) break;
    }
  } catch (error) {
    console.error("Error while running cleanup task:", error);
  }
};
