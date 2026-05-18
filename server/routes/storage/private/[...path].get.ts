import { normalize, join } from "node:path";
import { createReadStream, promises as fsPromises } from "node:fs";
import { sendStream } from "h3";

import storage from "#server/utils/storage";
import storageConfig from "~~/config/storage";

function getMimeType(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase();
    const map: Record<string, string> = {
        mp4: "video/mp4",
        webm: "video/webm",
        ogg: "video/ogg",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        mkv: "video/x-matroska",
        mp3: "audio/mpeg",
        wav: "audio/wav",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        pdf: "application/pdf",
        txt: "text/plain",
    };
    return map[ext || ""] || "application/octet-stream";
}

export default defineEventHandler(async (event) => {
    const rawPath = event.context.params?.path;
    const pathParts = Array.isArray(rawPath) ? rawPath.join("/") : (rawPath ?? "");
    const normalized = normalize(pathParts);

    // Reject any path that could escape the root directory
    // 1. Reject absolute paths (starting with /)
    // 2. Reject paths with .. segments that could traverse up
    // 3. Reject paths starting with .. or containing /.. or/..//
    if (
        normalized.startsWith("/") ||
        normalized.startsWith("..") ||
        normalized.includes("/../") ||
        normalized.endsWith("..")
    ) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid path",
        });
    }

    const filePath = "/" + normalized;

    if (!(await storage.hasItem(filePath))) {
        throw createError({ statusCode: 404, statusMessage: "File not found" });
    }

    const mimeType = getMimeType(filePath);

    setHeader(event, "Content-Type", mimeType);
    setHeader(event, "Accept-Ranges", "bytes");

    const range = getHeader(event, "range");

    // For local filesystem storage, stream directly from disk.
    if (storageConfig.private.driver === "fs") {
        const diskPath = join(storageConfig.private.base!, normalized);
        const { size } = await fsPromises.stat(diskPath);

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0] ?? "", 10);
            let end = parts[1] ? parseInt(parts[1], 10) : size - 1;

            if (isNaN(start) || isNaN(end) || start < 0 || end < 0 || start >= size || start > end) {
                setResponseStatus(event, 416);
                setHeader(event, "Content-Range", `bytes */${size}`);
                return;
            }

            if (end >= size) {
                end = size - 1;
            }

            const chunksize = end - start + 1;

            setResponseStatus(event, 206);
            setHeader(event, "Content-Range", `bytes ${start}-${end}/${size}`);
            setHeader(event, "Content-Length", chunksize);

            const stream = createReadStream(diskPath, { start, end });
            return sendStream(event, stream);
        } else {
            setHeader(event, "Content-Length", size);
            const stream = createReadStream(diskPath);
            return sendStream(event, stream);
        }
    }

    // Fallback for non-fs drivers: buffer-based response.
    const file = await storage.getItemRaw(filePath);
    const buffer = Buffer.from(file);
    const size = buffer.length;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0] ?? "", 10);
        let end = parts[1] ? parseInt(parts[1], 10) : size - 1;

        if (isNaN(start) || isNaN(end) || start < 0 || end < 0 || start >= size || start > end) {
            setResponseStatus(event, 416);
            setHeader(event, "Content-Range", `bytes */${size}`);
            return;
        }

        if (end >= size) {
            end = size - 1;
        }

        const chunksize = end - start + 1;

        setResponseStatus(event, 206);
        setHeader(event, "Content-Range", `bytes ${start}-${end}/${size}`);
        setHeader(event, "Content-Length", chunksize);

        return buffer.subarray(start, end + 1);
    } else {
        setHeader(event, "Content-Length", size);
        return buffer;
    }
});
