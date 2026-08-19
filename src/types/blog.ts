export interface BlogImage {
  url: string;
  altText?: string;
  caption?: string;
  order?: number;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
  };
  featuredImage?: BlogImage;
  galleryImages?: BlogImage[];
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  readTime: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
