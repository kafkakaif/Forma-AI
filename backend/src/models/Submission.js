import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // The form this submission belongs to
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormSchema",
      required: true,
    },

    // Store the form slug for easy identification
    formSlug: {
      type: String,
      required: true,
    },

    // Store the form title
    formTitle: {
      type: String,
      required: true,
    },

    // User's saved or submitted answers
    values: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },

    // Track whether the submission is a draft or completed
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "submitted",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Submission = mongoose.model(
  "Submission",
  submissionSchema
);