import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import FormSchema from "../models/FormSchema.js";

const insuranceClaim = {
  formId: "insurance_claim",
  title: "Insurance Claim",
  description: "Report an incident to file a claim",
  fields: [
    { name: "fullName", 
      label: "Full Name", 
      type: "text", 
      required: true, 
      placeholder: "John Doe", 
      order: 1 },
    { name: "policyNumber", 
      label: "Policy Number", 
      type: "text", 
      required: true, 
      order: 2 },
    {
      name: "claimType", 
      label: "Claim Type", 
      type: "select", 
      required: true, 
      order: 3,
      options: [
        { label: "Vehicle", value: "vehicle" },
        { label: "Health", value: "health" },
        { label: "Property", value: "property" },
      ],
    },
    { name: "incidentDate", 
        label: "Incident Date", 
        type: "date", 
        required: true, 
        order: 4 },
    {
      name: "policeReportFiled", 
      label: "Was a police report filed?", 
      type: "radio", 
      required: true, 
      order: 5,
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
    },
    {
      name: "policeReportNumber", 
      label: "Police Report Number", 
      type: "text", 
      order: 6,
      showIf: { field: "policeReportFiled", 
        equals: "yes" },
    },
    { name: "description", 
      label: "Describe the incident", 
      type: "textarea", 
      required: true, 
      order: 7 },
    {
      name: "declaration", 
      label: "I confirm the information is accurate", 
      type: "checkbox", 
      required: true, 
      order: 8,
      options: [{ label: "I agree", 
        value: "agree" }],
    },
  ],
};

const seed = async () => {
  await connectDB();
  await FormSchema.findOneAndUpdate(
    { formId: insuranceClaim.formId },
    insuranceClaim,
    { upsert: true, 
      new: true, 
      runValidators: true }
  );
  console.log("insurance_claim schema seeded");
  await mongoose.disconnect();
};

seed();