// server/models/recording.schema.ts
import { z } from '@hono/zod-openapi'
import { createSelectSchema } from 'drizzle-zod'
import { recording } from '🎙️/db/schema'

export const RecordingCreateRequestSchema = z.object({
  episodeId: z.string(),
  audioUrl: z.string().url(),
  duration: z.number().int().positive(),
}).openapi('RecordingCreateRequest')

export const RecordingResponseSchema = createSelectSchema(recording).openapi('RecordingResponse')