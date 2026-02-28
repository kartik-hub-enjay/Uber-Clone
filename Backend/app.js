const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config()

const app = express();
app.use(cors());

app.get("/",(req,res)=>{
    res.send("hello")
})

module.exports = app;
