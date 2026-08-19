import { User } from './types';

export interface UserRecord extends User {
  passwordHash: string; // client-side password verification
}

export const defaultUsers: UserRecord[] = [
  {
    id: 'u1',
    name: 'Tarikur Rahman',
    email: 'tarikurrahman2008@gmail.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    emailVerified: true,
    createdAt: '2026-01-15T08:00:00.000Z',
    passwordHash: '12@#$%34',
    savedBlogs: [],
    likedBlogs: []
  }
];
