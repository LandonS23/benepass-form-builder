import React from "react";
import type { ValidationRule } from "../types/schema";
import { Plus, Trash2 } from "lucide-react";

interface ValidationEditorProps {
  value?: ValidationRule[];
  onChange: (rules: ValidationRule[] | undefined) => void;
  fieldType: string;
}

export const ValidationEditor: React.FC<ValidationEditorProps> = ({
  value = [],
  onChange,
  fieldType,
}) => {
  const inputClassName =
    "text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500";

  const addRule = () => {
    const newRule: ValidationRule = {
      type: fieldType === "number" ? "min" : "regex",
      value: "",
      message: "",
    };
    onChange([...value, newRule]);
  };

  const updateRule = (index: number, updates: Partial<ValidationRule>) => {
    const newRules = [...value];
    newRules[index] = { ...newRules[index], ...updates };
    onChange(newRules);
  };

  const deleteRule = (index: number) => {
    const newRules = value.filter((_, i) => i !== index);
    onChange(newRules.length > 0 ? newRules : undefined);
  };

  // Determine available rule types based on field type
  const getAvailableRuleTypes = () => {
    if (fieldType === "number") {
      return [
        { value: "min", label: "Minimum" },
        { value: "max", label: "Maximum" },
      ];
    } else if (
      fieldType === "text" ||
      fieldType === "textarea" ||
      fieldType === "date"
    ) {
      return [
        { value: "min", label: "Min Length" },
        { value: "max", label: "Max Length" },
        { value: "regex", label: "Regex Pattern" },
      ];
    }
    return [];
  };

  const availableTypes = getAvailableRuleTypes();

  if (availableTypes.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Validation Rules
        </label>
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition cursor-pointer"
        >
          <Plus size={14} />
          Add Rule
        </button>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((rule, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded border border-gray-200"
            >
              <div className="grid grid-cols-[1fr,1fr,auto] gap-2 mb-2">
                <select
                  value={rule.type}
                  onChange={(e) =>
                    updateRule(index, {
                      type: e.target.value as ValidationRule["type"],
                    })
                  }
                  className={inputClassName}
                >
                  {availableTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <input
                  type={
                    rule.type === "regex" ||
                    (fieldType !== "number" &&
                      rule.type !== "min" &&
                      rule.type !== "max")
                      ? "text"
                      : "number"
                  }
                  value={rule.value || ""}
                  onChange={(e) => {
                    const newValue =
                      rule.type === "regex" ||
                      fieldType === "text" ||
                      fieldType === "textarea"
                        ? e.target.value
                        : Number(e.target.value);
                    updateRule(index, { value: newValue });
                  }}
                  placeholder={
                    rule.type === "regex"
                      ? "^[A-Za-z]+$"
                      : rule.type === "min"
                      ? fieldType === "number"
                        ? "Minimum value"
                        : "Minimum length"
                      : fieldType === "number"
                      ? "Maximum value"
                      : "Maximum length"
                  }
                  className={`${inputClassName} font-mono`}
                />

                <button
                  type="button"
                  onClick={() => deleteRule(index)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                  title="Delete rule"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <input
                type="text"
                value={rule.message || ""}
                onChange={(e) => updateRule(index, { message: e.target.value })}
                placeholder="Custom error message (optional)"
                className={`w-full text-xs ${inputClassName}`}
              />
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <p className="text-xs text-gray-500 italic">
          No validation rules. Click "Add Rule" to add one.
        </p>
      )}
    </div>
  );
};
