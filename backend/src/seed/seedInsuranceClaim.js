import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { FormSchema } from "../models/FormSchema.js";
import { autoClaim, healthIntake } from "./forms.js";

const seed = async () => {
  await connectDB();
  for (const form of [autoClaim, healthIntake]) {
    // Replace (not merge) so re-running never leaves stale sections/fields behind.
    await FormSchema.findOneAndDelete({ slug: form.slug });
    await FormSchema.create(form);
    console.log(`Seeded "${form.slug}"`);
  }
  await mongoose.disconnect();
};

seed();
