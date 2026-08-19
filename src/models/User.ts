import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  provider: 'credentials' | 'google';
  firebaseUid?: string;
  emailVerified: boolean;
  bio?: string;
  profession?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
    avatarUrl: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
    firebaseUid: { type: String },
    emailVerified: { type: Boolean, default: false },
    bio: { type: String, default: '' },
    profession: { type: String, default: '' },
    website: { type: String, default: '' },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default models.User || model<IUser>('User', UserSchema);
