
## Step 0: Prerequisites

- **Node.js 18 or newer.** Check with `node -v`.
- **MongoDB**, either:
  - **MongoDB Atlas** (free cloud database, easiest): create a cluster, add a database user, allow your IP, and copy the connection string.
  - **Local MongoDB**: install MongoDB Community. Your connection string is `mongodb://127.0.0.1:27017/forma_ai`.
- **MongoDB Compass** (optional). It lets you view and edit documents, which helps with the "DONE when" test.

---

## Step 1: Create the Express server

```bash
clone repo
mkdir backend && cd backend
npm init -y
npm install express mongoose cors dotenv
npm install -D nodemon
```

In `package.json`, add `"type": "module"` and these scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed/seedInsuranceClaim.js"
  }
}
```

Create this folder structure:

```
backend/
├── .env
└── src/
    ├── server.js
    ├── config/db.js
    ├── models/FormSchema.js
    ├── controllers/formController.js
    ├── routes/formRoutes.js
    └── seed/seedInsuranceClaim.js
```

---

## Step 2: Connect MongoDB

**`.env`**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/forma_ai
CLIENT_URL=http://localhost:5173
```
Add `.env` to `.gitignore` so your password never gets pushed to GitHub.

**`src/config/db.js`**
```js
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
```

---

## Step 3: Create the FormSchema model

This model is the contract between the backend and React. Each field describes what to render. The `showIf` property prepares for conditional questions ("Question 12 dictates 13–20"), even though you won't use it until later.

**`src/models/FormSchema.js`**
```js
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
    formId:      { type: String, required: true, unique: true }, // e.g. "insurance_claim"
    title:       { type: String, required: true },
    description: String,
    version:     { type: Number, default: 1 },
    fields:      [fieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model("FormSchema", formSchemaDef);
```

---

## Step 4: Insert the insurance_claim schema

A seed script inserts the form into MongoDB. It uses an upsert, so you can run it again and again without creating duplicates.

**`src/seed/seedInsuranceClaim.js`**
```js
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import FormSchema from "../models/FormSchema.js";

const insuranceClaim = {
  formId: "insurance_claim",
  title: "Insurance Claim",
  description: "Report an incident to file a claim",
  fields: [
    { name: "fullName", label: "Full Name", type: "text", required: true, placeholder: "John Doe", order: 1 },
    { name: "policyNumber", label: "Policy Number", type: "text", required: true, order: 2 },
    {
      name: "claimType", label: "Claim Type", type: "select", required: true, order: 3,
      options: [
        { label: "Vehicle", value: "vehicle" },
        { label: "Health", value: "health" },
        { label: "Property", value: "property" },
      ],
    },
    { name: "incidentDate", label: "Incident Date", type: "date", required: true, order: 4 },
    {
      name: "policeReportFiled", label: "Was a police report filed?", type: "radio", required: true, order: 5,
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
    },
    {
      name: "policeReportNumber", label: "Police Report Number", type: "text", order: 6,
      showIf: { field: "policeReportFiled", equals: "yes" },
    },
    { name: "description", label: "Describe the incident", type: "textarea", required: true, order: 7 },
    {
      name: "declaration", label: "I confirm the information is accurate", type: "checkbox", required: true, order: 8,
      options: [{ label: "I agree", value: "agree" }],
    },
  ],
};

const seed = async () => {
  await connectDB();
  await FormSchema.findOneAndUpdate(
    { formId: insuranceClaim.formId },
    insuranceClaim,
    { upsert: true, new: true, runValidators: true }
  );
  console.log("insurance_claim schema seeded");
  await mongoose.disconnect();
};

seed();
```

Run it:
```bash
npm run seed
```

---

## Step 5: Create GET /api/forms/:id

**`src/controllers/formController.js`**
```js
import FormSchema from "../models/FormSchema.js";

export const getFormById = async (req, res) => {
  try {
    const form = await FormSchema.findOne({ formId: req.params.id }).lean();
    if (!form) return res.status(404).json({ message: "Form not found" });

    form.fields.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
```

**`src/routes/formRoutes.js`**
```js
import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Form routes working"
    });
});

export default router;
```

**`src/server.js`**
```js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import formRoutes from "./routes/formRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL })); // allow the Vite app
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/forms", formRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
```

---

## Step 6: Return the JSON schema and test it

```bash
npm run dev
```

Open **http://localhost:5000/api/forms/insurance_claim** in your browser, or run:
```bash
curl http://localhost:5000/api/forms/
curl http://localhost:5000/api/forms/insurance_claim
```
You should see the full JSON with `title` and a `fields` array. If you try an ID that doesn't exist, such as `/api/forms/xyz`, you should get a 404.

---

## Step 7: Check the "DONE when" criteria

1. **MongoDB → API → React works.** In React, call `fetch("http://localhost:5000/api/forms/insurance_claim")` and pass `data.fields` to `<DynamicForm />`.
2. **Changing the JSON changes the rendered form.** Open Compass, edit a field's `label` or add a new field, then refresh the React page. The form should update without any code change.
3. **No hard-coded fields.** React should only loop over `fields` and render `<DynamicField type={field.type} />`. It shouldn't contain any field names.

---

