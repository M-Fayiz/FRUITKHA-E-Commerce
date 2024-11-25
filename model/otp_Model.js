// models/otpModel.js
const mongoose = require('mongoose');


const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
 
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 3, // The document will be automatically deleted after 5 minutes of its creation time
  },
});
// Define a function to send emails


module.exports = mongoose.model("OTP", otpSchema);