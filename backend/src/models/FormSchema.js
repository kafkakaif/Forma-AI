import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  { label: String, value: String },
  { _id: false }
);

const fieldSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },   // key used by React Hook Form
    label:       { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "textarea", "select", "radio", "checkbox", "number", "date", "email"],
      required: true,
    },
    placeholder: String,
    required:    { type: Boolean, default: false },
    options:     [optionSchema],                     // for select / radio / checkbox
    showIf: {                                        // conditional logic (used later)
      field:  String,
      equals: mongoose.Schema.Types.Mixed,
    },
    order: Number,
  },
  { _id: false }
);

const formSchemaDef = new mongoose.Schema(
  {
    formId:      { type: String, 
    required: true, 
    unique: true }, // e.g. "insurance_claim"
    title:       { type: String, required: true },
    description: String,
    version:     { type: Number, default: 1 },
    fields:      [fieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model("FormSchema", formSchemaDef);