import { Schema, Document, model, models } from 'mongoose';

export interface IPageMedia extends Document {
  homeHeroImageUrl: string;
  aboutHeroImageUrl: string;
  aboutBottomBannerImageUrl: string;
  updatedAt: Date;
}

const PageMediaSchema = new Schema<IPageMedia>(
  {
    homeHeroImageUrl: { type: String, default: '' },
    aboutHeroImageUrl: { type: String, default: '' },
    aboutBottomBannerImageUrl: { type: String, default: '' },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.PageMedia || model<IPageMedia>('PageMedia', PageMediaSchema);
