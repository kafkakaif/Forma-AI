import mongoose from 'mongoose';
import { FIELD_TYPES, validateFormDefinition } from '../../../shared/rules.js';

const fieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: FIELD_TYPES, required: true },
    required: { type: Boolean, default: false },
    placeholder: String,
    helpText: String,
    options: [String], // select only
    validation: {
      minLength: Number,
      maxLength: Number,
      pattern: String,
      message: String,
    },
    showIf: mongoose.Schema.Types.Mixed, // condition tree, see shared/rules.js
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    showIf: mongoose.Schema.Types.Mixed,
    fields: [fieldSchema],
  },
  { _id: false }
);

const formSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    description: String,
    version: { type: Number, default: 1 },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true }
);

// Reject definitions whose showIf rules are unresolvable (unknown / forward / self references).
formSchema.pre('validate', function () {
  const problems = validateFormDefinition(this.toObject());
  if (problems.length) {
    const err = new mongoose.Error.ValidationError(this);
    err.addError('sections', new mongoose.Error.ValidatorError({ message: problems.join('; ') }));
    throw err;
  }
});

export const FormSchema = mongoose.model('FormSchema', formSchema);
