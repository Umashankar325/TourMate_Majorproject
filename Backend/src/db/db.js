const mongoose=require('mongoose');
const connect=async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/nodeturism", );
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}
module.exports=connect;