import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOptionIndex: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface IChallengeAttempt extends Document {
  challengeId: mongoose.Types.ObjectId;
  blogId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  startedAt: Date;
  submittedAt?: Date;
  timeTakenSeconds?: number;
  totalQuestions: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  score?: number;
  percentage?: number;
  rank?: number;
  status: 'started' | 'submitted' | 'auto-submitted' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: 'QuestionBank', required: true },
  selectedOptionIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  pointsEarned: { type: Number, default: 0 },
});

const ChallengeAttemptSchema = new Schema<IChallengeAttempt>(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: 'ReadRankChallenge', required: true },
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', default: null },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [AnswerSchema],
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },
    timeTakenSeconds: { type: Number },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    rank: { type: Number },
    status: {
      type: String,
      enum: ['started', 'submitted', 'auto-submitted', 'expired'],
      default: 'started',
    },
  },
  { timestamps: true }
);

ChallengeAttemptSchema.index({ challengeId: 1, userId: 1 });
ChallengeAttemptSchema.index({ score: -1, timeTakenSeconds: 1, submittedAt: 1 });

export default models.ChallengeAttempt || model<IChallengeAttempt>('ChallengeAttempt', ChallengeAttemptSchema);
