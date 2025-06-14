import express from "express";
import authController, {
  googleAuthRedirect,
} from "../controllers/authController.js";
import { body } from "express-validator";
import passport from "passport";
import User from "../models/User.js";

const validateSignup = [
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value) => {
      const existingUser = await User.findOne({ email: value });
      if (existingUser) {
        if (!existingUser.password) {
          return Promise.reject(
            "This email is registered via Google. Please log in using Google."
          );
        }
        return Promise.reject("Email already been used.");
      }
      return true;
    })
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Please enter a valid password."),
  body("name").trim().notEmpty().withMessage("Please enter a valid user name."),
];

const router = express.Router();

router.post("/auth/signup", validateSignup, authController.signup);

router.post("/auth/login", authController.login);

// Google OAuth routes
// https://www.passportjs.org/packages/passport-google-oauth20/
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // force prompt window show account selection
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleAuthRedirect
);

export default router;
