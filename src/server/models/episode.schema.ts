// server/models/episode.schema.ts
import { z } from '@hono/zod-openapi'

// キャラクター情報のスキーマ
const CharacterSchema = z.object({
  name: z.string(),
  description: z.string(),
  tone: z.string(),
})

// クライアントから受け取るリクエストボディのスキーマ
export const EpisodeCreateRequestSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  script: z.string().min(1, '台本は必須です'),
  gradient: z.string().optional(),
  mainCharacter: CharacterSchema,
  guestCharacter: CharacterSchema.optional(),
  // durationは不要なら削除
  // duration: z.number().int().positive('再生時間は正の整数である必要があります').optional(),
}).openapi('EpisodeCreateRequest')

// APIからの成功レスポンスのスキーマ
export const EpisodeCreateResponseSchema = z.object({
  episodeId: z.string(),
}).openapi('EpisodeCreateResponse')
