import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const client = postgres(connectionString, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}

/**
 * Lazy database proxy — same interface as drizzle(db, { schema }).
 * Internally initializes the connection on first property access,
 * so routes can import `db` at module scope without requiring env vars at build time.
 */
const _handler: ProxyHandler<object> = {
  get(_target, prop: string | symbol) {
    const d = getDb();
    const val = (d as any)[prop];
    return typeof val === 'function' ? val.bind(d) : val;
  },
  set(_target, prop: string | symbol, value: unknown) {
    (getDb() as any)[prop] = value;
    return true;
  },
};

export const db = new Proxy({}, _handler) as ReturnType<typeof drizzle>;

export { schema };
