import { GoogleGenAI, Type } from "@google/genai";

export interface AIProductInfo {
  sku: string;
  name: string;
  category: string;
  description: string;
  estimatedPrice: number;
  confidence: number;
  tags: string[];
}

export const analyzeProductImage = async (base64Image: string): Promise<AIProductInfo | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: `You are an expert logistics coordinator and inventory specialist. 
            Examine this product image meticulously.
            
            Identify:
            1. The SKU or Serial Number: Look for visible barcodes, manufacturer part numbers (MPN), or serial strings printed on the item or its packaging.
            2. The specific product name (Brand + Model + Series).
            3. The most appropriate inventory category.
            4. A technical, professional description (2-3 sentences) focusing on use-cases and key specs.
            5. A realistic current market MSRP in USD.
            6. Relevant search tags.
            
            If the image is blurry or the product is partially obscured, use your reasoning to provide the most likely match for the SKU and details.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sku: { type: Type.STRING, description: "Extracted SKU, serial number, or part number" },
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER, description: "0 to 1 confidence score" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["sku", "name", "category", "description", "estimatedPrice", "tags"],
        },
      },
    });

    if (!response.text) return null;
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini AI Analysis failed:", error);
    return null;
  }
};