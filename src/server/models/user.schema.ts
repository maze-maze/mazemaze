// server/models/user.schema.ts

import { z } from '@hono/zod-openapi'
import { user } from '🎙️/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

/*
  1) USER 全般（自身向け）スキーマ群
*/

// 1-1) 全フィールド取得用
export const UserSelectSchema = createSelectSchema(user)

// 1-2) ユーザー作成／更新用（INSERT/UPDATE）
export const UserInsertSchema = createInsertSchema(user, {
  // username は 3〜10 文字で制限
  username: (schema) => schema.min(3).max(10),
})

// 1-3) username のみ扱う場合
export const UsernameSelectSchema = UserSelectSchema.pick({
  username: true,
})
export const UsernameInsertSchema = UserInsertSchema.pick({
  username: true,
})

// 1-4) username 空きチェックのクエリ用
export const UserCheckQuerySchema = z
  .object({
    username: z.string(),
  })
  .openapi('UserCheckQuery')

// 1-5) username 空きチェックレスポンス用
export const UserCheckResponseSchema = z
  .object({
    available: z.boolean(),
  })
  .openapi('UserCheckResponse')



/*
  2) USER 公開向け（他人に見せるプロフィール）スキーマ群
*/

// 2-1) 公開可能なフィールドだけを抜き取る
export const UserPublicSelectSchema = createSelectSchema(user).pick({
  id: true,
  name: true,
  username: true,
  image: true,
  createdAt: true,
})

// 2-2) OpenAPI 用に命名
export const UserPublicResponseSchema = UserPublicSelectSchema.openapi('UserPublicResponse')

// 2-3) パスパラメータ { username } 用
export const UserPublicParamsSchema = z
  .object({
    username: z.string()
  })
  .openapi('UserPublicParams')

/*
  3) 特定ユーザーのエピソード一覧取得用スキーマ群
*/

// 3-1) パスパラメータ { username } 用 （再利用可）
export const UserEpisodesParamsSchema = UserPublicParamsSchema

// 3-2) ユーザー投稿エピソード一覧レスポンス用スキーマ
//      → Drizzle の episode テーブルを参照
import { episode } from '🎙️/db/schema'
export const EpisodesByUserResponseSchema = z
  .array(
    createSelectSchema(episode).pick({
      id: true,
      title: true,
      gradient: true,
      script: true,
      audioUrl: true,
      duration: true,
      likesCount: true,
      badsCount: true,
      createdAt: true,
      updatedAt: true,
    })
  )
  .openapi('EpisodesByUserResponse')
