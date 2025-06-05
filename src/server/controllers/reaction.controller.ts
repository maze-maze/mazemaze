// server/controllers/reaction.controller.ts

import type { RouteHandler } from '@hono/zod-openapi'
import type { getReactionsByEpisodeRoute } from '../routes/reaction.route'

import { db } from '🎙️/db'
import { reaction } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /episodes/:episodeId/reactions
 * → 指定エピソードのリアクション一覧を取得
 */
export const getReactionsByEpisodeHandler: RouteHandler<
  typeof getReactionsByEpisodeRoute
> = async (c) => {
  const params = c.req.param() as { episodeId: string }
  const { episodeId } = params

  const rows = await db
    .select({
      id: reaction.id,
      episodeId: reaction.episodeId,
      userId: reaction.userId,
      type: reaction.type,
      createdAt: reaction.createdAt,
    })
    .from(reaction)
    .where(eq(reaction.episodeId, episodeId))

  if (rows.length === 0) {
    return c.json({ message: 'リアクションが見つかりません' }, 404)
  }
  return c.json(rows, 200)
}
