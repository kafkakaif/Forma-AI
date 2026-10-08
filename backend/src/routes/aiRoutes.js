import { Router } from "express";
import { FormSchema } from "../models/FormSchema.js";
import { flattenFields } from "../shared/rules.js";

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

    const schema = await generateFormFromPrompt(
      prompt.trim()
    );

    return res.status(200).json({
      success: true,
      schema,
    });
  } catch (error) {
    console.error("AI generation error:", error);

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

    let extractionFields = fields;
    let authoritativeFormId = formId;

    // ------------------------------------------------
    // SCHEMA-AWARE MODE
    // Load the real schema from MongoDB when a
    // form ID or slug is supplied.
    // ------------------------------------------------

    if (formId) {
      let form = null;

      // Try MongoDB ObjectId first
      if (/^[a-f\d]{24}$/i.test(formId)) {
        form = await FormSchema.findById(formId);
      }

      // If not found by ObjectId, try slug
      if (!form) {
        form = await FormSchema.findOne({
          slug: String(formId).toLowerCase(),
        });
      }

      if (!form) {
        return res.status(404).json({
          success: false,
          error: "Form schema not found.",
        });
      }

      // Use MongoDB schema as the authoritative source.
      const plainForm = form.toObject();

extractionFields = flattenFields(plainForm).map(
  (field) => ({
    id: field.name,
    label: field.label,
    type: field.type,
    required: Boolean(field.required),
    options: Array.isArray(field.options)
      ? field.options
      : [],
    validation: field.validation || {},
  })
);
      authoritativeFormId =
        form._id.toString();

      if (extractionFields.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            "The selected form has no extractable fields.",
        });
      }
    }

    // ------------------------------------------------
    // CLIENT-FIELD MODE
    // Used only when no formId is supplied.
    // ------------------------------------------------

    if (
      !Array.isArray(extractionFields) ||
      extractionFields.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Form fields are required for AI extraction.",
      });
    }

    const result =
      await extractFormValuesFromText({
        text: text.trim(),
        fields: extractionFields,
        formId: authoritativeFormId,
      });

    return res.status(200).json({
      ...result,
      formId: authoritativeFormId,
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