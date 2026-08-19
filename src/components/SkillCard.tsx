'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Skill } from '../data/types';
import Card from './Card';

interface SkillCardProps {
  skill: Skill;
}

export const SkillCard = ({ skill }: SkillCardProps) => {
  const { name, level, iconName } = skill;
  
  // Resolve Lucide Icon dynamically
  const IconComponent = (Icons as any)[iconName] || Icons.Code;

  return (
    <Card hoverEffect className="relative overflow-hidden group">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-xl transition-colors group-hover:bg-brand-accent group-hover:text-white duration-300">
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm tracking-tight">{name}</h4>
          <span className="text-xs text-brand-accent font-semibold">{level}% Proficiency</span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden border border-brand-border-white">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-brand-accent to-orange-400 rounded-full"
        />
      </div>
    </Card>
  );
};

export default SkillCard;
