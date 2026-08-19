import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IEducation extends Document {
  degree: string;
  institution: string;
  duration: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Education || model<IEducation>('Education', EducationSchema);
