import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IAskTarikurQuestion extends Document {
  name: string;
  email: string;
  userId?: mongoose.Types.ObjectId;
  question: string;
  answer?: string;
  category?: string;
  tags?: string[];
  status: 'pending' | 'answered' | 'published' | 'rejected';
  isFeatured: boolean;
  publishedAt?: Date;
  answeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AskTarikurQuestionSchema = new Schema<IAskTarikurQuestion>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    category: { type: String, default: 'General' },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'answered', 'published', 'rejected'],
      default: 'pending',
    },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    answeredAt: { type: Date },
  },
  { timestamps: true }
);

AskTarikurQuestionSchema.index({ status: 1 });
AskTarikurQuestionSchema.index({ isFeatured: 1 });
AskTarikurQuestionSchema.index({ createdAt: -1 });

export default models.AskTarikurQuestion || model<IAskTarikurQuestion>('AskTarikurQuestion', AskTarikurQuestionSchema);
