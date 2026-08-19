import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ILessonProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  watchedSeconds: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'CourseLesson', required: true },
    watchedSeconds: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default models.LessonProgress || model<ILessonProgress>('LessonProgress', LessonProgressSchema);
