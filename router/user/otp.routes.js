const express = require("express");
const router = express.Router();
const userController = require("../../controller/user/user.controller");
const { OTP_API } = require("../../constant/api/otp.api");

router.post(OTP_API.GENERATE, userController.generateOTP);
router.get("/getOTP", userController.Loadotp);
router.post(OTP_API.RESEND, userController.resendOTP);
router.post(OTP_API.VERIFY, userController.verifyOTP);

module.exports = router;
