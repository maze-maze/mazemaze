// server/routes/episode.route.ts

import { createRoute } from '@hono/zod-openapi'
import { ErrorSchema } from '../models/error.schema'
import {
  EpisodeCreateRequestSchema,
  EpisodeCreateResponseSchema,
} from '../models/episode.schema'

export const createEpisodeRoute = createRoute({
  path: '/',
  method: 'post',
  description: '新しいエピソードを作成し、音声情報を保存します',
  request: {
    body: {
      content: {
        'application/json': {
          schema: EpisodeCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'エピソードの作成に成功',
      content: {
        'application/json': {
          schema: EpisodeCreateResponseSchema, 
        },
      },
    },
    400: { description: 'リクエストが不正です', content: { 'application/json': { schema: ErrorSchema } } },
    401: { description: '認証が必要です', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'サーバーエラー', content: { 'application/json': { schema: ErrorSchema } } },
  },
})