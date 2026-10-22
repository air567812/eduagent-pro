'use client';

import React, { useState, useEffect } from 'react';
import ToolGrid from '@/components/tools/ToolGrid';
import { Wand2, Sparkles, AlertCircle } from 'lucide-react';
import { Tier } from '@/types';
import Link from 'next/link';

export default function ToolsCatalogPage() {
  const [userTier, setUserTier] = useState<Tier>('BASIC');
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('eduagent_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.tier) setUserTier(u.tier);
      } catch (e) {}
    }

    const sessStr = localStorage.getItem('eduagent_active_session');
    if (sessStr) {
      try {
        const s = JSON.parse(sessStr);
        setHasActiveSession(true);
        setActiveSessionTitle(s.title || 'Recent Materials');
      } catch (e) {}
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-cyan-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Wand2 className="w-3.5 h-3.5 text-pink-400" />
            <span>OpenAI Agentic Educational Pipeline</span>
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200 tracking-tight">
            15+ Specialized AI Educational Tools
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 max-w-2xl leading-relaxed">
            Tailored prompts with strict JSON schema validation for exam questions, summaries, Feynman explanations, and tests.
          </p>
        </div>

        {hasActiveSession ? (
          <div className="bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-emerald-300 font-semibold truncate max-w-[220px]">
              Active: {activeSessionTitle}
            </span>
          </div>
        ) : (
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-purple-200 hover:text-white font-semibold text-xs border border-purple-500/30 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
          >
            + Attach Material Notes First
          </Link>
        )}
      </div>

      <ToolGrid userTier={userTier} />
    </div>
  );
}
