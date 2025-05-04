// src/services/promptService.js

// const { DateTime } = require('luxon'); // Use luxon for date handling (optional, or use native Date)

// Get prompt for generating unstructured itinerary
function getUnstructuredItineraryPrompt(preferences) {
  const departure = preferences.startPoint || 'NSS College of Engineering, Palakkad';
  const destination = preferences.destination || 'Ooty';
  const budget = preferences.budget || '6000 Rupees';
  const budgetValue = budget.split(' ')[0] || '6000';
  const travelStyle = preferences.travel_style || 'Solo';
  const transportation = preferences.transportation || 'public transport';
  const healthIssues = preferences.health_issues || 'no health issues';

  let days = 2;
  try {
    const start = new Date(preferences.start_date || '2025-06-01');
    const end = new Date(preferences.end_date || '2025-06-01');
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    days = Math.max(diff, 1);
  } catch (e) {
    console.warn('Invalid dates, defaulting to 2 days');
  }

  return `
generate an itinerary for a ${travelStyle} ${days}-day trip from ${departure} to ${destination}, 
generate a detailed travel plan with mode of transportation as ${transportation}, 
activities, restaurant names (for breakfast, lunch, and dinner), 
accommodation (with name of hotel), i have ${healthIssues},
also generate a realistic budget breaking down the cost within ${budgetValue} Rupees. 
For each hotel, restaurant, and activity location, include its Google Maps Place ID (e.g., ChIJ...) 
if available, or note 'ID not available' if not found. 
(note the prime focus of activities in the itinerary should be the destination, avoid including travel activities in the starting point)
  `;
}

// Get prompt for structuring the raw itinerary
function getStructuredItineraryPrompt(rawItinerary) {
  return `
You are a travel planner. Take the following unstructured itinerary and convert it into a structured JSON object matching this exact format:

{
  "tripName": "<Travel Style> <Destination> Trip from <Departure>",
  "duration": "<Days> Day(s)",
  "groupSize": 1,
  "travelStyle": "<Travel Style>",
  "season": "Adaptable, avoid peak monsoon",
  "startPoint": "<Departure>",
  "endPoint": "<Departure>",
  "itinerary": [
    {
      "day": 1,
      "title": "Journey to <Destination> and Initial Exploration",
      "schedule": [
        { "time": "<Time Range>", "activity": "<Activity Description>", "costPerPerson": "<Cost>", "placeId": "<Google Maps Place ID>" }
      ]
    }
  ],
  "hotelRecommendations": [
    { "category": "Budget-Friendly", "options": ["<Hotel Name>"], "placeId": "<Google Maps Place ID>" }
  ],
  "hotelCostEstimate": {
    "costPerRoomPerNight": "<Cost Range>",
    "assumptions": "Budget-friendly option for 1 traveler",
    "costPerPerson": "<Cost Range>"
  },
  "budgetCalculation": {
    "transportation": { "totalTransportation": "<Cost Range>" },
    "accommodation": "<Cost Range>",
    "food": { "totalFood": "<Cost Range>" },
    "activitiesEntryFees": "<Cost Range>",
    "miscellaneous": "<Cost Range>",
    "totalEstimatedBudgetPerPerson": "<Total Cost Range>"
  },
  "importantNotesAndTips": [
    "<Note 1>",
    "<Note 2>"
  ]
}

Here’s the unstructured itinerary to convert:
${rawItinerary}

Ensure:
- Extract days, timings, activities, restaurant names, hotel name, and costs from the text.
- Include Google Maps Place IDs (e.g., 'ChIJ...') for hotels, restaurants, and activity locations as 'placeId' fields.
- If no Place ID is provided, use 'ID not available'.
- Fill in the JSON structure accurately based on the provided data.
- Use realistic cost ranges in INR (e.g., '₹200-₹300').
- Provide the response as a valid JSON object only.
  `;
}

module.exports = {
  getUnstructuredItineraryPrompt,
  getStructuredItineraryPrompt
};
