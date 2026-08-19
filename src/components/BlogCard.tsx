'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ThumbsUp, MessageSquare, ArrowRight, Eye } from 'lucide-react';
import { BlogPost } from '../data/types';
import OptimizedImage from './OptimizedImage';
import Card from './Card';

interface BlogCardProps {
  blog: BlogPost;
}

export const BlogCard = ({ blog }: BlogCardProps) => {
  const { id, title, excerpt, date, category, readTime, likes, commentsCount, views, author } = blog;

  return (
    <Card hoverEffect className="flex flex-col h-full overflow-hidden p-0! border border-brand-border-white">
      {/* Category and Read time Meta overlay */}
      <div className="relative aspect-video w-full bg-brand-card-dark overflow-hidden">
        {/* Placeholder image generator or unsplash based on category */}
        <OptimizedImage
          src={
            blog.image || (
              category === 'Frontend' ? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80' :
              category === 'Shopify' ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80' :
              category === 'Bubble.io' ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' :
              category === 'SEO' ? 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80' :
              'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&q=80'
            )
          }
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <span className="absolute top-3 left-3 bg-brand-bg/90 border border-brand-accent/30 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-brand-accent uppercase tracking-wider">
          {category}
        </span>
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Date / Read time */}
        <div className="flex items-center gap-4 text-[10px] text-brand-text-muted mb-3 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readTime}
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-2 line-clamp-2 hover:text-brand-accent transition-colors duration-300">
          <Link href={`/blog/${id}`}>{title}</Link>
        </h3>
        <p className="text-xs text-brand-text-muted mb-5 leading-relaxed line-clamp-3">
          {excerpt}
        </p>

        {/* Footer info: Author & metrics */}
        <div className="mt-auto pt-4 border-t border-brand-border-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={author.avatar}
              alt={author.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
              }}
              className="w-6.5 h-6.5 rounded-full object-cover border border-brand-border-white"
            />
            <div>
              <p className="text-[10px] font-bold text-white leading-none">{author.name}</p>
              <p className="text-[8px] text-brand-text-muted mt-0.5">{author.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-brand-text-muted font-semibold">
            <span className="flex items-center gap-1 hover:text-brand-accent transition-colors" title="Likes">
              <ThumbsUp className="w-3.5 h-3.5" />
              {likes}
            </span>
            <span className="flex items-center gap-1 hover:text-brand-accent transition-colors" title="Comments">
              <MessageSquare className="w-3.5 h-3.5" />
              {commentsCount}
            </span>
            <span className="flex items-center gap-1 hover:text-brand-accent transition-colors" title="Views">
              <Eye className="w-3.5 h-3.5" />
              {views || 0}
            </span>
          </div>
        </div>

        {/* Read More button */}
        <Link href={`/blog/${id}`} className="mt-4 text-xs font-bold text-brand-accent hover:text-white transition-colors flex items-center gap-1">
          Read Article <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};

export default BlogCard;
