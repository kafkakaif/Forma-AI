// Backend API service for Forma AI
// Communicates with backend on http://localhost:5000/api or fallback URL

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Format frontend form schema into backend-compatible schema
 */
export function convertToBackendFormat(schema) {
  const slug =
    schema.slug ||
    (schema.id || schema.title || "custom-form")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
      "-" +
      Date.now().toString(36);

  // Group fields into a default section if sections aren't already defined
  const fields = (schema.fields || []).map((f) => {
    const fieldObj = {
      name: (f.id || f.name || "field").replace(/[^a-zA-Z0-9_]/g, "_"),
      label: f.label || "Untitled Field",
      type: ["text", "select", "checkbox"].includes(f.type)
        ? f.type
        : f.type === "radio"
        ? "select" // Backend enum: text, select, checkbox
        : f.type === "textarea" || f.type === "email" || f.type === "number" || f.type === "date"
        ? "text"
        : "text",
      required: Boolean(f.required),
      placeholder: f.placeholder || "",
      helpText: f.helpText || "",
      options: Array.isArray(f.options)
        ? f.options.map((opt) => (typeof opt === "string" ? opt : opt.value || opt.label))
        : [],
    };

    if (f.minLength || f.maxLength || f.pattern || f.validation) {
      fieldObj.validation = {
        minLength: f.minLength || f.validation?.minLength || undefined,
        maxLength: f.maxLength || f.validation?.maxLength || undefined,
        pattern: f.pattern || f.validation?.pattern || undefined,
        message: f.validation?.message || undefined,
      };
    }

    if (f.showIf) {
      fieldObj.showIf = f.showIf;
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
 * Check if backend server is responsive
 */
export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return { healthy: false, status: res.status };
    const data = await res.json();
    return { healthy: data.status === "ok", status: res.status };
  } catch (err) {
    clearTimeout(timeoutId);
    return { healthy: false, error: err.message };
  }
}

/**
 * Save form schema to backend (POST /api/forms)
 */
export async function saveFormToBackend(schema) {
  const backendPayload = convertToBackendFormat(schema);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${API_BASE}/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(backendPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: data.error || `Server responded with status ${res.status}`,
      };
    }

    // Save in localStorage as well for offline accessibility
    saveFormToLocalCache({ ...schema, slug: data.slug || backendPayload.slug, _id: data._id });

    return {
      success: true,
      status: res.status,
      data,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // If backend is down, save to local storage cache so work isn't lost
    saveFormToLocalCache(schema);
    return {
      success: false,
      isOffline: true,
      error: `Could not reach backend API at ${API_BASE}. (${err.message}). Form saved locally.`,
    };
  }
}

/**
 * Fetch all forms from backend
 */
export async function getBackendForms() {
  try {
    const res = await fetch(`${API_BASE}/forms`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, fetching from local cache", err);
    return getLocalForms();
  }
}

/**
 * Local storage helpers
 */
export function saveFormToLocalCache(schema) {
  try {
    const existing = getLocalForms();
    const id = schema.id || schema.slug || `form_${Date.now()}`;
    const updated = [
      { ...schema, id, updatedAt: new Date().toISOString() },
      ...existing.filter((f) => (f.id !== id && f.slug !== schema.slug)),
    ];
    localStorage.setItem("forma_saved_forms", JSON.stringify(updated));
  } catch (e) {
    console.error("Local storage error", e);
  }
}

export function getLocalForms() {
  try {
    const data = localStorage.getItem("forma_saved_forms");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
