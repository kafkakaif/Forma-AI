import { Router } from "express";
import { FormSchema } from "../models/FormSchema.js";
import { Submission } from "../models/Submission.js";
import { validateSubmission } from "../shared/rules.js";

const router = Router();

// Accept either a slug or a MongoDB ObjectId
async function findForm(idOrSlug) {
  if (/^[a-f\d]{24}$/i.test(idOrSlug)) {
    const byId = await FormSchema.findById(idOrSlug).lean();

    if (byId) {
      return byId;
    }
  }

  return FormSchema.findOne({
    slug: idOrSlug.toLowerCase(),
  }).lean();
}

// -----------------------------------------
// GET ALL FORMS
// -----------------------------------------

router.get("/", async (_req, res, next) => {
  try {
    const forms = await FormSchema.find(
      { slug: { $exists: true } },
      "slug title description version"
    )
      .sort("title")
      .lean();

    res.json(forms);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// GET ONE FORM
// -----------------------------------------

router.get("/:id", async (req, res, next) => {
  try {
    const form = await findForm(req.params.id);

    if (!form) {
      return res.status(404).json({
        error: "Form not found",
      });
    }

    res.json(form);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// CREATE FORM
// -----------------------------------------

router.post("/", async (req, res, next) => {
  try {
    const form = await FormSchema.create(req.body);

    res.status(201).json(form);
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// SUBMIT FORM
// -----------------------------------------

router.post("/:id/submit", async (req, res, next) => {
  try {
    // Find the requested form
    const form = await findForm(req.params.id);

    if (!form) {
      return res.status(404).json({
        error: "Form not found",
      });
    }

    // Get submitted values
    const values = req.body?.values;

    // Check whether values were provided
    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values)
    ) {
      return res.status(400).json({
        error: '"values" must be an object',
      });
    }

    // Validate submitted data
    const result = validateSubmission(form, values);

    // Do not save invalid submissions
    if (!result.valid) {
      return res.status(400).json({
        error: "Validation failed",
        errors: result.errors,
      });
    }

    // Save cleaned values
    const submission = await Submission.create({
      form: form._id,
      formSlug: form.slug,
      formTitle: form.title,
      values: result.values,
    });

    res.status(201).json({
      message: "Form submitted successfully",
      submission,
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// VALIDATE FORM
// -----------------------------------------

router.post("/:id/validate", async (req, res, next) => {
  try {
    const form = await findForm(req.params.id);

    if (!form) {
      return res.status(404).json({
        error: "Form not found",
      });
    }

    const values = req.body?.values;

    if (
      !values ||
      typeof values !== "object" ||
      Array.isArray(values)
    ) {
      return res.status(400).json({
        error: '"values" must be an object',
      });
    }

    res.json(validateSubmission(form, values));
  } catch (err) {
    next(err);
  }
});

export default router;