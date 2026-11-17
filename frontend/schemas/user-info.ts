import { z } from 'zod'

export const UserSchema = z.object({
  name: z.string().min(1, {
    message: 'Tên không được để trống',
  }),
})

export type UserSchemaType = z.infer<typeof UserSchema>