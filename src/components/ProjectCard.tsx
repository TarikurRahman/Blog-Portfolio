'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Project } from '../data/types';
import OptimizedImage from './OptimizedImage';
import Card from './Card';
import Button from './Button';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { id, title, category, description, tags, image, liveUrl } = project;

  return (
    <Card hoverEffect className="flex flex-col h-full overflow-hidden p-0! border border-brand-border-white">
      {/* Image Panel */}
      <div className="relative aspect-video w-full overflow-hidden bg-brand-card-dark">
        <OptimizedImage
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-brand-bg/90 border border-brand-accent/30 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-brand-accent uppercase tracking-wider">
          {category}
        </span>
      </div>

      {/* Info Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-2 tracking-tight line-clamp-1">{title}</h3>
        <p className="text-xs text-brand-text-muted mb-4 leading-relaxed line-clamp-2 flex-grow">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-medium px-2 py-0.5 bg-brand-card-light text-brand-text-muted rounded"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[9px] font-medium px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded">
              +{tags.length - 3} more
            </span>
          )}
        </div>

        {/* Actions Button */}
        <div className="flex items-center gap-2 mt-auto">
          <Link href={`/projects/${id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full text-xs font-semibold py-2!" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Details
            </Button>
          </Link>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-brand-card-light hover:bg-brand-accent/10 border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all duration-300"
            title="Live Demo"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
