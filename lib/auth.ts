import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

// helper to extract userId from the Authorization header
export function getUserId(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/, '');
  try {
    const { userId } = verifyToken(token);
    return userId;
  } catch {
    return null;
  }
}
