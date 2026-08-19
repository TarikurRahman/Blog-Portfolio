import { BlogPost } from './types';

export const defaultBlogs: BlogPost[] = [
  {
    id: 'b1',
    title: 'Mastering the Next.js App Router for Modern Layouts',
    slug: 'mastering-nextjs-app-router',
    excerpt: 'Deep dive into Next.js layouts, nested routers, parallel routes, and loading state triggers to construct premium web interfaces.',
    content: 'Next.js App Router has changed how we structure web software. By shifting to folder-based routing and Server Components by default, it changes data fetching behaviors. \n\n### Why Server Components Matter\n\nReact Server Components (RSC) fetch data directly on the server, keeping your JS bundle size tiny. Only interactive widgets (like buttons, search dialogs, and modals) require the client compiler. This means pages render instantly.\n\n### Laying out Nested Grids\n\nUsing nested `layout.tsx` wrappers allows you to build persistent sidebars and top bars without reloading core layouts when changing views. Combine this with Framer Motion transitions for beautiful results.\n\n```typescript\n// Example Layout structure\nexport default function DashboardLayout({\n  children,\n}: { children: React.ReactNode }) {\n  return (\n    <div className="flex h-screen">\n      <Sidebar />\n      <main className="flex-1 overflow-y-auto">{children}</main>\n    </div>\n  );\n}\n```\n\n### Loading and Suspense States\n\nBy adding a `loading.tsx` file in your route folder, Next.js automatically creates a boundary using React Suspense. This ensures users see styled skeleton boards while fetching content, eliminating visual layout shifting.',
    author: {
      name: 'Tarikur Rahman',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      role: 'Frontend Architect'
    },
    date: '2026-05-15',
    category: 'Frontend',
    readTime: '6 min read',
    likes: 24,
    commentsCount: 2,
    views: 120,
    seoTitle: 'Mastering Next.js App Router & Layouts - Tarikur Portfolio',
    seoDescription: 'Learn to configure Next.js App Router for fast, responsive web design using server components and loading states.',
    seoKeywords: 'Next.js, App Router, React Server Components, Nested Layouts'
  },
  {
    id: 'b2',
    title: 'Why Page Speed is the Ultimate SEO Ranking Factor',
    slug: 'page-speed-seo-ranking-factor',
    excerpt: 'An analysis of Core Web Vitals (LCP, INP, CLS), browser rendering queues, and how performance optimization boosts web traffic.',
    content: 'Search engines rank web pages based on layout speed. If a website takes longer than three seconds to load, search traffic drops. Optimization is no longer just for UX—it is a critical ranking factor.\n\n### The Core Web Vitals Trio\n\nGoogle evaluates pages using three primary criteria:\n1. **Largest Contentful Paint (LCP)**: Measures loading performance. Aim for under 2.5 seconds.\n2. **Interaction to Next Paint (INP)**: Tracks visual responsiveness. Aim for under 200ms.\n3. **Cumulative Layout Shift (CLS)**: Verifies visual stability. Keep shift values under 0.1.\n\n### Practical Optimization Techniques\n\nTo raise performance scores:\n- Compress images into modern formats like `.webp` or `.avif`.\n- Configure layout dimensions (`width` and `height`) on images to prevent shift reflows.\n- Minify CSS files and defer large third-party scripts.\n- Set up aggressive caching systems on Content Delivery Networks (CDNs).',
    author: {
      name: 'Tarikur Rahman',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      role: 'Web Optimizer'
    },
    date: '2026-05-20',
    category: 'SEO',
    readTime: '5 min read',
    likes: 18,
    commentsCount: 1,
    views: 95,
    seoTitle: 'Page Speed Optimization & SEO Rankings Guide - Tarikur',
    seoDescription: 'Understand Core Web Vitals and optimize page speeds to rank higher on search engines and improve layouts.',
    seoKeywords: 'Core Web Vitals, SEO Optimization, Page Speed, Web Performance'
  },
  {
    id: 'b3',
    title: 'Developing Custom Modules in Shopify Themes',
    slug: 'custom-modules-shopify-themes',
    excerpt: 'A developer guide to writing customizable Shopify sections using schema, JSON settings, and liquid variables.',
    content: 'Developing for Shopify requires a solid grasp of **Liquid** and sections schema. Shopify themes let merchant teams modify layouts from their customization dashboard. \n\n### Anatomy of a Custom Liquid Section\n\nA custom section is split into three main layers:\n1. **Markup structure**: HTML combined with Liquid tag loops.\n2. **Styles and logic**: Specific CSS and lightweight JS interactions.\n3. **Theme Settings Schema**: Configures variables that appear in the admin editor.\n\n```liquid\n{% schema %}\n{\n  "name": "Custom Glow Banner",\n  "settings": [\n    {\n      "type": "text",\n      "id": "heading",\n      "label": "Banner Title",\n      "default": "Aura Collection"\n    }\n  ],\n  "presets": [\n    {\n      "name": "Custom Glow Banner"\n    }\n  ]\n}\n{% endschema %}\n```\n\n### Enhancing Cart Operations\n\nBy leveraging the Shopify AJAX Cart API, we can add items to carts, update item counts, and open sidebars without full page reloads, improving checkout conversions.',
    author: {
      name: 'Tarikur Rahman',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      role: 'Shopify Expert'
    },
    date: '2026-06-02',
    category: 'Shopify',
    readTime: '8 min read',
    likes: 15,
    commentsCount: 0,
    views: 84,
    seoTitle: 'Creating Custom Shopify Section Themes - Liquid Guide',
    seoDescription: 'Learn to write clean Liquid schema code and AJAX cart endpoints to customize Shopify commerce storefronts.',
    seoKeywords: 'Shopify Liquid, Custom Sections, AJAX Cart API, Theme Development'
  },
  {
    id: 'b4',
    title: 'The Power of No-Code: Building SaaS with Bubble.io',
    slug: 'power-nocode-saas-bubble',
    excerpt: 'Explore how visual database designs, API connectors, and event workflows enable fast SaaS product launches.',
    content: 'No-code builders are changing the startup ecosystem. What used to take months of backend planning can now be launched in weeks using visual database managers like Bubble.io.\n\n### The Visual Database Schema\n\nBubble features a built-in database creator. You define custom types, add relations, and set up security policies. For example, a user database table can link directly to specific transaction histories and active subscriptions.\n\n### Integrating the Bubble API Connector\n\nWhen you need backend functions Bubble doesn\'t support out of the box, the API Connector bridges the gap. It lets you send REST requests, sync calendars, fetch external tables, or process credit card payments via Stripe.\n\n### Scalability and Growth\n\nWhile custom code is eventually needed for complex operations, visual SaaS development allows you to validate business ideas, gather active user feedback, and test layouts with minimal upfront investment.',
    author: {
      name: 'Tarikur Rahman',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      role: 'NoCode Engineer'
    },
    date: '2026-06-12',
    category: 'Bubble.io',
    readTime: '7 min read',
    likes: 31,
    commentsCount: 0,
    views: 156,
    seoTitle: 'Building SaaS Platforms with Bubble.io - No-Code Guide',
    seoDescription: 'Discover how to design database tables, configure workflows, and integrate APIs using Bubble.io no-code tools.',
    seoKeywords: 'Bubble.io, No-code SaaS, API Connector, Database Design'
  }
];
