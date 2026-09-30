import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AIInput() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedForm, setGeneratedForm] = useState(null);

  // -----------------------------------
  // TEMPORARY FRONTEND FORM GENERATION
  // -----------------------------------

  const generateFormSchema = (userPrompt) => {
    const text = userPrompt.toLowerCase();

    // VEHICLE / INSURANCE FORM
    if (text.includes("vehicle") || text.includes("insurance")) {
      return {
        id: "vehicle-insurance",
        title: "Vehicle Insurance Claim Form",
        description: "Generated from your description.",

        fields: [
          {
            id: "fullName",
            label: "Full Name",
            type: "text",
            required: true,
          },

          {
            id: "email",
            label: "Email",
            type: "email",
            required: true,
          },

          {
            id: "vehicleRegistration",
            label: "Vehicle Registration Number",
            type: "text",
            required: true,
          },

          {
            id: "incidentDate",
            label: "Date of Incident",
            type: "date",
            required: true,
          },

          {
  id: "vehicleDamaged",
  label: "Was the vehicle damaged?",
  type: "radio",
  required: true,

  options: [
    {
      label: "Yes",
      value: "yes",
    },
    {
      label: "No",
      value: "no",
    },
  ],
},

          {
            id: "description",
            label: "Describe the incident",
            type: "textarea",
            required: true,
          },
        ],
      };
    }

    // MEDICAL FORM
    if (text.includes("medical")) {
      return {
        id: "medical-claim",
        title: "Medical Claim Form",
        description: "Generated from your description.",

        fields: [
          {
            id: "patientName",
            label: "Patient Name",
            type: "text",
            required: true,
          },

          {
            id: "email",
            label: "Email",
            type: "email",
            required: true,
          },

          {
            id: "treatmentDate",
            label: "Date of Treatment",
            type: "date",
            required: true,
          },

          {
            id: "treatmentType",
            label: "Treatment Type",
            type: "select",
            required: true,
          },

          {
            id: "medicalDescription",
            label: "Medical Description",
            type: "textarea",
            required: true,
          },
        ],
      };
    }

    // PROPERTY FORM
    if (text.includes("property")) {
      return {
        id: "property-damage",
        title: "Property Damage Claim Form",
        description: "Generated from your description.",

        fields: [
          {
            id: "ownerName",
            label: "Owner Name",
            type: "text",
            required: true,
          },

          {
            id: "email",
            label: "Email",
            type: "email",
            required: true,
          },

          {
            id: "propertyAddress",
            label: "Property Address",
            type: "text",
            required: true,
          },

          {
            id: "damageDate",
            label: "Date of Damage",
            type: "date",
            required: true,
          },

          {
            id: "damageType",
            label: "Damage Type",
            type: "select",
            required: true,
          },

          {
            id: "damageDescription",
            label: "Describe the Damage",
            type: "textarea",
            required: true,
          },
        ],
      };
    }

    // DEFAULT FORM
    return {
      id: "generated-form",
      title: "Generated Form",
      description:
        "A form structure was generated from your description.",

      fields: [
        {
          id: "fullName",
          label: "Full Name",
          type: "text",
          required: true,
        },

        {
          id: "email",
          label: "Email",
          type: "email",
          required: true,
        },

        {
          id: "date",
          label: "Date",
          type: "date",
          required: true,
        },

        {
          id: "additionalInformation",
          label: "Additional Information",
          type: "textarea",
          required: false,
        },
      ],
    };
  };

  // -----------------------------------
  // GENERATE FORM
  // -----------------------------------

  const handleGenerate = () => {
    if (!prompt.trim()) {
      return;
    }

    setLoading(true);
    setGeneratedForm(null);

    setTimeout(() => {
      const result = generateFormSchema(prompt);

      setGeneratedForm(result);
      setLoading(false);
    }, 1200);
  };

  // -----------------------------------
  // EXAMPLE PROMPT
  // -----------------------------------

  const handleExample = (example) => {
    setPrompt(example);
    setGeneratedForm(null);
  };

  // -----------------------------------
  // UPDATE FIELD
  // -----------------------------------

  const updateField = (fieldId, key, value) => {
    setGeneratedForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,

        fields: current.fields.map((field) =>
          field.id === fieldId
            ? {
                ...field,
                [key]: value,
              }
            : field
        ),
      };
    });
  };

  // -----------------------------------
  // DELETE FIELD
  // -----------------------------------

  const deleteField = (fieldId) => {
    setGeneratedForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,

        fields: current.fields.filter(
          (field) => field.id !== fieldId
        ),
      };
    });
  };

  // -----------------------------------
  // APPLY FORM
  // -----------------------------------

  const handleApplyForm = () => {
  if (!generatedForm) {
    return;
  }

  navigate("/generated-form", {
    state: {
      schema: generatedForm,
    },
  });
};

  // -----------------------------------
  // UI
  // -----------------------------------

  return (
    <div className="ai-input-page">
      <div className="ai-input-container">

        {/* PAGE HEADER */}

        <h1>AI Form Generator</h1>

        <p>
          Describe the form you want to create, and Forma AI
          will generate the structure for you.
        </p>

        {/* PROMPT */}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the form you want to create..."
          rows={8}
        />

        {/* GENERATE BUTTON */}

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generating..." : "Generate Form"}
        </button>

        {/* EXAMPLES */}

        <div className="example-section">
          <h3>Try an example</h3>

          {[
            "Create a vehicle insurance claim form",
            "Create a medical claim form",
            "Create a property damage claim form",
          ].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExample(example)}
            >
              {example}
            </button>
          ))}
        </div>

        {/* GENERATED FORM PREVIEW */}

        {generatedForm && (
          <div className="generated-preview">

            <div className="preview-header">
              <h2>{generatedForm.title}</h2>

              <p>{generatedForm.description}</p>
            </div>

            <h3>Edit Generated Fields</h3>

            <div className="generated-fields">

              {generatedForm.fields.map((field) => (
                <div
                  className="generated-field"
                  key={field.id}
                >

                  {/* FIELD LABEL */}

                  <div className="field-editor">
                    <label>Field Label</label>

                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(
                          field.id,
                          "label",
                          e.target.value
                        )
                      }
                      placeholder="Enter field label"
                    />
                  </div>

                  {/* FIELD TYPE */}

                  <div className="field-editor">
                    <label>Field Type</label>

                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(
                          field.id,
                          "type",
                          e.target.value
                        )
                      }
                    >
                      <option value="text">
                        Text
                      </option>

                      <option value="email">
                        Email
                      </option>

                      <option value="date">
                        Date
                      </option>

                      <option value="number">
                        Number
                      </option>

                      <option value="select">
                        Dropdown
                      </option>

                      <option value="radio">
                        Radio
                      </option>

                      <option value="checkbox">
                        Checkbox
                      </option>

                      <option value="textarea">
                        Textarea
                      </option>
                    </select>
                  </div>

                  {/* REQUIRED */}

                  <div className="field-required">
                    <label>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(
                            field.id,
                            "required",
                            e.target.checked
                          )
                        }
                      />

                      Required
                    </label>
                  </div>

                  {/* REMOVE */}

                  <button
                    type="button"
                    onClick={() =>
                      deleteField(field.id)
                    }
                  >
                    Remove
                  </button>

                </div>
              ))}

            </div>

            {/* APPLY */}

            <button
              className="apply-form-btn"
              onClick={handleApplyForm}
            >
              Apply to Form
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default AIInput;