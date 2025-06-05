import { createRoute, z } from '@hono/zod-openapi'
import { ErrorSchema } from '../models/error.schema'
import { UserCheckQuerySchema, usernameInsertSchema, usernameSchema } from '../models/user.schema'

export const getusernameRoute = createRoute({
  path: '/',
  method: 'get',
  description: 'ユーザー名の取得',
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: usernameSchema,
        },
      },
    },
    404: {
      description: '値がありません',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
})

export const setusernameRoute = createRoute({
  path: '/',
  method: 'post',
  description: 'ユーザー名の設定',
  request: {
    body: {
      content: {
        'application/json': {
          schema: usernameInsertSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: '設定成功',
      content: {
        'application/json': {
          schema: usernameSchema,
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

export const checkUsernameRoute = createRoute({
  path: '/',
  method: 'get',
  description: 'ユーザー名の重複チェック',
  request: {
    query: UserCheckQuerySchema,
  },
  responses: {
    200: {
      description: '取得成功',
      content: {
        'application/json': {
          schema: z.object({
            available: z.boolean(),
          }),
        },
      },
    },
  },
})
