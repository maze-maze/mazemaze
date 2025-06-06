// server/models/recording.schema.ts
import { z } from '@hono/zod-openapi'
import { recording } from '🎙️/db/schema'
import { createSelectSchema } from 'drizzle-zod'

export const RecordingCreateRequestSchema = z.object({
  episodeId: z.string(),
  audioUrl: z.string().url(),
  duration: z.number().int().positive(),
}).openapi('RecordingCreateRequest')

export const RecordingResponseSchema = createSelectSchema(recording).openapi('RecordingResponse')
