'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface MascotProps {
  mousePos: { x: number; y: number }; // normalized -1 to 1
  isEmailTyping: boolean;
  isPasswordFocused: boolean;
  showPassword: boolean;
  isGoogleHovered: boolean;
  mode: 'signin' | 'signup';
}

export default function ReactiveAiMascot({
  mousePos,
  isEmailTyping,
  isPasswordFocused,
  showPassword,
  isGoogleHovered,
  mode
}: MascotProps) {
  // Eye pupil offset calculation based on mouse
  const pupilX = isPasswordFocused ? 0 : mousePos.x * 14;
  const pupilY = isPasswordFocused ? 0 : mousePos.y * 10;

  // Mascot leaning & rotation based on email typing
  const bodyLeanY = isEmailTyping ? 12 : 0;
  const bodyScale = isEmailTyping ? 1.05 : 1;
  const bodyRotate = isEmailTyping ? (mode === 'signin' ? 4 : -4) : 0;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden p-6">
      {/* Ambient Pulsing Aurora Rings */}
      <motion.div
        animate={{
          scale: isEmailTyping ? [1, 1.25, 1.08] : isGoogleHovered ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: isEmailTyping ? 0.7 : 0.4
        }}
        transition={{ repeat: Infinity, duration: isEmailTyping ? 1.5 : 4, ease: 'easeInOut' }}
        className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-500/30 via-purple-500/30 to-pink-500/30 blur-3xl pointer-events-none"
      />

      {/* Orbiting Sparkles when Google Button is Hovered */}
      <AnimatePresence>
        {isGoogleHovered && (
          <>
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <motion.div
                key={deg}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.6, 1.4, 0.8],
                  x: Math.cos((deg * Math.PI) / 180) * 110,
                  y: Math.sin((deg * Math.PI) / 180) * 110
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
                className="absolute z-20 pointer-events-none"
              >
                <div
                  className="w-3 h-3 rounded-full blur-[1px]"
                  style={{
                    backgroundColor: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'][i % 4],
                    boxShadow: `0 0 12px ${['#4285F4', '#34A853', '#FBBC05', '#EA4335'][i % 4]}`
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Mascot Body Container with 3D Float */}
      <motion.div
        animate={{
          y: isEmailTyping ? bodyLeanY : [0, -10, 0],
          scale: bodyScale,
          rotate: bodyRotate
        }}
        transition={{
          y: isEmailTyping ? { type: 'spring', stiffness: 200 } : { repeat: Infinity, duration: 4, ease: 'easeInOut' },
          scale: { type: 'spring', stiffness: 300, damping: 20 },
          rotate: { type: 'spring', stiffness: 250, damping: 15 }
        }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Cute Floating Halo / Antenna */}
        <motion.div
          animate={{
            scale: isGoogleHovered ? [1, 1.25, 1] : [1, 1.05, 1],
            y: [0, -4, 0]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-3 rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 blur-[2px] mb-2 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
        />

        {/* Mascot Head / Core */}
        <div className="relative w-44 h-44 rounded-[42px] bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 p-1 shadow-2xl border border-white/20 backdrop-blur-xl">
          {/* Outer Glass Bezel Ring */}
          <div className="w-full h-full rounded-[38px] bg-gradient-to-tr from-purple-900/40 via-cyan-950/30 to-pink-900/40 p-4 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Subtle Reflection Highlights */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/15 to-transparent rounded-t-[38px] pointer-events-none" />

            {/* Glowing Face Visor */}
            <div className="relative w-32 h-24 rounded-3xl bg-[#060814]/90 border border-cyan-500/30 flex items-center justify-center p-2 shadow-inner shadow-cyan-950/60 overflow-hidden">
              {/* Visor Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

              {/* Eyes Container */}
              <div className="relative w-full flex items-center justify-around px-2 z-10">
                {/* Left Eye */}
                <div className="relative w-9 h-11 rounded-2xl bg-slate-950/90 border border-cyan-400/40 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <motion.div
                    animate={{
                      x: pupilX,
                      y: pupilY,
                      scaleY: isPasswordFocused && !showPassword ? 0.1 : 1
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="w-5 h-7 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-200 shadow-[0_0_10px_#22d3ee] flex items-center justify-center"
                  >
                    {/* Inner Eye Glimmer */}
                    <div className="w-1.5 h-2 bg-white rounded-full translate-x-0.5 -translate-y-1" />
                  </motion.div>
                </div>

                {/* Right Eye */}
                <div className="relative w-9 h-11 rounded-2xl bg-slate-950/90 border border-pink-400/40 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(236,72,153,0.4)]">
                  <motion.div
                    animate={{
                      x: pupilX,
                      y: pupilY,
                      // If showPassword is true, peeks with one eye open!
                      scaleY: isPasswordFocused ? (showPassword ? 1 : 0.1) : 1
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="w-5 h-7 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-200 shadow-[0_0_10px_#f43f5e] flex items-center justify-center"
                  >
                    <div className="w-1.5 h-2 bg-white rounded-full translate-x-0.5 -translate-y-1" />
                  </motion.div>
                </div>
              </div>

              {/* Animated Mouth */}
              <motion.div
                animate={{
                  scaleX: isEmailTyping ? 1.4 : 1,
                  scaleY: isEmailTyping ? 1.6 : 1,
                  borderColor: isEmailTyping ? '#38bdf8' : isGoogleHovered ? '#f43f5e' : 'rgba(255,255,255,0.4)'
                }}
                className="absolute bottom-2 w-4 h-1.5 rounded-full border-b-2 transition-all"
              />
            </div>

            {/* Interactive Privacy Hands / Shields */}
            <motion.div
              initial={false}
              animate={{
                y: isPasswordFocused ? (showPassword ? 8 : -2) : 60,
                opacity: isPasswordFocused ? 1 : 0
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-around px-5 pointer-events-none"
            >
              {/* Left Hand / Shield */}
              <motion.div
                animate={{
                  rotate: isPasswordFocused ? -12 : -30,
                  y: isPasswordFocused ? -16 : 0
                }}
                className="w-11 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border border-cyan-300 shadow-lg shadow-cyan-500/40 flex items-center justify-center text-white"
              >
                <ShieldCheck className="w-5 h-5 text-white/90" />
              </motion.div>

              {/* Right Hand / Shield (Peeks down when showPassword is true!) */}
              <motion.div
                animate={{
                  rotate: isPasswordFocused ? (showPassword ? 25 : 12) : 30,
                  y: isPasswordFocused ? (showPassword ? 4 : -16) : 0
                }}
                className="w-11 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-600 border border-pink-300 shadow-lg shadow-pink-500/40 flex items-center justify-center text-white"
              >
                <Zap className="w-5 h-5 text-white/90" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Mascot Pedestal / Floating Platform */}
        <div className="w-32 h-4 rounded-full bg-cyan-400/20 blur-md mt-6 shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
      </motion.div>

      {/* Reactive Status Badge */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="mt-6 px-4 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] text-[11px] font-bold text-white flex items-center gap-2 shadow-lg"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>
          {isPasswordFocused
            ? showPassword
              ? '👀 Peeking at password...'
              : '🙈 Privacy shield active!'
            : isEmailTyping
            ? '✨ Reading your academic email...'
            : isGoogleHovered
            ? '⚡ Ready for instant Google Sign-In'
            : mode === 'signin'
            ? '🚀 Scholar AI Agent Ready'
            : '🎓 Join 10,000+ Students & Educators'}
        </span>
      </motion.div>
    </div>
  );
}
