import { Router } from "express";

import {
  generateFormFromPrompt,
  extractFormValuesFromText,
} from "../services/aiService.js";

const router = Router();

// ----------------------------------------------------
// POST /api/ai/generate
// ----------------------------------------------------

router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required.",
      });
    }

    const schema =
      await generateFormFromPrompt(
        prompt.trim()
      );

    return res.status(200).json({
      success: true,
      schema,
    });
  } catch (error) {
    console.error(
      "AI generation error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to generate form.",
    });
  }
});

// ----------------------------------------------------
// POST /api/ai/extract
// ----------------------------------------------------

router.post("/extract", async (req, res) => {
  try {
    const {
      text,
      fields = [],
      formId = null,
    } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error:
          "Text is required for AI extraction.",
      });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "Form fields are required for AI extraction.",
      });
    }

    const result =
      await extractFormValuesFromText({
        text: text.trim(),
        fields,
      });

    return res.status(200).json({
      ...result,
      formId,
    });
  } catch (error) {
    console.error(
      "AI extraction error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        "Failed to extract form values.",
    });
  }
});

export default router;