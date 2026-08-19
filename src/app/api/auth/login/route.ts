import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Like from '@/models/Like';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return ApiResponse.error('Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return ApiResponse.error('Invalid email or password', 401);
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      return ApiResponse.error('Your account has been suspended by the admin.', 403);
    }

    const match = await AuthHelper.comparePassword(password, user.passwordHash);
    if (!match) {
      return ApiResponse.error('Invalid email or password', 401);
    }

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

    // Fetch user liked blogs
    const userLikes = await Like.find({ userId: user._id });
    const likedBlogs = userLikes.map(l => l.blogId.toString());

    const userSession = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatarUrl,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      savedBlogs: [], // Frontend compatibility
      likedBlogs,
    };

    return ApiResponse.success(userSession, 'Login successful');
  } catch (err: any) {
    console.error('Login error:', err);
    return ApiResponse.serverError(err.message || 'Failed to authenticate user');
  }
}
