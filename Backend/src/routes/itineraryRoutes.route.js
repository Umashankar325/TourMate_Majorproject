const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

const {
  generateItinerary,
  getUserItineraries,
} = require("../controllers/itinerary.controller");


router.post("/generate-itinerary",verifyToken, generateItinerary); 
router.get("/user-itineraries",verifyToken, getUserItineraries); 

module.exports = router;
