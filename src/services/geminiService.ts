import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export const CATEGORIES = [
  { id: 'produce', name: 'Hevi' },
  { id: 'dairy', name: 'Maito & Vegaaniset' },
  { id: 'meat', name: 'Liha & Kala' },
  { id: 'bakery', name: 'Leipomo' },
  { id: 'pantry', name: 'Kuivatuotteet' },
  { id: 'other', name: 'Muut' },
];

export async function categorizeItem(itemName: string): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize this grocery item: "${itemName}". 
      Available categories: ${CATEGORIES.map(c => `${c.id} (${c.name})`).join(', ')}.
      Return only the category ID.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryId: {
              type: Type.STRING,
              description: "The ID of the category that best fits the item.",
              enum: CATEGORIES.map(c => c.id),
            },
          },
          required: ["categoryId"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result.categoryId || 'other';
  } catch (error) {
    console.error("Error categorizing item:", error);
    return 'other';
  }
}
