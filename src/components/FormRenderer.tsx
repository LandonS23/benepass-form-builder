import React, { useState, useEffect } from "react";
import type { FormSchema, FormField } from "../types/schema";
import { z } from "zod";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface FormRendererProps {
  schema: FormSchema;
}

// Mock submission function
const submitForm = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Random success/failure (70% success rate)
  const success = Math.random() > 0.3;

  return {
    success,
    message: success
      ? "Form submitted successfully!"
      : "Submission failed. Please try again.",
  };
};

// Helper function to build Zod schema from FormField
const buildZodSchema = (field: FormField) => {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "number":
      schema = z.coerce.number({
        message: `${field.label} must be a number`,
      });

      // Apply min/max validations
      field.validation?.forEach((rule) => {
        if (rule.type === "min" && typeof rule.value === "number") {
          schema = (schema as z.ZodNumber).min(
            rule.value,
            rule.message || `Minimum value is ${rule.value}`
          );
        }
        if (rule.type === "max" && typeof rule.value === "number") {
          schema = (schema as z.ZodNumber).max(
            rule.value,
            rule.message || `Maximum value is ${rule.value}`
          );
        }
      });
      break;

    case "checkbox":
      schema = z.boolean();
      break;

    case "date":
      schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");
      break;

    default:
      schema = z.string();

      // Apply regex validation
      field.validation?.forEach((rule) => {
        if (rule.type === "regex" && typeof rule.value === "string") {
          schema = (schema as z.ZodString).regex(
            new RegExp(rule.value),
            rule.message || "Invalid format"
          );
        }
        if (rule.type === "min" && typeof rule.value === "number") {
          schema = (schema as z.ZodString).min(
            rule.value,
            rule.message || `Minimum length is ${rule.value}`
          );
        }
        if (rule.type === "max" && typeof rule.value === "number") {
          schema = (schema as z.ZodString).max(
            rule.value,
            rule.message || `Maximum length is ${rule.value}`
          );
        }
      });
  }

  // Handle required fields
  if (field.required) {
    if (field.type === "checkbox") {
      schema = (schema as z.ZodBoolean).refine((val) => val === true, {
        message: `${field.label} is required`,
      });
    } else {
      schema = (schema as z.ZodString | z.ZodNumber).refine(
        (val) => val !== "" && val !== null && val !== undefined,
        { message: `${field.label} is required` }
      );
    }
  } else {
    schema = schema.optional();
  }

  return schema;
};

// Helper to get default form values from schema
const getDefaultValues = (fields: FormField[]): Record<string, unknown> => {
  const values: Record<string, unknown> = {};
  fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue;
    }
  });
  return values;
};

export const FormRenderer: React.FC<FormRendererProps> = ({ schema }) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(() =>
    getDefaultValues(schema.fields)
  );

  // Update form data when schema changes (e.g., defaultValue updates)
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      ...getDefaultValues(schema.fields),
    }));
  }, [schema]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Check if field should be visible based on conditional rules
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditional) return true;

    const { field: targetField, operator, value } = field.conditional;
    const targetValue = formData[targetField];

    switch (operator) {
      case "equals":
        return targetValue === value;
      case "notEquals":
        return targetValue !== value;
      case "contains":
        return String(targetValue || "").includes(String(value));
      case "greaterThan":
        return Number(targetValue) > Number(value);
      case "lessThan":
        return Number(targetValue) < Number(value);
      default:
        return true;
    }
  };

  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = errors;
      setErrors(rest);
    }
    setSubmitResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult(null);

    // Build validation schema
    const schemaShape: Record<string, z.ZodTypeAny> = {};
    schema.fields.forEach((field) => {
      if (isFieldVisible(field)) {
        schemaShape[field.name] = buildZodSchema(field);
      }
    });

    const validationSchema = z.object(schemaShape);

    // Validate
    try {
      validationSchema.parse(formData);
      setErrors({});

      // Submit
      setIsSubmitting(true);
      const result = await submitForm();
      setSubmitResult(result);

      if (result.success) {
        // Reset form on success
        setFormData(getDefaultValues(schema.fields));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const value = formData[field.name] ?? "";
    const error = errors[field.name];

    const getInputClasses = (hasError: boolean) =>
      `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        hasError ? "border-red-500" : "border-gray-300"
      }`;

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.id} className="mb-4">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={field.name}
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={getInputClasses(!!error)}
            />
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="mb-4">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={field.name}
              type="number"
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={getInputClasses(!!error)}
            />
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="mb-4">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={field.name}
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={getInputClasses(!!error)}
            >
              <option value="">Select an option</option>
              {field.options?.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="radio"
                    id={`${field.name}-${idx}`}
                    name={field.name}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor={`${field.name}-${idx}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={field.name}
                checked={!!value}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={field.name}
                className="ml-2 text-sm text-gray-700"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            </div>
            {field.helpText && (
              <p className="mt-1 ml-6 text-sm text-gray-500">
                {field.helpText}
              </p>
            )}
            {error && <p className="mt-1 ml-6 text-sm text-red-600">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="mb-4">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={field.name}
              type="date"
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={getInputClasses(!!error)}
            />
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      default: // text
        return (
          <div key={field.id} className="mb-4">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={field.name}
              type="text"
              value={String(value)}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={getInputClasses(!!error)}
            />
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{schema.title}</h2>
        {schema.description && (
          <p className="mt-1 text-gray-600">{schema.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {schema.fields.map(renderField)}

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>

          {submitResult && (
            <div
              className={`flex items-center gap-2 ${
                submitResult.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {submitResult.success ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span className="font-medium">{submitResult.message}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
