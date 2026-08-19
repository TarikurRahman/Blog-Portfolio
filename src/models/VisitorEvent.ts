import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IVisitorEvent extends Document {
  visitorId: string;
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  pageUrl: string;
  pageTitle?: string;
  referrer: string;
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  userAgent: string;
  visitedAt: Date;
  createdAt: Date;
}

const VisitorEventSchema = new Schema<IVisitorEvent>(
  {
    visitorId: { type: String, required: true },
    sessionId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    pageUrl: { type: String, required: true },
    pageTitle: { type: String, default: '' },
    referrer: { type: String, default: '' },
    device: { type: String, enum: ['mobile', 'tablet', 'desktop'], required: true },
    browser: { type: String, required: true },
    userAgent: { type: String, required: true },
    visitedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Add indexes as requested
VisitorEventSchema.index({ visitorId: 1 });
VisitorEventSchema.index({ sessionId: 1 });
VisitorEventSchema.index({ pageUrl: 1 });
VisitorEventSchema.index({ visitedAt: -1 }); // Index visitedAt descending for recent visitors
VisitorEventSchema.index({ userId: 1 });

export default models.VisitorEvent || model<IVisitorEvent>('VisitorEvent', VisitorEventSchema);
