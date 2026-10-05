\import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";

/*
 * Forma AI Local LLM Service
 *
 * Uses:
 *   LangChain -> Ollama -> Qwen
 *
 * No paid API key is required.
 *
 * If Ollama/Qwen is unavailable, the existing local rule-based
 * generators are used as a fallback so the application keeps working.
 */

// ----------------------------------------------------
// ZOD SCHEMA FOR AI-GENERATED FORMS
// ----------------------------------------------------

const optionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const showIfSchema = z.object({
  field: z.string(),
  operator: z.enum([
    "equals",
    "notEquals",
    "in",
    "notIn",
    "gt",
    "lt",
    "exists",
  ]),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
  ]),
});

const fieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum([
    "text",
    "email",
    "number",
    "textarea",
    "select",
    "radio",
    "checkbox",
    "date",
  ]),
  required: z.boolean(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(optionSchema).optional(),
  showIf: showIfSchema.optional(),
});

const formSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  fields: z.array(fieldSchema).min(1),
});

// ----------------------------------------------------
// LOCAL OLLAMA MODEL
// ----------------------------------------------------

const llm = new ChatOllama({
  model: process.env.OLLAMA_MODEL || "qwen3.5:4b",
  baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  temperature: 0,
});

// ----------------------------------------------------
// PROMPT FOR FORMA AI
// ----------------------------------------------------

const buildFormPrompt = (userPrompt) => `
You are Forma AI, an intelligent dynamic form schema generator.

Convert the user's natural-language request into a valid form schema.

User request:
"${userPrompt}"

Rules:

1. Return ONLY the structured schema requested by the system.
2. Generate useful fields based on the user's request.
3. Use the correct field type:
   - email -> "email"
   - years, age, quantity, count, amount -> "number"
   - date -> "date"
   - long explanation -> "textarea"
   - yes/no questions -> "radio"
   - multiple choices -> "select"
4. Use short camelCase IDs.
5. Make important fields required.
6. For select/radio fields, provide useful options.
7. Create conditional logic with showIf when one answer should control another field.
8. Do not create HTML.
9. Do not create CSS.
10. Do not create JavaScript.
11. Do not explain your answer.
12. Return only the schema.

The generated schema will be used directly by a React dynamic form renderer.
`;

// ----------------------------------------------------
// FALLBACK FORMA AI GENERATORS
// ----------------------------------------------------

function createVehicleForm() {
  return {
    id: `vehicle-insurance-${Date.now().toString(36)}`,
    title: "Vehicle Insurance Claim Form",
    description:
      "Submit details regarding a vehicle accident or insurance claim.",
    category: "Insurance",
    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Enter your full name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },
      {
        id: "incidentDate",
        label: "Date of Incident",
        type: "date",
        required: true,
      },
      {
        id: "accidentOccurred",
        label: "Did an accident occur?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
      },
      {
        id: "vehicleDamaged",
        label: "Was the vehicle damaged?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        showIf: {
          field: "accidentOccurred",
          operator: "equals",
          value: "yes",
        },
      },
      {
        id: "damageType",
        label: "Type of Damage",
        type: "select",
        required: true,
        options: [
          { label: "Minor", value: "minor" },
          { label: "Moderate", value: "moderate" },
          { label: "Major", value: "major" },
        ],
        showIf: {
          field: "vehicleDamaged",
          operator: "equals",
          value: "yes",
        },
      },
      {
        id: "incidentDescription",
        label: "Describe the Incident",
        type: "textarea",
        required: true,
        placeholder: "Explain what happened...",
      },
    ],
  };
}

function createMedicalForm() {
  return {
    id: `medical-claim-${Date.now().toString(36)}`,
    title: "Medical Claim Form",
    description:
      "Collect patient and medical treatment information.",
    category: "Healthcare",
    fields: [
      {
        id: "patientName",
        label: "Patient Full Name",
        type: "text",
        required: true,
        placeholder: "Enter patient name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "patient@example.com",
      },
      {
        id: "treatmentDate",
        label: "Treatment Date",
        type: "date",
        required: true,
      },
      {
        id: "treatmentType",
        label: "Treatment Type",
        type: "select",
        required: true,
        options: [
          { label: "Consultation", value: "consultation" },
          { label: "Emergency", value: "emergency" },
          { label: "Hospitalization", value: "hospitalization" },
        ],
      },
      {
        id: "hospitalDays",
        label: "Number of Hospital Days",
        type: "number",
        required: true,
        showIf: {
          field: "treatmentType",
          operator: "equals",
          value: "hospitalization",
        },
      },
      {
        id: "description",
        label: "Medical Description",
        type: "textarea",
        required: true,
        placeholder: "Describe the treatment...",
      },
      {
        id: "consent",
        label: "I confirm that the information is accurate.",
        type: "checkbox",
        required: true,
      },
    ],
  };
}

function createEventForm() {
  return {
    id: `event-registration-${Date.now().toString(36)}`,
    title: "Event Registration Form",
    description: "Register attendees for an event.",
    category: "Events",
    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
      },
      {
        id: "ticketType",
        label: "Ticket Type",
        type: "select",
        required: true,
        options: [
          { label: "General", value: "general" },
          { label: "VIP", value: "vip" },
        ],
      },
      {
        id: "vipDinner",
        label: "Will you attend the VIP dinner?",
        type: "radio",
        required: true,
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        showIf: {
          field: "ticketType",
          operator: "equals",
          value: "vip",
        },
      },
      {
        id: "specialRequests",
        label: "Special Requests",
        type: "textarea",
        required: false,
      },
    ],
  };
}

function createGenericForm(prompt) {
  const words = prompt
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ");

  const title =
    words.charAt(0).toUpperCase() +
    words.slice(1) +
    (words.toLowerCase().includes("form") ? "" : " Form");

  return {
    id: `custom-form-${Date.now().toString(36)}`,
    title,
    description:
      "A dynamically generated form based on the user's request.",
    category: "Custom",
    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Enter your full name",
      },
      {
        id: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "name@example.com",
      },
      {
        id: "details",
        label: "Additional Details",
        type: "textarea",
        required: true,
        placeholder: "Enter the required details...",
      },
    ],
  };
}

// ----------------------------------------------------
// FALLBACK ROUTER
// ----------------------------------------------------

function generateFallbackForm(prompt) {
  const text = prompt.toLowerCase();

  if (
    text.includes("vehicle") ||
    text.includes("insurance") ||
    text.includes("car") ||
    text.includes("auto")
  ) {
    return createVehicleForm();
  }

  if (
    text.includes("medical") ||
    text.includes("health") ||
    text.includes("patient") ||
    text.includes("hospital")
  ) {
    return createMedicalForm();
  }

  if (
    text.includes("event") ||
    text.includes("registration") ||
    text.includes("conference") ||
    text.includes("ticket")
  ) {
    return createEventForm();
  }

  return createGenericForm(prompt);
}

// ----------------------------------------------------
// NORMALIZE AI OUTPUT FOR FORMA AI
// ----------------------------------------------------

function normalizeGeneratedForm(schema) {
  return {
    id: `ai-form-${Date.now().toString(36)}`,
    title: schema.title,
    description: schema.description,
    category: schema.category,
    fields: schema.fields.map((field, index) => ({
      id: field.id || `field_${index + 1}`,
      label: field.label,
      type: field.type,
      required: Boolean(field.required),
      ...(field.placeholder
        ? { placeholder: field.placeholder }
        : {}),
      ...(field.helpText
        ? { helpText: field.helpText }
        : {}),
      ...(field.options?.length
        ? { options: field.options }
        : {}),
      ...(field.showIf
        ? { showIf: field.showIf }
        : {}),
    })),
  };
}

// ----------------------------------------------------
// MAIN AI GENERATOR
// ----------------------------------------------------

export async function generateFormFromPrompt(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  try {
    console.log("Forma AI: sending prompt to local Qwen via Ollama...");

    const structuredModel = llm.withStructuredOutput(formSchema, {
      name: "FormaAIFormSchema",
      method: "json_schema",
    });

    const result = await structuredModel.invoke(
      buildFormPrompt(prompt)
    );

    const normalized = normalizeGeneratedForm(result);

    console.log(
      `Forma AI: local LLM generated "${normalized.title}" with ${normalized.fields.length} fields.`
    );

    return normalized;
  } catch (error) {
    console.warn(
      "Forma AI local LLM unavailable or failed. Using fallback generator.",
      error.message
    );

    return generateFallbackForm(prompt);
  }
}