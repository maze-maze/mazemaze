// server/models/reaction.schema.ts

import { z } from '@hono/zod-openapi'
import { reaction } from '🎙️/db/schema'
import { createSelectSchema } from 'drizzle-zod'

/*
  1) パスパラメータ { episodeId } for reactions
*/
export const EpisodeReactionsParamsSchema = z
  .object({
    episodeId: z.string().uuid(),
  })
  .openapi('EpisodeReactionsParams')

/*
  2) GET /api/episodes/:episodeId/reactions のレスポンス用
     reaction テーブルをそのまま取得（ID, episodeId, userId, type, createdAt）
*/
export const ReactionSelectSchema = createSelectSchema(reaction)
export const ReactionsResponseSchema = z
  .array(ReactionSelectSchema)
  .openapi('ReactionsResponse')
