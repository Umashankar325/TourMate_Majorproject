const express=require('express');
const app=express();
var cors = require('cors')
const cookieParser = require('cookie-parser');

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const userRoutes = require('./routes/userRoutes.route');
const itineraryRoutes = require('./routes/itineraryRoutes.route');

app.get('/',(req,res)=>{
    res.send('Hello World!');
});
app.use('/api/users', userRoutes);
app.use('/api/itinerary', itineraryRoutes);
module.exports=app;