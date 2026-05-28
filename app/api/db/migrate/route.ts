import { NextRequest } from 'next/server';
import postgres from 'postgres';

// GET /api/db/migrate — create all database tables
export async function GET(request: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.xhs_POSTGRES_URL;
    if (!dbUrl) {
      return Response.json({ ok: false, error: 'No database URL found' });
    }

    const sql = postgres(dbUrl, { prepare: false });

    // Create tables by pushing schema
    // We use raw SQL since drizzle-kit isn't available at runtime
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        api_key TEXT NOT NULL UNIQUE,
        brand_name TEXT DEFAULT '',
        brand_category TEXT DEFAULT '',
        brand_website TEXT DEFAULT '',
        brand_desc TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS wishlist_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kol_id TEXT NOT NULL,
        kol_name TEXT NOT NULL,
        kol_avatar TEXT DEFAULT '',
        kol_desc TEXT DEFAULT '',
        kol_url TEXT DEFAULT '',
        followers INTEGER DEFAULT 0,
        following INTEGER DEFAULT 0,
        notes_count INTEGER DEFAULT 0,
        avg_likes REAL DEFAULT 0,
        avg_collects REAL DEFAULT 0,
        avg_comments REAL DEFAULT 0,
        engagement_rate REAL DEFAULT 0,
        category TEXT DEFAULT '',
        score REAL DEFAULT 0,
        score_breakdown JSONB DEFAULT '{"engagement":0,"popularity":0,"activity":0}',
        recent_notes JSONB DEFAULT '[]',
        tags JSONB DEFAULT '[]',
        notes TEXT DEFAULT '',
        status TEXT DEFAULT 'pending',
        estimated_budget REAL DEFAULT 0,
        last_contacted TIMESTAMP,
        contact_history JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        brand_name TEXT NOT NULL,
        product_name TEXT NOT NULL,
        selling_points TEXT DEFAULT '',
        format TEXT DEFAULT '图文',
        budget TEXT DEFAULT '',
        tone_style TEXT DEFAULT 'friendly',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        campaign_id TEXT,
        kol_id TEXT NOT NULL,
        kol_name TEXT NOT NULL,
        message TEXT NOT NULL,
        tone_style TEXT DEFAULT 'friendly',
        status TEXT DEFAULT 'draft',
        sent_at TIMESTAMP,
        reply_at TIMESTAMP,
        reply_text TEXT,
        ai_intent TEXT,
        follow_up_at TIMESTAMP,
        follow_up_message TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        auto_score BOOLEAN DEFAULT TRUE,
        score_weights JSONB DEFAULT '{"engagement":0.4,"popularity":0.3,"activity":0.3}',
        theme TEXT DEFAULT 'dark',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS scheduled_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        due_at TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
    ];

    const results: Record<string, string> = {};
    for (const sqlStmt of tables) {
      const tableName = sqlStmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
      try {
        await sql.unsafe(sqlStmt);
        results[tableName] = 'created';
      } catch (err) {
        results[tableName] = `error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    await sql.end();

    return Response.json({ ok: true, data: results });
  } catch (err) {
    return Response.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
