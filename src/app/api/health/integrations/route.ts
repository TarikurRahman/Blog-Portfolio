import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckResult {
  configured: boolean;
  ok: boolean;
  status: 'ok' | 'missing' | 'error' | 'skipped';
  message: string;
}

const timeout = (milliseconds: number) =>
  AbortSignal.timeout(milliseconds);

const configured = (values: Array<string | undefined>) =>
  values.every((value) => Boolean(value && value.trim()));

function result(
  status: CheckResult['status'],
  message: string,
  isConfigured: boolean = status !== 'missing'
): CheckResult {
  return {
    configured: isConfigured,
    ok: status === 'ok',
    status,
    message,
  };
}

async function checkFirebase(): Promise<CheckResult> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const required = [
    apiKey,
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId,
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ];

  if (!configured(required)) {
    return result('missing', 'Firebase configuration is incomplete.', false);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${encodeURIComponent(apiKey!)}`,
      { signal: timeout(5000), cache: 'no-store' }
    );

    if (!response.ok) {
      const body = await response.text();
      if (body.includes('CONFIGURATION_NOT_FOUND')) {
        return result('error', 'Firebase API is reachable, but Firebase Authentication is not configured for this project.');
      }
      return result('error', `Firebase config request returned HTTP ${response.status}.`);
    }

    return result('ok', 'Firebase configuration was accepted by the Firebase API.');
  } catch {
    return result('error', 'Firebase API could not be reached.');
  }
}

async function checkMongoDB(): Promise<CheckResult> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<db_password>') || uri.includes('your_password')) {
    return result('missing', 'MongoDB URI is missing or still contains a placeholder.', false);
  }

  try {
    await connectDB();
    await mongoose.connection.db?.admin().ping();
    return result('ok', 'MongoDB authentication and ping succeeded.');
  } catch (error) {
    const message = error instanceof Error && error.message.includes('authentication failed')
      ? 'MongoDB rejected the configured credentials.'
      : 'MongoDB connection or ping failed.';
    return result('error', message);
  }
}

async function checkEmail(): Promise<CheckResult> {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const password = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);

  if (!configured([user, password])) {
    return result('missing', 'Email credentials are not configured.', false);
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
    await transporter.verify();
    return result('ok', 'SMTP server accepted the connection and credentials.');
  } catch {
    return result('error', 'SMTP connection or authentication failed.');
  }
}

async function checkImgBB(): Promise<CheckResult> {
  const apiKey = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    return result('missing', 'ImgBB API key is not configured.', false);
  }

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: 'GET', signal: timeout(5000), cache: 'no-store' }
    );

    if (response.status === 401 || response.status === 403) {
      return result('error', 'ImgBB rejected the configured API key.');
    }

    return result('ok', 'ImgBB API endpoint is reachable and the key was not rejected.');
  } catch {
    return result('error', 'ImgBB API could not be reached.');
  }
}

async function checkCloudinary(): Promise<CheckResult> {
  const values = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ];

  if (!configured(values)) {
    return result('skipped', 'Cloudinary is not configured.', false);
  }

  try {
    cloudinary.config({
      cloud_name: values[0],
      api_key: values[1],
      api_secret: values[2],
    });
    await cloudinary.api.ping();
    return result('ok', 'Cloudinary authentication and ping succeeded.');
  } catch {
    return result('error', 'Cloudinary authentication or ping failed.');
  }
}

function checkJwt(): CheckResult {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your_secret_key_here') {
    return result('missing', 'JWT secret is missing or still a placeholder.', false);
  }

  try {
    const token = jwt.sign({ healthCheck: true }, secret, { expiresIn: '1m' });
    jwt.verify(token, secret);
    return result('ok', 'JWT signing and verification succeeded.');
  } catch {
    return result('error', 'JWT signing or verification failed.');
  }
}

export async function GET() {
  const checks = {
    firebase: await checkFirebase(),
    mongodb: await checkMongoDB(),
    email: await checkEmail(),
    imgbb: await checkImgBB(),
    cloudinary: await checkCloudinary(),
    jwt: checkJwt(),
  };

  const requiredChecks = Object.entries(checks).filter(([, check]) => check.status !== 'skipped');
  const healthy = requiredChecks.every(([, check]) => check.ok);

  return NextResponse.json(
    {
      success: healthy,
      status: healthy ? 'ok' : 'degraded',
      checkedAt: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
