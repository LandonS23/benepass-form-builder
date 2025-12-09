# Quick Reference Guide

## Getting Started

```bash
npm install
npm run dev
```

Visit: <http://localhost:5173/form-builder/>

## Project Structure

```text
.
├── src/
│   ├── types/schema.ts              # TypeScript interfaces
│   ├── components/
│   │   ├── FieldEditor.tsx          # Main builder interface
│   │   ├── ConditionalEditor.tsx    # Conditional visibility UI
│   │   ├── ValidationEditor.tsx     # Validation rules UI
│   │   └── FormRenderer.tsx         # Live form preview
│   ├── App.tsx                      # Main app component
│   └── index.css                    # Tailwind styles
├── sample-form.json                 # Example form schema
├── advanced-validation-example.json # Validation examples
├── README.md                        # Full documentation
├── DEPLOYMENT.md                    # Deployment guide
└── PROJECT_SUMMARY.md               # Completion summary
```

## Key Features

| Feature       | Description                                     |
| ------------- | ----------------------------------------------- |
| **Add Field** | Blue button top-right of builder panel          |
| **Reorder**   | Drag the grip icon (☰) on each field            |
| **Configure** | Click chevron to expand/collapse field settings |
| **Delete**    | Red trash icon on each field                    |
| **Save**      | Green "Save" button (saves to localStorage)     |
| **Load**      | Blue "Load" button (restores from localStorage) |
| **Reset**     | Red "Reset" button (clears everything)          |
| **Export**    | Indigo "Export JSON" button (downloads file)    |
| **Import**    | Teal "Import JSON" button (uploads file)        |
| **Preview**   | Right panel shows live form                     |
| **JSON View** | Toggle button to see/edit raw JSON              |

## Field Types

| Type       | Use Case         | Special Config                 |
| ---------- | ---------------- | ------------------------------ |
| `text`     | Single-line text | Placeholder, regex validation  |
| `textarea` | Multi-line text  | Placeholder, min/max length    |
| `number`   | Numeric input    | Min/max value validation       |
| `select`   | Dropdown menu    | Options (label:value per line) |
| `radio`    | Single choice    | Options (label:value per line) |
| `checkbox` | Boolean toggle   | Default value (true/false)     |
| `date`     | Date picker      | Native HTML5 picker            |

## Validation Rules

Add validation in expanded field editor:

### Built-in Rules

- **Required**: Checkbox at bottom of field config
- **Min/Max**: For numbers (value range) or text (length)
- **Regex**: Pattern matching for custom formats

### Examples

```json
// Email validation
{
  "type": "regex",
  "value": "^[^@]+@[^@]+\\.[^@]+$",
  "message": "Please enter a valid email"
}

// Phone number
{
  "type": "regex",
  "value": "^\\d{3}-\\d{3}-\\d{4}$",
  "message": "Format: XXX-XXX-XXXX"
}

// Age range
{
  "type": "min",
  "value": 18,
  "message": "Must be 18 or older"
}
```

## Conditional Visibility

In expanded field editor, scroll to "Conditional Visibility":

1. Click "Disabled" to enable
2. Select field to watch
3. Choose operator (equals, notEquals, etc.)
4. Enter comparison value

**Example**: Show "State" only if "Country" equals "US"

## Options for Select/Radio

In expanded field editor, enter options one per line:

```text
Label 1:value1
Label 2:value2
Label 3:value3
```

**Example**:

```text
United States:US
Canada:CA
Mexico:MX
```

## JSON Schema Format

```json
{
  "title": "Form Title",
  "description": "Optional description",
  "fields": [
    {
      "id": "unique-id",
      "name": "fieldName",
      "label": "Field Label",
      "type": "text",
      "placeholder": "Hint text",
      "helpText": "Additional guidance",
      "required": true,
      "defaultValue": "preset value",
      "validation": [...],
      "conditional": {...},
      "options": [...]
    }
  ]
}
```

## Common Tasks

### Create a Contact Form

1. Add "Name" (text, required)
2. Add "Email" (text, required, regex validation)
3. Add "Subject" (select with options)
4. Add "Message" (textarea, required)
5. Add "Terms" (checkbox, required)
6. Save and test

### Add Email Validation

1. Expand email field
2. Scroll to "Validation Rules" section
3. Click "Add Rule" button
4. Select "Regex Pattern" type
5. Enter: `^[^@]+@[^@]+\.[^@]+$`
6. Add custom error message (optional)
7. Test in live preview

### Create Conditional Field

1. Add parent field (e.g., "Country" select)
2. Add child field (e.g., "State" text)
3. Expand child field
4. Enable Conditional Visibility
5. Set: field="country", operator="equals", value="US"

### Import Sample Form

1. Click "Import JSON"
2. Select `sample-form.json`
3. Explore the employee benefits form
4. Modify as needed

## Keyboard Shortcuts

Currently none implemented. Future additions:

- Cmd/Ctrl + S: Save
- Cmd/Ctrl + Z: Undo
- Cmd/Ctrl + Shift + Z: Redo
- Delete: Remove selected field

## Testing the Form

1. Add fields in left panel
2. View live preview in right panel
3. Fill out form fields
4. Leave required fields empty (see validation)
5. Click Submit
6. Wait 1 second (loading spinner)
7. See success ✓ or error ✗ message
8. On success, form resets

## Tips & Tricks

### Best Practices

- Use descriptive field names (camelCase)
- Add help text for complex fields
- Test validation before saving
- Export JSON as backup
- Use sample forms as templates

### Performance

- Avoid 100+ fields in one form
- Use conditional visibility to reduce visible fields
- Export/import JSON for large forms rather than rebuilding

### Common Mistakes

- Forgetting to mark fields as required
- Not testing form submission
- Using spaces in field names (use camelCase)
- Not providing options for select/radio fields

## Troubleshooting

### Form doesn't save

- Check browser localStorage isn't full
- Try exporting JSON instead
- Check console for errors

### Validation not working

- Ensure field is marked required
- Check regex syntax (use double backslashes)
- Test in live preview

### Conditional field not showing

- Verify parent field name matches exactly
- Check operator is correct (equals vs contains)
- Ensure value matches expected format

### Import fails

- Verify JSON is valid (use JSONLint.com)
- Check file has .json extension
- Ensure schema follows correct format

## Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

## API Reference (Future)

When backend is added:

```typescript
// Save form
POST /api/forms
Body: { title, description, fields }

// Load forms
GET /api/forms

// Update form
PUT /api/forms/:id

// Delete form
DELETE /api/forms/:id

// Submit form
POST /api/submissions
Body: { formId, data }
```

## Resources

- [README.md](./README.md) - Full documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - How to deploy
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - What was built
- [Zod Documentation](https://zod.dev) - Validation library
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [dnd-kit](https://dndkit.com) - Drag-and-drop library

## Support

For questions or issues:

1. Check documentation files
2. Review sample JSON files
3. Test in live preview
4. Check browser console for errors

---

## Quick Links

- Local Dev: <http://localhost:5173/form-builder/>
- Start: `npm run dev`
- Build: `npm run build`
- Deploy: See DEPLOYMENT.md
