// server/models/recording.schema.ts
import { z } from '@hono/zod-openapi'
import { recording } from '🎙️/db/schema'
import { createSelectSchema } from 'drizzle-zod'

// ★★★ ここから追加 ★★★
export const RecordingGetQuerySchema = z.object({
  episodeId: z.string().openapi({
    param: { name: 'episodeId', in: 'query' },
    example: '00000000-0000-0000-0000-000000000000',
    description: '録音情報を取得したいエピソードのID',
  }),
}).openapi('RecordingGetQuery')
// ★★★ ここまで追加 ★★★

export const RecordingCreateRequestSchema = z.object({
  episodeId: z.string(),
  audioUrl: z.string().url(),
  duration: z.number().int().positive(),
}).openapi('RecordingCreateRequest')

export const RecordingResponseSchema = createSelectSchema(recording).openapi('RecordingResponse')
