import { zip } from 'fflate';
import { Buffer } from "node:buffer";

// Defining the file structure based on your original usage
export interface MemoryFile {
    name: string;
    data: Uint8Array | Buffer; // fflate works perfectly with Node Buffers
}

/**
 * Creates a Zip of files from memory using fflate.
 * @param {MemoryFile[]} fileArray - Files to be zipped.
 * @returns {Promise<Buffer>} - Promise resolving to a Buffer containing the zip file.
 */
async function createZipInMemory(fileArray: MemoryFile[]): Promise<Buffer> {
    // 1. fflate expects a single object mapping filenames to their data
    const zipData: Record<string, Uint8Array> = {};
    
    fileArray.forEach(file => {
        zipData[file.name] = file.data as unknown as Uint8Array;;
    });

    // 2. Wrap fflate's callback-based async zip function in a Promise
    return await new Promise((resolve, reject) => {
        zip(zipData, (err, data) => {
            if (err) {
                return reject(err);
            }
            // 3. fflate returns a standard Uint8Array. 
            // We convert it back to a Node Buffer to match your original return type.
            resolve(Buffer.from(data));
        });
    });
}

export {
    createZipInMemory
};