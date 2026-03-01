const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db/db");

dotenv.config()
connectDB();

const app = express();
app.use(cors());

app.get("/",(req,res)=>{
    res.send("hello")
})

module.exports = app;
