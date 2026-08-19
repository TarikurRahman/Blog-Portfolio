import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IComment extends Document {
  blogId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  comment: string;
  status: 'pending' | 'approved' | 'hidden' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    comment: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'hidden', 'deleted'], default: 'approved' },
  },
  { timestamps: true }
);

CommentSchema.index({ blogId: 1 });
CommentSchema.index({ status: 1 });

// Keep blog.commentsCount in sync
CommentSchema.post('save', async function (doc) {
  if (doc.status === 'approved') {
    try {
      await mongoose.model('Blog').findByIdAndUpdate(doc.blogId, { $inc: { commentsCount: 1 } });
    } catch (err) {
      console.error('Failed to increment commentsCount on blog save', err);
    }
  }
});

export default models.Comment || model<IComment>('Comment', CommentSchema);
