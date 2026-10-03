import { Router } from "express";
import { generateFormFromPrompt } from "../services/aiService.js";

const router = Router();

router.post("/generate", (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required.",
      });
    }

    const schema = generateFormFromPrompt(prompt);

    res.status(200).json({
      success: true,
      schema,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to generate form.",
    });
  }
});

export default router;