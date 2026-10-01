import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, Sparkles, Send, RotateCcw } from "lucide-react";
import "./DynamicForm.css";

/**
 * Robust condition evaluator matching backend shared/rules.js
 */
export function evaluateConditionRule(cond, values) {
  if (!cond) return true;

  // Multi-rule compound: ALL (AND)
  const allList = cond.all || (cond.operator === "and" && cond.conditions);
  if (Array.isArray(allList) && allList.length > 0) {
    return allList.every((c) => evaluateConditionRule(c, values));
  }

  // Multi-rule compound: ANY (OR)
  const anyList = cond.any || (cond.operator === "or" && cond.conditions);
  if (Array.isArray(anyList) && anyList.length > 0) {
    return anyList.some((c) => evaluateConditionRule(c, values));
  }

  const depField = cond.field || cond.dependentField;
  if (!depField) return true;

  const actual = values?.[depField];
  const op = cond.operator || (
    "equals" in cond ? "equals" :
    "notEquals" in cond ? "notEquals" :
    "in" in cond ? "in" :
    "gt" in cond ? "gt" :
    "lt" in cond ? "lt" :
    "exists" in cond ? "exists" : "equals"
  );
  const target = cond.value !== undefined ? cond.value : cond[op];

  switch (op) {
    case "equals":
      return String(actual ?? "").toLowerCase() === String(target ?? "").toLowerCase();
    case "notEquals":
      return String(actual ?? "").toLowerCase() !== String(target ?? "").toLowerCase();
    case "in":
    case "contains":
      if (Array.isArray(target)) {
        return target.some((t) => String(t).toLowerCase() === String(actual ?? "").toLowerCase());
      }
      return String(target || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .includes(String(actual ?? "").toLowerCase());
    case "notIn":
      if (Array.isArray(target)) {
        return !target.some((t) => String(t).toLowerCase() === String(actual ?? "").toLowerCase());
      }
      return !String(target || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .includes(String(actual ?? "").toLowerCase());
    case "gt":
      return Number(actual) > Number(target);
    case "lt":
      return Number(actual) < Number(target);
    case "notEmpty":
    case "exists":
      return actual !== undefined && actual !== null && actual !== "" && actual !== false;
    case "empty":
      return actual === undefined || actual === null || actual === "" || actual === false;
    default:
      return true;
  }
}

function DynamicForm({ schema, onSubmitSuccess, showHeader = true }) {
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize fields: support both flat schema.fields and schema.sections
  const flatFields = useMemo(() => {
    if (!schema) return [];
    if (Array.isArray(schema.fields) && schema.fields.length > 0) {
      return schema.fields;
    }
    if (Array.isArray(schema.sections) && schema.sections.length > 0) {
      const out = [];
      schema.sections.forEach((sec) => {
        (sec.fields || []).forEach((f) => {
          out.push({
            ...f,
            id: f.id || f.name,
            showIf: f.showIf || sec.showIf || null,
          });
        });
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

  // Cascade visibility checker
  const isFieldVisible = useCallback(
    (field, values) => {
      if (!field.showIf) return true;

      // Extract referenced fields
      const depField = field.showIf.field || field.showIf.dependentField;
      if (depField) {
        const parent = flatFields.find((f) => (f.id || f.name) === depField);
        if (parent && !isFieldVisible(parent, values)) {
          return false;
        }
      }

      return evaluateConditionRule(field.showIf, values);
    },
    [flatFields]
  );

  // Unregister fields that are hidden by conditional logic
  useEffect(() => {
    flatFields.forEach((field) => {
      const fieldKey = field.id || field.name;
      if (field.showIf && !isFieldVisible(field, formValues)) {
        unregister(fieldKey);
      }
    });
  }, [formValues, flatFields, isFieldVisible, unregister]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    // Keep only currently visible fields
    const cleanData = {};
    flatFields.forEach((f) => {
      const k = f.id || f.name;
      if (isFieldVisible(f, data) && data[k] !== undefined) {
        cleanData[k] = data[k];
      }
    });

    console.log("Forma AI Dynamic Form Submitted:", cleanData);
    setSubmittedData(cleanData);
    setIsSubmitting(false);

    if (onSubmitSuccess) {
      onSubmitSuccess(cleanData);
    }
  };

  const handleFormReset = () => {
    reset();
    setSubmittedData(null);
  };

  if (!schema || flatFields.length === 0) {
    return (
      <div className="forma-dynamic-card">
        <div style={{ textAlign: "center", padding: "30px 20px" }}>
          <AlertCircle size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: "0 0 6px", color: "#1e293b" }}>No fields available</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
            This form has no active fields defined yet.
          </p>
        </div>
      </div>
    );
  }

  const renderField = (field) => {
    const fieldKey = field.id || field.name;
    const isVisible = isFieldVisible(field, formValues);
    if (!isVisible) return null;

    // Build validation rules for react-hook-form
    const validationRules = {
      required: field.required
        ? (field.validation?.requiredMessage || `${field.label || "This field"} is required`)
        : false,

      minLength: (field.minLength || field.validation?.minLength)
        ? {
            value: Number(field.minLength || field.validation?.minLength),
            message:
              field.validation?.minLengthMessage ||
              `${field.label || "Field"} must be at least ${field.minLength || field.validation?.minLength} characters`,
          }
        : undefined,

      maxLength: (field.maxLength || field.validation?.maxLength)
        ? {
            value: Number(field.maxLength || field.validation?.maxLength),
            message:
              field.validation?.maxLengthMessage ||
              `${field.label || "Field"} cannot exceed ${field.maxLength || field.validation?.maxLength} characters`,
          }
        : undefined,

      min: (field.min || field.validation?.min) !== undefined && field.type === "number"
        ? {
            value: Number(field.min || field.validation?.min),
            message:
              field.validation?.minMessage ||
              `${field.label || "Field"} must be at least ${field.min || field.validation?.min}`,
          }
        : undefined,

      max: (field.max || field.validation?.max) !== undefined && field.type === "number"
        ? {
            value: Number(field.max || field.validation?.max),
            message:
              field.validation?.maxMessage ||
              `${field.label || "Field"} cannot exceed ${field.max || field.validation?.max}`,
          }
        : undefined,

      pattern: (field.pattern || field.validation?.pattern)
        ? {
            value: new RegExp(field.pattern || field.validation?.pattern),
            message: field.validation?.message || `${field.label || "Field"} format is invalid`,
          }
        : undefined,

      validate: {
        ...(field.type === "email"
          ? {
              validEmail: (val) =>
                !val ||
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
                "Please enter a valid email address",
            }
          : {}),
        ...(field.type === "number" && field.validation?.integerOnly
          ? {
              isInteger: (val) =>
                !val ||
                Number.isInteger(Number(val)) ||
                `${field.label || "Field"} must be a whole integer`,
            }
          : {}),
      },
    };

    const hasError = Boolean(errors[fieldKey]);
    const normalizedOptions = Array.isArray(field.options)
      ? field.options.map((opt) =>
          typeof opt === "string" ? { label: opt, value: opt } : opt
        )
      : [];

    return (
      <div className="forma-form-group" key={fieldKey}>
        <div className="forma-form-label">
          <span>
            {field.label}
            {field.required && <span className="required-star">*</span>}
            {field.showIf && (
              <span className="forma-logic-tag" title="Conditional logic active">
                conditional
              </span>
            )}
          </span>
          <span className="field-type-pill">{field.type}</span>
        </div>

        {field.helpText && <p className="forma-form-help">{field.helpText}</p>}

        {/* FIELD TYPE SWITCH */}
        {(() => {
          switch (field.type) {
            case "textarea":
              return (
                <textarea
                  id={fieldKey}
                  placeholder={field.placeholder || `Enter ${field.label?.toLowerCase() || "details"}...`}
                  className={`forma-textarea ${hasError ? "has-error" : ""}`}
                  {...register(fieldKey, validationRules)}
                />
              );

            case "select":
              return (
                <select
                  id={fieldKey}
                  className={`forma-select ${hasError ? "has-error" : ""}`}
                  {...register(fieldKey, validationRules)}
                >
                  <option value="">{field.placeholder || "Select an option..."}</option>
                  {normalizedOptions.map((opt, i) => (
                    <option key={opt.value || i} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              );

            case "radio":
              return (
                <div className="forma-radio-group">
                  {normalizedOptions.map((opt, i) => {
                    const isSelected = String(formValues[fieldKey]) === String(opt.value);
                    return (
                      <label
                        key={opt.value || i}
                        className={`forma-radio-card ${isSelected ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          {...register(fieldKey, validationRules)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              );

            case "checkbox":
              return (
                <label className={`forma-checkbox-card ${formValues[fieldKey] ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    {...register(fieldKey, {
                      required: field.required
                        ? `${field.label || "This"} must be checked`
                        : false,
                    })}
                  />
                  <div className="forma-checkbox-label-text">
                    <strong>{field.placeholder || field.label}</strong>
                    {field.description && <span>{field.description}</span>}
                  </div>
                </label>
              );

            case "number":
              return (
                <input
                  id={fieldKey}
                  type="number"
                  step={field.validation?.integerOnly ? "1" : "any"}
                  placeholder={field.placeholder || "Enter number..."}
                  className={`forma-input ${hasError ? "has-error" : ""}`}
                  {...register(fieldKey, validationRules)}
                />
              );

            case "date":
              return (
                <input
                  id={fieldKey}
                  type="date"
                  className={`forma-input ${hasError ? "has-error" : ""}`}
                  {...register(fieldKey, validationRules)}
                />
              );

            case "email":
              return (
                <input
                  id={fieldKey}
                  type="email"
                  placeholder={field.placeholder || "name@example.com"}
                  className={`forma-input ${hasError ? "has-error" : ""}`}
                  {...register(fieldKey, validationRules)}
                />
              );

            case "text":
            default:
              return (
                <input
                  id={fieldKey}
                  type="text"
                  placeholder={field.placeholder || `Enter ${field.label?.toLowerCase() || ""}...`}
                  className={`forma-input ${hasError ? "has-error" : ""}`}
                  {...register(fieldKey, validationRules)}
                />
              );
          }
        })()}

        {hasError && (
          <div className="forma-field-error">
            <AlertCircle size={14} />
            <span>{errors[fieldKey]?.message}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="forma-dynamic-container">
      <div className="forma-dynamic-card">
        {showHeader && (
          <header className="forma-form-header">
            <div className="forma-header-meta">
              <span className="forma-header-badge">
                <Sparkles size={12} />
                Live Dynamic Form
              </span>
              <span className="forma-header-count">
                {flatFields.length} field{flatFields.length === 1 ? "" : "s"}
              </span>
            </div>

            <h1 className="forma-form-title">{schema.title || "Untitled Form"}</h1>
            {schema.description && <p className="forma-form-desc">{schema.description}</p>}
          </header>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="forma-fields-list">
            {flatFields.map((field) => renderField(field))}
          </div>

          <div className="forma-form-actions">
            <button
              type="button"
              className="forma-reset-btn"
              onClick={handleFormReset}
              title="Clear all fields"
            >
              <RotateCcw size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
              Reset
            </button>

            <button type="submit" className="forma-submit-btn" disabled={isSubmitting}>
              <Send size={15} />
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </button>
          </div>
        </form>

        {submittedData && (
          <div className="forma-submission-success">
            <div className="forma-success-header">
              <CheckCircle2 size={20} />
              <span>Form Submitted Successfully!</span>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "#166534" }}>
              All conditional rules and field validations passed. Form submission data payload:
            </p>
            <pre className="forma-submission-data-preview">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default DynamicForm;