// server/routes/comment.route.ts

import { createRoute } from '@hono/zod-openapi'
import {
  EpisodeCommentsParamsSchema,
  CommentsResponseSchema,
} from '../models/comment.schema'
import { ErrorSchema } from '../models/error.schema'

// 実装済みコントローラ（例）
// import { getCommentsByEpisode } from '../controllers/comment.controller'

/**
 * GET /episodes/:episodeId/comments
 * → 指定エピソードのコメント一覧を取得
 */
export const getCommentsByEpisodeRoute = createRoute({
  path: '/episodes/:episodeId/comments',
  method: 'get',
  description: '指定エピソードのコメントを取得',
  request: {
    params: EpisodeCommentsParamsSchema,
  },
  // handler: getCommentsByEpisode,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: CommentsResponseSchema,
        },
      },
    },
    404: {
      description: 'エピソードが存在しない、またはコメントがない',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})
