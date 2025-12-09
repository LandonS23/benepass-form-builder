/**
 * Field types supported by the form builder
 */
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

/**
 * Validation rule for form fields
 * - required: Field must have a value
 * - min: Minimum value (number) or length (string)
 * - max: Maximum value (number) or length (string)
 * - regex: Pattern matching for text fields
 * - custom: Custom validation logic
 */
export interface ValidationRule {
  type: "required" | "min" | "max" | "regex" | "custom";
  value?: string | number;
  message?: string;
}

/**
 * Conditional visibility rule for showing/hiding fields
 */
export interface ConditionalRule {
  /** Name of the field to check */
  field: string;
  /** Comparison operator */
  operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
  /** Value to compare against */
  value: string | number | boolean;
}

/**
 * Option for select and radio fields
 */
export interface FieldOption {
  label: string;
  value: string;
}

/**
 * Base properties shared by all form fields
 */
interface BaseFormField {
  /** Unique identifier for the field */
  id: string;
  /** Field name (used as form data key) */
  name: string;
  /** Display label for the field */
  label: string;
  /** Help text displayed below the field */
  helpText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Validation rules for the field */
  validation?: ValidationRule[];
  /** Conditional visibility rule */
  conditional?: ConditionalRule;
}

/**
 * Text input field
 */
export interface TextFormField extends BaseFormField {
  type: "text";
  placeholder?: string;
  defaultValue?: string;
}

/**
 * Textarea field for multi-line text
 */
export interface TextareaFormField extends BaseFormField {
  type: "textarea";
  placeholder?: string;
  defaultValue?: string;
}

/**
 * Number input field
 */
export interface NumberFormField extends BaseFormField {
  type: "number";
  placeholder?: string;
  defaultValue?: number;
}

/**
 * Select dropdown field (requires options)
 */
export interface SelectFormField extends BaseFormField {
  type: "select";
  placeholder?: string;
  defaultValue?: string;
  options: FieldOption[];
}

/**
 * Radio button group field (requires options)
 */
export interface RadioFormField extends BaseFormField {
  type: "radio";
  defaultValue?: string;
  options: FieldOption[];
}

/**
 * Checkbox field
 */
export interface CheckboxFormField extends BaseFormField {
  type: "checkbox";
  defaultValue?: boolean;
}

/**
 * Date input field
 */
export interface DateFormField extends BaseFormField {
  type: "date";
  placeholder?: string;
  defaultValue?: string;
}

/**
 * Discriminated union of all form field types
 * Use the `type` property to narrow to specific field type
 */
export type FormField =
  | TextFormField
  | TextareaFormField
  | NumberFormField
  | SelectFormField
  | RadioFormField
  | CheckboxFormField
  | DateFormField;

/**
 * Complete form schema definition
 */
export interface FormSchema {
  /** Form title displayed at the top */
  title: string;
  /** Optional form description */
  description?: string;
  /** Array of form fields */
  fields: FormField[];
}
