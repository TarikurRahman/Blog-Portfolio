import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISiteReview extends Document {
  name: string;
  email: string;
  userId?: mongoose.Types.ObjectId;
  avatarUrl?: string;
  overallRating: number;
  designRating: number;
  speedRating: number;
  contentRating: number;
  easeOfUseRating: number;
  impressedBy: string[];
  improvementSuggestions: string[];
  reviewText: string;
  wouldRecommend: boolean;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteReviewSchema = new Schema<ISiteReview>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    avatarUrl: { type: String, default: '' },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    designRating: { type: Number, required: true, min: 1, max: 5 },
    speedRating: { type: Number, required: true, min: 1, max: 5 },
    contentRating: { type: Number, required: true, min: 1, max: 5 },
    easeOfUseRating: { type: Number, required: true, min: 1, max: 5 },
    impressedBy: [{ type: String }],
    improvementSuggestions: [{ type: String }],
    reviewText: { type: String, required: true },
    wouldRecommend: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isFeatured: { type: Boolean, default: false },
    adminReply: { type: String, default: '' },
  },
  { timestamps: true }
);

SiteReviewSchema.index({ status: 1 });
SiteReviewSchema.index({ isFeatured: 1 });
SiteReviewSchema.index({ createdAt: -1 });

export default models.SiteReview || model<ISiteReview>('SiteReview', SiteReviewSchema);
