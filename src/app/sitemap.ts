import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Project from '@/models/Project';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tarikur.dev';
  
  let blogs: any[] = [];
  let projects: any[] = [];

  try {
    await connectDB();
    blogs = await Blog.find({ status: 'Published' }).select('slug updatedAt').lean();
    projects = await Project.find({ status: 'Completed' }).select('slug updatedAt').lean();
  } catch (e) {
    console.error('Sitemap generation DB fetch error:', e);
  }

  const routes = ['', '/about', '/projects', '/blog', '/contact', '/login', '/register'].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const blogRoutes = blogs.map(blog => ({
    url: `${baseUrl}/blog/${blog.slug || blog._id}`,
    lastModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const projectRoutes = projects.map(proj => ({
    url: `${baseUrl}/projects/${proj.slug || proj._id}`,
    lastModified: proj.updatedAt ? new Date(proj.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...blogRoutes, ...projectRoutes];
}
