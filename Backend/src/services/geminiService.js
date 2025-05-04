// src/services/geminiService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getUnstructuredItineraryPrompt, getStructuredItineraryPrompt } = require('./promptService');
const logger = console;
const dotenv = require('dotenv');
dotenv.config();

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Use appropriate model name
  }

  async generateRawItinerary(preferences) {
    try {
      const prompt = getUnstructuredItineraryPrompt(preferences);
      console.log("Unstructured prompt sent to Gemini:", prompt);
      
      const result = await this.model.generateContent(prompt);
      const rawItinerary = result.response.text().trim();

      console.log("Raw itinerary from Gemini:", rawItinerary);
      if (!rawItinerary) {
        throw new Error("Empty response from Gemini API");
      }

      return rawItinerary;
    } catch (err) {
      logger.error("Error generating raw itinerary:", err);
      throw new Error(`Failed to generate raw itinerary: ${err.message}`);
    }
  }

  async structureItinerary(rawItinerary, preferences) {
    try {
      const prompt = getStructuredItineraryPrompt(rawItinerary);
      console.log("Structured prompt sent to Gemini:", prompt);

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text().trim();

      console.log("Structured response from Gemini:", responseText);
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      let itineraryData;
      try {
        itineraryData = JSON.parse(responseText);
      } catch (err) {
        // Try to extract JSON with regex if full response is invalid
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          itineraryData = JSON.parse(jsonMatch[0]);
        } else {
          logger.error("Failed to parse JSON from Gemini:", responseText);
          throw new Error("Invalid JSON response from Gemini API");
        }
      }

      // Force startPoint
      const originalStart = itineraryData.startPoint || "Not set";
      itineraryData.startPoint = preferences.startPoint;
      if (originalStart !== preferences.startPoint) {
        console.log(`Overrode startPoint from '${originalStart}' to '${preferences.startPoint}'`);
      }

      // Force first activity
      const firstDay = itineraryData?.itinerary?.[0];
      if (firstDay?.schedule?.[0]?.activity) {
        const activity = firstDay.schedule[0].activity;
        if (
          activity.includes("NSS College") ||
          !activity.startsWith(`Depart from ${preferences.startPoint}`)
        ) {
          const newActivity = `Depart from ${preferences.startPoint} to ${preferences.destination}`;
          console.log(`Overrode first activity from '${activity}' to '${newActivity}'`);
          firstDay.schedule[0].activity = newActivity;
        }
      }

      return itineraryData;

    } catch (err) {
      logger.error("Error structuring itinerary:", err);
      throw new Error(`Failed to structure itinerary: ${err.message}`);
    }
  }

  async generateItinerary(preferences) {
    const raw = await this.generateRawItinerary(preferences);
    return await this.structureItinerary(raw, preferences);
  }
}

module.exports = GeminiService;
// module.exports = { generateItinerary };
