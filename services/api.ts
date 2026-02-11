import { GoogleGenAI, Type } from "@google/genai";
import { QuoteMetadata } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates the quote text and visual description using Gemini.
 */
export const generateQuoteMetadata = async (topic: string, style: string): Promise<QuoteMetadata> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Generate a unique famous or highly inspiring quote card concept based on the topic: "${topic}" and the mood/style: "${style}".
    
    If the topic is a specific person, find a famous quote by them.
    If the topic is a general theme (e.g., "Success"), find a famous quote matching that theme.
    
    You must provide:
    1. The Quote itself.
    2. The Author.
    3. A highly detailed, artistic visual description (prompt) for an AI image generator. The image should generally not contain text, but should visually represent the metaphor or feeling of the quote. It should be high quality, cinematic, and suitable for a background.
    4. A short description (2 sentences) explaining the context or meaning of the quote.
    5. The mood inferred.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING },
          author: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
          description: { type: Type.STRING },
          mood: { type: Type.STRING }
        },
        required: ["quote", "author", "visualPrompt", "description", "mood"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to generate quote metadata.");
  }

  return JSON.parse(text) as QuoteMetadata;
};

/**
 * Generates the image using Gemini 2.5 Flash Image.
 */
export const generateCardImage = async (visualPrompt: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: visualPrompt + ", high quality, 8k, photorealistic, cinematic lighting, no text, clean composition",
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
        },
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
        throw new Error("No content returned from the model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }

    throw new Error("No image part found in the response.");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw new Error("Failed to generate visual using Gemini Image model.");
  }
};