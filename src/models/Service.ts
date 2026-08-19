import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IService extends Document {
  title: string;
  iconName: string;
  description: string;
  bullets: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    iconName: { type: String, required: true },
    description: { type: String, required: true },
    bullets: [{ type: String }],
  },
  { timestamps: true }
);

export default models.Service || model<IService>('Service', ServiceSchema);
