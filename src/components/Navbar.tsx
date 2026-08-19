'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Settings, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from './Button';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll handler to trigger glass outline shading
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Notification states
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    text: string;
    targetTab: 'chat' | 'chats';
    senderName: string;
  } | null>(null);

  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!user) {
      initialLoadDone.current = false;
      return;
    }

    const userEmail = user.email.toLowerCase().trim();

    if (user.role === 'admin') {
      // Admin listens to all chats for new messages
      const chatsRef = collection(db, 'chats');
      const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
        if (!initialLoadDone.current) {
          initialLoadDone.current = true;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            const lastMessageAt = data.lastMessageAt?.toDate ? data.lastMessageAt.toDate() : null;
            const isRecent = lastMessageAt ? (Date.now() - lastMessageAt.getTime() < 15000) : true;

            if (isRecent) {
              if (data.unreadByAdmin === true) {
                setNotification({
                  show: true,
                  title: 'New Message Received',
                  senderName: data.userName || 'User',
                  text: data.lastMessage || '',
                  targetTab: 'chats'
                });
              } else if (data.unreadByUser === true) {
                // Admin sent a message
                setNotification({
                  show: true,
                  title: 'Message Sent Successfully',
                  senderName: 'You',
                  text: data.lastMessage || '',
                  targetTab: 'chats'
                });
              }
            }
          }
        });
      });
      return () => unsubscribe();
    } else {
      // User listens to their own chat messages subcollection for new messages
      const messagesRef = collection(db, 'chats', userEmail, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!initialLoadDone.current) {
          initialLoadDone.current = true;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
            const isRecent = createdAt ? (Date.now() - createdAt.getTime() < 15000) : true;

            if (isRecent) {
              const isMe = data.sender === 'user';
              setNotification({
                show: true,
                title: isMe ? 'Message Sent' : 'New Message from Tarikur',
                senderName: isMe ? 'You' : 'Tarikur',
                text: data.text || '',
                targetTab: 'chat'
              });
            }
          }
        });
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Auto-dismiss notification after 7 seconds
  useEffect(() => {
    if (notification && notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => prev ? { ...prev, show: false } : null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleNotificationClick = () => {
    if (!notification) return;
    setNotification(prev => prev ? { ...prev, show: false } : null);
    
    if (notification.targetTab === 'chats') {
      router.push('/admin?tab=chats');
    } else {
      router.push('/dashboard?tab=chat');
    }
  };

  // Close menus on page transitions
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Courses', path: '/courses' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    router.push('/');
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-brand-bg/85 backdrop-blur-md border-b border-brand-border-white py-3.5 shadow-lg'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-white tracking-tight group flex items-center gap-1">
            Tarikur<span className="text-brand-accent group-hover:animate-ping">.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`transition-colors relative py-1 hover:text-brand-accent ${
                    isActive ? 'text-brand-accent' : 'text-brand-text'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA & Auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/contact" className="animate-rotate-border select-none">
              <span className="px-5 py-2 text-xs font-bold text-white block">
                Hire Me
              </span>
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm text-white font-medium bg-brand-card hover:bg-brand-card-light py-1.5 px-3.5 rounded-xl border border-brand-border-white transition-all cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
                    }}
                    className="w-6 h-6 rounded-full border border-brand-accent/40 object-cover"
                  />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-brand-card border border-brand-border-white shadow-2xl rounded-xl py-2 z-20 overflow-hidden"
                      >
                        <Link
                          href={dashboardPath}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-brand-text-muted hover:text-white hover:bg-brand-card-light transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-accent" />
                          Dashboard
                        </Link>
                        <Link
                          href={`${dashboardPath}?tab=settings`}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-brand-text-muted hover:text-white hover:bg-brand-card-light transition-colors"
                        >
                          <Settings className="w-4 h-4 text-blue-400" />
                          Profile Settings
                        </Link>
                        <div className="border-t border-brand-border-white my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Trigger */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <Link href={dashboardPath}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
                  }}
                  className="w-7 h-7 rounded-full border border-brand-accent/40 object-cover"
                />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white bg-brand-card p-2 rounded-xl border border-brand-border-white cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-card border-b border-brand-border-white overflow-hidden"
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`text-sm py-1 font-medium transition-colors ${
                        isActive ? 'text-brand-accent' : 'text-brand-text'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
                <div className="border-t border-brand-border-white pt-4 flex flex-col gap-3">
                  <Link href="/contact" className="animate-rotate-border w-full text-center select-none">
                    <span className="w-full py-2 text-xs font-bold text-white block">
                      Hire Me
                    </span>
                  </Link>

                  {user ? (
                    <>
                      <Link href={dashboardPath} className="w-full">
                        <Button variant="secondary" size="sm" className="w-full" leftIcon={<LayoutDashboard className="w-4 h-4 text-brand-accent" />}>
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full"
                        leftIcon={<LogOut className="w-4 h-4" />}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/login" className="w-full">
                        <Button variant="secondary" size="sm" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" className="w-full">
                        <Button variant="primary" size="sm" className="w-full">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Floating Popup Toast Notification */}
      <AnimatePresence>
        {notification && notification.show && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={handleNotificationClick}
            className="fixed bottom-6 right-6 z-[9999] w-[340px] bg-brand-card/95 border border-brand-accent/40 shadow-[0_4px_30px_rgba(244,63,94,0.15)] backdrop-blur-md rounded-2xl p-4 flex gap-3 items-start cursor-pointer hover:border-brand-accent transition-all group overflow-hidden text-left"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="p-2.5 bg-brand-accent/10 border border-brand-accent/25 text-brand-accent rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-grow min-w-0 pr-4">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-accent block mb-0.5">
                {notification.title}
              </span>
              <span className="text-xs font-bold text-white block mb-1">
                {notification.senderName}
              </span>
              <p className="text-xs text-brand-text-muted leading-relaxed truncate max-w-full italic">
                "{notification.text}"
              </p>
              <span className="text-[9px] text-brand-accent/80 font-bold block mt-2 hover:underline">
                Click to view chat &rarr;
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setNotification(prev => prev ? { ...prev, show: false } : null);
              }}
              className="absolute top-3 right-3 text-brand-text-muted hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
