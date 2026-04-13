import { EmbedBuilder, ColorResolvable } from 'discord.js';

const createEmbed = (title = 'Execution Complete.', description = 'Command has been executed.', color: ColorResolvable) => new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);

const createErrorEmbed = (error: string) => new EmbedBuilder()
    .setTitle(`An error has occured while running the command.`)
    .setDescription(`Error: ${error}`)
    .setColor('Red');

export {
    createEmbed,
    createErrorEmbed
}