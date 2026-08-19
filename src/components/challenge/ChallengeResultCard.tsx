import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle, XCircle, Clock, Zap, BookOpen } from 'lucide-react';
import Button from '../Button';

interface GradedAttempt {
  id: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  timeTakenSeconds: number;
  status: string;
}

interface QuestionKey {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

interface ChallengeResultCardProps {
  attempt: GradedAttempt;
  challengeTitle: string;
  resultPublished: boolean;
  questions?: QuestionKey[];
  answers?: { questionId: string; selectedOptionIndex: number }[];
}

export default function ChallengeResultCard({
  attempt,
  challengeTitle,
  resultPublished,
  questions = [],
  answers = [],
}: ChallengeResultCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSuccessMessage = (pct: number) => {
    if (pct >= 80) return { title: 'Outstanding Job!', desc: 'You mastered this topic. Tarikur is impressed!' };
    if (pct >= 50) return { title: 'Nice Try!', desc: 'Good attempt. Check back when final results are published.' };
    return { title: 'Keep Learning!', desc: 'Read the blog post again and retry to improve your score.' };
  };

  const msg = getSuccessMessage(attempt.percentage);

  // Map answers for easy lookups
  const userAnswersMap = new Map(answers.map((a) => [a.questionId, a.selectedOptionIndex]));

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 text-left">
      
      {/* Overview Card */}
      <div className="bg-brand-card border border-brand-accent/20 rounded-3xl p-6 md:p-8 relative overflow-hidden glow-accent">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <span className="text-[9px] font-bold px-2.5 py-1 rounded bg-brand-accent/15 text-brand-accent border border-brand-accent/20 uppercase tracking-widest block w-fit mb-3">
              Challenge Finished
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{msg.title}</h2>
            <p className="text-xs text-brand-text-muted mt-1 max-w-md">{msg.desc}</p>
          </div>

          <div className="shrink-0 p-4 bg-brand-card-dark border border-brand-border-white/5 rounded-2xl text-center">
            <span className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider block">Complexity Score</span>
            <span className="text-3xl font-black text-brand-accent tracking-tighter mt-1 block">
              {attempt.score} <span className="text-xs text-brand-text-muted">Pts</span>
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-brand-border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider block">Correct</span>
              <span className="text-sm font-extrabold text-white">{attempt.correctAnswers}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider block">Incorrect</span>
              <span className="text-sm font-extrabold text-white">{attempt.wrongAnswers}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider block">Time Taken</span>
              <span className="text-sm font-extrabold text-white">{formatTime(attempt.timeTakenSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider block">Success</span>
              <span className="text-sm font-extrabold text-white">{Math.round(attempt.percentage)}%</span>
            </div>
          </div>
        </div>

        {/* Informative footer */}
        <div className="mt-8 p-3.5 bg-brand-bg/50 border border-brand-border-white/5 rounded-2xl text-[10px] text-brand-text-muted leading-relaxed">
          {!resultPublished ? (
            <span>
              <strong>Note on Rankings</strong>: Your score has been saved. The global leaderboard and final winners list will update on the Home page once Tarikur concludes attempts and publishes the official results.
            </span>
          ) : (
            <span>
              <strong>Leaderboard Live!</strong> Tarikur has published results. Check the challenge portal below to view your ranking position on the global board.
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-6">
          <Link href="/read-rank-challenge">
            <Button variant="primary" size="md">
              Challenge Hub
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="secondary" size="md" leftIcon={<BookOpen className="w-4 h-4" />}>
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>

      {/* Review Questions (if result is published) */}
      {resultPublished && questions.length > 0 && (
        <div className="bg-brand-card border border-brand-accent/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-white border-l-3 border-brand-accent pl-3">
            Review Questions & Correct Keys
          </h3>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selectedIdx = userAnswersMap.get(q.id);
              const isCorrect = selectedIdx === q.correctOptionIndex;

              return (
                <div key={q.id} className="p-5 bg-brand-card-dark border border-brand-border-white/5 rounded-2xl flex flex-col gap-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand-text-muted font-bold">Question {idx + 1}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm font-bold text-white leading-relaxed">{q.questionText}</p>

                  <div className="flex flex-col gap-2.5">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selectedIdx === oIdx;
                      const isOptionCorrect = q.correctOptionIndex === oIdx;

                      let optStyle = 'border-brand-border-white/5 bg-brand-card text-brand-text-muted';
                      if (isOptionCorrect) {
                        optStyle = 'border-green-500/40 bg-green-500/10 text-green-400 font-semibold';
                      } else if (isOptionSelected) {
                        optStyle = 'border-red-500/40 bg-red-500/10 text-red-400 font-semibold';
                      }

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border text-[11px] flex items-center justify-between ${optStyle}`}>
                          <span>{opt}</span>
                          <span className="text-[8px] font-extrabold uppercase">
                            {isOptionCorrect && 'Correct Answer'}
                            {isOptionSelected && !isOptionCorrect && 'Your Choice'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
