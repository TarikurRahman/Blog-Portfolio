import { Schema, Document, model, models } from 'mongoose';

export interface ISiteSettings extends Document {
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
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    websiteTitle: { type: String, default: 'Tarikur Rahman | Portfolio' },
    logoText: { type: String, default: 'Tarikur.Dev' },
    heroTitle: { type: String, default: "Hi, I'm Tarikur" },
    heroSubtitle: { type: String, default: 'I Build Digital Experiences' },
    heroIntro: { type: String, default: 'I am a frontend developer and no-code architect specializing in building clean, high-performance, and pixel-perfect applications.' },
    aboutBadge: { type: String, default: 'My Bio' },
    aboutTitle: { type: String, default: 'Frontend developer and No-Code designer' },
    aboutBio: { type: String, default: 'Specializing in Next.js, TypeScript, Tailwind, Bubble.io, and Shopify.' },
    aboutDescription: { type: String, default: 'I build pixel-perfect layouts, responsive frontends, and dynamic no-code visual applications.' },
    cvUrl: { type: String, default: '#' },
    email: { type: String, default: 'tarikur@example.com' },
    phone: { type: String, default: '+880123456789' },
    location: { type: String, default: 'Dhaka, Bangladesh' },
    availability: { type: String, default: 'Available for freelance work' },
    githubUrl: { type: String, default: 'https://github.com' },
    linkedinUrl: { type: String, default: 'https://linkedin.com' },
    twitterUrl: { type: String, default: 'https://twitter.com' },
    seoMetaTitle: { type: String, default: 'Tarikur Rahman | Portfolio' },
    seoMetaDescription: { type: String, default: 'Professional portfolio website showing my frontend developer journey.' },
    seoKeywords: { type: String, default: 'Next.js, Tailwind, TypeScript, Bubble.io, Shopify' },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.SiteSettings || model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
