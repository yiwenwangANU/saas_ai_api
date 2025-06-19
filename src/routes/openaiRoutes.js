import express from "express";
import { generateMealPlan } from "../controllers/openaiController.js";
import { checkAuth } from "../middlewares/checkAuth.js";
const router = express.Router();

router.post("/generate", checkAuth, generateMealPlan);

export default router;
