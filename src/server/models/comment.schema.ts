// server/models/comment.schema.ts

import { z } from '@hono/zod-openapi'
import { comment } from '🎙️/db/schema'
import { createSelectSchema } from 'drizzle-zod'

/*
  1) パスパラメータ { episodeId } for comments
*/
export const EpisodeCommentsParamsSchema = z
  .object({
    episodeId: z.string().uuid(),
  })
  .openapi('EpisodeCommentsParams')

/*
  2) GET /api/episodes/:episodeId/comments のレスポンス用
     comment テーブルをそのまま取得（ID, episodeId, userId, text, createdAt）
*/
export const CommentSelectSchema = createSelectSchema(comment)
export const CommentsResponseSchema = z
  .array(CommentSelectSchema)
  .openapi('CommentsResponse')
