# Tarikur Portfolio

A full-stack personal portfolio and learning platform for Tarikur Rahman. The application presents professional work, services, skills, experience, blog articles, courses, challenges, and contact workflows through a modern Next.js experience.

## Project Overview

Tarikur Portfolio combines a public developer portfolio with a content and administration platform. Visitors can explore projects and articles, purchase or follow courses, submit project requirements, ask technical questions, leave reviews, and create accounts. Administrators can manage portfolio content, media, blogs, courses, reviews, messages, challenges, and site settings from the admin dashboard.

The project uses Next.js App Router for the frontend and API routes, MongoDB with Mongoose for server-side data, Firebase for client authentication services, and several optional third-party services for email and media handling.

## Features

- Responsive portfolio homepage with projects, services, skills, experience, testimonials, and site settings
- Project listing and project detail pages
- Blog listing, article detail pages, comments, likes, and saved content workflows
- Course catalog, course details, checkout, enrollments, lessons, and progress tracking
- Read & Rank technical challenges with attempts and leaderboards
- Ask Tarikur Q&A submission and moderation workflow
- Project estimator for collecting requirements and generating a project brief
- Contact form, contact settings, reviews, and visitor analytics
- User registration, login, JWT-based sessions, protected dashboard, and admin dashboard
- Firebase client integration for authentication support
- MongoDB Atlas integration through Mongoose
- Nodemailer SMTP notifications
- ImgBB and optional Cloudinary image upload integrations
- SEO metadata, sitemap, robots configuration, web manifest, and social sharing metadata
- Integration health endpoint at `/api/health/integrations`

## Technology Stack

- Next.js 16 with App Router and TypeScript
- React 19
- Tailwind CSS 4
- Framer Motion
- MongoDB and Mongoose
- Firebase and Firebase Admin SDK
- Nodemailer
- ImgBB and Cloudinary
- JWT and bcryptjs
- Lucide React icons

## Installation & Setup

### Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB Atlas database and database user
- Firebase project credentials
- SMTP credentials, such as a Gmail account with an app password
- ImgBB API key
- Cloudinary credentials if Cloudinary uploads are used

### 1. Clone or open the project

```bash
git clone <repository-url>
cd BLog-portfolio-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

Create a `.env.local` file in the project root. Do not commit this file because it contains private credentials.

```env
# Firebase client configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# Email: EMAIL_* is supported by the application.
# SMTP_* aliases may also be used for custom SMTP providers.
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-app-password
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASSWORD=your-email-app-password
# RECEIVER_EMAIL=your-email@example.com

# ImgBB
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

# Optional Cloudinary
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT sessions
JWT_SECRET=replace-with-a-long-random-secret
```

For MongoDB passwords containing characters such as `@`, `#`, or spaces, URL-encode the password before placing it in `MONGODB_URI`. Also allow your development IP address in MongoDB Atlas Network Access and enable the required Firebase Authentication providers in the Firebase Console.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is already in use, Next.js will select another available port and print the URL in the terminal.

### 5. Verify integrations

With the development server running, open:

```text
http://localhost:3000/api/health/integrations
```

The endpoint reports whether Firebase, MongoDB, email, ImgBB, Cloudinary, and JWT are configured and responding. It never returns secret values. A `200` response means all required checks passed; `503` means the environment is degraded or a required service is unavailable.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run ESLint
npm run clean    # Run the project cleanup script
```

For a production-style local run:

```bash
npm run build
npm run start
```

## Project Structure

```text
src/
  app/          Next.js pages, layouts, and API routes
  components/   Reusable UI and feature components
  context/      Authentication and toast providers
  data/         Local seed and fallback data
  lib/          Firebase, MongoDB, auth, email, media, and utility helpers
  models/       Mongoose data models
  types/        Shared TypeScript types
public/         Static images, icons, manifest, and downloadable assets
scripts/        Project maintenance scripts
```

## Security Notes

- Keep `.env.local` out of version control.
- Never expose server-only secrets such as `MONGODB_URI`, `JWT_SECRET`, email passwords, or Cloudinary secrets to client components.
- Use a Gmail app password instead of a personal Gmail password.
- Rotate credentials immediately if they are shared publicly or committed accidentally.
- Restrict MongoDB Atlas access and use a database user with only the permissions the application needs.

## About the Developer

**Tarikur Rahman** is a creative developer and no-code architect focused on building high-performance web experiences, modern interfaces, Shopify solutions, and Bubble.io applications.

- **GitHub:** [github.com/tarikurrahman](https://github.com/tarikurrahman)
- **Portfolio:** [yourtarikur.vercel.app](https://yourtarikur.vercel.app/)
- **Social/Handle:** `tarikurrahman08`
- **Email:** [tarikurrahman2008@gmail.com](mailto:tarikurrahman2008@gmail.com)

## License

This project is licensed under the **MIT License**. You may use, modify, and distribute the software according to the terms of the license.
