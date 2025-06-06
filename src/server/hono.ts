// server/hono.ts

import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { env } from '🎙️/env.mjs'
import { basicAuth } from 'hono/basic-auth'
// --- episodeのimportを追加 ---
import { createEpisodeHandler } from './controllers/episode.controller'
import { createEpisodeRoute } from './routes/episode.route'
// --- userのimport ---
import { checkUsernameHandler, getusernameHandler, setusernameHandler } from './controllers/user.controller'
import { checkUsernameRoute, getusernameRoute, setusernameRoute } from './routes/user.route'

import { createRecordingHandler } from './controllers/recording.controller' // 追加
import { createRecordingRoute } from './routes/recording.route' // 追加

export const app = new OpenAPIHono().basePath('/api')

// --- User App ---
const userApp = new OpenAPIHono()
  .openapi(getusernameRoute, getusernameHandler)
  .openapi(setusernameRoute, setusernameHandler)

const checkUserApp = new OpenAPIHono()
  .openapi(checkUsernameRoute, checkUsernameHandler)

// --- Episode App (新規追加) ---
const episodeApp = new OpenAPIHono()
  .openapi(createEpisodeRoute, createEpisodeHandler)

  // --- Recording App (新規追加) ---
const recordingApp = new OpenAPIHono()
.openapi(createRecordingRoute, createRecordingHandler)


// --- Main AppにepisodeAppを登録 ---
const mainApp = new OpenAPIHono()
  .route('/me/username', userApp)
  .route('/username/check', checkUserApp)
  .route('/episodes', episodeApp)
  .route('/recordings', recordingApp)

const _route = app.route('/', mainApp)

// ... (Swagger UIの部分は変更なし)
app.doc('/specification', {
  openapi: '3.0.0',
  info: { title: 'RESUME GALLARY API', version: '1.0.0' },
}).use('/doc/*', async (c, next) => {
  const auth = basicAuth({
    username: env.API_DOC_BASIC_AUTH_USER,
    password: env.API_DOC_BASIC_AUTH_PASS,
  })
  return auth(c, next)
}).get('/doc', swaggerUI({ url: '/api/specification' }))


export type AppType = typeof _route
export default app