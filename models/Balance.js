// models/InternetPayment.js
const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
  destination: String,
  name: String,
  number: Number,
  operator: String,
  amount: Number,
  noticeNumber:Number,
  date:Date,
  isConfirmed: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
}
});

module.exports = mongoose.model("Haram", balanceSchema);
