import express from "express";

import { checkAuth } from "../middlewares/checkAuth.js";
import {
  stripeCheckoutSession,
  stripeWebhooks,
} from "../controllers/stripeControllers.js";
import { checkSubscription } from "../controllers/authController.js";

const router = express.Router();

router.post("/create-checkout-session", checkAuth, stripeCheckoutSession);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

router.get("/confirm-subscription", checkAuth, checkSubscription);

export default router;
