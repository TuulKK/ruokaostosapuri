import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
