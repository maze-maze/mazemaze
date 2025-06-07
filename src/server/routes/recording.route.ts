import { createRoute } from '@hono/zod-openapi'
import { ErrorSchema } from '../models/error.schema'
import {
  RecordingCreateRequestSchema,
  // ★★★ RecordingGetQuerySchemaをインポート ★★★
  RecordingGetQuerySchema,
  RecordingResponseSchema,
} from '../models/recording.schema'

// ★★★ ここから追加 ★★★
export const getRecordingsByEpisodeRoute = createRoute({
  path: '/',
  method: 'get',
  description: '指定されたエピソードIDに紐づく録音ファイル情報の一覧を取得します',
  request: {
    query: RecordingGetQuerySchema,
  },
  responses: {
    200: {
      description: '録音情報の一覧取得に成功',
      // ★★★ レスポンスはスキーマの配列 ★★★
      content: { 'application/json': { schema: RecordingResponseSchema.array() } },
    },
    500: { description: 'サーバーエラー', content: { 'application/json': { schema: ErrorSchema } } },
  },
})
// ★★★ ここまで追加 ★★★

export const createRecordingRoute = createRoute({
  path: '/',
  method: 'post',
  description: '録音ファイル情報を保存します',
  request: {
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
      description: '録音情報の保存に成功',
      content: { 'application/json': { schema: RecordingResponseSchema } },
    },
    401: { description: '認証が必要です', content: { 'application/json': { schema: ErrorSchema } } },
    500: { description: 'サーバーエラー', content: { 'application/json': { schema: ErrorSchema } } },
  },
})