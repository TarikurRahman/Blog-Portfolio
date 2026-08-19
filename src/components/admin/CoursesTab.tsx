'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { 
  Plus, Edit, Trash2, BookOpen, Clock, FileText, Check, X, 
  Search, RefreshCw, Upload, Eye, UserCheck, ShieldAlert, Settings, DollarSign 
} from 'lucide-react';
import Button from '../Button';
import Card from '../Card';
import Modal from '../Modal';
import ConfirmDialog from '../ConfirmDialog';
import EmptyState from '../EmptyState';
import TableSkeleton from '../skeletons/TableSkeleton';

type CourseSubmenu = 'courses' | 'curriculum' | 'orders' | 'enrollments' | 'settings';

export default function CoursesTab() {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<CourseSubmenu>('courses');

  // Common Loading states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // DB Lists
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Selection states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Search & Filter
  const [courseSearch, setCourseSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [enrollmentSearch, setEnrollmentSearch] = useState('');

  // Modal controls
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [activeCourse, setActiveCourse] = useState<any>(null);

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<any>(null);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  // Confirmation controls
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});

  // Form Fields - Course
  const [cTitle, setCTitle] = useState('');
  const [cShortDesc, setCShortDesc] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cThumb, setCThumb] = useState('');
  const [cBanner, setCBanner] = useState('');
  const [cPrice, setCPrice] = useState(0);
  const [cSalePrice, setCSalePrice] = useState('');
  const [cCategory, setCCategory] = useState('Web Development');
  const [cLevel, setCLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [cStatus, setCStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [cIsFeatured, setCIsFeatured] = useState(false);
  const [cShowHome, setCShowHome] = useState(true);
  const [cBadge, setCBadge] = useState<'none' | 'new' | 'bestseller' | 'featured'>('none');
  const [cLearn, setCLearn] = useState('');
  const [cReqs, setCReqs] = useState('');
  const [cSeoTitle, setCSeoTitle] = useState('');
  const [cSeoDesc, setCSeoDesc] = useState('');

  // Form Fields - Module
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mOrder, setMOrder] = useState(0);

  // Form Fields - Lesson
  const [lTitle, setLTitle] = useState('');
  const [lDesc, setLDesc] = useState('');
  const [lYoutube, setLYoutube] = useState('');
  const [lDuration, setLDuration] = useState(10);
  const [lIsPreview, setLIsPreview] = useState(false);
  const [lResources, setLResources] = useState('');
  const [lOrder, setLOrder] = useState(0);
  const [lStatus, setLStatus] = useState<'draft' | 'published'>('draft');

  // Form Fields - Manual Enrollment
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');

  // Form Fields - Settings
  const [sHomeTitle, setSHomeTitle] = useState('');
  const [sHomeSubtitle, setSHomeSubtitle] = useState('');
  const [sHomeImage, setSHomeImage] = useState('');
  const [sHomeCtaText, setSHomeCtaText] = useState('');
  const [sHomeCtaLink, setSHomeCtaLink] = useState('');
  const [sPaymentInstructions, setSPaymentInstructions] = useState('');
  const [sSupportContact, setSSupportContact] = useState('');
  const [sShowSectionHome, setSShowSectionHome] = useState(true);
  
  // Payment methods list inside Settings
  const [paymentMethods, setPaymentMethods] = useState<any[]>([
    { name: 'bKash', details: '', status: 'active' },
    { name: 'Nagad', details: '', status: 'active' }
  ]);

  // Loading image indicators
  const [uploadingImage, setUploadingImage] = useState<string | null>(null); // 'thumbnail' | 'banner' | 'homeImage'

  useEffect(() => {
    loadTabDetails();
  }, [activeSubTab]);

  const loadTabDetails = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'courses') {
        const res = await fetch('/api/admin/courses');
        const json = await res.json();
        if (json.success) setCourses(json.data || []);
      } else if (activeSubTab === 'curriculum') {
        const res = await fetch('/api/admin/courses');
        const json = await res.json();
        if (json.success) {
          const coursesList = json.data || [];
          setCourses(coursesList);
          if (coursesList.length > 0 && !selectedCourseId) {
            setSelectedCourseId(coursesList[0].id);
          }
        }
      } else if (activeSubTab === 'orders') {
        const res = await fetch('/api/admin/course-orders');
        const json = await res.json();
        if (json.success) setOrders(json.data || []);
      } else if (activeSubTab === 'enrollments') {
        const res = await fetch('/api/admin/course-enrollments');
        const json = await res.json();
        if (json.success) setEnrollments(json.data || []);
        
        const resCourses = await fetch('/api/admin/courses');
        const jsonCourses = await resCourses.json();
        if (jsonCourses.success) setCourses(jsonCourses.data || []);
      } else if (activeSubTab === 'settings') {
        const res = await fetch('/api/course-settings');
        const json = await res.json();
        if (json.success && json.data) {
          const s = json.data;
          setSettings(s);
          setSHomeTitle(s.homeBannerTitle || '');
          setSHomeSubtitle(s.homeBannerSubtitle || '');
          setSHomeImage(s.homeBannerImageUrl || '');
          setSHomeCtaText(s.homeBannerCtaText || '');
          setSHomeCtaLink(s.homeBannerCtaLink || '');
          setSPaymentInstructions(s.paymentInstructions || '');
          setSSupportContact(s.supportContact || '');
          setSShowSectionHome(s.showCourseSectionOnHome !== false);
          if (s.paymentMethods && s.paymentMethods.length > 0) {
            setPaymentMethods(s.paymentMethods);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load courses admin data:', err);
      showToast('Error fetching data from API gateway', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId && activeSubTab === 'curriculum') {
      loadModulesAndLessons(selectedCourseId);
    }
  }, [selectedCourseId, activeSubTab]);

  const loadModulesAndLessons = async (courseId: string) => {
    try {
      const resMod = await fetch(`/api/admin/course-modules?courseId=${courseId}`);
      const jsonMod = await resMod.json();
      if (jsonMod.success) {
        const mods = jsonMod.data || [];
        setModules(mods);
        if (mods.length > 0) {
          setSelectedModuleId(mods[0].id);
        } else {
          setSelectedModuleId('');
        }
      }

      const resLes = await fetch(`/api/admin/course-lessons?courseId=${courseId}`);
      const jsonLes = await resLes.json();
      if (jsonLes.success) setLessons(jsonLes.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load course curriculum structures', 'error');
    }
  };

  // Image Upload handler
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'thumbnail' | 'banner' | 'homeImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(targetField);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'course');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.success && json.data) {
        const url = json.data.fileUrl;
        if (targetField === 'thumbnail') setCThumb(url);
        else if (targetField === 'banner') setCBanner(url);
        else if (targetField === 'homeImage') setSHomeImage(url);
        showToast('Image uploaded successfully to Cloudinary', 'success');
      } else {
        showToast(json.message || 'Upload failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(null);
    }
  };

  // Add/Edit Course Handlers
  const openCourseModal = (course: any = null) => {
    if (course) {
      setActiveCourse(course);
      setCTitle(course.title);
      setCShortDesc(course.shortDescription);
      setCDesc(course.description);
      setCThumb(course.thumbnailUrl);
      setCBanner(course.bannerUrl || '');
      setCPrice(course.price);
      setCSalePrice(course.salePrice !== undefined ? String(course.salePrice) : '');
      setCCategory(course.category);
      setCLevel(course.level);
      setCStatus(course.status);
      setCIsFeatured(course.isFeatured || false);
      setCShowHome(course.showOnHome !== false);
      setCBadge(course.badge || 'none');
      setCLearn(course.whatYouWillLearn?.join('\n') || '');
      setCReqs(course.requirements?.join('\n') || '');
      setCSeoTitle(course.seoTitle || '');
      setCSeoDesc(course.seoDescription || '');
    } else {
      setActiveCourse(null);
      setCTitle('');
      setCShortDesc('');
      setCDesc('');
      setCThumb('');
      setCBanner('');
      setCPrice(0);
      setCSalePrice('');
      setCCategory('Web Development');
      setCLevel('beginner');
      setCStatus('draft');
      setCIsFeatured(false);
      setCShowHome(true);
      setCBadge('none');
      setCLearn('');
      setCReqs('');
      setCSeoTitle('');
      setCSeoDesc('');
    }
    setCourseModalOpen(true);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cTitle || !cShortDesc || !cDesc || !cThumb) {
      showToast('Please fill in all required course fields.', 'error');
      return;
    }

    const courseData = {
      title: cTitle,
      shortDescription: cShortDesc,
      description: cDesc,
      thumbnailUrl: cThumb,
      bannerUrl: cBanner,
      price: cPrice,
      salePrice: cSalePrice !== '' ? Number(cSalePrice) : undefined,
      category: cCategory,
      level: cLevel,
      status: cStatus,
      isFeatured: cIsFeatured,
      showOnHome: cShowHome,
      badge: cBadge,
      whatYouWillLearn: cLearn.split('\n').map(l => l.trim()).filter(Boolean),
      requirements: cReqs.split('\n').map(r => r.trim()).filter(Boolean),
      seoTitle: cSeoTitle || cTitle,
      seoDescription: cSeoDesc || cShortDesc,
    };

    setActionLoading(true);
    try {
      let res;
      if (activeCourse) {
        res = await fetch(`/api/admin/courses/${activeCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData)
        });
      } else {
        res = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData)
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(activeCourse ? 'Course updated successfully' : 'Course created successfully', 'success');
        setCourseModalOpen(false);
        loadTabDetails();
      } else {
        showToast(json.message || 'Failed to save course', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error while saving course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const triggerDeleteCourse = (id: string, title: string) => {
    setConfirmTitle('Delete Course');
    setConfirmMessage(`Are you sure you want to delete course "${title}"? All associated modules and lessons will be deleted.`);
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`/api/admin/courses/${id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
          showToast('Course and curriculum deleted successfully', 'success');
          loadTabDetails();
        } else {
          showToast(json.message || 'Failed to delete course', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to delete course', 'error');
      }
    });
    setConfirmOpen(true);
  };

  // Module Handlers
  const openModuleModal = (module: any = null) => {
    if (module) {
      setActiveModule(module);
      setMTitle(module.title);
      setMDesc(module.description || '');
      setMOrder(module.order);
    } else {
      setActiveModule(null);
      setMTitle('');
      setMDesc('');
      setMOrder(modules.length);
    }
    setModuleModalOpen(true);
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle) {
      showToast('Module title is required.', 'error');
      return;
    }

    const modData = {
      courseId: selectedCourseId,
      title: mTitle,
      description: mDesc,
      order: mOrder
    };

    setActionLoading(true);
    try {
      let res;
      if (activeModule) {
        res = await fetch(`/api/admin/course-modules/${activeModule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modData)
        });
      } else {
        res = await fetch('/api/admin/course-modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modData)
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(activeModule ? 'Module updated successfully' : 'Module created successfully', 'success');
        setModuleModalOpen(false);
        loadModulesAndLessons(selectedCourseId);
      } else {
        showToast(json.message || 'Failed to save module', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const triggerDeleteModule = (id: string, title: string) => {
    setConfirmTitle('Delete Module');
    setConfirmMessage(`Are you sure you want to delete module "${title}"? All lessons in this module will be deleted.`);
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`/api/admin/course-modules/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          showToast('Module and lessons deleted successfully', 'success');
          loadModulesAndLessons(selectedCourseId);
        } else {
          showToast(json.message || 'Failed to delete module', 'error');
        }
      } catch (err) {
        console.error(err);
      }
    });
    setConfirmOpen(true);
  };

  // Lesson Handlers
  const openLessonModal = (lesson: any = null, targetModuleId?: string) => {
    if (lesson) {
      setActiveLesson(lesson);
      setSelectedModuleId(lesson.moduleId);
      setLTitle(lesson.title);
      setLDesc(lesson.description || '');
      setLYoutube(lesson.youtubeVideoId);
      setLDuration(lesson.durationMinutes);
      setLIsPreview(lesson.isPreview || false);
      setLResources(lesson.resources || '');
      setLOrder(lesson.order);
      setLStatus(lesson.status || 'draft');
    } else {
      setActiveLesson(null);
      if (targetModuleId) setSelectedModuleId(targetModuleId);
      setLTitle('');
      setLDesc('');
      setLYoutube('');
      setLDuration(10);
      setLIsPreview(false);
      setLResources('');
      setLOrder(lessons.filter(l => l.moduleId === (targetModuleId || selectedModuleId)).length);
      setLStatus('draft');
    }
    setLessonModalOpen(true);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lTitle || !lYoutube || !selectedModuleId) {
      showToast('Title, module selection and YouTube URL/ID are required.', 'error');
      return;
    }

    const lessonData = {
      courseId: selectedCourseId,
      moduleId: selectedModuleId,
      title: lTitle,
      description: lDesc,
      youtubeUrlOrId: lYoutube,
      durationMinutes: lDuration,
      isPreview: lIsPreview,
      resources: lResources,
      order: lOrder,
      status: lStatus
    };

    setActionLoading(true);
    try {
      let res;
      if (activeLesson) {
        res = await fetch(`/api/admin/course-lessons/${activeLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData)
        });
      } else {
        res = await fetch('/api/admin/course-lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData)
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(activeLesson ? 'Lesson updated successfully' : 'Lesson created successfully', 'success');
        setLessonModalOpen(false);
        loadModulesAndLessons(selectedCourseId);
      } else {
        showToast(json.message || 'Failed to save lesson', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const triggerDeleteLesson = (id: string, title: string) => {
    setConfirmTitle('Delete Lesson');
    setConfirmMessage(`Are you sure you want to delete lesson "${title}"?`);
    setConfirmAction(() => async () => {
      try {
        const res = await fetch(`/api/admin/course-lessons/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          showToast('Lesson deleted successfully', 'success');
          loadModulesAndLessons(selectedCourseId);
        } else {
          showToast(json.message || 'Failed to delete lesson', 'error');
        }
      } catch (err) {
        console.error(err);
      }
    });
    setConfirmOpen(true);
  };

  // Order Approval Handlers
  const handleOrderStatusUpdate = async (orderId: string, orderStatus: 'approved' | 'rejected', paymentStatus: 'paid' | 'rejected') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/course-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, paymentStatus, adminNote: 'Verified manually by system admin.' })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Order status updated to ${orderStatus} successfully`, 'success');
        setOrderModalOpen(false);
        loadTabDetails();
      } else {
        showToast(json.message || 'Failed to update order status', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Manual Enrollment Handlers
  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollEmail || !enrollCourseId) {
      showToast('Please enter both student email and course selection.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/course-enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: enrollEmail, courseId: enrollCourseId })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Student enrolled successfully', 'success');
        setEnrollModalOpen(false);
        setEnrollEmail('');
        loadTabDetails();
      } else {
        showToast(json.message || 'Manual enrollment failed', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnrollmentRevoke = async (enrollmentId: string, status: 'revoked' | 'active') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/course-enrollments/${enrollmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessStatus: status })
      });
      const json = await res.json();
      if (json.success) {
        showToast(status === 'revoked' ? 'Enrollment revoked successfully' : 'Enrollment restored successfully', 'success');
        loadTabDetails();
      } else {
        showToast(json.message || 'Failed to update enrollment status', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Course Settings submit
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const settingsData = {
      homeBannerTitle: sHomeTitle,
      homeBannerSubtitle: sHomeSubtitle,
      homeBannerImageUrl: sHomeImage,
      homeBannerCtaText: sHomeCtaText,
      homeBannerCtaLink: sHomeCtaLink,
      paymentInstructions: sPaymentInstructions,
      supportContact: sSupportContact,
      showCourseSectionOnHome: sShowSectionHome,
      paymentMethods
    };

    setActionLoading(true);
    try {
      const res = await fetch('/api/course-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      const json = await res.json();
      if (json.success) {
        showToast('Settings saved successfully', 'success');
        loadTabDetails();
      } else {
        showToast(json.message || 'Failed to save settings', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter computations
  const filteredCourses = courses.filter(c => 
    !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase()) || c.category.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    !orderSearch || 
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) || 
    o.user.email.toLowerCase().includes(orderSearch.toLowerCase()) || 
    o.course.title.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e => 
    !enrollmentSearch || 
    e.user.email.toLowerCase().includes(enrollmentSearch.toLowerCase()) || 
    e.course.title.toLowerCase().includes(enrollmentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap border-b border-brand-border-white mb-6">
        {[
          { id: 'courses', label: 'All Courses' },
          { id: 'curriculum', label: 'Curriculum & Lessons' },
          { id: 'orders', label: 'Course Orders' },
          { id: 'enrollments', label: 'Enrollments' },
          { id: 'settings', label: 'Course Settings' }
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => setActiveSubTab(subTab.id as CourseSubmenu)}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeSubTab === subTab.id ? 'border-brand-accent text-brand-accent' : 'border-transparent text-brand-text-muted hover:text-white'
            }`}
          >
            {subTab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <>
          {/* SUBTAB 1: ALL COURSES */}
          {activeSubTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-card/45 p-4 rounded-xl border border-brand-border-white/5">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white placeholder:text-brand-text-muted focus:outline-none"
                  />
                </div>
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openCourseModal()}>
                  Add Course
                </Button>
              </div>

              {filteredCourses.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                        <th className="p-4">Thumbnail</th>
                        <th className="p-4">Title</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Level</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                      {filteredCourses.map((c) => (
                        <tr key={c.id} className="hover:bg-brand-card-light/40 transition-colors">
                          <td className="p-4">
                            <div className="w-12 aspect-video rounded overflow-hidden border border-brand-border-white/20">
                              <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-white">{c.title}</td>
                          <td className="p-4">
                            {c.salePrice ? (
                              <div>
                                <p className="text-white font-bold">৳{c.salePrice}</p>
                                <p className="text-[9px] line-through">৳{c.price}</p>
                              </div>
                            ) : (
                              <p className="text-white font-bold">{c.price === 0 ? 'Free' : `৳${c.price}`}</p>
                            )}
                          </td>
                          <td className="p-4">{c.category}</td>
                          <td className="p-4 uppercase">{c.level}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'published' ? 'bg-green-500/10 text-green-400' :
                              c.status === 'draft' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button
                              title="Curriculum"
                              className="p-1.5 text-brand-accent hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer"
                              onClick={() => { setSelectedCourseId(c.id); setActiveSubTab('curriculum'); }}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Edit"
                              className="p-1.5 text-blue-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer"
                              onClick={() => openCourseModal(c)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Delete"
                              className="p-1.5 text-red-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer"
                              onClick={() => triggerDeleteCourse(c.id, c.title)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No Courses Available" message="Start by creating a course to show up here." />
              )}
            </div>
          )}

          {/* SUBTAB 2: CURRICULUM & LESSONS */}
          {activeSubTab === 'curriculum' && (
            <div className="space-y-6 text-left">
              {/* Select Course dropdown selector */}
              <div className="bg-brand-card/45 p-4 rounded-xl border border-brand-border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 w-full sm:w-72">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">Target Course</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none"
                  >
                    <option value="" disabled>Select Course...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                {selectedCourseId && (
                  <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openModuleModal()}>
                    Add Module
                  </Button>
                )}
              </div>

              {selectedCourseId && (
                <div className="space-y-6">
                  {modules.length > 0 ? (
                    modules.map((m) => {
                      const moduleLessons = lessons.filter(l => l.moduleId === m.id);

                      return (
                        <div key={m.id} className="border border-brand-border-white rounded-xl bg-brand-card-dark/15 overflow-hidden">
                          {/* Module Header Bar */}
                          <div className="bg-brand-card-dark/40 px-4 py-3 border-b border-brand-border-white flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-bold text-brand-accent uppercase tracking-wider">Module {m.order + 1}</span>
                              <h3 className="text-sm font-bold text-white leading-tight">{m.title}</h3>
                              {m.description && <p className="text-[10px] text-brand-text-muted mt-0.5">{m.description}</p>}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button variant="outline" size="sm" className="py-1 px-2 text-[10px]" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => openLessonModal(null, m.id)}>
                                Add Lesson
                              </Button>
                              <button className="p-1 text-blue-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => openModuleModal(m)}>
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1 text-red-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => triggerDeleteModule(m.id, m.title)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Lessons inside Module */}
                          <div className="divide-y divide-brand-border-white/5 bg-brand-card/5">
                            {moduleLessons.length > 0 ? (
                              moduleLessons.map((l) => (
                                <div key={l.id} className="p-4 flex items-center justify-between hover:bg-brand-card-light/10 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-brand-text-muted shrink-0" />
                                    <div>
                                      <p className="text-xs font-semibold text-white leading-snug">{l.title}</p>
                                      <div className="flex items-center gap-2 mt-1 text-[9px] text-brand-text-muted font-medium">
                                        <span>{l.durationMinutes} minutes</span>
                                        <span>•</span>
                                        <span className="uppercase">{l.status}</span>
                                        {l.isPreview && (
                                          <>
                                            <span>•</span>
                                            <span className="text-green-400 font-bold uppercase">Free Preview</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button className="p-1.5 text-blue-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => openLessonModal(l)}>
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-1.5 text-red-400 hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer" onClick={() => triggerDeleteLesson(l.id, l.title)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-xs text-brand-text-muted">
                                No lessons added to this module yet.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyState title="No Modules Created" message="Create modules first to start organizing lessons." />
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 3: COURSE ORDERS */}
          {activeSubTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4 bg-brand-card/45 p-4 rounded-xl border border-brand-border-white/5">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted" />
                  <input
                    type="text"
                    placeholder="Search by order, email, course..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white placeholder:text-brand-text-muted focus:outline-none"
                  />
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                        <th className="p-4">Order #</th>
                        <th className="p-4">Student</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-brand-card-light/40 transition-colors">
                          <td className="p-4 font-bold text-white">{o.orderNumber}</td>
                          <td className="p-4">
                            <p className="text-white font-semibold">{o.user?.name || 'Unknown'}</p>
                            <p className="text-[10px]">{o.user?.email}</p>
                          </td>
                          <td className="p-4 text-white font-semibold">{o.course?.title || 'Unknown'}</td>
                          <td className="p-4">
                            <p className="text-white font-bold">৳{o.amount}</p>
                            <p className="text-[10px] uppercase">{o.paymentMethod}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              o.orderStatus === 'approved' ? 'bg-green-500/10 text-green-400' :
                              o.orderStatus === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              title="Review details"
                              className="p-1.5 text-brand-accent hover:text-white bg-brand-card rounded border border-brand-border-white cursor-pointer"
                              onClick={() => { setActiveOrder(o); setOrderModalOpen(true); }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No Orders Registered" message="No user course purchase requests found." />
              )}
            </div>
          )}

          {/* SUBTAB 4: ENROLLMENTS */}
          {activeSubTab === 'enrollments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-brand-card/45 p-4 rounded-xl border border-brand-border-white/5">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-text-muted" />
                  <input
                    type="text"
                    placeholder="Search by student email, course..."
                    value={enrollmentSearch}
                    onChange={(e) => setEnrollmentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white placeholder:text-brand-text-muted focus:outline-none"
                  />
                </div>
                <Button variant="primary" size="sm" leftIcon={<UserCheck className="w-4 h-4" />} onClick={() => { setEnrollEmail(''); setEnrollCourseId(courses[0]?.id || ''); setEnrollModalOpen(true); }}>
                  Manual Enrollment
                </Button>
              </div>

              {filteredEnrollments.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-brand-border-white shadow">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-brand-card-dark text-white font-bold border-b border-brand-border-white">
                        <th className="p-4">Student</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Access status</th>
                        <th className="p-4">Enrolled date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border-white text-brand-text-muted">
                      {filteredEnrollments.map((e) => (
                        <tr key={e.id} className="hover:bg-brand-card-light/40 transition-colors">
                          <td className="p-4">
                            <p className="text-white font-semibold">{e.user?.name || 'Unknown'}</p>
                            <p className="text-[10px]">{e.user?.email}</p>
                          </td>
                          <td className="p-4 text-white font-semibold">{e.course?.title || 'Unknown'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              e.accessStatus === 'active' ? 'bg-green-500/10 text-green-400' :
                              e.accessStatus === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {e.accessStatus}
                            </span>
                          </td>
                          <td className="p-4">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            {e.accessStatus === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="py-1 px-3 text-[10px] text-red-400 hover:bg-red-500/10 border-red-500/25"
                                onClick={() => handleEnrollmentRevoke(e.id, 'revoked')}
                              >
                                Revoke Access
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                className="py-1 px-3 text-[10px]"
                                onClick={() => handleEnrollmentRevoke(e.id, 'active')}
                              >
                                Restore Access
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No Active Learners" message="No active course enrollments registered." />
              )}
            </div>
          )}

          {/* SUBTAB 5: SETTINGS */}
          {activeSubTab === 'settings' && (
            <Card hoverEffect={false} className="p-6 border border-brand-border-white bg-brand-card-dark/25 text-left">
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                {/* Banner Settings */}
                <div className="border-b border-brand-border-white pb-5">
                  <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">1. Homepage Banner Config</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">Banner Title</label>
                      <input type="text" value={sHomeTitle} onChange={e => setSHomeTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">Banner Subtitle</label>
                      <input type="text" value={sHomeSubtitle} onChange={e => setSHomeSubtitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">CTA Text</label>
                      <input type="text" value={sHomeCtaText} onChange={e => setSHomeCtaText(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">CTA Link</label>
                      <input type="text" value={sHomeCtaLink} onChange={e => setSHomeCtaLink(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
                    </div>
                  </div>

                  {/* Banner Image Custom Upload */}
                  <div className="space-y-1.5 bg-brand-card-dark p-4 rounded-xl border border-brand-border-white max-w-xl mb-4">
                    <label className="text-[10px] font-bold text-white block">Banner Cover Image</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {sHomeImage && (
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-brand-border shrink-0">
                          <img src={sHomeImage} alt="Banner Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-grow w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadImage(e, 'homeImage')}
                          className="w-full text-xs text-brand-text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-brand-accent file:text-white file:cursor-pointer"
                        />
                        {uploadingImage === 'homeImage' && <p className="text-[10px] text-brand-accent mt-1 animate-pulse">Uploading to Cloudinary...</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="showHome" checked={sShowSectionHome} onChange={e => setSShowSectionHome(e.target.checked)} className="rounded text-brand-accent focus:ring-brand-accent bg-brand-card-dark border-brand-border-white/20" />
                    <label htmlFor="showHome" className="text-[10px] font-bold text-white">Show Enrollment Banner & Course section on Homepage</label>
                  </div>
                </div>

                {/* Manual Banking Info */}
                <div className="border-b border-brand-border-white pb-5">
                  <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">2. Checkout Payment Instructions</h3>
                  <div className="space-y-1.5 mb-4">
                    <label className="text-[10px] font-bold text-white">Instructions Text</label>
                    <textarea value={sPaymentInstructions} onChange={e => setSPaymentInstructions(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paymentMethods.map((pm, idx) => (
                      <div key={pm.name} className="space-y-1 bg-brand-card-dark/40 p-4 rounded-xl border border-brand-border-white/5">
                        <label className="text-[10px] font-bold text-white uppercase">{pm.name} Details</label>
                        <input
                          type="text"
                          value={pm.details}
                          onChange={(e) => {
                            const updated = [...paymentMethods];
                            updated[idx].details = e.target.value;
                            setPaymentMethods(updated);
                          }}
                          placeholder={`e.g. Personal Wallet: 017xxxxxxxx`}
                          className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support contact info */}
                <div>
                  <h3 className="text-xs font-bold text-brand-accent uppercase mb-4">3. Support Desk</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">Support Email / Contact Link</label>
                      <input type="text" value={sSupportContact} onChange={e => setSSupportContact(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" placeholder="support@tarikurrahman.com" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border-white/5 flex justify-end">
                  <Button variant="primary" size="md" type="submit" isLoading={actionLoading} leftIcon={<Settings className="w-4 h-4" />}>
                    Save Settings
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </>
      )}

      {/* -------------------- MODALS & POPUPS -------------------- */}

      {/* Course Add/Edit Modal */}
      <Modal isOpen={courseModalOpen} onClose={() => setCourseModalOpen(false)} title={activeCourse ? 'Edit Course details' : 'Add new Course'} size="lg">
        <form onSubmit={handleCourseSubmit} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Course Title *</label>
              <input type="text" value={cTitle} onChange={e => setCTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Category *</label>
              <input type="text" value={cCategory} onChange={e => setCCategory(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Short Description *</label>
            <input type="text" value={cShortDesc} onChange={e => setCShortDesc(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Full Description *</label>
            <textarea value={cDesc} onChange={e => setCDesc(e.target.value)} rows={4} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Price (৳) *</label>
              <input type="number" value={cPrice} onChange={e => setCPrice(Number(e.target.value))} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Sale Price (৳ - Optional)</label>
              <input type="number" value={cSalePrice} onChange={e => setCSalePrice(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Course Level *</label>
              <select value={cLevel} onChange={e => setCLevel(e.target.value as any)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Publish Status *</label>
              <select value={cStatus} onChange={e => setCStatus(e.target.value as any)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Card Badge</label>
              <select value={cBadge} onChange={e => setCBadge(e.target.value as any)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                <option value="none">None</option>
                <option value="new">New</option>
                <option value="bestseller">Bestseller</option>
                <option value="featured">Featured</option>
              </select>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-1.5">
                <input type="checkbox" id="cIsFeatured" checked={cIsFeatured} onChange={e => setCIsFeatured(e.target.checked)} className="rounded text-brand-accent bg-brand-card-dark border-brand-border-white/20" />
                <label htmlFor="cIsFeatured" className="text-[10px] font-bold text-white">Featured</label>
              </div>
              <div className="flex items-center gap-1.5">
                <input type="checkbox" id="cShowHome" checked={cShowHome} onChange={e => setCShowHome(e.target.checked)} className="rounded text-brand-accent bg-brand-card-dark border-brand-border-white/20" />
                <label htmlFor="cShowHome" className="text-[10px] font-bold text-white">Show on Home</label>
              </div>
            </div>
          </div>

          {/* Cloudinary Thumbnail Upload */}
          <div className="space-y-1.5 bg-brand-card-dark p-4 rounded-xl border border-brand-border-white">
            <label className="text-[10px] font-bold text-white block">Course Thumbnail Image * (Square/Landscape)</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {cThumb && (
                <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-brand-border shrink-0">
                  <img src={cThumb} alt="Course Thumbnail Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadImage(e, 'thumbnail')}
                  className="w-full text-xs text-brand-text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-brand-accent file:text-white file:cursor-pointer"
                />
                {uploadingImage === 'thumbnail' && <p className="text-[10px] text-brand-accent mt-1 animate-pulse">Uploading image to secure storage...</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">What You Will Learn (One item per line)</label>
              <textarea value={cLearn} onChange={e => setCLearn(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" placeholder="e.g. Master React 19 hooks&#10;Build full-stack Next.js APIS" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Requirements (One item per line)</label>
              <textarea value={cReqs} onChange={e => setCReqs(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" placeholder="e.g. Basic Javascript knowledge&#10;Node.js installed locally" />
            </div>
          </div>

          <div className="border-t border-brand-border-white/10 pt-4">
            <p className="text-[10px] font-bold text-brand-accent uppercase mb-2">Search Engine Optimization (SEO)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white">SEO Title</label>
                <input type="text" value={cSeoTitle} onChange={e => setCSeoTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white">SEO Meta Description</label>
                <input type="text" value={cSeoDesc} onChange={e => setCSeoDesc(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-brand-border-white flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={actionLoading}>
              {activeCourse ? 'Save course details' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Module Add/Edit Modal */}
      <Modal isOpen={moduleModalOpen} onClose={() => setModuleModalOpen(false)} title={activeModule ? 'Edit Module' : 'Add new Module'} size="md">
        <form onSubmit={handleModuleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Module Title *</label>
            <input type="text" value={mTitle} onChange={e => setMTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Short Description</label>
            <input type="text" value={mDesc} onChange={e => setMDesc(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Module Display Order</label>
            <input type="number" value={mOrder} onChange={e => setMOrder(Number(e.target.value))} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
          </div>

          <div className="pt-3 border-t border-brand-border-white flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setModuleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={actionLoading}>
              Save Module
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lesson Add/Edit Modal */}
      <Modal isOpen={lessonModalOpen} onClose={() => setLessonModalOpen(false)} title={activeLesson ? 'Edit Lesson' : 'Add Lesson'} size="lg">
        <form onSubmit={handleLessonSubmit} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Lesson Title *</label>
              <input type="text" value={lTitle} onChange={e => setLTitle(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Module Location *</label>
              <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Lesson Short Description</label>
            <input type="text" value={lDesc} onChange={e => setLDesc(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-white">YouTube URL or 11-char Video ID *</label>
              <input type="text" value={lYoutube} onChange={e => setLYoutube(e.target.value)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Duration (Minutes) *</label>
              <input type="number" value={lDuration} onChange={e => setLDuration(Number(e.target.value))} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Status *</label>
              <select value={lStatus} onChange={e => setLStatus(e.target.value as any)} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white">
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white">Display Order</label>
              <input type="number" value={lOrder} onChange={e => setLOrder(Number(e.target.value))} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white" />
            </div>
            <div className="flex items-center gap-1.5 pt-4">
              <input type="checkbox" id="lIsPreview" checked={lIsPreview} onChange={e => setLIsPreview(e.target.checked)} className="rounded text-brand-accent bg-brand-card-dark border-brand-border-white/20" />
              <label htmlFor="lIsPreview" className="text-[10px] font-bold text-white">Free Preview Lesson</label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Lesson Resources (Markdown text/links)</label>
            <textarea value={lResources} onChange={e => setLResources(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white resize-none" placeholder="e.g. GitHub link: [Repo](url)&#10;Download PDF: [Slides](url)" />
          </div>

          <div className="pt-3 border-t border-brand-border-white flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setLessonModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={actionLoading}>
              Save Lesson
            </Button>
          </div>
        </form>
      </Modal>

      {/* Order Review Modal */}
      <Modal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} title="Verify Manual Course Payment" size="md">
        {activeOrder && (
          <div className="space-y-5 text-left text-xs">
            <div className="bg-brand-card-dark/45 p-4 rounded-xl border border-brand-border-white/5 space-y-2.5">
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Order #</p>
                <p className="text-white font-bold text-sm">{activeOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Student Details</p>
                <p className="text-white font-semibold">{activeOrder.user.name}</p>
                <p className="text-brand-text-muted font-medium">{activeOrder.user.email}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Course Purchased</p>
                <p className="text-white font-semibold">{activeOrder.course.title}</p>
              </div>
              <div>
                <p className="text-[9px] text-brand-text-muted uppercase">Payment Breakdown</p>
                <p className="text-white font-bold text-sm">৳{activeOrder.amount}</p>
                <p className="text-brand-text-muted font-medium">Gateway Method: <span className="uppercase text-white font-semibold">{activeOrder.paymentMethod}</span></p>
                {activeOrder.transactionId && (
                  <p className="text-brand-text-muted font-medium mt-1">Transaction ID: <span className="text-white font-mono bg-brand-card-dark px-1.5 py-0.5 rounded border border-brand-border-white/10">{activeOrder.transactionId}</span></p>
                )}
              </div>
            </div>

            {/* Clickable Screenshot Preview */}
            {activeOrder.paymentScreenshotUrl ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-white">Payment Proof Screenshot</p>
                <a href={activeOrder.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="block relative aspect-video w-full rounded-xl overflow-hidden border border-brand-border-white hover:border-brand-accent/50 transition-colors shadow">
                  <img src={activeOrder.paymentScreenshotUrl} alt="Transaction Screenshot Proof" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-brand-bg/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                    <span className="bg-brand-accent text-white px-3 py-1.5 rounded-lg font-bold text-[10px] shadow-lg">View Full Image</span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="p-3 bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-center text-[10px] text-brand-text-muted">
                No screenshot uploaded. Verified via transaction ID.
              </div>
            )}

            <div className="pt-4 border-t border-brand-border-white/10 flex justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-red-400 hover:bg-red-500/10 border-red-500/30"
                onClick={() => handleOrderStatusUpdate(activeOrder.id, 'rejected', 'rejected')}
                isLoading={actionLoading}
              >
                Reject Order
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setOrderModalOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOrderStatusUpdate(activeOrder.id, 'approved', 'paid')}
                  isLoading={actionLoading}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Approve Order & Unlock
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Enroll Modal */}
      <Modal isOpen={enrollModalOpen} onClose={() => setEnrollModalOpen(false)} title="Manually Enroll Student" size="md">
        <form onSubmit={handleManualEnroll} className="space-y-4 text-left text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Student Email Address *</label>
            <input
              type="email"
              value={enrollEmail}
              onChange={e => setEnrollEmail(e.target.value)}
              placeholder="e.g. student@gmail.com"
              className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white">Course Selection *</label>
            <select
              value={enrollCourseId}
              onChange={e => setEnrollCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-brand-card-dark border border-brand-border-white rounded-lg text-white focus:outline-none"
              required
            >
              <option value="" disabled>Select Course...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="pt-3 border-t border-brand-border-white flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setEnrollModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={actionLoading} leftIcon={<UserCheck className="w-4 h-4" />}>
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generic Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={async () => {
          setActionLoading(true);
          await confirmAction();
          setActionLoading(false);
          setConfirmOpen(false);
        }}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
