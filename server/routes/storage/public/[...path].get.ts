const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
};

export default defineEventHandler(async (event) => {
    const path = getRouterParam(event, "path") ?? "";
    const data = await storagePublic.getItemRaw(path);

    if (!data) {
        throw createError({ statusCode: 404, statusMessage: "File not found" });
    }

    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    setHeader(event, "content-type", contentTypes[ext] ?? "application/octet-stream");

    return data;
});
