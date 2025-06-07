import { createRoute } from '@hono/zod-openapi'
// ★★★ zをインポート ★★★
import { z } from 'zod'
import { ErrorSchema } from '../models/error.schema'
import {
  EpisodeCreateRequestSchema,
  EpisodeCreateResponseSchema,
  // ★★★ EpisodeGetResponseSchemaをインポート ★★★
  EpisodeGetResponseSchema,
} from '../models/episode.schema'

// ★★★ ここから追加 ★★★
export const getEpisodeRoute = createRoute({
  path: '/{id}',
  method: 'get',
  description: 'IDで指定されたエピソードを一件取得します',
  request: {
    params: z.object({
      id: z.string().openapi({
        param: { name: 'id', in: 'path' },
        example: '00000000-0000-0000-0000-000000000000',
      }),
    }),
  },
  responses: {
    200: {
      description: 'エピソードの取得に成功',
      content: { 'application/json': { schema: EpisodeGetResponseSchema } },
    },
    404: { description: 'エピソードが見つかりません', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'サーバーエラー', content: { 'application/json': { schema: ErrorSchema } } },
  },
})
// ★★★ ここまで追加 ★★★

export const createEpisodeRoute = createRoute({
  path: '/',
  method: 'post',
  description: '新しいエピソードを作成します',
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