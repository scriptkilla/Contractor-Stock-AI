
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

export type AIAnalysisError = 'QUOTA_EXCEEDED' | 'API_ERROR' | 'UNKNOWN';

export const analyzeProductImage = async (base64Image: string): Promise<{ data: AIProductInfo | null, error?: AIAnalysisError }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Extract raw base64 data regardless of whether it includes the data URL prefix
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    // Using gemini-3-flash-preview for better quota availability and speed
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: `You are an expert logistics coordinator and inventory specialist. 
            Examine this product image meticulously to extract technical inventory data.
            
            1. SKU/Serial: Look for visible barcodes, manufacturer part numbers (MPN), or serial strings. If none are found, generate a plausible internal SKU.
            2. Product Name: Identify the specific brand, model, and series.
            3. Category: Choose the most appropriate inventory classification.
            4. Description: 2-3 technical sentences focusing on use-cases and key specifications.
            5. Price: Realistic current market MSRP in USD (number only).
            6. Tags: Search-friendly keywords.
            
            Output MUST be valid JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sku: { type: Type.STRING, description: "Extracted or generated SKU" },
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER, description: "Confidence score 0-1" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["sku", "name", "category", "description", "estimatedPrice", "confidence", "tags"],
        },
      },
    });

    const text = response.text;
    if (!text) return { data: null, error: 'API_ERROR' };

    // Remove markdown code blocks if present to ensure clean JSON parsing
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return { data: JSON.parse(cleanJson) };
  } catch (error: any) {
    console.error("Gemini AI Analysis failed:", error);
    if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      return { data: null, error: 'QUOTA_EXCEEDED' };
    }
    return { data: null, error: 'API_ERROR' };
  }
};
