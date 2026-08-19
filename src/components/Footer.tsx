'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Linkedin, Twitter, Heart, Facebook } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-card-dark border-t border-brand-border-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="text-xl font-bold text-white tracking-tight flex items-center gap-0.5">
              Tarikur<span className="text-brand-accent">.</span>
            </Link>
            <p className="text-xs text-brand-text-muted mt-2 max-w-xs leading-relaxed">
              Crafting premium digital products, frontend layout systems, and fast no-code architectures.
            </p>
          </div>

          {/* Site Map Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            <Link href="/" className="text-brand-text hover:text-brand-accent transition-colors">Home</Link>
            <Link href="/about" className="text-brand-text hover:text-brand-accent transition-colors">About</Link>
            <Link href="/projects" className="text-brand-text hover:text-brand-accent transition-colors">Projects</Link>
            <Link href="/blog" className="text-brand-text hover:text-brand-accent transition-colors">Blog</Link>
            <Link href="/contact" className="text-brand-text hover:text-brand-accent transition-colors">Contact</Link>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-brand-card hover:bg-brand-accent/10 border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all duration-300"
            >
              <Github className="w-4.5 h-4.5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-brand-card hover:bg-brand-accent/10 border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all duration-300"
            >
              <Linkedin className="w-4.5 h-4.5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-brand-card hover:bg-brand-accent/10 border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all duration-300"
            >
              <Twitter className="w-4.5 h-4.5" />
            </a>
            <a
              href="https://www.facebook.com/tarikurrahman/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-brand-card hover:bg-brand-accent/10 border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all duration-300"
              title="Facebook"
            >
              <Facebook className="w-4.5 h-4.5" />
            </a>
            <a
              href="https://wa.me/8801633003462"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-brand-card hover:bg-brand-accent/10 border border-brand-border-white hover:border-brand-accent text-brand-text-muted hover:text-brand-accent rounded-xl transition-all duration-300"
              title="WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-4.5 h-4.5">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-brand-border-white mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-text-muted">
          <p>© {currentYear} Tarikur. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-brand-accent fill-brand-accent animate-pulse" /> using Next.js & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
