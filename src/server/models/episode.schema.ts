// server/models/episode.schema.ts

import { z } from '@hono/zod-openapi'
import { episode } from '🎙️/db/schema'
import { createSelectSchema } from 'drizzle-zod'

/*
  1) パスパラメータ { episodeId } 用
*/
export const EpisodeParamsSchema = z
  .object({
    episodeId: z.string().uuid(),
  })
  .openapi('EpisodeParams')

/*
  2) GET /api/episodes/:episodeId のレスポンス全体用
     ※必要に応じてキャラクター情報やコメント・リアクション・クリップ等は
       別クエリで補完する実装のケースが多いですが、
       ここでは episode テーブルの全フィールド取得用を定義しています
*/
export const EpisodeResponseSchema = createSelectSchema(episode).openapi(
  'EpisodeResponse'
)
