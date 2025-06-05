// server/models/clip.schema.ts

import { z } from '@hono/zod-openapi'
import { clip } from '🎙️/db/schema'
import { createSelectSchema } from 'drizzle-zod'

/*
  1) パスパラメータ { episodeId } for clips
*/
export const EpisodeIdParamForClipsSchema = z
  .object({
    episodeId: z.string().uuid(),
  })
  .openapi('EpisodeIdParamForClips')

/*
  2) GET /api/episodes/:episodeId/clips や GET /api/clips のレスポンス用
     clip テーブルをそのまま取得（ID, episodeId, title, summaryScript, audioUrl, duration, createdAt）
*/
export const ClipSelectSchema = createSelectSchema(clip)
export const ClipsResponseSchema = z
  .array(ClipSelectSchema)
  .openapi('ClipsResponse')
