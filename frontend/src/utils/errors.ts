type ApiErrorData = Record<string, string | string[] | Record<string, string[]>[]>;

/** Convert a snake_case field name to a readable label, e.g. "invoice_number" → "Invoice number" */
function fieldLabel(field: string): string {
  return field.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Parse a DRF validation error response into a single user-friendly string.
 * Works for field errors, non_field_errors, and detail strings.
 */
export function parseApiError(data: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!data || typeof data !== 'object') return fallback;

  const errorData = data as ApiErrorData;

  // Plain detail string e.g. { detail: "Not found." }
  if (typeof errorData.detail === 'string') return errorData.detail;

  const messages: string[] = [];

  for (const [field, value] of Object.entries(errorData)) {
    const errors = Array.isArray(value) ? value : [value];
    for (const err of errors) {
      if (typeof err === 'string') {
        if (field === 'non_field_errors') {
          messages.push(err);
        } else {
          messages.push(`${fieldLabel(field)}: ${err}`);
        }
      }
    }
  }

  return messages.length > 0 ? messages.join(' ') : fallback;
}
