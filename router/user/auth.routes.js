const express = require("express");
const router = express.Router();
const passport = require("passport");
const Auth = require("../../middleware/auth");
const userController = require("../../controller/user/user.controller");
const { AUTH_API } = require("../../constant/api/auth.api");

router.get("/signUp", Auth.userAuth, userController.loadSignUp);
router.get("/login", Auth.userAuth, userController.getlogin);
router.post(AUTH_API.USER_LOGIN, userController.Login);
router.get("/logOut/:id", userController.logOut);

router.get(
  "/auth/google",
  Auth.userAuth,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/auth/google/callback",
  Auth.userAuth,
  passport.authenticate("google", { failureRedirect: "/signUp" }),
  async (req, res) => {
    req.session.user = req.user._id;
    res.redirect("/");
  },
);

module.exports = router;
