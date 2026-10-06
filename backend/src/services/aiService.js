import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";

// ============================================================
// ZOD SCHEMAS
// ============================================================

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

// ============================================================
// OLLAMA / QWEN
// ============================================================

const llm = new ChatOllama({
  model: process.env.OLLAMA_MODEL || "qwen3.5:4b",
  baseUrl:
    process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  temperature: 0,
  numCtx: 2048,
  numPredict: 600,
  keepAlive: "10m",
  think: false,
});

// ============================================================
// FORM GENERATION PROMPT
// ============================================================

function buildFormPrompt(userPrompt) {
  return `
You are Forma AI, an intelligent dynamic form generator.

Convert the user's request into a practical JSON form schema.

USER REQUEST:
${userPrompt}

RETURN ONLY VALID JSON.

Required top-level structure:

{
  "title": "Form title",
  "description": "Form description",
  "category": "Category",
  "fields": [
    {
      "id": "fieldId",
      "label": "Field label",
      "type": "text",
      "required": true,
      "placeholder": "Optional placeholder"
    }
  ]
}

Allowed field types:
text
email
number
textarea
select
radio
checkbox
date

Rules:

1. Create fields specifically requested by the user.
2. Do not replace requested fields with generic "Additional Details".
3. Use camelCase IDs.
4. Email fields must use type "email".
5. Years, age, amount, quantity and count must use type "number".
6. Dates must use type "date".
7. Long explanations must use type "textarea".
8. Yes/no questions should use type "radio".
9. Multiple-choice questions should use type "select".
10. Select/radio options MUST use this exact format:

"options": [
  {
    "label": "Option Name",
    "value": "option_value"
  }
]

11. Make important fields required.
12. Add showIf only when useful.
13. Do not output markdown.
14. Do not output code fences.
15. Do not output comments.
16. Do not output explanations.
17. Do not add trailing commas.

Return only the JSON object.
`;
}

// ============================================================
// EXTRACTION PROMPT
// ============================================================

function buildExtractionPrompt(text, fields) {
  return `
You are Forma AI.

Extract information from the user's text and map it to the supplied form fields.

USER TEXT:
${text}

FORM FIELDS:
${JSON.stringify(fields)}

Return ONLY valid JSON.

Example:
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "experience": 2
}

Rules:
1. Use only field IDs provided.
2. Do not invent information.
3. Numbers must be JSON numbers.
4. Return only fields for which a value can be identified.
5. No markdown.
6. No explanations.
7. No code fences.
`;
}

// ============================================================
// CLEAN JSON
// ============================================================

function cleanJsonResponse(rawContent) {
  let text = String(rawContent || "").trim();

  // Remove thinking blocks
  text = text.replace(
    /<think>[\s\S]*?<\/think>/gi,
    ""
  );

  text = text.trim();

  // Remove markdown fences
  const fenced = text.match(
    /```(?:json)?\s*([\s\S]*?)\s*```/i
  );

  if (fenced) {
    text = fenced[1].trim();
  }

  // Find JSON object
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in Qwen response.");
  }

  text = text.slice(firstBrace, lastBrace + 1);

  // Remove trailing commas
  text = text.replace(
    /,\s*([}\]])/g,
    "$1"
  );

  return JSON.parse(text);
}

// ============================================================
// NORMALIZE OPTIONS
// ============================================================

function normalizeOptions(options) {
  if (!Array.isArray(options)) {
    return undefined;
  }

  return options.map((option) => {
    // Qwen sometimes returns:
    // ["Python", "Java", "React"]
    if (typeof option === "string") {
      return {
        label: option,
        value: option
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, ""),
      };
    }

    // Already correct:
    // { label: "Python", value: "python" }
    return option;
  });
}

// ============================================================
// NORMALIZE FORM
// ============================================================

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

      ...(field.options
        ? { options: normalizeOptions(field.options) }
        : {}),

      ...(field.showIf
        ? { showIf: field.showIf }
        : {}),
    })),
  };
}

// ============================================================
// FALLBACK
// ============================================================

function createFallbackForm(prompt) {
  const text = prompt.toLowerCase();

  if (
    text.includes("vehicle") ||
    text.includes("car") ||
    text.includes("insurance") ||
    text.includes("auto")
  ) {
    return {
      id: `vehicle-insurance-${Date.now().toString(36)}`,
      title: "Vehicle Insurance Claim Form",
      description:
        "Submit details regarding a vehicle insurance claim.",
      category: "Insurance",
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
          id: "incidentDescription",
          label: "Describe the Incident",
          type: "textarea",
          required: true,
        },
      ],
    };
  }

  return {
    id: `custom-form-${Date.now().toString(36)}`,
    title: "Custom Form",
    description:
      "A custom form generated from the user's request.",
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
        placeholder: "Enter additional details...",
      },
    ],
  };
}

// ============================================================
// GENERATE FORM
// ============================================================

export async function generateFormFromPrompt(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required.");
  }

  console.log(
    "Forma AI: sending generation request to Qwen..."
  );

  try {
    const response = await llm.invoke(
      buildFormPrompt(prompt),
      {
        timeout: 120000,
      }
    );

    const rawContent =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    console.log(
      "Forma AI raw response:",
      rawContent
    );

    const parsed = cleanJsonResponse(rawContent);

    // Normalize string options before Zod validation
    if (Array.isArray(parsed.fields)) {
      parsed.fields = parsed.fields.map((field) => ({
        ...field,

        ...(Array.isArray(field.options)
          ? {
              options: normalizeOptions(
                field.options
              ),
            }
          : {}),
      }));
    }

    const validated = formSchema.parse(parsed);

    const normalized =
      normalizeGeneratedForm(validated);

    console.log(
      `Forma AI: Qwen generated "${normalized.title}" with ${normalized.fields.length} fields.`
    );

    return normalized;
  } catch (error) {
    console.error(
      "Forma AI generation failed:",
      error.message
    );

    throw new Error(
      `Local AI generation failed: ${error.message}`
    );
  }
}

// ============================================================
// EXTRACT VALUES
// ============================================================

export async function extractFormValuesFromText({
  text,
  fields,
  formId = null,
}) {
  if (!text || !text.trim()) {
    throw new Error("Text is required.");
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error("Form fields are required.");
  }

  console.log(
    "Forma AI: sending extraction request to Qwen..."
  );

  try {
    const safeFields = fields.map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type,
    }));

    const response = await llm.invoke(
      buildExtractionPrompt(
        text,
        safeFields
      ),
      {
        timeout: 120000,
      }
    );

    const rawContent =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    const extracted =
      cleanJsonResponse(rawContent);

    const allowedIds = new Set(
      safeFields.map((field) => field.id)
    );

    const extractedData = {};

    for (const [key, value] of Object.entries(
      extracted
    )) {
      if (allowedIds.has(key)) {
        extractedData[key] = value;
      }
    }

    const confidenceScores = {};

    for (const key of Object.keys(
      extractedData
    )) {
      confidenceScores[key] = 1;
    }

    return {
      extractedData,
      confidenceScores,
      extractedAt:
        new Date().toISOString(),
      source: "local_qwen_llm",
      formId,
    };
  } catch (error) {
    console.error(
      "Forma AI extraction failed:",
      error.message
    );

    throw new Error(
      `Local AI extraction failed: ${error.message}`
    );
  }
}