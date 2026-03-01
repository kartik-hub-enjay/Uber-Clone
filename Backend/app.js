const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/db");
const userRoute = require("./routes/userRoute");
const cookieParsar = require("cookie-parser")

const app = express();

app.use(cookieParsar())
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true})) //understand about this 
dotenv.config()
connectDB();




app.use("/api/users",userRoute)

module.exports = app;
