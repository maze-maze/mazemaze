// server/controllers/recording.controller.ts
import type { RouteHandler } from '@hono/zod-openapi'
import type { createRecordingRoute } from '../routes/recording.route'
import { db } from '🎙️/db'
import { episode as episodeSchema, recording as recordingSchema } from '🎙️/db/schema'
import { auth } from '🎙️/lib/auth'
import { eq } from 'drizzle-orm'

export const createRecordingHandler: RouteHandler<typeof createRecordingRoute> = async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const body = c.req.valid('json')

  try {
    const [newRecording] = await db
      .insert(recordingSchema)
      .values({
        id: crypto.randomUUID(),
        episodeId: body.episodeId,
        audioUrl: body.audioUrl,
        duration: body.duration.toString(), // ★★★ エラー対策
        mimeType: 'audio/webm',
      })
      .returning()
    
    // 同時にepisodeテーブルのaudioUrlとdurationも更新
    await db.update(episodeSchema).set({
        audioUrl: body.audioUrl,
        duration: body.duration.toString(), // ★★★ エラー対策
    }).where(eq(episodeSchema.id, body.episodeId))

    return c.json(newRecording, 201)
  } catch (error) {
    console.error('Recording creation error:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
}