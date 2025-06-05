// server/controllers/user.controller.ts

import type { RouteHandler } from '@hono/zod-openapi'
import type {
  getUsernameRoute,
  setUsernameRoute,
  checkUsernameRoute,
  getUserPublicRoute,
  getEpisodesByUserRoute,
} from '../routes/user.route'

import { db } from '🎙️/db'
import { user, episode } from '🎙️/db/schema'
import { auth } from '🎙️/lib/auth'
import { and, eq, ne } from 'drizzle-orm'
import { headers } from 'next/headers'

/**
 * GET /users/username
 * → ログイン中ユーザーの username を取得
 */
export const getUsernameHandler: RouteHandler<typeof getUsernameRoute> = async (c) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session || !session.user?.id) {
    throw new Error('Unauthorized')
  }
  const userId = session.user.id

  const result = await db
    .select({ username: user.username })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (result.length === 0 || !result[0].username) {
    return c.json(null, 404)
  }
  return c.json({ username: result[0].username }, 200)
}

/**
 * POST /users/username
 * → ログイン中ユーザーの username を設定または更新
 */
export const setUsernameHandler: RouteHandler<typeof setUsernameRoute> = async (c) => {
  const body = await c.req.json()
  const { username } = body as { username: string | null }

  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session || !session.user?.id) {
    throw new Error('Unauthorized')
  }
  const userId = session.user.id

  if (!username) {
    return c.json({ message: 'ユーザー名を入力してください' }, 400)
  }

  const existing = await db
    .select()
    .from(user)
    .where(and(eq(user.username, username), ne(user.id, userId)))
    .limit(1)

  if (existing.length > 0) {
    return c.json({ message: 'このユーザー名はすでに使用されています' }, 409)
  }

  await db
    .update(user)
    .set({ username })
    .where(eq(user.id, userId))

  return c.json({ username }, 201)
}

/**
 * GET /users/check-username?username=xxx
 * → username 重複チェック
 */
export const checkUsernameHandler: RouteHandler<typeof checkUsernameRoute> = async (c) => {
  const query = c.req.query()
  const { username } = query as { username?: string }

  if (!username) {
    return c.json({ available: false }, 200)
  }

  const result = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1)

  const isAvailable = result.length === 0
  return c.json({ available: isAvailable }, 200)
}

/**
 * GET /users/:userId
 * → 他ユーザーの公開プロフィールを取得
 */
export const getUserPublicHandler: RouteHandler<typeof getUserPublicRoute> = async (c) => {
  const params = c.req.param() as { userId: string }
  const { userId } = params

  // 他ユーザー情報を取得
  const row = await db
    .select({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (row.length === 0) {
    return c.json({ message: 'ユーザーが見つかりません' }, 404)
  }

  return c.json(row[0], 200)
}

/**
 * GET /users/:userId/episodes
 * → 特定ユーザーが投稿したエピソード一覧を取得
 */
export const getEpisodesByUserHandler: RouteHandler<typeof getEpisodesByUserRoute> = async (c) => {
  const params = c.req.param() as { userId: string }
  const { userId } = params

  // ユーザー存在チェック
  const usr = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (usr.length === 0) {
    return c.json({ message: 'ユーザーが存在しません' }, 404)
  }

  // エピソード一覧を取得（最新順）
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
