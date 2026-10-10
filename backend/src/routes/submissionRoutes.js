import { Router } from "express";
import { Submission } from "../models/Submission.js";
import mongoose from "mongoose";
const router = Router();
// SAVE SUBMISSION DRAFT
// POST /api/submissions/draft
router.post("/draft", async (req, res, next) => {
  try {
    const { formId, values } = req.body;

    if (!formId || !mongoose.isValidObjectId(formId)) {
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

    const { FormSchema } = await import("../models/FormSchema.js");

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

// -----------------------------------------
// GET ALL SUBMISSIONS
// -----------------------------------------

router.get("/", async (_req, res, next) => {
  try {
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// GET ONE SUBMISSION
// -----------------------------------------

router.get("/:id", async (req, res, next) => {
  try {
    const submission = await Submission.findById(
      req.params.id
    ).lean();

    if (!submission) {
      return res.status(404).json({
        error: "Submission not found",
      });
    }

    res.json(submission);
  } catch (err) {
    next(err);
  }
});

export default router;