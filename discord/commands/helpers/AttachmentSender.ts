import { AttachmentBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { ExpressionTypes } from "$types/ExpressionTypes.ts";
import fs from 'fs';

// DEPRECATED!!!
/**
 * Sends the zipped file from local storage.
 * @param {*} interaction - Interation for reply
 * @param {*} expressionType - Type of the expression
 * @param {*} downloadPath - Path to t
 */
async function sendZipAttachment(interaction: ChatInputCommandInteraction, expressionType: ExpressionTypes, downloadPath: string) {
    const zipFilePath = `${downloadPath}.zip`;

    if (!fs.existsSync(zipFilePath)) {
        throw new Error("Zip file was not created successfully.");
    }
    const attachment = new AttachmentBuilder(zipFilePath);
    await interaction.editReply({
        content: `Here are your ${expressionType}!`,
        files: [attachment]
    });

}

/**
 * 
 * @param {*} expressionType 
 * @param {*} zipBuffer 
 * @returns 
 */
async function sendZipAttachmentMemory(expressionType: ExpressionTypes, zipBuffer: any) {
    return new AttachmentBuilder(zipBuffer, { name: `${expressionType}.zip` });
}

export {
    sendZipAttachment,
    sendZipAttachmentMemory
}