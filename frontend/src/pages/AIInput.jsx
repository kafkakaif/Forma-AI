import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Eye,
  Code2,
  ArrowRight,
  RotateCcw,
  CloudUpload,
  Layers,
  ListFilter,
  Check,
  Download,
  Info,
  AlignLeft,
} from "lucide-react";
import DynamicForm from "../components/DynamicForm";
import { saveFormToBackend } from "../services/formApi";
import "./AIInput.css";

// Quick regex presets for Task 3: Validation Editor
const REGEX_PRESETS = [
  { label: "10-digit Phone", pattern: "^[0-9]{10}$", message: "Enter a valid 10-digit phone number" },
  { label: "ZIP / Postal Code", pattern: "^\\d{5}(-\\d{4})?$", message: "Enter a valid 5-digit ZIP code" },
  { label: "Alphanumeric", pattern: "^[a-zA-Z0-9_]+$", message: "Only letters, numbers, and underscores allowed" },
  { label: "Alphabetic Only", pattern: "^[a-zA-Z\\s]+$", message: "Only letters and spaces are allowed" },
  { label: "URL (https://)", pattern: "^https?:\\/\\/.+", message: "Enter a valid web URL starting with https://" },
  { label: "Currency / Amount", pattern: "^\\d+(\\.\\d{1,2})?$", message: "Enter a valid currency amount (e.g. 19.99)" },
];

// Option presets for Task 2: Field Options
const OPTION_PRESETS = {
  yesNo: [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ],
  priority: [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
  ],
  satisfaction: [
    { label: "Very Satisfied", value: "very_satisfied" },
    { label: "Satisfied", value: "satisfied" },
    { label: "Neutral", value: "neutral" },
    { label: "Dissatisfied", value: "dissatisfied" },
    { label: "Very Dissatisfied", value: "very_dissatisfied" },
  ],
  gender: [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other / Non-binary", value: "other" },
    { label: "Prefer not to say", value: "prefer_not_to_say" },
  ],
  frequency: [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ],
  rating: [
    { label: "1 Star - Poor", value: "1" },
    { label: "2 Stars - Fair", value: "2" },
    { label: "3 Stars - Good", value: "3" },
    { label: "4 Stars - Very Good", value: "4" },
    { label: "5 Stars - Excellent", value: "5" },
  ],
};

// Live Regex Syntax Validator for Task 3
function validateRegexPattern(pattern) {
  if (!pattern) return { valid: true };
  try {
    new RegExp(pattern);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

function AIInput() {
  const navigate = useNavigate();
  const toastCounter = useRef(0);

  // Generator State
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [promptError, setPromptError] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  // Form Editor State
  const [generatedForm, setGeneratedForm] = useState(null);
  const [expandedFieldId, setExpandedFieldId] = useState(null);
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'preview' | 'json'

  // Task 2: Bulk Add Options state
  const [bulkOptionFieldId, setBulkOptionFieldId] = useState(null);
  const [bulkOptionText, setBulkOptionText] = useState("");

  // Backend API Integration State
  const [apiSaving, setApiSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // ----------------------------------------------------
  // INTELLIGENT MULTI-DOMAIN FORM GENERATOR
  // ----------------------------------------------------
  const generateFormSchema = (userPrompt) => {
    const text = userPrompt.toLowerCase();

    // 1. VEHICLE / AUTO INSURANCE (Multi-Level Logic)
    if (text.includes("vehicle") || text.includes("insurance") || text.includes("car") || text.includes("auto")) {
      return {
        id: "vehicle-insurance-" + Date.now().toString(36),
        title: "Vehicle Insurance Claim Form",
        description: "Submit details regarding your vehicle accident or insurance claim.",
        category: "Insurance",
        fields: [
          {
            id: "fullName",
            label: "Full Name",
            type: "text",
            required: true,
            placeholder: "e.g. Jane Doe",
            minLength: 2,
            maxLength: 50,
          },
          {
            id: "email",
            label: "Email Address",
            type: "email",
            required: true,
            placeholder: "jane@example.com",
          },
          {
            id: "phone",
            label: "Contact Phone Number",
            type: "text",
            required: true,
            placeholder: "10-digit number",
            pattern: "^[0-9]{10}$",
            validation: { message: "Please enter a valid 10-digit phone number" },
          },
          {
            id: "incidentDate",
            label: "Date of Incident",
            type: "date",
            required: true,
          },
          {
            id: "vehicleRegistration",
            label: "Vehicle Registration Number",
            type: "text",
            required: true,
            placeholder: "e.g. AP01AB1234",
          },
          // LEVEL 1: accidentOccurred
          {
            id: "accidentOccurred",
            label: "Did a collision or accident occur?",
            type: "radio",
            required: true,
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
          },
          // LEVEL 2: vehicleDamaged (depends on accidentOccurred == "yes")
          {
            id: "vehicleDamaged",
            label: "Was there visible damage to the vehicle?",
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
          // LEVEL 3: damageType (depends on vehicleDamaged == "yes")
          {
            id: "damageType",
            label: "Severity of Damage",
            type: "select",
            required: true,
            options: [
              { label: "Minor Scratches & Dents", value: "minor" },
              { label: "Moderate Body Damage", value: "moderate" },
              { label: "Severe / Total Loss", value: "severe" },
            ],
            showIf: {
              field: "vehicleDamaged",
              operator: "equals",
              value: "yes",
            },
          },
          // LEVEL 4: repairEstimate (depends on severe or moderate)
          {
            id: "repairEstimate",
            label: "Estimated Repair Cost ($)",
            type: "number",
            required: false,
            placeholder: "Enter estimated amount",
            min: 50,
            max: 100000,
            showIf: {
              field: "damageType",
              operator: "in",
              value: ["moderate", "severe"],
            },
          },
          // LEVEL 5: policeReportFiled (multi-condition: accidentOccurred == "yes" AND vehicleDamaged == "yes")
          {
            id: "policeReportFiled",
            label: "Was an official police report filed?",
            type: "radio",
            required: true,
            options: [
              { label: "Yes, report filed", value: "yes" },
              { label: "No report filed", value: "no" },
            ],
            showIf: {
              operator: "and",
              conditions: [
                { field: "accidentOccurred", operator: "equals", value: "yes" },
                { field: "vehicleDamaged", operator: "equals", value: "yes" },
              ],
            },
          },
          {
            id: "policeReportNumber",
            label: "Police Report Number",
            type: "text",
            required: true,
            placeholder: "e.g. PR-98214",
            showIf: {
              field: "policeReportFiled",
              operator: "equals",
              value: "yes",
            },
          },
          {
            id: "incidentDescription",
            label: "Detailed Incident Description",
            type: "textarea",
            required: true,
            placeholder: "Please describe what happened in detail...",
            minLength: 10,
          },
        ],
      };
    }

    // 2. MEDICAL / HEALTHCARE CLAIM
    if (text.includes("medical") || text.includes("health") || text.includes("patient") || text.includes("hospital")) {
      return {
        id: "medical-claim-" + Date.now().toString(36),
        title: "Medical & Health Claim Form",
        description: "Intake form for patient treatment and medical reimbursement requests.",
        category: "Healthcare",
        fields: [
          {
            id: "patientName",
            label: "Patient Full Name",
            type: "text",
            required: true,
            placeholder: "Enter patient full name",
            minLength: 2,
          },
          {
            id: "patientDob",
            label: "Date of Birth",
            type: "date",
            required: true,
          },
          {
            id: "email",
            label: "Patient Contact Email",
            type: "email",
            required: true,
            placeholder: "patient@example.com",
          },
          {
            id: "treatmentDate",
            label: "Date of Treatment",
            type: "date",
            required: true,
          },
          {
            id: "treatmentType",
            label: "Treatment Classification",
            type: "select",
            required: true,
            options: [
              { label: "Outpatient Consultation", value: "outpatient" },
              { label: "Emergency Room Visit", value: "emergency" },
              { label: "Inpatient Hospitalization", value: "inpatient" },
              { label: "Prescription & Diagnostics", value: "pharmacy" },
            ],
          },
          {
            id: "hospitalStayDays",
            label: "Number of Days Hospitalized",
            type: "number",
            required: true,
            min: 1,
            max: 365,
            placeholder: "e.g. 3",
            showIf: {
              field: "treatmentType",
              operator: "equals",
              value: "inpatient",
            },
          },
          {
            id: "hasSurgery",
            label: "Was a surgical procedure performed?",
            type: "radio",
            required: true,
            options: [
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ],
            showIf: {
              field: "treatmentType",
              operator: "equals",
              value: "inpatient",
            },
          },
          {
            id: "medicalDescription",
            label: "Diagnosis & Symptoms Description",
            type: "textarea",
            required: true,
            placeholder: "Describe the primary diagnosis and treatment rendered...",
          },
          {
            id: "agreeHipaa",
            label: "I certify that all medical information provided is accurate and consent to verification.",
            type: "checkbox",
            required: true,
          },
        ],
      };
    }

    // 3. PROPERTY DAMAGE CLAIM
    if (text.includes("property") || text.includes("home") || text.includes("damage") || text.includes("building")) {
      return {
        id: "property-damage-" + Date.now().toString(36),
        title: "Property Damage Claim Form",
        description: "Assessment and reimbursement request for residential or commercial property damage.",
        category: "Real Estate",
        fields: [
          {
            id: "ownerName",
            label: "Property Owner / Policyholder Name",
            type: "text",
            required: true,
            placeholder: "e.g. Robert Smith",
          },
          {
            id: "propertyAddress",
            label: "Property Physical Address",
            type: "text",
            required: true,
            placeholder: "123 Main St, Suite 400, City, State",
          },
          {
            id: "propertyType",
            label: "Property Type",
            type: "select",
            required: true,
            options: [
              { label: "Single Family Home", value: "residential_single" },
              { label: "Apartment / Condominium", value: "residential_multi" },
              { label: "Commercial Office / Retail", value: "commercial" },
              { label: "Industrial / Warehouse", value: "industrial" },
            ],
          },
          {
            id: "incidentDate",
            label: "Date When Damage Occurred",
            type: "date",
            required: true,
          },
          {
            id: "damageCause",
            label: "Cause of Damage",
            type: "select",
            required: true,
            options: [
              { label: "Water / Plumbing Leak", value: "water" },
              { label: "Fire / Smoke", value: "fire" },
              { label: "Storm / Natural Disaster", value: "storm" },
              { label: "Vandalism / Theft", value: "vandalism" },
              { label: "Other", value: "other" },
            ],
          },
          {
            id: "uninhabitable",
            label: "Is the property currently uninhabitable or unusable?",
            type: "radio",
            required: true,
            options: [
              { label: "Yes, requires temporary relocation", value: "yes" },
              { label: "No, partially usable", value: "no" },
            ],
          },
          {
            id: "emergencyRelocationCost",
            label: "Estimated Daily Relocation Cost ($)",
            type: "number",
            required: false,
            min: 0,
            showIf: {
              field: "uninhabitable",
              operator: "equals",
              value: "yes",
            },
          },
          {
            id: "damageDescription",
            label: "Detailed Description of Damage",
            type: "textarea",
            required: true,
            placeholder: "Explain the extent of physical damage and affected rooms...",
          },
        ],
      };
    }

    // 4. EVENT REGISTRATION / RSVP
    if (text.includes("event") || text.includes("rsvp") || text.includes("conference") || text.includes("ticket")) {
      return {
        id: "event-registration-" + Date.now().toString(36),
        title: "Event Registration & RSVP Form",
        description: "Register attendees, manage dietary preferences, and track ticket tiers.",
        category: "Events",
        fields: [
          {
            id: "attendeeName",
            label: "Attendee Full Name",
            type: "text",
            required: true,
            placeholder: "e.g. Alex Morgan",
          },
          {
            id: "email",
            label: "Work Email Address",
            type: "email",
            required: true,
            placeholder: "alex@company.com",
          },
          {
            id: "ticketTier",
            label: "Ticket Tier",
            type: "select",
            required: true,
            options: [
              { label: "General Admission ($99)", value: "general" },
              { label: "VIP Pass ($249)", value: "vip" },
              { label: "Workshop Only ($49)", value: "workshop" },
            ],
          },
          {
            id: "vipDinner",
            label: "Will you attend the exclusive VIP Gala Dinner?",
            type: "radio",
            required: true,
            options: [
              { label: "Yes, I will attend", value: "yes" },
              { label: "No, cannot attend", value: "no" },
            ],
            showIf: {
              field: "ticketTier",
              operator: "equals",
              value: "vip",
            },
          },
          {
            id: "hasDietaryNeeds",
            label: "Do you have any dietary restrictions?",
            type: "radio",
            required: true,
            options: [
              { label: "Yes", value: "yes" },
              { label: "No restrictions", value: "no" },
            ],
          },
          {
            id: "dietaryDetails",
            label: "Please specify dietary requirements",
            type: "text",
            required: true,
            placeholder: "e.g. Gluten-free, Vegan, Nut allergy",
            showIf: {
              field: "hasDietaryNeeds",
              operator: "equals",
              value: "yes",
            },
          },
          {
            id: "specialAssistance",
            label: "Additional Notes or Accessibility Requests",
            type: "textarea",
            required: false,
          },
        ],
      };
    }

    // 5. GENERAL INTELLIGENT FALLBACK
    const titleWords = userPrompt.trim().split(" ").slice(0, 5).join(" ");
    const generatedTitle =
      titleWords.charAt(0).toUpperCase() + titleWords.slice(1) + (titleWords.toLowerCase().includes("form") ? "" : " Form");

    return {
      id: "custom-form-" + Date.now().toString(36),
      title: generatedTitle,
      description: `Custom form dynamically structured from prompt: "${userPrompt.slice(0, 100)}"`,
      category: "Custom",
      fields: [
        {
          id: "fullName",
          label: "Full Name",
          type: "text",
          required: true,
          placeholder: "Enter full name",
          minLength: 2,
        },
        {
          id: "email",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "name@example.com",
        },
        {
          id: "categorySelection",
          label: "Primary Inquiry Type",
          type: "select",
          required: true,
          options: [
            { label: "General Information", value: "general" },
            { label: "Urgent Support", value: "support" },
            { label: "Billing & Account", value: "billing" },
          ],
        },
        {
          id: "urgencyLevel",
          label: "Is this matter time-sensitive?",
          type: "radio",
          required: true,
          options: [
            { label: "Yes, requires priority review", value: "yes" },
            { label: "Standard turnaround is acceptable", value: "no" },
          ],
          showIf: {
            field: "categorySelection",
            operator: "equals",
            value: "support",
          },
        },
        {
          id: "submissionDate",
          label: "Preferred Follow-up Date",
          type: "date",
          required: false,
        },
        {
          id: "detailedMessage",
          label: "Detailed Message / Notes",
          type: "textarea",
          required: true,
          placeholder: "Enter additional details...",
          minLength: 5,
        },
      ],
    };
  };

  // ----------------------------------------------------
  // GENERATION HANDLER WITH ANIMATED STEPS (TASK 5 & 6)
  // ----------------------------------------------------
  const handleGenerate = async () => {
    setPromptError(null);
    setGenerationError(null);

    // Empty prompt
    if (!prompt || !prompt.trim()) {
      setPromptError(
        "Please describe the form you want to create in the prompt box above."
      );
      return;
    }

    // Prompt too short
    if (prompt.trim().length < 4) {
      setPromptError(
        "Prompt is too brief. Please enter at least 4 characters describing your form needs."
      );
      return;
    }

    setLoading(true);
    setGenerationStep(1);

    try {
      // Step 1: Semantic Intent Analysis
      await new Promise((resolve) => setTimeout(resolve, 400));
      setGenerationStep(2);

      // Step 2: Call the backend AI service
      const response = await fetch(
        "http://localhost:5000/api/ai/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
          }),
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to generate form."
        );
      }

      // Step 3: Validation & Options Setup
      setGenerationStep(3);

      await new Promise((resolve) => setTimeout(resolve, 400));

      const schema = result.schema;

      if (!schema || !Array.isArray(schema.fields)) {
        throw new Error(
          "Backend returned an invalid form schema."
        );
      }

      // Step 4: Conditional Logic Trees
      setGenerationStep(4);

      await new Promise((resolve) => setTimeout(resolve, 300));

      // Pass the backend-generated schema to the existing editor
      setGeneratedForm(schema);
      setLoading(false);
      setActiveTab("editor");

      addToast(
        `Form "${schema.title}" generated successfully with ${schema.fields.length} fields!`,
        "success"
      );
    } catch (error) {
      console.error("AI form generation error:", error);

      setLoading(false);
      setGenerationStep(0);

      setGenerationError(
        error.message || "Failed to generate form."
      );

      addToast(
        "AI form generation failed.",
        "error"
      );
    }
  };

  const handleExamplePrompt = (exampleText) => {
    setPrompt(exampleText);
    setPromptError(null);
  };

  // ----------------------------------------------------
  // TASK 1: AI FORM EDITOR (Add, Edit, Type, Remove, Req)
  // ----------------------------------------------------

  const updateFormMeta = (key, value) => {
    setGeneratedForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const addField = () => {
    const newId = "field_" + Date.now().toString(36);
    const newField = {
      id: newId,
      label: `Field ${(generatedForm?.fields?.length || 0) + 1}`,
      type: "text",
      required: false,
      placeholder: "",
      helpText: "",
    };

    setGeneratedForm((prev) => ({
      ...prev,
      fields: [...(prev?.fields || []), newField],
    }));
    setExpandedFieldId(newId);
    addToast("New field added! Configure its properties below.", "info");
  };

  const updateFieldProperty = (fieldId, propKey, propValue) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;

          const updated = { ...f, [propKey]: propValue };

          // If type changes to select or radio and options are empty, initialize default options (Task 2)
          if (propKey === "type" && (propValue === "select" || propValue === "radio") && (!f.options || f.options.length === 0)) {
            updated.options = [
              { label: "Option 1", value: "option_1" },
              { label: "Option 2", value: "option_2" },
            ];
          }

          return updated;
        }),
      };
    });
  };

  const deleteField = (fieldId) => {
    const deletedField = generatedForm?.fields?.find((f) => f.id === fieldId);
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      const remainingFields = prev.fields.filter((f) => f.id !== fieldId);

      // Clean up any conditional logic referencing the deleted field
      const cleanedFields = remainingFields.map((f) => {
        if (!f.showIf) return f;

        // If single condition
        if (!f.showIf.conditions) {
          if (f.showIf.field === fieldId) {
            const { showIf: _removed, ...rest } = f;
            return rest;
          }
          return f;
        }

        // If compound conditions
        const filteredConds = f.showIf.conditions.filter((c) => c.field !== fieldId);
        if (filteredConds.length === 0) {
          const { showIf: _removed, ...rest } = f;
          return rest;
        }
        return {
          ...f,
          showIf: {
            ...f.showIf,
            conditions: filteredConds,
          },
        };
      });

      return {
        ...prev,
        fields: cleanedFields,
      };
    });
    addToast(`Removed field "${deletedField?.label || fieldId}"`, "info");
  };

  // Task 2: Bulk Add / Import Options
  const handleBulkAddOptions = (fieldId) => {
    if (!bulkOptionText.trim()) {
      setBulkOptionFieldId(null);
      return;
    }
    const lines = bulkOptionText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    const newOptions = lines.map((line) => {
      if (line.includes("=") || line.includes(":")) {
        const parts = line.split(/[=:]/);
        const lbl = parts[0].trim();
        const val = parts.slice(1).join("").trim();
        return { label: lbl, value: val || lbl.toLowerCase().replace(/[^a-z0-9_]/g, "_") };
      }
      return {
        label: line,
        value: line.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      };
    });

    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;
          return {
            ...f,
            options: [...(f.options || []), ...newOptions],
          };
        }),
      };
    });

    setBulkOptionText("");
    setBulkOptionFieldId(null);
    addToast(`Added ${newOptions.length} options!`, "success");
  };

  const duplicateField = (fieldId) => {
    const sourceField = generatedForm?.fields?.find((f) => f.id === fieldId);
    if (!sourceField) return;

    const newId = `${sourceField.id}_copy_${Date.now().toString(36)}`;
    const copy = {
      ...JSON.parse(JSON.stringify(sourceField)),
      id: newId,
      label: `${sourceField.label} (Copy)`,
    };

    const index = generatedForm.fields.findIndex((f) => f.id === fieldId);
    const newFields = [...generatedForm.fields];
    newFields.splice(index + 1, 0, copy);

    setGeneratedForm((prev) => ({ ...prev, fields: newFields }));
    setExpandedFieldId(newId);
    addToast(`Duplicated field "${sourceField.label}"`, "success");
  };

  const moveField = (fieldId, direction) => {
    const fields = [...(generatedForm?.fields || [])];
    const index = fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const [moved] = fields.splice(index, 1);
    fields.splice(targetIndex, 0, moved);

    setGeneratedForm((prev) => ({ ...prev, fields }));
  };

  // ----------------------------------------------------
  // TASK 2: FIELD OPTIONS EDITOR (Add, Edit, Remove, Presets)
  // ----------------------------------------------------

  const addOption = (fieldId) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;
          const currentOpts = f.options || [];
          const num = currentOpts.length + 1;
          return {
            ...f,
            options: [...currentOpts, { label: `Option ${num}`, value: `option_${num}` }],
          };
        }),
      };
    });
  };

  const updateOption = (fieldId, optionIndex, key, val) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;
          const opts = [...(f.options || [])];
          const curr = opts[optionIndex] || {};
          const updatedOpt = { ...curr, [key]: val };

          // If updating label, auto-generate value if value was empty or previously matching
          if (key === "label" && (!curr.value || curr.value === curr.label?.toLowerCase().replace(/\s+/g, "_"))) {
            updatedOpt.value = val.toLowerCase().replace(/[^a-z0-9_]/g, "_");
          }

          opts[optionIndex] = updatedOpt;
          return { ...f, options: opts };
        }),
      };
    });
  };

  const removeOption = (fieldId, optionIndex) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;
          const opts = f.options || [];
          if (opts.length <= 1) return f; // Keep at least one option
          return {
            ...f,
            options: opts.filter((_, idx) => idx !== optionIndex),
          };
        }),
      };
    });
  };

  const applyOptionPreset = (fieldId, presetKey) => {
    const preset = OPTION_PRESETS[presetKey];
    if (!preset) return;
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;
          return { ...f, options: JSON.parse(JSON.stringify(preset)) };
        }),
      };
    });
    addToast("Option preset applied!", "info");
  };

  // ----------------------------------------------------
  // TASK 3: VALIDATION EDITOR (Min/Max, Regex, Email, Number)
  // ----------------------------------------------------

  const updateValidation = (fieldId, valKey, valValue) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;
          const validationObj = { ...(f.validation || {}), [valKey]: valValue };
          // If clearing, delete empty key
          if (valValue === "" || valValue === undefined) {
            delete validationObj[valKey];
          }
          return { ...f, validation: validationObj };
        }),
      };
    });
  };

  const applyRegexPreset = (fieldId, preset) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;
          return {
            ...f,
            pattern: preset.pattern,
            validation: {
              ...(f.validation || {}),
              pattern: preset.pattern,
              message: preset.message,
            },
          };
        }),
      };
    });
    addToast(`Applied regex preset: ${preset.label}`, "info");
  };

  // ----------------------------------------------------
  // TASK 4: CONDITIONAL LOGIC EDITOR (showIf, Multi-level)
  // ----------------------------------------------------

  const toggleConditionalLogic = (fieldId) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f, idx) => {
          if (f.id !== fieldId) return f;
          if (f.showIf) {
            const { showIf: _removed, ...rest } = f;
            return rest;
          }
          // Default to first preceding field
          const preceding = prev.fields.slice(0, idx);
          const firstPreceding = preceding[preceding.length - 1];
          return {
            ...f,
            showIf: {
              field: firstPreceding ? firstPreceding.id : "",
              operator: "equals",
              value: firstPreceding?.options?.[0]?.value || "yes",
            },
          };
        }),
      };
    });
  };

  const updateSingleCondition = (fieldId, key, value) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId) return f;
          const currentShowIf = f.showIf || { field: "", operator: "equals", value: "" };
          return {
            ...f,
            showIf: {
              ...currentShowIf,
              [key]: value,
            },
          };
        }),
      };
    });
  };

  // Compound multi-level logic: switch mode (single vs compound)
  const toggleConditionMode = (fieldId, mode) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f, idx) => {
          if (f.id !== fieldId) return f;
          const preceding = prev.fields.slice(0, idx);
          const dep = preceding[0]?.id || "";

          if (mode === "compound") {
            return {
              ...f,
              showIf: {
                operator: "and",
                conditions: [
                  { field: dep, operator: "equals", value: "yes" },
                  { field: dep, operator: "equals", value: "no" },
                ],
              },
            };
          } else {
            return {
              ...f,
              showIf: {
                field: dep,
                operator: "equals",
                value: "yes",
              },
            };
          }
        }),
      };
    });
  };

  const updateCompoundConditionRow = (fieldId, condIdx, key, val) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId || !f.showIf?.conditions) return f;
          const conds = [...f.showIf.conditions];
          conds[condIdx] = { ...conds[condIdx], [key]: val };
          return {
            ...f,
            showIf: { ...f.showIf, conditions: conds },
          };
        }),
      };
    });
  };

  const addCompoundConditionRow = (fieldId) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f, idx) => {
          if (f.id !== fieldId || !f.showIf?.conditions) return f;
          const preceding = prev.fields.slice(0, idx);
          return {
            ...f,
            showIf: {
              ...f.showIf,
              conditions: [
                ...f.showIf.conditions,
                { field: preceding[0]?.id || "", operator: "equals", value: "yes" },
              ],
            },
          };
        }),
      };
    });
  };

  const removeCompoundConditionRow = (fieldId, condIdx) => {
    setGeneratedForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) => {
          if (f.id !== fieldId || !f.showIf?.conditions) return f;
          const conds = f.showIf.conditions.filter((_, i) => i !== condIdx);
          return {
            ...f,
            showIf: { ...f.showIf, conditions: conds },
          };
        }),
      };
    });
  };

  // ----------------------------------------------------
  // BACKEND INTEGRATION & APPLY (TASK 5 & ROUTING)
  // ----------------------------------------------------

  const handleSaveToBackend = async () => {
    if (!generatedForm) return;

    setApiSaving(true);
    setApiError(null);
    setApiSuccess(null);

    const result = await saveFormToBackend(generatedForm);
    setApiSaving(false);

    if (result.success) {
      setApiSuccess(`Form successfully saved to MongoDB backend! (Slug: ${result.data?.slug})`);
      addToast("Saved to backend database!", "success");
    } else {
      setApiError(result.error);
      addToast("Backend API unavailable. Form saved to local cache.", "error");
    }
  };

  const handleApplyForm = async () => {
    if (!generatedForm) return;

    setApiSaving(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      const result = await saveFormToBackend(generatedForm);

      if (result.success) {
        setApiSuccess(
          `Form saved successfully! Slug: ${result.data?.slug}`
        );
        addToast("Form saved to MongoDB backend!", "success");
        navigate("/generated-form", {
          state: {
            schema: result.data,
          },
        });
        return;
      }

      // If backend API is offline or returns an error, schema was saved to local cache
      setApiError(result.error);
      addToast("Backend API offline. Form saved to local storage!", "info");
      navigate("/generated-form", {
        state: {
          schema: generatedForm,
          isOffline: true,
        },
      });
    } catch (error) {
      console.error("Apply form error:", error);
      addToast("Opening form in local preview mode.", "info");
      navigate("/generated-form", {
        state: {
          schema: generatedForm,
          isOffline: true,
        },
      });
    } finally {
      setApiSaving(false);
    }
  };

  const handleCopySchemaJson = () => {
    if (!generatedForm) return;
    navigator.clipboard.writeText(JSON.stringify(generatedForm, null, 2));
    addToast("Schema JSON copied to clipboard!", "success");
  };

  const handleDownloadSchemaJson = () => {
    if (!generatedForm) return;
    const blob = new Blob([JSON.stringify(generatedForm, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedForm.id || "forma-schema"}.json`;
    a.click();
    URL.revokeObjectURL(a);
    addToast("Downloaded schema file!", "success");
  };

  // Stats calculation
  const totalFields = generatedForm?.fields?.length || 0;
  const requiredCount = generatedForm?.fields?.filter((f) => f.required).length || 0;
  const logicCount = generatedForm?.fields?.filter((f) => f.showIf).length || 0;

  return (
    <div className="ai-studio-page">
      {/* HEADER */}
      <header className="ai-studio-header">
        <div>
          <div className="ai-header-badge">
            <Sparkles size={14} />
            Forma AI Studio
          </div>
          <h1>AI Form Generator & Visual Studio</h1>
          <p>
            Describe any form in natural language. Forma AI automatically drafts the schema with
            type detection, field options, custom validations, and multi-level conditional logic.
          </p>
        </div>

        <div className="ai-engine-chip">
          <span className="ai-engine-dot"></span>
          <span>Forma Neural Engine v2.4</span>
        </div>
      </header>

      {/* PROMPT GENERATOR SECTION */}
      <section className="ai-generator-card">
        <div className="ai-prompt-header">
          <div className="ai-prompt-title">
            <Sparkles size={18} color="#4f46e5" />
            <span>Describe your form requirements</span>
          </div>
          <span className="ai-char-counter">{prompt.length} characters</span>
        </div>

        <textarea
          className={`ai-prompt-textarea ${promptError ? "has-error" : ""}`}
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            if (promptError) setPromptError(null);
          }}
          placeholder="e.g. Create a comprehensive vehicle insurance claim form that asks for driver details, accident occurrence, and conditionally reveals damage severity and police report numbers..."
          rows={3}
        />

        {/* Prompt error banner */}
        {promptError && (
          <div className="ai-alert-banner warning">
            <AlertCircle size={18} />
            <div className="ai-alert-content">
              <strong>Input Required</strong>
              <span>{promptError}</span>
            </div>
          </div>
        )}

        {/* Quick Example Prompts */}
        <div className="ai-prompt-examples">
          <span className="ai-examples-label">Try prompt:</span>
          <button
            type="button"
            className="ai-example-btn"
            onClick={() =>
              handleExamplePrompt(
                "Create a vehicle insurance claim form with accident details and conditional damage severity."
              )
            }
          >
            🚗 Vehicle Insurance Claim
          </button>
          <button
            type="button"
            className="ai-example-btn"
            onClick={() =>
              handleExamplePrompt(
                "Create a medical health intake form with inpatient days, surgery details, and diagnosis."
              )
            }
          >
            🏥 Medical & Health Claim
          </button>
          <button
            type="button"
            className="ai-example-btn"
            onClick={() =>
              handleExamplePrompt(
                "Create a property damage claim form with damage causes and uninhabitable relocation costs."
              )
            }
          >
            🏠 Property Damage Form
          </button>
          <button
            type="button"
            className="ai-example-btn"
            onClick={() =>
              handleExamplePrompt(
                "Create an event registration and RSVP form with VIP dinner options and dietary restrictions."
              )
            }
          >
            🎟️ Event RSVP & Registration
          </button>
        </div>

        {/* Action Buttons */}
        <div className="ai-prompt-footer">
          <button
            type="button"
            className="ai-clear-btn"
            onClick={() => {
              setPrompt("");
              setPromptError(null);
            }}
            disabled={!prompt || loading}
          >
            Clear Prompt
          </button>

          <div className="ai-prompt-btn-group">
            <button
              type="button"
              className="ai-generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              <Sparkles size={16} />
              {loading ? "Synthesizing Schema..." : "Generate Form with AI"}
            </button>
          </div>
        </div>
      </section>

      {/* MULTI-STEP LOADING STATE (TASK 6) */}
      {loading && (
        <div className="ai-loading-container">
          <div className="ai-loading-spinner spin-animation">
            <Sparkles size={28} />
          </div>
          <h3 className="ai-loading-title">Forma AI is crafting your schema</h3>
          <p className="ai-loading-desc">Extracting entities, configuring validation rules, and structuring conditional flows...</p>

          <div className="ai-loading-steps">
            <div className={`ai-step-pill ${generationStep >= 1 ? (generationStep > 1 ? "completed" : "active") : ""}`}>
              {generationStep > 1 ? <Check size={14} /> : <span>1</span>}
              <span>Semantic Intent Analysis</span>
            </div>
            <div className={`ai-step-pill ${generationStep >= 2 ? (generationStep > 2 ? "completed" : "active") : ""}`}>
              {generationStep > 2 ? <Check size={14} /> : <span>2</span>}
              <span>Schema & Type Synthesis</span>
            </div>
            <div className={`ai-step-pill ${generationStep >= 3 ? (generationStep > 3 ? "completed" : "active") : ""}`}>
              {generationStep > 3 ? <Check size={14} /> : <span>3</span>}
              <span>Validation & Options Setup</span>
            </div>
            <div className={`ai-step-pill ${generationStep >= 4 ? "completed" : ""}`}>
              <span>4</span>
              <span>Conditional Logic Trees</span>
            </div>
          </div>
        </div>
      )}

      {/* GENERATION ERROR BANNER (TASK 5) */}
      {generationError && (
        <div className="ai-alert-banner error">
          <AlertCircle size={20} />
          <div className="ai-alert-content">
            <strong>Form Generation Failed</strong>
            <span>{generationError}</span>
            <div>
              <button type="button" className="ai-retry-btn" onClick={handleGenerate}>
                <RotateCcw size={12} /> Retry Generation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE & EDITOR */}
      {generatedForm && !loading && (
        <main className="ai-workspace">
          {/* TABS & TOP TOOLBAR */}
          <div className="ai-workspace-nav">
            <div className="ai-tabs">
              <button
                type="button"
                className={`ai-tab-btn ${activeTab === "editor" ? "active" : ""}`}
                onClick={() => setActiveTab("editor")}
              >
                <Sliders size={16} />
                <span>Visual Field Editor</span>
                <span className="ai-tab-counter">{totalFields}</span>
              </button>

              <button
                type="button"
                className={`ai-tab-btn ${activeTab === "preview" ? "active" : ""}`}
                onClick={() => setActiveTab("preview")}
              >
                <Eye size={16} />
                <span>Live Interactive Preview</span>
              </button>

              <button
                type="button"
                className={`ai-tab-btn ${activeTab === "json" ? "active" : ""}`}
                onClick={() => setActiveTab("json")}
              >
                <Code2 size={16} />
                <span>Schema JSON</span>
              </button>
            </div>

            <div className="ai-workspace-actions">
              <button
                type="button"
                className="ai-save-api-btn"
                onClick={handleSaveToBackend}
                disabled={apiSaving}
                title="Publish schema to backend MongoDB"
              >
                <CloudUpload size={16} />
                {apiSaving ? "Saving..." : "Save to Backend (API)"}
              </button>

              <button
                type="button"
                className="ai-apply-btn"
                onClick={handleApplyForm}
                title="Launch standalone form page"
              >
                <span>Apply to Form</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* BACKEND API STATUS ALERTS (TASK 5) */}
          {apiError && (
            <div className="ai-alert-banner error" style={{ marginBottom: 18 }}>
              <AlertCircle size={18} />
              <div className="ai-alert-content">
                <strong>Backend API Notice</strong>
                <span>{apiError}</span>
                <div>
                  <button type="button" className="ai-retry-btn" onClick={handleSaveToBackend}>
                    <RotateCcw size={12} /> Retry Save to API
                  </button>
                </div>
              </div>
            </div>
          )}

          {apiSuccess && (
            <div className="ai-alert-banner info" style={{ marginBottom: 18 }}>
              <CheckCircle2 size={18} />
              <div className="ai-alert-content">
                <strong>Saved Successfully</strong>
                <span>{apiSuccess}</span>
              </div>
            </div>
          )}

          {/* TAB 1: VISUAL FIELD EDITOR */}
          {activeTab === "editor" && (
            <div>
              {/* Form Title & Description Inline Editor */}
              <div className="ai-meta-card">
                <div className="ai-meta-grid">
                  <div className="ai-meta-input-group">
                    <label>Form Title</label>
                    <input
                      type="text"
                      className="ai-meta-input"
                      value={generatedForm.title || ""}
                      onChange={(e) => updateFormMeta("title", e.target.value)}
                      placeholder="Form Title"
                    />
                  </div>
                  <div className="ai-meta-input-group">
                    <label>Form Description</label>
                    <input
                      type="text"
                      className="ai-meta-input"
                      value={generatedForm.description || ""}
                      onChange={(e) => updateFormMeta("description", e.target.value)}
                      placeholder="Form Description"
                    />
                  </div>
                </div>
              </div>

              {/* STATS SUMMARY BAR */}
              <div className="ai-stats-bar">
                <div className="ai-stat-item">
                  <Layers size={15} color="#4f46e5" />
                  <span>
                    Total Fields: <strong>{totalFields}</strong>
                  </span>
                </div>
                <div className="ai-stat-divider"></div>
                <div className="ai-stat-item">
                  <CheckCircle2 size={15} color="#ef4444" />
                  <span>
                    Required: <strong>{requiredCount}</strong>
                  </span>
                </div>
                <div className="ai-stat-divider"></div>
                <div className="ai-stat-item">
                  <ListFilter size={15} color="#7c3aed" />
                  <span>
                    Conditional Logic: <strong>{logicCount}</strong>
                  </span>
                </div>
                <div className="ai-stat-divider"></div>
                <span style={{ color: "#64748b", fontSize: 12 }}>
                  Drag or use arrows to reorder fields. Rules cascade automatically.
                </span>
              </div>

              {/* FIELDS LIST HEADER */}
              <div className="ai-add-field-banner">
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                  Form Structure & Fields
                </h3>
                <button type="button" className="ai-add-field-btn" onClick={addField}>
                  <Plus size={16} />
                  Add New Field
                </button>
              </div>

              {/* EMPTY FIELDS STATE (TASK 5) */}
              {totalFields === 0 && (
                <div className="ai-empty-fields-card">
                  <Layers size={42} color="#94a3b8" />
                  <h3>No Fields in this Form</h3>
                  <p>All fields have been removed. Add a new field manually or regenerate using a prompt.</p>
                  <button type="button" className="ai-generate-btn" onClick={addField}>
                    <Plus size={16} /> Add First Field
                  </button>
                </div>
              )}

              {/* FIELD CARDS ACCORDION */}
              <div className="ai-fields-container">
                {generatedForm.fields.map((field, index) => {
                  const isExpanded = expandedFieldId === field.id;
                  const precedingFields = generatedForm.fields.slice(0, index);
                  const isSelectOrRadio = field.type === "select" || field.type === "radio";
                  const hasOptions = Array.isArray(field.options) && field.options.length > 0;

                  return (
                    <div
                      key={field.id}
                      className={`ai-field-card ${isExpanded ? "expanded" : ""}`}
                    >
                      {/* CARD HEADER */}
                      <div
                        className="ai-field-header"
                        onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}
                      >
                        <div className="ai-field-header-left">
                          {/* Reorder Buttons */}
                          <div
                            className="ai-field-reorder-btns"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="ai-reorder-btn"
                              disabled={index === 0}
                              onClick={() => moveField(field.id, "up")}
                              title="Move field up"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button
                              type="button"
                              className="ai-reorder-btn"
                              disabled={index === totalFields - 1}
                              onClick={() => moveField(field.id, "down")}
                              title="Move field down"
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>

                          <span className="ai-field-index">#{index + 1}</span>

                          <div className="ai-field-title-info">
                            <span className="ai-field-header-label">{field.label || "Untitled Field"}</span>
                            <span className="ai-field-header-id">{field.id}</span>
                          </div>
                        </div>

                        {/* BADGES & QUICK ACTIONS */}
                        <div className="ai-field-header-badges">
                          <span className={`ai-type-pill ${field.type}`}>{field.type}</span>

                          {isSelectOrRadio && (
                            <span className="ai-opts-badge" title="Options configured">
                              {hasOptions ? `${field.options.length} options` : "no options"}
                            </span>
                          )}

                          <span className={`ai-req-pill ${field.required ? "required" : "optional"}`}>
                            {field.required ? "Required" : "Optional"}
                          </span>

                          {field.showIf && (
                            <span className="ai-logic-pill" title="Has conditional visibility rule">
                              <ListFilter size={11} />
                              showIf logic
                            </span>
                          )}

                          <div
                            className="ai-field-header-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="ai-card-action-btn"
                              onClick={() => duplicateField(field.id)}
                              title="Duplicate Field"
                            >
                              <Copy size={15} />
                            </button>
                            <button
                              type="button"
                              className="ai-card-action-btn delete"
                              onClick={() => deleteField(field.id)}
                              title="Delete Field"
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="ai-card-action-btn"
                              onClick={() => setExpandedFieldId(isExpanded ? null : field.id)}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* CARD BODY (EXPANDABLE) */}
                      {isExpanded && (
                        <div className="ai-field-body">
                          {/* SECTION 1: GENERAL PROPERTIES (TASK 1) */}
                          <div className="ai-editor-section">
                            <div className="ai-editor-section-title">
                              <span>General Field Properties</span>
                            </div>

                            <div className="ai-form-row">
                              {/* FIELD LABEL */}
                              <div className="ai-form-group">
                                <label>Field Label *</label>
                                <input
                                  type="text"
                                  className="ai-input-control"
                                  value={field.label || ""}
                                  onChange={(e) =>
                                    updateFieldProperty(field.id, "label", e.target.value)
                                  }
                                  placeholder="e.g. Full Legal Name"
                                />
                              </div>

                              {/* FIELD IDENTIFIER / NAME */}
                              <div className="ai-form-group">
                                <label>Field Identifier (ID/Name)</label>
                                <input
                                  type="text"
                                  className="ai-input-control"
                                  value={field.id}
                                  onChange={(e) =>
                                    updateFieldProperty(
                                      field.id,
                                      "id",
                                      e.target.value.replace(/[^a-zA-Z0-9_]/g, "_")
                                    )
                                  }
                                  placeholder="unique_id"
                                />
                              </div>

                              {/* FIELD TYPE SELECTOR */}
                              <div className="ai-form-group">
                                <label>Field Type</label>
                                <select
                                  className="ai-select-control"
                                  value={field.type}
                                  onChange={(e) =>
                                    updateFieldProperty(field.id, "type", e.target.value)
                                  }
                                >
                                  <option value="text">Text (Single-line)</option>
                                  <option value="email">Email Address</option>
                                  <option value="number">Number</option>
                                  <option value="date">Date Picker</option>
                                  <option value="select">Dropdown Select</option>
                                  <option value="radio">Radio Buttons</option>
                                  <option value="checkbox">Checkbox (Toggle)</option>
                                  <option value="textarea">Textarea (Multi-line)</option>
                                </select>
                              </div>

                              {/* REQUIRED TOGGLE */}
                              <div className="ai-form-group" style={{ justifyContent: "center" }}>
                                <label>&nbsp;</label>
                                <label className="ai-toggle-label">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(field.required)}
                                    onChange={(e) =>
                                      updateFieldProperty(field.id, "required", e.target.checked)
                                    }
                                  />
                                  <span>Required Field</span>
                                </label>
                              </div>
                            </div>

                            <div className="ai-form-row" style={{ marginTop: 12 }}>
                              <div className="ai-form-group">
                                <label>Placeholder Text</label>
                                <input
                                  type="text"
                                  className="ai-input-control"
                                  value={field.placeholder || ""}
                                  onChange={(e) =>
                                    updateFieldProperty(field.id, "placeholder", e.target.value)
                                  }
                                  placeholder="Hint text inside input"
                                />
                              </div>

                              <div className="ai-form-group">
                                <label>Help Text / Hint</label>
                                <input
                                  type="text"
                                  className="ai-input-control"
                                  value={field.helpText || ""}
                                  onChange={(e) =>
                                    updateFieldProperty(field.id, "helpText", e.target.value)
                                  }
                                  placeholder="Subtext shown below the field"
                                />
                              </div>
                            </div>

                            {/* CUSTOM REQUIRED MESSAGE IF REQUIRED (TASK 1 & 3) */}
                            {field.required && (
                              <div className="ai-form-row" style={{ marginTop: 12 }}>
                                <div className="ai-form-group" style={{ flex: 1 }}>
                                  <label>Custom Required Error Message</label>
                                  <input
                                    type="text"
                                    className="ai-input-control"
                                    value={field.validation?.requiredMessage || ""}
                                    onChange={(e) =>
                                      updateValidation(field.id, "requiredMessage", e.target.value)
                                    }
                                    placeholder={`e.g. ${field.label || "This field"} is required to proceed`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* SECTION 2: FIELD OPTIONS EDITOR (TASK 2) */}
                          {isSelectOrRadio && (
                            <div className="ai-editor-section">
                              <div className="ai-editor-section-title">
                                <span>Options for {field.type === "radio" ? "Radio Buttons" : "Dropdown List"}</span>
                                <span style={{ fontSize: 12, color: "#64748b" }}>
                                  Custom label and value supported (Task 2)
                                </span>
                              </div>

                              <div className="ai-options-list">
                                {(field.options || []).map((opt, optIdx) => (
                                  <div className="ai-option-row" key={optIdx}>
                                    <span className="ai-option-num">{optIdx + 1}.</span>
                                    <input
                                      type="text"
                                      className="ai-input-control"
                                      value={opt.label || ""}
                                      onChange={(e) =>
                                        updateOption(field.id, optIdx, "label", e.target.value)
                                      }
                                      placeholder="Option Display Label"
                                      style={{ flex: 1.5 }}
                                    />
                                    <input
                                      type="text"
                                      className="ai-input-control"
                                      value={opt.value || ""}
                                      onChange={(e) =>
                                        updateOption(field.id, optIdx, "value", e.target.value)
                                      }
                                      placeholder="Stored Value"
                                      style={{ flex: 1 }}
                                    />
                                    <button
                                      type="button"
                                      className="ai-remove-opt-btn"
                                      onClick={() => removeOption(field.id, optIdx)}
                                      disabled={(field.options?.length || 0) <= 1}
                                      title="Remove option"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="ai-option-actions">
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <button
                                    type="button"
                                    className="ai-add-opt-btn"
                                    onClick={() => addOption(field.id)}
                                  >
                                    <Plus size={14} /> Add Option
                                  </button>

                                  <button
                                    type="button"
                                    className="ai-preset-btn"
                                    onClick={() => {
                                      setBulkOptionFieldId(
                                        bulkOptionFieldId === field.id ? null : field.id
                                      );
                                      setBulkOptionText("");
                                    }}
                                    title="Paste multiple options at once"
                                  >
                                    <AlignLeft size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                                    {bulkOptionFieldId === field.id ? "Close Bulk Paste" : "Bulk Paste Options"}
                                  </button>
                                </div>

                                <div className="ai-preset-options">
                                  <span style={{ fontSize: 12, color: "#64748b" }}>Quick Presets:</span>
                                  <button
                                    type="button"
                                    className="ai-preset-btn"
                                    onClick={() => applyOptionPreset(field.id, "yesNo")}
                                  >
                                    Yes / No
                                  </button>
                                  <button
                                    type="button"
                                    className="ai-preset-btn"
                                    onClick={() => applyOptionPreset(field.id, "priority")}
                                  >
                                    Priority
                                  </button>
                                  <button
                                    type="button"
                                    className="ai-preset-btn"
                                    onClick={() => applyOptionPreset(field.id, "satisfaction")}
                                  >
                                    Satisfaction
                                  </button>
                                  <button
                                    type="button"
                                    className="ai-preset-btn"
                                    onClick={() => applyOptionPreset(field.id, "gender")}
                                  >
                                    Gender
                                  </button>
                                  <button
                                    type="button"
                                    className="ai-preset-btn"
                                    onClick={() => applyOptionPreset(field.id, "frequency")}
                                  >
                                    Frequency
                                  </button>
                                  <button
                                    type="button"
                                    className="ai-preset-btn"
                                    onClick={() => applyOptionPreset(field.id, "rating")}
                                  >
                                    1-5 Rating
                                  </button>
                                </div>
                              </div>

                              {/* BULK ADD DRAWER */}
                              {bulkOptionFieldId === field.id && (
                                <div className="ai-bulk-add-drawer">
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                    <strong style={{ fontSize: 12.5, color: "#334155" }}>
                                      Paste options (one option per line):
                                    </strong>
                                    <span style={{ fontSize: 11, color: "#64748b" }}>
                                      Format: Label or Label=value
                                    </span>
                                  </div>
                                  <textarea
                                    className="ai-bulk-textarea"
                                    rows={4}
                                    value={bulkOptionText}
                                    onChange={(e) => setBulkOptionText(e.target.value)}
                                    placeholder={`Option One\nOption Two\nOption Three=custom_value`}
                                  />
                                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                    <button
                                      type="button"
                                      className="ai-generate-btn"
                                      style={{ padding: "6px 14px", fontSize: 12.5 }}
                                      onClick={() => handleBulkAddOptions(field.id)}
                                    >
                                      Import Pasted Options
                                    </button>
                                    <button
                                      type="button"
                                      className="ai-clear-btn"
                                      style={{ padding: "6px 14px", fontSize: 12.5 }}
                                      onClick={() => {
                                        setBulkOptionFieldId(null);
                                        setBulkOptionText("");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* SECTION 3: VALIDATION EDITOR (TASK 3) */}
                          <div className="ai-editor-section">
                            <div className="ai-editor-section-title">
                              <span>Validation Rules</span>
                              <span style={{ fontSize: 12, color: "#64748b" }}>
                                Configure constraints, regex, and custom error messages (Task 3)
                              </span>
                            </div>

                            <div className="ai-form-row">
                              {/* EMAIL FORMAT NOTICE */}
                              {field.type === "email" && (
                                <div className="ai-form-group" style={{ gridColumn: "span 2" }}>
                                  <div className="ai-email-notice">
                                    <Info size={14} color="#3b82f6" />
                                    <span>
                                      RFC-standard email format validation is automatically applied to this field.
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* MIN / MAX LENGTH FOR TEXT */}
                              {(field.type === "text" || field.type === "textarea" || field.type === "email") && (
                                <>
                                  <div className="ai-form-group">
                                    <label>Min Length (characters)</label>
                                    <input
                                      type="number"
                                      className="ai-input-control"
                                      min={0}
                                      value={field.minLength || field.validation?.minLength || ""}
                                      onChange={(e) => {
                                        const v = e.target.value ? Number(e.target.value) : undefined;
                                        updateFieldProperty(field.id, "minLength", v);
                                        updateValidation(field.id, "minLength", v);
                                      }}
                                      placeholder="e.g. 2"
                                    />
                                  </div>
                                  <div className="ai-form-group">
                                    <label>Max Length (characters)</label>
                                    <input
                                      type="number"
                                      className="ai-input-control"
                                      min={1}
                                      value={field.maxLength || field.validation?.maxLength || ""}
                                      onChange={(e) => {
                                        const v = e.target.value ? Number(e.target.value) : undefined;
                                        updateFieldProperty(field.id, "maxLength", v);
                                        updateValidation(field.id, "maxLength", v);
                                      }}
                                      placeholder="e.g. 100"
                                    />
                                  </div>
                                </>
                              )}

                              {/* NUMBER VALIDATION (MIN/MAX/INTEGER) */}
                              {field.type === "number" && (
                                <>
                                  <div className="ai-form-group">
                                    <label>Min Value</label>
                                    <input
                                      type="number"
                                      className="ai-input-control"
                                      value={field.min ?? field.validation?.min ?? ""}
                                      onChange={(e) => {
                                        const v = e.target.value !== "" ? Number(e.target.value) : undefined;
                                        updateFieldProperty(field.id, "min", v);
                                        updateValidation(field.id, "min", v);
                                      }}
                                      placeholder="e.g. 0"
                                    />
                                  </div>
                                  <div className="ai-form-group">
                                    <label>Max Value</label>
                                    <input
                                      type="number"
                                      className="ai-input-control"
                                      value={field.max ?? field.validation?.max ?? ""}
                                      onChange={(e) => {
                                        const v = e.target.value !== "" ? Number(e.target.value) : undefined;
                                        updateFieldProperty(field.id, "max", v);
                                        updateValidation(field.id, "max", v);
                                      }}
                                      placeholder="e.g. 10000"
                                    />
                                  </div>
                                  <div className="ai-form-group" style={{ justifyContent: "center" }}>
                                    <label>&nbsp;</label>
                                    <label className="ai-toggle-label">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(field.validation?.integerOnly)}
                                        onChange={(e) =>
                                          updateValidation(field.id, "integerOnly", e.target.checked)
                                        }
                                      />
                                      <span>Integer (Whole Numbers) Only</span>
                                    </label>
                                  </div>
                                </>
                              )}

                              {/* PATTERN (REGEX) WITH LIVE VALIDATION FEEDBACK */}
                              <div className="ai-form-group" style={{ gridColumn: "span 2" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <label>Pattern (Regex Validation)</label>
                                  {(() => {
                                    const pat = field.pattern || field.validation?.pattern;
                                    if (!pat) return null;
                                    const status = validateRegexPattern(pat);
                                    return status.valid ? (
                                      <span className="ai-regex-valid-badge">
                                        <CheckCircle2 size={12} /> Valid regular expression
                                      </span>
                                    ) : (
                                      <span className="ai-regex-error-badge" title={status.error}>
                                        <AlertCircle size={12} /> Syntax error: {status.error}
                                      </span>
                                    );
                                  })()}
                                </div>

                                <input
                                  type="text"
                                  className="ai-input-control"
                                  value={field.pattern || field.validation?.pattern || ""}
                                  onChange={(e) => {
                                    updateFieldProperty(field.id, "pattern", e.target.value);
                                    updateValidation(field.id, "pattern", e.target.value);
                                  }}
                                  placeholder="e.g. ^[0-9]{10}$"
                                />

                                <div className="ai-validation-presets">
                                  <span style={{ fontSize: 12, color: "#64748b" }}>Quick Regex Presets:</span>
                                  {REGEX_PRESETS.map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      className="ai-val-chip"
                                      onClick={() => applyRegexPreset(field.id, p)}
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* CUSTOM ERROR MESSAGE */}
                              <div className="ai-form-group" style={{ gridColumn: "span 2" }}>
                                <label>Custom Error Message (shown on validation failure)</label>
                                <input
                                  type="text"
                                  className="ai-input-control"
                                  value={field.validation?.message || ""}
                                  onChange={(e) => updateValidation(field.id, "message", e.target.value)}
                                  placeholder="e.g. Please enter a valid 10-digit registration number"
                                />
                              </div>
                            </div>
                          </div>

                          {/* SECTION 4: CONDITIONAL LOGIC EDITOR (TASK 4) */}
                          <div className="ai-editor-section">
                            <div className="ai-editor-section-title">
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <ListFilter size={16} color="#7c3aed" />
                                <span>Conditional Logic (showIf)</span>
                              </div>
                              <label className="ai-toggle-label">
                                <input
                                  type="checkbox"
                                  checked={Boolean(field.showIf)}
                                  onChange={() => toggleConditionalLogic(field.id)}
                                />
                                <span>Enable Visibility Condition</span>
                              </label>
                            </div>

                            {field.showIf ? (
                              precedingFields.length === 0 ? (
                                <div className="ai-alert-banner info" style={{ margin: 0 }}>
                                  <Info size={16} />
                                  <span>
                                    This is the first field in the form. Conditional logic requires at least one
                                    preceding field to depend upon. Reorder this field or add a field before it.
                                  </span>
                                </div>
                              ) : (
                                <div className="ai-logic-panel">
                                  {/* SINGLE CONDITION OR COMPOUND TOGGLE */}
                                  <div className="ai-match-type-selector">
                                    <span>Logic Mode:</span>
                                    <label className="ai-toggle-label" style={{ fontSize: 12.5 }}>
                                      <input
                                        type="radio"
                                        name={`mode_${field.id}`}
                                        checked={!field.showIf.conditions}
                                        onChange={() => toggleConditionMode(field.id, "single")}
                                      />
                                      <span>Single Condition</span>
                                    </label>
                                    <label className="ai-toggle-label" style={{ fontSize: 12.5 }}>
                                      <input
                                        type="radio"
                                        name={`mode_${field.id}`}
                                        checked={Boolean(field.showIf.conditions)}
                                        onChange={() => toggleConditionMode(field.id, "compound")}
                                      />
                                      <span>Multi-Level / Compound (AND / OR)</span>
                                    </label>
                                  </div>

                                  {/* SINGLE CONDITION ROW */}
                                  {!field.showIf.conditions && (
                                    <div className="ai-logic-rule-row">
                                      {/* Dependent field select */}
                                      <select
                                        className="ai-select-control"
                                        value={field.showIf.field || ""}
                                        onChange={(e) =>
                                          updateSingleCondition(field.id, "field", e.target.value)
                                        }
                                      >
                                        <option value="">Select dependent field...</option>
                                        {precedingFields.map((pf) => (
                                          <option key={pf.id} value={pf.id}>
                                            {pf.label} ({pf.id})
                                          </option>
                                        ))}
                                      </select>

                                      {/* Operator */}
                                      <select
                                        className="ai-select-control"
                                        value={field.showIf.operator || "equals"}
                                        onChange={(e) =>
                                          updateSingleCondition(field.id, "operator", e.target.value)
                                        }
                                      >
                                        <option value="equals">equals</option>
                                        <option value="notEquals">does not equal</option>
                                        <option value="in">is one of (in)</option>
                                        <option value="notIn">is not one of (not in)</option>
                                        <option value="gt">greater than (&gt;)</option>
                                        <option value="lt">less than (&lt;)</option>
                                        <option value="notEmpty">is answered (not empty)</option>
                                        <option value="empty">is blank (empty)</option>
                                      </select>

                                      {/* Target Value (Smart Picker) */}
                                      {(() => {
                                        const depField = precedingFields.find(
                                          (pf) => pf.id === field.showIf.field
                                        );
                                        const isUnary =
                                          field.showIf.operator === "notEmpty" ||
                                          field.showIf.operator === "empty";

                                        if (isUnary) {
                                          return (
                                            <div className="ai-unary-placeholder">
                                              <span>Checks field presence</span>
                                            </div>
                                          );
                                        }

                                        if (depField?.type === "checkbox") {
                                          return (
                                            <select
                                              className="ai-select-control"
                                              value={field.showIf.value ?? "true"}
                                              onChange={(e) =>
                                                updateSingleCondition(field.id, "value", e.target.value)
                                              }
                                            >
                                              <option value="true">Checked (Yes)</option>
                                              <option value="false">Unchecked (No)</option>
                                            </select>
                                          );
                                        }

                                        const depOpts = depField?.options;
                                        if (depOpts && depOpts.length > 0) {
                                          return (
                                            <select
                                              className="ai-select-control"
                                              value={field.showIf.value ?? ""}
                                              onChange={(e) =>
                                                updateSingleCondition(field.id, "value", e.target.value)
                                              }
                                            >
                                              <option value="">Select option value...</option>
                                              {depOpts.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                  {opt.label} ({opt.value})
                                                </option>
                                              ))}
                                            </select>
                                          );
                                        }

                                        return (
                                          <input
                                            type="text"
                                            className="ai-input-control"
                                            value={field.showIf.value ?? ""}
                                            onChange={(e) =>
                                              updateSingleCondition(field.id, "value", e.target.value)
                                            }
                                            placeholder="Target value..."
                                          />
                                        );
                                      })()}
                                    </div>
                                  )}

                                  {/* COMPOUND MULTI-CONDITION ROWS */}
                                  {field.showIf.conditions && (
                                    <div>
                                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>Match:</span>
                                        <select
                                          className="ai-select-control"
                                          style={{ width: "auto" }}
                                          value={field.showIf.operator || "and"}
                                          onChange={(e) =>
                                            setGeneratedForm((prev) => ({
                                              ...prev,
                                              fields: prev.fields.map((f) =>
                                                f.id === field.id
                                                  ? { ...f, showIf: { ...f.showIf, operator: e.target.value } }
                                                  : f
                                              ),
                                            }))
                                          }
                                        >
                                          <option value="and">ALL conditions must match (AND)</option>
                                          <option value="or">ANY condition can match (OR)</option>
                                        </select>
                                      </div>

                                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {field.showIf.conditions.map((subCond, subIdx) => {
                                          const depField = precedingFields.find(
                                            (pf) => pf.id === subCond.field
                                          );
                                          const isUnary =
                                            subCond.operator === "notEmpty" || subCond.operator === "empty";
                                          const depOpts = depField?.options;

                                          return (
                                            <div className="ai-logic-rule-row" key={subIdx}>
                                              <select
                                                className="ai-select-control"
                                                value={subCond.field || ""}
                                                onChange={(e) =>
                                                  updateCompoundConditionRow(field.id, subIdx, "field", e.target.value)
                                                }
                                              >
                                                <option value="">Select field...</option>
                                                {precedingFields.map((pf) => (
                                                  <option key={pf.id} value={pf.id}>
                                                    {pf.label}
                                                  </option>
                                                ))}
                                              </select>

                                              <select
                                                className="ai-select-control"
                                                value={subCond.operator || "equals"}
                                                onChange={(e) =>
                                                  updateCompoundConditionRow(field.id, subIdx, "operator", e.target.value)
                                                }
                                              >
                                                <option value="equals">equals</option>
                                                <option value="notEquals">does not equal</option>
                                                <option value="in">is one of (in)</option>
                                                <option value="notIn">is not one of (not in)</option>
                                                <option value="gt">greater than (&gt;)</option>
                                                <option value="lt">less than (&lt;)</option>
                                                <option value="notEmpty">is answered (not empty)</option>
                                                <option value="empty">is blank (empty)</option>
                                              </select>

                                              {isUnary ? (
                                                <div className="ai-unary-placeholder">
                                                  <span>Presence check</span>
                                                </div>
                                              ) : depField?.type === "checkbox" ? (
                                                <select
                                                  className="ai-select-control"
                                                  value={subCond.value ?? "true"}
                                                  onChange={(e) =>
                                                    updateCompoundConditionRow(field.id, subIdx, "value", e.target.value)
                                                  }
                                                >
                                                  <option value="true">Checked (Yes)</option>
                                                  <option value="false">Unchecked (No)</option>
                                                </select>
                                              ) : depOpts && depOpts.length > 0 ? (
                                                <select
                                                  className="ai-select-control"
                                                  value={subCond.value ?? ""}
                                                  onChange={(e) =>
                                                    updateCompoundConditionRow(field.id, subIdx, "value", e.target.value)
                                                  }
                                                >
                                                  <option value="">Select option value...</option>
                                                  {depOpts.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                      {opt.label} ({opt.value})
                                                    </option>
                                                  ))}
                                                </select>
                                              ) : (
                                                <input
                                                  type="text"
                                                  className="ai-input-control"
                                                  value={subCond.value ?? ""}
                                                  onChange={(e) =>
                                                    updateCompoundConditionRow(field.id, subIdx, "value", e.target.value)
                                                  }
                                                  placeholder="Target value..."
                                                />
                                              )}

                                              <button
                                                type="button"
                                                className="ai-remove-opt-btn"
                                                onClick={() => removeCompoundConditionRow(field.id, subIdx)}
                                                disabled={field.showIf.conditions.length <= 1}
                                                title="Delete rule"
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <button
                                        type="button"
                                        className="ai-add-opt-btn"
                                        style={{ marginTop: 10 }}
                                        onClick={() => addCompoundConditionRow(field.id)}
                                      >
                                        <Plus size={14} /> Add Another Condition Rule
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            ) : (
                              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                                Enable this setting to show or hide this field based on answers given in preceding fields.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM APPLY BAR */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
                <button type="button" className="ai-add-field-btn" onClick={addField}>
                  <Plus size={15} /> Add Another Field
                </button>
                <button
  type="button"
  className="ai-apply-btn"
  onClick={handleApplyForm}
  disabled={apiSaving}
>
                  <span>
  {apiSaving
    ? "Saving Form..."
    : "Apply & Open Full Form"}
</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE INTERACTIVE PREVIEW */}
          {activeTab === "preview" && (
            <div style={{ marginTop: 10 }}>
              <div className="ai-alert-banner info" style={{ marginBottom: 20 }}>
                <Eye size={18} />
                <div className="ai-alert-content">
                  <strong>Live Interactive Testing Mode</strong>
                  <span>
                    Test field visibility, select options, and submit answers to verify validation rules and conditional logic in real-time.
                  </span>
                </div>
              </div>

              <DynamicForm
                schema={generatedForm}
                onSubmitSuccess={(_data) => {
                  addToast("Test submission successful! Review payload below.", "success");
                }}
              />
            </div>
          )}

          {/* TAB 3: SCHEMA JSON INSPECTOR */}
          {activeTab === "json" && (
            <div className="ai-json-inspector">
              <div className="ai-json-toolbar">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Code2 size={18} color="#818cf8" />
                  <strong style={{ fontSize: 14 }}>Forma AI Schema Representation (JSON)</strong>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="ai-preset-btn" onClick={handleCopySchemaJson}>
                    <Copy size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    Copy JSON
                  </button>
                  <button type="button" className="ai-preset-btn" onClick={handleDownloadSchemaJson}>
                    <Download size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    Download (.json)
                  </button>
                </div>
              </div>

              <pre className="ai-json-code">
                {JSON.stringify(generatedForm, null, 2)}
              </pre>
            </div>
          )}
        </main>
      )}

      {/* TOAST SYSTEM (TASK 6) */}
      <div className="ai-toasts-drawer">
        {toasts.map((toast) => (
          <div key={toast.id} className={`ai-toast-item ${toast.type}`}>
            {toast.type === "success" && <CheckCircle2 size={16} />}
            {toast.type === "error" && <AlertCircle size={16} />}
            {toast.type === "info" && <Sparkles size={16} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AIInput;