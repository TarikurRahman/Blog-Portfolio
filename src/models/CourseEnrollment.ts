import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICourseEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  accessStatus: "active" | "pending" | "revoked" | "expired";
  paymentStatus: "pending" | "paid" | "approved" | "rejected";
  enrolledAt: Date;
  accessExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CourseEnrollmentSchema = new Schema<ICourseEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'CourseOrder' },
    accessStatus: { type: String, enum: ["active", "pending", "revoked", "expired"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "approved", "rejected"], default: "pending" },
    enrolledAt: { type: Date, default: Date.now },
    accessExpiresAt: { type: Date },
  },
  { timestamps: true }
);

CourseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default models.CourseEnrollment || model<ICourseEnrollment>('CourseEnrollment', CourseEnrollmentSchema);
