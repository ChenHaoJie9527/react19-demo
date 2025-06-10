import { createContext } from 'react'
import { z } from 'zod'

export const AppSchema = z.object({
  user: z
    .object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })
    .optional(),
})

type AppState = z.infer<typeof AppSchema>

export const AppContext = createContext<AppState>({})
