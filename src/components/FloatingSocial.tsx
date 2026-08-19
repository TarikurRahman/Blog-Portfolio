'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, X, Share2 } from 'lucide-react';

export const FloatingSocial = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleChatClick = () => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin?tab=chats');
      } else {
        router.push('/dashboard?tab=chat');
      }
    } else {
      router.push('/login?redirect=/dashboard?tab=chat');
    }
  };

  const chatTooltip = user?.role === 'admin' ? 'View Live Chats' : 'Live Chat with Tarikur';

  const containerVariants = {
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  } as const;

  const itemVariants = {
    closed: {
      opacity: 0,
      y: 40,
      scale: 0.6,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 30
      }
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 20
      }
    }
  } as const;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 items-end pb-2"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Sub-menu items container */}
      <motion.div 
        variants={containerVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className="flex flex-col gap-3.5 items-end mb-1"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        {/* 1. WhatsApp Floating Button */}
        <motion.div variants={itemVariants} className="relative group flex items-center justify-end">
          <span className="absolute right-16 bg-brand-card-dark/95 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-brand-border-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl translate-x-2 group-hover:translate-x-0">
            Chat on WhatsApp
          </span>

          <motion.a
            href="https://wa.me/8801633003462"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Tarikur on WhatsApp"
            whileHover={{ 
              scale: 1.12, 
              rotate: -8,
              transition: { type: 'spring', stiffness: 400, damping: 12 }
            }}
            whileTap={{ scale: 0.94 }}
            className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white rounded-full shadow-[0_0_15px_rgba(37,211,102,0.45)] border border-white/20 hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] transition-shadow duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5 sm:w-5.5 sm:h-5.5">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
          </motion.a>
        </motion.div>

        {/* 2. Facebook Floating Button */}
        <motion.div variants={itemVariants} className="relative group flex items-center justify-end">
          <span className="absolute right-16 bg-brand-card-dark/95 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-brand-border-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl translate-x-2 group-hover:translate-x-0">
            Connect on Facebook
          </span>

          <motion.a
            href="https://www.facebook.com/tarikurrahman/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Connect with Tarikur on Facebook"
            whileHover={{ 
              scale: 1.12, 
              rotate: 8,
              transition: { type: 'spring', stiffness: 400, damping: 12 }
            }}
            whileTap={{ scale: 0.94 }}
            className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#0062E6] to-[#33AEFF] text-white rounded-full shadow-[0_0_15px_rgba(0,98,230,0.45)] border border-white/20 hover:shadow-[0_0_25px_rgba(0,98,230,0.6)] transition-shadow duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-5.5 sm:h-5.5">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </motion.a>
        </motion.div>

        {/* 3. Real-Time Live Chat Floating Button */}
        <motion.div variants={itemVariants} className="relative group flex items-center justify-end">
          <span className="absolute right-16 bg-brand-card-dark/95 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-brand-border-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl translate-x-2 group-hover:translate-x-0">
            {chatTooltip}
          </span>

          <motion.button
            onClick={handleChatClick}
            aria-label={chatTooltip}
            whileHover={{ 
              scale: 1.12, 
              rotate: -8,
              transition: { type: 'spring', stiffness: 400, damping: 12 }
            }}
            whileTap={{ scale: 0.94 }}
            className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-tr from-[#FF007A] to-[#7928CA] text-white rounded-full shadow-[0_0_15px_rgba(255,0,122,0.45)] border border-white/20 hover:shadow-[0_0_25px_rgba(255,0,122,0.6)] transition-shadow duration-300 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 4. Trigger Button */}
      <div className="relative group flex items-center justify-end">
        <span className="absolute right-16 bg-brand-card-dark/95 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-brand-border-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl translate-x-2 group-hover:translate-x-0">
          Contact Channels
        </span>

        {/* Pulsing Aura */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-accent to-[#7928CA] opacity-35 pointer-events-none"
          animate={{ scale: isOpen ? 1 : [1, 1.3, 1], opacity: isOpen ? 0.2 : [0.35, 0, 0.35] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Expand Contacts Menu"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-[#FF007A] via-brand-accent to-[#7928CA] text-white rounded-full shadow-[0_0_20px_rgba(244,63,94,0.45)] border border-white/25 hover:shadow-[0_0_30px_rgba(244,63,94,0.75)] transition-shadow duration-300 cursor-pointer"
        >
          {/* Transition Icon between Share/Message and Close X */}
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center justify-center"
          >
            {isOpen ? (
              <X className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5" />
            ) : (
              <Share2 className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};

export default FloatingSocial;
