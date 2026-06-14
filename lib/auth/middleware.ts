import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db/mongodb';
import { Session } from '@/lib/db/models';

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function verifyAuth(req: NextRequest): Promise<{ userId: string | null; email: string | null; role: string | null }> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { userId: null, email: null, role: null };
    }

    await connectToDatabase();
    
    // Check if session exists
    const session = await Session.findOne({ token });
    if (!session || session.expiresAt < new Date()) {
      return { userId: null, email: null, role: null };
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { userId: null, email: null, role: null };
  }
}

export function generateAccessToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
}
