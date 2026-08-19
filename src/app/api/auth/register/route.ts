import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { Validators } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { name, email, password, avatarUrl } = body;

    const validationError = Validators.validateRegistration(name, email, password);
    if (validationError) {
      return ApiResponse.error(validationError, 400);
    }

    const exists = await User.findOne({ email: email.toLowerCase() }).lean();
    if (exists) {
      return ApiResponse.error('An account with this email already exists', 400);
    }

    const passwordHash = await AuthHelper.hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      avatarUrl: avatarUrl || undefined,
      role: 'user',
      status: 'active',
    });

    const token = AuthHelper.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('portfolio_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    const userSession = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatarUrl,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      savedBlogs: [],
      likedBlogs: [],
    };

    return ApiResponse.success(userSession, 'Registration successful', 201);
  } catch (err: any) {
    console.error('Registration error:', err);
    return ApiResponse.serverError(err.message || 'Failed to register user');
  }
}
