import { Schema, Document, model, models } from 'mongoose';

export interface IProjectBrief extends Document {
  name: string;
  email: string;
  whatsapp: string;
  businessUrl?: string;
  projectType: string;
  projectSize: string;
  selectedFeatures: string[];
  designStyle: string;
  timeline: string;
  budgetRange: string;
  complexityScore: number;
  estimatedPackage: 'Basic' | 'Standard' | 'Premium' | 'Custom';
  estimatedTimeline: string;
  generatedSummary: string;
  extraMessage?: string;
  status: 'new' | 'contacted' | 'converted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectBriefSchema = new Schema<IProjectBrief>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    whatsapp: { type: String, required: true },
    businessUrl: { type: String, default: '' },
    projectType: { type: String, required: true },
    projectSize: { type: String, required: true },
    selectedFeatures: [{ type: String }],
    designStyle: { type: String, required: true },
    timeline: { type: String, required: true },
    budgetRange: { type: String, required: true },
    complexityScore: { type: Number, required: true },
    estimatedPackage: {
      type: String,
      enum: ['Basic', 'Standard', 'Premium', 'Custom'],
      required: true,
    },
    estimatedTimeline: { type: String, required: true },
    generatedSummary: { type: String, required: true },
    extraMessage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'rejected'],
      default: 'new',
    },
  },
  { timestamps: true }
);

ProjectBriefSchema.index({ status: 1 });
ProjectBriefSchema.index({ email: 1 });

export default models.ProjectBrief || model<IProjectBrief>('ProjectBrief', ProjectBriefSchema);
