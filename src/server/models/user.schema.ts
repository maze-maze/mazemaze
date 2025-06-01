import { user } from '🎙️/db/schema'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from "zod";

export const UserSelectSchema = createSelectSchema(user)
export const UserInsertSchema = createInsertSchema(user, {
  username: schema => schema.min(3).max(10),
})

export const usernameSchema = UserSelectSchema.pick({
  username: true,
})

export const usernameInsertSchema = UserInsertSchema.pick({
  username: true,
})

export const UserCheckQuerySchema = z.object({
  username: z.string(),
});
