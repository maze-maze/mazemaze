/* eslint-disable no-console */
import type { RouteHandler } from '@hono/zod-openapi'
import type { createEpisodeRoute, getEpisodeRoute } from '../routes/episode.route'
import { db } from '🎙️/db'
import { character as characterSchema, episode as episodeSchema } from '🎙️/db/schema'
// (createEpisodeHandlerで利用する他のimportはそのまま)
import { auth } from '🎙️/lib/auth'

import { client } from '🎙️/lib/hono'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

/**
 * IDで指定されたエピソードを一件取得するハンドラー
 */
export const getEpisodeHandler: RouteHandler<typeof getEpisodeRoute> = async (c) => {
  const { id } = c.req.valid('param')

  try {
    const episode = await db.query.episode.findFirst({
      where: eq(episodeSchema.id, id),
      with: {
        characters: true,
      },
    })

    // ★★★ このデバッグコードを追加してください ★★★
    console.log('--- 実行時に取得したデータ ---')
    console.log(JSON.stringify(episode, null, 2))
    // ★★★ ここまで ★★★

    if (!episode) {
      return c.json({ error: 'Episode not found' }, 404)
    }

    // 型エラーが解決しない場合、最終手段として型アサーション(as)を使います
    return c.json(episode, 200)
  }
  catch (error) {
    console.error('Get episode error:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
}

/**
 * 新しいエピソードを作成するハンドラー
 */
export const createEpisodeHandler: RouteHandler<typeof createEpisodeRoute> = async (c) => {
  // (こちらの関数の実装は変更ありません)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session || !session.user?.id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const res = await client.api.me.username.$get(
    {},
    {
      init: {
        headers: await headers(),
      },
    },
  )

  const data = await res.json()

  if (!data || !data.username) {
    return c.json({ error: 'Username not found' }, 400)
  }

  const body = c.req.valid('json')

  try {
    const newEpisodeId = crypto.randomUUID()

    await db.transaction(async (tx) => {
      await tx.insert(episodeSchema).values({
        id: newEpisodeId,
        username: data.username!,
        title: body.title,
        script: body.script,
        gradient: body.gradient,
      })

      if (body.mainCharacter) {
        await tx.insert(characterSchema).values({
          id: crypto.randomUUID(),
          episodeId: newEpisodeId,
          role: 'main',
          name: body.mainCharacter.name,
          description: body.mainCharacter.description,
          tone: body.mainCharacter.tone,
        })
      }

      if (body.guestCharacter) {
        await tx.insert(characterSchema).values({
          id: crypto.randomUUID(),
          episodeId: newEpisodeId,
          role: 'guest',
          name: body.guestCharacter.name,
          description: body.guestCharacter.description,
          tone: body.guestCharacter.tone,
        })
      }
    })

    return c.json({ episodeId: newEpisodeId }, 201)
  }
  catch (error) {
    console.error('Episode creation error:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
}
