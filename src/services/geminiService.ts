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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined') {
      console.warn("GEMINI_API_KEY puuttuu. Tekoäly-kategorisointi ei toimi ilman sitä.");
      return 'other';
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Olet suomalainen ruokaostokset-apuri. Luokittele tuote: "${itemName}"
      
      Kategoriat ja niiden ID:t:
      - produce: Hedelmät, vihannekset, marjat, yrtit, juurekset
      - dairy: Maito, juustot, munat, jogurtit, kauramaidot, vegaaniset tuotteet
      - meat: Liha, kala, kana, leikkeleet, makkarat
      - bakery: Leivät, pullat, kakut, keksit
      - pantry: Kuivatuotteet, pasta, riisi, jauhot, mausteet, öljyt, säilykkeet, kahvi, tee
      - other: Kaikki muu (siivous, hygienia, lemmikit jne.)

      VASTAA VAIN JSON-MUODOSSA: {"categoryId": "id_tähän"}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryId: {
              type: Type.STRING,
              enum: ['produce', 'dairy', 'meat', 'bakery', 'pantry', 'other'],
            },
          },
          required: ["categoryId"],
        },
      },
    });

    if (!response.text) {
      console.error("Gemini palautti tyhjän vastauksen");
      return 'other';
    }
    
    const result = JSON.parse(response.text.trim());
    console.log(`Tekoäly tunnisti tuotteen "${itemName}" kategoriaan: ${result.categoryId}`);
    return result.categoryId || 'other';
  } catch (error) {
    console.error("Gemini-virhe:", error);
    return 'other';
  }
}
