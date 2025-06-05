// server/controllers/clip.controller.ts

import type { RouteHandler } from '@hono/zod-openapi'
import type {
  getClipsByEpisodeRoute,
  getAllClipsRoute,
} from '../routes/clip.route'

import { db } from '🎙️/db'
import { clip } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /episodes/:episodeId/clips
 * → 指定エピソードに紐づくクリップ一覧を取得
 */
export const getClipsByEpisodeHandler: RouteHandler<
  typeof getClipsByEpisodeRoute
> = async (c) => {
  const params = c.req.param() as { episodeId: string }
  const { episodeId } = params

  const rows = await db
    .select({
      id: clip.id,
      episodeId: clip.episodeId,
      title: clip.title,
      summaryScript: clip.summaryScript,
      audioUrl: clip.audioUrl,
      duration: clip.duration,
      createdAt: clip.createdAt,
    })
    .from(clip)
    .where(eq(clip.episodeId, episodeId))

  if (rows.length === 0) {
    return c.json({ message: 'クリップが見つかりません' }, 404)
  }
  return c.json(rows, 200)
}

/**
 * GET /clips
 * → 全クリップを取得
 */
export const getAllClipsHandler: RouteHandler<
  typeof getAllClipsRoute
> = async (c) => {
  const rows = await db
    .select({
      id: clip.id,
      episodeId: clip.episodeId,
      title: clip.title,
      summaryScript: clip.summaryScript,
      audioUrl: clip.audioUrl,
      duration: clip.duration,
      createdAt: clip.createdAt,
    })
    .from(clip)

  return c.json(rows, 200)
}
