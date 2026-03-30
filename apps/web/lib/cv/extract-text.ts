import pdfParse from "pdf-parse";

// Cap CV text to keep AI prompts within a reasonable token budget.
const MAX_TEXT_CHARS = 8_000;

/**
 * Extract plain text from a PDF ArrayBuffer.
 * Returns null if extraction fails — the caller should treat this as
 * "text unavailable" and fall back to profile-only AI analysis.
 */
export async function extractPdfText(buffer: ArrayBuffer): Promise<string | null> {
  try {
    const data = await pdfParse(Buffer.from(buffer));
    const text = data.text?.trim();
    if (!text) return null;
    return text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text;
  } catch {
    return null;
  }
}
