// server/routes/recording.route.ts

import { createRoute } from '@hono/zod-openapi'
import {
  EpisodeRecordingParamsSchema,
  RecordingCreateRequestSchema,
  RecordingResponseSchema,
} from '../models/recording.schema'
import { ErrorSchema } from '../models/error.schema'

/**
 * POST /episodes/:episodeId/recordings
 * → エピソードに録音ファイルを紐づけて登録
 */
export const postRecordingRoute = createRoute({
  path: '/episodes/:episodeId/recordings',
  method: 'post',
  description: 'エピソードに録音ファイルを紐づけて登録',
  request: {
    params: EpisodeRecordingParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: RecordingCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: '録音の登録成功',
      content: {
        'application/json': {
          schema: RecordingResponseSchema,
        },
      },
    },
    400: {
      description: 'パラメータ不足や不正なフォーマット',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    403: {
      description: '権限がない',
      content: {
        'application/json': {
          schema: ErrorSchema,
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
