import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICourseOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  paymentScreenshotUrl?: string;
  paymentStatus: "pending" | "paid" | "rejected" | "refunded";
  orderStatus: "pending" | "approved" | "rejected" | "cancelled";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseOrderSchema = new Schema<ICourseOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, default: '' },
    paymentScreenshotUrl: { type: String, default: '' },
    paymentStatus: { type: String, enum: ["pending", "paid", "rejected", "refunded"], default: "pending" },
    orderStatus: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

CourseOrderSchema.index({ userId: 1, courseId: 1 });

export default models.CourseOrder || model<ICourseOrder>('CourseOrder', CourseOrderSchema);
