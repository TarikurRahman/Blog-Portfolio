'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Upload, Phone, Check, ShieldAlert, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { CheckoutSkeleton } from '@/components/skeletons/PageSkeletons';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
  const { slug } = useParams() as { slug: string };
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/login?redirect=/checkout/course/${slug}`);
      return;
    }

    if (slug) {
      fetchCheckoutData();
    }
  }, [slug, user, isLoading]);

  const fetchCheckoutData = async () => {
    try {
      const res = await fetch(`/api/courses/${slug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCourse(json.data);
      } else {
        router.push('/courses');
        return;
      }

      const resSet = await fetch('/api/course-settings');
      const jsonSet = await resSet.json();
      if (jsonSet.success && jsonSet.data) {
        setSettings(jsonSet.data);
        const activeMethods = jsonSet.data.paymentMethods?.filter((pm: any) => pm.status === 'active') || [];
        if (activeMethods.length > 0) {
          setPaymentMethod(activeMethods[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
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
        setScreenshotUrl(json.data.fileUrl);
        showToast('Proof screenshot uploaded successfully to Cloudinary', 'success');
      } else {
        showToast(json.message || 'Upload failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !paymentMethod || !transactionId) {
      showToast('Please fill in your phone number, payment method and transaction ID.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const orderAmount = course.salePrice !== undefined && course.salePrice !== null ? course.salePrice : course.price;
      const res = await fetch('/api/course-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          amount: orderAmount,
          paymentMethod,
          transactionId,
          paymentScreenshotUrl: screenshotUrl,
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Order details submitted successfully!', 'success');
        router.push(`/course-success?slug=${slug}&order=${json.data.orderNumber}`);
      } else {
        showToast(json.message || 'Checkout failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to submit order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <>
        <Navbar />
        <CheckoutSkeleton />
        <Footer />
      </>
    );
  }

  if (!course) return null;

  const checkoutPrice = course.salePrice !== undefined && course.salePrice !== null ? course.salePrice : course.price;
  const activeMethods = settings?.paymentMethods?.filter((pm: any) => pm.status === 'active') || [];

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 min-h-screen bg-brand-bg text-left relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          
          <Link href={`/courses/${slug}`} className="inline-flex items-center gap-1.5 text-xs text-brand-text-muted hover:text-white font-bold mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Course details
          </Link>

          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-none mb-6">
            Secure Course Checkout
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left side checkout form */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Payment details specifications banner */}
              <Card hoverEffect={false} className="p-5 border border-brand-accent/25 bg-brand-accent/5 text-xs text-brand-text-muted leading-relaxed">
                <p className="font-bold text-white mb-2 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-brand-accent" /> Payment Instructions:</p>
                <p>{settings?.paymentInstructions || "Please send the course amount to one of our wallets and input your Transaction ID below."}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-white">
                  {activeMethods.map((pm: any) => (
                    <div key={pm.name} className="p-3 bg-brand-card-dark rounded-xl border border-brand-border-white/5">
                      <p className="font-bold uppercase text-brand-accent">{pm.name}</p>
                      <p className="font-mono mt-1 text-[11px]">{pm.details}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Form panel */}
              <Card hoverEffect={false} className="p-5 border border-brand-border-white bg-brand-card-dark/20">
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">Your Name</label>
                      <input type="text" value={user?.name || ''} disabled className="w-full px-3 py-2.5 text-xs bg-brand-card-dark/60 border border-brand-border-white/10 rounded-xl text-white/50 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">Email Address</label>
                      <input type="email" value={user?.email || ''} disabled className="w-full px-3 py-2.5 text-xs bg-brand-card-dark/60 border border-brand-border-white/10 rounded-xl text-white/50 cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white">Contact Phone Number *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 017xxxxxxxx"
                      className="w-full px-3 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">Payment Wallet / Method *</label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50"
                        required
                      >
                        {activeMethods.map((pm: any) => <option key={pm.name} value={pm.name}>{pm.name}</option>)}
                        {activeMethods.length === 0 && (
                          <>
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white">Transaction ID (TrxID) *</label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value)}
                        placeholder="e.g. A9B8C7D6"
                        className="w-full px-3 py-2.5 text-xs bg-brand-card-dark border border-brand-border-white rounded-xl text-white focus:outline-none focus:border-brand-accent/50 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Screenshot upload proof */}
                  <div className="space-y-1.5 bg-brand-card-dark p-4 rounded-xl border border-brand-border-white/5">
                    <label className="text-[10px] font-bold text-white block">Payment Proof Screenshot (Optional)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {screenshotUrl && (
                        <div className="relative w-20 h-14 rounded overflow-hidden shrink-0 border border-brand-border-white">
                          <img src={screenshotUrl} alt="Screenshot proof preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadScreenshot}
                          className="w-full text-[10px] text-brand-text-muted file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-brand-accent file:text-white file:cursor-pointer"
                        />
                        {uploadingImage && <p className="text-[9px] text-brand-accent mt-1 animate-pulse">Uploading screenshot proof...</p>}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold py-2.5 text-xs flex justify-center mt-6"
                    isLoading={submitting}
                  >
                    Submit Checkout Payment Proof
                  </Button>
                </form>
              </Card>

            </div>

            {/* Right side course breakdown summary */}
            <div className="md:col-span-5">
              <Card hoverEffect={false} className="p-5 border border-brand-border-white bg-brand-card-dark/30 text-xs">
                <h3 className="text-xs font-bold text-white tracking-tight uppercase border-b border-brand-border-white/10 pb-3 mb-4">
                  Order Details Summary
                </h3>

                <div className="flex gap-3 items-start mb-6">
                  <div className="w-16 h-12 rounded overflow-hidden shrink-0 border border-brand-border-white bg-brand-card-dark">
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{course.title}</p>
                    <p className="text-[10px] text-brand-text-muted mt-0.5">{course.category}</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-brand-text-muted">
                  <div className="flex justify-between">
                    <span>Course Subtotal:</span>
                    <span className="text-white font-semibold">৳{checkoutPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fees:</span>
                    <span className="text-white font-semibold">৳0</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-border-white/10 pt-3 mt-3 text-sm font-bold text-white">
                    <span>Grand Total:</span>
                    <span className="text-brand-accent">৳{checkoutPrice}</span>
                  </div>
                </div>
              </Card>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
