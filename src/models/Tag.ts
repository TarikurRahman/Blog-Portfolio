import { Schema, Document, model, models } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
}

const TagSchema = new Schema<ITag>({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
});

export default models.Tag || model<ITag>('Tag', TagSchema);
