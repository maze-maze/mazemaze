// server/controllers/episodeByUser.controller.ts

import type { RouteHandler } from '@hono/zod-openapi'
import type { getEpisodesByUserRoute } from '../routes/episodeByUser.route'

import { db } from '🎙️/db'
import { user, episode } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /users/:userId/episodes
 * → 特定ユーザーが投稿したエピソード一覧を取得
 */
export const getEpisodesByUserHandler: RouteHandler<
  typeof getEpisodesByUserRoute
> = async (c) => {
  const params = c.req.param() as { userId: string }
  const { userId } = params

  // ユーザーが存在するかチェック
  const usr = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (usr.length === 0) {
    return c.json({ message: 'ユーザーが存在しません' }, 404)
  }

  // エピソード一覧取得（最新順）
  const rows = await db
    .select({
      id: episode.id,
      userId: episode.userId,
      title: episode.title,
      gradient: episode.gradient,
      script: episode.script,
      audioUrl: episode.audioUrl,
      duration: episode.duration,
      likesCount: episode.likesCount,
      badsCount: episode.badsCount,
      createdAt: episode.createdAt,
      updatedAt: episode.updatedAt,
    })
    .from(episode)
    .where(eq(episode.userId, userId))
    .orderBy((e, { desc }) => [desc(e.createdAt)])

  if (rows.length === 0) {
    return c.json({ message: 'このユーザーはまだエピソードを投稿していません' }, 404)
  }
  return c.json(rows, 200)
}
