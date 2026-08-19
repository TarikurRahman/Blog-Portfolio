import { Schema, Document, model, models } from 'mongoose';

export interface IContactSettings extends Document {
  title: string;
  subtitle: string;
  introText: string;
  email: string;
  phone: string;
  location: string;
  availabilityText: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  formSubjectLabel: string;
  formSubjectPlaceholder: string;
  formMessageLabel: string;
  formMessagePlaceholder: string;
  successMessage: string;
  updatedAt: Date;
}

const ContactSettingsSchema = new Schema<IContactSettings>(
  {
    title: { type: String, default: "Let's Build Something Amazing" },
    subtitle: { type: String, default: "Fill out the contact form or reach out through social channels. I usually respond within 12 hours." },
    introText: { type: String, default: "Have a project in mind, need a developer, or want to discuss architectures? Drop me a message and I will reply as soon as possible." },
    email: { type: String, default: "contact@tarikur.dev" },
    phone: { type: String, default: "+880 1700 000000" },
    location: { type: String, default: "Dhaka, Bangladesh" },
    availabilityText: { type: String, default: "Open for Freelance & Contracts" },
    githubUrl: { type: String, default: "https://github.com" },
    linkedinUrl: { type: String, default: "https://linkedin.com" },
    twitterUrl: { type: String, default: "https://twitter.com" },
    formNameLabel: { type: String, default: "Your Name" },
    formNamePlaceholder: { type: String, default: "John Doe" },
    formEmailLabel: { type: String, default: "Email Address" },
    formEmailPlaceholder: { type: String, default: "you@example.com" },
    formSubjectLabel: { type: String, default: "Subject" },
    formSubjectPlaceholder: { type: String, default: "Project Inquiry / Job Opportunity" },
    formMessageLabel: { type: String, default: "Your Message" },
    formMessagePlaceholder: { type: String, default: "Describe your project goals or detail your query here..." },
    successMessage: { type: String, default: "Your message has been sent successfully!" },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export default models.ContactSettings || model<IContactSettings>('ContactSettings', ContactSettingsSchema);
