'use client';

import React from 'react';
import { Tier } from '@/types';
import { TIER_LIMITS } from '@/lib/limits';
import { Zap, Image as ImageIcon, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface UsageMeterProps {
  tier: Tier;
  aiRequestsUsedToday?: number;
  currentSessionImages?: number;
}

export default function UsageMeter({
  tier = 'BASIC',
  aiRequestsUsedToday = 4,
  currentSessionImages = 0
}: UsageMeterProps) {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.BASIC;
  const maxDaily = limits.dailyAiRequests;
  const maxImages = limits.maxImagesPerSession;

  const requestPercentage = Math.min(100, Math.round((aiRequestsUsedToday / maxDaily) * 100));
  const imagePercentage = Math.min(100, Math.round((currentSessionImages / maxImages) * 100));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Subscription & Usage Limits</h3>
          <p className="text-xs text-slate-500">Tier: <strong className="text-slate-800">{limits.name}</strong></p>
        </div>
        {tier === 'BASIC' && (
          <Link
            href="/billing"
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm hover:opacity-95 transition-opacity"
          >
            Upgrade Plan
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Metric 1: Daily AI Runs */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Daily AI Runs
            </span>
            <span className="font-bold text-slate-900">
              {aiRequestsUsedToday} / {maxDaily > 1000 ? '∞' : maxDaily}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${requestPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Resets every 24 hours at 00:00 UTC
          </p>
        </div>

        {/* Metric 2: Session Images (Strict 25 for Basic) */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-brand-600" /> Max Images / Session
            </span>
            <span className="font-bold text-slate-900">
              {currentSessionImages} / {maxImages}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                imagePercentage >= 100 ? 'bg-rose-500' : 'bg-brand-600'
              }`}
              style={{ width: `${imagePercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {tier === 'BASIC'
              ? 'Strict 25-image limit on free tier'
              : `${tier} plan: Up to ${maxImages} images`}
          </p>
        </div>
      </div>
    </div>
  );
}
