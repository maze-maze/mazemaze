// server/controllers/episode.controller.ts

import type { RouteHandler } from '@hono/zod-openapi'
import type { getEpisodeRoute } from '../routes/episode.route'

import { db } from '🎙️/db'
import { episode, character, recording, comment, reaction, clip } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /episodes/:episodeId
 * → 特定エピソードの詳細を取得
 */
export const getEpisodeHandler: RouteHandler<typeof getEpisodeRoute> = async (c) => {
  const params = c.req.param() as { episodeId: string }
  const { episodeId } = params

  // まずメインのエピソード情報を取得
  const epRows = await db
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
    .where(eq(episode.id, episodeId))
    .limit(1)

  if (epRows.length === 0) {
    return c.json({ message: 'エピソードが見つかりません' }, 404)
  }
  const ep = epRows[0]

  // キャラクター情報（複数想定）
  const chars = await db
    .select({
      id: character.id,
      role: character.role,
      name: character.name,
      description: character.description,
      tone: character.tone,
      createdAt: character.createdAt,
    })
    .from(character)
    .where(eq(character.episodeId, episodeId))

  // 録音情報（複数想定だが通常1件）
  const recs = await db
    .select({
      id: recording.id,
      audioUrl: recording.audioUrl,
      mimeType: recording.mimeType,
      duration: recording.duration,
      createdAt: recording.createdAt,
    })
    .from(recording)
    .where(eq(recording.episodeId, episodeId))

  // コメント情報

interface CommentQueryResult {
    id: string
    userId: string
    text: string
    createdAt: Date
}

const comms: CommentQueryResult[] = await db
        .select({
                id: comment.id,
                userId: comment.userId,
                text: comment.text,
                createdAt: comment.createdAt,
        })
        .from(comment)
        .where(eq(comment.episodeId, episodeId))
        .orderBy((c, { desc }) => [desc(c.createdAt)])

  // リアクション情報
  const reacts = await db
    .select({
      id: reaction.id,
      userId: reaction.userId,
      type: reaction.type,
      createdAt: reaction.createdAt,
    })
    .from(reaction)
    .where(eq(reaction.episodeId, episodeId))

  // クリップ情報（1:1 想定）
  const clipRows = await db
    .select({
      id: clip.id,
      title: clip.title,
      summaryScript: clip.summaryScript,
      audioUrl: clip.audioUrl,
      duration: clip.duration,
      createdAt: clip.createdAt,
    })
    .from(clip)
    .where(eq(clip.episodeId, episodeId))
    .limit(1)
  const clipInfo = clipRows.length > 0 ? clipRows[0] : null

  // レスポンスを組み立てて返却
  return c.json({
    ...ep,
    characters: chars,
    recordings: recs,
    comments: comms,
    reactions: reacts,
    clip: clipInfo,
  }, 200)
}
