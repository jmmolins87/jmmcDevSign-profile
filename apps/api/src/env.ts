import { parseEnv } from "@jmmcdev/shared/env"

import type { ApiEnv } from "@jmmcdev/shared/env"

import { apiEnvSchema } from "@jmmcdev/shared/env"

/**
 * Validated environment for the API server (guidelines §12).
 * In dev, variables come from `../../.env` (Node `--env-file-if-exists`);
 * in production from the real environment.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  return parseEnv(apiEnvSchema, source)
}
