import { NextRequest } from 'next/server';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  userId: string;
  email: string;
}

/**
 * Extract and validate API key from Authorization header.
 * Returns the authenticated user or throws.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthUser> {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header. Use: Bearer <api_key>');
  }

  const apiKey = auth.slice(7).trim();
  if (!apiKey) {
    throw new AuthError('API key is empty');
  }

  const [user] = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.apiKey, apiKey))
    .limit(1);

  if (!user) {
    throw new AuthError('Invalid API key');
  }

  return { userId: user.id, email: user.email };
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Generate a secure API key */
export function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'xhs_';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
