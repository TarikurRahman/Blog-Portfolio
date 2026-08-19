'use client';

import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex items-center justify-center pt-28 pb-16 px-6">
        <div className="w-full flex items-center justify-center py-6">
          <Suspense fallback={<div className="text-brand-text-muted text-center py-8">Loading form...</div>}>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
