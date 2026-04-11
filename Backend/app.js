const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/db");
const userRoute = require("./routes/userRoute");
const cookieParsar = require("cookie-parser")
const captainRoute = require("./routes/captainRoute");
const mapsRoute = require('./routes/mapRoute');
const rideRoute = require('./routes/rideRoutes')

const app = express();

app.use(cookieParsar())
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true})) //understand about this 
dotenv.config()
connectDB();




app.use("/api/users",userRoute)
app.use("/api/captains",captainRoute)
app.use('/api/maps', mapsRoute);
app.use('/api/rides',rideRoute)

module.exports = app;
