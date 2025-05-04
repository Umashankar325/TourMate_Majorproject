const mongoose = require("mongoose");
const connect = async () => {
  try {
    // await mongoose.connect("mongodb://localhost:27017/nodeturism", );
    await mongoose.connect(
      "mongodb+srv://umashankaruikey325:k3NbonZ2E8Ktvluy@insta-post-project.qam8k.mongodb.net/"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
module.exports = connect;
