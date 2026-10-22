'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Folder,
  Clock,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  Settings,
  BookOpen,
  Atom,
  Binary,
  Dna,
  History,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Tier } from '@/types';
import { TIER_LIMITS } from '@/lib/limits';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: any[];
  onSelectSession: (session: any) => void;
  activeSessionId?: string;
  onNewSession: () => void;
  onOpenStudySpace: (spaceName: string) => void;
}

export default function ChatGptSidebar({
  isOpen,
  onToggle,
  sessions,
  onSelectSession,
  activeSessionId,
  onNewSession,
  onOpenStudySpace
}: SidebarProps) {
  const { user } = useAuth();
  const [activeSpace, setActiveSpace] = useState<string>('Physics 101');

  const studySpaces = [
    { id: 'sp_1', name: 'Physics 101', color: 'from-cyan-400 to-blue-500', icon: Atom, count: 8 },
    { id: 'sp_2', name: 'Calculus III', color: 'from-purple-400 to-indigo-500', icon: Binary, count: 12 },
    { id: 'sp_3', name: 'Cell Biology', color: 'from-emerald-400 to-teal-500', icon: Dna, count: 5 },
    { id: 'sp_4', name: 'World History', color: 'from-amber-400 to-rose-500', icon: History, count: 7 }
  ];

  const currentTier: Tier = user?.subscriptionTier || user?.tier || 'BASIC';
  const limits = TIER_LIMITS[currentTier] || TIER_LIMITS.BASIC;
  const isPrimaryAdmin = user?.email?.toLowerCase() === 'arykothari@gmail.com';
  const isEducatorOrAdmin = isPrimaryAdmin || currentTier === 'EDUCATOR' || user?.role === 'SUPER_ADMIN';

  // Quota circular ring calculation (Max 25 for basic, 500 for educator)
  const maxImages = limits.maxImagesPerSession;
  const currentImages = sessions[0]?.totalImages || 0;
  const percentage = Math.min(100, Math.round((currentImages / maxImages) * 100));
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 72 }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="relative z-30 flex flex-col h-[calc(100vh-6rem)] rounded-3xl bg-[#080B16]/90 backdrop-blur-2xl border border-white/[0.10] shadow-2xl overflow-hidden select-none"
    >
      {/* Sidebar Header: Toggle & New Session */}
      <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between">
        <button
          onClick={onNewSession}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:opacity-95 transition-all ${
            isOpen ? 'w-full justify-center' : 'w-10 h-10 p-0 justify-center'
          }`}
          title="New Study Session"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span>New Session</span>}
        </button>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors ml-1 hidden lg:block"
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Color-Coded Study Spaces */}
        <div className="space-y-2">
          {isOpen && (
            <p className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Study Spaces
            </p>
          )}
          <div className="space-y-1">
            {studySpaces.map((space) => {
              const Icon = space.icon;
              const isSelected = activeSpace === space.name;
              return (
                <button
                  key={space.id}
                  onClick={() => {
                    setActiveSpace(space.name);
                    onOpenStudySpace(space.name);
                  }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  } ${!isOpen && 'justify-center px-0'}`}
                  title={space.name}
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${space.color} flex items-center justify-center text-white shadow-xs flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {isOpen && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span className="truncate">{space.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white/[0.05] px-1.5 py-0.5 rounded-md">
                        {space.count}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Chat / Generation Sessions */}
        <div className="space-y-2">
          {isOpen && (
            <p className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Recent Sessions
            </p>
          )}
          <div className="space-y-1">
            {sessions.length === 0 ? (
              isOpen && (
                <p className="px-2 text-[11px] text-slate-500 italic">No recent sessions yet.</p>
              )
            ) : (
              sessions.slice(0, 6).map((s, idx) => (
                <button
                  key={s.id || idx}
                  onClick={() => onSelectSession(s)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left truncate transition-colors ${
                    activeSessionId === s.id
                      ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  } ${!isOpen && 'justify-center px-0'}`}
                  title={s.title || `Session ${idx + 1}`}
                >
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                  {isOpen && <span className="truncate">{s.title || `Upload Session #${idx + 1}`}</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Circular Quota Progress Ring */}
        {isOpen && (
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3.5">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="url(#quotaGradient)"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="quotaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-[10px] font-bold text-white">
                {currentImages}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-white">Batch Quota</span>
                <span className="text-cyan-400">{currentImages}/{maxImages}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {isEducatorOrAdmin ? 'VIP Unrestricted Allocation' : '25-image strict free tier'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer: Profile Bar with Crown Badge */}
      <div className="p-3 border-t border-white/[0.08] bg-slate-950/40">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 border border-white/20 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {isEducatorOrAdmin && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 border border-slate-950 flex items-center justify-center text-white shadow-xs">
                <Crown className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          {isOpen && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Ary Nipesh Kothari'}</p>
              </div>
              {isEducatorOrAdmin ? (
                <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-400/40 text-[9px] font-black uppercase text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                  <span>SUPER ADMIN • EDUCATOR</span>
                </div>
              ) : (
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{currentTier} SCHOLAR</p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
