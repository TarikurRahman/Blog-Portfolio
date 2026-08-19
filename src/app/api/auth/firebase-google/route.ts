import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { AuthHelper } from '@/lib/auth';
import { adminAuth } from '@/lib/firebase-admin';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken) {
      return ApiResponse.error('Firebase ID token is required', 400);
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (err: any) {
      console.error('Firebase ID token verification failed:', err);
      return ApiResponse.error('Invalid ID token: ' + (err.message || 'Verification failed'), 401);
    }

    const { uid, email, name, picture, email_verified } = decodedToken;

    if (!email) {
      return ApiResponse.error('Email not provided by Google account details', 400);
    }

    // Check if the user already exists by email
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.status === 'blocked') {
        return ApiResponse.error('Your account has been blocked', 403);
      }

      // Update user provider & firebase details if they haven't been linked yet,
      // or update profile information (avatar, name) from Google if desired.
      let needsSave = false;
      if (user.provider !== 'google') {
        user.provider = 'google';
        needsSave = true;
      }
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        needsSave = true;
      }
      if (email_verified && !user.emailVerified) {
        user.emailVerified = true;
        needsSave = true;
      }
      if (picture && user.avatarUrl.includes('unsplash.com') && user.avatarUrl !== picture) {
        user.avatarUrl = picture;
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
      }
    } else {
      // Create new user linked with Google auth provider
      user = await User.create({
        name: name || email.split('@')[0] || 'Google User',
        email: email.toLowerCase(),
        avatarUrl: picture || undefined,
        provider: 'google',
        firebaseUid: uid,
        emailVerified: !!email_verified,
        role: 'user',
        status: 'active',
      });
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

    return ApiResponse.success(userSession, 'Successfully authenticated with Google', 200);
  } catch (err: any) {
    console.error('Firebase-google auth error:', err);
    return ApiResponse.serverError(err.message || 'Authentication failed');
  }
}
