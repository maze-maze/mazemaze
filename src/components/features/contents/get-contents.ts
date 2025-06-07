/* eslint-disable style/multiline-ternary */
'use server'

import { db } from '🎙️/db'
import { episode as episodeSchema } from '🎙️/db/schema'
import { eq } from 'drizzle-orm'

/**
 * 指定されたIDのエピソードに関連する全ての情報（エピソード、録音、キャラクター）を取得する
 * @param contentsId 取得したいエピソードのID
 * @returns 整形されたコンテンツ情報、または見つからない場合はnull
 */
export async function getContents(contentsId: string) {
  // DrizzleのQuery APIを使い、リレーションを解決して一度にデータを取得
  const contentData = await db.query.episode.findFirst({
    where: eq(episodeSchema.id, contentsId),
    with: {
      // 関連するキャラクター情報と録音情報を同時に取得
      characters: true,
      recordings: true,
    },
  })

  // データが見つからなかった場合はnullを返す
  if (!contentData) {
    return null
  }

  // DBから取得したデータを、要求された形式に整形する

  // 1. キャラクター情報を'main'と'guest'に振り分ける
  const mainCharacterData = contentData.characters.find(c => c.role === 'main')
  const guestCharacterData = contentData.characters.find(c => c.role === 'guest')

  // 2. 録音情報を取得する（ここでは最初の1件を取得する想定）
  const recordingData = contentData.recordings[0]

  // 3. 最終的な出力オブジェクトを組み立てる
  const contents = {
    episodeInfo: {
      title: contentData.title,
      script: contentData.script,
      gradient: contentData.gradient,
      // DBスキーマにimageUrlは存在しないため、固定値またはnullを設定します。
      // 必要であれば、userテーブルのimageなどを利用するロジックも追加可能です。
      imageUrl: '/lama.png',
    },
    recordingInfo: recordingData ? {
      recordingId: recordingData.id,
      audioUrl: recordingData.audioUrl,
      // durationはDBではstring型で保存されている可能性があるため、数値に変換
      duration: recordingData.duration ? Number.parseInt(recordingData.duration, 10) : 0,
      createdAt: recordingData.createdAt.toISOString(),
    } : null, // 録音情報がない場合はnull
    characterInfo: {
      mainCharacter: mainCharacterData ? {
        name: mainCharacterData.name,
        description: mainCharacterData.description,
        tone: mainCharacterData.tone,
        // episodeInfo同様、imageUrlはスキーマにないため固定値とします
        imageUrl: '/characters/character.png',
      } : null, // メインキャラクターがいない場合はnull
      guestCharacter: guestCharacterData
        ? {
            name: guestCharacterData.name,
            description: guestCharacterData.description,
            tone: guestCharacterData.tone,
            imageUrl: '/characters/guest.png',
          }
        : null, // ゲストキャラクターがいない場合はnull
    },
  }

  return contents
}
