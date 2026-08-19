import { Service } from './types';

export const defaultServices: Service[] = [
  {
    id: 'ser1',
    title: 'Frontend Development',
    iconName: 'Code',
    description: 'Building fast, responsive, and secure web applications using React, Next.js, and TypeScript with a developer-first layout.',
    bullets: [
      'Single Page Applications (SPA) & Server Side Rendering (SSR)',
      'State-of-the-art Next.js App Router configurations',
      'Clean, modular, and maintainable codebase principles'
    ]
  },
  {
    id: 'ser2',
    title: 'Shopify Development',
    iconName: 'ShoppingBag',
    description: 'Customizing Shopify storefronts, integrating APIs, and creating premium theme adjustments for commerce projects.',
    bullets: [
      'Tailored Liquid templating and section layout architecture',
      'Custom theme creation, setup, and conversion rate increases',
      'App integrations and responsive web storefront configurations'
    ]
  },
  {
    id: 'ser3',
    title: 'Bubble.io App Development',
    iconName: 'Layers',
    description: 'Rapid prototyping and scalable full-stack web application development utilizing the power of Bubble.io no-code tools.',
    bullets: [
      'Dynamic workflow designs and database configuration setups',
      'Custom plugin integrations and custom JavaScript workflows',
      'Scalable user authentication and subscription plans config'
    ]
  },
  {
    id: 'ser4',
    title: 'Web Performance',
    iconName: 'Zap',
    description: 'Optimizing existing sites to improve performance metrics, page speed, and core web vitals for maximum efficiency.',
    bullets: [
      'Improving Core Web Vitals (LCP, INP, CLS)',
      'Optimizing images, bundling, and lazy loading mechanisms',
      'Implementing robust client-side caching and pre-fetching'
    ]
  },
  {
    id: 'ser5',
    title: 'SEO Setup',
    iconName: 'Search',
    description: 'Building websites that rank well on search engines by enforcing layout hierarchy, schema structures, and optimized metadata.',
    bullets: [
      'Enforcing semantic HTML5 and clean header structures',
      'Custom metadata, open graph layouts, and sitemaps setups',
      'Integrating search console metrics and crawler alignments'
    ]
  },
  {
    id: 'ser6',
    title: 'UI/UX Implementation',
    iconName: 'Layout',
    description: 'Bridging design and engineering by translating mockups and designs into pixel-perfect, highly interactive frontends.',
    bullets: [
      'Pixel-perfect Figma/Adobe XD translation to Next.js',
      'Enforcing consistent spacing grids and component tokens',
      'Smooth micro-animations using Framer Motion and CSS'
    ]
  }
];
