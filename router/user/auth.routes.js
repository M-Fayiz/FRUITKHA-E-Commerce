const express = require("express");
const router = express.Router();
const passport = require("passport");
const Auth = require("../../middleware/auth");
const userController = require("../../controller/user/user.controller");

router.get("/signUp", Auth.userAuth, userController.loadSignUp);
router.get("/login", Auth.userAuth, userController.getlogin);
router.post("/verify_lagin", userController.Login);
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
