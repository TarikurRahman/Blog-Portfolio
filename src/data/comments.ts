import { Comment } from './types';

export const defaultComments: Comment[] = [
  {
    id: 'c1',
    blogId: 'b1',
    userName: 'John Doe',
    userEmail: 'john@gmail.com',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    content: 'This guide helped me fix a layout shift issue I was having with nested routers! Thanks Tarikur!',
    date: '2026-05-16T10:30:00.000Z',
    approved: true
  },
  {
    id: 'c2',
    blogId: 'b1',
    userName: 'Alice Smith',
    userEmail: 'alice@yahoo.com',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    content: 'Great article. How do you handle animations with loading.tsx boundaries? Does Framer Motion support it?',
    date: '2026-05-17T14:22:00.000Z',
    approved: true
  },
  {
    id: 'c3',
    blogId: 'b2',
    userName: 'Mark Peterson',
    userEmail: 'mark@peterson.io',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'Very detailed. Deferring scripts is often overlooked but yields major improvements in LCP scores.',
    date: '2026-05-21T09:12:00.000Z',
    approved: true
  }
];
