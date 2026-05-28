import { NextRequest } from 'next/server';

// GET /api/debug — check environment and database connection
export async function GET(request: NextRequest) {
  const info: Record<string, unknown> = {
    env: process.env.VERCEL_ENV || 'unknown',
    node: process.version,
    envKeys: Object.keys(process.env)
      .filter(k => !k.includes('TOKEN') && !k.includes('SECRET') && !k.includes('PASSWORD') && !k.includes('KEY'))
      .sort(),
  };

  const dbUrl = process.env.DATABASE_URL || process.env.xhs_POSTGRES_URL;
  info.database = {
    hasUrl: !!dbUrl,
    urlLength: dbUrl?.length || 0,
    urlPrefix: dbUrl ? dbUrl.substring(0, 20) + '...' : '(not set)',
  };

  const dbInfo: Record<string, unknown> = {
    hasUrl: !!dbUrl,
    urlLength: dbUrl?.length || 0,
    urlPrefix: dbUrl ? dbUrl.substring(0, 20) + '...' : '(not set)',
  };
  info.database = dbInfo;

  // Try connecting
  try {
    const postgres = (await import('postgres')).default;
    if (!dbUrl) {
      dbInfo.error = 'No DATABASE_URL or xhs_POSTGRES_URL found';
    } else {
      const sql = postgres(dbUrl, { prepare: false, connection: { attempts: 1 } });
      const result = await sql`SELECT 1 as test`;
      dbInfo.connected = true;
      dbInfo.testResult = result;
      await sql.end();
    }
  } catch (dbErr) {
    dbInfo.connected = false;
    dbInfo.error = dbErr instanceof Error ? dbErr.message : String(dbErr);
  }

  return Response.json({ ok: true, data: info });
}
