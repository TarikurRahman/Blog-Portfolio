import connectDB from './mongodb';
import User from '../models/User';
import Project from '../models/Project';
import Blog from '../models/Blog';
import SiteSettings from '../models/SiteSettings';
import Service from '../models/Service';
import Skill from '../models/Skill';
import Experience from '../models/Experience';
import Education from '../models/Education';
import { AuthHelper } from './auth';

import { defaultProjects } from '../data/projects';
import { defaultBlogs } from '../data/blogs';
import { defaultSkills } from '../data/skills';
import { defaultServices } from '../data/services';
import { defaultExperience } from '../data/experience';

export async function seedDatabase() {
  await connectDB();

  // 1. Seed SiteSettings
  const settingsCount = await SiteSettings.countDocuments();
  if (settingsCount === 0) {
    console.log('Seeding SiteSettings...');
    await SiteSettings.create({
      websiteTitle: 'Tarikur. - Creative Developer Portfolio',
      logoText: 'Tarikur.',
      heroTitle: "Hi, I'm Tarikur",
      heroSubtitle: 'I Build Digital Experiences',
      heroIntro: 'I am a frontend developer and no-code architect specializing in building clean, high-performance, and pixel-perfect applications with Next.js, Tailwind, Shopify, and Bubble.io.',
      aboutBadge: 'About Me',
      aboutTitle: 'Building Modern Web Experiences',
      aboutBio: 'I am a frontend developer who loves translating complex ideas into elegant, responsive digital solutions.',
      aboutDescription: 'With professional expertise in React, Next.js, Shopify Liquid custom templating, and Bubble.io workflows, I build applications that excel in speed, UX, and SEO. I am dedicated to writing clean, maintainable code that scales.',
      cvUrl: '#',
      email: 'contact@tarikur.dev',
      phone: '+880 1700 000000',
      location: 'Dhaka, Bangladesh',
      availability: 'Available for new projects',
      githubUrl: 'https://github.com',
      linkedinUrl: 'https://linkedin.com',
      twitterUrl: 'https://twitter.com',
      seoMetaTitle: 'Tarikur Rahman | Modern Developer Portfolio',
      seoMetaDescription: 'Professional portfolio of Tarikur Rahman, a Next.js, Shopify, and Bubble.io No-Code Developer specializing in UI/UX and web performance.',
      seoKeywords: 'Next.js, React, Tailwind CSS, Shopify, Bubble.io, No-code developer, Portfolio'
    });
  }

  // 2. Seed Users (Admin only)
  const usersCount = await User.countDocuments();
  const adminPassword = '12@#$%34';
  let adminId = '';
  if (usersCount === 0) {
    console.log('Seeding Users...');
    const adminPasswordHash = await AuthHelper.hashPassword(adminPassword);

    const admin = await User.create({
      name: 'Tarikur Rahman',
      email: 'tarikurrahman2008@gmail.com',
      passwordHash: adminPasswordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      role: 'admin',
      status: 'active',
      bio: 'Professional Frontend Developer & No-Code Architect',
      profession: 'Frontend Architect',
      website: 'https://tarikur.dev',
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    });
    adminId = admin._id.toString();
  } else {
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      const passwordMatches = await AuthHelper.comparePassword(adminPassword, adminUser.passwordHash);
      if (adminUser.email !== 'tarikurrahman2008@gmail.com' || !passwordMatches) {
        adminUser.email = 'tarikurrahman2008@gmail.com';
        adminUser.passwordHash = await AuthHelper.hashPassword(adminPassword);
        await adminUser.save();
      }
      adminId = adminUser._id.toString();
    }
  }

  // 3. Seed Projects
  const projectsCount = await Project.countDocuments();
  if (projectsCount === 0) {
    console.log('Seeding Projects...');
    for (const proj of defaultProjects) {
      await Project.create({
        title: proj.title,
        slug: proj.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category: proj.category,
        shortDescription: proj.description,
        fullDescription: proj.longDescription,
        coverImage: proj.image,
        technologies: proj.tags,
        features: proj.features,
        liveUrl: proj.liveUrl,
        githubUrl: proj.githubUrl,
        status: proj.status,
        isFeatured: true,
        seoTitle: proj.seoTitle || proj.title,
        seoDescription: proj.seoDescription || proj.description,
        seoKeywords: proj.seoKeywords || proj.tags.join(', '),
      });
    }
  }

  // 4. Seed Blogs
  const blogsCount = await Blog.countDocuments();
  if (blogsCount === 0 && adminId) {
    console.log('Seeding Blogs...');
    for (const blog of defaultBlogs) {
      await Blog.create({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        tags: [blog.category],
        author: adminId,
        featuredImage: {
          url: blog.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
          altText: blog.title,
          caption: blog.excerpt
        },
        status: 'published',
        isFeatured: blog.likes > 10,
        readTime: blog.readTime,
        viewsCount: 100,
        likesCount: blog.likes,
        commentsCount: blog.commentsCount,
        seoTitle: blog.seoTitle || blog.title,
        seoDescription: blog.seoDescription || blog.excerpt,
        seoKeywords: blog.seoKeywords || blog.category,
        publishedAt: new Date(blog.date),
      });
    }
  }

  // 5. Seed Services
  const servicesCount = await Service.countDocuments();
  if (servicesCount === 0) {
    console.log('Seeding Services...');
    for (const s of defaultServices) {
      await Service.create({
        title: s.title,
        iconName: s.iconName,
        description: s.description,
        bullets: s.bullets,
      });
    }
  }

  // 6. Seed Skills
  const skillsCount = await Skill.countDocuments();
  if (skillsCount === 0) {
    console.log('Seeding Skills...');
    for (const s of defaultSkills) {
      await Skill.create({
        name: s.name,
        category: s.category,
        level: s.level,
        iconName: s.iconName,
      });
    }
  }

  // 7. Seed Experiences
  const experiencesCount = await Experience.countDocuments();
  if (experiencesCount === 0) {
    console.log('Seeding Experiences...');
    for (const e of defaultExperience) {
      await Experience.create({
        role: e.role,
        company: e.company,
        duration: e.duration,
        description: e.description,
        tags: e.tags,
      });
    }
  }

  // 8. Seed Education
  const educationCount = await Education.countDocuments();
  if (educationCount === 0) {
    console.log('Seeding Education...');
    const defaultEducation = [
      {
        degree: 'B.Sc. in Computer Science',
        institution: 'Global University of Technology',
        duration: '2017 - 2021',
        description: 'Specialized in Software Engineering, Database Systems, Web Architectures, and completed key projects on compiler design.'
      },
      {
        degree: 'Professional Web Design & Optimization Certified',
        institution: 'W3C Academy',
        duration: '2022',
        description: 'Rigorous coursework on advanced CSS, layout responsiveness, network bundle optimization, and Core Web Vitals algorithms.'
      }
    ];
    for (const edu of defaultEducation) {
      await Education.create({
        degree: edu.degree,
        institution: edu.institution,
        duration: edu.duration,
        description: edu.description,
      });
    }
  }
}
