/** Minimal RFC 4180 CSV serialisation. */

// A leading '=', '+', '-', '@', tab, or CR is interpreted as a formula by
// Excel/Sheets when the file is opened — the classic "CSV injection" vector.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  // Only free-text fields can carry attacker-controlled content; numbers
  // (amounts, quantities) are never raw user input, so leave them as
  // plain numerals rather than prefixing and turning them into text cells.
  if (typeof value === "string" && FORMULA_TRIGGER.test(text)) {
    text = `'${text}`;
  }
  // Quote when the cell contains a delimiter, quote, or line break.
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // \r\n line endings + BOM so Excel opens it with correct encoding.
  return `﻿${lines.join("\r\n")}\r\n`;
}
