// server/controllers/episode.controller.ts

import type { RouteHandler } from '@hono/zod-openapi'
import type { createEpisodeRoute } from '../routes/episode.route'
import { db } from '🎙️/db'
import { episode as episodeSchema, character as characterSchema } from '🎙️/db/schema' // characterも追加
import { auth } from '🎙️/lib/auth'

export const createEpisodeHandler: RouteHandler<typeof createEpisodeRoute> = async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session || !session.user?.id) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const userId = session.user.id
  const body = c.req.valid('json')

  try {
    const newEpisodeId = crypto.randomUUID();

    // DrizzleのトランザクションでEpisodeとCharacterを同時に作成
    await db.transaction(async (tx) => {
        // 1. Episodeを挿入
        await tx.insert(episodeSchema).values({
            id: newEpisodeId,
            userId,
            title: body.title,
            script: body.script,
            gradient: body.gradient,
            // ★★★ エラー修正: numberをstringに変換 ★★★
            // durationが不要な場合はこの行を削除
            // duration: body.duration?.toString(),
        });

        // 2. Main Characterを挿入
        if (body.mainCharacter) {
            await tx.insert(characterSchema).values({
                id: crypto.randomUUID(),
                episodeId: newEpisodeId,
                role: 'main',
                name: body.mainCharacter.name,
                description: body.mainCharacter.description,
                tone: body.mainCharacter.tone,
            });
        }
        
        // 3. Guest Characterを挿入
        if (body.guestCharacter) {
            await tx.insert(characterSchema).values({
                id: crypto.randomUUID(),
                episodeId: newEpisodeId,
                role: 'guest',
                name: body.guestCharacter.name,
                description: body.guestCharacter.description,
                tone: body.guestCharacter.tone,
            });
        }
    });
    
    // episodeIdのみを返す
    return c.json({ episodeId: newEpisodeId }, 201)

  } catch (error) {
    console.error('Episode creation error:', error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
}