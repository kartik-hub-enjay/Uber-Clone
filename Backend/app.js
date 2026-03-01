const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/db");
const authRoute = require("./routes/userRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true})) //understand about this 
dotenv.config()
connectDB();




app.use("/api/users",authRoute)

module.exports = app;
