import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IExperience extends Document {
  role: string;
  company: string;
  duration: string;
  description: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default models.Experience || model<IExperience>('Experience', ExperienceSchema);
