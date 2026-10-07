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

router.get("/", async (req, res, next) => {
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
// SAVE FORM
// POST /api/forms/save
// -----------------------------------------

router.post("/save", async (req, res, next) => {
  try {
    const payload = req.body;

    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      return res.status(400).json({
        error: "Form payload must be an object",
      });
    }

    if (!payload.slug) {
      return res.status(400).json({
        error: "Form slug is required",
      });
    }

    // Update existing form or create a new one.
    let form = await FormSchema.findOne({
      slug: payload.slug,
    });

    if (form) {
      form.set(payload);
    } else {
      form = new FormSchema(payload);
    }

    // Runs the existing form-definition validation.
    await form.validate();
    await form.save();

    return res.status(200).json({
      message: "Form saved successfully",
      form,
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------
// GET ONE FORM
// GET /api/forms/:id
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
// POST /api/forms
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
// POST /api/forms/:id/submit
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
// POST /api/forms/:id/validate
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