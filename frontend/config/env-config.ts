import { z } from 'zod'

const configSchema = z.object({
  EXPO_PUBLIC_API_ENDPOINT: z.string(),
  EXPO_PUBLIC_LOCAL_URL: z.string(),
})

const configProject = configSchema.safeParse({
  EXPO_PUBLIC_API_ENDPOINT: process.env.EXPO_PUBLIC_API_ENDPOINT,
  EXPO_PUBLIC_LOCAL_URL: process.env.EXPO_PUBLIC_LOCAL_URL,
})

if (!configProject.success) {
  console.error(configProject.error.issues)
  throw new Error('.env file is not configured correctly')
}

const envConfig = configProject.data
export default envConfig
