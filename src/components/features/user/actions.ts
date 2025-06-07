'use server'

import { db } from '🎙️/db'
import { episode as episodeSchema, user as userSchema } from '🎙️/db/schema'
import { desc, eq } from 'drizzle-orm'

/**
 * 指定されたユーザー名に紐づくプロフィール情報を取得する
 */
export async function getUserProfile(username: string) {
  const user = await db.query.user.findFirst({
    where: eq(userSchema.username, username),
    columns: {
      name: true,
      username: true,
    },
  })
  return user
}

/**
 * 指定されたユーザー名に紐づくエピソードの一覧を取得する
 */
export async function getEpisodesByUsername(username: string) {
  const episodesData = await db.query.episode.findMany({
    where: eq(episodeSchema.username, username),
    with: {
      characters: true,
      recordings: true,
    },
    orderBy: [desc(episodeSchema.createdAt)],
  })

  // 取得したデータをクライアントで使いやすい形式に整形
  const formattedEpisodes = episodesData.map(episode => {
    const mainCharacter = episode.characters.find(c => c.role === 'main')
    const firstRecording = episode.recordings[0]

    return {
      id: episode.id,
      title: episode.title,
      gradient: episode.gradient,
      duration: firstRecording?.duration ? parseInt(firstRecording.duration, 10) : 0,
      mainCharacter: mainCharacter ? {
        name: mainCharacter.name,
        imageUrl: '/characters/character.png', // 固定値
      } : null,
      createdAt: episode.createdAt,
    }
  })

  return formattedEpisodes
}