'use client';

import React from 'react';
import { Calendar, Briefcase } from 'lucide-react';
import { Experience } from '../data/types';
import Card from './Card';

interface ExperienceCardProps {
  experience: Experience;
}

export const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  const { role, company, duration, description, tags } = experience;

  return (
    <Card hoverEffect className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
      {/* Date & Icons */}
      <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1.5 shrink-0">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-full text-xs font-semibold text-brand-accent whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5" />
          {duration}
        </span>
        <span className="text-xs text-brand-text-muted font-medium flex items-center gap-1 md:ml-1">
          <Briefcase className="w-3.5 h-3.5 text-brand-border" />
          {company}
        </span>
      </div>

      {/* Details info */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{role}</h3>
        <p className="text-xs text-brand-text-muted mb-4 leading-relaxed">{description}</p>
        
        {/* Technologies Pills */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 bg-brand-card-light text-white rounded border border-brand-border-white"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ExperienceCard;
