import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export class AuthHelper {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: TokenPayload): string {
    if (!JWT_SECRET) {
      throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
    }
    if (JWT_SECRET === 'your_secret_key_here') {
      throw new Error('JWT_SECRET in .env.local is currently set to a placeholder value. Please configure it with a real secret key.');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string): TokenPayload | null {
    if (!JWT_SECRET) {
      throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
    }
    if (JWT_SECRET === 'your_secret_key_here') {
      throw new Error('JWT_SECRET in .env.local is currently set to a placeholder value. Please configure it with a real secret key.');
    }
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (e) {
      return null;
    }
  }

  static async getAuthPayload(): Promise<TokenPayload | null> {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('portfolio_auth_token');
    if (!tokenCookie || !tokenCookie.value) {
      return null;
    }
    return this.verifyToken(tokenCookie.value);
  }
}
