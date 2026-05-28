import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

// Use Vercel Postgres pooled connection
export const db = drizzle(sql, { schema });

export { schema };
