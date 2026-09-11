import { client } from './api/generated/client.gen'

// Relative requests use Vite's /api proxy during local development.
client.setConfig({ baseUrl: '' })

export * from './api/generated/sdk.gen'
export * from './api/generated/types.gen'
export * from './api/generated/@tanstack/react-query.gen'
