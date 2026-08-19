import { Schema, Document, model, models } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  replyMessage?: string;
  repliedAt?: Date;
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
    replyMessage: { type: String, default: '' },
    repliedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ContactMessageSchema.index({ status: 1 });

export default models.ContactMessage || model<IContactMessage>('ContactMessage', ContactMessageSchema);
