import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IMediaAsset extends Document {
  uploadedBy: mongoose.Types.ObjectId;
  fileUrl: string;
  displayUrl: string;
  deleteUrl: string;
  imgbbId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  folder: 'blog' | 'project' | 'avatar' | 'seo' | 'general' | 'course';
  altText?: string;
  caption?: string;
  createdAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    displayUrl: { type: String, required: true },
    deleteUrl: { type: String, default: '' },
    imgbbId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    folder: { type: String, enum: ['blog', 'project', 'avatar', 'seo', 'general', 'course'], default: 'general' },
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.MediaAsset || model<IMediaAsset>('MediaAsset', MediaAssetSchema);
