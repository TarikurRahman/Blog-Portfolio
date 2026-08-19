import React from 'react';
import { HelpCircle } from 'lucide-react';

interface QuestionData {
  id: string;
  questionText: string;
  options: string[];
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

interface ChallengeQuestionProps {
  question: QuestionData;
  index: number;
  selectedOptionIndex: number | null;
  onSelectOption: (optionIdx: number) => void;
}

export default function ChallengeQuestion({
  question,
  index,
  selectedOptionIndex,
  onSelectOption,
}: ChallengeQuestionProps) {
  const difficultyColors = {
    Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header with difficulty tag and weight */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-accent" />
          <span className="text-xs font-extrabold text-white">Question {index + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
          <span className="px-2.5 py-0.5 rounded-full border border-brand-border-white/5 bg-brand-card-dark text-[9px] font-bold text-brand-text-muted">
            {question.points} Points
          </span>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
        {question.questionText}
      </h3>

      {/* Options List */}
      <div className="flex flex-col gap-3">
        {question.options.map((opt, optIdx) => {
          const isSelected = selectedOptionIndex === optIdx;
          return (
            <button
              key={optIdx}
              onClick={() => onSelectOption(optIdx)}
              className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all duration-300 flex items-center justify-between group ${
                isSelected
                  ? 'border-brand-accent bg-brand-accent/10 text-white'
                  : 'border-brand-border-white/5 bg-brand-card-dark text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
              }`}
            >
              <span>{opt}</span>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  isSelected
                    ? 'bg-brand-accent border-brand-accent text-white'
                    : 'border-brand-border-white/10 group-hover:border-brand-accent/40'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
