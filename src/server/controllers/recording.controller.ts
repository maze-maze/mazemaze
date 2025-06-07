// server/controllers/recording.controller.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import type { RouteHandler } from '@hono/zod-openapi'
import type { createRecordingRoute } from '../routes/recording.route'
import { episode as episodeSchema, recording as recordingSchema } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'

export const createRecordingHandler: RouteHandler<typeof createRecordingRoute> = async (c) => {
  // 1. service_roleキーを使って、RLSをバイパスできるDBクライアントを生成
  //    SupabaseのDB接続文字列は環境変数に設定されていることを前提とします
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const databaseUrl = process.env.DATABASE_URL!.replace(
      process.env.SUPABASE_ANON_KEY!, // anon_key部分を
      serviceRoleKey, // service_roleキーに置き換える
  )
  const serviceDbClient = postgres(databaseUrl)
  const db = drizzle(serviceDbClient)

  // 2. リクエストボディからデータを取得（userIdも含まれている）
  const body = c.req.valid('json')

  try {
    // 3. 管理者権限を持つdbインスタンスで書き込みを実行
    const [newRecording] = await db
      .insert(recordingSchema)
      .values({
        id: crypto.randomUUID(),
        episodeId: body.episodeId,
        userId: body.userId, // ★★★ フロントから渡されたuserIdを使用
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
    
  } catch (error) {
    console.error('Recording creation error:', error)
    return c.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}