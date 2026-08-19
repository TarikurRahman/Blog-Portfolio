export interface ProjectImage {
  url: string;
  altText?: string;
  caption?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category: 'Frontend' | 'Shopify' | 'Bubble.io' | 'UI/UX';
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  galleryImages?: ProjectImage[];
  technologies: string[];
  features: string[];
  liveUrl?: string;
  githubUrl?: string;
  status: 'Completed' | 'In Progress';
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
}
