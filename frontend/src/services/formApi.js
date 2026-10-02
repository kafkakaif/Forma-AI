// Backend API service for Forma AI
// Communicates with backend on http://localhost:5000/api

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Convert frontend conditional logic into the backend rule format.
 *
 * Frontend format:
 * {
 *   field: "accidentOccurred",
 *   operator: "equals",
 *   value: "yes"
 * }
 *
 * Backend format:
 * {
 *   field: "accidentOccurred",
 *   equals: "yes"
 * }
 */
function convertConditionToBackend(condition) {
  if (!condition || typeof condition !== "object") {
    return condition;
  }

  // Compound AND / OR conditions
  if (
    condition.operator === "and" ||
    condition.operator === "or"
  ) {
    return {
      [condition.operator === "and" ? "all" : "any"]:
        Array.isArray(condition.conditions)
          ? condition.conditions.map(convertConditionToBackend)
          : [],
    };
  }

  // Already in backend format
  if (!condition.operator) {
    if (Array.isArray(condition.all)) {
      return {
        all: condition.all.map(convertConditionToBackend),
      };
    }

    if (Array.isArray(condition.any)) {
      return {
        any: condition.any.map(convertConditionToBackend),
      };
    }

    return condition;
  }

  const { field, operator, value } = condition;

  switch (operator) {
    case "equals":
      return {
        field,
        equals: value,
      };

    case "notEquals":
      return {
        field,
        notEquals: value,
      };

    case "in":
      return {
        field,
        in: Array.isArray(value) ? value : [value],
      };

    case "notIn":
      return {
        field,
        notIn: Array.isArray(value) ? value : [value],
      };

    case "gt":
      return {
        field,
        gt: Number(value),
      };

    case "lt":
      return {
        field,
        lt: Number(value),
      };

    case "exists":
      return {
        field,
        exists: Boolean(value),
      };

    default:
      return condition;
  }
}

/**
 * Format frontend form schema into backend-compatible schema.
 */
export function convertToBackendFormat(schema) {
  const baseSlug =
    schema.slug ||
    (schema.id || schema.title || "custom-form")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const fields = (schema.fields || []).map((f) => {
    const fieldObj = {
      name: (f.id || f.name || "field").replace(
        /[^a-zA-Z0-9_]/g,
        "_"
      ),

      label: f.label || "Untitled Field",

      // Keep the real frontend field type
      type: [
        "text",
        "email",
        "number",
        "date",
        "textarea",
        "select",
        "radio",
        "checkbox",
      ].includes(f.type)
        ? f.type
        : "text",

      required: Boolean(f.required),

      placeholder: f.placeholder || "",

      helpText: f.helpText || "",

      // Backend currently stores options as strings
      options: Array.isArray(f.options)
        ? f.options.map((opt) =>
            typeof opt === "string"
              ? opt
              : opt?.value || opt?.label || ""
          )
        : [],
    };

    // Validation rules
    if (
      f.minLength != null ||
      f.maxLength != null ||
      f.pattern ||
      f.validation
    ) {
      fieldObj.validation = {
        minLength:
          f.minLength ??
          f.validation?.minLength ??
          undefined,

        maxLength:
          f.maxLength ??
          f.validation?.maxLength ??
          undefined,

        pattern:
          f.pattern ??
          f.validation?.pattern ??
          undefined,

        message:
          f.validation?.message ??
          undefined,
      };
    }

    // Conditional visibility rules
    if (f.showIf) {
      fieldObj.showIf = convertConditionToBackend(f.showIf);
    }

    return fieldObj;
  });

  return {
    slug,
    title: schema.title || "Generated Form",
    description: schema.description || "",
    version: schema.version || 1,

    sections: [
      {
        id: "section_main",
        title: schema.title || "General",
        description: schema.description || "",
        fields,
      },
    ],
  };
}

/**
 * Check whether the backend server is responsive.
 */
export async function checkBackendHealth() {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 2000);

  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        healthy: false,
        status: res.status,
      };
    }

    const data = await res.json();

    return {
      healthy: data.status === "ok",
      status: res.status,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    return {
      healthy: false,
      error: err.message,
    };
  }
}

/**
 * Save a form schema to backend.
 * POST /api/forms
 */
export async function saveFormToBackend(schema) {
  const backendPayload = convertToBackendFormat(schema);

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 4000);

  try {
    const res = await fetch(`${API_BASE}/forms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data = {};

    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error:
          data.error ||
          data.message ||
          `Server responded with status ${res.status}`,
      };
    }

    // Save locally too for accessibility/offline fallback
    saveFormToLocalCache({
      ...schema,
      slug: data.slug || backendPayload.slug,
      _id: data._id,
    });

    return {
      success: true,
      status: res.status,
      data,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    // Backend unavailable → preserve work locally
    saveFormToLocalCache(schema);

    return {
      success: false,
      isOffline: true,
      error: `Could not reach backend API at ${API_BASE}. (${err.message}). Form saved locally.`,
    };
  }
}

/**
 * Fetch all forms from backend.
 * GET /api/forms
 */
export async function getBackendForms() {
  try {
    const res = await fetch(`${API_BASE}/forms`);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(
      "Backend unavailable, fetching from local cache",
      err
    );

    return getLocalForms();
  }
}

/**
 * Fetch one form by ID or slug.
 * GET /api/forms/:id
 */
export async function getBackendForm(idOrSlug) {
  try {
    const res = await fetch(
      `${API_BASE}/forms/${encodeURIComponent(idOrSlug)}`
    );

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error:
          data.error ||
          data.message ||
          `Server responded with status ${res.status}`,
      };
    }

    return {
      success: true,
      status: res.status,
      data,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Local storage helpers
 */
export function saveFormToLocalCache(schema) {
  try {
    const existing = getLocalForms();

    const id =
      schema.id ||
      schema.slug ||
      `form_${Date.now()}`;

    const updated = [
      {
        ...schema,
        id,
        updatedAt: new Date().toISOString(),
      },

      ...existing.filter(
        (f) =>
          f.id !== id &&
          f.slug !== schema.slug
      ),
    ];

    localStorage.setItem(
      "forma_saved_forms",
      JSON.stringify(updated)
    );
  } catch (e) {
    console.error(
      "Local storage error:",
      e
    );
  }
}

export function getLocalForms() {
  try {
    const data = localStorage.getItem(
      "forma_saved_forms"
    );

    return data
      ? JSON.parse(data)
      : [];
  } catch {
    return [];
  }
}