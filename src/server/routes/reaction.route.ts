// server/routes/reaction.route.ts

import { createRoute } from '@hono/zod-openapi'
import {
  EpisodeReactionsParamsSchema,
  ReactionsResponseSchema,
} from '../models/reaction.schema'
import { ErrorSchema } from '../models/error.schema'

// 実装済みコントローラ（例）
// import { getReactionsByEpisode } from '../controllers/reaction.controller'

/**
 * GET /episodes/:episodeId/reactions
 * → 指定エピソードのリアクション一覧を取得
 */
export const getReactionsByEpisodeRoute = createRoute({
  path: '/episodes/:episodeId/reactions',
  method: 'get',
  description: '指定エピソードのリアクションを取得',
  request: {
    params: EpisodeReactionsParamsSchema,
  },
  // handler: getReactionsByEpisode,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: ReactionsResponseSchema,
        },
      },
    },
    404: {
      description: 'エピソードが存在しない、またはリアクションがない',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})
