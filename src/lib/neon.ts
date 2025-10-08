import { neon } from '@neondatabase/serverless'

// Neon database connection
const sql = neon(process.env.DATABASE_URL!)

export { sql }
