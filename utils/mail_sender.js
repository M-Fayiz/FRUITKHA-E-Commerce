const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "fayizmuhammedmuhammedfayiz@gmail.com",
    pass: "jrar wqwc faig rjtb",
  },
});

const sendMail = async (email,otp)=>{
  try{
    await transporter.sendMail({
      from:'fayizmuhammedmuhammedfayiz@gmail.com',
      to:email,
      subject:'Test',
      text:`Your otp is ${otp}`
    })
  }catch(err){
    console.log('Otp send failed',err)
  }
}

module.exports = sendMail;