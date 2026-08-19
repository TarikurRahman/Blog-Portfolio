import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IReadRankChallenge extends Document {
  blogId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  questionIds: mongoose.Types.ObjectId[];
  questionSourceType: 'manual' | 'blog' | 'category' | 'random' | 'mixed';
  category?: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  isActive: boolean;
  allowRetake: boolean;
  requireVerifiedUser: boolean;
  resultPublished: boolean;
  showOnHome: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReadRankChallengeSchema = new Schema<IReadRankChallenge>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', default: null },
    title: { type: String, required: true },
    description: { type: String, required: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: 'QuestionBank' }],
    questionSourceType: {
      type: String,
      enum: ['manual', 'blog', 'category', 'random', 'mixed'],
      required: true,
    },
    category: { type: String, default: '' },
    totalQuestions: { type: Number, required: true },
    timeLimitMinutes: { type: Number, default: 10 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationDays: { type: Number, default: 7 },
    isActive: { type: Boolean, default: true },
    allowRetake: { type: Boolean, default: false },
    requireVerifiedUser: { type: Boolean, default: true },
    resultPublished: { type: Boolean, default: false },
    showOnHome: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReadRankChallengeSchema.index({ blogId: 1 });
ReadRankChallengeSchema.index({ isActive: 1 });
ReadRankChallengeSchema.index({ resultPublished: 1 });

export default models.ReadRankChallenge || model<IReadRankChallenge>('ReadRankChallenge', ReadRankChallengeSchema);
