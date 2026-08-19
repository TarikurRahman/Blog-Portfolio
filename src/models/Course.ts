import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  price: number;
  salePrice?: number;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  totalDurationMinutes: number;
  totalLessons: number;
  isFeatured: boolean;
  showOnHome: boolean;
  badge: "none" | "new" | "bestseller" | "featured";
  whatYouWillLearn: string[];
  requirements: string[];
  faq?: Array<{ question: string; answer: string }>;
  status: "draft" | "published" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    bannerUrl: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    salePrice: { type: Number },
    category: { type: String, required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    totalDurationMinutes: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    showOnHome: { type: Boolean, default: false },
    badge: { type: String, enum: ["none", "new", "bestseller", "featured"], default: "none" },
    whatYouWillLearn: [{ type: String }],
    requirements: [{ type: String }],
    faq: [{
      question: { type: String },
      answer: { type: String }
    }],
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

CourseSchema.index({ status: 1, isFeatured: 1 });

export default models.Course || model<ICourse>('Course', CourseSchema);
