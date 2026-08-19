import React from 'react';
import { Sparkles, Calendar, Zap, ClipboardList, CheckCircle } from 'lucide-react';
import { EstimatorResult } from '@/lib/estimator';

interface EstimateSummaryProps {
  result: EstimatorResult;
}

export default function EstimateSummary({ result }: EstimateSummaryProps) {
  const { estimatedPackage, estimatedTimeline, complexityScore, suggestedFeatures, generatedSummary } = result;

  const packageColors = {
    Basic: 'from-blue-500/20 to-teal-500/10 border-blue-500/30 text-blue-400',
    Standard: 'from-indigo-500/20 to-brand-accent/15 border-brand-accent/30 text-brand-accent',
    Premium: 'from-purple-500/25 to-pink-500/15 border-purple-500/40 text-purple-400',
    Custom: 'from-amber-500/20 to-red-500/20 border-red-500/40 text-red-400',
  };

  return (
    <div className="relative rounded-3xl bg-brand-card border border-brand-accent/20 p-6 md:p-8 flex flex-col gap-6 text-left glow-accent overflow-hidden h-full">
      {/* Background visual core */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-accent/10 rounded-full blur-[45px] pointer-events-none" />

      <div className="flex items-center gap-3 pb-4 border-b border-brand-border-white/5">
        <Sparkles className="w-5 h-5 text-brand-accent animate-pulse" />
        <h3 className="text-lg font-bold text-white tracking-tight">Instant Estimator Brief</h3>
      </div>

      {/* Package tier badge */}
      <div>
        <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider block mb-2">Recommended Setup</span>
        <div className={`inline-flex px-4 py-1.5 rounded-full border bg-gradient-to-r ${packageColors[estimatedPackage]} font-extrabold text-sm tracking-wide shadow-md`}>
          {estimatedPackage} Build Package
        </div>
      </div>

      {/* Timeline and Complexity metrics grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-brand-card-dark border border-brand-border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-brand-text-muted text-[10px] font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-brand-accent" />
            Timeline
          </div>
          <span className="text-sm font-extrabold text-white">{estimatedTimeline}</span>
        </div>

        <div className="p-4 rounded-2xl bg-brand-card-dark border border-brand-border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-brand-text-muted text-[10px] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-brand-accent" />
            Complexity
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white">{complexityScore}%</span>
            <div className="flex-1 h-1.5 bg-brand-card rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-accent to-orange-400 transition-all duration-500"
                style={{ width: `${complexityScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary statement */}
      <div className="p-4 rounded-2xl bg-brand-card-dark/65 border border-brand-border-white/5">
        <span className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider block mb-1.5">Brief Summary</span>
        <p className="text-xs text-brand-text-muted leading-relaxed font-medium">
          {generatedSummary}
        </p>
      </div>

      {/* Suggested features checklist */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-brand-text-muted text-[10px] font-bold uppercase tracking-wider">
          <ClipboardList className="w-3.5 h-3.5 text-brand-accent" />
          Calculated Features list
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {suggestedFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-white">
              <CheckCircle className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-brand-text-muted italic border-t border-brand-border-white/5 pt-4 mt-auto">
        * Estimates are approximate. Final budget and timelines depend on actual specification details.
      </div>
    </div>
  );
}
