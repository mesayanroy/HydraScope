export function sanitizeUntrustedMetadata(input?: string): string {
  if (!input) return "";

  // Strip system prompt injection attempts, hidden markdown directives, or control instructions
  let clean = input
    .replace(/\[\s*(?:system|user|assistant|instruction|override)\s*:.*?\]/gi, "[REDACTED_METADATA_INSTRUCTION]")
    .replace(/(?:ignore|forget|override|bypass)\s+(?:previous|all|system)\s+instructions?/gi, "[REDACTED_INJECTION_ATTEMPT]")
    .replace(/system\s*:\s*/gi, "metadata: ")
    .replace(/```[\s\S]*?```/g, "[CODE_BLOCK_REDACTED]");

  // Truncate to reasonable length to prevent context flooding
  if (clean.length > 500) {
    clean = clean.slice(0, 500) + "... (truncated)";
  }

  return clean;
}
