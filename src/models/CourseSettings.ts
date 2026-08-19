import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICourseSettings extends Document {
  homeBannerTitle: string;
  homeBannerSubtitle: string;
  homeBannerImageUrl?: string;
  homeBannerCtaText: string;
  homeBannerCtaLink: string;
  paymentInstructions: string;
  paymentMethods: Array<{ name: string; details: string; status: 'active' | 'inactive' }>;
  supportContact: string;
  showCourseSectionOnHome: boolean;
  updatedAt: Date;
}

const CourseSettingsSchema = new Schema<ICourseSettings>(
  {
    homeBannerTitle: { type: String, default: 'Start Learning Practical Web Development' },
    homeBannerSubtitle: { type: String, default: 'Learn by building real projects with clear step-by-step lessons.' },
    homeBannerImageUrl: { type: String, default: '' },
    homeBannerCtaText: { type: String, default: 'Explore Courses' },
    homeBannerCtaLink: { type: String, default: '/courses' },
    paymentInstructions: { type: String, default: 'Please send the course amount to one of our mobile banking numbers and fill up the checkout form.' },
    paymentMethods: [{
      name: { type: String, required: true },
      details: { type: String, required: true },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }],
    supportContact: { type: String, default: '' },
    showCourseSectionOnHome: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.CourseSettings || model<ICourseSettings>('CourseSettings', CourseSettingsSchema);
