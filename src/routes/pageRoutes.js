import express from "express";
import passport from "passport";
import pageController from "../controllers/pageController.js";
const router = express.Router();

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  pageController.protectedRoute
);

export default router;
