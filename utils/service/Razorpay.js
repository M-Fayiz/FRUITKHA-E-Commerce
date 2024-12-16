const Razorpay = require('razorpay');


const razorpay = new Razorpay({
  // Should print the key secret

  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
})


module.exports=razorpay