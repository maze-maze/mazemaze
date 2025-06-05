// server/controllers/comment.controller.ts

import type { RouteHandler } from '@hono/zod-openapi'
import type { getCommentsByEpisodeRoute } from '../routes/comment.route'

import { db } from '🎙️/db'
import { comment } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /episodes/:episodeId/comments
 * → 指定エピソードのコメント一覧を取得
 */
export const getCommentsByEpisodeHandler: RouteHandler<
  typeof getCommentsByEpisodeRoute
> = async (c) => {
  const params = c.req.param() as { episodeId: string }
  const { episodeId } = params

  const rows = await db
    .select({
      id: comment.id,
      episodeId: comment.episodeId,
      userId: comment.userId,
      text: comment.text,
      createdAt: comment.createdAt,
    })
    .from(comment)
    .where(eq(comment.episodeId, episodeId))
    .orderBy((cmt, { desc }) => [desc(cmt.createdAt)])

  if (rows.length === 0) {
    return c.json({ message: 'コメントが見つかりません' }, 404)
  }
  return c.json(rows, 200)
}
