import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

// Use the Supavisor connection string instead of direct database connection
const connectionString = process.env.DATABASE_URL!.replace(
  /db\.[a-z0-9]+\.supabase\.co:5432/,
  'aws-0-us-east-1.pooler.supabase.com:6543' // Replace with your region
)

const client = postgres(connectionString, { ssl: 'require' })
export const db = drizzle(client, { schema })
