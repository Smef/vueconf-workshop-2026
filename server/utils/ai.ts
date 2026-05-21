import { GoogleGenAI } from "@google/genai";

const config = useRuntimeConfig();

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export default ai;

export function embedContent(content: string, taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
    return ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
        config: {
            outputDimensionality: 768,
            taskType,
        },
    });
}
