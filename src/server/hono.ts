// server/hono.ts

import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { env } from '🎙️/env.mjs'
import { basicAuth } from 'hono/basic-auth'

import {
  getUsernameRoute,
  setUsernameRoute,
  checkUsernameRoute,
  getUserPublicRoute,
  getEpisodesByUserRoute,
} from './routes/user.route'
import {
  getEpisodeRoute,
} from './routes/episode.route'
import {
  getClipsByEpisodeRoute,
  getAllClipsRoute,
} from './routes/clip.route'
import {
  getCommentsByEpisodeRoute,
} from './routes/comment.route'
import {
  getReactionsByEpisodeRoute,
} from './routes/reaction.route'
import {
  postRecordingRoute,
} from './routes/recording.route'

import {
  getUsernameHandler,
  setUsernameHandler,
  checkUsernameHandler,
  getUserPublicHandler,
  getEpisodesByUserHandler,
} from './controllers/user.controller'
import {
  getEpisodeHandler,
} from './controllers/episode.controller'
import {
  getClipsByEpisodeHandler,
  getAllClipsHandler,
} from './controllers/clip.controller'
import {
  getCommentsByEpisodeHandler,
} from './controllers/comment.controller'
import {
  getReactionsByEpisodeHandler,
} from './controllers/reaction.controller'
import {
  postRecordingHandler,
} from './controllers/recording.controller'

export const app = new OpenAPIHono().basePath('/api')

// ユーザー関連
const userApp = new OpenAPIHono()
  .openapi(getUsernameRoute, getUsernameHandler)
  .openapi(setUsernameRoute, setUsernameHandler)
  .openapi(checkUsernameRoute, checkUsernameHandler)
  .openapi(getUserPublicRoute, getUserPublicHandler)
  .openapi(getEpisodesByUserRoute, getEpisodesByUserHandler)

// エピソード関連
const episodeApp = new OpenAPIHono()
  .openapi(getEpisodeRoute, getEpisodeHandler)

// クリップ関連
const clipApp = new OpenAPIHono()
  .openapi(getClipsByEpisodeRoute, getClipsByEpisodeHandler)
  .openapi(getAllClipsRoute, getAllClipsHandler)

// コメント関連
const commentApp = new OpenAPIHono()
  .openapi(getCommentsByEpisodeRoute, getCommentsByEpisodeHandler)

// リアクション関連
const reactionApp = new OpenAPIHono()
  .openapi(getReactionsByEpisodeRoute, getReactionsByEpisodeHandler)

// 録音関連
const recordingApp = new OpenAPIHono()
  .openapi(postRecordingRoute, postRecordingHandler)

const mainApp = new OpenAPIHono()
  .route('/', userApp)          // /api/users/...
  .route('/', episodeApp)       // /api/episodes/...
  .route('/', clipApp)          // /api/clips or /api/episodes/:epId/clips
  .route('/', commentApp)       // /api/episodes/:epId/comments
  .route('/', reactionApp)      // /api/episodes/:epId/reactions
  .route('/', recordingApp)     // /api/episodes/:epId/recordings

app.route('/', mainApp)

app
  .doc('/specification', {
    openapi: '3.0.0',
    info: { title: 'Podcast API', version: '1.0.0' },
  })
  .use(
    '/doc/*',
    basicAuth({
      username: env.API_DOC_BASIC_AUTH_USER,
      password: env.API_DOC_BASIC_AUTH_PASS,
    })
  )
  .get('/doc', swaggerUI({ url: '/api/specification' }))

export type AppType = typeof app
export default app
