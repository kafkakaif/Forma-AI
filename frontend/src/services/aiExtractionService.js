// AI Extraction Service for Week 3: AI -> React Form
// Handles sending extraction requests, receiving and parsing extraction responses.

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Sample extraction prompts for instant testing
 */
export const SAMPLE_EXTRACTION_PROMPTS = {
  insuranceClaim: `On October 4, 2026, Jane Doe was driving on Main Street when an accident occurred. Vehicle registration DL01AB9876 was involved. The vehicle was damaged with major front bumper damage. A police report was filed with the local precinct. Fortunately, no injuries were reported. Jane can be reached at jane.doe@example.com or phone 9876543210.`,
  medicalClaim: `Patient Johnathan Smith (email: jsmith@healthcare.org, phone 9123456789) received emergency treatment on 2026-09-28. Treatment type was Hospitalization and patient spent 4 days in the hospital for observation. All details confirmed accurate.`,
  generic: `Customer Alex Johnson, email alex.j@example.com, phone 8005551234, submitted an expedited service request regarding damaged goods received on 2026-10-01.`,
};

/**
 * Sample raw extraction responses for direct JSON receipt testing
 */
export const SAMPLE_RAW_RESPONSES = {
  insuranceClaim: {
    success: true,
    extractedData: {
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "9876543210",
      claimType: "vehicle_accident",
      incidentDate: "2026-10-04",
      vehicleNumber: "DL01AB9876",
      accidentOccurred: "yes",
      accidentLocation: "Main Street & 5th Ave",
      vehicleDamaged: "yes",
      damageType: "major",
      majorDamageDetails: "Front bumper crushed and hood dented",
      policeReport: "yes",
      injuries: "no",
      description: "Rear-ended by another car while stopped at traffic signal on Main Street.",
    },
    confidenceScores: {
      fullName: 0.99,
      email: 0.98,
      phone: 0.95,
      incidentDate: 0.97,
      vehicleNumber: 0.94,
    },
    extractedAt: "2026-10-06T07:30:00.000Z",
    source: "ai_llm_extractor",
  },
};

/**
 * Point 1: Parse and validate an extraction response payload.
 * Accepts objects, nested data, or raw JSON strings.
 *
 * Supported payload structures:
 * 1. { success: true, extractedData: { ... } }
 * 2. { success: true, data: { ... } }
 * 3. { fields: { ... } }
 * 4. { extracted: { ... } }
 * 5. { ...directKeyValuePairs }
 */
export function normalizeExtractionResponse(rawInput, source = "external") {
  if (!rawInput) {
    throw new Error("Extraction response is empty or null.");
  }

  let payload = rawInput;

  // Handle JSON string input
  if (typeof rawInput === "string") {
    try {
      payload = JSON.parse(rawInput);
    } catch (parseError) {
      throw new Error(`Failed to parse extraction response JSON: ${parseError.message}`);
    }
  }

  if (typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Invalid extraction response: Expected a JSON object.");
  }

  // Detect extracted dictionary from possible envelope keys
  let extractedFields = null;

  if (payload.extractedData && typeof payload.extractedData === "object" && !Array.isArray(payload.extractedData)) {
    extractedFields = payload.extractedData;
  } else if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    extractedFields = payload.data;
  } else if (payload.fields && typeof payload.fields === "object" && !Array.isArray(payload.fields)) {
    extractedFields = payload.fields;
  } else if (payload.extracted && typeof payload.extracted === "object" && !Array.isArray(payload.extracted)) {
    extractedFields = payload.extracted;
  } else {
    // Check if the payload is directly a key-value dictionary (excluding meta envelope properties)
    const clone = { ...payload };
    delete clone.success;
    delete clone.message;
    delete clone.status;
    delete clone.timestamp;
    delete clone.source;
    delete clone.confidenceScores;
    delete clone.metadata;

    if (Object.keys(clone).length > 0) {
      extractedFields = clone;
    }
  }

  if (!extractedFields || Object.keys(extractedFields).length === 0) {
    throw new Error("Extraction response contains no extractable field data.");
  }

  const fieldKeys = Object.keys(extractedFields);

  return {
    success: true,
    data: extractedFields,
    rawResponse: payload,
    fieldCount: fieldKeys.length,
    extractedKeys: fieldKeys,
    confidenceScores: payload.confidenceScores || null,
    receivedAt: new Date().toISOString(),
    source: payload.source || source,
  };
}

/**
 * Point 1: Safe wrapper to receive and validate an extraction response.
 */
export function receiveExtractionResponse(rawInput, source = "received") {
  try {
    const normalized = normalizeExtractionResponse(rawInput, source);
    return {
      success: true,
      response: normalized,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      response: null,
      error: err.message,
    };
  }
}

/**
 * Intelligent client-side fallback extractor
 * Used when backend `/api/ai/extract` is offline or not yet implemented.
 * Extracts common fields from text so Point 1 can be tested immediately.
 */
function simulateSmartExtraction(text, schema) {
  const t = text.toLowerCase();
  const extracted = {};

  // Name extraction
  const nameMatch = text.match(/(?:name is|patient|customer|driver|i am|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i) ||
                    text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/);
  if (nameMatch) {
    extracted.fullName = nameMatch[1].trim();
  } else if (t.includes("jane doe")) {
    extracted.fullName = "Jane Doe";
  } else if (t.includes("john doe")) {
    extracted.fullName = "John Doe";
  }

  // Email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    extracted.email = emailMatch[0];
  }

  // Phone extraction
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
  if (phoneMatch) {
    extracted.phone = phoneMatch[0].replace(/\D/g, "").slice(-10);
  }

  // Date extraction
  const dateMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/) ||
                    text.match(/(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i);
  if (dateMatch) {
    if (/\b\d{4}-\d{2}-\d{2}\b/.test(dateMatch[0])) {
      extracted.incidentDate = dateMatch[0];
    } else {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate.getTime())) {
        extracted.incidentDate = parsedDate.toISOString().split("T")[0];
      }
    }
  } else {
    extracted.incidentDate = new Date().toISOString().split("T")[0];
  }

  // Vehicle Registration Number
  const vehicleMatch = text.match(/\b[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,2}\s?[0-9]{4}\b/i);
  if (vehicleMatch) {
    extracted.vehicleNumber = vehicleMatch[0].replace(/\s+/g, "").toUpperCase();
  }

  // Accident occurrence & damage
  if (t.includes("accident") || t.includes("crash") || t.includes("collision")) {
    extracted.accidentOccurred = "yes";
    extracted.claimType = "vehicle_accident";
  }

  if (t.includes("damaged") || t.includes("damage")) {
    extracted.vehicleDamaged = "yes";
    if (t.includes("major")) {
      extracted.damageType = "major";
      extracted.majorDamageDetails = "Major impact damage noted in incident report.";
    } else {
      extracted.damageType = "minor";
    }
  }

  // Police Report
  if (t.includes("police report") || t.includes("filed with the police") || t.includes("precinct")) {
    extracted.policeReport = "yes";
  }

  // Injuries
  if (t.includes("no injuries") || t.includes("no injury") || t.includes("uninjured")) {
    extracted.injuries = "no";
  } else if (t.includes("injury") || t.includes("injured") || t.includes("hurt")) {
    extracted.injuries = "yes";
    extracted.injuryDetails = "Injuries sustained during incident.";
  }

  // Location
  const locationMatch = text.match(/(?:at|on|near)\s+([A-Za-z0-9\s&]+(?:street|st|road|rd|avenue|ave|blvd|highway))/i);
  if (locationMatch) {
    extracted.accidentLocation = locationMatch[1].trim();
  }

  // Description
  extracted.description = text.trim();

  return {
    success: true,
    extractedData: extracted,
    confidenceScores: Object.keys(extracted).reduce((acc, key) => {
      acc[key] = 0.92;
      return acc;
    }, {}),
    source: "smart_local_extractor_fallback",
  };
}

/**
 * Point 1: Request and receive extraction response from backend or local intelligent fallback.
 * Sends unstructured text and receives the extraction response.
 */
export async function requestExtraction({ text, schema = null, formId = null, signal = null }) {
  if (!text || !text.trim()) {
    throw new Error("Text content is required for AI extraction.");
  }

  const endpoint = `${API_BASE}/ai/extract`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        formId: formId || schema?.formId || schema?.id,
        fields: schema?.fields?.map((f) => ({ id: f.id || f.name, label: f.label, type: f.type })) || [],
      }),
      signal,
    });

    if (response.ok) {
      const rawData = await response.json();
      return normalizeExtractionResponse(rawData, "backend_ai_service");
    }

    // Backend endpoint returned non-200 or not implemented (404)
    console.warn(
      `Forma AI extraction endpoint returned status ${response.status}. Falling back to smart extraction simulation.`
    );
    const simulated = simulateSmartExtraction(text, schema);
    return normalizeExtractionResponse(simulated, "smart_fallback_simulator");
  } catch (networkError) {
    // If backend is unreachable or endpoint missing, fallback cleanly
    console.warn(
      `Could not reach backend extraction endpoint (${networkError.message}). Using smart fallback simulator.`
    );
    const simulated = simulateSmartExtraction(text, schema);
    return normalizeExtractionResponse(simulated, "smart_fallback_simulator");
  }
}
