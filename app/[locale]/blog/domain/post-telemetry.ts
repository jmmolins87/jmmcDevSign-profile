import type { PostTelemetry } from "./post-types";

const WORDS_PER_READING_MINUTE = 200;

export function calculatePostTelemetry(bodyMarkdown: string): PostTelemetry {
  const words = bodyMarkdown.trim() ? bodyMarkdown.trim().split(/\s+/u) : [];
  const wordCount = words.length;

  return {
    wordCount,
    readingMinutes: wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / WORDS_PER_READING_MINUTE)),
    technicalLevel: "advanced",
  };
}
