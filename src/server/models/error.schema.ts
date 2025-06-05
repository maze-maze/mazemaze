// server/models/error.schema.ts

import { z } from '@hono/zod-openapi'

// エラー時に返す共通スキーマ
export const ErrorSchema = z
  .object({
    message: z.string(),
    code: z.number().optional(),
  })
  .openapi('ErrorResponse')
