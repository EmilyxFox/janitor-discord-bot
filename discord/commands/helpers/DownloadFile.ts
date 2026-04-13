import { ExpressionTypes } from "$types/ExpressionTypes.ts";

/**
 * Triggers the download of the files in memory using native fetch.
 * @param {any} expressions - Array/Map of expressions to download.
 * @param {ExpressionTypes} expressionType - Expression type.
 * @returns {Promise<Array<{name: string, data: Uint8Array}>>}
 */
async function downloadFilesToMemory(expressions: any, expressionType: ExpressionTypes) {
    const files = [];
    
    // Iterating through expressions
    for (const expression of expressions.values()) {
        try {
            let ext = 'png';
            let animated = false;

            if (expressionType === ExpressionTypes.EMOJI) {
                ext = expression.animated ? 'webp' : 'png';
                animated = !!expression.animated;
            }

            const url = expressionType === ExpressionTypes.EMOJI 
                ? expression.imageURL({ extension: ext, animated: animated }) 
                : expression.url;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://discord.com/'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // fetch equivalent of 'arraybuffer' responseType
            const arrayBuffer = await response.arrayBuffer();

            files.push({
                name: `${expression.name}.${ext}`,
                // Convert ArrayBuffer to Uint8Array for easier handling/fflate compatibility
                data: new Uint8Array(arrayBuffer)
            });

        } catch (error: any) {
            console.error(`Failed to download ${expression.name}:`, error.message);
            continue;
        }
    }
    return files;
}

export {
    downloadFilesToMemory
};