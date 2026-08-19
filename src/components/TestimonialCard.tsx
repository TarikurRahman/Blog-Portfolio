'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { Testimonial } from '../data/types';
import Card from './Card';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  const { name, role, company, stars, text, avatar } = testimonial;

  return (
    <Card hoverEffect className="flex flex-col h-full justify-between">
      <div>
        {/* Stars */}
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < stars ? 'text-brand-accent fill-brand-accent' : 'text-brand-card-light'
              }`}
            />
          ))}
        </div>

        {/* Text */}
        <p className="text-xs text-brand-text-muted italic leading-relaxed mb-6">
          "{text}"
        </p>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 border-t border-brand-border-white pt-4 mt-auto">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-brand-accent/30"
        />
        <div>
          <h4 className="font-bold text-sm text-white tracking-tight">{name}</h4>
          <p className="text-[11px] text-brand-text-muted">
            {role} at <span className="text-brand-accent">{company}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TestimonialCard;
