'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface ChallengeTimerProps {
  startedAt: string;
  timeLimitMinutes: number;
  onExpire: () => void;
}

export default function ChallengeTimer({ startedAt, timeLimitMinutes, onExpire }: ChallengeTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const startTime = new Date(startedAt).getTime();
      const endTime = startTime + timeLimitMinutes * 60 * 1000;
      const now = new Date().getTime();
      const difference = Math.max(0, Math.floor((endTime - now) / 1000));
      return difference;
    };

    setSecondsLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, timeLimitMinutes, onExpire]);

  if (secondsLeft === null) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 60; // Less than 1 minute

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-300 font-extrabold text-xs tracking-wider shadow-md ${
        isUrgent
          ? 'bg-red-500/10 border-red-500/40 text-red-500 animate-pulse'
          : 'bg-brand-card-dark border-brand-accent/25 text-brand-accent'
      }`}
    >
      {isUrgent ? (
        <AlertCircle className="w-4 h-4 shrink-0 text-red-500 animate-spin" />
      ) : (
        <Clock className="w-4 h-4 shrink-0 text-brand-accent" />
      )}
      <span>
        Time Remaining:{' '}
        <span className="font-mono text-sm">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </span>
    </div>
  );
}
