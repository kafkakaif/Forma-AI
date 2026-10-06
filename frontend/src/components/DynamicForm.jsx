import React, {

  useEffect,

  useState,

  useMemo,

  useCallback,

} from "react";



import { useForm } from "react-hook-form";

import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Send,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code2,
  FileText,
  RefreshCw,
} from "lucide-react";

import { evaluateConditionRule } from "../utils/conditionEvaluator";
import {
  requestExtraction,
  receiveExtractionResponse,
  mapExtractedKeysToSchema,
  applyMappedValuesWithHookForm,
  SAMPLE_EXTRACTION_PROMPTS,
  SAMPLE_RAW_RESPONSES,
} from "../services/aiExtractionService";
import "./DynamicForm.css";

function DynamicForm({
  schema,
  onSubmitSuccess,
  showHeader = true,
  initialExtractionResponse = null,
  onReceiveExtractionResponse = null,
  onMappingComplete = null,
  onValuesApplied = null,
  enableExtraction = true,
}) {
  const {
    register,
    handleSubmit,
    watch,
    unregister,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  const formValues = watch();

  const [submittedData, setSubmittedData] =

    useState(null);



  const [isSubmitting, setIsSubmitting] =

    useState(false);



  const [submitError, setSubmitError] =

    useState("");



  const [submitNotice, setSubmitNotice] =

    useState("");



  const [validationAttempted, setValidationAttempted] =

    useState(false);

  const [draftLoaded, setDraftLoaded] = useState(false);

  // =========================================================
  // WEEK 3 (POINT 1): RECEIVE EXTRACTION RESPONSE
  // =========================================================
  const [extractionPanelOpen, setExtractionPanelOpen] = useState(false);
  const [extractionMode, setExtractionMode] = useState("text"); // 'text' | 'raw_json'
  const [extractionInputText, setExtractionInputText] = useState("");
  const [rawJsonInput, setRawJsonInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState("");
  const [receivedExtraction, setReceivedExtraction] = useState(null);
  const [showRawJsonPayload, setShowRawJsonPayload] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Point 2: Mapped JSON keys state
  const [mappingResult, setMappingResult] = useState(null);
  const [showMappingBreakdown, setShowMappingBreakdown] = useState(true);

  // Point 3: setValue application state
  const [valuesAppliedWithSetValue, setValuesAppliedWithSetValue] = useState(false);
  const [appliedFieldsCount, setAppliedFieldsCount] = useState(0);
  const [autoApplySetValue, setAutoApplySetValue] = useState(true);

  const handleApplyWithSetValue = useCallback((customMapped = null) => {
    const toApply = customMapped || mappingResult?.mappedValues;
    if (!toApply || typeof toApply !== "object") return;

    const count = applyMappedValuesWithHookForm(setValue, toApply, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setValuesAppliedWithSetValue(true);
    setAppliedFieldsCount(count);

    if (onValuesApplied) {
      onValuesApplied(toApply, count);
    }
  }, [mappingResult, setValue, onValuesApplied]);

  // Automatically map JSON keys to schema fields and auto-apply with setValue()
  useEffect(() => {
    if (receivedExtraction?.data && flatFields.length > 0) {
      const mapped = mapExtractedKeysToSchema(receivedExtraction.data, flatFields);
      setMappingResult(mapped);
      if (onMappingComplete) {
        onMappingComplete(mapped);
      }
      if (autoApplySetValue && mapped.mappedValues && Object.keys(mapped.mappedValues).length > 0) {
        const timer = setTimeout(() => {
          handleApplyWithSetValue(mapped.mappedValues);
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      setMappingResult(null);
      setValuesAppliedWithSetValue(false);
      setAppliedFieldsCount(0);
    }
  }, [receivedExtraction, flatFields, onMappingComplete, autoApplySetValue, handleApplyWithSetValue]);

  // Receive extraction response if passed via props
  useEffect(() => {
    if (initialExtractionResponse) {
      const result = receiveExtractionResponse(initialExtractionResponse, "prop");
      if (result.success) {
        setReceivedExtraction(result.response);
        setExtractionPanelOpen(true);
        if (onReceiveExtractionResponse) {
          onReceiveExtractionResponse(result.response);
        }
      } else {
        setExtractionError(result.error);
      }
    }
  }, [initialExtractionResponse, onReceiveExtractionResponse]);

  const handleTriggerExtraction = async () => {
    setIsExtracting(true);
    setExtractionError("");

    try {
      if (extractionMode === "raw_json") {
        if (!rawJsonInput.trim()) {
          throw new Error("Please enter or paste a JSON extraction response payload.");
        }
        const result = receiveExtractionResponse(rawJsonInput.trim(), "direct_json_paste");
        if (!result.success) {
          throw new Error(result.error);
        }
        setReceivedExtraction(result.response);
        if (onReceiveExtractionResponse) {
          onReceiveExtractionResponse(result.response);
        }
      } else {
        if (!extractionInputText.trim()) {
          throw new Error("Please enter incident notes or claim text to extract data from.");
        }
        const response = await requestExtraction({
          text: extractionInputText.trim(),
          schema,
          formId: schema?.formId || schema?.id,
        });
        setReceivedExtraction(response);
        if (onReceiveExtractionResponse) {
          onReceiveExtractionResponse(response);
        }
      }
    } catch (err) {
      setExtractionError(err.message || "Failed to receive extraction response.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleLoadSampleText = (presetKey = "insuranceClaim") => {
    const text = SAMPLE_EXTRACTION_PROMPTS[presetKey] || SAMPLE_EXTRACTION_PROMPTS.insuranceClaim;
    setExtractionInputText(text);
    setExtractionError("");
  };

  const handleLoadSampleRawJson = () => {
    setRawJsonInput(JSON.stringify(SAMPLE_RAW_RESPONSES.insuranceClaim, null, 2));
    setExtractionError("");
  };

  const handleCopyPayload = () => {
    if (!receivedExtraction?.rawResponse) return;
    navigator.clipboard.writeText(JSON.stringify(receivedExtraction.rawResponse, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleClearExtraction = () => {
    setReceivedExtraction(null);
    setMappingResult(null);
    setValuesAppliedWithSetValue(false);
    setAppliedFieldsCount(0);
    setExtractionError("");
    setExtractionInputText("");
    setRawJsonInput("");
    setShowRawJsonPayload(false);
  };




const draftKey = useMemo(() => {

  if (!schema) return null;



  return `forma_draft_${

    schema.slug ||

    schema.formId ||

    schema.id ||

    schema.title ||

    "form"

  }`;

}, [schema]);



  /**

   * Normalize fields:

   * Supports both:

   * 1. schema.fields

   * 2. schema.sections[].fields

   */

  const flatFields = useMemo(() => {

    if (!schema) return [];



    // Flat schema

    if (

      Array.isArray(schema.fields) &&

      schema.fields.length > 0

    ) {

      return schema.fields;

    }



    // Section-based schema

    if (

      Array.isArray(schema.sections) &&

      schema.sections.length > 0

    ) {

      const out = [];



      schema.sections.forEach((section) => {

        (section.fields || []).forEach(

          (field) => {

            out.push({

              ...field,

              id: field.id || field.name,

              showIf:

                field.showIf ||

                section.showIf ||

                null,

            });

          }

        );

      });



      return out;

    }



    return [];

  }, [schema]);

  /**

 * Load previously saved draft

 */

useEffect(() => {

  if (!draftKey) return;



  setDraftLoaded(false);



  try {

    const savedDraft = localStorage.getItem(draftKey);



    if (savedDraft) {

      const parsed = JSON.parse(savedDraft);



      if (

        parsed &&

        parsed.values &&

        typeof parsed.values === "object"

      ) {

        reset(parsed.values);

      }

    }

  } catch (error) {

    console.warn(

      "Unable to load saved draft:",

      error

    );

  }



  setDraftLoaded(true);

}, [draftKey, reset]);

  /**
   * Automatically save form progress
   */
  useEffect(() => {
    if (!draftKey || !draftLoaded) return;

    const values = formValues || {};

    const hasValues = Object.values(values).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return (
        value !== undefined &&
        value !== null &&
        value !== ""
      );
    });

    try {
      if (!hasValues) {
        localStorage.removeItem(draftKey);
        return;
      }

      localStorage.setItem(
        draftKey,
        JSON.stringify({
          values,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.warn(
        "Unable to save draft:",
        error
      );
    }
  }, [
    formValues,
    draftKey,
    draftLoaded,
  ]);



  /**

   * Check whether a field is visible.

   * Also supports cascading conditions.

   */

  const isFieldVisible = useCallback(

    (field, values) => {

      if (!field.showIf) return true;



      const depField =

        field.showIf.field ||

        field.showIf.dependentField;



      if (depField) {

        const parent = flatFields.find(

          (f) =>

            (f.id || f.name) === depField

        );



        if (

          parent &&

          !isFieldVisible(parent, values)

        ) {

          return false;

        }

      }



      return evaluateConditionRule(

        field.showIf,

        values

      );

    },

    [flatFields]

  );



  /**

   * Remove values from fields that become hidden.

   */

  useEffect(() => {

    flatFields.forEach((field) => {

      const fieldKey =

        field.id || field.name;



      if (

        field.showIf &&

        !isFieldVisible(field, formValues)

      ) {

        unregister(fieldKey);

      }

    });

  }, [

    formValues,

    flatFields,

    isFieldVisible,

    unregister,

  ]);



  /**

   * Submit form to backend

   */

  const handleFormSubmit = async (data) => {

    setIsSubmitting(true);

    setSubmitError("");

    setSubmittedData(null);



    // Keep only currently visible fields

    const cleanData = {};



    flatFields.forEach((field) => {

      const fieldKey =

        field.id || field.name;



      if (

        isFieldVisible(field, data) &&

        data[fieldKey] !== undefined

      ) {

        cleanData[fieldKey] =

          data[fieldKey];

      }

    });



    try {

      /**

       * Use formId for frontend schemas,

       * slug for backend schemas,

       * id as a fallback.

       */

      const formIdentifier =

        schema?.formId ||

        schema?.slug ||

        schema?.id;



      if (!formIdentifier) {

        throw new Error(

          "Form identifier is missing."

        );

      }



      const response = await fetch(

        `http://localhost:5000/api/forms/${encodeURIComponent(

          formIdentifier

        )}/submit`,

        {

          method: "POST",



          headers: {

            "Content-Type":

              "application/json",

          },



          body: JSON.stringify({

            values: cleanData,

          }),

        }

      );



      let result = {};



      try {

        result = await response.json();

      } catch {

        result = {};

      }



      if (!response.ok) {

        throw new Error(

          result.error ||

            "Form submission failed."

        );

      }



      console.log(

        "Forma AI submission saved:",

        result

      );



      setSubmittedData(cleanData);

      if (draftKey) {
        localStorage.removeItem(draftKey);
      }

      setSubmitNotice("Submitted directly to backend MongoDB successfully!");



      if (onSubmitSuccess) {

        onSubmitSuccess(cleanData);

      }

    } catch (error) {

      console.warn("Backend unavailable for submission:", error);



      // Resilient Fallback: save submission in local storage for offline preview/testing

      try {

        const localList = JSON.parse(

          localStorage.getItem("forma_local_submissions") || "[]"

        );

        localList.unshift({

          id: `sub_${Date.now()}`,

          formId: schema?.formId || schema?.slug || schema?.id || "form",

          title: schema?.title || "Form Submission",

          values: cleanData,

          createdAt: new Date().toISOString(),

        });

        localStorage.setItem(

          "forma_local_submissions",

          JSON.stringify(localList.slice(0, 50))

        );

        setSubmittedData(cleanData);

        setSubmitNotice("Notice: Backend server (http://localhost:5000) was unreachable. Submission recorded locally in offline mode!");

        if (onSubmitSuccess) {

          onSubmitSuccess(cleanData);

        }

      } catch {

        setSubmitError(error.message || "Unable to submit the form.");

      }

    } finally {

      setIsSubmitting(false);

    }

  };



  /**

   * Reset form

   */

  const handleFormReset = () => {

    reset();

    if (draftKey) {
      localStorage.removeItem(draftKey);
    }

    setSubmittedData(null);

    setSubmitError("");

    setSubmitNotice("");

    setValidationAttempted(false);

  };



  /**

   * Empty schema state

   */

  if (

    !schema ||

    flatFields.length === 0

  ) {

    return (

      <div className="forma-dynamic-card">

        <div

          style={{

            textAlign: "center",

            padding: "30px 20px",

          }}

        >

          <AlertCircle

            size={36}

            color="#94a3b8"

            style={{

              marginBottom: 12,

            }}

          />



          <h3

            style={{

              margin: "0 0 6px",

              color: "#1e293b",

            }}

          >

            No fields available

          </h3>



          <p

            style={{

              margin: 0,

              color: "#64748b",

              fontSize: 14,

            }}

          >

            This form has no active

            fields defined yet.

          </p>

        </div>

      </div>

    );

  }



  /**

   * Render individual field

   */

  const renderField = (field) => {

    const fieldKey =

      field.id || field.name;



    const isVisible =

      isFieldVisible(

        field,

        formValues

      );



    if (!isVisible) return null;



    /**

     * Validation rules

     */

    const validationRules = {

      required: field.required

        ? field.validation

            ?.requiredMessage ||

          `${

            field.label ||

            "This field"

          } is required`

        : false,



      minLength:

        (

          field.minLength ||

          field.validation?.minLength

        )

          ? {

              value: Number(

                field.minLength ||

                  field.validation

                    ?.minLength

              ),



              message:

                field.validation

                  ?.minLengthMessage ||

                `${

                  field.label ||

                  "Field"

                } must be at least ${

                  field.minLength ||

                  field.validation

                    ?.minLength

                } characters`,

            }

          : undefined,



      maxLength:

        (

          field.maxLength ||

          field.validation?.maxLength

        )

          ? {

              value: Number(

                field.maxLength ||

                  field.validation

                    ?.maxLength

              ),



              message:

                field.validation

                  ?.maxLengthMessage ||

                `${

                  field.label ||

                  "Field"

                } cannot exceed ${

                  field.maxLength ||

                  field.validation

                    ?.maxLength

                } characters`,

            }

          : undefined,



      min:

        (field.min ||

          field.validation?.min) !==

          undefined &&

        field.type === "number"

          ? {

              value: Number(

                field.min ||

                  field.validation?.min

              ),



              message:

                field.validation

                  ?.minMessage ||

                `${

                  field.label ||

                  "Field"

                } must be at least ${

                  field.min ||

                  field.validation?.min

                }`,

            }

          : undefined,



      max:

        (field.max ||

          field.validation?.max) !==

          undefined &&

        field.type === "number"

          ? {

              value: Number(

                field.max ||

                  field.validation?.max

              ),



              message:

                field.validation

                  ?.maxMessage ||

                `${

                  field.label ||

                  "Field"

                } cannot exceed ${

                  field.max ||

                  field.validation?.max

                }`,

            }

          : undefined,



      pattern:

        (

          field.pattern ||

          field.validation?.pattern

        )

          ? {

              value: new RegExp(

                field.pattern ||

                  field.validation

                    ?.pattern

              ),



              message:

                field.validation

                  ?.message ||

                `${

                  field.label ||

                  "Field"

                } format is invalid`,

            }

          : undefined,



      validate: {

        ...(field.type ===

        "email"

          ? {

              validEmail: (value) =>

                !value ||

                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(

                  value

                ) ||

                "Please enter a valid email address",

            }

          : {}),



        ...(field.type ===

          "number" &&

        field.validation

          ?.integerOnly

          ? {

              isInteger: (value) =>

                !value ||

                Number.isInteger(

                  Number(value)

                ) ||

                `${

                  field.label ||

                  "Field"

                } must be a whole integer`,

            }

          : {}),

      },

    };



    const hasError =

      Boolean(errors[fieldKey]);



    /**

     * Support both:

     *

     * ["yes", "no"]

     *

     * and

     *

     * [{ label: "Yes", value: "yes" }]

     */

    const normalizedOptions =

      Array.isArray(field.options)

        ? field.options.map(

            (option) =>

              typeof option ===

              "string"

                ? {

                    label: option,

                    value: option,

                  }

                : option

          )

        : [];



    return (

      <div

        className="forma-form-group"

        key={fieldKey}

      >

        <div className="forma-form-label">

          <span>

            {field.label}



            {field.required && (

              <span className="required-star">

                *

              </span>

            )}



            {field.showIf && (

              <span

                className="forma-logic-tag"

                title="Conditional logic active"

              >

                conditional

              </span>

            )}

          </span>



          <span className="field-type-pill">

            {field.type}

          </span>

        </div>



        {field.helpText && (

          <p className="forma-form-help">

            {field.helpText}

          </p>

        )}



        {/* FIELD TYPE SWITCH */}



        {(() => {

          switch (field.type) {

            case "textarea":

              return (

                <textarea

                  id={fieldKey}

                  placeholder={

                    field.placeholder ||

                    `Enter ${

                      field.label?.toLowerCase() ||

                      "details"

                    }...`

                  }

                  className={`forma-textarea ${

                    hasError

                      ? "has-error"

                      : ""

                  }`}

                  {...register(

                    fieldKey,

                    validationRules

                  )}

                />

              );



            case "select":

              return (

                <select

                  id={fieldKey}

                  className={`forma-select ${

                    hasError

                      ? "has-error"

                      : ""

                  }`}

                  {...register(

                    fieldKey,

                    validationRules

                  )}

                >

                  <option value="">

                    {field.placeholder ||

                      "Select an option..."}

                  </option>



                  {normalizedOptions.map(

                    (option, index) => (

                      <option

                        key={

                          option.value ||

                          index

                        }

                        value={

                          option.value

                        }

                      >

                        {option.label}

                      </option>

                    )

                  )}

                </select>

              );



            case "radio":

              return (

                <div className="forma-radio-group">

                  {normalizedOptions.map(

                    (option, index) => {

                      const isSelected =

                        String(

                          formValues[

                            fieldKey

                          ]

                        ) ===

                        String(

                          option.value

                        );



                      return (

                        <label

                          key={

                            option.value ||

                            index

                          }

                          className={`forma-radio-card ${

                            isSelected

                              ? "active"

                              : ""

                          }`}

                        >

                          <input

                            type="radio"

                            value={

                              option.value

                            }

                            {...register(

                              fieldKey,

                              validationRules

                            )}

                          />



                          <span>

                            {option.label}

                          </span>

                        </label>

                      );

                    }

                  )}

                </div>

              );



            case "checkbox":

              return (

                <label

                  className={`forma-checkbox-card ${

                    formValues[fieldKey]

                      ? "active"

                      : ""

                  }`}

                >

                  <input

                    type="checkbox"

                    {...register(

                      fieldKey,

                      {

                        required:

                          field.required

                            ? `${

                                field.label ||

                                "This"

                              } must be checked`

                            : false,

                      }

                    )}

                  />



                  <div className="forma-checkbox-label-text">

                    <strong>

                      {field.placeholder ||

                        field.label}

                    </strong>



                    {field.description && (

                      <span>

                        {field.description}

                      </span>

                    )}

                  </div>

                </label>

              );



            case "number":

              return (

                <input

                  id={fieldKey}

                  type="number"

                  step={

                    field.validation

                      ?.integerOnly

                      ? "1"

                      : "any"

                  }

                  placeholder={

                    field.placeholder ||

                    "Enter number..."

                  }

                  className={`forma-input ${

                    hasError

                      ? "has-error"

                      : ""

                  }`}

                  {...register(

                    fieldKey,

                    validationRules

                  )}

                />

              );



            case "date":

              return (

                <input

                  id={fieldKey}

                  type="date"

                  className={`forma-input ${

                    hasError

                      ? "has-error"

                      : ""

                  }`}

                  {...register(

                    fieldKey,

                    validationRules

                  )}

                />

              );



            case "email":

              return (

                <input

                  id={fieldKey}

                  type="email"

                  placeholder={

                    field.placeholder ||

                    "name\@example.com"

                  }

                  className={`forma-input ${

                    hasError

                      ? "has-error"

                      : ""

                  }`}

                  {...register(

                    fieldKey,

                    validationRules

                  )}

                />

              );



            case "text":

            default:

              return (

                <input

                  id={fieldKey}

                  type="text"

                  placeholder={

                    field.placeholder ||

                    `Enter ${

                      field.label?.toLowerCase() ||

                      ""

                    }...`

                  }

                  className={`forma-input ${

                    hasError

                      ? "has-error"

                      : ""

                  }`}

                  {...register(

                    fieldKey,

                    validationRules

                  )}

                />

              );

          }

        })()}



        {hasError && (

          <div className="forma-field-error">

            <AlertCircle size={14} />



            <span>

              {errors[fieldKey]?.message}

            </span>

          </div>

        )}

      </div>

    );

  };



  return (

    <div className="forma-dynamic-container">

      <div className="forma-dynamic-card">



        {/* HEADER */}
        {showHeader && (
          <header className="forma-form-header">
            <div className="forma-header-actions-row">
              <div className="forma-header-meta">
                <span className="forma-header-badge">
                  <Sparkles size={12} />
                  Live Dynamic Form
                </span>
                <span className="forma-header-count">
                  {flatFields.length} field
                  {flatFields.length === 1 ? "" : "s"}
                </span>
              </div>

              {enableExtraction && (
                <button
                  type="button"
                  className={`forma-ai-extract-toggle-btn ${extractionPanelOpen ? "active" : ""}`}
                  onClick={() => setExtractionPanelOpen((prev) => !prev)}
                  title="Toggle AI Extraction Panel (Week 3 Point 1)"
                >
                  <Sparkles size={14} className="sparkle-icon" />
                  <span>AI Autofill (Week 3)</span>
                  {receivedExtraction && (
                    <span className="forma-extract-received-tag">
                      <Check size={11} />
                      Response Received
                    </span>
                  )}
                  {extractionPanelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            <h1 className="forma-form-title">
              {schema.title || "Untitled Form"}
            </h1>

            {schema.description && (
              <p className="forma-form-desc">
                {schema.description}
              </p>
            )}
          </header>
        )}

        {/* WEEK 3 (POINT 1): AI EXTRACTION PANEL */}
        {enableExtraction && extractionPanelOpen && (
          <section className="forma-ai-extraction-card" aria-label="AI Extraction Panel">
            <div className="forma-ai-extract-header">
              <div className="forma-ai-extract-title-group">
                <div className="forma-ai-extract-icon-wrap">
                  <Sparkles size={18} color="#6366f1" />
                </div>
                <div>
                  <h3 className="forma-ai-extract-title">AI Data Extraction</h3>
                  <p className="forma-ai-extract-subtitle">
                    Week 3 — Point 1: Receive extraction response from AI
                  </p>
                </div>
              </div>
              <span className="forma-ai-extract-step-badge">
                Step 1 of 6: Receive Response
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="forma-ai-mode-tabs">
              <button
                type="button"
                className={`forma-ai-mode-tab ${extractionMode === "text" ? "active" : ""}`}
                onClick={() => {
                  setExtractionMode("text");
                  setExtractionError("");
                }}
              >
                <FileText size={13} />
                Extract from Text / Notes
              </button>
              <button
                type="button"
                className={`forma-ai-mode-tab ${extractionMode === "raw_json" ? "active" : ""}`}
                onClick={() => {
                  setExtractionMode("raw_json");
                  setExtractionError("");
                }}
              >
                <Code2 size={13} />
                Paste Raw JSON Response
              </button>
            </div>

            {/* Mode 1: Unstructured Text */}
            {extractionMode === "text" && (
              <div className="forma-ai-input-section">
                <div className="forma-ai-input-header">
                  <label htmlFor="ai-extraction-text" className="forma-ai-input-label">
                    Incident Description / Claim Notes / Email
                  </label>
                  <div className="forma-ai-presets">
                    <span className="forma-presets-label">Quick samples:</span>
                    <button
                      type="button"
                      className="forma-preset-chip"
                      onClick={() => handleLoadSampleText("insuranceClaim")}
                    >
                      Car Accident Claim
                    </button>
                    <button
                      type="button"
                      className="forma-preset-chip"
                      onClick={() => handleLoadSampleText("medicalClaim")}
                    >
                      Medical Claim
                    </button>
                  </div>
                </div>

                <textarea
                  id="ai-extraction-text"
                  className="forma-ai-extract-textarea"
                  rows={4}
                  value={extractionInputText}
                  onChange={(e) => setExtractionInputText(e.target.value)}
                  placeholder="e.g. On Oct 4, 2026, Jane Doe had a car accident on Main Street. Vehicle number DL01AB9876 with major bumper damage. Police report was filed, no injuries..."
                />
              </div>
            )}

            {/* Mode 2: Raw JSON Input */}
            {extractionMode === "raw_json" && (
              <div className="forma-ai-input-section">
                <div className="forma-ai-input-header">
                  <label htmlFor="ai-raw-json-text" className="forma-ai-input-label">
                    Raw Extraction Response Payload (JSON)
                  </label>
                  <button
                    type="button"
                    className="forma-preset-chip"
                    onClick={handleLoadSampleRawJson}
                  >
                    Load Sample JSON
                  </button>
                </div>

                <textarea
                  id="ai-raw-json-text"
                  className="forma-ai-extract-textarea monospace"
                  rows={5}
                  value={rawJsonInput}
                  onChange={(e) => setRawJsonInput(e.target.value)}
                  placeholder={`{\n  "success": true,\n  "extractedData": {\n    "fullName": "Jane Doe",\n    "email": "jane@example.com"\n  }\n}`}
                />
              </div>
            )}

            {/* Error alert */}
            {extractionError && (
              <div className="forma-ai-extract-error">
                <AlertCircle size={15} />
                <span>{extractionError}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="forma-ai-extract-actions">
              {(extractionInputText || rawJsonInput || receivedExtraction) && (
                <button
                  type="button"
                  className="forma-ai-clear-btn"
                  onClick={handleClearExtraction}
                  disabled={isExtracting}
                >
                  <RotateCcw size={13} />
                  Clear
                </button>
              )}

              <button
                type="button"
                className="forma-ai-extract-submit-btn"
                onClick={handleTriggerExtraction}
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={14} className="spinning" />
                    Receiving Extraction Response...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Receive Extraction Response
                  </>
                )}
              </button>
            </div>

            {/* POINT 1 SUCCESS RECEIPT CARD */}
            {receivedExtraction && (
              <div className="forma-ai-received-card">
                <div className="forma-ai-received-banner">
                  <div className="forma-ai-received-header-left">
                    <div className="forma-ai-check-icon">
                      <CheckCircle2 size={18} color="#16a34a" />
                    </div>
                    <div>
                      <strong className="forma-ai-received-title">
                        Extraction Response Received Successfully
                      </strong>
                      <div className="forma-ai-received-meta">
                        <span>Status: 200 OK</span>
                        <span>•</span>
                        <span>Source: {receivedExtraction.source}</span>
                        <span>•</span>
                        <span>
                          Received: {new Date(receivedExtraction.receivedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="forma-ai-count-chip">
                    {receivedExtraction.fieldCount} fields extracted
                  </span>
                </div>

                {/* Extracted keys list */}
                <div className="forma-ai-keys-container">
                  <span className="forma-ai-keys-title">Extracted Keys Received:</span>
                  <div className="forma-ai-keys-wrap">
                    {receivedExtraction.extractedKeys?.map((key) => (
                      <span key={key} className="forma-ai-key-pill">
                        <code>{key}</code>: {String(receivedExtraction.data[key]).slice(0, 24)}
                        {String(receivedExtraction.data[key]).length > 24 ? "..." : ""}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expandable Raw Payload View */}
                <div className="forma-ai-payload-drawer">
                  <button
                    type="button"
                    className="forma-ai-toggle-json-btn"
                    onClick={() => setShowRawJsonPayload((p) => !p)}
                  >
                    <Code2 size={13} />
                    <span>{showRawJsonPayload ? "Hide" : "Inspect"} Raw Extraction JSON</span>
                    {showRawJsonPayload ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {showRawJsonPayload && (
                    <div className="forma-ai-json-view">
                      <div className="forma-ai-json-view-header">
                        <span>Received JSON Payload ({receivedExtraction.fieldCount} keys)</span>
                        <button
                          type="button"
                          className="forma-ai-copy-json-btn"
                          onClick={handleCopyPayload}
                        >
                          {copiedPayload ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                          <span>{copiedPayload ? "Copied" : "Copy JSON"}</span>
                        </button>
                      </div>
                      <pre className="forma-ai-json-code">
                        {JSON.stringify(receivedExtraction.rawResponse || receivedExtraction.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Point 1 Completion note */}
                <div className="forma-ai-point1-footer">
                  <span className="forma-ai-status-dot"></span>
                  <span>
                    <strong>Week 3 (Point 1 Complete):</strong> Extraction response is successfully received, validated, and held in component state.
                  </span>
                </div>

                {/* =========================================================
                    WEEK 3 (POINT 2): KEY MAPPING BREAKDOWN
                    ========================================================= */}
                {mappingResult && (
                  <div className="forma-ai-mapping-section">
                    <div className="forma-ai-mapping-header">
                      <div className="forma-ai-mapping-title-group">
                        <span className="forma-ai-step2-badge">
                          Point 2: Map JSON Keys to Field Names
                        </span>
                        <div className="forma-ai-mapping-stats">
                          <span className="forma-mapping-stat-pill success">
                            {mappingResult.stats.totalMapped} / {mappingResult.stats.totalFieldsCount} Mapped ({mappingResult.stats.coveragePercentage}% Coverage)
                          </span>
                          {mappingResult.stats.unmappedKeysCount > 0 && (
                            <span className="forma-mapping-stat-pill warning">
                              {mappingResult.stats.unmappedKeysCount} Unmapped AI Key{mappingResult.stats.unmappedKeysCount === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="forma-ai-toggle-table-btn"
                        onClick={() => setShowMappingBreakdown((v) => !v)}
                      >
                        <span>{showMappingBreakdown ? "Hide" : "Inspect"} Key Mapping</span>
                        {showMappingBreakdown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>

                    {showMappingBreakdown && (
                      <div className="forma-ai-mapping-body">
                        <div className="forma-ai-mapping-table-wrap">
                          <table className="forma-ai-mapping-table">
                            <thead>
                              <tr>
                                <th>AI JSON Key</th>
                                <th>Match Type</th>
                                <th>Form Schema Field</th>
                                <th>Mapped Value Preview</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mappingResult.mappingDetails.map((item) => (
                                <tr key={item.fieldId} className="forma-mapping-row">
                                <td className="forma-mapping-json-key">
                                  <code>{item.jsonKey}</code>
                                  <span className="forma-mapping-raw-val">
                                    "{String(item.originalValue).slice(0, 24)}
                                    {String(item.originalValue).length > 24 ? "..." : ""}"
                                  </span>
                                </td>
                                <td className="forma-mapping-match-type">
                                  <span className={`forma-match-badge ${item.matchType}`}>
                                    {item.matchType === "exact" && "Exact"}
                                    {item.matchType === "normalized" && "Normalized"}
                                    {item.matchType === "alias" && "Alias"}
                                    {item.matchType === "label" && "Label"}
                                    {item.matchType === "fuzzy" && "Fuzzy"}
                                  </span>
                                </td>
                                <td className="forma-mapping-field-target">
                                  <strong>{item.fieldLabel}</strong>
                                  <span className="forma-field-meta-row">
                                    <code>{item.fieldId}</code>
                                    <span className="forma-field-type-tag">{item.fieldType}</span>
                                  </span>
                                </td>
                                <td className="forma-mapping-value-cell">
                                  <span className="forma-mapping-final-val">
                                    {String(item.mappedValue).slice(0, 32)}
                                    {String(item.mappedValue).length > 32 ? "..." : ""}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Unmapped AI Keys if any */}
                      {mappingResult.unmappedKeys.length > 0 && (
                        <div className="forma-unmapped-keys-box">
                          <span className="forma-unmapped-title">
                            Unmapped AI JSON Keys (Not in Schema):
                          </span>
                          <div className="forma-unmapped-chips">
                            {mappingResult.unmappedKeys.map((uk) => (
                              <span key={uk.key} className="forma-unmapped-chip">
                                <code>{uk.key}</code>: "{String(uk.value).slice(0, 16)}"
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Point 2 Completion Footer */}
                  <div className="forma-ai-point2-footer">
                    <span className="forma-ai-status-dot"></span>
                    <span>
                      <strong>Week 3 (Point 2 Complete):</strong> JSON keys successfully mapped to schema field names ({mappingResult.stats.totalMapped} mapped fields).
                    </span>
                  </div>

                  {/* =========================================================
                      WEEK 3 (POINT 3): USE REACT HOOK FORM setValue()
                      ========================================================= */}
                  <div className="forma-ai-setvalue-section">
                    <div className="forma-ai-setvalue-header">
                      <div className="forma-ai-setvalue-title-row">
                        <span className="forma-ai-step3-badge">
                          Point 3: React Hook Form setValue()
                        </span>
                        <span className="forma-setvalue-status-text">
                          {valuesAppliedWithSetValue
                            ? `✓ ${appliedFieldsCount} fields populated via setValue()`
                            : "Mapped values ready to apply to form"}
                        </span>
                      </div>

                      <div className="forma-setvalue-controls">
                        <label className="forma-auto-apply-label" title="Automatically call setValue() when extraction completes">
                          <input
                            type="checkbox"
                            checked={autoApplySetValue}
                            onChange={(e) => setAutoApplySetValue(e.target.checked)}
                          />
                          <span>Auto-fill via setValue()</span>
                        </label>

                        <button
                          type="button"
                          className="forma-ai-run-setvalue-btn"
                          onClick={() => handleApplyWithSetValue()}
                          title="Apply mapped values to React Hook Form inputs"
                        >
                          <Sparkles size={13} />
                          <span>{valuesAppliedWithSetValue ? "Re-apply setValue()" : "Apply to Form (setValue)"}</span>
                        </button>
                      </div>
                    </div>

                    {valuesAppliedWithSetValue && (
                      <div className="forma-setvalue-success-banner">
                        <div className="forma-setvalue-success-left">
                          <CheckCircle2 size={16} color="#16a34a" />
                          <div>
                            <strong>setValue() Executed:</strong>
                            <span> React Hook Form inputs populated with <code>shouldValidate: true</code>, <code>shouldDirty: true</code>, <code>shouldTouch: true</code>.</span>
                          </div>
                        </div>
                        <span className="forma-setvalue-count-tag">
                          {appliedFieldsCount} inputs updated
                        </span>
                      </div>
                    )}

                    {/* Point 3 Completion Footer */}
                    <div className="forma-ai-point3-footer">
                      <span className="forma-ai-status-dot"></span>
                      <span>
                        <strong>Week 3 (Point 3 Complete):</strong> React Hook Form <code>setValue()</code> successfully called for all mapped fields ({appliedFieldsCount} inputs populated). Ready for <strong>Point 4: Mark AI-filled fields</strong>.
                      </span>
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}
          </section>
        )}



        {/* FORM */}



        <form

          onSubmit={handleSubmit(

            (data) => {

              setValidationAttempted(false);

              handleFormSubmit(data);

            },

            () => {

              setValidationAttempted(true);

            }

          )}

        >

          {validationAttempted && Object.keys(errors).length > 0 && (

            <div

              style={{

                marginBottom: 20,

                padding: "12px 16px",

                borderRadius: 10,

                background: "#fef2f2",

                border: "1px solid #fecaca",

                color: "#991b1b",

                fontSize: 13.5,

                display: "flex",

                alignItems: "center",

                gap: 8,

              }}

            >

              <AlertCircle size={16} />

              <span>

                Please correct the {Object.keys(errors).length} highlighted validation error

                {Object.keys(errors).length > 1 ? "s" : ""} below before submitting.

              </span>

            </div>

          )}



          <div className="forma-fields-list">

            {flatFields.map((field) =>

              renderField(field)

            )}

          </div>



          {/* ACTIONS */}



          <div className="forma-form-actions">



            <button

              type="button"

              className="forma-reset-btn"

              onClick={handleFormReset}

              disabled={isSubmitting}

              title="Clear all fields"

            >

              <RotateCcw

                size={15}

                style={{

                  verticalAlign:

                    "middle",

                  marginRight: 6,

                }}

              />



              Reset

            </button>



            <button

              type="submit"

              className="forma-submit-btn"

              disabled={isSubmitting}

            >

              <Send size={15} />



              {isSubmitting

                ? "Submitting..."

                : "Submit Form"}

            </button>



          </div>

        </form>



        {/* ERROR */}



        {submitError && (

          <div

            style={{

              marginTop: 16,

              padding: "12px 14px",

              borderRadius: 10,

              background: "#fef2f2",

              border: "1px solid #fecaca",

              color: "#b91c1c",

              fontSize: 14,

            }}

          >

            <AlertCircle

              size={16}

              style={{

                verticalAlign:

                  "middle",

                marginRight: 6,

              }}

            />



            {submitError}

          </div>

        )}



        {/* SUCCESS */}



        {submittedData && (

          <div className="forma-submission-success">



            <div className="forma-success-header">

              <CheckCircle2 size={20} />



              <span>

                Form Submitted

                Successfully!

              </span>

            </div>



            <p

              style={{

                margin: "0 0 10px",

                fontSize: 13,

                color: "#166534",

              }}

            >

              {submitNotice || "Your submission was successfully validated and recorded."}

            </p>



            <pre className="forma-submission-data-preview">

              {JSON.stringify(

                submittedData,

                null,

                2

              )}

            </pre>



          </div>

        )}



      </div>

    </div>

  );

}



export default DynamicForm;