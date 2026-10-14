
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
  baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  temperature: 0,
  numCtx: 4096,
  numPredict: 1200,
  keepAlive: "10m",
  think: false,
});

// ============================================================
// PROMPTS
// ============================================================

function buildFormPrompt(userPrompt, compact = false) {
  return `
You are Forma AI. Create a dynamic form schema from the user's request.

USER REQUEST:
${userPrompt}

Return ONLY one valid JSON object. Do not use Markdown or explanations.

Required structure:
{
  "title": "Form title",
  "description": "Form description",
  "category": "Category",
  "fields": [
    {
      "id": "fieldId",
      "label": "Field label",
      "type": "text",
      "required": true
    }
  ]
}

Allowed types: text, email, number, textarea, select, radio, checkbox, date.

Rules:
- Use camelCase IDs.
- Use only the allowed field types.
- Use email for email addresses, number for numeric values, date for dates.
- Use textarea for long answers.
- Use radio for yes/no questions.
- Use select for multiple-choice questions.
- Select and radio fields must have options as an array of objects:
  {"label":"Yes","value":"yes"}
- Every field must contain id, label, type, and required.
- Use showIf only when useful. Its structure is:
  {"field":"otherFieldId","operator":"equals","value":"yes"}
- Supported operators: equals, notEquals, in, notIn, gt, lt, exists.
- Keep the schema practical and avoid duplicate fields.
- ${compact ? "Create 5 to 7 essential fields only." : "Create the important fields requested by the user."}
- Ensure every string and array is closed correctly.
- Do not include trailing commas.

Return the completed JSON object now.
`;
}

function buildExtractionPrompt(text, fields) {
  return `
Extract known values from the user's description and map them to the provided field IDs.

USER DESCRIPTION:
${text}

AVAILABLE FORM FIELDS:
${JSON.stringify(fields)}

Return ONLY a valid JSON object.
Rules:
- Use only IDs provided in AVAILABLE FORM FIELDS.
- Do not invent values.
- Include only values supported by the user's description.
- Numbers must be JSON numbers.
- Checkbox fields must be JSON booleans.
- Dropdown and radio values must match the supplied options.
- Leave unknown fields out of the result.
- No Markdown, comments, or explanations.

Example:
{"fullName":"Jane Doe","experience":2}
`;
}

// ============================================================
// JSON PARSING
// ============================================================

function cleanJsonResponse(rawContent) {
  let text = String(rawContent || "").trim();

  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  text = text.replace(/^```(?:json)?\s*/i, "");
  text = text.replace(/\s*```$/i, "").trim();

  const firstBrace = text.indexOf("{");

  if (firstBrace === -1) {
    throw new Error("Qwen did not return a JSON object.");
  }

  // Parse the first complete JSON object, ignoring trailing model text.
  let inString = false;
  let escaped = false;
  let depth = 0;
  let lastBrace = -1;

  for (let i = firstBrace; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        lastBrace = i;
        break;
      }
    }
  }

  if (lastBrace === -1) {
    throw new Error(
      "Qwen returned incomplete JSON. The response may have reached its token limit."
    );
  }

  let jsonText = text.slice(firstBrace, lastBrace + 1);
  jsonText = jsonText.replace(/,\s*([}\]])/g, "$1");

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Malformed JSON from Qwen: ${error.message}`);
  }
}

// ============================================================
// NORMALIZATION
// ============================================================

function normalizeOptions(options) {
  if (!Array.isArray(options)) return undefined;

  return options.map((option) => {
    if (typeof option === "string") {
      return {
        label: option,
        value: option.toLowerCase().replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, ""),
      };
    }

    return {
      label: String(option?.label ?? option?.value ?? ""),
      value: String(option?.value ?? option?.label ?? ""),
    };
  });
}

function normalizeGeneratedForm(schema) {
  return {
    id: schema.id || `ai-form-${Date.now().toString(36)}`,
    title: schema.title,
    description: schema.description,
    category: schema.category,
    fields: schema.fields.map((field, index) => ({
      id: field.id || `field_${index + 1}`,
      label: field.label,
      type: field.type,
      required: Boolean(field.required),
      ...(field.placeholder ? { placeholder: field.placeholder } : {}),
      ...(field.helpText ? { helpText: field.helpText } : {}),
      ...(field.options
        ? { options: normalizeOptions(field.options) }
        : {}),
      ...(field.showIf ? { showIf: field.showIf } : {}),
    })),
  };
}

// ============================================================
// FALLBACK FOR GENERATION ERRORS
// ============================================================

function createFallbackForm(prompt) {
  const text = String(prompt || "").toLowerCase();

  if (
    text.includes("vehicle") ||
    text.includes("car") ||
    text.includes("insurance") ||
    text.includes("auto")
  ) {
    return {
      id: `vehicle-insurance-${Date.now().toString(36)}`,
      title: "Vehicle Insurance Claim Form",
      description: "Submit details regarding a vehicle insurance claim.",
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
          id: "policyNumber",
          label: "Policy Number",
          type: "text",
          required: true,
        },
        {
          id: "incidentDate",
          label: "Date of Accident",
          type: "date",
          required: true,
        },
        {
          id: "accidentLocation",
          label: "Accident Location",
          type: "textarea",
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
        },
        {
          id: "damageSeverity",
          label: "Damage Severity",
          type: "select",
          required: true,
          showIf: {
            field: "vehicleDamaged",
            operator: "equals",
            value: "yes",
          },
          options: [
            { label: "Minor", value: "minor" },
            { label: "Moderate", value: "moderate" },
            { label: "Severe", value: "severe" },
          ],
        },
        {
          id: "incidentDescription",
          label: "Describe the Incident",
          type: "textarea",
          required: true,
        },
        {
          id: "hasPoliceReport",
          label: "Police Report Filed",
          type: "radio",
          required: true,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ],
    };
  }

  return {
    id: `custom-form-${Date.now().toString(36)}`,
    title: "Custom Form",
    description: "A basic form created after AI generation failed.",
    category: "Custom",
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
        id: "details",
        label: "Additional Details",
        type: "textarea",
        required: true,
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

  console.log("Forma AI: sending generation request to Qwen...");

  // Try the full prompt, then a compact prompt if the response is invalid.
  for (const compact of [false, true]) {
    try {
      const response = await llm.invoke(buildFormPrompt(prompt, compact), {
        timeout: 120000,
      });

      const rawContent =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);

      console.log("Forma AI raw response:", rawContent);

      const parsed = cleanJsonResponse(rawContent);

      if (!Array.isArray(parsed.fields)) {
        throw new Error("The generated schema has no fields array.");
      }

      parsed.fields = parsed.fields.map((field) => ({
        ...field,
        ...(Array.isArray(field.options)
          ? { options: normalizeOptions(field.options) }
          : {}),
      }));

      const validated = formSchema.parse(parsed);
      const normalized = normalizeGeneratedForm(validated);

      console.log(
        `Forma AI: generated "${normalized.title}" with ${normalized.fields.length} fields.`
      );

      return normalized;
    } catch (error) {
      console.error(
        `Form generation attempt (${compact ? "compact" : "full"}) failed:`,
        error.message
      );
    }
  }

  console.warn("Qwen generation failed; returning a fallback form.");
  return createFallbackForm(prompt);
}

// ============================================================
// EXTRACT VALUES FROM USER TEXT
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

  console.log("Forma AI: sending extraction request to Qwen...");

  const safeFields = fields.map((field) => ({
    id: field.id,
    label: field.label,
    type: field.type,
    required: Boolean(field.required),
    options: Array.isArray(field.options) ? field.options : [],
    validation: field.validation || {},
  }));

  const response = await llm.invoke(
    buildExtractionPrompt(text, safeFields),
    { timeout: 120000 }
  );

  const rawContent =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  const extracted = cleanJsonResponse(rawContent);
  const fieldMap = new Map(safeFields.map((field) => [field.id, field]));
  const extractedData = {};
  const validationErrors = [];

  for (const [key, value] of Object.entries(extracted)) {
    const field = fieldMap.get(key);

    if (!field) {
      validationErrors.push(`"${key}" is not a valid field in this form`);
      continue;
    }

    if (value === null || value === undefined) continue;

    switch (field.type) {
      case "number":
        if (typeof value !== "number" || Number.isNaN(value)) {
          validationErrors.push(`"${key}" must be a number`);
          continue;
        }
        break;

      case "checkbox":
        if (typeof value !== "boolean") {
          validationErrors.push(`"${key}" must be true or false`);
          continue;
        }
        break;

      case "email":
        if (
          typeof value !== "string" ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          validationErrors.push(`"${key}" must be a valid email address`);
          continue;
        }
        break;

      case "date":
        if (
          typeof value !== "string" ||
          Number.isNaN(Date.parse(value))
        ) {
          validationErrors.push(`"${key}" must be a valid date`);
          continue;
        }
        break;

      case "select":
      case "radio": {
        if (typeof value !== "string") {
          validationErrors.push(`"${key}" must be a text value`);
          continue;
        }

        const options = (field.options || []).map((option) =>
          typeof option === "string"
            ? option
            : String(option?.value ?? option?.label ?? "")
        );

        if (options.length > 0 && !options.includes(value)) {
          validationErrors.push(
            `"${key}" must match one of the allowed options`
          );
          continue;
        }
        break;
      }

      default:
        if (typeof value !== "string") {
          validationErrors.push(`"${key}" must be a text value`);
          continue;
        }
    }

    extractedData[key] = value;
  }

  if (validationErrors.length > 0) {
    throw new Error(
      `AI extraction validation failed: ${validationErrors.join("; ")}`
    );
  }

  const confidenceScores = {};
  for (const key of Object.keys(extractedData)) {
    confidenceScores[key] = 1;
  }

  return {
    extractedData,
    confidenceScores,
    extractedAt: new Date().toISOString(),
    source: "local_qwen_llm",
    formId,
  };
}
