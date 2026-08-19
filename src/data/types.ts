export interface Project {
  id: string;
  title: string;
  category: 'Frontend' | 'Shopify' | 'Bubble.io' | 'UI/UX';
  description: string;
  longDescription: string;
  tags: string[];
  image: string;
  status: 'Completed' | 'In Progress';
  liveUrl: string;
  githubUrl: string;
  features: string[];
  challenge: string;
  solution: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  category: 'Frontend' | 'Shopify' | 'Bubble.io' | 'SEO' | 'UI/UX';
  readTime: string;
  likes: number;
  commentsCount: number;
  views: number;
  image?: string;
  status?: 'Draft' | 'Published';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'nocode' | 'optimization';
  level: number; // 0-100
  iconName: string; // lucide icon identifier
}

export interface Service {
  id: string;
  title: string;
  iconName: string;
  description: string;
  bullets: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  stars: number;
  text: string;
  avatar: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  tags: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  avatar: string;
  emailVerified?: boolean;
  createdAt: string;
  savedBlogs?: string[]; // blogIds
  likedBlogs?: string[]; // blogIds
  bio?: string;
  profession?: string;
  website?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface Comment {
  id: string;
  blogId: string;
  blogTitle?: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  content: string;
  date: string;
  approved: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  replyMessage?: string;
  repliedAt?: string;
  status?: string;
}

export interface SiteSettings {
  websiteTitle: string;
  logoText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroIntro: string;
  aboutBadge: string;
  aboutTitle: string;
  aboutBio: string;
  aboutDescription: string;
  cvUrl: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
}
