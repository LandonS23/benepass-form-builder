import { useState } from "react";
import type { FormSchema } from "./types/schema";
import { FieldEditor } from "./components/FieldEditor";
import { FormRenderer } from "./components/FormRenderer";
import { Save, Upload, RotateCcw, Download, Eye, EyeOff } from "lucide-react";

const STORAGE_KEY = "form-builder-schema";

const DEFAULT_SCHEMA: FormSchema = {
  title: "My Custom Form",
  description: "Build your form by adding fields on the left",
  fields: [],
};

const loadSchema = (): FormSchema => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      console.error("Failed to load saved schema");
    }
  }
  return DEFAULT_SCHEMA;
};

function App() {
  const [schema, setSchema] = useState<FormSchema>(loadSchema);

  const [jsonView, setJsonView] = useState(false);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
    alert("Form saved successfully!");
  };

  const handleLoad = () => {
    const loaded = loadSchema();
    if (loaded !== DEFAULT_SCHEMA) {
      setSchema(loaded);
      alert("Form loaded successfully!");
    } else {
      alert("No saved form found");
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset the form? This will clear all fields."
      )
    ) {
      setSchema(DEFAULT_SCHEMA);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(schema, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const link = document.createElement("a");
    link.href = dataUri;
    link.download = "form-schema.json";
    link.click();
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setSchema(imported);
          alert("Form imported successfully!");
        } catch {
          alert("Failed to import form. Please check the JSON file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-sm text-gray-600 mt-1">
                Design, validate, and export custom forms
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer"
                title="Save to localStorage"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleLoad}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                title="Load from localStorage"
              >
                <Upload size={16} />
                Load
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                title="Reset form"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <div className="w-px h-8 bg-gray-300 mx-2" />
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
                title="Export JSON"
              >
                <Download size={16} />
                Export JSON
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition cursor-pointer"
                title="Import JSON"
              >
                <Upload size={16} />
                Import JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Form Builder */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6 space-y-3">
              <div>
                <label
                  htmlFor="form-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Form Title
                </label>
                <input
                  id="form-title"
                  type="text"
                  value={schema.title}
                  onChange={(e) =>
                    setSchema({ ...schema, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="form-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="form-description"
                  value={schema.description}
                  onChange={(e) =>
                    setSchema({ ...schema, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <FieldEditor
              fields={schema.fields}
              onChange={(fields) => setSchema({ ...schema, fields })}
            />
          </div>

          {/* Right Panel - Preview / JSON */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {jsonView ? "JSON Schema" : "Live Preview"}
              </h2>
              <button
                onClick={() => setJsonView(!jsonView)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
              >
                {jsonView ? <Eye size={16} /> : <EyeOff size={16} />}
                {jsonView ? "Show Preview" : "Show JSON"}
              </button>
            </div>

            {jsonView ? (
              <div className="bg-gray-900 rounded-lg shadow-md p-6">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  {JSON.stringify(schema, null, 2)}
                </pre>
              </div>
            ) : (
              <FormRenderer schema={schema} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
