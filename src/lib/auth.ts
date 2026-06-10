import { cookies } from 'next/headers';
import { db } from './db';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isConfirmed: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    
    if (!token) return null;

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) return null;
    if (new Date() > session.expiresAt) {
      await db.session.delete({ where: { id: session.id } });
      return null;
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      isAdmin: session.user.isAdmin,
      isConfirmed: session.user.isConfirmed,
    };
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function deleteSession(token: string): Promise<void> {
  try {
    await db.session.delete({ where: { token } });
  } catch {
    // Session might not exist
  }
}
