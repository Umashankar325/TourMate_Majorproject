const axios = require('axios');

const getLocationIQCoordinates = async (placeName, apiKey) => {
    const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(placeName)}&format=json`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                display_name: data[0].display_name, // You might want to return this as well
                // Add other relevant details from the LocationIQ response
            };
        } else {
            return null; // Or handle the case where no results are found differently
        }
    } catch (error) {
        console.error('Error fetching coordinates from LocationIQ:', error.message);
        return null; // Or throw the error for the calling function to handle
    }
};

const fetchLocationIQPlaceDetails = async (placeName, context, placeId, apiKey) => {
    // LocationIQ's search API can often provide sufficient details.
    // You might not need a separate "place details" endpoint like Google Places.
    // Adjust the query as needed based on context.
    let query = placeName;
    if (context) {
        query += ` near ${context}`;
    }
    const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}&format=json&limit=1`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                display_name: data[0].display_name,
                // Include other potentially useful details:
                // boundingbox: data[0].boundingbox,
                // importance: data[0].importance,
                // ...
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching place details from LocationIQ:', error.message);
        return null;
    }
};

const extractHotelsAndRestaurants = (itineraryData) => {
    const hotels = [];
    const restaurants = [];

    if (!itineraryData || !Array.isArray(itineraryData.itinerary)) return [hotels, restaurants];

    for (const day of itineraryData.itinerary) {
        if (day.schedule) {
            for (const item of day.schedule) {
                if (item.type === "hotel") {
                    hotels.push({
                        name: item.name || "Unknown Hotel",
                        context: item.location || "",
                        // LocationIQ doesn't directly use 'placeId' in the same way as Google.
                        // You'll be using name and context for lookups.
                        // placeId: item.placeId || null,
                    });
                } else if (item.type === "restaurant") {
                    restaurants.push({
                        name: item.name || "Unknown Restaurant",
                        context: item.location || "",
                        // placeId: item.placeId || null,
                    });
                }
            }
        }
    }

    return [hotels, restaurants];
};

module.exports = {
    fetchPlaceId: fetchLocationIQPlaceDetails, // Renamed and updated function
    extractHotelsAndRestaurants,
    getLocationIQCoordinates, // New function for getting coordinates
};