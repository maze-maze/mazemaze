import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
  username: text('user_name').unique(),
  image: text('image'),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()),
})

/*
  ─────────────────────────────────────────────────────────────────────
   以下、ポッドキャスト／エピソード関連テーブルを追加
  ─────────────────────────────────────────────────────────────────────
*/

/// エピソード（投稿）
export const episode = pgTable('episode', {
  id: text('id').primaryKey(),
  username: text('user_name').notNull().references(() => user.username, { onDelete: 'cascade' }),

  title: text('title').notNull(), // エピソード名（テーマと同義）
  gradient: text('gradient'), // 背景グラデーション情報
  script: text('script').notNull(), // 全文台本

  audioUrl: text('audio_url'), // 録音音声ファイルの URL
  duration: text('duration'), // 録音時間（例: "90" 秒や "01:30" など）

  likesCount: integer('likes_count').default(0),
  badsCount: integer('bads_count').default(0),

  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(() => new Date()).notNull(),
})

/// キャラクター情報（メイン / ゲスト）
export const character = pgTable('character', {
  id: text('id').primaryKey(),
  episodeId: text('episode_id').notNull().references(() => episode.id, { onDelete: 'cascade' }),

  role: text('role').notNull(), // 'main' or 'guest'
  name: text('name').notNull(),
  description: text('description'),
  tone: text('tone'),

  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
})

/// 録音ファイル情報
export const recording = pgTable('recording', {
  id: text('id').primaryKey(),
  episodeId: text('episode_id').notNull().references(() => episode.id, { onDelete: 'cascade' }),

  audioUrl: text('audio_url').notNull(),
  mimeType: text('mime_type'),
  duration: text('duration'), // 録音時間（例: "00:45"）

  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
})

/// コメント
export const comment = pgTable('comment', {
  id: text('id').primaryKey(),
  episodeId: text('episode_id').notNull().references(() => episode.id, { onDelete: 'cascade' }),
  username: text('user_name').notNull().references(() => user.username, { onDelete: 'cascade' }),

  text: text('text').notNull(), // コメント本文

  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
})

/// リアクション（いいね / バッド）
export const reaction = pgTable('reaction', {
  id: text('id').primaryKey(),
  episodeId: text('episode_id').notNull().references(() => episode.id, { onDelete: 'cascade' }),
  username: text('user_name').notNull().references(() => user.username, { onDelete: 'cascade' }),

  type: text('type').notNull(), // 'like' or 'bad'

  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
})

/// クリップ（自動生成ショートクリップ） - 1エピソードにつき1つ
export const clip = pgTable('clip', {
  id: text('id').primaryKey(),
  episodeId: text('episode_id')
    .notNull()
    .references(() => episode.id, { onDelete: 'cascade' })
    .unique(), // 1:1 制約

  title: text('title').notNull(), // クリップ用タイトル
  summaryScript: text('summary_script'), // 要約された台本
  audioUrl: text('audio_url'), // ショートクリップ音声URL
  duration: text('duration'), // 例: "00:30"

  createdAt: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
})
