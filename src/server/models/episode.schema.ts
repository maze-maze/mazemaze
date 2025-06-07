// server/models/episode.schema.ts
import { z } from '@hono/zod-openapi'
// ★★★ character, episode スキーマをインポート ★★★
import { character as characterSchema, episode as episodeSchema } from '🎙️/db/schema'
import { createSelectSchema } from 'drizzle-zod'

// キャラクター情報のスキーマ
const CharacterSchema = z.object({
  name: z.string(),
  description: z.string(),
  tone: z.string(),
})

// ★★★ ここから追加 ★★★
// DBから取得する際のキャラクター情報のスキーマ
const CharacterResponseSchema = createSelectSchema(characterSchema)
// DBから取得する際のエピソード情報のスキーマ
const EpisodeResponseSchema = createSelectSchema(episodeSchema)

// エピソード取得APIの成功レスポンスのスキーマ
export const EpisodeGetResponseSchema = EpisodeResponseSchema.extend({
  characters: z.array(CharacterResponseSchema),
}).openapi('EpisodeGetResponse')
// ★★★ ここまで追加 ★★★

// クライアントから受け取るリクエストボディのスキーマ
export const EpisodeCreateRequestSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  script: z.string().min(1, '台本は必須です'),
  gradient: z.string().optional(),
  mainCharacter: CharacterSchema,
  guestCharacter: CharacterSchema.optional(),
}).openapi('EpisodeCreateRequest')

// APIからの成功レスポンスのスキーマ
export const EpisodeCreateResponseSchema = z.object({
  episodeId: z.string(),
}).openapi('EpisodeCreateResponse')
