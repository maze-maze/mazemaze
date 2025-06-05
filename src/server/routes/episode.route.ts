// server/routes/episode.route.ts

import { createRoute } from '@hono/zod-openapi'
import {
  EpisodeParamsSchema,
  EpisodeResponseSchema,
} from '../models/episode.schema'
import { ErrorSchema } from '../models/error.schema'

// 実装済みコントローラ（例）
// import { getEpisode } from '../controllers/episode.controller'

/**
 * GET /episodes/:episodeId
 * → 特定エピソードの詳細を取得
 */
export const getEpisodeRoute = createRoute({
  path: '/episodes/:episodeId',
  method: 'get',
  description: '指定したエピソードの詳細を取得',
  request: {
    params: EpisodeParamsSchema,
  },
  // handler: getEpisode,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: EpisodeResponseSchema,
        },
      },
    },
    404: {
      description: 'エピソードが存在しない',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})
