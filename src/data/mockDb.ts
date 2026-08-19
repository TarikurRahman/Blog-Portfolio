import { Project, BlogPost, Skill, Service, Testimonial, Experience, User, Comment, ContactMessage, SiteSettings } from './types';
import { defaultProjects } from './projects';
import { defaultBlogs } from './blogs';
import { defaultSkills } from './skills';
import { defaultServices } from './services';
import { defaultTestimonials } from './testimonials';
import { defaultExperience } from './experience';
import { defaultUsers, UserRecord } from './users';
import { defaultComments } from './comments';

const isBrowser = typeof window !== 'undefined';

const KEYS = {
  PROJECTS: 'portfolio_projects',
  BLOGS: 'portfolio_blogs',
  SKILLS: 'portfolio_skills',
  SERVICES: 'portfolio_services',
  TESTIMONIALS: 'portfolio_testimonials',
  EXPERIENCE: 'portfolio_experience',
  USERS: 'portfolio_users',
  COMMENTS: 'portfolio_comments',
  CONTACTS: 'portfolio_contacts',
  SETTINGS: 'portfolio_settings',
  LOGGED_IN: 'portfolio_logged_in_user'
};

export const defaultSettings: SiteSettings = {
  websiteTitle: "Tarikur. - Creative Developer Portfolio",
  logoText: "Tarikur.",
  heroTitle: "Hi, I'm Tarikur",
  heroSubtitle: "I Build Digital Experiences",
  heroIntro: "I am a frontend developer and no-code architect specializing in building clean, high-performance, and pixel-perfect applications with Next.js, Tailwind, Shopify, and Bubble.io.",
  aboutBadge: "About Me",
  aboutTitle: "Building Modern Web Experiences",
  aboutBio: "I am a frontend developer who loves translating complex ideas into elegant, responsive digital solutions.",
  aboutDescription: "With professional expertise in React, Next.js, Shopify Liquid custom templating, and Bubble.io workflows, I build applications that excel in speed, UX, and SEO. I am dedicated to writing clean, maintainable code that scales.",
  cvUrl: "#",
  email: "contact@tarikur.dev",
  phone: "+880 1700 000000",
  location: "Dhaka, Bangladesh",
  availability: "Available for new projects",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  twitterUrl: "https://twitter.com",
  seoMetaTitle: "Tarikur Rahman | Modern Developer Portfolio",
  seoMetaDescription: "Professional portfolio of Tarikur Rahman, a Next.js, Shopify, and Bubble.io No-Code Developer specializing in UI/UX and web performance.",
  seoKeywords: "Next.js, React, Tailwind CSS, Shopify, Bubble.io, No-code developer, Portfolio"
};

// Seeding the Database
export const initDb = () => {
  if (!isBrowser) return;

  if (!localStorage.getItem(KEYS.PROJECTS)) {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(defaultProjects));
  }
  if (!localStorage.getItem(KEYS.BLOGS)) {
    localStorage.setItem(KEYS.BLOGS, JSON.stringify(defaultBlogs));
  }
  if (!localStorage.getItem(KEYS.SKILLS)) {
    localStorage.setItem(KEYS.SKILLS, JSON.stringify(defaultSkills));
  }
  if (!localStorage.getItem(KEYS.SERVICES)) {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(defaultServices));
  }
  if (!localStorage.getItem(KEYS.TESTIMONIALS)) {
    localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(defaultTestimonials));
  }
  if (!localStorage.getItem(KEYS.EXPERIENCE)) {
    localStorage.setItem(KEYS.EXPERIENCE, JSON.stringify(defaultExperience));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(KEYS.COMMENTS)) {
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(defaultComments));
  }
  if (!localStorage.getItem(KEYS.CONTACTS)) {
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
};

// Helper to get from localstorage or fallback to defaults
const getStorageItem = <T>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

const setStorageItem = <T>(key: string, data: T): void => {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockDb = {
  // Projects CRUD
  getProjects: (): Project[] => getStorageItem<Project[]>(KEYS.PROJECTS, defaultProjects),
  getProjectById: (id: string): Project | undefined => {
    return mockDb.getProjects().find(p => p.id === id);
  },
  addProject: (project: Omit<Project, 'id'>): Project => {
    const projects = mockDb.getProjects();
    const newProject: Project = {
      ...project,
      id: 'p_' + Date.now()
    };
    projects.push(newProject);
    setStorageItem(KEYS.PROJECTS, projects);
    return newProject;
  },
  updateProject: (updatedProject: Project): Project => {
    const projects = mockDb.getProjects();
    const index = projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      projects[index] = updatedProject;
      setStorageItem(KEYS.PROJECTS, projects);
    }
    return updatedProject;
  },
  deleteProject: (id: string): void => {
    const projects = mockDb.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    setStorageItem(KEYS.PROJECTS, filtered);
  },

  // Blogs CRUD
  getBlogs: (): BlogPost[] => getStorageItem<BlogPost[]>(KEYS.BLOGS, defaultBlogs),
  getBlogById: (id: string): BlogPost | undefined => {
    return mockDb.getBlogs().find(b => b.id === id);
  },
  getBlogBySlug: (slug: string): BlogPost | undefined => {
    return mockDb.getBlogs().find(b => b.slug === slug);
  },
  addBlog: (blog: Omit<BlogPost, 'id' | 'likes' | 'commentsCount' | 'date'>): BlogPost => {
    const blogs = mockDb.getBlogs();
    const newBlog: BlogPost = {
      ...blog,
      id: 'b_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      commentsCount: 0,
      views: 0,
      status: blog.status || 'Published'
    };
    blogs.push(newBlog);
    setStorageItem(KEYS.BLOGS, blogs);
    return newBlog;
  },
  updateBlog: (updatedBlog: BlogPost): BlogPost => {
    const blogs = mockDb.getBlogs();
    const index = blogs.findIndex(b => b.id === updatedBlog.id);
    if (index !== -1) {
      blogs[index] = updatedBlog;
      setStorageItem(KEYS.BLOGS, blogs);
    }
    return updatedBlog;
  },
  deleteBlog: (id: string): void => {
    const blogs = mockDb.getBlogs();
    const filtered = blogs.filter(b => b.id !== id);
    setStorageItem(KEYS.BLOGS, filtered);
  },
  importBlogs: (blogsToImport: Omit<BlogPost, 'id' | 'likes' | 'commentsCount' | 'date'>[]): void => {
    const blogs = mockDb.getBlogs();
    blogsToImport.forEach((b, index) => {
      const newBlog: BlogPost = {
        ...b,
        id: 'b_' + (Date.now() + index),
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        commentsCount: 0,
        views: 0,
        status: b.status || 'Published'
      };
      blogs.push(newBlog);
    });
    setStorageItem(KEYS.BLOGS, blogs);
  },
  likeBlog: (id: string, userEmail: string): boolean => {
    const blogs = mockDb.getBlogs();
    const blogIndex = blogs.findIndex(b => b.id === id);
    if (blogIndex === -1) return false;

    // Check user liked blogs list
    const users = getStorageItem<UserRecord[]>(KEYS.USERS, defaultUsers);
    const userIndex = users.findIndex(u => u.email === userEmail);
    if (userIndex === -1) return false;

    const user = users[userIndex];
    if (!user.likedBlogs) user.likedBlogs = [];

    const isLiked = user.likedBlogs.includes(id);
    if (isLiked) {
      // Unlike
      user.likedBlogs = user.likedBlogs.filter(bId => bId !== id);
      blogs[blogIndex].likes = Math.max(0, blogs[blogIndex].likes - 1);
    } else {
      // Like
      user.likedBlogs.push(id);
      blogs[blogIndex].likes += 1;
    }

    users[userIndex] = user;
    setStorageItem(KEYS.USERS, users);
    setStorageItem(KEYS.BLOGS, blogs);

    // If logged in user is this user, sync local state
    const loggedIn = getStorageItem<User | null>(KEYS.LOGGED_IN, null);
    if (loggedIn && loggedIn.email === userEmail) {
      loggedIn.likedBlogs = user.likedBlogs;
      setStorageItem(KEYS.LOGGED_IN, loggedIn);
    }

    return !isLiked; // returns true if now liked, false if unliked
  },

  // Skills
  getSkills: (): Skill[] => getStorageItem<Skill[]>(KEYS.SKILLS, defaultSkills),

  // Services
  getServices: (): Service[] => getStorageItem<Service[]>(KEYS.SERVICES, defaultServices),

  // Testimonials
  getTestimonials: (): Testimonial[] => getStorageItem<Testimonial[]>(KEYS.TESTIMONIALS, defaultTestimonials),

  // Experience
  getExperience: (): Experience[] => getStorageItem<Experience[]>(KEYS.EXPERIENCE, defaultExperience),

  // Comments CRUD
  getComments: (blogId?: string): Comment[] => {
    const comments = getStorageItem<Comment[]>(KEYS.COMMENTS, defaultComments);
    if (blogId) {
      return comments.filter(c => c.blogId === blogId);
    }
    return comments;
  },
  addComment: (comment: Omit<Comment, 'id' | 'date' | 'approved'>): Comment => {
    const comments = getStorageItem<Comment[]>(KEYS.COMMENTS, defaultComments);
    const newComment: Comment = {
      ...comment,
      id: 'c_' + Date.now(),
      date: new Date().toISOString(),
      approved: true // Auto approve comments for mock DB to show UX instantly
    };
    comments.push(newComment);
    setStorageItem(KEYS.COMMENTS, comments);

    // Update commentsCount inside blogs
    const blogs = mockDb.getBlogs();
    const blogIndex = blogs.findIndex(b => b.id === comment.blogId);
    if (blogIndex !== -1) {
      blogs[blogIndex].commentsCount += 1;
      setStorageItem(KEYS.BLOGS, blogs);
    }

    return newComment;
  },
  toggleCommentApproval: (id: string): Comment | undefined => {
    const comments = getStorageItem<Comment[]>(KEYS.COMMENTS, defaultComments);
    const index = comments.findIndex(c => c.id === id);
    if (index !== -1) {
      comments[index].approved = !comments[index].approved;
      setStorageItem(KEYS.COMMENTS, comments);
      return comments[index];
    }
    return undefined;
  },
  deleteComment: (id: string): void => {
    const comments = getStorageItem<Comment[]>(KEYS.COMMENTS, defaultComments);
    const commentToDelete = comments.find(c => c.id === id);
    if (!commentToDelete) return;

    const filtered = comments.filter(c => c.id !== id);
    setStorageItem(KEYS.COMMENTS, filtered);

    // Update commentsCount inside blogs
    const blogs = mockDb.getBlogs();
    const blogIndex = blogs.findIndex(b => b.id === commentToDelete.blogId);
    if (blogIndex !== -1) {
      blogs[blogIndex].commentsCount = Math.max(0, blogs[blogIndex].commentsCount - 1);
      setStorageItem(KEYS.BLOGS, blogs);
    }
  },

  // Users CRUD
  getUsers: (): UserRecord[] => getStorageItem<UserRecord[]>(KEYS.USERS, defaultUsers),
  addUser: (user: UserRecord): UserRecord => {
    const users = mockDb.getUsers();
    users.push(user);
    setStorageItem(KEYS.USERS, users);
    return user;
  },
  updateUser: (updatedUser: User): User => {
    const users = mockDb.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = {
        ...users[index],
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        avatar: updatedUser.avatar,
        savedBlogs: updatedUser.savedBlogs || [],
        likedBlogs: updatedUser.likedBlogs || []
      };
      setStorageItem(KEYS.USERS, users);
    }
    return updatedUser;
  },
  deleteUser: (id: string): void => {
    const users = mockDb.getUsers();
    const filtered = users.filter(u => u.id !== id);
    setStorageItem(KEYS.USERS, filtered);
  },

  // Contacts
  getMessages: (): ContactMessage[] => getStorageItem<ContactMessage[]>(KEYS.CONTACTS, []),
  addMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>): ContactMessage => {
    const messages = mockDb.getMessages();
    const newMessage: ContactMessage = {
      ...msg,
      id: 'msg_' + Date.now(),
      date: new Date().toISOString(),
      read: false
    };
    messages.push(newMessage);
    setStorageItem(KEYS.CONTACTS, messages);
    return newMessage;
  },
  markMessageRead: (id: string): ContactMessage | undefined => {
    const messages = mockDb.getMessages();
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
      messages[index].read = true;
      setStorageItem(KEYS.CONTACTS, messages);
      return messages[index];
    }
    return undefined;
  },
  deleteMessage: (id: string): void => {
    const messages = mockDb.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    setStorageItem(KEYS.CONTACTS, filtered);
  },

  // Site Settings
  getSettings: (): SiteSettings => getStorageItem<SiteSettings>(KEYS.SETTINGS, defaultSettings),
  updateSettings: (settings: SiteSettings): SiteSettings => {
    setStorageItem(KEYS.SETTINGS, settings);
    return settings;
  }
};
