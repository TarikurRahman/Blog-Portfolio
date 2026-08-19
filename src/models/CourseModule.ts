import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICourseModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseModuleSchema = new Schema<ICourseModule>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

CourseModuleSchema.index({ courseId: 1, order: 1 });

export default models.CourseModule || model<ICourseModule>('CourseModule', CourseModuleSchema);
