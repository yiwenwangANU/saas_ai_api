import express from "express";

import { checkAuth } from "../middlewares/checkAuth.js";
import {
  stripeCheckoutSession,
  stripeWebhooks,
} from "../controllers/stripeControllers.js";

const router = express.Router();

router.post("/create-checkout-session", checkAuth, stripeCheckoutSession);

router.post(
  "/webhook",
  checkAuth,
  express.raw({ type: "application/json" }),
  stripeWebhooks
);
export default router;
