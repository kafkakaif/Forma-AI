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

// =========================================================
// WEEK 3 (POINT 2): MAP JSON KEYS TO FIELD NAMES
// =========================================================

/**
 * Strips underscores, dashes, spaces and lowercases a key
 * e.g. "full_name" -> "fullname", "Vehicle-Number" -> "vehiclenumber"
 */
export function canonicalizeKey(key) {
  if (!key || typeof key !== "string") return "";
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Comprehensive dictionary of common field aliases & synonyms
 * Maps canonical form field keys to common AI extraction variants
 */
export const COMMON_FIELD_ALIASES = {
  // Personal information
  fullName: [
    "fullname", "full_name", "name", "clientname", "client_name",
    "customername", "customer_name", "patientname", "patient_name",
    "drivername", "driver_name", "claimantname", "claimant_name",
    "user_name", "username", "applicantname", "applicant_name", "person_name"
  ],
  email: [
    "email", "emailaddress", "email_address", "mail", "user_email",
    "contact_email", "patient_email", "customer_email", "client_email"
  ],
  phone: [
    "phone", "phonenumber", "phone_number", "telephone", "mobile",
    "mobilenumber", "mobile_number", "contactnumber", "contact_number",
    "cell", "cellphone", "contact_phone", "tel"
  ],

  // Incident & Insurance details
  claimType: [
    "claimtype", "claim_type", "typeofclaim", "type_of_claim",
    "incidenttype", "incident_type", "policytype", "policy_type", "type"
  ],
  incidentDate: [
    "incidentdate", "incident_date", "dateofincident", "date_of_incident",
    "accidentdate", "accident_date", "occurrencedate", "occurrence_date",
    "treatmentdate", "treatment_date", "eventdate", "event_date", "date"
  ],
  vehicleNumber: [
    "vehiclenumber", "vehicle_number", "vehicleno", "vehicle_no",
    "registrationnumber", "registration_number", "regnumber", "reg_number",
    "regno", "reg_no", "licenseplate", "license_plate", "plate_number",
    "plateno", "plate_no", "carnumber", "car_number"
  ],
  accidentOccurred: [
    "accidentoccurred", "accident_occurred", "didaccidentoccur", "did_accident_occur",
    "accidenthappened", "accident_happened", "hasaccident", "has_accident",
    "wasaccident", "was_accident", "accident"
  ],
  accidentLocation: [
    "accidentlocation", "accident_location", "placeofincident", "place_of_incident",
    "incidentlocation", "incident_location", "accidentplace", "accident_place",
    "location", "site", "address", "venue", "street"
  ],
  vehicleDamaged: [
    "vehicledamaged", "vehicle_damaged", "wasvehicledamaged", "was_vehicle_damaged",
    "isvehicledamaged", "is_vehicle_damaged", "cardamaged", "car_damaged",
    "vehicledamage", "vehicle_damage", "hasdamage", "has_damage"
  ],
  damageType: [
    "damagetype", "damage_type", "typeofdamage", "type_of_damage",
    "damageseverity", "damage_severity", "severity", "damageextent",
    "damage_extent", "damagelevel", "damage_level"
  ],
  majorDamageDetails: [
    "majordamagedetails", "major_damage_details", "damagedetails", "damage_details",
    "damagedescription", "damage_description", "damagesummary", "damage_summary",
    "majordamage", "major_damage", "extentofdamage", "extent_of_damage"
  ],
  policeReport: [
    "policereport", "police_report", "waspolicereportfiled", "was_police_report_filed",
    "policereportfiled", "police_report_filed", "firfiled", "fir_filed",
    "policecase", "police_case", "policenotified", "police_notified"
  ],
  injuries: [
    "injuries", "wasanyoneinjured", "was_anyone_injured", "anyinjuries", "any_injuries",
    "injuryoccurred", "injury_occurred", "injuriesreported", "injuries_reported",
    "hasinjuries", "has_injuries", "anyoneinjured", "anyone_injured"
  ],
  injuryDetails: [
    "injurydetails", "injury_details", "injuriesdetails", "injuries_details",
    "injurydescription", "injury_description", "medicaldetails", "medical_details",
    "injuriessustained", "injuries_sustained", "extentofinjuries"
  ],
  description: [
    "description", "incidentdescription", "incident_description", "details",
    "incidentdetails", "incident_details", "summary", "incidentsummary",
    "incident_summary", "narrative", "statement", "notes", "remarks", "explanation"
  ],

  // Healthcare / Medical domain
  patientName: [
    "patientname", "patient_name", "fullname", "full_name", "name"
  ],
  treatmentDate: [
    "treatmentdate", "treatment_date", "dateoftreatment", "date_of_treatment",
    "admissiondate", "admission_date", "incidentdate", "incident_date", "date"
  ],
  treatmentType: [
    "treatmenttype", "treatment_type", "typeoftreatment", "type_of_treatment",
    "proceduretype", "procedure_type", "medicalcare_type"
  ],
  hospitalDays: [
    "hospitaldays", "hospital_days", "daysofstay", "days_of_stay",
    "daysinhospital", "days_in_hospital", "numberofdays", "number_of_days",
    "stayduration", "duration_days"
  ],
  consent: [
    "consent", "agreement", "confirmed", "acknowledged", "verified", "terms"
  ],
};

/**
 * Normalizes extracted value to match target field type and options
 */
export function normalizeFieldValue(value, field) {
  if (value === null || value === undefined) return "";

  const fieldType = field?.type || "text";

  // Radio & Checkbox boolean coercion
  if (fieldType === "radio" || fieldType === "checkbox") {
    const stringVal = String(value).trim().toLowerCase();
    const isAffirmative = stringVal === "true" || stringVal === "yes" || stringVal === "1" || value === true;
    const isNegative = stringVal === "false" || stringVal === "no" || stringVal === "0" || value === false;

    if (Array.isArray(field.options) && field.options.length > 0) {
      // Find matching option
      if (isAffirmative) {
        const yesOpt = field.options.find(
          (opt) => String(opt.value || opt).toLowerCase() === "yes" || String(opt.label || "").toLowerCase() === "yes"
        );
        if (yesOpt) return yesOpt.value ?? yesOpt;
      }
      if (isNegative) {
        const noOpt = field.options.find(
          (opt) => String(opt.value || opt).toLowerCase() === "no" || String(opt.label || "").toLowerCase() === "no"
        );
        if (noOpt) return noOpt.value ?? noOpt;
      }
      // Exact match with any option
      const match = field.options.find(
        (opt) =>
          String(opt.value || opt).toLowerCase() === stringVal ||
          String(opt.label || "").toLowerCase() === stringVal
      );
      if (match) return match.value ?? match;
    }

    if (fieldType === "checkbox") return isAffirmative;
    return isAffirmative ? "yes" : isNegative ? "no" : String(value);
  }

  // Select dropdown options matching
  if (fieldType === "select" && Array.isArray(field.options)) {
    const stringVal = String(value).trim().toLowerCase();
    // Try exact value or label match
    const match = field.options.find(
      (opt) =>
        String(opt.value || opt).toLowerCase() === stringVal ||
        String(opt.label || "").toLowerCase() === stringVal
    );
    if (match) return match.value ?? match;

    // Partial/heuristic match for options
    const partialMatch = field.options.find(
      (opt) =>
        stringVal.includes(String(opt.value || opt).toLowerCase()) ||
        String(opt.label || "").toLowerCase().includes(stringVal)
    );
    if (partialMatch) return partialMatch.value ?? partialMatch;
  }

  // Number coercion
  if (fieldType === "number") {
    if (typeof value === "number") return value;
    const cleaned = String(value).replace(/[^0-9.-]/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? value : num;
  }

  // Date normalization (YYYY-MM-DD)
  if (fieldType === "date") {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      return value.trim();
    }
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  }

  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

/**
 * Point 2: Maps extracted JSON keys to form schema field names
 *
 * Evaluation Order:
 * 1. Exact match (jsonKey === field.id)
 * 2. Canonical match (canonicalize(jsonKey) === canonicalize(field.id))
 * 3. Canonical label match (canonicalize(jsonKey) === canonicalize(field.label))
 * 4. Semantic alias match (via COMMON_FIELD_ALIASES)
 * 5. Token containment match
 *
 * @param {Object} extractedData - Key-value map from extraction response
 * @param {Array} fields - Array of schema field definitions
 * @returns {Object} Mapped values, mapping details, unmapped keys and unmapped fields
 */
export function mapExtractedKeysToSchema(extractedData, fields = []) {
  if (!extractedData || typeof extractedData !== "object") {
    return {
      mappedValues: {},
      mappingDetails: [],
      unmappedKeys: [],
      unmappedFields: fields || [],
      stats: {
        totalExtractedKeys: 0,
        totalMapped: 0,
        unmappedKeysCount: 0,
        totalFieldsCount: fields?.length || 0,
        coveragePercentage: 0,
      },
    };
  }

  const jsonKeys = Object.keys(extractedData);
  const mappedValues = {};
  const mappingDetails = [];
  const matchedJsonKeys = new Set();
  const matchedFieldIds = new Set();

  // Iterate over each field in the form schema
  for (const field of fields) {
    const fieldId = field.id || field.name;
    if (!fieldId) continue;

    const fieldCanonical = canonicalizeKey(fieldId);
    const labelCanonical = canonicalizeKey(field.label || "");
    const aliases = (COMMON_FIELD_ALIASES[fieldId] || []).map(canonicalizeKey);

    let bestMatch = null;

    // Check each JSON key for a match
    for (const jsonKey of jsonKeys) {
      if (matchedJsonKeys.has(jsonKey)) continue;

      const rawValue = extractedData[jsonKey];
      if (rawValue === undefined || rawValue === null || rawValue === "") continue;

      const keyCanonical = canonicalizeKey(jsonKey);

      // 1. Exact match
      if (jsonKey === fieldId) {
        bestMatch = {
          jsonKey,
          matchType: "exact",
          confidence: 1.0,
          rawValue,
        };
        break;
      }

      // 2. Canonical key match (ignoring underscores/casing)
      if (keyCanonical === fieldCanonical) {
        bestMatch = {
          jsonKey,
          matchType: "normalized",
          confidence: 0.98,
          rawValue,
        };
        break;
      }

      // 3. Label match
      if (labelCanonical && keyCanonical === labelCanonical) {
        bestMatch = {
          jsonKey,
          matchType: "label",
          confidence: 0.95,
          rawValue,
        };
        break;
      }

      // 4. Semantic alias match
      if (aliases.includes(keyCanonical)) {
        bestMatch = {
          jsonKey,
          matchType: "alias",
          confidence: 0.92,
          rawValue,
        };
        break;
      }

      // Also check reverse alias mapping (if jsonKey has aliases that include fieldCanonical)
      const reverseAliases = (COMMON_FIELD_ALIASES[jsonKey] || []).map(canonicalizeKey);
      if (reverseAliases.includes(fieldCanonical)) {
        bestMatch = {
          jsonKey,
          matchType: "alias",
          confidence: 0.90,
          rawValue,
        };
        break;
      }

      // 5. Token containment match (e.g. keyCanonical contains fieldCanonical or vice versa)
      if (
        (keyCanonical.length > 4 && fieldCanonical.length > 4) &&
        (keyCanonical.includes(fieldCanonical) || fieldCanonical.includes(keyCanonical))
      ) {
        if (!bestMatch || bestMatch.confidence < 0.82) {
          bestMatch = {
            jsonKey,
            matchType: "fuzzy",
            confidence: 0.82,
            rawValue,
          };
        }
      }
    }

    if (bestMatch) {
      const normalizedValue = normalizeFieldValue(bestMatch.rawValue, field);
      mappedValues[fieldId] = normalizedValue;
      matchedJsonKeys.add(bestMatch.jsonKey);
      matchedFieldIds.add(fieldId);

      mappingDetails.push({
        fieldId,
        fieldLabel: field.label || fieldId,
        fieldType: field.type || "text",
        jsonKey: bestMatch.jsonKey,
        originalValue: bestMatch.rawValue,
        mappedValue: normalizedValue,
        matchType: bestMatch.matchType,
        confidence: bestMatch.confidence,
      });
    }
  }

  // Collect unmapped JSON keys
  const unmappedKeys = jsonKeys
    .filter((k) => !matchedJsonKeys.has(k))
    .map((k) => ({
      key: k,
      value: extractedData[k],
    }));

  // Collect unmapped schema fields
  const unmappedFields = fields
    .filter((f) => !matchedFieldIds.has(f.id || f.name))
    .map((f) => ({
      id: f.id || f.name,
      label: f.label || f.id || f.name,
      type: f.type || "text",
      required: Boolean(f.required),
    }));

  const totalFields = fields.length;
  const totalMapped = matchedFieldIds.size;
  const coveragePercentage = totalFields > 0 ? Math.round((totalMapped / totalFields) * 100) : 0;

  return {
    mappedValues,
    mappingDetails,
    unmappedKeys,
    unmappedFields,
    stats: {
      totalExtractedKeys: jsonKeys.length,
      totalMapped,
      unmappedKeysCount: unmappedKeys.length,
      totalFieldsCount: totalFields,
      coveragePercentage,
    },
  };
}

