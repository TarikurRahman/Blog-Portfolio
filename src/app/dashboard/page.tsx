'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Heart, MessageSquare, Settings, LogOut, User as UserIcon, Save, Calendar, ShieldAlert, Camera, Globe, Github, Linkedin, Twitter, Award, Mail, Send, BookOpen, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, setDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiService } from '@/lib/api-service';
import { BlogPost, Comment } from '@/data/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';

function UserDashboardContent() {
  const { user, logout, isLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'liked' | 'comments' | 'settings' | 'challenges' | 'messages' | 'chat'>('overview');

  // Dynamic user details
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Course System states
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [courseOrders, setCourseOrders] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // User activity states
  const [likedBlogs, setLikedBlogs] = useState<BlogPost[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [userAttempts, setUserAttempts] = useState<any[]>([]);
  const [userMessages, setUserMessages] = useState<any[]>([]);

  // Chat states
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Sync tab with query param if present
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || '');
      setProfession(user.profession || '');
      setBio(user.bio || '');
      setWebsite(user.website || '');
      setGithub(user.socialLinks?.github || '');
      setLinkedin(user.socialLinks?.linkedin || '');
      setTwitter(user.socialLinks?.twitter || '');
      setAvatarPreview(user.avatar || '');

      const fetchUserActivities = async () => {
        try {
          // Fetch liked blogs
          if (user.likedBlogs && user.likedBlogs.length > 0) {
            const blogsRes = await fetch(`/api/blogs?ids=${user.likedBlogs.join(',')}`);
            const blogsData = await blogsRes.json();
            if (blogsData.success) {
              setLikedBlogs(blogsData.data.blogs);
            }
          } else {
            setLikedBlogs([]);
          }

          // Fetch comments
          const commentsRes = await fetch('/api/admin/comments');
          const commentsData = await commentsRes.json();
          if (commentsData.success) {
            setUserComments(commentsData.data);
          }

          // Fetch attempts
          const attemptsRes = await fetch('/api/challenges/my-attempts');
          const attemptsData = await attemptsRes.json();
          if (attemptsData.success) {
            setUserAttempts(attemptsData.data || []);
          }

          // Fetch user contact messages
          const msgRes = await fetch('/api/contact/my-messages');
          if (msgRes.ok) {
            const msgData = await msgRes.json();
            if (msgData.success) {
              setUserMessages(msgData.data || []);
            }
          }

          // Fetch enrolled courses
          try {
            const myCoursesRes = await fetch('/api/my-courses');
            if (myCoursesRes.ok) {
              const myCoursesData = await myCoursesRes.json();
              if (myCoursesData.success) {
                setEnrolledCourses(myCoursesData.data || []);
              }
            }
          } catch (err) {
            console.error('Failed to fetch enrolled courses:', err);
          }

          // Fetch course orders
          try {
            const myOrdersRes = await fetch('/api/course-orders/my');
            if (myOrdersRes.ok) {
              const myOrdersData = await myOrdersRes.json();
              if (myOrdersData.success) {
                setCourseOrders(myOrdersData.data || []);
              }
            }
          } catch (err) {
            console.error('Failed to fetch course orders:', err);
          }
          setCoursesLoading(false);
        } catch (error) {
          console.error('Failed to load user activity:', error);
          setCoursesLoading(false);
        }
      };

      fetchUserActivities();
    }
  }, [user]);

  // Firestore Real-Time Chat Listener
  useEffect(() => {
    if (!user || activeTab !== 'chat') return;

    const docId = user.email.toLowerCase().trim();
    const messagesRef = collection(db, 'chats', docId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        });
      });
      setChatMessages(msgs);
    }, (error) => {
      console.error("Firestore live chat listen error:", error);
    });

    // Clear unread status for user
    const conversationRef = doc(db, 'chats', docId);
    setDoc(conversationRef, { unreadByUser: false }, { merge: true }).catch(err => {
      console.error("Failed to reset user unread status:", err);
    });

    return () => unsubscribe();
  }, [user, activeTab]);

  // Auto Scroll Chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !typedMessage.trim() || isSendingMessage) return;

    const messageText = typedMessage.trim();
    setTypedMessage('');
    setIsSendingMessage(true);

    try {
      const docId = user.email.toLowerCase().trim();
      const messagesRef = collection(db, 'chats', docId, 'messages');
      await addDoc(messagesRef, {
        sender: 'user',
        text: messageText,
        createdAt: serverTimestamp(),
      });

      const conversationRef = doc(db, 'chats', docId);
      await setDoc(conversationRef, {
        userEmail: user.email.toLowerCase().trim(),
        userName: user.name,
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
        unreadByAdmin: true,
        unreadByUser: false,
      }, { merge: true });
    } catch (err: any) {
      console.error("Failed to send real-time message:", err);
      showToast('Failed to send message. Check Firebase console rules.', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Only PNG, JPG, JPEG, and WEBP formats are supported.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit.', 'error');
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      let finalAvatarUrl = avatar;

      if (avatarFile) {
        try {
          const uploadResult = await ApiService.uploadImage(avatarFile, 'avatar');
          finalAvatarUrl = uploadResult.url;
          setAvatar(finalAvatarUrl);
          setAvatarFile(null);
        } catch (uploadErr: any) {
          console.error('Avatar upload failed:', uploadErr);
          showToast(uploadErr.message || 'Image upload failed. Settings not saved.', 'error');
          setIsSaving(false);
          return;
        }
      }

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          avatar: finalAvatarUrl,
          bio,
          profession,
          website,
          socialLinks: {
            github,
            linkedin,
            twitter
          }
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser(); // Sync auth context session
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update profile settings.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="flex-grow pt-32 pb-20 flex items-center justify-center bg-brand-bg min-h-screen">
        <LoadingState message="Connecting to secure session..." />
      </div>
    );
  }

  const sidebarTabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'courses' as const, label: 'My Courses', icon: BookOpen },
    { id: 'chat' as const, label: 'Live Chat', icon: MessageSquare },
    { id: 'messages' as const, label: 'My Messages', icon: Mail },
    { id: 'liked' as const, label: 'Liked Articles', icon: Heart },
    { id: 'comments' as const, label: 'Comment History', icon: MessageSquare },
    { id: 'challenges' as const, label: 'My Challenges', icon: Award },
    { id: 'settings' as const, label: 'Account Settings', icon: Settings }
  ];

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 min-h-screen relative bg-brand-bg">
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Profile Card */}
              <Card hoverEffect={false} className="p-5 border border-brand-border-white bg-brand-card-dark/45 text-center">
                <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-brand-accent">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-none mb-1.5">{user.name}</h3>
                <p className="text-[10px] text-brand-text-muted mb-4">{user.email}</p>
                <span className="px-2.5 py-0.5 bg-brand-accent/10 border border-brand-accent/20 text-[9px] font-bold tracking-widest text-brand-accent rounded-full uppercase">
                  {user.role} Account
                </span>
                {user.role === 'admin' && (
                  <Link href="/admin" className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 py-1.5!">
                      <ShieldAlert className="w-3.5 h-3.5" /> Admin Panel
                    </Button>
                  </Link>
                )}
              </Card>

              {/* Navigation Tabs List */}
              <Card hoverEffect={false} className="p-2 border border-brand-border-white bg-brand-card-dark/20 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-none gap-1">
                {sidebarTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-accent text-white shadow-md'
                          : 'text-brand-text-muted hover:text-white hover:bg-brand-card-light'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer text-left w-full mt-auto"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Logout
                </button>
              </Card>
            </div>

            {/* Content Display Grid */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Active Header badge */}
              <div className="flex items-center justify-between border-b border-brand-border-white pb-4">
                <h1 className="text-xl font-bold text-white tracking-tight uppercase">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'courses' && 'My Courses'}
                  {activeTab === 'chat' && 'Real-Time Live Chat'}
                  {activeTab === 'messages' && 'My Messages'}
                  {activeTab === 'liked' && 'Liked Articles'}
                  {activeTab === 'comments' && 'Comments History'}
                  {activeTab === 'challenges' && 'My Challenges'}
                  {activeTab === 'settings' && 'Profile Settings'}
                </h1>
                <span className="text-[10px] text-brand-text-muted font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Session Active
                </span>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Metric widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card hoverEffect className="p-5 flex items-center gap-4 border border-brand-border-white">
                      <div className="p-3 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-xl">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-text-muted font-bold leading-none mb-1.5">LIKED ARTICLES</p>
                        <p className="text-xl font-extrabold text-white tracking-tight">
                          {coursesLoading ? (
                            <span className="inline-block w-4 h-4 bg-brand-card-dark rounded-md animate-pulse" />
                          ) : (
                            likedBlogs.length
                          )}
                        </p>
                      </div>
                    </Card>

                    <Card hoverEffect className="p-5 flex items-center gap-4 border border-brand-border-white">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-text-muted font-bold leading-none mb-1.5">POSTED COMMENTS</p>
                        <p className="text-xl font-extrabold text-white tracking-tight">
                          {coursesLoading ? (
                            <span className="inline-block w-4 h-4 bg-brand-card-dark rounded-md animate-pulse" />
                          ) : (
                            userComments.length
                          )}
                        </p>
                      </div>
                    </Card>
                  </div>

                  {/* Profile info block */}
                  <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25">
                    <h3 className="text-sm font-bold text-white mb-4 tracking-tight border-l-2 border-brand-accent pl-2.5">
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[9px] text-brand-text-muted uppercase mb-1">Full Name</p>
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-brand-text-muted uppercase mb-1">Email Address</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-brand-text-muted uppercase mb-1">User Role</p>
                        <p className="text-white font-medium capitalize">{user.role}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-brand-text-muted uppercase mb-1">Registered On</p>
                        <p className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Tab: Courses */}
              {activeTab === 'courses' && (
                <div className="space-y-8 text-left">
                  {/* Enrolled Courses Grid */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white tracking-tight border-l-2 border-brand-accent pl-2.5">
                      Enrolled Courses
                    </h3>
                    {coursesLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(n => (
                          <div key={n} className="animate-pulse bg-brand-card/30 border border-brand-border-white/5 rounded-2xl h-48" />
                        ))}
                      </div>
                    ) : enrolledCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {enrolledCourses.map((ec) => (
                          <Card hoverEffect key={ec.id} className="p-4 border border-brand-border-white flex flex-col justify-between h-full bg-brand-card">
                            <div className="flex gap-4">
                              <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-brand-border-white bg-brand-card-dark">
                                <img src={ec.thumbnailUrl || '/course-placeholder.jpg'} alt={ec.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-white truncate leading-snug">{ec.title}</h4>
                                <p className="text-[9px] text-brand-text-muted mt-1 uppercase font-bold tracking-wider">{ec.paymentStatus} • {ec.accessStatus}</p>
                                <div className="mt-3 flex items-center gap-2">
                                  <div className="flex-1 bg-brand-card-dark h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-brand-accent h-full rounded-full" style={{ width: `${ec.progressPercentage}%` }} />
                                  </div>
                                  <span className="text-[9px] font-bold text-white">{ec.progressPercentage}%</span>
                                </div>
                              </div>
                            </div>

                            {ec.accessStatus === 'pending' ? (
                              <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[9px] text-center font-medium">
                                Your payment is under review. Course access will unlock after approval.
                              </div>
                            ) : ec.accessStatus === 'revoked' ? (
                              <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[9px] text-center font-medium">
                                Access revoked. Please contact support.
                              </div>
                            ) : (
                              <div className="mt-4 flex justify-end">
                                <Link href={`/learn/${ec.slug}`}>
                                  <Button variant="primary" size="sm" className="py-1 px-4 text-[10px]">
                                    Continue Learning
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <EmptyState title="No Courses Enrolled" message="You have not enrolled in any courses yet." />
                    )}
                  </div>

                  {/* Orders Logs */}
                  <div className="space-y-4 pt-6 border-t border-brand-border-white/10">
                    <h3 className="text-sm font-bold text-white tracking-tight border-l-2 border-brand-accent pl-2.5">
                      Course Purchase History
                    </h3>
                    {courseOrders.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                        <table className="w-full text-left border-collapse text-[11px]">
                           <thead>
                             <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                               <th className="p-3">Order Number</th>
                               <th className="p-3">Course</th>
                               <th className="p-3">Amount</th>
                               <th className="p-3">Method</th>
                               <th className="p-3">Status</th>
                               <th className="p-3">Date</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                             {courseOrders.map((o) => (
                               <tr key={o.id} className="hover:bg-brand-card-light/45 transition-colors">
                                 <td className="p-3 font-semibold text-white">{o.orderNumber}</td>
                                 <td className="p-3 text-white">{o.courseTitle}</td>
                                 <td className="p-3">৳{o.amount}</td>
                                 <td className="p-3 uppercase">{o.paymentMethod}</td>
                                 <td className="p-3">
                                   <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                     o.orderStatus === 'approved' ? 'bg-green-500/10 text-green-400' :
                                     o.orderStatus === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'
                                   }`}>
                                     {o.orderStatus}
                                   </span>
                                 </td>
                                 <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                                </tr>
                             ))}
                           </tbody>
                         </table>
                      </div>
                    ) : (
                      <EmptyState title="No Purchase History" message="No course purchase transactions found." />
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Liked Blogs */}
              {activeTab === 'liked' && (
                <div>
                  {coursesLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="animate-pulse bg-brand-card/30 border border-brand-border-white/5 rounded-2xl h-36" />
                      ))}
                    </div>
                  ) : likedBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {likedBlogs.map((blog) => (
                        <Card hoverEffect key={blog.id} className="p-4 border border-brand-border-white flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-brand-accent uppercase tracking-wider">{blog.category}</span>
                            <h4 className="text-sm font-bold text-white mt-1 mb-2 line-clamp-1 hover:text-brand-accent transition-colors">
                              <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
                            </h4>
                            <p className="text-xs text-brand-text-muted leading-relaxed line-clamp-2 mb-4">{blog.excerpt}</p>
                          </div>
                          <Link href={`/blog/${blog.id}`} className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1">
                            Read Article
                          </Link>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No Liked Articles"
                      message="You haven't liked any technical articles yet. Explore the blog section and show your appreciation!"
                      actionText="Browse Blogs"
                      onAction={() => router.push('/blog')}
                    />
                  )}
                </div>
              )}

              {/* Tab 3: Comments */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {coursesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="animate-pulse bg-brand-card/30 border border-brand-border-white/5 rounded-2xl h-24" />
                      ))}
                    </div>
                  ) : userComments.length > 0 ? (
                    userComments.map((comment) => (
                      <Card hoverEffect={false} key={comment.id} className="p-4 border border-brand-border-white">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <span className="text-[9px] font-bold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded">
                            Article: {comment.blogTitle || comment.blogId}
                          </span>
                          <span className="text-[9px] text-brand-text-muted font-medium">
                            Posted: {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-white/95 leading-relaxed italic mb-3">"{comment.content}"</p>
                        <Link href={`/blog/${comment.blogId}`} className="text-[10px] text-brand-text-muted hover:text-brand-accent hover:underline font-semibold block w-fit">
                          View article comments thread
                        </Link>
                      </Card>
                    ))
                  ) : (
                    <EmptyState
                      title="No Comments History"
                      message="You haven't posted any comments yet. Share your feedback or ask questions on our technical blogs!"
                      actionText="Browse Blogs"
                      onAction={() => router.push('/blog')}
                    />
                  )}
                </div>
              )}

              {/* Tab: Chat */}
              {activeTab === 'chat' && (
                <Card hoverEffect={false} className="p-4 md:p-6 border border-brand-border-white bg-brand-card-dark/25 flex flex-col h-[550px] relative overflow-hidden">
                  {/* Messages Area */}
                  <div className="flex-grow overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-brand-accent/20 scrollbar-track-transparent">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-3 animate-pulse">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">Start a Conversation</h4>
                        <p className="text-xs text-brand-text-muted max-w-sm">
                          Send a message to Tarikur. He will receive it in his admin panel and can reply to you in real-time.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isMe = msg.sender === 'user';
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                          >
                            {!isMe && (
                              <div className="w-6 h-6 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-brand-accent">
                                N
                              </div>
                            )}
                            <div className="max-w-[75%] sm:max-w-[60%] flex flex-col gap-1">
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                                  isMe
                                    ? 'bg-brand-accent text-white rounded-br-none'
                                    : 'bg-brand-card-light text-white border border-brand-border-white/5 rounded-bl-none'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span
                                className={`text-[9px] text-brand-text-muted block px-1 ${
                                  isMe ? 'text-right' : 'text-left'
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-brand-border-white/5 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message to Tarikur..."
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      className="flex-grow px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all placeholder:text-brand-text-muted"
                      disabled={isSendingMessage}
                      required
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      className="px-4 py-2.5 text-xs font-bold"
                      isLoading={isSendingMessage}
                      disabled={!typedMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </Card>
              )}

              {/* Tab: Challenges */}
              {activeTab === 'challenges' && (
                <div className="space-y-4 text-left">
                  {coursesLoading ? (
                    <div className="space-y-4 text-left">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="animate-pulse bg-brand-card/30 border border-brand-border-white/5 rounded-2xl h-36" />
                      ))}
                    </div>
                  ) : userAttempts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {userAttempts.map((att) => (
                        <Card hoverEffect={false} key={att.id} className="p-5 border border-brand-border bg-brand-card-dark">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-brand-border-white/5 mb-3">
                            <div>
                              <span className="text-[9px] font-bold text-brand-accent uppercase tracking-wider block mb-1">
                                {att.blogTitle}
                              </span>
                              <h4 className="text-sm font-bold text-white leading-none">
                                {att.challengeTitle}
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {att.resultPublished ? (
                                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold uppercase rounded">
                                  Result Published
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase rounded">
                                  Waiting for final result
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-[9px] text-brand-text-muted uppercase mb-0.5">Score</p>
                              <p className="text-white font-extrabold">{att.score} Pts</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-brand-text-muted uppercase mb-0.5">Percentage</p>
                              <p className="text-white font-extrabold">{Math.round(att.percentage)}%</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-brand-text-muted uppercase mb-0.5">Time Taken</p>
                              <p className="text-white font-medium">
                                {Math.floor(att.timeTakenSeconds / 60)}m {att.timeTakenSeconds % 60}s
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] text-brand-text-muted uppercase mb-0.5">Attempt Date</p>
                              <p className="text-white font-medium">
                                {new Date(att.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {att.resultPublished && (
                            <Link href={`/read-rank-challenge/${att.challengeId}`} className="block mt-4 w-fit">
                              <Button variant="outline" size="sm">
                                Review Question Answers
                              </Button>
                            </Link>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No Challenges Completed"
                      message="You haven't participated in any timed MCQ challenges yet. Check out the challenge board!"
                      actionText="Browse Challenges"
                      onAction={() => router.push('/read-rank-challenge')}
                    />
                  )}
                </div>
              )}

              {/* Tab 5: Messages */}
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  {coursesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="animate-pulse bg-brand-card/30 border border-brand-border-white/5 rounded-2xl h-36" />
                      ))}
                    </div>
                  ) : userMessages.length > 0 ? (
                    userMessages.map((msg) => (
                      <Card hoverEffect={false} key={msg.id} className="p-5 border border-brand-border bg-brand-card-dark/30">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-brand-border-white/5 mb-3">
                          <div>
                            <span className="text-[9px] font-bold text-brand-accent uppercase tracking-wider block mb-1">
                              Subject: {msg.subject}
                            </span>
                            <h4 className="text-sm font-bold text-white leading-none">
                              {msg.name} ({msg.email})
                            </h4>
                          </div>
                          <div>
                            {msg.status === 'replied' ? (
                              <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold uppercase rounded">
                                Replied
                              </span>
                            ) : msg.status === 'read' ? (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase rounded">
                                Read
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase rounded">
                                New
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-white leading-relaxed p-3.5 bg-brand-card-dark rounded-xl border border-brand-border-white/5 mb-4 animate-none">
                          <p className="text-[9px] uppercase font-bold text-brand-text-muted mb-1">Your Message:</p>
                          {msg.message}
                        </div>

                        {msg.replyMessage && (
                          <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl leading-relaxed text-xs text-brand-text-muted mt-2 relative overflow-hidden animate-none">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl pointer-events-none" />
                            <p className="text-[9px] uppercase font-bold text-green-400 mb-1">Response from Tarikur:</p>
                            <p className="text-white">{msg.replyMessage}</p>
                            {msg.repliedAt && (
                              <p className="text-[8px] text-brand-text-muted mt-2">Replied on: {new Date(msg.repliedAt).toLocaleString()}</p>
                            )}
                          </div>
                        )}
                      </Card>
                    ))
                  ) : (
                    <EmptyState
                      title="No Messages"
                      message="You haven't sent any contact messages yet. If you have any inquiries, drop a message on our contact page!"
                      actionText="Send Message"
                      onAction={() => router.push('/contact')}
                    />
                  )}
                </div>
              )}

              {/* Tab 4: Settings */}
              {activeTab === 'settings' && (
                <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: Avatar & Core Profile Info */}
                      <div className="space-y-4">
                        {/* Avatar Image Selection with Preview */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-card-dark/40 border border-brand-border-white/5">
                          <div className="relative group w-16 h-16 rounded-full overflow-hidden border border-brand-accent bg-brand-card">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="Avatar Preview"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-brand-text-muted">
                                <UserIcon className="w-6 h-6" />
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-semibold text-white cursor-pointer transition-opacity">
                              <Camera className="w-4 h-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">Profile Photo</p>
                            <p className="text-[9px] text-brand-text-muted mt-0.5">Click photo to upload new image (PNG, JPG, WebP, max 5MB)</p>
                          </div>
                        </div>

                        {/* Name input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90">Full Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                            required
                          />
                        </div>

                        {/* Profession input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90">Profession / Title</label>
                          <input
                            type="text"
                            placeholder="Frontend Developer"
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* Bio input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90">Bio / About Me</label>
                          <textarea
                            placeholder="Write a brief introduction about yourself..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all resize-none animate-none"
                          />
                        </div>
                      </div>

                      {/* Right Column: Web & Social Links */}
                      <div className="space-y-4">
                        {/* Direct URL option for Avatar */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90">Avatar Image URL (Alternative)</label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={avatar}
                            onChange={(e) => {
                              setAvatar(e.target.value);
                              setAvatarPreview(e.target.value);
                            }}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* Website input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-brand-text-muted" /> Website URL</label>
                          <input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* GitHub URL input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5"><Github className="w-3.5 h-3.5 text-brand-text-muted" /> GitHub Profile</label>
                          <input
                            type="url"
                            placeholder="https://github.com/username"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* LinkedIn URL input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-brand-text-muted" /> LinkedIn Profile</label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* Twitter/X URL input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5 text-brand-text-muted" /> Twitter/X Profile</label>
                          <input
                            type="url"
                            placeholder="https://twitter.com/username"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-brand-border-white/5 flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        className="font-bold py-2.5 text-xs px-6"
                        isLoading={isSaving}
                        leftIcon={<Save className="w-4 h-4" />}
                      >
                        Save Settings
                      </Button>
                    </div>

                  </form>
                </Card>
              )}

            </div>

          </div>
          
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={
      <div className="flex-grow pt-32 pb-20 flex items-center justify-center bg-brand-bg min-h-screen">
        <LoadingState message="Loading dashboard..." />
      </div>
    }>
      <UserDashboardContent />
    </Suspense>
  );
}
