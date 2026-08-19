'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Send, CheckCircle2, DollarSign, Laptop, Settings2, ShieldAlert } from 'lucide-react';
import { calculateProjectEstimate, EstimatorResult } from '@/lib/estimator';
import EstimateSummary from './EstimateSummary';
import Button from '../Button';
import Card from '../Card';

const PROJECT_TYPES = [
  'Portfolio Website',
  'Business Website',
  'Shopify Store',
  'Blog Website',
  'Dashboard / Web App',
  'Bubble.io App',
  'Landing Page',
  'Custom Website',
];

const PROJECT_SIZES = ['1 page', '2-5 pages', '6-10 pages', '10+ pages'];

const FEATURES = [
  'Admin Dashboard',
  'Blog System',
  'Login / Register System',
  'Google Login',
  'Contact Form',
  'Image Upload',
  'Payment Integration',
  'SEO Setup',
  'Animation',
  'Analytics Dashboard',
  'User Dashboard',
  'CMS Content Management',
];

const DESIGN_STYLES = ['Minimal', 'Premium', 'Creative', 'Corporate'];
const TIMELINES = ['Urgent', '1 week', '2 weeks', 'Flexible'];
const BUDGET_RANGES = ['Low', 'Medium', 'High', 'Not sure'];

export default function ProjectEstimator() {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [projectSize, setProjectSize] = useState(PROJECT_SIZES[1]); // default '2-5 pages'
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [designStyle, setDesignStyle] = useState(DESIGN_STYLES[0]);
  const [timeline, setTimeline] = useState(TIMELINES[2]); // default '2-weeks'
  const [budgetRange, setBudgetRange] = useState(BUDGET_RANGES[1]); // default 'Medium'

  // Step 5 contact info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [businessUrl, setBusinessUrl] = useState('');
  const [extraMessage, setExtraMessage] = useState('');

  // Live estimate state
  const [estimate, setEstimate] = useState<EstimatorResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Recalculate on input change
  useEffect(() => {
    const res = calculateProjectEstimate({
      projectType,
      projectSize,
      selectedFeatures,
      designStyle,
      timeline,
      budgetRange,
    });
    setEstimate(res);
  }, [projectType, projectSize, selectedFeatures, designStyle, timeline, budgetRange]);

  const handleFeatureToggle = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleNext = () => {
    if (step < 5) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !whatsapp) {
      setSubmitError('Please fill in Name, Email, and WhatsApp number.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/project-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          businessUrl,
          projectType,
          projectSize,
          selectedFeatures,
          designStyle,
          timeline,
          budgetRange,
          complexityScore: estimate?.complexityScore,
          estimatedPackage: estimate?.estimatedPackage,
          estimatedTimeline: estimate?.estimatedTimeline,
          generatedSummary: estimate?.generatedSummary,
          extraMessage,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(data.message || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 bg-brand-card rounded-3xl border border-brand-accent/25 glow-accent text-white flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-brand-accent mb-6 animate-bounce" />
        <h2 className="text-2xl font-bold tracking-tight mb-3">Brief Submitted Successfully!</h2>
        <p className="text-xs text-brand-text-muted mb-8 leading-relaxed">
          Thank you for sharing your project parameters. Tarikur has received your instant brief and will review the complexity score, timeline request, and recommended packaging. You will be contacted shortly via WhatsApp or Email.
        </p>
        <Button variant="primary" size="md" onClick={() => window.location.reload()}>
          Start New Estimate
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-6">
      
      {/* Estimator Steps Panel */}
      <div className="lg:col-span-8 bg-brand-card border border-brand-accent/15 rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col min-h-[550px]">
        {/* Step indicator badges */}
        <div className="flex items-center justify-between pb-6 border-b border-brand-border-white/5 mb-8">
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-5 h-5 text-brand-accent" />
            <h2 className="text-base font-bold text-white tracking-tight">Step {step} of 5</h2>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'w-6 bg-brand-accent' : 'w-2 bg-brand-border-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Project Type */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2 text-left">Select Project Type</h3>
            <p className="text-xs text-brand-text-muted mb-6 text-left">Choose the category that best matches your digital application goal.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PROJECT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setProjectType(type)}
                  className={`p-4 rounded-2xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                    projectType === type
                      ? 'border-brand-accent bg-brand-accent/10 text-white'
                      : 'border-brand-border-white/5 bg-brand-card-dark text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
                  }`}
                >
                  <span>{type}</span>
                  {projectType === type && (
                    <div className="w-5 h-5 bg-brand-accent rounded-full flex items-center justify-center text-white shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Project Size */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2 text-left">Select Project Size</h3>
            <p className="text-xs text-brand-text-muted mb-6 text-left">Estimate the number of layouts or views needed inside this project.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROJECT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setProjectSize(size)}
                  className={`p-6 rounded-2xl border text-left font-bold transition-all flex flex-col gap-2 ${
                    projectSize === size
                      ? 'border-brand-accent bg-brand-accent/10 text-white'
                      : 'border-brand-border-white/5 bg-brand-card-dark text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
                  }`}
                >
                  <Laptop className={`w-6 h-6 ${projectSize === size ? 'text-brand-accent' : 'text-brand-text-muted'}`} />
                  <span className="text-sm mt-1">{size}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Features Needed */}
        {step === 3 && (
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2 text-left">Choose Integrations</h3>
            <p className="text-xs text-brand-text-muted mb-6 text-left">Select the specific functionalities required to support operations.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {FEATURES.map((feat) => {
                const isSelected = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    onClick={() => handleFeatureToggle(feat)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-accent bg-brand-accent/10 text-white'
                        : 'border-brand-border-white/5 bg-brand-card-dark text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
                    }`}
                  >
                    <span>{feat}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-brand-accent border-brand-accent text-white' : 'border-brand-border-white/10'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Design & Timeline */}
        {step === 4 && (
          <div className="flex-1 flex flex-col gap-6 text-left">
            <div>
              <h3 className="text-base font-bold text-white mb-3">Design Direction Style</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DESIGN_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setDesignStyle(style)}
                    className={`py-3.5 px-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      designStyle === style
                        ? 'border-brand-accent bg-brand-accent/10 text-white'
                        : 'border-brand-border-white/5 bg-brand-card-dark text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-3">Build Timeline</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIMELINES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeline(t)}
                    className={`py-3.5 px-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      timeline === t
                        ? 'border-brand-accent bg-brand-accent/10 text-white'
                        : 'border-brand-border-white/5 bg-brand-card-dark text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-3">Budget Expectation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_RANGES.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBudgetRange(b)}
                    className={`py-3.5 px-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      budgetRange === b
                        ? 'border-brand-accent bg-brand-accent/10 text-white'
                        : 'border-brand-border-white/5 bg-brand-card-dark text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Contact Info */}
        {step === 5 && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col text-left gap-4">
            <h3 className="text-xl font-bold text-white mb-1">Contact Parameters</h3>
            <p className="text-xs text-brand-text-muted mb-4">Provide details for Tarikur to deliver the complete breakdown.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (123) 456-7890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Business / Website Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={businessUrl}
                  onChange={(e) => setBusinessUrl(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Extra Specifications (Optional)</label>
              <textarea
                rows={3}
                placeholder="Mention any custom frameworks, API requirements, or specific requests here..."
                value={extraMessage}
                onChange={(e) => setExtraMessage(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/40 resize-none"
              />
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </form>
        )}

        {/* Steps Navigation Bar */}
        <div className="flex items-center justify-between border-t border-brand-border-white/5 pt-6 mt-8">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {step < 5 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit Brief
            </Button>
          )}
        </div>
      </div>

      {/* Estimator Summary View Panel */}
      <div className="lg:col-span-4 h-full">
        {estimate && <EstimateSummary result={estimate} />}
      </div>

    </div>
  );
}
