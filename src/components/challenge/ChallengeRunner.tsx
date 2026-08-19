'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Play, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ChallengeTimer from './ChallengeTimer';
import ChallengeQuestion from './ChallengeQuestion';
import ChallengeResultCard from './ChallengeResultCard';
import Button from '../Button';
import LoadingState from '../LoadingState';

interface ChallengeRunnerProps {
  challengeId: string;
}

export default function ChallengeRunner({ challengeId }: ChallengeRunnerProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [challenge, setChallenge] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isResumed, setIsResumed] = useState(false);

  // Check attempt status on mount
  useEffect(() => {
    const checkAttempt = async () => {
      try {
        setLoading(true);
        // Call start endpoint: if an ongoing attempt exists, the backend returns it.
        // Otherwise, it returns challenge details first.
        const res = await fetch(`/api/challenges/${challengeId}/start`, { method: 'POST' });
        const json = await res.json();
        
        if (res.ok && json.success) {
          if (json.data.attempt) {
            setAttempt(json.data.attempt);
            setQuestions(json.data.questions);
            setIsResumed(true);
            
            // Map existing answers if resuming (though answers array starts empty on DB, we initialize client map)
            const map: { [qId: string]: number } = {};
            json.data.attempt.answers?.forEach((a: any) => {
              map[a.questionId] = a.selectedOptionIndex;
            });
            setSelectedAnswers(map);
          }
        } else {
          // If we got an error, it might be because the user hasn't started yet.
          // Let's query challenge details from standard public metadata (which we can fetch from a generic api).
          // We'll write a simple check or fetch.
          setError(json.message || 'Failed to initialize challenge.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to connect to the database.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkAttempt();
    } else {
      setLoading(false);
    }
  }, [challengeId, user]);

  const startChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/challenges/${challengeId}/start`, { method: 'POST' });
      const json = await res.json();

      if (res.ok && json.success) {
        setAttempt(json.data.attempt);
        setQuestions(json.data.questions);
        setCurrentIdx(0);
        setSelectedAnswers({});
        showToast('Challenge started! Good luck.', 'success');
      } else {
        setError(json.message || 'Failed to start challenge.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (optIdx: number) => {
    const activeQ = questions[currentIdx];
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQ.id]: optIdx,
    }));
  };

  const submitAttempt = async (autoSubmit = false) => {
    if (isSubmitting || isFinished) return;
    setIsSubmitting(true);

    const answersList = Object.entries(selectedAnswers).map(([qId, idx]) => ({
      questionId: qId,
      selectedOptionIndex: idx,
    }));

    try {
      const res = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersList, autoSubmit }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setAttempt(json.data.attempt);
        setIsFinished(true);
        showToast(
          autoSubmit ? 'Time expired. Attempt auto-submitted!' : 'Quiz submitted successfully!',
          autoSubmit ? 'warning' : 'success'
        );
      } else {
        showToast(json.message || 'Submission failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error sending quiz submission.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 bg-brand-card border border-brand-accent/25 rounded-3xl text-white">
        <ShieldAlert className="w-12 h-12 text-brand-accent mx-auto mb-4" />
        <h2 className="text-xl font-bold">Authentication Required</h2>
        <p className="text-xs text-brand-text-muted mt-2 mb-6">
          Please login or create an account to test your knowledge and climb the challenge leaderboards.
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message="Connecting to testing server..." />;
  }

  if (error && !attempt) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 bg-brand-card border border-red-500/25 rounded-3xl text-white flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Access Blocked</h2>
        <p className="text-xs text-brand-text-muted mt-2 mb-6">{error}</p>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Back to Articles
        </Button>
      </div>
    );
  }

  if (isFinished && attempt) {
    return (
      <ChallengeResultCard
        attempt={attempt}
        challengeTitle={challenge?.title || 'Challenge'}
        resultPublished={attempt.resultPublished}
      />
    );
  }

  // Pre-start Lobby view
  if (!attempt) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-10 bg-brand-card border border-brand-accent/25 rounded-3xl glow-accent text-white text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl pointer-events-none" />
        
        <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-brand-accent/15 text-brand-accent border border-brand-accent/20 uppercase tracking-widest block w-fit mb-3">
          Challenge Briefing
        </span>
        <h2 className="text-2xl font-black tracking-tight mb-4">Read & Rank Timed MCQ</h2>
        
        <div className="space-y-4 text-xs text-brand-text-muted mb-8 leading-relaxed">
          <p>
            You are about to start a timed knowledge validation assessment. Make sure you read the associated blog details closely, as questions are tailored to core concepts, configurations, and stack details.
          </p>
          <div className="p-4 bg-brand-card-dark rounded-2xl border border-brand-border-white/5 space-y-2 font-semibold">
            <p className="text-white">Assessment Parameters:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Time limit counts down instantly on start</li>
              <li>Leaving or refreshing the browser does NOT reset the timer</li>
              <li>Unanswered questions receive 0 points</li>
              <li>Correct answers are calculated and ranked by score, speed, and time</li>
            </ul>
          </div>
        </div>

        <Button variant="primary" size="lg" onClick={startChallenge} rightIcon={<Play className="w-4 h-4 fill-white" />}>
          Start Timer & Play
        </Button>
      </div>
    );
  }

  // Challenge playing interface
  const activeQuestion = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 text-white">
      
      {/* Quiz Progress & Timer header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-brand-card border border-brand-accent/15 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-accent/15 flex items-center justify-center font-extrabold text-xs text-brand-accent">
            {currentIdx + 1}/{questions.length}
          </div>
          <div>
            <p className="text-[10px] text-brand-text-muted leading-none font-bold uppercase tracking-wider">Progress</p>
            <p className="text-xs text-white font-semibold mt-1">Questions answered: {Object.keys(selectedAnswers).length}</p>
          </div>
        </div>

        <ChallengeTimer
          startedAt={attempt.startedAt}
          timeLimitMinutes={attempt.timeLimitMinutes}
          onExpire={() => submitAttempt(true)}
        />
      </div>

      {/* Main question card */}
      <div className="bg-brand-card border border-brand-accent/15 rounded-3xl p-6 md:p-10 min-h-[380px] flex flex-col justify-between">
        {activeQuestion && (
          <ChallengeQuestion
            question={activeQuestion}
            index={currentIdx}
            selectedOptionIndex={selectedAnswers[activeQuestion.id] ?? null}
            onSelectOption={selectOption}
          />
        )}

        {/* Question controls bar */}
        <div className="flex items-center justify-between border-t border-brand-border-white/5 pt-6 mt-8">
          <Button
            variant="secondary"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {currentIdx < questions.length - 1 ? (
            <Button
              variant="secondary"
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => submitAttempt(false)}
              isLoading={isSubmitting}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Challenge
            </Button>
          )}
        </div>
      </div>

      {/* Questions dots list */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;
          const isActive = idx === currentIdx;

          let dotClass = 'bg-brand-card-dark border-brand-border-white/5 text-brand-text-muted';
          if (isActive) {
            dotClass = 'bg-brand-accent border-brand-accent text-white scale-110';
          } else if (isAnswered) {
            dotClass = 'bg-brand-accent/20 border-brand-accent/30 text-brand-accent';
          }

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] transition-all ${dotClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
