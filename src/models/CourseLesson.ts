import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICourseLesson extends Document {
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  youtubeVideoId: string;
  durationMinutes: number;
  isPreview: boolean;
  resources?: string;
  order: number;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const CourseLessonSchema = new Schema<ICourseLesson>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: 'CourseModule', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
    youtubeVideoId: { type: String, required: true },
    durationMinutes: { type: Number, required: true, default: 0 },
    isPreview: { type: Boolean, default: false },
    resources: { type: String, default: '' },
    order: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

CourseLessonSchema.index({ courseId: 1, moduleId: 1, order: 1 });

export default models.CourseLesson || model<ICourseLesson>('CourseLesson', CourseLessonSchema);
