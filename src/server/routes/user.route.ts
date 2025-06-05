// server/routes/user.route.ts

import { createRoute, z } from '@hono/zod-openapi'
import {
  UsernameSelectSchema,
  UsernameInsertSchema,
  UserCheckQuerySchema,
  UserCheckResponseSchema,
  UserPublicParamsSchema,
  UserPublicResponseSchema,
  UserEpisodesParamsSchema,
  EpisodesByUserResponseSchema,
} from '../models/user.schema'
import { ErrorSchema } from '../models/error.schema'

// 実際のビジネスロジックは controllers/user.controller.ts に実装する
// import {
//   getUsername,
//   setUsername,
//   checkUsername,
//   getUserPublic,
//   getEpisodesByUser,
// } from '../controllers/user.controller'

/**
 * GET /users/username
 * → ログイン中ユーザーの username を取得
 */
export const getUsernameRoute = createRoute({
  path: '/users/username',
  method: 'get',
  description: 'ログイン中ユーザーのユーザー名を取得',
  // handler: getUsername,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: UsernameSelectSchema,
        },
      },
    },
    404: {
      description: 'ユーザー名が未設定',
      content: {
        'application/json': {
          schema: z.null(),
        },
      },
    },
  },
})

/**
 * POST /users/username
 * → ログイン中ユーザーの username を設定または更新
 */
export const setUsernameRoute = createRoute({
  path: '/users/username',
  method: 'post',
  description: 'ログイン中ユーザーのユーザー名を設定',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            username: z.string().nullable(),
          }),
        },
      },
    },
  },
  // handler: setUsername,
  responses: {
    201: {
      description: '設定成功',
      content: {
        'application/json': {
          schema: UsernameInsertSchema,
        },
      },
    },
    400: {
      description: 'ユーザー名が未入力',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    409: {
      description: 'ユーザー名がすでに使用されています',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

/**
 * GET /users/check-username?username=xxx
 * → username 重複チェック
 */
export const checkUsernameRoute = createRoute({
  path: '/users/check-username',
  method: 'get',
  description: 'ユーザー名の重複チェック',
  request: {
    query: UserCheckQuerySchema,
  },
  // handler: checkUsername,
  responses: {
    200: {
      description: 'チェック結果を返す',
      content: {
        'application/json': {
          schema: UserCheckResponseSchema,
        },
      },
    },
  },
})

/**
 * GET /users/:username
 * → 他ユーザーの公開プロフィール取得
 */
export const getUserPublicRoute = createRoute({
  path: '/users/:username',
  method: 'get',
  description: '他ユーザーの公開プロフィールを取得',
  request: {
    params: UserPublicParamsSchema,
  },
  // handler: getUserPublic,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: UserPublicResponseSchema,
        },
      },
    },
    404: {
      description: 'ユーザーが存在しない',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

/**
 * GET /users/:username/episodes
 * → 特定ユーザーが投稿したエピソード一覧取得
 */
export const getEpisodesByUserRoute = createRoute({
  path: '/users/:username/episodes',
  method: 'get',
  description: '指定ユーザーの投稿エピソード一覧を取得',
  request: {
    params: UserEpisodesParamsSchema,
  },
  // handler: getEpisodesByUser,
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: EpisodesByUserResponseSchema,
        },
      },
    },
    404: {
      description: 'ユーザーが存在しない、またはエピソードがない',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})
