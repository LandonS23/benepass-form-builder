import React, { useState } from "react";
import type { FormField, FieldType } from "../types/schema";
import {
  Trash2,
  GripVertical,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ConditionalEditor } from "./ConditionalEditor";
import { ValidationEditor } from "./ValidationEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FieldEditorProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const SortableFieldItem: React.FC<{
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  allFields: FormField[];
}> = ({ field, onUpdate, onDelete, allFields }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [optionsText, setOptionsText] = useState(() =>
    field.type === "select" || field.type === "radio"
      ? field.options.map(({ label, value }) => `${label}:${value}`).join("\n")
      : ""
  );
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const hasPlaceholder =
    field.type === "text" ||
    field.type === "textarea" ||
    field.type === "number" ||
    field.type === "select" ||
    field.type === "date";

  const inputClassName =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg mb-3 shadow-sm"
    >
      <div className="flex items-center gap-2 p-3 hover:bg-gray-50">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </button>

        <div className="flex-1">
          <div className="font-medium text-gray-900">
            {field.label || "Untitled Field"}
          </div>
          <div className="text-sm text-gray-500">
            {field.type} · {field.name}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <button
          onClick={onDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded cursor-pointer"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 pt-2 space-y-3 border-t">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`label-${field.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Label
              </label>
              <input
                id={`label-${field.id}`}
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor={`name-${field.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                id={`name-${field.id}`}
                type="text"
                value={field.name}
                onChange={(e) => onUpdate({ ...field, name: e.target.value })}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor={`type-${field.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type
              </label>
              <select
                id={`type-${field.id}`}
                value={field.type}
                onChange={(e) => {
                  const newType = e.target.value as FieldType;

                  // Warn if changing from select/radio (will lose options)
                  if (
                    (field.type === "select" || field.type === "radio") &&
                    newType !== "select" &&
                    newType !== "radio"
                  ) {
                    if (
                      !confirm(
                        "Changing field type will remove all options. Continue?"
                      )
                    ) {
                      return;
                    }
                  }

                  // Reconstruct field with minimal required properties
                  const baseField = {
                    id: field.id,
                    name: field.name,
                    label: field.label,
                    type: newType,
                    helpText: field.helpText,
                    required: field.required,
                    validation: field.validation,
                    conditional: field.conditional,
                  };
                  onUpdate(baseField as FormField);
                }}
                className={inputClassName}
              >
                <option value="text">Text</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
              </select>
            </div>

            {/* Placeholder - only for text, textarea, number, select, date */}
            {hasPlaceholder && (
              <div>
                <label
                  htmlFor={`placeholder-${field.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Placeholder
                </label>
                <input
                  id={`placeholder-${field.id}`}
                  type="text"
                  value={"placeholder" in field ? field.placeholder || "" : ""}
                  onChange={(e) =>
                    onUpdate({ ...field, placeholder: e.target.value })
                  }
                  className={inputClassName}
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor={`helpText-${field.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Help Text
            </label>
            <input
              id={`helpText-${field.id}`}
              type="text"
              value={field.helpText || ""}
              onChange={(e) => onUpdate({ ...field, helpText: e.target.value })}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor={`defaultValue-${field.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Default Value
            </label>
            {field.type === "checkbox" ? (
              <div className="flex items-center">
                <input
                  id={`defaultValue-${field.id}`}
                  type="checkbox"
                  checked={field.defaultValue === true}
                  onChange={(e) =>
                    onUpdate({ ...field, defaultValue: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {field.defaultValue === true ? "Checked" : "Unchecked"}
                </span>
              </div>
            ) : field.type === "select" || field.type === "radio" ? (
              <select
                id={`defaultValue-${field.id}`}
                value={field.defaultValue?.toString() || ""}
                onChange={(e) =>
                  onUpdate({ ...field, defaultValue: e.target.value })
                }
                className={inputClassName}
              >
                <option value="">None</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`defaultValue-${field.id}`}
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "date"
                    ? "date"
                    : "text"
                }
                value={field.defaultValue?.toString() || ""}
                onChange={(e) => {
                  if (field.type === "number") {
                    const num = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    onUpdate({ ...field, defaultValue: num });
                  } else {
                    onUpdate({ ...field, defaultValue: e.target.value });
                  }
                }}
                className={inputClassName}
              />
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.required || false}
              onChange={(e) =>
                onUpdate({ ...field, required: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`required-${field.id}`}
              className="ml-2 text-sm text-gray-700"
            >
              Required field
            </label>
          </div>

          {(field.type === "select" || field.type === "radio") && (
            <div>
              <label
                htmlFor={`options-${field.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Options (one per line, format: label:value)
              </label>
              <textarea
                id={`options-${field.id}`}
                value={optionsText}
                onChange={(e) => {
                  const text = e.target.value;
                  setOptionsText(text);

                  const lines = text.split("\n");
                  const options = lines
                    .filter((line) => line.trim())
                    .map((line) => {
                      const trimmed = line.trim();
                      if (trimmed.includes(":")) {
                        const [label, ...valueParts] = trimmed.split(":");
                        const value = valueParts.join(":").trim();
                        return {
                          label: label.trim() || value || trimmed,
                          value: value || label.trim() || trimmed,
                        };
                      }
                      return { label: trimmed, value: trimmed };
                    });
                  onUpdate({ ...field, options });
                }}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Option 1:value1&#10;Option 2:value2"
              />
            </div>
          )}

          <ValidationEditor
            value={field.validation}
            onChange={(validation) => onUpdate({ ...field, validation })}
            fieldType={field.type}
          />

          <ConditionalEditor
            availableFields={allFields.filter((f) => f.id !== field.id)}
            value={field.conditional}
            onChange={(conditional) => onUpdate({ ...field, conditional })}
          />
        </div>
      )}
    </div>
  );
};

export const FieldEditor: React.FC<FieldEditorProps> = ({
  fields,
  onChange,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: "text",
      required: false,
    };
    onChange([...fields, newField]);
  };

  const updateField = (index: number, updatedField: FormField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    onChange(newFields);
  };

  const deleteField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
        <button
          onClick={addField}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          <Plus size={16} />
          Add Field
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {fields.map((field, index) => (
            <SortableFieldItem
              key={field.id}
              field={field}
              allFields={fields}
              onUpdate={(updated) => updateField(index, updated)}
              onDelete={() => deleteField(index)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {fields.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">No fields yet</p>
          <p className="text-sm">Click "Add Field" to get started</p>
        </div>
      )}
    </div>
  );
};
