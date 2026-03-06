const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const captainSchema = new mongoose.Schema({
    fullname : {
        firstname:{
            type:String,
        required:[true,"Name is required"],
        minlength:[2,"Name should contain atleat 2 character"]
        },
        lastname:{
            type:String,
        minlength:[3,"Last name should contain atleat 3 character"]
        }
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Please fill a valid email address"],
        minlength:[6,"email must contian atleast 5 characters"]
    },
    password:{ 
        type:String,
        required:[true,"password is mandatory"],
        select:false
    },
    socketId:{
        type:String
    },
    status:{
        type:String,
        enum:["active","inactive"],
        default:"inactive"
    },
    vehicle:{
        color:{
            type:String,
            required:[true,"Vehicle color is required"]
        },
        plate:{
            type:String,
            required:[true,"Vehicle plate number is required"],
            unique:true
        },
        capacity:{
            type:Number,
            required:[true,"Vehicle capacity is required"],
            min:[1,"Vehicle capacity must be at least 1"],
        },
        vehicleType:{
            type:String,
            required:[true,"Vehicle type is required"],
            enum:["car","motorcycle","auto"]
        }
    },
    location:{
        lat:{
            type:Number,
        },
        lng:{
            type:Number,
        }
    }
});

captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id:this.id} , process.env.JWT_SECRET,{expiresIn:'24h'});
    return token;
}

captainSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}
captainSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password,10);
}
const captainModel = mongoose.model("captain",captainSchema);

module.exports = captainModel;