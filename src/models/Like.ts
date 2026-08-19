import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ILike extends Document {
  blogId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LikeSchema.index({ blogId: 1, userId: 1 }, { unique: true });

LikeSchema.post('save', async function (doc) {
  try {
    await mongoose.model('Blog').findByIdAndUpdate(doc.blogId, { $inc: { likesCount: 1 } });
  } catch (err) {
    console.error('Failed to increment likesCount on blog save', err);
  }
});

export default models.Like || model<ILike>('Like', LikeSchema);
