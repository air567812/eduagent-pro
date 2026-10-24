'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strengthScore = calculatePasswordStrength(password);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        const user = await loginWithEmail(email, password);
        success('Welcome back!', `Signed in as ${user.name || user.email}`);
        router.push('/dashboard');
      } else {
        const user = await registerWithEmail(name, email, password, role);
        success('Account created!', `Welcome to EduAgent Pro, ${user.name || user.email}`);
        router.push('/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication request failed. Please check credentials.';
      setError(msg);
      toastError('Auth Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      success('Google Account Verified!', `Welcome ${user.name || user.email}`);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Google Sign-In failed.';
      setError(msg);
      toastError('Google Sign-In', msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const quickFillAdmin = () => {
    setEmail('arykothari@gmail.com');
    setPassword('SuperAdmin123!');
    setName('Ary Kothari');
    setRole('EDUCATOR');
    setError(null);
  };

  const quickFillStudent = () => {
    setEmail('student@eduagent.pro');
    setPassword('Student2026!');
    setName('Demo Scholar');
    setRole('STUDENT');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 select-none">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[420px] rounded-2xl bg-[#111827]/90 backdrop-blur-2xl border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-inner">
            <GraduationCap className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {mode === 'signin'
              ? 'Enter your credentials to access your study portal'
              : 'Empower your academic journey with 15 AI tools'}
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-slate-900/80 p-1 border border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-50 active:scale-[0.99]"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#111827] px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider relative">
            or continue with email
          </span>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ary Kothari"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500 text-base transition-colors"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Academic Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['STUDENT', 'EDUCATOR', 'RESEARCHER'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                      role === r
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arykothari@gmail.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500 text-base transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => alert('Please contact administrator at arykothari@gmail.com for credential recovery.')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-11 rounded-xl bg-slate-900/60 border border-slate-700/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500 text-base transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'signup' && password.length > 0 && (
              <div className="pt-1 space-y-1">
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`rounded-full transition-colors ${
                        strengthScore >= level
                          ? strengthScore === 1
                            ? 'bg-rose-500'
                            : strengthScore === 2
                            ? 'bg-amber-500'
                            : strengthScore === 3
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Security strength</span>
                  <span className="font-medium text-slate-400">
                    {strengthScore <= 1 ? 'Weak' : strengthScore === 2 ? 'Fair' : strengthScore === 3 ? 'Good' : 'Strong'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] text-slate-500 font-medium text-center">Quick Demo Access:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={quickFillAdmin}
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 text-left transition-colors group"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 group-hover:text-blue-400">
                <span>Super Admin</span>
                <ShieldCheck className="w-3 h-3 text-blue-500" />
              </div>
              <div className="text-[10px] text-slate-500 truncate">arykothari@gmail.com</div>
            </button>
            <button
              type="button"
              onClick={quickFillStudent}
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-left transition-colors group"
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 group-hover:text-slate-100">
                <span>Scholar Demo</span>
                <Sparkles className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-500 truncate">student@eduagent.pro</div>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
