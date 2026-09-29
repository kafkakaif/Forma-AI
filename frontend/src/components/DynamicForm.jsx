import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

function DynamicForm({ schema }) {
  const {
    register,
    handleSubmit,
    watch,
    unregister,
    formState: { errors },
  } = useForm();

  const formValues = watch();

  const shouldShowField = (field) => {
    if (!field.showIf) {
      return true;
    }

    const {
      field: dependentField,
      operator,
      value,
    } = field.showIf;

    const currentValue = formValues[dependentField];

    if (operator === "equals") {
      return currentValue === value;
    }

    if (operator === "notEmpty") {
      return (
        currentValue !== undefined &&
        currentValue !== null &&
        currentValue !== ""
      );
    }

    return true;
  };

  useEffect(() => {
    schema.fields.forEach((field) => {
      if (field.showIf && !shouldShowField(field)) {
        unregister(field.id);
      }
    });
  }, [formValues, schema.fields, unregister]);

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
  };

  const renderField = (field) => {
    if (!shouldShowField(field)) {
      return null;
    }

    const validationRules = {
      required: field.required
        ? `${field.label} is required`
        : false,

      minLength: field.minLength
        ? {
            value: field.minLength,
            message: `${field.label} must be at least ${field.minLength} characters`,
          }
        : undefined,

      pattern: field.pattern
        ? {
            value: new RegExp(field.pattern),
            message: `${field.label} format is invalid`,
          }
        : undefined,

      validate:
        field.type === "email"
          ? (value) =>
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
              "Please enter a valid email address"
          : undefined,
    };

    const commonProps = {
      ...register(field.id, validationRules),
    };

    switch (field.type) {
      case "text":
      case "email":
      case "date":
        return (
          <div className="form-group" key={field.id}>
            <label htmlFor={field.id}>
              {field.label}
              {field.required && " *"}
            </label>

            <input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              {...commonProps}
            />

            {errors[field.id] && (
              <p className="error">
                {errors[field.id].message}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="form-group" key={field.id}>
            <label htmlFor={field.id}>
              {field.label}
              {field.required && " *"}
            </label>

            <textarea
              id={field.id}
              placeholder={field.placeholder}
              {...commonProps}
            />

            {errors[field.id] && (
              <p className="error">
                {errors[field.id].message}
              </p>
            )}
          </div>
        );

      case "select":
        return (
          <div className="form-group" key={field.id}>
            <label htmlFor={field.id}>
              {field.label}
              {field.required && " *"}
            </label>

            <select id={field.id} {...commonProps}>
              <option value="">Select an option</option>

              {field.options?.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {errors[field.id] && (
              <p className="error">
                {errors[field.id].message}
              </p>
            )}
          </div>
        );

      case "radio":
        return (
          <div className="form-group" key={field.id}>
            <label>
              {field.label}
              {field.required && " *"}
            </label>

            {field.options?.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  value={option.value}
                  {...register(field.id, {
                    required: field.required
                      ? `${field.label} is required`
                      : false,
                  })}
                />

                {option.label}
              </label>
            ))}

            {errors[field.id] && (
              <p className="error">
                {errors[field.id].message}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>{schema.title}</h2>

      <p>{schema.description}</p>

      {schema.fields.map((field) =>
        renderField(field)
      )}

      <button type="submit">
        Submit Claim
      </button>
    </form>
  );
}

export default DynamicForm;