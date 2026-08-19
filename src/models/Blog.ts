import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IBlogImage {
  url: string;
  altText?: string;
  caption?: string;
  order?: number;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  featuredImage?: IBlogImage;
  galleryImages?: IBlogImage[];
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
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogImageSchema = new Schema({
  url: { type: String, required: true },
  altText: { type: String, default: '' },
  caption: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    featuredImage: { type: BlogImageSchema },
    galleryImages: [{ type: BlogImageSchema }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    readTime: { type: String, default: '5 min read' },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogSchema.index({ status: 1 });
BlogSchema.index({ isFeatured: 1 });
BlogSchema.index({ category: 1 });

export default models.Blog || model<IBlog>('Blog', BlogSchema);
