import { Testimonial } from './types';

export const defaultTestimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'Product Manager',
    company: 'DevFlow Technologies',
    stars: 5,
    text: 'Tarikur built our main app frontend using Next.js. His speed was incredible, and the animations were so smooth. He is our go-to frontend developer!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 't2',
    name: 'David Chen',
    role: 'Founder',
    company: 'ShopPulse',
    stars: 5,
    text: 'We hired Tarikur to redesign our Shopify store and optimize the page speed. Our Lighthouse performance score went from 45 to 95, and sales have increased significantly.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 't3',
    name: 'Emily Rodriguez',
    role: 'Operations Director',
    company: 'Stellar Agency',
    stars: 5,
    text: 'Working with Tarikur on our Bubble.io application was a seamless experience. He understood our workflows, automated key tasks, and completed the project ahead of schedule.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
  }
];
