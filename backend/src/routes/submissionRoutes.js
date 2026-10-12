import { Router } from "express";
import mongoose from "mongoose";
import { Submission } from "../models/Submission.js";
import { FormSchema } from "../models/FormSchema.js";
import { validateSubmission } from "../shared/rules.js";

const router = Router();

// SAVE NEW DRAFT
// POST /api/submissions/draft
router.post("/draft", async (req, res, next) => {
  try {
    const { formId, values } = req.body;

    if (!mongoose.isValidObjectId(formId)) {
      return res.status(400).json({
        error: "A valid formId is required",
      });
    }

    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values)
    ) {
      return res.status(400).json({
        error: "values must be an object",
      });
    }

    const form = await FormSchema.findById(formId).lean();

    if (!form) {
      return res.status(404).json({
        error: "Form not found",
      });
    }

    const draft = await Submission.create({
      form: form._id,
      formSlug: form.slug,
      formTitle: form.title,
      values,
      status: "draft",
    });

    return res.status(201).json({
      message: "Draft saved successfully",
      submission: draft,
    });
  } catch (err) {
    next(err);
  }
});

// GET ALL SUBMISSIONS
// GET /api/submissions
router.get("/", async (_req, res, next) => {
  try {
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json(submissions);
  } catch (err) {
    next(err);
  }
});

// UPDATE EXISTING DRAFT
// PUT /api/submissions/:id/draft
router.put("/:id/draft", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { values } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid submission ID",
      });
    }

    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values)
    ) {
      return res.status(400).json({
        error: "values must be an object",
      });
    }

    const draft = await Submission.findOne({
      _id: id,
      status: "draft",
    });

    if (!draft) {
      return res.status(404).json({
        error: "Draft not found",
      });
    }

    draft.values = values;
    await draft.save();

    return res.status(200).json({
      message: "Draft updated successfully",
      submission: draft,
    });
  } catch (err) {
    next(err);
  }
});

// FINALIZE AN EXISTING DRAFT
// POST /api/submissions/:id/submit
router.post("/:id/submit", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        error: "Invalid submission ID",
      });
    }

    const draft = await Submission.findOne({
      _id: id,
      status: "draft",
    });

    if (!draft) {
      return res.status(404).json({
        error: "Draft not found",
      });
    }

    const form = await FormSchema.findById(draft.form).lean();

    if (!form) {
      return res.status(404).json({
        error: "Form not found",
      });
    }

    const values =
      req.body?.values !== undefined
        ? req.body.values
        : draft.values;

    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values)
    ) {
      return res.status(400).json({
        error: "values must be an object",
      });
    }

    const result = validateSubmission(form, values);

    if (!result.valid) {
      return res.status(400).json({
        error: "Validation failed",
        errors: result.errors,
      });
    }

    draft.values = result.values;
    draft.status = "submitted";

    await draft.save();

    return res.status(200).json({
      message: "Form submitted successfully",
      submission: draft,
    });
  } catch (err) {
    next(err);
  }
});

// GET ONE SUBMISSION
// GET /api/submissions/:id
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: "Invalid submission ID",
      });
    }

    const submission = await Submission.findById(
      req.params.id
    ).lean();

    if (!submission) {
      return res.status(404).json({
        error: "Submission not found",
      });
    }

    return res.json(submission);
  } catch (err) {
    next(err);
  }
});

export default router;
