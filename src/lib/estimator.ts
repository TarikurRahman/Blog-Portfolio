export interface EstimatorInput {
  projectType: string;
  projectSize: string;
  selectedFeatures: string[];
  designStyle: string;
  timeline: string;
  budgetRange: string;
}

export interface EstimatorResult {
  estimatedPackage: 'Basic' | 'Standard' | 'Premium' | 'Custom';
  estimatedTimeline: string;
  complexityScore: number;
  suggestedFeatures: string[];
  generatedSummary: string;
}

export function calculateProjectEstimate(input: EstimatorInput): EstimatorResult {
  const { projectType, projectSize, selectedFeatures, designStyle, timeline } = input;

  // 1. Base Budget & Days & Complexity
  let baseBudget = 500;
  let baseDays = 7;
  let baseComplexity = 20;

  switch (projectType) {
    case 'Portfolio Website':
      baseBudget = 500;
      baseDays = 7;
      baseComplexity = 20;
      break;
    case 'Business Website':
      baseBudget = 1000;
      baseDays = 14;
      baseComplexity = 35;
      break;
    case 'Shopify Store':
      baseBudget = 1500;
      baseDays = 14;
      baseComplexity = 45;
      break;
    case 'Blog Website':
      baseBudget = 600;
      baseDays = 8;
      baseComplexity = 25;
      break;
    case 'Dashboard / Web App':
      baseBudget = 2500;
      baseDays = 21;
      baseComplexity = 60;
      break;
    case 'Bubble.io App':
      baseBudget = 1800;
      baseDays = 14;
      baseComplexity = 50;
      break;
    case 'Landing Page':
      baseBudget = 400;
      baseDays = 5;
      baseComplexity = 15;
      break;
    case 'Custom Website':
      baseBudget = 1200;
      baseDays = 14;
      baseComplexity = 40;
      break;
    default:
      baseBudget = 800;
      baseDays = 10;
      baseComplexity = 30;
  }

  // 2. Size Multipliers
  let sizeMultiplier = 1.0;
  switch (projectSize) {
    case '1 page':
      sizeMultiplier = 1.0;
      break;
    case '2-5 pages':
      sizeMultiplier = 1.25;
      break;
    case '6-10 pages':
      sizeMultiplier = 1.5;
      break;
    case '10+ pages':
      sizeMultiplier = 1.9;
      break;
    default:
      sizeMultiplier = 1.0;
  }

  let totalBudget = baseBudget * sizeMultiplier;
  let totalDays = baseDays * sizeMultiplier;
  let complexity = baseComplexity;

  // 3. Feature Adjustments
  const featureList: string[] = [];
  selectedFeatures.forEach((feat) => {
    switch (feat) {
      case 'Admin Dashboard':
        totalBudget += 350;
        totalDays += 3;
        complexity += 12;
        featureList.push('Custom Admin Panel for content control');
        break;
      case 'Blog System':
        totalBudget += 180;
        totalDays += 2;
        complexity += 8;
        featureList.push('SEO-friendly Blog module');
        break;
      case 'Login / Register System':
        totalBudget += 250;
        totalDays += 3;
        complexity += 10;
        featureList.push('Secure credentials user signup');
        break;
      case 'Google Login':
        totalBudget += 120;
        totalDays += 1;
        complexity += 4;
        featureList.push('Social single-sign-on (SSO)');
        break;
      case 'Contact Form':
        totalBudget += 50;
        totalDays += 0;
        complexity += 2;
        featureList.push('Visitor communication form');
        break;
      case 'Image Upload':
        totalBudget += 150;
        totalDays += 1.5;
        complexity += 6;
        featureList.push('Cloud/ImgBB user asset uploads');
        break;
      case 'Payment Integration':
        totalBudget += 350;
        totalDays += 4;
        complexity += 15;
        featureList.push('Stripe checkout gateways');
        break;
      case 'SEO Setup':
        totalBudget += 120;
        totalDays += 1;
        complexity += 4;
        featureList.push('Robots/Sitemaps/Meta optimization');
        break;
      case 'Animation':
        totalBudget += 150;
        totalDays += 2;
        complexity += 5;
        featureList.push('Framer Motion visual micro-interactions');
        break;
      case 'Analytics Dashboard':
        totalBudget += 250;
        totalDays += 2.5;
        complexity += 8;
        featureList.push('Visitor events metrics trackers');
        break;
      case 'User Dashboard':
        totalBudget += 350;
        totalDays += 3.5;
        complexity += 12;
        featureList.push('Personalized user profiles console');
        break;
      case 'CMS Content Management':
        totalBudget += 250;
        totalDays += 2.5;
        complexity += 7;
        featureList.push('Dynamic database layouts mapping');
        break;
    }
  });

  // 4. Design style multiplier
  let designMultiplier = 1.0;
  switch (designStyle) {
    case 'Minimal':
      designMultiplier = 1.0;
      break;
    case 'Premium':
      designMultiplier = 1.25;
      complexity += 5;
      break;
    case 'Creative':
      designMultiplier = 1.35;
      complexity += 10;
      break;
    case 'Corporate':
      designMultiplier = 1.15;
      break;
  }
  totalBudget *= designMultiplier;

  // 5. Timeline multipliers
  let timelineMultiplier = 1.0;
  switch (timeline) {
    case 'Urgent':
      timelineMultiplier = 1.3;
      totalDays = Math.max(3, Math.floor(totalDays * 0.6)); // cut 40% off the days
      break;
    case '1 week':
      timelineMultiplier = 1.15;
      totalDays = 7;
      break;
    case '2 weeks':
      timelineMultiplier = 1.0;
      totalDays = 14;
      break;
    case 'Flexible':
      timelineMultiplier = 0.9;
      totalDays = Math.floor(totalDays * 1.35); // add 35% more days
      break;
  }
  totalBudget *= timelineMultiplier;

  // Cap complexity score to 100
  const finalComplexityScore = Math.min(100, Math.max(10, complexity));

  // Determine Package
  let estimatedPackage: 'Basic' | 'Standard' | 'Premium' | 'Custom' = 'Standard';
  if (totalBudget < 800) {
    estimatedPackage = 'Basic';
  } else if (totalBudget >= 800 && totalBudget < 2000) {
    estimatedPackage = 'Standard';
  } else if (totalBudget >= 2000 && totalBudget < 4000) {
    estimatedPackage = 'Premium';
  } else {
    estimatedPackage = 'Custom';
  }

  // Format Timeline String
  let estimatedTimeline = '';
  if (totalDays <= 3) {
    estimatedTimeline = '1-3 days';
  } else if (totalDays <= 7) {
    estimatedTimeline = '1 week';
  } else if (totalDays <= 14) {
    estimatedTimeline = '1-2 weeks';
  } else if (totalDays <= 21) {
    estimatedTimeline = '2-3 weeks';
  } else if (totalDays <= 30) {
    estimatedTimeline = '3-4 weeks';
  } else {
    const weeks = Math.ceil(totalDays / 7);
    estimatedTimeline = `${Math.floor(weeks * 0.8)}-${weeks} weeks`;
  }

  // Generate Suggested Features if none selected, or general recommendations
  if (featureList.length === 0) {
    featureList.push('SEO metadata mapping configuration');
    featureList.push('Modern mobile-first responsive adjustments');
  }

  const generatedSummary = `A ${designStyle} style ${projectType} consisting of ${projectSize}. Calculated build includes ${
    selectedFeatures.length
  } key integrations like: ${selectedFeatures.slice(0, 3).join(', ')}${
    selectedFeatures.length > 3 ? ' and more' : ''
  }. Estimated complexity score: ${finalComplexityScore}/100.`;

  return {
    estimatedPackage,
    estimatedTimeline,
    complexityScore: finalComplexityScore,
    suggestedFeatures: featureList,
    generatedSummary,
  };
}
