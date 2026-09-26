// Rule engine shared by the backend (authoritative) and the React renderer (live UI).
// Pure functions only: no DB, no DOM.

export const FIELD_TYPES = ['text', 'select', 'checkbox'];

const NAME_RE = /^[A-Za-z][A-Za-z0-9_]*$/;

// ---------- showIf conditions ----------
// { field, equals | notEquals | in | notIn | gt | lt | exists }
// { all: [cond, ...] }   { any: [cond, ...] }

const LEAF_OPS = ['equals', 'notEquals', 'in', 'notIn', 'gt', 'lt', 'exists'];

export function evaluateCondition(cond, values) {
  if (!cond) return true;
  if (Array.isArray(cond.all)) return cond.all.every((c) => evaluateCondition(c, values));
  if (Array.isArray(cond.any)) return cond.any.some((c) => evaluateCondition(c, values));

  const actual = values?.[cond.field];
  if ('equals' in cond) return actual === cond.equals;
  if ('notEquals' in cond) return actual !== cond.notEquals;
  if ('in' in cond) return cond.in.includes(actual);
  if ('notIn' in cond) return !cond.notIn.includes(actual);
  if ('gt' in cond) return Number(actual) > cond.gt;
  if ('lt' in cond) return Number(actual) < cond.lt;
  if ('exists' in cond) {
    const present = actual !== undefined && actual !== null && actual !== '' && actual !== false;
    return cond.exists ? present : !present;
  }
  return false;
}

function conditionFields(cond, out = []) {
  if (!cond) return out;
  if (Array.isArray(cond.all)) cond.all.forEach((c) => conditionFields(c, out));
  else if (Array.isArray(cond.any)) cond.any.forEach((c) => conditionFields(c, out));
  else if (cond.field) out.push(cond.field);
  return out;
}

function checkLeaf(cond, path, errors) {
  if (Array.isArray(cond.all) || Array.isArray(cond.any)) {
    (cond.all || cond.any).forEach((c, i) =>
      checkLeaf(c, `${path}.${cond.all ? 'all' : 'any'}[${i}]`, errors)
    );
    return;
  }
  if (typeof cond.field !== 'string') errors.push(`${path}: condition needs a "field"`);
  if (!LEAF_OPS.some((op) => op in cond)) {
    errors.push(`${path}: condition needs one of ${LEAF_OPS.join(', ')}`);
  }
}

// ---------- form definition helpers ----------

// Flatten sections -> ordered list of fields, tagging each with its section's showIf.
export function flattenFields(form) {
  const out = [];
  for (const section of form.sections || []) {
    for (const field of section.fields || []) {
      out.push({ ...field, _sectionShowIf: section.showIf || null });
    }
  }
  return out;
}

// Structural check of a form definition. Returns an array of error strings (empty = ok).
// Enforces that showIf only references fields declared EARLIER, which rules out cycles
// and lets visibility be resolved in a single ordered pass.
export function validateFormDefinition(form) {
  const errors = [];
  if (!form || typeof form !== 'object') return ['form must be an object'];
  if (!Array.isArray(form.sections) || form.sections.length === 0) {
    return ['form needs at least one section'];
  }

  const seen = new Set();
  const sectionIds = new Set();

  form.sections.forEach((section, si) => {
    const sp = `sections[${si}]`;
    if (!section.id) errors.push(`${sp}: missing id`);
    else if (sectionIds.has(section.id)) errors.push(`${sp}: duplicate section id "${section.id}"`);
    else sectionIds.add(section.id);

    if (section.showIf) {
      checkLeaf(section.showIf, `${sp}.showIf`, errors);
      conditionFields(section.showIf).forEach((ref) => {
        if (!seen.has(ref)) errors.push(`${sp}.showIf: "${ref}" must be declared before this section`);
      });
    }

    (section.fields || []).forEach((field, fi) => {
      const fp = `${sp}.fields[${fi}]`;
      if (!NAME_RE.test(field.name || '')) {
        errors.push(`${fp}: invalid name "${field.name}" (letters, digits, underscore; must start with a letter)`);
      }
      if (!FIELD_TYPES.includes(field.type)) {
        errors.push(`${fp}: type must be one of ${FIELD_TYPES.join(', ')}`);
      }
      if (!field.label) errors.push(`${fp}: missing label`);
      if (field.type === 'select' && (!Array.isArray(field.options) || field.options.length === 0)) {
        errors.push(`${fp}: select fields need a non-empty "options" array`);
      }
      if (field.validation?.pattern) {
        try {
          new RegExp(field.validation.pattern);
        } catch {
          errors.push(`${fp}: validation.pattern is not a valid regex`);
        }
      }
      if (field.showIf) {
        checkLeaf(field.showIf, `${fp}.showIf`, errors);
        conditionFields(field.showIf).forEach((ref) => {
          if (ref === field.name) errors.push(`${fp}.showIf: a field cannot depend on itself`);
          else if (!seen.has(ref)) errors.push(`${fp}.showIf: "${ref}" must be declared before "${field.name}"`);
        });
      }
      if (field.name) {
        if (seen.has(field.name)) errors.push(`${fp}: duplicate field name "${field.name}"`);
        seen.add(field.name);
      }
    });
  });

  return errors;
}

// Resolve which fields are visible for the given values.
// A hidden field's value is ignored, so anything that depends on it hides too (cascade).
export function getVisibleFields(form, values = {}) {
  const effective = {};
  const visible = [];
  for (const field of flattenFields(form)) {
    const show =
      evaluateCondition(field._sectionShowIf, effective) && evaluateCondition(field.showIf, effective);
    if (!show) continue;
    const { _sectionShowIf, ...clean } = field;
    visible.push(clean);
    if (field.name in values) effective[field.name] = values[field.name];
  }
  return visible;
}

// ---------- submission validation ----------

const isBlank = (v) => v === undefined || v === null || v === '' || (typeof v === 'string' && !v.trim());

// Validate one field's value. Returns an error string or null.
export function validateField(field, value) {
  if (field.type === 'checkbox') {
    if (value !== undefined && typeof value !== 'boolean') return `${field.label} must be true or false`;
    if (field.required && value !== true) return `${field.label} must be checked`;
    return null;
  }

  if (isBlank(value)) return field.required ? `${field.label} is required` : null;

  if (typeof value !== 'string') return `${field.label} must be text`;

  if (field.type === 'select' && !field.options.includes(value)) {
    return `${field.label} must be one of: ${field.options.join(', ')}`;
  }

  const rules = field.validation || {};
  if (rules.minLength != null && value.length < rules.minLength) {
    return `${field.label} must be at least ${rules.minLength} characters`;
  }
  if (rules.maxLength != null && value.length > rules.maxLength) {
    return `${field.label} must be at most ${rules.maxLength} characters`;
  }
  if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
    return rules.message || `${field.label} has an invalid format`;
  }
  return null;
}

// Validate a whole submission against a form. Only visible fields are checked and kept;
// values for hidden fields are dropped so stale answers never reach storage.
export function validateSubmission(form, values = {}) {
  const errors = {};
  const cleaned = {};
  for (const field of getVisibleFields(form, values)) {
    const value = values[field.name];
    const err = validateField(field, value);
    if (err) errors[field.name] = err;
    else if (!isBlank(value) || field.type === 'checkbox') {
      cleaned[field.name] = field.type === 'checkbox' ? Boolean(value) : value;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors, values: cleaned };
}
