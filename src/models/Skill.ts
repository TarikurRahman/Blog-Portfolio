import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: 'frontend' | 'nocode' | 'optimization';
  level: number;
  iconName: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ['frontend', 'nocode', 'optimization'], required: true },
    level: { type: Number, required: true, min: 0, max: 100 },
    iconName: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Skill || model<ISkill>('Skill', SkillSchema);
