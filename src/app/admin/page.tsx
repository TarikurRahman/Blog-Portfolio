'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, doc, query, orderBy, onSnapshot, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  MessageSquare,
  Users,
  Mail,
  Settings,
  User as UserIcon,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Save,
  LogOut,
  ChevronDown,
  Camera,
  Github,
  Linkedin,
  Twitter,
  Search,
  ThumbsUp,
  RefreshCw,
  Activity,
  TrendingUp,
  UserCheck,
  FileText,
  Image as ImageIcon,
  Tv,
  Award,
  Cpu
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiService } from '@/lib/api-service';
import { Project, BlogPost, Comment, User, ContactMessage, SiteSettings } from '@/data/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import LoadingState from '@/components/LoadingState';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

// Sub-tabs imports
import ProjectBriefsTab from '@/components/admin/ProjectBriefsTab';
import ReadRankTab from '@/components/admin/ReadRankTab';
import AskTarikurTab from '@/components/admin/AskNafijTab';
import SiteReviewsTab from '@/components/admin/SiteReviewsTab';
import PageMediaTab from '@/components/admin/PageMediaTab';
import ServicesTab from '@/components/admin/ServicesTab';
import SkillsTab from '@/components/admin/SkillsTab';
import ExperiencesTab from '@/components/admin/ExperiencesTab';
import EducationTab from '@/components/admin/EducationTab';
import CoursesTab from '@/components/admin/CoursesTab';

type AdminTab =
  | 'overview'
  | 'courses'
  | 'projects'
  | 'blogs'
  | 'comments'
  | 'users'
  | 'contacts'
  | 'chats'
  | 'settings'
  | 'contactSettings'
  | 'profile'
  | 'project-briefs'
  | 'read-rank'
  | 'ask-tarikur'
  | 'site-reviews'
  | 'page-media'
  | 'services'
  | 'skills'
  | 'experiences'
  | 'education';

function AdminDashboardContent() {
  const { user, logout, isLoading, refreshUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Sync tab with query param if present
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // DB States
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // Loading indicator for actions
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Live chats states
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [currentChatMessages, setCurrentChatMessages] = useState<any[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to all conversations in real-time
  useEffect(() => {
    if (!user || user.role !== 'admin' || activeTab !== 'chats') return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('lastMessageAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        convs.push({
          id: doc.id,
          ...data,
          lastMessageAt: data.lastMessageAt?.toDate() ? data.lastMessageAt.toDate().toISOString() : new Date().toISOString()
        });
      });
      setConversations(convs);
    }, (error) => {
      console.error("Firestore conversations listen error:", error);
    });

    return () => unsubscribe();
  }, [user, activeTab]);

  // Listen to selected conversation's messages
  useEffect(() => {
    if (!user || user.role !== 'admin' || activeTab !== 'chats' || !selectedUserEmail) {
      setCurrentChatMessages([]);
      return;
    }

    const messagesRef = collection(db, 'chats', selectedUserEmail, 'messages');
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
      setCurrentChatMessages(msgs);
    }, (error) => {
      console.error("Firestore selected chat listen error:", error);
    });

    // Mark conversation as read by admin when selected
    const conversationRef = doc(db, 'chats', selectedUserEmail);
    setDoc(conversationRef, { unreadByAdmin: false }, { merge: true }).catch(err => {
      console.error("Failed to mark conversation read by admin:", err);
    });

    return () => unsubscribe();
  }, [user, activeTab, selectedUserEmail]);

  const scrollToAdminChatBottom = () => {
    adminMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chats' && selectedUserEmail) {
      scrollToAdminChatBottom();
    }
  }, [currentChatMessages, activeTab, selectedUserEmail]);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEmail || !adminReplyText.trim() || isSendingReply) return;

    const messageText = adminReplyText.trim();
    setAdminReplyText('');
    setIsSendingReply(true);

    try {
      const messagesRef = collection(db, 'chats', selectedUserEmail, 'messages');
      await addDoc(messagesRef, {
        sender: 'admin',
        text: messageText,
        createdAt: serverTimestamp(),
      });

      const conversationRef = doc(db, 'chats', selectedUserEmail);
      await setDoc(conversationRef, {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
        unreadByUser: true,
        unreadByAdmin: false,
      }, { merge: true });
    } catch (err: any) {
      console.error("Failed to send admin reply:", err);
      showToast('Failed to send reply. Check Firestore Rules.', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  // Admin search and pagination states
  const [adminSearchInput, setAdminSearchInput] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAdminSearchQuery(adminSearchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [adminSearchInput]);

  useEffect(() => {
    setAdminSearchInput('');
    setAdminSearchQuery('');
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [adminSearchQuery]);

  const renderSearchBar = (placeholder: string) => (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-text-muted" />
      <input
        type="text"
        placeholder={placeholder}
        value={adminSearchInput}
        onChange={(e) => setAdminSearchInput(e.target.value)}
        className="w-full pl-9 pr-4 py-2 text-[11px] bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
      />
    </div>
  );

  const renderPagination = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
      <div className="flex items-center justify-between pt-4 border-t border-brand-border-white/5 mt-4">
        <span className="text-[10px] text-brand-text-muted">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} items
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="py-1! px-2.5!"
          >
            Previous
          </Button>
          <span className="text-[10px] text-white font-bold">{currentPage} / {totalPages}</span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="py-1! px-2.5!"
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  // Modals States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null); // null means adding new

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null); // null means adding new

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  // Confirm dialogue
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  // Project Form States
  const [pTitle, setPTitle] = useState('');
  const [pCategory, setPCategory] = useState<'Frontend' | 'Shopify' | 'Bubble.io' | 'UI/UX'>('Frontend');
  const [pDesc, setPDesc] = useState('');
  const [pLongDesc, setPLongDesc] = useState('');
  const [pTags, setPTags] = useState('');
  const [pImage, setPImage] = useState('');
  const [pStatus, setPStatus] = useState<'Completed' | 'In Progress'>('Completed');
  const [pLiveUrl, setPLiveUrl] = useState('');
  const [pGitUrl, setPGitUrl] = useState('');
  const [pFeatures, setPFeatures] = useState('');
  const [pChallenge, setPChallenge] = useState('');
  const [pSolution, setPSolution] = useState('');

  // Blog Form States
  const [bTitle, setBTitle] = useState('');
  const [bSlug, setBSlug] = useState('');
  const [bExcerpt, setBExcerpt] = useState('');
  const [bContent, setBContent] = useState('');
  const [bCategory, setBCategory] = useState<'Frontend' | 'Shopify' | 'Bubble.io' | 'SEO' | 'UI/UX'>('Frontend');
  const [bReadTime, setBReadTime] = useState('5 min read');
  const [bImage, setBImage] = useState('');
  const [bStatus, setBStatus] = useState<'Draft' | 'Published'>('Published');
  const [bEditorTab, setBEditorTab] = useState<'write' | 'preview'>('write');
  const [bSeoTitle, setBSeoTitle] = useState('');
  const [bSeoDesc, setBSeoDesc] = useState('');
  const [bSeoKeywords, setBSeoKeywords] = useState('');
  const [bSeoOgImage, setBSeoOgImage] = useState('');

  // Import Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [parsedImportBlogs, setParsedImportBlogs] = useState<any[]>([]);

  // Real-time Slug Generator Hook
  useEffect(() => {
    if (!activeBlog && bTitle) {
      const slug = bTitle.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setBSlug(slug);
    }
  }, [bTitle, activeBlog]);

  // Site Settings Form States
  const [sWebTitle, setSWebTitle] = useState('');
  const [sLogoText, setSLogoText] = useState('');
  const [sHeroTitle, setSHeroTitle] = useState('');
  const [sHeroSubtitle, setSHeroSubtitle] = useState('');
  const [sHeroIntro, setSHeroIntro] = useState('');
  const [sAboutBadge, setSAboutBadge] = useState('');
  const [sAboutTitle, setSAboutTitle] = useState('');
  const [sAboutBio, setSAboutBio] = useState('');
  const [sAboutDesc, setSAboutDesc] = useState('');
  const [sCvUrl, setSCvUrl] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sLocation, setSLocation] = useState('');
  const [sAvailability, setSAvailability] = useState('');
  const [sGitUrl, setSGitUrl] = useState('');
  const [sLinkUrl, setSLinkUrl] = useState('');
  const [sTwitterUrl, setSTwitterUrl] = useState('');
  const [sSeoMetaTitle, setSSeoMetaTitle] = useState('');
  const [sSeoMetaDesc, setSSeoMetaDesc] = useState('');
  const [sSeoKeywords, setSSeoKeywords] = useState('');

  // Contact Settings Form States
  const [cTitle, setCTitle] = useState('');
  const [cSubtitle, setCSubtitle] = useState('');
  const [cIntroText, setCIntroText] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cLocation, setCLocation] = useState('');
  const [cAvailabilityText, setCAvailabilityText] = useState('');
  const [cGithubUrl, setCGithubUrl] = useState('');
  const [cLinkedinUrl, setCLinkedinUrl] = useState('');
  const [cTwitterUrl, setCTwitterUrl] = useState('');
  const [cFormNameLabel, setCFormNameLabel] = useState('');
  const [cFormNamePlaceholder, setCFormNamePlaceholder] = useState('');
  const [cFormEmailLabel, setCFormEmailLabel] = useState('');
  const [cFormEmailPlaceholder, setCFormEmailPlaceholder] = useState('');
  const [cFormSubjectLabel, setCFormSubjectLabel] = useState('');
  const [cFormSubjectPlaceholder, setCFormSubjectPlaceholder] = useState('');
  const [cFormMessageLabel, setCFormMessageLabel] = useState('');
  const [cFormMessagePlaceholder, setCFormMessagePlaceholder] = useState('');
  const [cSuccessMessage, setCSuccessMessage] = useState('');

  // Admin Profile Edit States
  const [aName, setAName] = useState('');
  const [aAvatar, setAAvatar] = useState('');
  const [aProfession, setAProfession] = useState('');
  const [aBio, setABio] = useState('');
  const [aWebsite, setAWebsite] = useState('');
  const [aGithub, setAGithub] = useState('');
  const [aLinkedin, setALinkedin] = useState('');
  const [aTwitter, setATwitter] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Session protect check
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        showToast('Restricted area. Admins only.', 'error');
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  // Helper to upload a file to Cloud storage via ImgBB helper endpoint
  const uploadImageFile = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Upload failed');
    }
    return data.data.fileUrl;
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('Uploading cover image...', 'info');
      try {
        const url = await uploadImageFile(file, 'project');
        setPImage(url);
        showToast('Project cover image uploaded!', 'success');
      } catch (err: any) {
        console.error(err);
        showToast(err.message || 'Failed to upload image.', 'error');
      }
    }
  };

  // Load all DB elements on mount / refresh
  const loadData = async () => {
    setIsOverviewLoading(true);
    setOverviewError(null);
    try {
      // Fetch dynamic analytics & overview stats
      const [overviewRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/analytics')
      ]);

      const overviewData = await overviewRes.json();
      if (overviewData.success) {
        setOverviewStats(overviewData.data);
      } else {
        setOverviewError(overviewData.message || 'Failed to fetch overview statistics.');
      }

      const analyticsDataJson = await analyticsRes.json();
      if (analyticsDataJson.success) {
        setAnalyticsData(analyticsDataJson.data);
      }

      // 1. Projects
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      if (projectsData.success) {
        setProjects(projectsData.data);
      }

      // 2. Blogs
      const blogsRes = await fetch('/api/blogs?status=all');
      const blogsData = await blogsRes.json();
      if (blogsData.success) {
        setBlogs(blogsData.data.blogs);
      }

      // 3. Comments
      const commentsRes = await fetch('/api/admin/comments');
      const commentsData = await commentsRes.json();
      if (commentsData.success) {
        setComments(commentsData.data);
      }

      // 4. Users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.data);
      }

      // 5. Messages
      const messagesRes = await fetch('/api/contact');
      const messagesData = await messagesRes.json();
      if (messagesData.success) {
        setMessages(messagesData.data);
      }

      // 6. Settings
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.data) {
        const dbSettings = settingsData.data;
        setSettings(dbSettings);
        
        // Seed Settings fields
        setSWebTitle(dbSettings.websiteTitle || '');
        setSLogoText(dbSettings.logoText || '');
        setSHeroTitle(dbSettings.heroTitle || '');
        setSHeroSubtitle(dbSettings.heroSubtitle || '');
        setSHeroIntro(dbSettings.heroIntro || '');
        setSAboutBadge(dbSettings.aboutBadge || '');
        setSAboutTitle(dbSettings.aboutTitle || '');
        setSAboutBio(dbSettings.aboutBio || '');
        setSAboutDesc(dbSettings.aboutDescription || '');
        setSCvUrl(dbSettings.cvUrl || '');
        setSEmail(dbSettings.email || '');
        setSPhone(dbSettings.phone || '');
        setSLocation(dbSettings.location || '');
        setSAvailability(dbSettings.availability || '');
        setSGitUrl(dbSettings.githubUrl || '');
        setSLinkUrl(dbSettings.linkedinUrl || '');
        setSTwitterUrl(dbSettings.twitterUrl || '');
        setSSeoMetaTitle(dbSettings.seoMetaTitle || '');
        setSSeoMetaDesc(dbSettings.seoMetaDescription || '');
        setSSeoKeywords(dbSettings.seoKeywords || '');
      }

      // 7. Contact Settings
      const contactSettingsRes = await fetch('/api/contact/settings');
      const contactSettingsData = await contactSettingsRes.json();
      if (contactSettingsData.success && contactSettingsData.data) {
        const dbContactSettings = contactSettingsData.data;
        setCTitle(dbContactSettings.title || '');
        setCSubtitle(dbContactSettings.subtitle || '');
        setCIntroText(dbContactSettings.introText || '');
        setCEmail(dbContactSettings.email || '');
        setCPhone(dbContactSettings.phone || '');
        setCLocation(dbContactSettings.location || '');
        setCAvailabilityText(dbContactSettings.availabilityText || '');
        setCGithubUrl(dbContactSettings.githubUrl || '');
        setCLinkedinUrl(dbContactSettings.linkedinUrl || '');
        setCTwitterUrl(dbContactSettings.twitterUrl || '');
        setCFormNameLabel(dbContactSettings.formNameLabel || '');
        setCFormNamePlaceholder(dbContactSettings.formNamePlaceholder || '');
        setCFormEmailLabel(dbContactSettings.formEmailLabel || '');
        setCFormEmailPlaceholder(dbContactSettings.formEmailPlaceholder || '');
        setCFormSubjectLabel(dbContactSettings.formSubjectLabel || '');
        setCFormSubjectPlaceholder(dbContactSettings.formSubjectPlaceholder || '');
        setCFormMessageLabel(dbContactSettings.formMessageLabel || '');
        setCFormMessagePlaceholder(dbContactSettings.formMessagePlaceholder || '');
        setCSuccessMessage(dbContactSettings.successMessage || '');
      }

      if (user) {
        setAName(user.name);
        setAAvatar(user.avatar || '');
        setAProfession(user.profession || '');
        setABio(user.bio || '');
        setAWebsite(user.website || '');
        setAGithub(user.socialLinks?.github || '');
        setALinkedin(user.socialLinks?.linkedin || '');
        setATwitter(user.socialLinks?.twitter || '');
        setAvatarPreview(user.avatar || '');
      }
    } catch (error: any) {
      console.error('Failed to load admin gateway data:', error);
      setOverviewError(error.message || 'Failed to load gateway database data.');
      showToast('Error loading gateway database data.', 'error');
    } finally {
      setIsOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.role]);

  // Projects Modals Helpers
  const openProjectModal = (proj: Project | null) => {
    setActiveProject(proj);
    if (proj) {
      setPTitle(proj.title);
      setPCategory(proj.category);
      setPDesc(proj.description);
      setPLongDesc(proj.longDescription);
      setPTags(proj.tags.join(', '));
      setPImage(proj.image);
      setPStatus(proj.status);
      setPLiveUrl(proj.liveUrl);
      setPGitUrl(proj.githubUrl);
      setPFeatures(proj.features.join('\n'));
      setPChallenge(proj.challenge);
      setPSolution(proj.solution);
    } else {
      setPTitle('');
      setPCategory('Frontend');
      setPDesc('');
      setPLongDesc('');
      setPTags('React, Next.js, TypeScript');
      setPImage('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80');
      setPStatus('Completed');
      setPLiveUrl('https://example.com');
      setPGitUrl('https://github.com');
      setPFeatures('Responsive design\nCustom widgets\nFast compilation');
      setPChallenge('Initial layout rendering delays.');
      setPSolution('Implemented local state optimizations.');
    }
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle || !pDesc || !pLongDesc) {
      showToast('Please fill in required fields.', 'error');
      return;
    }

    const tagsArr = pTags.split(',').map(t => t.trim()).filter(Boolean);
    const featsArr = pFeatures.split('\n').map(f => f.trim()).filter(Boolean);

    const projectData = {
      title: pTitle,
      category: pCategory,
      description: pDesc,
      longDescription: pLongDesc,
      tags: tagsArr,
      image: pImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      status: pStatus,
      liveUrl: pLiveUrl,
      githubUrl: pGitUrl,
      features: featsArr,
      challenge: pChallenge,
      solution: pSolution
    };

    setIsActionLoading(true);
    try {
      let res;
      if (activeProject) {
        // Edit
        res = await fetch(`/api/projects/${activeProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
      } else {
        // Add
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData),
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(activeProject ? 'Project updated successfully!' : 'Project created successfully!', 'success');
        setIsProjectModalOpen(false);
        loadData();
      } else {
        showToast(data.message || 'Failed to save project.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save project.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const triggerProjectDelete = (id: string, name: string) => {
    setConfirmTitle('Delete Project');
    setConfirmMsg(`Are you absolutely sure you want to delete project "${name}"? This action cannot be undone.`);
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          showToast('Project deleted', 'info');
          loadData();
        } else {
          showToast(data.message || 'Failed to delete project.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to delete project.', 'error');
      }
    });
    setConfirmOpen(true);
  };

  // Blogs Modals Helpers
  const openBlogModal = (b: BlogPost | null) => {
    setActiveBlog(b);
    setBEditorTab('write');
    if (b) {
      setBTitle(b.title);
      setBSlug(b.slug);
      setBExcerpt(b.excerpt);
      setBContent(b.content);
      setBCategory(b.category);
      setBReadTime(b.readTime);
      setBImage(b.image || '');
      setBStatus(b.status || 'Published');
      setBSeoTitle(b.seoTitle || '');
      setBSeoDesc(b.seoDescription || '');
      setBSeoKeywords(b.seoKeywords || '');
      setBSeoOgImage(b.seoOgImage || '');
    } else {
      setBTitle('');
      setBSlug('');
      setBExcerpt('');
      setBContent('');
      setBCategory('Frontend');
      setBReadTime('5 min read');
      setBImage('');
      setBStatus('Published');
      setBSeoTitle('');
      setBSeoDesc('');
      setBSeoKeywords('');
      setBSeoOgImage('');
    }
    setIsBlogModalOpen(true);
  };

  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('Uploading cover image to server...', 'info');
      try {
        const url = await uploadImageFile(file, 'blog');
        setBImage(url);
        showToast('Image uploaded successfully to cloud storage!', 'success');
      } catch (err: any) {
        console.error(err);
        showToast(err.message || 'Failed to upload image.', 'error');
      }
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setImportStatus(`Selected file: ${file.name}`);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const posts = Array.isArray(parsed) ? parsed : [parsed];
          const validPosts = posts.filter(p => p.title && p.content && p.excerpt);
          if (validPosts.length === 0) {
            setImportStatus('Error: No valid blog posts found in JSON.');
            setParsedImportBlogs([]);
          } else {
            setImportStatus(`Successfully parsed ${validPosts.length} posts from JSON.`);
            setParsedImportBlogs(validPosts);
          }
        } else if (file.name.endsWith('.md')) {
          let title = file.name.replace('.md', '').replace(/[-_]/g, ' ');
          title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          
          let excerpt = 'An article imported from markdown file.';
          let content = text;
          
          if (text.startsWith('---')) {
            const parts = text.split('---');
            if (parts.length >= 3) {
              const fm = parts[1];
              content = parts.slice(2).join('---').trim();
              
              const lines = fm.split('\n');
              lines.forEach(l => {
                const [key, ...valParts] = l.split(':');
                if (key && valParts.length > 0) {
                  const val = valParts.join(':').trim().replace(/(^"|"$|^'|'$)/g, '');
                  if (key.trim() === 'title') title = val;
                  if (key.trim() === 'excerpt') excerpt = val;
                }
              });
            }
          }
          
          const singlePost = {
            title,
            slug: file.name.replace('.md', '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            excerpt,
            content,
            category: 'Frontend' as const,
            readTime: `${Math.max(1, Math.ceil(content.split(' ').length / 200))} min read`,
            status: 'Published' as const,
            image: ''
          };
          
          setImportStatus(`Successfully parsed markdown file: "${title}".`);
          setParsedImportBlogs([singlePost]);
        } else {
          setImportStatus('Error: Unsupported file format. Only .json or .md allowed.');
          setParsedImportBlogs([]);
        }
      } catch (err) {
        console.error(err);
        setImportStatus('Error: Failed to parse file content.');
        setParsedImportBlogs([]);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (parsedImportBlogs.length === 0) return;
    showToast(`Importing ${parsedImportBlogs.length} articles, please wait...`, 'info');
    setIsActionLoading(true);

    try {
      let successCount = 0;
      for (const blog of parsedImportBlogs) {
        const blogData = {
          title: blog.title,
          slug: blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          excerpt: blog.excerpt,
          content: blog.content,
          category: blog.category,
          readTime: blog.readTime || '5 min read',
          featuredImage: blog.image || '',
          status: blog.status || 'Published',
        };

        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogData),
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        }
      }

      showToast(`Imported ${successCount} out of ${parsedImportBlogs.length} articles!`, 'success');
      setIsImportModalOpen(false);
      setImportStatus('');
      setParsedImportBlogs([]);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to import articles.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bExcerpt || !bContent) {
      showToast('Please fill in required fields.', 'error');
      return;
    }

    const calculatedSlug = bSlug || bTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const blogData = {
      title: bTitle,
      slug: calculatedSlug,
      excerpt: bExcerpt,
      content: bContent,
      category: bCategory,
      readTime: bReadTime,
      featuredImage: bImage,
      status: bStatus,
      seoTitle: bSeoTitle || bTitle,
      seoDescription: bSeoDesc || bExcerpt,
      seoKeywords: bSeoKeywords,
      ogImage: bSeoOgImage
    };

    setIsActionLoading(true);
    try {
      let res;
      if (activeBlog) {
        res = await fetch(`/api/blogs/${activeBlog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogData),
        });
      } else {
        res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogData),
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(activeBlog ? 'Article updated successfully!' : 'Article created successfully!', 'success');
        setIsBlogModalOpen(false);
        loadData();
      } else {
        showToast(data.message || 'Failed to save article.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save article.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const triggerBlogDelete = (id: string, name: string) => {
    setConfirmTitle('Delete Blog Article');
    setConfirmMsg(`Are you absolutely sure you want to delete blog article "${name}"?`);
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`/api/blogs/${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          showToast('Article deleted', 'info');
          loadData();
        } else {
          showToast(data.message || 'Failed to delete article.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to delete article.', 'error');
      }
    });
    setConfirmOpen(true);
  };

  // Comments Controls
  const toggleCommentApproval = async (id: string) => {
    const target = comments.find(c => c.id === id);
    if (!target) return;

    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: !target.approved }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Comment moderation updated.', 'success');
        loadData();
      } else {
        showToast(data.message || 'Failed to update comment.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update comment.', 'error');
    }
  };

  const triggerCommentDelete = (id: string) => {
    setConfirmTitle('Delete Comment');
    setConfirmMsg('Delete this comment permanently?');
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`/api/admin/comments?id=${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          showToast('Comment deleted', 'info');
          loadData();
        } else {
          showToast(data.message || 'Failed to delete comment.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to delete comment.', 'error');
      }
    });
    setConfirmOpen(true);
  };

  // Users Controls
  const toggleUserRole = async (id: string, currentRole: 'admin' | 'user') => {
    const target = users.find(u => u.id === id);
    if (!target) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: currentRole === 'admin' ? 'user' : 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('User role updated.', 'success');
        loadData();
      } else {
        showToast(data.message || 'Failed to update user role.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update user role.', 'error');
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: 'active' | 'suspended') => {
    if (id === user?.id) {
      showToast('You cannot suspend your own session!', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: currentStatus === 'active' ? 'suspended' : 'active' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('User status modified.', 'success');
        loadData();
      } else {
        showToast(data.message || 'Failed to modify user status.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to modify user status.', 'error');
    }
  };

  const triggerUserDelete = (id: string, name: string) => {
    if (id === user?.id) {
      showToast('You cannot delete your own session!', 'error');
      return;
    }
    setConfirmTitle('Delete User Account');
    setConfirmMsg(`Delete user account "${name}" permanently?`);
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`/api/admin/users?id=${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          showToast('User deleted', 'info');
          loadData();
        } else {
          showToast(data.message || 'Failed to delete user.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to delete user.', 'error');
      }
    });
    setConfirmOpen(true);
  };

  // Messages Controls
  const openMessageModal = async (msg: ContactMessage) => {
    setActiveMessage(msg);
    setReplyText(msg.replyMessage || '');
    setIsMessageModalOpen(true);
    
    if (!msg.read) {
      try {
        const res = await fetch('/api/admin/messages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: msg.id, read: true }),
        });
        const data = await res.json();
        if (data.success) {
          loadData();
        }
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMessage) return;
    if (!replyText.trim()) {
      showToast('Reply message cannot be empty.', 'error');
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeMessage.id, replyMessage: replyText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Reply submitted successfully!', 'success');
        setIsMessageModalOpen(false);
        loadData();
      } else {
        showToast(data.message || 'Failed to submit reply.', 'error');
      }
    } catch (err) {
      console.error('Submit reply error:', err);
      showToast('Failed to submit reply.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const triggerMessageDelete = (id: string) => {
    setConfirmTitle('Delete Message');
    setConfirmMsg('Remove this contact message from inbox?');
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`/api/admin/messages?id=${id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          showToast('Message deleted', 'info');
          loadData();
        } else {
          showToast(data.message || 'Failed to delete message.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to delete message.', 'error');
      }
    });
    setConfirmOpen(true);
  };

  // Site Settings Submissions
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sWebTitle || !sLogoText) {
      showToast('Logo text and title are required.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteTitle: sWebTitle,
          logoText: sLogoText,
          heroTitle: sHeroTitle,
          heroSubtitle: sHeroSubtitle,
          heroIntro: sHeroIntro,
          aboutBadge: sAboutBadge,
          aboutTitle: sAboutTitle,
          aboutBio: sAboutBio,
          aboutDescription: sAboutDesc,
          cvUrl: sCvUrl,
          email: sEmail,
          phone: sPhone,
          location: sLocation,
          availability: sAvailability,
          githubUrl: sGitUrl,
          linkedinUrl: sLinkUrl,
          twitterUrl: sTwitterUrl,
          seoMetaTitle: sSeoMetaTitle,
          seoMetaDescription: sSeoMetaDesc,
          seoKeywords: sSeoKeywords
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Site settings updated!', 'success');
        loadData();
      } else {
        showToast(data.message || 'Failed to update settings.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update settings.', 'error');
    }
  };

  // Contact Settings Submission
  const handleContactSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);

    try {
      const res = await fetch('/api/admin/contact-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cTitle,
          subtitle: cSubtitle,
          introText: cIntroText,
          email: cEmail,
          phone: cPhone,
          location: cLocation,
          availabilityText: cAvailabilityText,
          githubUrl: cGithubUrl,
          linkedinUrl: cLinkedinUrl,
          twitterUrl: cTwitterUrl,
          formNameLabel: cFormNameLabel,
          formNamePlaceholder: cFormNamePlaceholder,
          formEmailLabel: cFormEmailLabel,
          formEmailPlaceholder: cFormEmailPlaceholder,
          formSubjectLabel: cFormSubjectLabel,
          formSubjectPlaceholder: cFormSubjectPlaceholder,
          formMessageLabel: cFormMessageLabel,
          formMessagePlaceholder: cFormMessagePlaceholder,
          successMessage: cSuccessMessage
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Contact settings updated successfully.', 'success');
        loadData();
      } else {
        showToast(data.message || 'Failed to update contact settings.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update contact settings.', 'error');
    } finally {
      setIsActionLoading(false);
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

  // Profile Edit Submission
  const handleAdminProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }

    setIsActionLoading(true);
    try {
      let finalAvatarUrl = aAvatar;

      if (avatarFile) {
        try {
          const uploadResult = await ApiService.uploadImage(avatarFile, 'avatar');
          finalAvatarUrl = uploadResult.url;
          setAAvatar(finalAvatarUrl);
          setAvatarFile(null);
        } catch (uploadErr: any) {
          console.error('Admin avatar upload failed:', uploadErr);
          showToast(uploadErr.message || 'Image upload failed. Settings not saved.', 'error');
          setIsActionLoading(false);
          return;
        }
      }

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: aName,
          avatar: finalAvatarUrl,
          bio: aBio,
          profession: aProfession,
          website: aWebsite,
          socialLinks: {
            github: aGithub,
            linkedin: aLinkedin,
            twitter: aTwitter
          }
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        showToast('Admin profile saved successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to update admin profile.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update admin profile.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Logout Admin
  const handleLogout = () => {
    logout();
    showToast('Admin logged out successfully.', 'info');
    router.push('/');
  };

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <>
        <Navbar />
        <main className="flex-grow pt-32 pb-20 flex items-center justify-center bg-brand-bg min-h-screen">
          <LoadingState message="Connecting to secure admin gateway..." />
        </main>
        <Footer />
      </>
    );
  }

  const adminMenuTabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'courses' as const, label: 'Manage Courses', icon: BookOpen },
    { id: 'chats' as const, label: 'Live Chats', icon: MessageSquare },
    { id: 'projects' as const, label: 'Manage Projects', icon: Briefcase },
    { id: 'blogs' as const, label: 'Manage Blogs', icon: BookOpen },
    { id: 'comments' as const, label: 'Manage Comments', icon: MessageSquare },
    { id: 'users' as const, label: 'Manage Users', icon: Users },
    { id: 'contacts' as const, label: 'Contact Messages', icon: Mail },
    { id: 'settings' as const, label: 'Site Settings', icon: Settings },
    { id: 'contactSettings' as const, label: 'Contact Settings', icon: Mail },
    { id: 'profile' as const, label: 'Profile Settings', icon: UserIcon },
    { id: 'project-briefs' as const, label: 'Project Briefs', icon: FileText },
    { id: 'read-rank' as const, label: 'Read & Rank', icon: Tv },
    { id: 'ask-tarikur' as const, label: 'Ask Tarikur', icon: MessageSquare },
    { id: 'site-reviews' as const, label: 'Site Reviews', icon: ThumbsUp },
    { id: 'page-media' as const, label: 'Page Media', icon: ImageIcon },
    { id: 'services' as const, label: 'Manage Services', icon: Activity },
    { id: 'skills' as const, label: 'Manage Skills', icon: Cpu },
    { id: 'experiences' as const, label: 'Manage Experiences', icon: Briefcase },
    { id: 'education' as const, label: 'Manage Education', icon: Award }
  ];

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-28 pb-20 min-h-screen bg-brand-bg">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Profile card widgets */}
              <Card hoverEffect={false} className="p-5 border border-brand-border-white bg-brand-card-dark text-center">
                <div className="relative w-16 h-16 mx-auto mb-3.5 rounded-full overflow-hidden border-2 border-brand-accent">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xs font-bold text-white leading-none mb-1.5">{user.name}</h3>
                <p className="text-[9px] text-brand-text-muted mb-4">{user.email}</p>
                <span className="px-2.5 py-0.5 bg-brand-accent/20 border border-brand-accent/30 text-[8px] font-extrabold tracking-widest text-brand-accent rounded-full uppercase">
                  System Admin
                </span>
              </Card>

              {/* Tabs list menu */}
              <Card hoverEffect={false} className="p-2 border border-brand-border-white bg-brand-card-dark/20 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-none gap-1">
                {adminMenuTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  // specific badges count for contacts
                  const unreadCount = tab.id === 'contacts' ? messages.filter(m => !m.read).length : 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-accent text-white shadow-md'
                          : 'text-brand-text-muted hover:text-white hover:bg-brand-card-light'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        {tab.label}
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-brand-accent text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer text-left w-full mt-auto"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Logout Admin
                </button>
              </Card>

            </div>

            {/* Content Display Panels */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Active Tab header banner */}
              <div className="flex items-center justify-between border-b border-brand-border-white pb-3">
                <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                  {adminMenuTabs.find(t => t.id === activeTab)?.label}
                </h1>
                <span className="text-[10px] text-brand-text-muted font-medium flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Portal Connected
                </span>
              </div>

              {/* TAB: COURSES SYSTEM */}
              {activeTab === 'courses' && (
                <CoursesTab />
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Overview Control bar */}
                  <div className="flex items-center justify-between bg-brand-card/40 p-4 rounded-xl border border-brand-border-white/5">
                    <div>
                      <h2 className="text-sm font-bold text-white tracking-tight">Website Performance Overview</h2>
                      <p className="text-[10px] text-brand-text-muted mt-0.5">Real-time statistics & dynamic visitor actions tracker.</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={loadData}
                      disabled={isOverviewLoading}
                      leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isOverviewLoading ? 'animate-spin' : ''}`} />}
                    >
                      {isOverviewLoading ? 'Refreshing...' : 'Refresh Stats'}
                    </Button>
                  </div>

                  {overviewError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{overviewError}</span>
                      </div>
                      <Button variant="secondary" size="sm" onClick={loadData} className="py-1 px-2">Retry</Button>
                    </div>
                  )}

                  {isOverviewLoading ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(n => (
                          <div key={n} className="animate-pulse bg-brand-card/30 border border-brand-border-white/5 rounded-xl p-4 space-y-3">
                            <div className="h-3 bg-white/5 rounded w-1/3" />
                            <div className="h-6 bg-white/10 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="animate-pulse bg-brand-card/30 border border-brand-border-white/5 rounded-xl h-64" />
                        <div className="animate-pulse bg-brand-card/30 border border-brand-border-white/5 rounded-xl h-64" />
                      </div>
                    </div>
                  ) : (() => {
                    const stats = overviewStats || {};
                    const vis = stats.visitors || { totalPageViews: 0, totalUniqueVisitors: 0, todayVisitors: 0, thisWeekVisitors: 0, thisMonthVisitors: 0, activeVisitorsNow: 0 };
                    const usr = stats.users || { totalUsers: 0, newUsersToday: 0, activeUsers: 0, blockedUsers: 0 };
                    const blg = stats.blogs || { totalBlogs: 0, publishedBlogs: 0, draftBlogs: 0, archivedBlogs: 0 };
                    const prj = stats.projects || { totalProjects: 0, publishedProjects: 0, draftProjects: 0, archivedProjects: 0 };
                    const eng = stats.engagement || { totalLikes: 0, totalComments: 0, pendingComments: 0, approvedComments: 0 };
                    const msg = stats.messages || { totalMessages: 0, newMessages: 0, readMessages: 0, archivedMessages: 0 };
                    const med = stats.media || { totalMediaUploads: 0 };

                    const formatTimeAgo = (dateStr: string) => {
                      const d = new Date(dateStr);
                      const diffMs = new Date().getTime() - d.getTime();
                      const seconds = Math.floor(diffMs / 1000);
                      if (seconds < 60) return 'Just now';
                      const minutes = Math.floor(seconds / 60);
                      if (minutes < 60) return `${minutes}m ago`;
                      const hours = Math.floor(minutes / 60);
                      if (hours < 24) return `${hours}h ago`;
                      return d.toLocaleDateString();
                    };

                    return (
                      <div className="space-y-6">
                        {/* 1. VISITOR ANALYTICS SECTION */}
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-bold text-brand-text-muted tracking-wider uppercase border-l-2 border-brand-accent pl-2">
                            Visitor Analytics
                          </h3>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Total Page Views</p>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{vis.totalPageViews}</p>
                              </div>
                              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                                <Eye className="w-4 h-4" />
                              </div>
                            </Card>

                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Unique Visitors</p>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{vis.totalUniqueVisitors}</p>
                              </div>
                              <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                                <Users className="w-4 h-4" />
                              </div>
                            </Card>

                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Today Visitors</p>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{vis.todayVisitors}</p>
                              </div>
                              <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                            </Card>

                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between relative overflow-hidden">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase flex items-center gap-1.5">
                                  Active Now 
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                                </p>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{vis.activeVisitorsNow}</p>
                              </div>
                              <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                                <Activity className="w-4 h-4" />
                              </div>
                            </Card>
                          </div>
                        </div>

                        {/* 2. USER ANALYTICS SECTION */}
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-bold text-brand-text-muted tracking-wider uppercase border-l-2 border-brand-accent pl-2">
                            User Analytics
                          </h3>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Registered Users</p>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{usr.totalUsers}</p>
                              </div>
                              <div className="p-2 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-xl">
                                <Users className="w-4 h-4" />
                              </div>
                            </Card>

                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">New Users Today</p>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{usr.newUsersToday}</p>
                              </div>
                              <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                                <UserCheck className="w-4 h-4" />
                              </div>
                            </Card>

                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Active Accounts</p>
                                <p className="text-xl font-extrabold text-green-400 mt-1 leading-none">{usr.activeUsers}</p>
                              </div>
                              <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                            </Card>

                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Blocked Accounts</p>
                                <p className="text-xl font-extrabold text-red-400 mt-1 leading-none">{usr.blockedUsers}</p>
                              </div>
                              <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                                <ShieldAlert className="w-4 h-4" />
                              </div>
                            </Card>
                          </div>
                        </div>

                        {/* 3. CONTENT & ENGAGEMENT GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Content metrics */}
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-brand-text-muted tracking-wider uppercase border-l-2 border-brand-accent pl-2">
                              Content Analytics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <Card hoverEffect className="p-4 border border-brand-border-white/5">
                                <div className="flex items-center justify-between">
                                  <p className="text-[9px] text-brand-text-muted font-bold uppercase">Blog Articles</p>
                                  <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                                    <BookOpen className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{blg.totalBlogs}</p>
                                <div className="flex items-center gap-3 mt-3 text-[10px] text-brand-text-muted font-medium">
                                  <span>Published: <strong className="text-white">{blg.publishedBlogs}</strong></span>
                                  <span>Drafts: <strong className="text-white">{blg.draftBlogs}</strong></span>
                                </div>
                              </Card>

                              <Card hoverEffect className="p-4 border border-brand-border-white/5">
                                <div className="flex items-center justify-between">
                                  <p className="text-[9px] text-brand-text-muted font-bold uppercase">Portfolio Projects</p>
                                  <div className="p-1.5 bg-brand-accent/10 text-brand-accent rounded-lg">
                                    <Briefcase className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{prj.totalProjects}</p>
                                <div className="flex items-center gap-3 mt-3 text-[10px] text-brand-text-muted font-medium">
                                  <span>Completed: <strong className="text-white">{prj.publishedProjects}</strong></span>
                                  <span>Progress: <strong className="text-white">{prj.draftProjects}</strong></span>
                                </div>
                              </Card>
                            </div>
                          </div>

                          {/* Engagement metrics */}
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-brand-text-muted tracking-wider uppercase border-l-2 border-brand-accent pl-2">
                              Engagement Analytics
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                              <Card hoverEffect className="p-4 border border-brand-border-white/5">
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Total Likes</p>
                                <p className="text-lg font-extrabold text-white mt-1 leading-none flex items-center gap-1.5">
                                  <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                                  {eng.totalLikes}
                                </p>
                              </Card>

                              <Card hoverEffect className="p-4 border border-brand-border-white/5">
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Comments</p>
                                <p className="text-lg font-extrabold text-white mt-1 leading-none flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                                  {eng.totalComments}
                                </p>
                              </Card>

                              <Card hoverEffect className={`p-4 border ${eng.pendingComments > 0 ? 'border-amber-500/20 bg-amber-500/5' : 'border-brand-border-white/5'}`}>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Pending</p>
                                <p className={`text-lg font-extrabold mt-1 leading-none flex items-center gap-1.5 ${eng.pendingComments > 0 ? 'text-amber-400' : 'text-white'}`}>
                                  <AlertTriangle className={`w-3.5 h-3.5 ${eng.pendingComments > 0 ? 'text-amber-400' : 'text-brand-text-muted'}`} />
                                  {eng.pendingComments}
                                </p>
                              </Card>
                            </div>
                          </div>
                        </div>

                        {/* 4. MESSAGES & MEDIA SECTION */}
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-bold text-brand-text-muted tracking-wider uppercase border-l-2 border-brand-accent pl-2">
                            Messages & Media
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Inbox Messages</p>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{msg.totalMessages}</p>
                              </div>
                              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                                <Mail className="w-4 h-4" />
                              </div>
                            </Card>

                            <Card hoverEffect className={`p-4 border ${msg.newMessages > 0 ? 'border-green-500/20 bg-green-500/5' : 'border-brand-border-white/5'} flex items-center justify-between`}>
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Unread Messages</p>
                                <p className={`text-xl font-extrabold mt-1 leading-none ${msg.newMessages > 0 ? 'text-green-400' : 'text-white'}`}>{msg.newMessages}</p>
                              </div>
                              <div className={`p-2 rounded-xl border ${msg.newMessages > 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-brand-card-light border-brand-border-white text-brand-text-muted'}`}>
                                <Mail className="w-4 h-4" />
                              </div>
                            </Card>

                            <Card hoverEffect className="p-4 border border-brand-border-white/5 flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-brand-text-muted font-bold uppercase">Media Library Uploads</p>
                                <p className="text-xl font-extrabold text-white mt-1 leading-none">{med.totalMediaUploads}</p>
                              </div>
                              <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            </Card>
                          </div>
                        </div>

                        {/* 5. TABLES AND CHARTS SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Top viewed pages */}
                          <Card className="lg:col-span-5 p-5 border border-brand-border-white/5 bg-brand-card-dark/20 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white mb-4 tracking-tight border-l-2 border-brand-accent pl-2">
                                Top Visited Pages
                              </h4>
                              {analyticsData?.mostViewedPages?.length > 0 ? (
                                <div className="space-y-3">
                                  {analyticsData.mostViewedPages.map((page: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-brand-border-white/5 pb-2.5 last:border-0 last:pb-0 text-[11px]">
                                      <div className="max-w-[70%]">
                                        <p className="font-semibold text-white truncate">{page.pageTitle || 'Untitled Page'}</p>
                                        <p className="text-[9px] text-brand-text-muted truncate mt-0.5">{page.pageUrl}</p>
                                      </div>
                                      <span className="px-2.5 py-1 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent font-bold rounded-lg leading-none">
                                        {page.count} views
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-brand-text-muted italic py-4">No visitor events recorded yet.</p>
                              )}
                            </div>
                            
                            {/* Device & Browser Breakdowns */}
                            {analyticsData?.deviceStats?.length > 0 && (
                              <div className="border-t border-brand-border-white/5 pt-4 mt-4">
                                <p className="text-[10px] text-brand-text-muted font-bold uppercase mb-2">Device Distribution</p>
                                <div className="flex items-center gap-4 text-[10px] text-white">
                                  {analyticsData.deviceStats.map((device: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                      <div className={`w-2 h-2 rounded-full ${device.device === 'desktop' ? 'bg-blue-400' : device.device === 'tablet' ? 'bg-purple-400' : 'bg-green-400'}`} />
                                      <span className="capitalize">{device.device}:</span>
                                      <strong className="font-bold">{device.count}</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </Card>

                          {/* Recent visits */}
                          <Card className="lg:col-span-7 p-5 border border-brand-border-white/5 bg-brand-card-dark/20">
                            <h4 className="text-xs font-bold text-white mb-4 tracking-tight border-l-2 border-brand-accent pl-2">
                              Recent Activity Logs
                            </h4>
                            {analyticsData?.recentVisits?.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[10px]">
                                  <thead>
                                    <tr className="text-brand-text-muted font-bold border-b border-brand-border-white/5 pb-2">
                                      <th className="pb-2">User / Visitor</th>
                                      <th className="pb-2">Viewed Page</th>
                                      <th className="pb-2">Client Details</th>
                                      <th className="pb-2 text-right">Time</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-brand-border-white/5 text-white/90">
                                    {analyticsData.recentVisits.map((visit: any, idx: number) => {
                                      const userName = visit.userId ? visit.userId.name : `Visitor (..${visit.visitorId.slice(-4)})`;
                                      const userRole = visit.userId ? 'Registered' : 'Anonymous';

                                      return (
                                        <tr key={idx} className="hover:bg-brand-card-light/10 transition-colors">
                                          <td className="py-2 pr-2">
                                            <p className="font-bold">{userName}</p>
                                            <p className="text-[8px] text-brand-text-muted leading-none mt-0.5">{userRole}</p>
                                          </td>
                                          <td className="py-2 pr-2 max-w-[150px] truncate">
                                            <p className="truncate font-medium">{visit.pageTitle || 'Untitled Page'}</p>
                                            <p className="text-[8px] text-brand-text-muted truncate mt-0.5">{visit.pageUrl.replace(/^(?:\/\/|[^\/]+)*\//, '/')}</p>
                                          </td>
                                          <td className="py-2 pr-2 text-brand-text-muted">
                                            <span className="capitalize">{visit.device}</span> • <span>{visit.browser}</span>
                                          </td>
                                          <td className="py-2 text-right font-medium text-brand-text-muted whitespace-nowrap">
                                            {formatTimeAgo(visit.visitedAt)}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-xs text-brand-text-muted italic py-4">No visitor events recorded yet.</p>
                            )}
                          </Card>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: MANAGE PROJECTS */}
              {activeTab === 'projects' && (() => {
                if (isOverviewLoading) {
                  return <TableSkeleton rows={5} cols={4} />;
                }
                const filtered = projects.filter(p =>
                  !adminSearchQuery ||
                  p.title.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                  p.category.toLowerCase().includes(adminSearchQuery.toLowerCase())
                );
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-card/40 p-4 rounded-xl border border-brand-border-white/5">
                      {renderSearchBar('Search projects...')}
                      <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openProjectModal(null)}>
                        Add Project
                      </Button>
                    </div>

                    {filtered.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                              <th className="p-4">Title</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                            {paginated.map((p) => (
                              <tr key={p.id} className="hover:bg-brand-card-light/40 transition-colors">
                                <td className="p-4 font-bold text-white">{p.title}</td>
                                <td className="p-4">{p.category}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${p.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                  <button className="p-1.5 text-blue-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => openProjectModal(p)}>
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="p-1.5 text-red-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => triggerProjectDelete(p.id, p.title)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState title="No Projects found" message="No portfolio projects match your criteria." />
                    )}
                    {renderPagination(filtered.length)}
                  </div>
                );
              })()}

              {/* TAB 3: MANAGE BLOGS */}
              {activeTab === 'blogs' && (() => {
                if (isOverviewLoading) {
                  return <TableSkeleton rows={5} cols={4} />;
                }
                const filtered = blogs.filter(b =>
                  !adminSearchQuery ||
                  b.title.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                  b.category.toLowerCase().includes(adminSearchQuery.toLowerCase())
                );
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-card/40 p-4 rounded-xl border border-brand-border-white/5">
                      {renderSearchBar('Search blogs...')}
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" leftIcon={<Globe className="w-4 h-4" />} onClick={() => setIsImportModalOpen(true)}>
                          Import Blogs
                        </Button>
                        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openBlogModal(null)}>
                          Add Blog
                        </Button>
                      </div>
                    </div>

                    {filtered.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                              <th className="p-4">Title</th>
                              <th className="p-4">Category</th>
                              <th className="p-4 text-center">Status</th>
                              <th className="p-4 text-center">Likes</th>
                              <th className="p-4 text-center">Comments</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                            {paginated.map((b) => (
                              <tr key={b.id} className="hover:bg-brand-card-light/40 transition-colors">
                                <td className="p-4 font-bold text-white max-w-[200px] truncate">{b.title}</td>
                                <td className="p-4">{b.category}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                    b.status === 'Published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {b.status || 'Published'}
                                  </span>
                                </td>
                                <td className="p-4 text-center">{b.likes}</td>
                                <td className="p-4 text-center">{b.commentsCount}</td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                  <button className="p-1.5 text-blue-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => openBlogModal(b)}>
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="p-1.5 text-red-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => triggerBlogDelete(b.id, b.title)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState title="No Blogs found" message="No blog articles match your criteria." />
                    )}
                    {renderPagination(filtered.length)}
                  </div>
                );
              })()}

              {/* TAB 4: MANAGE COMMENTS */}
              {activeTab === 'comments' && (() => {
                if (isOverviewLoading) {
                  return <TableSkeleton rows={5} cols={4} />;
                }
                const filtered = comments.filter(c =>
                  !adminSearchQuery ||
                  c.userName.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                  c.userEmail.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                  c.content.toLowerCase().includes(adminSearchQuery.toLowerCase())
                );
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-card/40 p-4 rounded-xl border border-brand-border-white/5">
                      {renderSearchBar('Search comments...')}
                    </div>

                    {filtered.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                              <th className="p-4">Author</th>
                              <th className="p-4">Comment</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                            {paginated.map((c) => (
                              <tr key={c.id} className="hover:bg-brand-card-light/40 transition-colors">
                                <td className="p-4">
                                  <p className="font-bold text-white">{c.userName}</p>
                                  <p className="text-[9px] text-brand-text-muted">{c.userEmail}</p>
                                </td>
                                <td className="p-4 max-w-[200px] truncate italic">"{c.content}"</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${c.approved ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {c.approved ? 'Approved' : 'Hidden'}
                                  </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                  <button
                                    onClick={() => toggleCommentApproval(c.id)}
                                    className={`p-1.5 rounded border border-brand-border-white cursor-pointer ${c.approved ? 'text-amber-400 hover:text-white' : 'text-green-400 hover:text-white'}`}
                                    title={c.approved ? 'Hide Comment' : 'Approve Comment'}
                                  >
                                    {c.approved ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                  </button>
                                  <button className="p-1.5 text-red-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => triggerCommentDelete(c.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState title="No Comments found" message="No comments match your search criteria." />
                    )}
                    {renderPagination(filtered.length)}
                  </div>
                );
              })()}

              {/* TAB 5: MANAGE USERS */}
              {activeTab === 'users' && (() => {
                if (isOverviewLoading) {
                  return <TableSkeleton rows={5} cols={4} />;
                }
                const filtered = users.filter(u =>
                  !adminSearchQuery ||
                  u.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(adminSearchQuery.toLowerCase())
                );
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-card/40 p-4 rounded-xl border border-brand-border-white/5">
                      {renderSearchBar('Search users by name or email...')}
                    </div>

                    {filtered.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                              <th className="p-4">User</th>
                              <th className="p-4">Role</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                            {paginated.map((u) => (
                              <tr key={u.id} className="hover:bg-brand-card-light/40 transition-colors">
                                <td className="p-4 flex items-center gap-2.5">
                                  <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-brand-border-white" />
                                  <div>
                                    <p className="font-bold text-white">{u.name}</p>
                                    <p className="text-[9px] text-brand-text-muted">{u.email}</p>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${u.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                    {u.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                  <Button variant="secondary" className="text-[9px] px-2 py-1! hover:text-white" onClick={() => toggleUserRole(u.id, u.role)}>
                                    Role toggle
                                  </Button>
                                  <Button variant={u.status === 'active' ? 'outline' : 'primary'} className="text-[9px] px-2 py-1!" onClick={() => toggleUserStatus(u.id, u.status)}>
                                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                                  </Button>
                                  <button className="p-1.5 text-red-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => triggerUserDelete(u.id, u.name)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState title="No Users found" message="No users match your criteria." />
                    )}
                    {renderPagination(filtered.length)}
                  </div>
                );
              })()}

              {/* TAB 6: CONTACT MESSAGES */}
              {activeTab === 'contacts' && (() => {
                if (isOverviewLoading) {
                  return <TableSkeleton rows={5} cols={4} />;
                }
                const filtered = messages.filter(m =>
                  !adminSearchQuery ||
                  m.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                  m.email.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                  m.subject.toLowerCase().includes(adminSearchQuery.toLowerCase())
                );
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-card/40 p-4 rounded-xl border border-brand-border-white/5">
                      {renderSearchBar('Search inbox...')}
                    </div>

                    {filtered.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                              <th className="p-4">Sender</th>
                              <th className="p-4">Subject</th>
                              <th className="p-4">Date</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                            {paginated.map((m) => (
                              <tr key={m.id} className={`hover:bg-brand-card-light/40 transition-colors ${!m.read ? 'font-bold bg-brand-accent/5' : ''}`}>
                                <td className="p-4">
                                  <p className="text-white">{m.name}</p>
                                  <p className="text-[9px] text-brand-text-muted font-normal">{m.email}</p>
                                </td>
                                <td className="p-4 max-w-[200px] truncate text-white/95">{m.subject}</td>
                                <td className="p-4 text-brand-text-muted font-normal">{new Date(m.date).toLocaleDateString()}</td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                  <button className="p-1.5 text-blue-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => openMessageModal(m)}>
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="p-1.5 text-red-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => triggerMessageDelete(m.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState title="Inbox Empty" message="No messages match your criteria." />
                    )}
                    {renderPagination(filtered.length)}
                  </div>
                );
              })()}
              {activeTab === 'settings' && (
                <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25">
                  <form onSubmit={handleSettingsSubmit} className="space-y-6">
                    
                    {/* Brand Meta */}
                    <div className="border-b border-brand-border-white pb-4">
                      <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">1. Brand & Header</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Website Title</label>
                          <input type="text" value={sWebTitle} onChange={e => setSWebTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Navbar Logo Text</label>
                          <input type="text" value={sLogoText} onChange={e => setSLogoText(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                      </div>
                    </div>

                    {/* Hero content config */}
                    <div className="border-b border-brand-border-white pb-4">
                      <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">2. Hero Banner Content</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Hero Title</label>
                          <input type="text" value={sHeroTitle} onChange={e => setSHeroTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Hero Subtitle</label>
                          <input type="text" value={sHeroSubtitle} onChange={e => setSHeroSubtitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-white/90">Hero Short Intro text</label>
                        <textarea value={sHeroIntro} onChange={e => setSHeroIntro(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none resize-none" />
                      </div>
                    </div>

                    {/* About me info config */}
                    <div className="border-b border-brand-border-white pb-4">
                      <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">3. About Section Bio</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Small Section Badge</label>
                          <input type="text" value={sAboutBadge} onChange={e => setSAboutBadge(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Headline</label>
                          <input type="text" value={sAboutTitle} onChange={e => setSAboutTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Short Bio</label>
                          <textarea value={sAboutBio} onChange={e => setSAboutBio(e.target.value)} rows={2} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none resize-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Detailed Bio Description</label>
                          <textarea value={sAboutDesc} onChange={e => setSAboutDesc(e.target.value)} rows={4} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none resize-none" />
                        </div>
                      </div>
                    </div>

                    {/* Meta/SEO globally */}
                    <div>
                      <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">4. Global SEO configuration</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Global Meta Title</label>
                          <input type="text" value={sSeoMetaTitle} onChange={e => setSSeoMetaTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">SEO Keywords (Comma list)</label>
                          <input type="text" value={sSeoKeywords} onChange={e => setSSeoKeywords(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-white/90">Global Meta Description</label>
                        <textarea value={sSeoMetaDesc} onChange={e => setSSeoMetaDesc(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none resize-none" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button type="submit" variant="primary" className="w-full font-bold py-3 text-xs" leftIcon={<Save className="w-4 h-4" />}>
                        Save All Changes
                      </Button>
                    </div>

                  </form>
                </Card>
              )}

              {/* TAB: CONTACT SETTINGS */}
              {activeTab === 'contactSettings' && (
                <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25 text-left">
                  <form onSubmit={handleContactSettingsSubmit} className="space-y-6">
                    
                    {/* Header info */}
                    <div className="border-b border-brand-border-white pb-4">
                      <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">1. Header Copy</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Section Title</label>
                          <input type="text" value={cTitle} onChange={e => setCTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Section Subtitle</label>
                          <input type="text" value={cSubtitle} onChange={e => setCSubtitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                      </div>
                      <div className="space-y-1 mt-4">
                        <label className="text-[10px] font-semibold text-white/90">Introductory Text (Left Column)</label>
                        <textarea value={cIntroText} onChange={e => setCIntroText(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none resize-none" />
                      </div>
                    </div>

                    {/* Contact Details info */}
                    <div className="border-b border-brand-border-white pb-4">
                      <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">2. Contact Details & Socials</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Email Address</label>
                          <input type="email" value={cEmail} onChange={e => setCEmail(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Phone Number</label>
                          <input type="text" value={cPhone} onChange={e => setCPhone(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Location</label>
                          <input type="text" value={cLocation} onChange={e => setCLocation(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Availability Text</label>
                          <input type="text" value={cAvailabilityText} onChange={e => setCAvailabilityText(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">GitHub URL</label>
                          <input type="text" value={cGithubUrl} onChange={e => setCGithubUrl(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">LinkedIn URL</label>
                          <input type="text" value={cLinkedinUrl} onChange={e => setCLinkedinUrl(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Twitter URL</label>
                          <input type="text" value={cTwitterUrl} onChange={e => setCTwitterUrl(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Contact Form config */}
                    <div className="border-b border-brand-border-white pb-4">
                      <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">3. Contact Form Copy & Placeholders</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Name Label</label>
                          <input type="text" value={cFormNameLabel} onChange={e => setCFormNameLabel(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Name Placeholder</label>
                          <input type="text" value={cFormNamePlaceholder} onChange={e => setCFormNamePlaceholder(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Email Label</label>
                          <input type="text" value={cFormEmailLabel} onChange={e => setCFormEmailLabel(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Email Placeholder</label>
                          <input type="text" value={cFormEmailPlaceholder} onChange={e => setCFormEmailPlaceholder(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Subject Label</label>
                          <input type="text" value={cFormSubjectLabel} onChange={e => setCFormSubjectLabel(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Subject Placeholder</label>
                          <input type="text" value={cFormSubjectPlaceholder} onChange={e => setCFormSubjectPlaceholder(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Message Label</label>
                          <input type="text" value={cFormMessageLabel} onChange={e => setCFormMessageLabel(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-white/90">Message Placeholder</label>
                          <input type="text" value={cFormMessagePlaceholder} onChange={e => setCFormMessagePlaceholder(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                        </div>
                      </div>
                    </div>

                    {/* Feedback copy config */}
                    <div>
                      <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">4. Success Feedback</h3>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-white/90">Form Submission Success Message</label>
                        <input type="text" value={cSuccessMessage} onChange={e => setCSuccessMessage(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none" required />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button type="submit" variant="primary" className="w-full font-bold py-3 text-xs" isLoading={isActionLoading} leftIcon={<Save className="w-4 h-4" />}>
                        Save Contact Settings
                      </Button>
                    </div>

                  </form>
                </Card>
              )}

              {/* TAB 8: PROFILE SETTINGS */}
              {activeTab === 'profile' && (
                <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25">
                  <form onSubmit={handleAdminProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: Avatar & Core Profile Info */}
                      <div className="space-y-4 text-left">
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
                            <p className="text-xs font-semibold text-white">Admin Photo</p>
                            <p className="text-[9px] text-brand-text-muted mt-0.5">Click photo to upload new image (PNG, JPG, WebP, max 5MB)</p>
                          </div>
                        </div>

                        {/* Name input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90">Full Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={aName}
                            onChange={(e) => setAName(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                            required
                          />
                        </div>

                        {/* Profession input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90">Profession / Title</label>
                          <input
                            type="text"
                            placeholder="Lead Administrator"
                            value={aProfession}
                            onChange={(e) => setAProfession(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* Bio input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90">Bio / About Me</label>
                          <textarea
                            placeholder="Write a brief introduction about yourself..."
                            value={aBio}
                            onChange={(e) => setABio(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all resize-none"
                          />
                        </div>
                      </div>

                      {/* Right Column: Web & Social Links */}
                      <div className="space-y-4 text-left">
                        {/* Direct URL option for Avatar */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90">Avatar Image URL (Alternative)</label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={aAvatar}
                            onChange={(e) => {
                              setAAvatar(e.target.value);
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
                            value={aWebsite}
                            onChange={(e) => setAWebsite(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* GitHub URL input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5"><Github className="w-3.5 h-3.5 text-brand-text-muted" /> GitHub Profile</label>
                          <input
                            type="url"
                            placeholder="https://github.com/username"
                            value={aGithub}
                            onChange={(e) => setAGithub(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* LinkedIn URL input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5"><Linkedin className="w-3.5 h-3.5 text-brand-text-muted" /> LinkedIn Profile</label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            value={aLinkedin}
                            onChange={(e) => setALinkedin(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                          />
                        </div>

                        {/* Twitter/X URL input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-white/90 flex items-center gap-1.5"><Twitter className="w-3.5 h-3.5 text-brand-text-muted" /> Twitter/X Profile</label>
                          <input
                            type="url"
                            placeholder="https://twitter.com/username"
                            value={aTwitter}
                            onChange={(e) => setATwitter(e.target.value)}
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
                        isLoading={isActionLoading}
                        leftIcon={<Save className="w-4 h-4" />}
                      >
                        Update Profile
                      </Button>
                    </div>

                  </form>
                </Card>
              )}

              {/* TAB 9: PROJECT BRIEF ESTIMATOR */}
              {activeTab === 'project-briefs' && (
                <ProjectBriefsTab />
              )}

              {/* TAB 10: READ & RANK MCQ CHALLENGE */}
              {activeTab === 'read-rank' && (
                <ReadRankTab />
              )}

              {/* TAB 11: ASK TARIKUR QUESTIONS & MODERATION */}
              {activeTab === 'ask-tarikur' && (
                <AskTarikurTab />
              )}

              {/* TAB 12: SITE VISITOR REVIEWS & RATINGS */}
              {activeTab === 'site-reviews' && (
                <SiteReviewsTab />
              )}

              {/* TAB 13: LANDING PAGE CUSTOM MEDIA */}
              {activeTab === 'page-media' && (
                <PageMediaTab />
              )}

              {/* TAB 14: SERVICES CMS */}
              {activeTab === 'services' && (
                <ServicesTab />
              )}

              {/* TAB 15: SKILLS CMS */}
              {activeTab === 'skills' && (
                <SkillsTab />
              )}

              {/* TAB 16: EXPERIENCES CMS */}
              {activeTab === 'experiences' && (
                <ExperiencesTab />
              )}

              {/* TAB 17: EDUCATION CMS */}
              {activeTab === 'education' && (
                <EducationTab />
              )}

              {/* TAB: LIVE CHATS */}
              {activeTab === 'chats' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] text-left">
                  
                  {/* Left Pane: Conversations List */}
                  <Card hoverEffect={false} className="lg:col-span-1 border border-brand-border-white bg-brand-card-dark/25 p-4 flex flex-col h-full overflow-hidden">
                    <div className="pb-3 border-b border-brand-border-white/5 mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Conversations</h3>
                        <p className="text-[10px] text-brand-text-muted mt-0.5">Real-time inquiries</p>
                      </div>
                      <span className="px-2 py-0.5 bg-brand-accent/10 border border-brand-accent/20 text-[8px] font-bold text-brand-accent rounded-full">
                        {conversations.length} Active
                      </span>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-brand-accent/20">
                      {conversations.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-4">
                          <p className="text-xs text-brand-text-muted">No active live chats.</p>
                        </div>
                      ) : (
                        conversations.map((conv) => {
                          const isActive = selectedUserEmail === conv.userEmail;
                          const isUnread = conv.unreadByAdmin;
                          return (
                            <button
                              key={conv.id}
                              onClick={() => {
                                setSelectedUserEmail(conv.userEmail);
                                setSelectedUserName(conv.userName || 'User');
                              }}
                              className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group cursor-pointer ${
                                isActive
                                  ? 'bg-brand-accent/10 border-brand-accent/35 text-white'
                                  : 'bg-brand-card-dark/45 border-brand-border-white/5 hover:border-brand-border-white/20 text-brand-text-muted hover:text-white'
                              }`}
                            >
                              <div className="min-w-0 flex-grow pr-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className={`text-xs font-bold truncate leading-none ${isActive ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
                                    {conv.userName || 'User'}
                                  </span>
                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0 animate-pulse" />
                                  )}
                                </div>
                                <p className="text-[10px] truncate max-w-full text-brand-text-muted mb-0.5 italic">
                                  {conv.lastMessage || 'No messages yet'}
                                </p>
                                <span className="text-[8px] text-brand-text-muted block">
                                  {conv.userEmail}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[8px] text-brand-text-muted block">
                                  {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </Card>

                  {/* Right Pane: Selected Chat Panel */}
                  <Card hoverEffect={false} className="lg:col-span-2 border border-brand-border-white bg-brand-card-dark/25 p-4 md:p-6 flex flex-col h-full overflow-hidden">
                    {!selectedUserEmail ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-3 animate-pulse">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">Select a Conversation</h4>
                        <p className="text-xs text-brand-text-muted max-w-sm">
                          Choose a thread from the left menu to display message history and respond in real-time.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full justify-between overflow-hidden">
                        
                        {/* Conversation Header */}
                        <div className="pb-3 border-b border-brand-border-white/5 mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-extrabold text-white leading-none">{selectedUserName}</h3>
                            <span className="text-[10px] text-brand-text-muted mt-1 block">{selectedUserEmail}</span>
                          </div>
                          <span className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-400 rounded-full">
                            Active Session
                          </span>
                        </div>

                        {/* Messages Box */}
                        <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-brand-accent/20">
                          {currentChatMessages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center text-brand-text-muted text-xs">
                              Loading conversation messages...
                            </div>
                          ) : (
                            currentChatMessages.map((msg) => {
                              const isMe = msg.sender === 'admin';
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
                                >
                                  {!isMe && (
                                    <div className="w-6 h-6 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-brand-accent">
                                      U
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
                          <div ref={adminMessagesEndRef} />
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleSendAdminReply} className="mt-4 pt-3 border-t border-brand-border-white/5 flex gap-2">
                          <input
                            type="text"
                            placeholder={`Reply to ${selectedUserName}...`}
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            className="flex-grow px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all placeholder:text-brand-text-muted"
                            disabled={isSendingReply}
                            required
                          />
                          <Button
                            type="submit"
                            variant="primary"
                            className="px-4 py-2.5 text-xs font-bold flex items-center gap-1.5"
                            isLoading={isSendingReply}
                            disabled={!adminReplyText.trim()}
                          >
                            Send Reply
                          </Button>
                        </form>

                      </div>
                    )}
                  </Card>

                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* -------------------- MODALS & DIALOGS -------------------- */}

      {/* Project Add/Edit Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title={activeProject ? 'Edit Project details' : 'Add new Project'} size="lg">
        <form onSubmit={handleProjectSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Project Title *</label>
              <input type="text" value={pTitle} onChange={e => setPTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Category *</label>
              <select value={pCategory} onChange={e => setPCategory(e.target.value as any)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                <option value="Frontend">Frontend Development</option>
                <option value="Shopify">Shopify Development</option>
                <option value="Bubble.io">Bubble.io App Dev</option>
                <option value="UI/UX">UI/UX Implementation</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Short description *</label>
            <input type="text" value={pDesc} onChange={e => setPDesc(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Detailed Overview *</label>
            <textarea value={pLongDesc} onChange={e => setPLongDesc(e.target.value)} rows={4} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Technologies Tags (Comma separated)</label>
              <input type="text" value={pTags} onChange={e => setPTags(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Status *</label>
              <select value={pStatus} onChange={e => setPStatus(e.target.value as any)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Live URL</label>
              <input type="url" value={pLiveUrl} onChange={e => setPLiveUrl(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Github URL</label>
              <input type="url" value={pGitUrl} onChange={e => setPGitUrl(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Cover Image URL</label>
            <input type="url" value={pImage} onChange={e => setPImage(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
          </div>

          {/* Cover Image Upload for Projects */}
          <div className="space-y-1.5 bg-brand-card-dark p-4 rounded-xl border border-brand-border-white">
            <label className="text-[10px] font-bold text-white block">Custom Cover Image (File Upload)</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {pImage && (
                <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-brand-border shrink-0">
                  <img src={pImage} alt="Project Thumbnail preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPImage('')}
                    className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProjectImageUpload}
                  className="w-full text-xs text-brand-text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-brand-accent file:text-white file:cursor-pointer"
                />
                <p className="text-[8px] text-brand-text-muted mt-1">Uploads image file directly to secure cloud storage.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Challenge details</label>
              <textarea value={pChallenge} onChange={e => setPChallenge(e.target.value)} rows={2} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Solution details</label>
              <textarea value={pSolution} onChange={e => setPSolution(e.target.value)} rows={2} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Key Features (One feature per line)</label>
            <textarea value={pFeatures} onChange={e => setPFeatures(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" />
          </div>

          <div className="pt-3 border-t border-brand-border-white flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {activeProject ? 'Save project details' : 'Add Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Blog Add/Edit Modal */}
      <Modal isOpen={isBlogModalOpen} onClose={() => setIsBlogModalOpen(false)} title={activeBlog ? 'Edit Blog Article' : 'Add new Blog Article'} size="lg">
        {/* Modal Subheader Tabs */}
        <div className="flex border-b border-brand-border-white mb-5">
          <button
            type="button"
            onClick={() => setBEditorTab('write')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              bEditorTab === 'write' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-muted hover:text-white'
            }`}
          >
            Write Content
          </button>
          <button
            type="button"
            onClick={() => setBEditorTab('preview')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              bEditorTab === 'preview' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-muted hover:text-white'
            }`}
          >
            Live Preview
          </button>
        </div>

        <form onSubmit={handleBlogSubmit} className="space-y-4">
          {bEditorTab === 'preview' ? (
            /* Live Render Preview Tab */
            <div className="p-5 bg-brand-card-dark rounded-xl border border-brand-border-white max-h-[50vh] overflow-y-auto space-y-4 text-left">
              <h1 className="text-lg font-bold text-white tracking-tight leading-snug">{bTitle || 'Untitled Article'}</h1>
              <div className="flex items-center gap-3 text-[10px] text-brand-text-muted">
                <span className="px-2 py-0.5 bg-brand-accent/10 border border-brand-accent/25 text-brand-accent font-semibold uppercase tracking-wider rounded">
                  {bCategory}
                </span>
                <span>•</span>
                <span>{bReadTime}</span>
                <span>•</span>
                <span className={`font-bold ${bStatus === 'Published' ? 'text-green-400' : 'text-amber-500'}`}>
                  {bStatus}
                </span>
              </div>
              
              {bImage && (
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-brand-border-white shadow">
                  <img src={bImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-xs text-brand-text-muted leading-relaxed font-semibold italic border-l-2 border-brand-accent pl-3">
                {bExcerpt || 'No excerpt written yet.'}
              </p>

              <div className="text-xs text-brand-text-muted leading-relaxed space-y-4 pt-3 border-t border-brand-border-white">
                {bContent ? bContent.split('\n\n').map((para, idx) => {
                  if (para.startsWith('###')) {
                    return <h3 key={idx} className="text-sm font-bold text-white tracking-tight pt-2">{para.replace('###', '').trim()}</h3>;
                  }
                  if (para.startsWith('```')) {
                    const code = para.replace(/```[a-z]*/g, '').trim();
                    return <pre key={idx} className="p-3 bg-brand-bg rounded-lg font-mono text-[10px] text-white border border-brand-border-white overflow-x-auto">{code}</pre>;
                  }
                  if (para.startsWith('-')) {
                    return (
                      <ul key={idx} className="list-disc list-inside pl-3 space-y-1.5">
                        {para.split('\n').map((li, liIdx) => <li key={liIdx}>{li.replace('-', '').trim()}</li>)}
                      </ul>
                    );
                  }
                  return <p key={idx}>{para}</p>;
                }) : <p className="italic text-[11px]">No content written yet. Switch back to write tab.</p>}
              </div>
            </div>
          ) : (
            /* Write Content Form Inputs Tab */
            <div className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white">Article Title *</label>
                  <input type="text" value={bTitle} onChange={e => setBTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" placeholder="Mastering Tailwind CSS v4" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white">Slug (Url path, auto-generates)</label>
                  <input type="text" value={bSlug} onChange={e => setBSlug(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" placeholder="mastering-tailwindcss-v4" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white">Category *</label>
                  <select value={bCategory} onChange={e => setBCategory(e.target.value as any)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                    <option value="Frontend">Frontend Development</option>
                    <option value="Shopify">Shopify Development</option>
                    <option value="Bubble.io">Bubble.io App Dev</option>
                    <option value="SEO">SEO Optimization</option>
                    <option value="UI/UX">UI/UX Implementation</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white">Read Time *</label>
                  <input type="text" value={bReadTime} onChange={e => setBReadTime(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white">Publish Status *</label>
                  <select value={bStatus} onChange={e => setBStatus(e.target.value as any)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                    <option value="Published">Published (Live)</option>
                    <option value="Draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload (Base64 file parser) */}
              <div className="space-y-1.5 bg-brand-card-dark p-4 rounded-xl border border-brand-border-white">
                <label className="text-[10px] font-bold text-white block">Custom Cover Image (File Upload)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {bImage && (
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-brand-border shrink-0">
                      <img src={bImage} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBImage('')}
                        className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBlogImageUpload}
                      className="w-full text-xs text-brand-text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-brand-accent file:text-white file:cursor-pointer"
                    />
                    <p className="text-[8px] text-brand-text-muted mt-1">Uploads image file directly to secure cloud storage.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white">Short Excerpt *</label>
                <input type="text" value={bExcerpt} onChange={e => setBExcerpt(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" placeholder="Deep dive into layouts and elements..." required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white">Article Content * (Supports markdown tags ### headers and - bullet lists)</label>
                <textarea value={bContent} onChange={e => setBContent(e.target.value)} rows={5} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" placeholder="### Introduction&#10;&#10;Tailwind v4 changes..." required />
              </div>

              {/* Blog SEO Fields */}
              <div className="border-t border-brand-border-white pt-4 space-y-4">
                <h4 className="text-[10px] font-bold text-brand-accent uppercase text-left">Article SEO Parameters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-white/90">Meta Title</label>
                    <input type="text" value={bSeoTitle} onChange={e => setBSeoTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-white/90">SEO Keywords</label>
                    <input type="text" value={bSeoKeywords} onChange={e => setBSeoKeywords(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-white/90">Meta Description</label>
                    <input type="text" value={bSeoDesc} onChange={e => setBSeoDesc(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-white/90">Open Graph Image (OG image URL)</label>
                    <input type="url" value={bSeoOgImage} onChange={e => setBSeoOgImage(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-brand-border-white flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsBlogModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {activeBlog ? 'Save modifications' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Import Blogs Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportStatus('');
          setParsedImportBlogs([]);
        }}
        title="Import Articles (Bulk JSON or Single Markdown)"
        size="md"
      >
        <div className="space-y-5 text-left text-xs">
          <p className="text-brand-text-muted leading-relaxed">
            Upload articles dynamically by providing a <code className="px-1.5 py-0.5 bg-brand-bg rounded border border-brand-border-white font-mono text-[10px]">.json</code> file (containing an array of blog posts) or a single <code className="px-1.5 py-0.5 bg-brand-bg rounded border border-brand-border-white font-mono text-[10px]">.md</code> file with optional frontmatter headers.
          </p>

          <div className="relative border-2 border-dashed border-brand-accent/30 hover:border-brand-accent transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center bg-brand-card-dark cursor-pointer group">
            <input
              type="file"
              accept=".json,.md"
              onChange={handleImportFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Globe className="w-8 h-8 text-brand-accent group-hover:scale-110 transition-transform mb-2" />
            <span className="font-bold text-white text-[11px] block">Drag and drop file here, or click to browse</span>
            <span className="text-[9px] text-brand-text-muted mt-1">Supports .json arrays or .md files</span>
          </div>

          {importStatus && (
            <div className={`p-4 rounded-xl border text-[11px] leading-relaxed ${
              importStatus.startsWith('Error')
                ? 'bg-red-500/10 border-red-500/25 text-red-400'
                : 'bg-brand-accent/10 border-brand-accent/25 text-brand-accent font-semibold'
            }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{importStatus}</span>
              </div>
            </div>
          )}

          {parsedImportBlogs.length > 0 && (
            <div className="p-3 bg-brand-bg rounded-lg border border-brand-border-white max-h-[150px] overflow-y-auto space-y-1 text-[10px]">
              <span className="font-bold text-white uppercase text-[9px] block mb-1">Parsed articles preview:</span>
              {parsedImportBlogs.map((b: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-brand-border-white last:border-0 text-brand-text-muted">
                  <span className="font-medium text-white truncate max-w-[200px]">{b.title}</span>
                  <span className="px-1.5 py-0.2 bg-brand-card-light rounded text-[8px] font-bold uppercase tracking-wider">{b.category}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-brand-border-white flex justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportStatus('');
                setParsedImportBlogs([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={parsedImportBlogs.length === 0}
              onClick={handleConfirmImport}
            >
              Confirm Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Message Inbox modal */}
      <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} title="Inbox: Contact Message details" size="md">
        {activeMessage && (
          <div className="space-y-5 text-xs text-brand-text-muted">
            <div className="grid grid-cols-2 gap-4 border-b border-brand-border-white pb-3">
              <div>
                <p className="text-[9px] uppercase font-bold text-brand-accent">SENDER</p>
                <p className="font-bold text-white mt-1">{activeMessage.name}</p>
                <p className="text-[10px] text-brand-text-muted mt-0.5">{activeMessage.email}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-brand-accent">SUBMITTED ON</p>
                <p className="font-bold text-white mt-1">{new Date(activeMessage.date).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-brand-accent">SUBJECT</p>
              <p className="text-white font-bold mt-1 text-sm">{activeMessage.subject}</p>
            </div>
            <div className="p-4 bg-brand-card-dark rounded-xl border border-brand-border-white leading-relaxed text-white">
              {activeMessage.message}
            </div>

            {/* Existing reply display */}
            {activeMessage.replyMessage && (
              <div className="border-t border-brand-border-white pt-4">
                <p className="text-[9px] uppercase font-bold text-green-400">YOUR REPLY</p>
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl mt-1.5 leading-relaxed">
                  {activeMessage.replyMessage}
                </div>
                {activeMessage.repliedAt && (
                  <p className="text-[8px] text-brand-text-muted mt-1">Replied on: {new Date(activeMessage.repliedAt).toLocaleString()}</p>
                )}
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleReplySubmit} className="space-y-3 mt-4 border-t border-brand-border-white pt-4">
              <label className="text-[9px] uppercase font-bold text-brand-accent block">
                {activeMessage.replyMessage ? 'Update Reply' : 'Reply to Message'}
              </label>
              <textarea
                placeholder="Write your response to the user..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all resize-none"
                rows={4}
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="submit" variant="primary" size="sm" isLoading={isActionLoading}>
                  {activeMessage.replyMessage ? 'Update Reply' : 'Send Reply'}
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-brand-border-white flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setIsMessageModalOpen(false)}>
                Close Message
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation overlay */}
      <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmAction} title={confirmTitle} message={confirmMsg} isDanger={true} />

      <Footer />
    </>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex-grow pt-32 pb-20 flex items-center justify-center bg-brand-bg min-h-screen">
        <LoadingState message="Connecting to secure admin gateway..." />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
