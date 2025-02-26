import { REST, Routes } from "npm:discord.js";
import { type RESTGetCurrentApplicationResult, RESTPutAPIApplicationCommandsResult } from "npm:discord-api-types/rest";

const token = Deno.env.get("DISCORD_TOKEN");
if (!token) {
  console.error("No Discord token in env var.");
  Deno.exit(1);
}

const discordREST = new REST().setToken(token);

const me = await discordREST.get(Routes.currentApplication()) as RESTGetCurrentApplicationResult;

if (!me.bot) {
  console.error("No bot associated with application.");
  Deno.exit(1);
}

const clientId = me.bot.id;
if (!clientId) {
  console.error("No client ID when registering commands");
  Deno.exit(1);
}
discordREST
  .put(Routes.applicationCommands(clientId), {
    body: [],
  })
  .then((response: unknown) => {
    const commands = response as RESTPutAPIApplicationCommandsResult;
    if (commands.length <= 0) {
      console.log("Successfully deregistered all global appliaction (/) commands");
    }
  })
  .catch((error: unknown) => {
    console.error("Error deregistering global application (/) commands", error);
  });
