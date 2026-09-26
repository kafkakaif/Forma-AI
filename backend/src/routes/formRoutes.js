import { Router } from 'express';
import { FormSchema } from '../models/FormSchema.js';
import { validateSubmission } from '../shared/rules.js';

const router = Router();

// Accept either a slug ("auto-claim") or a Mongo ObjectId.
async function findForm(idOrSlug) {
  if (/^[a-f\d]{24}$/i.test(idOrSlug)) {
    const byId = await FormSchema.findById(idOrSlug).lean();
    if (byId) return byId;
  }
  return FormSchema.findOne({ slug: idOrSlug.toLowerCase() }).lean();
}

// List available forms (no field payload).
router.get('/', async (_req, res, next) => {
  try {
    const forms = await FormSchema.find({ slug: { $exists: true } }, 'slug title description version').sort('title').lean();
    res.json(forms);
  } catch (err) {
    next(err);
  }
});

// Fetch one form definition: the schema the React renderer draws from.
router.get('/:id', async (req, res, next) => {
  try {
    const form = await findForm(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    next(err);
  }
});

// Create a form definition. showIf rules are checked by the model before saving.
router.post('/', async (req, res, next) => {
  try {
    const form = await FormSchema.create(req.body);
    res.status(201).json(form);
  } catch (err) {
    next(err);
  }
});

// Validate a set of answers against the form's rules without storing anything.
// Returns per-field errors plus the cleaned values (hidden fields dropped).
router.post('/:id/validate', async (req, res, next) => {
  try {
    const form = await findForm(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    const values = req.body?.values;
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      return res.status(400).json({ error: '"values" must be an object' });
    }
    res.json(validateSubmission(form, values));
  } catch (err) {
    next(err);
  }
});

export default router;