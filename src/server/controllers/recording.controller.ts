// server/controllers/recording.controller.ts

import type { RouteHandler } from '@hono/zod-openapi'
import type { postRecordingRoute } from '../routes/recording.route'

import { db } from '🎙️/db'
import { recording, episode } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '🎙️/lib/auth'

/**
 * POST /episodes/:episodeId/recordings
 * → エピソードに録音ファイルを紐づけて登録
 */
export const postRecordingHandler = async (c: Parameters<RouteHandler<typeof postRecordingRoute>>[0]) => {
  // 認証チェック（ログインユーザーのみ許可）
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session || !session.user?.id) {
    throw new Error('Unauthorized')
  }
  const userId = session.user.id

  // パスパラメータとリクエストボディをパース
  const params = c.req.param() as { episodeId: string }
  const { episodeId } = params
  const body = (await c.req.json()) as {
    episodeId: string
    audioUrl: string
    mimeType: string
    duration: string
  }

  // 1) episodeId が正しくログイン中ユーザーのものであるかチェック
  const epRows = await db
    .select({ id: episode.id, userId: episode.userId })
    .from(episode)
    .where(eq(episode.id, episodeId))
    .limit(1)

  if (epRows.length === 0) {
    return c.json({ message: 'エピソードが見つかりません' }, 404)
  }
  if (epRows[0].userId !== userId) {
    return c.json({ message: 'このエピソードを操作する権限がありません' }, 403)
  }

  // 2) recording テーブルに挿入
  const inserted = await db
    .insert(recording)
    .values({
      id: crypto.randomUUID(),
      episodeId: body.episodeId,
      audioUrl: body.audioUrl,
      mimeType: body.mimeType,
      duration: body.duration,
    })
    .returning({
      id: recording.id,
      episodeId: recording.episodeId,
      audioUrl: recording.audioUrl,
      mimeType: recording.mimeType,
      duration: recording.duration,
      createdAt: recording.createdAt,
    })

  return c.json(inserted[0], 201)
}
