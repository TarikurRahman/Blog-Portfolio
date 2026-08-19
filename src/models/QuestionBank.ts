import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IQuestionBank extends Document {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  category: string;
  blogId?: mongoose.Types.ObjectId;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionBankSchema = new Schema<IQuestionBank>(
  {
    questionText: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => val.length >= 2,
        'Options must contain at least 2 choices',
      ],
    },
    correctOptionIndex: { type: Number, required: true },
    category: { type: String, required: true },
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', default: null },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    points: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

QuestionBankSchema.index({ category: 1 });
QuestionBankSchema.index({ blogId: 1 });
QuestionBankSchema.index({ isActive: 1 });

export default models.QuestionBank || model<IQuestionBank>('QuestionBank', QuestionBankSchema);
