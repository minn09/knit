// biome-ignore lint/suspicious/noControlCharactersInRegex: control chars intentionally stripped
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const WHITESPACE = /\s+/g;

/** Texto de una sola línea: sin saltos ni caracteres de control, recortado. */
export function sanitizeLine(value: string, maxLength = 200): string {
  return value
    .normalize("NFC")
    .replace(CONTROL_CHARS, "")
    .replace(WHITESPACE, " ")
    .trim()
    .slice(0, maxLength);
}

/** Texto libre (contenido markdown): conserva saltos, elimina control. */
export function sanitizeBody(value: string, maxLength = 100_000): string {
  return value.normalize("NFC").replace(CONTROL_CHARS, "").slice(0, maxLength);
}
