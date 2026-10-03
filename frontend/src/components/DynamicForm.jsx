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
} from "lucide-react";

import { evaluateConditionRule } from "../utils/conditionEvaluator";
import "./DynamicForm.css";

function DynamicForm({
  schema,
  onSubmitSuccess,
  showHeader = true,
}) {
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

  const {
    register,
    handleSubmit,
    watch,
    unregister,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  const formValues = watch();

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
                    "name@example.com"
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

            <div className="forma-header-meta">

              <span className="forma-header-badge">
                <Sparkles size={12} />
                Live Dynamic Form
              </span>

              <span className="forma-header-count">
                {flatFields.length} field
                {flatFields.length === 1
                  ? ""
                  : "s"}
              </span>

            </div>

            <h1 className="forma-form-title">
              {schema.title ||
                "Untitled Form"}
            </h1>

            {schema.description && (
              <p className="forma-form-desc">
                {schema.description}
              </p>
            )}

          </header>
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