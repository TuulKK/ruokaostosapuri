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
      model: "gemini-1.5-flash-latest",
      contents: `Olet ostoslista-apuri. Luokittele tämä tuote: "${itemName}".
      Käytettävissä olevat kategoriat:
      - produce: Hedelmät, vihannekset, juurekset, yrtit
      - dairy: Maito, juusto, jogurtti, kananmunat, kauramaito, vegaaniset korvikkeet
      - meat: Liha, kana, kala, leikkeleet
      - bakery: Leipä, sämpylät, leivonnaiset
      - pantry: Jauhot, pasta, riisi, säilykkeet, mausteet, öljyt, kahvi
      - other: Kaikki muu (pesuaineet, wc-paperi jne.)

      Palauta JSON-muodossa: {"categoryId": "valittu_id"}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return 'other';
    
    const result = JSON.parse(text);
    return result.categoryId || 'other';
  } catch (error) {
    console.error("Error categorizing item:", error);
    return 'other';
  }
}
