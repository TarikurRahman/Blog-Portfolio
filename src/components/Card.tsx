'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick
}: CardProps) => {
  const isClickable = !!onClick;

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, borderColor: 'rgba(255, 101, 63, 0.35)', boxShadow: '0 10px 30px -10px rgba(255, 101, 63, 0.15)' } : {}}
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 border border-brand-border-white ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
