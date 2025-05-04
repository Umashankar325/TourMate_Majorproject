const mongoose = require("mongoose");
const UserPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    departure: { type: String, default: "" },
    destination: { type: String, default: "" },
    budget: { type: String, default: "unspecified" },
    start_date: { type: Date, default: () => new Date() },
    end_date: { type: Date, default: () => new Date() },
    travel_style: { type: String, default: "unspecified" },
    activities: { type: [String], default: [] }, 
    transportation: { type: String, default: "unspecified" },
    health_issues: { type: [String], default: [] },
  },
  { timestamps: true }
);
UserPreferenceSchema.methods.toDict = function () {
  return {
    departure: this.departure || "",
    destination: this.destination || "",
    budget: this.budget || "unspecified",
    start_date: this.start_date?.toISOString().split("T")[0],
    end_date: this.end_date?.toISOString().split("T")[0],
    travel_style: this.travel_style || "unspecified",
    activities: this.activities || [],
    transportation: this.transportation || "unspecified",
    health_issues: this.health_issues || [],
  };
};

module.exports = mongoose.model("UserPreference", UserPreferenceSchema);
