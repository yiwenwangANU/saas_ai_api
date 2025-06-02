import express from "express";
import authController, {
  googleAuthRedirect,
} from "../controllers/authController.js";
import { body } from "express-validator";
import passport from "passport";
import User from "../models/User.js";

const validateSignup = [
  body("email")
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
  body("name")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid user name."),
];

const router = express.Router();

router.post("/auth/signup", validateSignup, authController.signup);

router.get("/auth/login", authController.login);

// Google OAuth start
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleAuthRedirect
);

export default router;
