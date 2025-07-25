const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    required:true,
    default: "user"
  },
    balance: { type: Number, default: 0 }, // رصيد المشترك

});

module.exports = mongoose.model("User", userSchema);
