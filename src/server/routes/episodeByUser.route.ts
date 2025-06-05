// server/routes/episodeByUser.route.ts

import { createRoute } from '@hono/zod-openapi'
import {
  UserEpisodesParamsSchema,
  EpisodesByUserResponseSchema,
} from '../models/user.schema'
import { ErrorSchema } from '../models/error.schema'

// 実装済みコントローラ（例）
// import { getEpisodesByUser } from '../controllers/user.controller'

/**
 * GET /users/:userId/episodes
 * → 特定ユーザーが投稿したエピソード一覧を取得
 */
export const getEpisodesByUserRoute = createRoute({
  path: '/users/:userId/episodes',
  method: 'get',
  description: '指定ユーザーの投稿エピソード一覧を取得',
  request: {
    params: UserEpisodesParamsSchema,
  },
  // handler: getEpisodesByUser,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: EpisodesByUserResponseSchema,
        },
      },
    },
    404: {
      description: 'ユーザーが存在しない、またはエピソードがない',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})
