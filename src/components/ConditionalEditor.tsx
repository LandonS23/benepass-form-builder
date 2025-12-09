import React from "react";
import type { ConditionalRule, FormField } from "../types/schema";

interface ConditionalEditorProps {
  availableFields: FormField[];
  value?: ConditionalRule;
  onChange: (rule: ConditionalRule | undefined) => void;
}

export const ConditionalEditor: React.FC<ConditionalEditorProps> = ({
  availableFields,
  value,
  onChange,
}) => {
  const isEnabled = !!value;

  const handleToggle = () => {
    onChange(
      isEnabled
        ? undefined
        : {
            field: availableFields[0]?.name || "",
            operator: "equals",
            value: "",
          }
    );
  };

  const selectedField = availableFields.find((f) => f.name === value?.field);
  const isCheckboxField = selectedField?.type === "checkbox";
  const isNumberField = selectedField?.type === "number";
  const isSelectOrRadio =
    selectedField?.type === "select" || selectedField?.type === "radio";
  const isDateField = selectedField?.type === "date";
  const isTextField =
    selectedField?.type === "text" || selectedField?.type === "textarea";

  return (
    <div className="border-t pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">
          Conditional Visibility
        </label>
        <button
          type="button"
          onClick={handleToggle}
          className={`px-3 py-1 text-xs rounded cursor-pointer ${
            isEnabled
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>

      {isEnabled && value && (
        <div className="space-y-2 p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-600 mb-2">
            Show this field only when:
          </div>

          <div className="grid grid-cols-3 gap-2">
            <select
              value={value.field}
              onChange={(e) => onChange({ ...value, field: e.target.value })}
              className="text-sm px-2 py-1 border border-gray-300 rounded"
            >
              <option value="">Select field</option>
              {availableFields.map((field) => (
                <option key={field.name} value={field.name}>
                  {field.label}
                </option>
              ))}
            </select>

            <select
              value={value.operator}
              onChange={(e) =>
                onChange({
                  ...value,
                  operator: e.target.value as ConditionalRule["operator"],
                })
              }
              className="text-sm px-2 py-1 border border-gray-300 rounded"
            >
              <option value="equals">equals</option>
              <option value="notEquals">not equals</option>
              {isTextField && <option value="contains">contains</option>}
              {(isNumberField || isDateField) && (
                <>
                  <option value="greaterThan">greater than</option>
                  <option value="lessThan">less than</option>
                </>
              )}
            </select>

            {isCheckboxField ? (
              <select
                value={String(value.value)}
                onChange={(e) =>
                  onChange({ ...value, value: e.target.value === "true" })
                }
                className="text-sm px-2 py-1 border border-gray-300 rounded"
              >
                <option value="true">Checked</option>
                <option value="false">Unchecked</option>
              </select>
            ) : isSelectOrRadio && selectedField ? (
              <select
                value={String(value.value)}
                onChange={(e) => onChange({ ...value, value: e.target.value })}
                className="text-sm px-2 py-1 border border-gray-300 rounded"
              >
                <option value="">Select value</option>
                {(selectedField.type === "select" ||
                  selectedField.type === "radio") &&
                  selectedField.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                type={isNumberField ? "number" : isDateField ? "date" : "text"}
                value={String(value.value)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    value: isNumberField
                      ? Number(e.target.value)
                      : e.target.value,
                  })
                }
                placeholder="Value"
                className="text-sm px-2 py-1 border border-gray-300 rounded"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
