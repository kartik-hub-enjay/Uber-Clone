const mongoose = require("mongoose");

const blackListTokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required:true,
        unique:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:86400 //24 hours in seconds
    }
})

// understand how ttl works and how we use it in logout

module.exports = mongoose.model("blackListToken",blackListTokenSchema);