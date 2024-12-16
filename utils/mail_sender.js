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

const sendForgotPasswordMail = async (email, resetToken) => {
  const resetLink = `http://localhost:4000/rest-Password?token=${resetToken}`;
  try {
    await transporter.sendMail({
      from: 'fayizmuhammedmuhammedfayiz@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password: \n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
    });
    console.log("Forgot Password email sent successfully!");
  } catch (err) {
    console.log('Failed to send Forgot Password email', err);
  }
};

module.exports = { sendMail, sendForgotPasswordMail };

