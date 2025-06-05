import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { env } from '🎙️/env.mjs'
import { basicAuth } from 'hono/basic-auth'
import { checkUsernameHandler, getusernameHandler, setusernameHandler } from './controllers/user.controller'
import { checkUsernameRoute, getusernameRoute, setusernameRoute } from './routes/user.route'

export const app = new OpenAPIHono().basePath('/api')

const userApp = new OpenAPIHono()
  .openapi(getusernameRoute, getusernameHandler)
  .openapi(setusernameRoute, setusernameHandler)

const checkUserApp = new OpenAPIHono()
  .openapi(checkUsernameRoute, checkUsernameHandler)

const mainApp = new OpenAPIHono()
  .route('/me/username', userApp)
  .route('/username/check', checkUserApp)

app.route('/', mainApp)

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

export default app
