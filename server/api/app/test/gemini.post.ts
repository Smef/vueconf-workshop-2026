export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    const { message } = await readBody(event);

    if (!message?.trim()) {
        throw createError({ statusCode: 400, message: "Message is required" });
    }

    const apiKey = config.geminiApiKey;
    if (!apiKey) {
        throw createError({ statusCode: 500, message: "NUXT_GEMINI_API_KEY is not configured" });
    }

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: message,
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
    return { reply: text };
});
