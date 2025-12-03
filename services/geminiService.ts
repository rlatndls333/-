
import { GoogleGenAI, Type } from "@google/genai";
import { CoffeeRecommendation, UserSelection, Cafe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecommendation = async (selection: UserSelection): Promise<CoffeeRecommendation> => {
  const model = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `User Context:
      1. Mood: ${selection.mood}
      2. Weather: ${selection.weather}
      3. Situation: ${selection.situation}
      4. Physical Condition: ${selection.physical}
      5. Temperature Preference: ${selection.temp}
      6. Caffeine Tolerance: ${selection.caffeine}
      7. Sweetness Level: ${selection.sweetness}
      8. Flavor Preference: ${selection.flavor}
      9. Texture Preference: ${selection.texture}
      10. Volume/Amount: ${selection.volume}
      11. Pairing Preference: ${selection.pairing}
      12. Aesthetic/Vibe: ${selection.vibe}

      Task: Recommend a specific coffee drink that perfectly suits this complex context and create a "Coffee Character" description for it.
      The output MUST be in Korean (Hangul), except for the visualPrompt which must be in English.
      
      Rules:
      1. Choose a coffee drink that matches ALL criteria (temp, sweetness, caffeine, etc.) as closely as possible.
      2. 'coffeeName': Be specific (e.g., "Iced Vanilla Oat Latte" instead of just "Latte").
      3. 'tagline': A cheering or empathetic one-liner.
      4. 'description': Explain why this specific combination is the perfect prescription for today.
      5. 'traits': 3 keywords describing the vibe.
      6. 'snackPairing': A dessert or snack that goes well with this coffee.
      7. 'musicPairing': A specific song title and artist (e.g., "IU - Palette") matching the vibe.
      8. 'brewingStyle': A short philosophical advice for today.
      9. 'visualPrompt': A descriptive prompt in English for an AI image generator to create a CUTE 3D CHARACTER representing this coffee.
         - Format: "A cute 3D render of a [Coffee Type] character, [Appearance details reflecting '${selection.mood}' and '${selection.vibe}'], expressive face, holding [snack or accessory], soft studio lighting, pixar style, 8k"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coffeeName: { type: Type.STRING, description: "Name of the coffee drink in Korean" },
            tagline: { type: Type.STRING, description: "A witty one-liner caption in Korean" },
            description: { type: Type.STRING, description: "Reason for recommendation in Korean" },
            traits: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 vibe keywords in Korean"
            },
            snackPairing: { type: Type.STRING, description: "Best food pairing" },
            musicPairing: { type: Type.STRING, description: "Best music pairing (Song - Artist)" },
            brewingStyle: { type: Type.STRING, description: "Advice for the day" },
            visualPrompt: { type: Type.STRING, description: "English prompt for 3D character image generation" }
          },
          required: ["coffeeName", "tagline", "description", "traits", "snackPairing", "musicPairing", "brewingStyle", "visualPrompt"]
        }
      }
    });

    let text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Sanitize: Sometimes Gemini wraps JSON in markdown code blocks
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    return JSON.parse(text) as CoffeeRecommendation;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback in case of error
    return {
      coffeeName: "오늘의 믹스커피",
      tagline: "이러나 저러나, 역시 이게 최고",
      description: "복잡한 분석보다는, 익숙한 달달함이 당신을 위로해줄 거예요.",
      traits: ["익숙함", "달달함", "편안함"],
      snackPairing: "에이스 크래커",
      musicPairing: "10cm - 아메리카노",
      brewingStyle: "잠시 내려놓고 쉬어가세요",
      visualPrompt: "A cute 3D coffee mix stick character, cozy atmosphere, pixar style, 8k"
    };
  }
};

export const searchNearbyCafes = async (lat: number, lng: number, coffeeName: string): Promise<Cafe[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find 3 highly rated cafes near this location (lat: ${lat}, lng: ${lng}) that serve great coffee or similar drinks to "${coffeeName}".
      
      You must Output the result strictly as a valid JSON array matching this structure:
      [
        {
          "name": "Cafe Name",
          "rating": "4.5",
          "address": "123 Main St",
          "openStatus": "Open Now",
          "mapsUrl": "https://maps.google.com/..."
        }
      ]
      
      Do not include any conversational text outside the JSON block.
      `,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        },
        // Note: responseMimeType and responseSchema are NOT supported with googleMaps tool.
        // We rely on the prompt to enforce JSON structure.
      }
    });

    let text = response.text;
    if (!text) {
      return [];
    }

    // Parse JSON from text (handling markdown blocks if present)
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    let jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
    
    // Clean up potential leading/trailing non-json characters if regex didn't catch them
    const startIndex = jsonStr.indexOf('[');
    const endIndex = jsonStr.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      jsonStr = jsonStr.substring(startIndex, endIndex + 1);
    }

    try {
      const data = JSON.parse(jsonStr);
      // Ensure it's an array
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to parse JSON from Maps response:", text);
      return [];
    }

  } catch (error) {
    console.error("Google Maps Search Error:", error);
    return [];
  }
};

export const searchYoutubeId = async (query: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the official YouTube video URL for the song "${query}".
      Output ONLY the full URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ).
      Do NOT provide just the ID.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text?.trim();
    if (!text) return null;

    // Robust regex to extract ID from various YouTube URL formats
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = text.match(regExp);

    return match ? match[1] : null;

  } catch (error) {
    console.error("YouTube Search Error:", error);
    return null;
  }
};
