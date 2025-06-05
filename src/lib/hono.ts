// lib/hono.ts
import type { AppType } from '🎙️/server/hono'
import process from 'node:process'
import { hc } from 'hono/client'

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL!)
