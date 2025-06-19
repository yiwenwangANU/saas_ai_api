import OpenAI from "openai";

export const generateMealPlan = async (req, res, next) => {
  const openAI = new OpenAI({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });
  try {
    const { dietType, calories, allergies, prefer, snacks, days } = req.body;
    console.log(req.body);
  } catch (err) {
    next(err);
  }
};
