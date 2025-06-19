import express from "express";
import { generateMealPlan } from "../controllers/openaiController.js";
const router = express.Router();

router.get("/generate", checkAuth, generateMealPlan);

export default router;
