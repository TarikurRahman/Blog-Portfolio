'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiService } from '@/lib/api-service';
import Button from './Button';
import { auth, googleProvider, signInWithPopup } from '@/lib/firebase';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const { login, register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const isLogin = mode === 'login';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!email || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!isLogin && !name) {
      showToast('Please provide your name.', 'error');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (!isLogin) {
      if (!/[A-Z]/.test(password)) {
        showToast('Password must contain at least one uppercase letter.', 'error');
        return;
      }
      if (!/[a-z]/.test(password)) {
        showToast('Password must contain at least one lowercase letter.', 'error');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          showToast('Successfully logged in!', 'success');
          const stored = localStorage.getItem('portfolio_logged_in_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (redirectUrl) {
              router.push(redirectUrl);
            } else if (parsed.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          } else {
            router.push('/');
          }
        } else {
          showToast('Invalid email or password.', 'error');
        }
      } else {
        let uploadedAvatarUrl = undefined;
        if (avatarFile) {
          try {
            const uploadResult = await ApiService.uploadImage(avatarFile, 'avatar');
            uploadedAvatarUrl = uploadResult.url;
          } catch (uploadErr: any) {
            console.error('Avatar upload failed:', uploadErr);
            showToast(uploadErr.message || 'Avatar upload failed. Registering without photo.', 'warning');
          }
        }

        const success = await register(name, email, password, uploadedAvatarUrl);
        if (success) {
          showToast('Registration successful! Welcome.', 'success');
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push('/dashboard');
          }
        } else {
          showToast('Email address already registered.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred during authentication.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const success = await loginWithGoogle(idToken);
      if (success) {
        showToast('Successfully signed in with Google!', 'success');
        const stored = localStorage.getItem('portfolio_logged_in_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (parsed.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/');
        }
      } else {
        showToast('Google login failed or account is blocked.', 'error');
      }
    } catch (err: any) {
      console.error('Google Sign In popup error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast(err.message || 'Google Authentication failed', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl text-brand-accent mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-xs text-brand-text-muted mt-1.5 leading-relaxed">
          {isLogin
            ? 'Sign in to access your customized dashboard and comments'
            : 'Register to comment, save blog articles, and track updates'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 relative">
        {/* Name input (Register only) */}
        {!isLogin && (
          <>
            <div className="flex flex-col items-center justify-center space-y-2 pb-3 border-b border-brand-border/40">
              <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-brand-accent/30 hover:border-brand-accent transition-colors bg-brand-card-dark flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-brand-text-muted" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer transition-opacity">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[10px] text-brand-text-muted">Optional Profile Picture (Max 5MB)</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-text-muted" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                />
              </div>
            </div>
          </>
        )}

        {/* Email input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/90">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-text-muted" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
              required
            />
          </div>
        </div>

        {/* Password input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white/90">Password</label>
            {isLogin && (
              <span className="text-[10px] text-brand-accent hover:underline cursor-pointer">
                Forgot password?
              </span>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-2.5 text-sm bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password (Register only) */}
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm bg-brand-card-dark border border-brand-border-white rounded-xl text-white placeholder-brand-text-muted focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all"
                required
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-4 font-bold py-3"
          isLoading={isLoading}
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Button>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-brand-border/40 w-full"></div>
          <span className="absolute bg-brand-card px-3 text-[10px] text-brand-text-muted font-medium uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-brand-card-dark hover:bg-brand-border/20 border border-brand-border-white rounded-xl text-white font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.6 15.02 1 12 1 7.35 1 3.37 3.68 1.4 7.6l3.87 3C6.18 7.6 8.84 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.1 2.66-2.33 3.48l3.61 2.8c2.11-1.95 3.78-4.82 3.78-8.43z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.6c-.25-.76-.39-1.57-.39-2.4s.14-1.64.39-2.4L1.4 6.8c-.88 1.76-1.4 3.74-1.4 5.8s.52 4.04 1.4 5.8l3.87-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.61-2.8c-1.01.68-2.31 1.08-3.79 1.08-3.16 0-5.82-2.56-6.77-5.56L1.4 16.2C3.37 20.12 7.35 23 12 23z"
            />
          </svg>
          Google
        </button>
      </form>

      {/* Alternative redirection link */}
      <div className="text-center mt-6 text-xs text-brand-text-muted relative">
        {isLogin ? (
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-accent hover:underline font-semibold">
              Create one here
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-brand-accent hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
