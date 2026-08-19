import { Schema, Document, model, models } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
});

export default models.Category || model<ICategory>('Category', CategorySchema);
