import { Project } from './types';

export const defaultProjects: Project[] = [
  {
    id: 'p1',
    title: 'DevNexus Portal',
    category: 'Frontend',
    description: 'A premium developer hub featuring blog posts, code compilation widgets, and collaborative workspaces.',
    longDescription: 'DevNexus is a state-of-the-art web portal built for modern programmers. It aggregates system documentation, implements standard code runner sandboxes, and enables real-time messaging using client state. It emphasizes responsive widgets and custom dashboards.',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    status: 'Completed',
    liveUrl: 'https://devnexus.example.com',
    githubUrl: 'https://github.com/tarikurrahman/devnexus',
    features: [
      'Interactive sandbox workspace support',
      'Dynamic metadata customizer and layout presets',
      'Instant client search with debounced inputs',
      'Fluid page and content loading animations'
    ],
    challenge: 'Managing massive data trees across deeply nested custom code grids caused frequent layout redraws and slow responsiveness.',
    solution: 'Rebuilt the component layout with decoupled local state caches and optimized CSS transitions, improving browser rendering speed by 60%.',
    seoTitle: 'DevNexus - Premium Developer Workspace & Dashboard',
    seoDescription: 'Explore DevNexus, a fast developer platform featuring modular layouts, coding widgets, and premium dashboard elements.',
    seoKeywords: 'Next.js, Tailwind, React Dashboard, Developer Workspace'
  },
  {
    id: 'p2',
    title: 'GlowCart Fashion Store',
    category: 'Shopify',
    description: 'An elegant apparel e-commerce store with high performance ratings and custom checkout sections.',
    longDescription: 'GlowCart is a custom-coded Shopify store built for high-end fashion lines. It implements a unique liquid theme layout, dynamic slide-out cart previews, customized product filters, and robust analytical events tracing.',
    tags: ['Shopify', 'Liquid', 'Tailwind CSS', 'AlpineJS', 'Cart API'],
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    status: 'Completed',
    liveUrl: 'https://glowcart.example.com',
    githubUrl: 'https://github.com/tarikurrahman/glowcart-shopify',
    features: [
      'Custom liquid-driven product variant grids',
      'High-speed Ajax-based cart sliding panel drawer',
      'Search analytics and smart product recommend integration',
      'Fully responsive theme adapting to small screens'
    ],
    challenge: 'The store struggled with slow image load times and high script payload sizes, which degraded conversion metrics.',
    solution: 'Implemented responsive Shopify image cropping, delayed non-critical CSS loads, and stripped legacy JS scripts, raising the Lighthouse performance score from 42 to 92.',
    seoTitle: 'GlowCart Shopify Theme - High Performance Apparel Store',
    seoDescription: 'Browse the GlowCart Shopify implementation with customized theme sections, Liquid optimizations, and fast Cart API integrations.',
    seoKeywords: 'Shopify Development, Liquid Templates, E-commerce Optimization'
  },
  {
    id: 'p3',
    title: 'SaaSFlow Builder',
    category: 'Bubble.io',
    description: 'A full-stack workflow automation builder that generates customizable tasks and integrates email alerts.',
    longDescription: 'SaaSFlow is a no-code visual builder crafted using Bubble.io. It handles dynamic database schema designs, lets users map custom triggers, connects payment options using Stripe, and triggers outgoing APIs.',
    tags: ['Bubble.io', 'Database Workflows', 'API Connector', 'Stripe Payments', 'SaaS'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    status: 'Completed',
    liveUrl: 'https://saasflow-builder.example.com',
    githubUrl: 'https://github.com/tarikurrahman/saasflow-bubble',
    features: [
      'Visual drag-and-drop workflow connectors',
      'Secure subscription creation and billing systems',
      'Dynamic email verification and sign-up models',
      'Custom webhook triggers for automated tasks'
    ],
    challenge: 'Bubble database calls experienced lag when processing queries across thousands of recursive workflow tasks.',
    solution: 'Optimized search constraints by index layering, consolidated database rows, and offloaded bulk queries to lightweight client states.',
    seoTitle: 'SaaSFlow Bubble.io Builder - Custom SaaS Automation Solutions',
    seoDescription: 'Examine SaaSFlow, a complete workflow designer built using Bubble.io, incorporating custom database tables and third-party APIs.',
    seoKeywords: 'Bubble.io, No-code SaaS, Workflow Automation, Stripe integration'
  },
  {
    id: 'p4',
    title: 'Crypto Analytics Interface',
    category: 'UI/UX',
    description: 'A modern dark-themed tracking dashboard showing live charts, coin details, and custom alerts.',
    longDescription: 'This crypto monitoring hub prioritizes aesthetic visuals and smooth layouts. It translates visual Figma concepts into code, highlighting animated line graphs, dark neon outlines, and customizable table grids.',
    tags: ['Next.js', 'Framer Motion', 'Tailwind CSS', 'Recharts', 'Figma Translate'],
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
    status: 'Completed',
    liveUrl: 'https://cryptointerface.example.com',
    githubUrl: 'https://github.com/tarikurrahman/crypto-uiux',
    features: [
      'Smooth scroll layouts and collapsible tab drawers',
      'Vibrant orange glowing borders matching asset values',
      'Dynamic tooltips and chart zooming capabilities',
      'Responsive design fitting tablet grids and phones'
    ],
    challenge: 'Rendering live charts with hundreds of ticks caused the page layout to lag during tab transitions.',
    solution: 'Implemented lazy canvas mounts, virtualized long historical grids, and added responsive transition wrappers using Framer Motion.',
    seoTitle: 'Crypto Interface UI/UX - Premium Next.js Analytics Dashboard',
    seoDescription: 'Inspect a custom-designed dark crypto analytics dashboard with detailed interactive charts and glowing elements.',
    seoKeywords: 'UI/UX Implementation, Framer Motion, Next.js Charts, Responsive CSS'
  },
  {
    id: 'p5',
    title: 'Pulse E-Commerce App',
    category: 'Bubble.io',
    description: 'A complete marketplace platform supporting multi-vendor listings, review histories, and admin panels.',
    longDescription: 'Pulse is an enterprise-grade marketplace built on Bubble.io. It handles complex security rules, user profiles, customized seller storefronts, product reviews, and custom billing models.',
    tags: ['Bubble.io', 'Marketplace', 'Database Optimization', 'Sendgrid API'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    status: 'In Progress',
    liveUrl: 'https://pulsemarket.example.com',
    githubUrl: 'https://github.com/tarikurrahmanbd/pulse-marketplace',
    features: [
      'Multi-vendor onboarding and verification widgets',
      'Dynamic dashboard stats showing revenue and counts',
      'Automated email notifications on purchase completions',
      'Ratings and review panels with image attachment'
    ],
    challenge: 'Establishing dynamic seller payout records in Bubble while maintaining accurate ledger details for refunds.',
    solution: 'Configured a transactional ledger design within the database and synced it with Stripe Connect dashboards to prevent database inconsistencies.',
    seoTitle: 'Pulse Multi-Vendor Marketplace - Bubble.io Application',
    seoDescription: 'Learn about Pulse, a dynamic multi-vendor e-commerce platform built using Bubble.io with Stripe integrations.',
    seoKeywords: 'No-code Marketplace, Bubble.io Database, Multi-vendor platform'
  },
  {
    id: 'p6',
    title: 'Aero Speed Web Platform',
    category: 'Frontend',
    description: 'A landing page suite focused on loading speed, responsive layouts, and modern typography.',
    longDescription: 'Aero is a showcase app built to demonstrate high-efficiency frontend rendering. It uses Next.js server actions, implements static pages, and features glassmorphism layouts with primary accent glows.',
    tags: ['Next.js', 'Static Compilation', 'Vanilla CSS', 'Lighthouse 100'],
    image: 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=800&q=80',
    status: 'Completed',
    liveUrl: 'https://aerospeed.example.com',
    githubUrl: 'https://github.com/tarikurrahmanbd/aerospeed',
    features: [
      'Perfect 100/100 Lighthouse performance metrics',
      'Tailored micro-animations for interactive list items',
      'Fluid scroll triggers with intersection observers',
      'Dynamic CSS background particles and glows'
    ],
    challenge: 'Achieving a perfect 100 on desktop and mobile Lighthouse audits while loading large high-definition background assets.',
    solution: 'Used custom webp encoders, critical inline stylesheets, optimized font preloading, and asynchronous component rendering wrappers.',
    seoTitle: 'Aero Speed Platform - Next.js Performance Showcase',
    seoDescription: 'See how Aero achieves 100 performance scores using optimized bundling, inline styling, and modern Next.js features.',
    seoKeywords: 'Next.js Speed, Core Web Vitals, Web Performance Optimization'
  }
];
