import express from "express";
import { generateMealPlan } from "../controllers/openaiController.js";
import { checkAuth } from "../middlewares/checkAuth.js";
import { checkSubscribe } from "../middlewares/checkSubscribe.js";
const router = express.Router();

router.post("/generate", checkAuth, checkSubscribe, generateMealPlan);

export default router;
