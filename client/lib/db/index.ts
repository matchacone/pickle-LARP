import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Use the Transaction mode pooler URL for Vercel serverless (port 6543).
// For migrations (drizzle-kit), use the direct connection URL instead.
const client = postgres(process.env.DATABASE_URL!)

export const db = drizzle(client, { schema })
