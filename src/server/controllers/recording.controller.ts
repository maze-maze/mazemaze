import type { RouteHandler } from '@hono/zod-openapi'
// ★★★ getRecordingsByEpisodeRouteをインポート ★★★
import type { createRecordingRoute, getRecordingsByEpisodeRoute } from '../routes/recording.route'
// ★★★ RLSが有効なDBクライアントをインポート ★★★
import { db as rlsDb } from '🎙️/db'
import { episode as episodeSchema, recording as recordingSchema } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// ★★★ ここから追加 ★★★
/**
 * 指定されたエピソードIDに紐づく録音情報の一覧を取得するハンドラー
 */
export const getRecordingsByEpisodeHandler: RouteHandler<
  typeof getRecordingsByEpisodeRoute
> = async (c) => {
  // クエリパラメータからepisodeIdを取得
  const { episodeId } = c.req.valid('query')

  try {
    // RLSが有効な通常のdbインスタンスで読み取りを実行
    const recordings = await rlsDb
      .select()
      .from(recordingSchema)
      .where(eq(recordingSchema.episodeId, episodeId))

    return c.json(recordings, 200)
  }
  catch (error) {
    console.error('Get recordings error:', error)
    throw error
  }
}
// ★★★ ここまで追加 ★★★

/**
 * 新しい録音情報を作成するハンドラー
 */
export const createRecordingHandler: RouteHandler<typeof createRecordingRoute> = async (c) => {
  // 1. service_roleキーを使って、RLSをバイパスできるDBクライアントを生成
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const databaseUrl = process.env.DATABASE_URL!.replace(
    process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey,
  )
  const serviceDbClient = postgres(databaseUrl)
  const db = drizzle(serviceDbClient)

  // 2. リクエストボディからデータを取得
  const body = c.req.valid('json')

  try {
    // 3. 管理者権限を持つdbインスタンスで書き込みを実行
    const [newRecording] = await db
      .insert(recordingSchema)
      .values({
        id: crypto.randomUUID(),
        episodeId: body.episodeId,
        audioUrl: body.audioUrl,
        duration: body.duration.toString(),
        mimeType: 'audio/webm',
      })
      .returning()

    // episodeテーブルの更新も同じdbインスタンスで行う
    await db.update(episodeSchema).set({
      audioUrl: body.audioUrl,
      duration: body.duration.toString(),
    }).where(eq(episodeSchema.id, body.episodeId))

    return c.json(newRecording, 201)
  }
  catch (error) {
    console.error('Recording creation error:', error)
    return c.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
