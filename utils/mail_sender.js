const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const sendMail = async (email, otp) => {
 

  try {
   const sent = await resend.emails.send({
      from: "Fruitkha <no-reply@codeaspire.online>",
      to: email,
      subject: "Verify Your Account - Fruitkha",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff7ed; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          
          <h1 style="color: #f97316; margin-bottom: 10px;">🍊 Fruitkha</h1>
          <p style="color: #555;">Fresh fruits, veggies & dairy at your doorstep</p>

          <hr style="margin: 20px 0;" />

          <h2 style="color: #333;">OTP Verification</h2>
          <p style="color: #666;">Use the OTP below to verify your account:</p>

          <div style="font-size: 28px; font-weight: bold; color: #f97316; margin: 20px 0;">
            ${otp}
          </div>

          <p style="color: #999; font-size: 12px;">This OTP is valid for a limited time.</p>
        </div>
      </div>
      `,
    });
    console.log('sent :',sent)
  } catch (err) {
    console.log("OTP send failed", err);
  }
};
const sendForgotPasswordMail = async (email, resetToken) => {
  const resetLink = `${process.env.resetLink}?token=${resetToken}`;

  try {
    const sent=await resend.emails.send({
       from: "Fruitkha <no-reply@codeaspire.online>",
      to: email,
      subject: "Reset Your Password - Fruitkha",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff7ed; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">

          <h1 style="color: #f97316;">🍊 Fruitkha</h1>
          <p style="color: #555;">Fresh essentials delivered daily</p>

          <hr style="margin: 20px 0;" />

          <h2 style="color: #333;">Password Reset</h2>
          <p style="color: #666;">Click the button below to reset your password:</p>

          <a href="${resetLink}" 
             style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
             Reset Password
          </a>

          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            If you didn’t request this, please ignore this email.
          </p>
        </div>
      </div>
      `,
    });
    console.log('sent :',sent)
    console.log("Forgot Password email sent successfully!");
  } catch (err) {
    console.log("Failed to send Forgot Password email", err);
  }
};
module.exports = { sendMail, sendForgotPasswordMail };