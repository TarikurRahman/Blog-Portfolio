'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { Service } from '../data/types';
import Card from './Card';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const { title, iconName, description, bullets } = service;
  
  // Resolve Lucide Icon dynamically
  const IconComponent = (Icons as any)[iconName] || Icons.Layers;

  return (
    <Card hoverEffect className="flex flex-col h-full group">
      <div className="p-3.5 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-xl w-fit mb-5 transition-colors group-hover:bg-brand-accent group-hover:text-white duration-300">
        <IconComponent className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-xs text-brand-text-muted mb-6 leading-relaxed flex-grow">{description}</p>

      <ul className="space-y-3.5 border-t border-brand-border-white pt-5">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs text-white/95">
            <Icons.CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
            <span className="leading-normal">{bullet}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default ServiceCard;
