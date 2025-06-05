import { z } from '@hono/zod-openapi'
import { user } from '🎙️/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const UserSelectSchema = createSelectSchema(user)
export const UserInsertSchema = createInsertSchema(user, {
  username: schema => schema.min(3).max(10),
})

export const UsernameSelectSchema = UserSelectSchema.pick({
  username: true,
})

export const UsernameInsertSchema = UserInsertSchema.pick({
  username: true,
})

export const UserCheckQuerySchema = z.object({
  username: z.string(),
}).openapi('UserCheckQuery')

export const UserCheckResponseSchema = z.object({
  available: z.boolean(),
}).openapi('UserCheckResponse')
