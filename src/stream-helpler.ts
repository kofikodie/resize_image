import { Readable } from "node:stream";

export class StreamHelper {
    static async streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Uint8Array[] = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("end", () => resolve(Buffer.concat(chunks)));
            stream.on("error", (err) => reject(err));
        });
    }
}