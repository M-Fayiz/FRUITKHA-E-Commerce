const USER = require("../../model/user/userModel");
const bcrypt = require("bcrypt");

const { sendForgotPasswordMail } = require("../../utils/mail_sender");
const secret = require("../../utils/env");
const TOKEN = require("../../model/user/token");
const crypto = require("crypto");
const httpStatusCode = require("../../constant/httpStatusCode");
const httpResponse = require("../../constant/httpResponse");

// Generate a random token

const securePassword = async (password) => {
  try {
    const hashpassword = await bcrypt.hash(password, 10);
    return hashpassword;
  } catch (error) {
    console.log(error);
  }
};

let LoadProfile = async (req, res) => {
  try {
    console.log(typeof req.params.id);

    let userId = req.params.id;
    console.log(userId);

    const user = await USER.findById(userId);

    res.render("user/profile", { user, CURRENTpage: "Profile" });
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .send(httpResponse.SERVER_ERROR_SHORT);
  }
};

const editProfile = async (req, res) => {
  try {
    console.log("msg from edit message");
    const { FIRST, LAST, phone, ID } = req.body;
    console.log(ID, "ID");
    const data = await USER.findByIdAndUpdate(
      ID,
      {
        firstName: FIRST,
        lastName: LAST,
        phone: phone,
      },
      { new: true },
    );

    console.log("retrive data from user", data);
    if (data) {
      res
        .status(httpStatusCode.OK)
        .json({ success: true, message: httpResponse.PROFILE_UPDATED });
    } else {
      res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.PROFILE_UPDATE_FAILED });
    }
  } catch (error) {
    console.log("error", error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

const ChangePass = async (req, res) => {
  try {
    console.log("get in change password");

    const { password, PAS1, userID } = req.body;

    console.log(userID);

    // Retrieve the user from the database
    const data = await USER.findById(userID);

    if (!data) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.USER_NOT_FOUND });
    }

    // Compare the entered password (plain-text) with the hashed password in the database
    const isMatch = await bcrypt.compare(password, data.password); // password entered by user, data.password is hashed

    if (!isMatch) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({
          success: false,
          message: httpResponse.CURRENT_PASSWORD_INVALID,
        });
    }

    // Hash the new password
    const newPass = await securePassword(PAS1); // Hash the new password with bcrypt

    // Update the password in the database
    const result = await USER.findByIdAndUpdate(userID, {
      password: newPass,
    });

    console.log("Password successfully updated");

    if (result) {
      res
        .status(httpStatusCode.OK)
        .json({ success: true, message: httpResponse.PASSWORD_CHANGED });
    } else {
      res
        .status(httpStatusCode.SERVER_ERROR)
        .json({ success: false, message: httpResponse.PASSWORD_CHANGE_FAILED });
    }
  } catch (error) {
    console.log("Error from change password:", error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

const rest = (req, res) => {
  res.render("user/reset");
};
const forgotPAS = async (req, res) => {
  console.log("Entered forgot password");

  const { email } = req.body;
  console.log(email);
  try {
    const result = await USER.findOne({ email });
    console.log(result, "User found in forgot password");

    if (!result) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.USER_NOT_FOUND });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    console.log("after tokrn");

    let existingToken = await TOKEN.findOne({ userID: result.id });
    if (existingToken) {
      existingToken.token = resetToken;

      await existingToken.save();
    } else {
      const saveTOKEN = new TOKEN({
        userID: result._id,
        token: resetToken,
      });
      await saveTOKEN.save();
    }

    console.log("Token saved successfully");

    try {
      await sendForgotPasswordMail(result.email, resetToken);
      res
        .status(httpStatusCode.OK)
        .json({ success: true, message: httpResponse.RESET_EMAIL_SENT });
    } catch (err) {
      console.error("Failed to send reset email:", err.message);
      res
        .status(httpStatusCode.SERVER_ERROR)
        .json({ success: false, message: httpResponse.RESET_EMAIL_FAILED });
    }
  } catch (error) {
    console.error("Error in forgot password:", error.message);
    res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

const REST = async (req, res) => {
  console.log("get in");

  const { newPassword, token } = req.body;

  console.log(req.body);
  console.log(newPassword, token);
  try {
    const result = await TOKEN.findOne({ token: token });
    if (!result) {
      return res
        .status(httpStatusCode.ITEM_NOT_FOUND)
        .json({ success: false, message: httpResponse.INVALID_TOKEN });
    }

    const secure = await securePassword(newPassword);
    console.log("secure", secure);
    console.log(result);
    const data = await USER.findByIdAndUpdate(result.userID, {
      password: secure,
    });
    console.log("data", data);

    if (data) {
      res
        .status(httpStatusCode.OK)
        .json({ success: true, message: httpResponse.PASSWORD_UPDATED });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(httpStatusCode.SERVER_ERROR)
      .json({ success: false, message: httpResponse.SERVER_ERROR });
  }
};

const newpass = (req, res) => {
  res.render("user/newPASS");
};

module.exports = {
  LoadProfile,
  editProfile,
  ChangePass,
  rest,
  forgotPAS,
  newpass,
  REST,
};
