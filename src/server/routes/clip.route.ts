// server/routes/clip.route.ts

import { createRoute } from '@hono/zod-openapi'
import {
  EpisodeIdParamForClipsSchema,
  ClipsResponseSchema,
} from '../models/clip.schema'
import { ErrorSchema } from '../models/error.schema'

// 実装済みコントローラ（例）
// import { getClipsByEpisode, getAllClips } from '../controllers/clip.controller'

/**
 * GET /episodes/:episodeId/clips
 * → 指定エピソードに紐づくクリップ一覧を取得
 */
export const getClipsByEpisodeRoute = createRoute({
  path: '/episodes/:episodeId/clips',
  method: 'get',
  description: '指定エピソードのクリップ一覧を取得',
  request: {
    params: EpisodeIdParamForClipsSchema,
  },
  // handler: getClipsByEpisode,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: ClipsResponseSchema,
        },
      },
    },
    404: {
      description: 'クリップが見つからない',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

/**
 * GET /clips
 * → 全クリップを取得
 */
export const getAllClipsRoute = createRoute({
  path: '/clips',
  method: 'get',
  description: '全クリップを取得',
  // handler: getAllClips,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: ClipsResponseSchema,
        },
      },
    },
  },
})
