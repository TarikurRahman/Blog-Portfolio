import { Schema, Document, model, models } from 'mongoose';

export interface IProjectImage {
  url: string;
  altText?: string;
  caption?: string;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  category: 'Frontend' | 'Shopify' | 'Bubble.io' | 'UI/UX';
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  galleryImages?: IProjectImage[];
  technologies: string[];
  features: string[];
  liveUrl?: string;
  githubUrl?: string;
  status: 'Completed' | 'In Progress';
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectImageSchema = new Schema({
  url: { type: String, required: true },
  altText: { type: String, default: '' },
  caption: { type: String, default: '' },
});

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, enum: ['Frontend', 'Shopify', 'Bubble.io', 'UI/UX'], required: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    coverImage: { type: String, required: true },
    galleryImages: [{ type: ProjectImageSchema }],
    technologies: [{ type: String }],
    features: [{ type: String }],
    liveUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    status: { type: String, enum: ['Completed', 'In Progress'], default: 'Completed' },
    isFeatured: { type: Boolean, default: false },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: String, default: '' },
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isFeatured: 1 });

export default models.Project || model<IProject>('Project', ProjectSchema);
