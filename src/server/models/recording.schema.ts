// server/models/recording.schema.ts

import { z } from '@hono/zod-openapi'
import { recording } from '🎙️/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

/*
  1) パスパラメータ { episodeId } for recordings
*/
export const EpisodeRecordingParamsSchema = z
  .object({
    episodeId: z.string().uuid(),
  })
  .openapi('EpisodeRecordingParams')

/*
  2) POST /api/episodes/:episodeId/recordings のリクエストボディ用
     recording テーブルの挿入用フィールドをバリデート
     → episodeId, audioUrl, mimeType, duration
*/
export const RecordingInsertSchema = createInsertSchema(recording, {
  audioUrl: (schema) => schema.url(),
  mimeType: (schema) => schema.min(5).max(50),  // ex: 'audio/webm'
  duration: (schema) => schema.min(1).max(10),   // ex: '90' or '01:30'
})

export const RecordingCreateRequestSchema = RecordingInsertSchema.pick({
  episodeId: true,
  audioUrl: true,
  mimeType: true,
  duration: true,
})

/*
  3) POST 実行後や GET に対して返却するレスポンス用
     → recording テーブル全フィールドを取得
*/
export const RecordingResponseSchema = createSelectSchema(recording).openapi(
  'RecordingResponse'
)
