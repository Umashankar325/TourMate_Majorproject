const mongoose = require("mongoose");

const ItinerarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    preference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPreference",
      required: true,
    },
    itinerary_data: { type: Object, required: true },
  },
  { timestamps: true }
);

ItinerarySchema.methods.getItineraryJSON = function () {
  return JSON.stringify(this.itinerary_data);
};

module.exports = mongoose.model("Itinerary", ItinerarySchema);
