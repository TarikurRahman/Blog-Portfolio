import React from 'react';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import BlogDetailContent from './BlogDetailContent';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const blog = isObjectId
      ? await Blog.findById(id).lean()
      : await Blog.findOne({ slug: id }).lean();

    if (!blog) {
      return {
        title: 'Article Not Found | Tarikur Rahman',
      };
    }

    const title = blog.seoTitle || blog.title;
    const description = blog.seoDescription || blog.excerpt || '';
    const imageUrl = blog.featuredImage?.url || blog.ogImage || '';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const pageUrl = `${siteUrl}/blog/${id}`;

    return {
      title: `${title} | Tarikur Rahman`,
      description,
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: 'Tarikur Rahman Portfolio',
        images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      }
    };
  } catch (err) {
    console.error('generateMetadata error:', err);
    return {
      title: 'Blog Article | Tarikur Rahman',
    };
  }
}

export default function BlogDetailPage() {
  return <BlogDetailContent />;
}
