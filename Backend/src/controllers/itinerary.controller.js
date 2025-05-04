const UserPreference = require("../models/UserPreferenceModel");
const Itinerary = require("../models/ItineraryModel");
const GeminiService = require("../services/geminiService");
const gemini = new GeminiService();

const generateWithGemini = gemini.generateItinerary.bind(gemini);

const {
  fetchPlaceId,
  extractHotelsAndRestaurants,
  getLocationIQCoordinates,
} = require("../utils/googleMapsHelper");

const generateItinerary = async (req, res) => {
    try {
        const preferenceData = req.body;
        const preference = new UserPreference({
            ...preferenceData,
            user: req.user.userId,
        });
        await preference.save();

        preferenceData.startPoint = preferenceData.departure;
        delete preferenceData.departure;

        const itineraryData = await generateWithGemini(preferenceData);

        if (
            !itineraryData.startPoint ||
            itineraryData.startPoint !== preferenceData.startPoint
        ) {
            itineraryData.startPoint = preferenceData.startPoint;
        }

        const itinerary = new Itinerary({
            user: req.user.userId,
            preference: preference._id,
            itinerary_data: itineraryData,
        });
        await itinerary.save();

        const [hotels, restaurants] = extractHotelsAndRestaurants(itineraryData);
        const hotelLocations = await Promise.all(
            hotels.map(async (h) => {
                const location = await fetchPlaceId(h.name, h.context, null, process.env.LOCATIONIQ_API_KEY);
                return location ? { name: h.name, ...location } : null;
            }).filter(Boolean)
        );
        const restaurantLocations = await Promise.all(
            restaurants.map(async (r) => {
                const location = await fetchPlaceId(r.name, r.context, null, process.env.LOCATIONIQ_API_KEY);
                return location ? { name: r.name, ...location } : null;
            }).filter(Boolean)
        );

        const mapData = await getLocationIQCoordinates(
            itineraryData.startPoint,
            process.env.LOCATIONIQ_API_KEY
        );

        res.status(201).json({
            mapData, // Now contains latitude and longitude
            id: itinerary._id,
            user: itinerary.user,
            preference: itinerary.preference,
            itinerary_data: {
                ...itineraryData,
                startPoint: preferenceData.startPoint,
            },
            hotels: hotelLocations,
            restaurants: restaurantLocations,
            created_at: itinerary.createdAt,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getUserItineraries = async (req, res) => {
    const { id, latest, detail } = req.query;

    try {
        let itineraries = await Itinerary.find({ user: req.user.userId }).sort({
            createdAt: -1,
        });

        if (!itineraries.length) {
            return res.status(404).json({ error: "No itineraries found" });
        }

        if (id) {
            const itinerary = itineraries.find((i) => i._id.toString() === id);
            if (!itinerary) {
                return res.status(404).json({ error: "Itinerary not found" });
            }

            if (detail === "true") {
                const [hotels, restaurants] = extractHotelsAndRestaurants(
                    itinerary.itinerary_data
                );
                const hotelLocations = await Promise.all(
                    hotels.map(async (h) => {
                        const location = await fetchPlaceId(h.name, h.context, null, process.env.LOCATIONIQ_API_KEY);
                        return location ? { name: h.name, ...location } : null;
                    }).filter(Boolean)
                );
                const restaurantLocations = await Promise.all(
                    restaurants.map(async (r) => {
                        const location = await fetchPlaceId(r.name, r.context, null, process.env.LOCATIONIQ_API_KEY);
                        return location ? { name: r.name, ...location } : null;
                    }).filter(Boolean)
                );

                return res.json({
                    itinerary: itinerary.itinerary_data,
                    hotels: hotelLocations,
                    restaurants: restaurantLocations,
                });
            }

            return res.json(itinerary);
        }

        if (latest === "true" && detail === "true") {
            const itinerary = itineraries[0];
            const [hotels, restaurants] = extractHotelsAndRestaurants(
                itinerary.itinerary_data
            );
            const hotelLocations = await Promise.all(
                hotels.map(async (h) => {
                    const location = await fetchPlaceId(h.name, h.context, null, process.env.LOCATIONIQ_API_KEY);
                    return location ? { name: h.name, ...location } : null;
                }).filter(Boolean)
            );
            const restaurantLocations = await Promise.all(
                restaurants.map(async (r) => {
                    const location = await fetchPlaceId(r.name, r.context, null, process.env.LOCATIONIQ_API_KEY);
                    return location ? { name: r.name, ...location } : null;
                }).filter(Boolean)
            );

            return res.json({
                itinerary: itinerary.itinerary_data,
                hotels: hotelLocations,
                restaurants: restaurantLocations,
            });
        }

        res.json(itineraries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    generateItinerary,
    getUserItineraries,
};