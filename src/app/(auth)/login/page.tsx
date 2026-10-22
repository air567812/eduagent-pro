'use client';

import React, { useState, useRef } from 'react';
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
  BookOpen,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@/types';
import ReactiveAiMascot from '@/components/auth/ReactiveAiMascot';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const { success, error: toastError } = useToast();

  // Mode state: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Mascot interaction triggers
  const [isEmailTyping, setIsEmailTyping] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isGoogleHovered, setIsGoogleHovered] = useState(false);

  // 3D Card tilt and cursor tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0, spotX: 50, spotY: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1

    setMousePos({
      x: (x - 0.5) * 2, // -1 to 1
      y: (y - 0.5) * 2
    });

    setCardTilt({
      rotateX: (y - 0.5) * -8, // subtle 3D tilt
      rotateY: (x - 0.5) * 8,
      spotX: x * 100,
      spotY: y * 100
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setCardTilt({ rotateX: 0, rotateY: 0, spotX: 50, spotY: 50 });
  };

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
        success('Scholar Account Created!', `Welcome to EduAgent Pro, ${user.name || user.email}`);
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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative max-w-5xl mx-auto my-4 min-h-[640px] perspective-1000 select-none py-4"
    >
      {/* 3D Container with dynamic cursor spotlight border */}
      <motion.div
        style={{
          rotateX: cardTilt.rotateX,
          rotateY: cardTilt.rotateY,
          transformStyle: 'preserve-3d'
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative w-full rounded-[36px] p-2 bg-gradient-to-tr from-white/[0.12] via-white/[0.04] to-white/[0.10] backdrop-blur-2xl border border-white/[0.15] shadow-[0_20px_70px_rgba(0,0,0,0.55)] overflow-hidden"
      >
        {/* Cursor radial neon spotlight behind border */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 320px at ${cardTilt.spotX}% ${cardTilt.spotY}%, rgba(124, 58, 237, 0.4), rgba(6, 182, 212, 0.2), transparent 70%)`
          }}
        />

        {/* Inner Grid: 2 Columns */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 rounded-[32px] overflow-hidden bg-slate-950/40">
          
          {/* ============================================================== */}
          {/* PANEL 1: INTERACTIVE REACTIVE ARTWORK / MASCOT SHOWCASE PANEL */}
          {/* ============================================================== */}
          <div
            className={`relative flex flex-col justify-between p-8 sm:p-10 bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-950/80 border border-white/[0.08] rounded-[28px] overflow-hidden transition-all duration-700 ${
              mode === 'signup' ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            {/* Background Mesh Elements */}
            <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

            {/* Showcase Top Branding */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-black text-white text-base tracking-tight">EduAgent</span>
                  <span className="text-[10px] font-black uppercase ml-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white">
                    PRO
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-white/[0.06] px-3 py-1 rounded-full border border-white/[0.1]">
                {mode === 'signin' ? 'Sign In Portal' : 'Scholar Signup'}
              </span>
            </div>

            {/* Showcase Center: The Interactive Mascot */}
            <div className="relative z-10 my-4 flex-1 flex items-center justify-center">
              <ReactiveAiMascot
                mousePos={mousePos}
                isEmailTyping={isEmailTyping}
                isPasswordFocused={isPasswordFocused}
                showPassword={showPassword}
                isGoogleHovered={isGoogleHovered}
                mode={mode}
              />
            </div>

            {/* Showcase Bottom Feature Highlights */}
            <div className="relative z-10 pt-4 border-t border-white/[0.08] grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[10px] font-bold text-cyan-400">25 Images</p>
                <p className="text-[9px] text-slate-400">Simultaneous OCR</p>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[10px] font-bold text-purple-400">15 AI Tools</p>
                <p className="text-[9px] text-slate-400">Exam-Calibrated</p>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[10px] font-bold text-pink-400">Real OpenAI</p>
                <p className="text-[9px] text-slate-400">gpt-4o Powered</p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* PANEL 2: AUTHENTICATION FORM (SIGN IN / CREATE ACCOUNT)       */}
          {/* ============================================================== */}
          <div
            className={`p-8 sm:p-10 flex flex-col justify-center space-y-6 ${
              mode === 'signup' ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            {/* Header & Mode Switcher Pills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    {mode === 'signin'
                      ? 'Continue your exam preparation and academic workflows.'
                      : 'Free scholar account with up to 25 images per upload session.'}
                  </p>
                </div>
              </div>

              {/* Mode Toggle Switcher */}
              <div className="p-1 rounded-2xl bg-white/[0.06] border border-white/[0.1] grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === 'signin'
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25'
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
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Official Google Sign-In Button */}
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              onMouseEnter={() => setIsGoogleHovered(true)}
              onMouseLeave={() => setIsGoogleHovered(false)}
              disabled={googleLoading || loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-3 shadow-lg shadow-white/5 transition-all disabled:opacity-50 border border-white/20"
            >
              {/* Official Google 'G' SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{googleLoading ? 'Connecting Google Account...' : 'Continue with Google (Gmail)'}</span>
            </motion.button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/[0.1] w-full" />
              <span className="bg-[#080B16] px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                or email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Full Name field (Sign Up mode only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      placeholder="e.g. Maya Lin"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailTyping(e.target.value.length > 0);
                    }}
                    onFocus={() => setIsEmailTyping(email.length > 0)}
                    onBlur={() => setIsEmailTyping(false)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="alex@university.edu"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Academic Role Selector (Sign Up mode only) */}
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#0e1329] border border-white/[0.12] text-xs text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    <option value="STUDENT">Student (High School / University)</option>
                    <option value="EDUCATOR">Educator / Professor / TA</option>
                    <option value="INSTITUTION_ADMIN">Institution Administrator</option>
                  </select>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || googleLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In with Email' : 'Create Scholar Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
