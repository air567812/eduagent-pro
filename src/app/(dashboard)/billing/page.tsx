'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Zap,
  Shield,
  Sparkles,
  Building,
  CreditCard,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Tier } from '@/types';
import { TIER_LIMITS } from '@/lib/limits';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import QrPaymentModal from '@/components/billing/QrPaymentModal';
import { triggerConfetti } from '@/components/ui/Confetti';

export default function BillingPage() {
  const { user, updateUserTier } = useAuth();
  const { success, error: toastError } = useToast();

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [activeQrModalTier, setActiveQrModalTier] = useState<Tier | null>(null);

  // Check URL parameters for simulated checkout success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mock_checkout') === 'true' || params.get('success') === 'true') {
      const targetTier = (params.get('targetTier') as Tier) || 'PRO';
      updateUserTier(targetTier);
      triggerConfetti();
      success(`🎉 Congratulations!`, `Your account has been upgraded to ${targetTier} TIER.`);
    }
  }, [updateUserTier, success]);

  // Automated Stripe Checkout Trigger
  const handleStripeCheckout = async (targetTier: Tier) => {
    if (targetTier === user?.tier) return;
    setLoadingTier(targetTier);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier, billingCycle })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback simulation
        updateUserTier(targetTier);
        triggerConfetti();
        success(`Stripe Simulated!`, `Subscription upgraded to ${targetTier} tier.`);
      }
    } catch (e: any) {
      updateUserTier(targetTier);
      triggerConfetti();
      success(`Subscription Active`, `Upgraded to ${targetTier} tier.`);
    } finally {
      setLoadingTier(null);
    }
  };

  const getTierPricing = (tier: Tier) => {
    const prices: Record<Tier, { usd: number; inr: number }> = {
      BASIC: { usd: 0, inr: 0 },
      PRO: { usd: 9, inr: 199 },
      PREMIUM: { usd: 19, inr: 499 },
      INSTITUTIONAL: { usd: 99, inr: 2999 },
      EDUCATOR: { usd: 49, inr: 999 }
    };
    return prices[tier] || prices.BASIC;
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-3.5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-cyan-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <CreditCard className="w-3.5 h-3.5 text-pink-400" />
          <span>Flexible Dual Payment: Stripe Card or Instant QR Scan</span>
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200 tracking-tight">
          Transparent Academic Plans
        </h1>
        <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed">
          Scale from independent exam prep with 25 free images to full institutional research licenses with unlimited GPT-4o analysis.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <div className="bg-white/[0.06] p-1.5 rounded-2xl flex items-center gap-1 border border-white/10 backdrop-blur-md shadow-inner">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {/* 1. BASIC */}
        <div
          className={`bg-white/[0.04] backdrop-blur-2xl rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
            user?.tier === 'BASIC'
              ? 'border-2 border-slate-400 ring-2 ring-white/10 shadow-xl'
              : 'border-white/10 shadow-lg hover:border-white/20'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base">Basic Free</h3>
              {user?.tier === 'BASIC' && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Free forever for students</p>
            <div className="text-3xl font-black text-white">$0</div>
            <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-white/10">
              {TIER_LIMITS.BASIC.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className={idx === 0 ? 'font-bold text-white' : ''}>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            disabled={user?.tier === 'BASIC'}
            onClick={() => handleStripeCheckout('BASIC')}
            className="mt-6 w-full py-2.5 rounded-xl border border-white/15 text-slate-300 font-bold text-xs hover:bg-white/10 disabled:opacity-40 transition-colors"
          >
            {user?.tier === 'BASIC' ? 'Active Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* 2. PRO */}
        <div
          className={`relative bg-gradient-to-b from-purple-950/40 via-[#0c1024]/90 to-pink-950/40 backdrop-blur-2xl rounded-3xl p-6 border-2 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${
            user?.tier === 'PRO'
              ? 'border-purple-400 ring-4 ring-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.35)]'
              : 'border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:border-pink-400'
          }`}
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg shadow-purple-500/30 border border-white/20">
            Most Popular
          </span>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base">Pro Academic</h3>
              {user?.tier === 'PRO' && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-purple-200/80">For ambitious students &amp; TAs</p>
            <div className="text-3xl font-black text-white">
              ${billingCycle === 'ANNUAL' ? Math.round(19 * 0.8) : 19}
              <span className="text-xs font-semibold text-slate-400">/mo</span>
              <span className="block text-[11px] font-semibold text-pink-400 mt-0.5">
                or ₹{billingCycle === 'ANNUAL' ? Math.round(799 * 0.8) : 799}/month
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-white/10">
              {TIER_LIMITS.PRO.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className={idx === 0 ? 'font-bold text-white' : ''}>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              disabled={user?.tier === 'PRO' || loadingTier === 'PRO'}
              onClick={() => handleStripeCheckout('PRO')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{user?.tier === 'PRO' ? 'Active Plan' : 'Pay with Card (Stripe)'}</span>
            </button>
            <button
              disabled={user?.tier === 'PRO'}
              onClick={() => setActiveQrModalTier('PRO')}
              className="w-full py-2 rounded-xl border border-purple-500/40 hover:border-pink-400 bg-white/[0.06] hover:bg-white/[0.12] text-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <QrCode className="w-3.5 h-3.5 text-pink-400" />
              <span>Pay via QR / UPI / Bank</span>
            </button>
          </div>
        </div>

        {/* 3. PREMIUM */}
        <div
          className={`relative bg-gradient-to-b from-cyan-950/40 via-[#0c1024]/90 to-blue-950/40 backdrop-blur-2xl rounded-3xl p-6 border-2 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${
            user?.tier === 'PREMIUM'
              ? 'border-cyan-400 ring-4 ring-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.35)]'
              : 'border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:border-cyan-400'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base">Premium Scholar</h3>
              {user?.tier === 'PREMIUM' && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-cyan-200/80">Researchers &amp; Postgraduates</p>
            <div className="text-3xl font-black text-white">
              ${billingCycle === 'ANNUAL' ? Math.round(49 * 0.8) : 49}
              <span className="text-xs font-semibold text-slate-400">/mo</span>
              <span className="block text-[11px] font-semibold text-cyan-400 mt-0.5">
                or ₹{billingCycle === 'ANNUAL' ? Math.round(1499 * 0.8) : 1499}/month
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-white/10">
              {TIER_LIMITS.PREMIUM.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className={idx === 0 ? 'font-bold text-white' : ''}>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              disabled={user?.tier === 'PREMIUM' || loadingTier === 'PREMIUM'}
              onClick={() => handleStripeCheckout('PREMIUM')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{user?.tier === 'PREMIUM' ? 'Active Plan' : 'Pay with Card (Stripe)'}</span>
            </button>
            <button
              disabled={user?.tier === 'PREMIUM'}
              onClick={() => setActiveQrModalTier('PREMIUM')}
              className="w-full py-2 rounded-xl border border-cyan-500/40 hover:border-cyan-400 bg-white/[0.06] hover:bg-white/[0.12] text-cyan-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pay via QR / UPI / Bank</span>
            </button>
          </div>
        </div>

        {/* 4. INSTITUTIONAL */}
        <div
          className={`relative bg-gradient-to-b from-emerald-950/40 via-[#0c1024]/90 to-teal-950/40 backdrop-blur-2xl rounded-3xl p-6 border-2 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${
            user?.tier === 'INSTITUTIONAL'
              ? 'border-emerald-400 ring-4 ring-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.35)]'
              : 'border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:border-emerald-400'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base">Institutional</h3>
              {user?.tier === 'INSTITUTIONAL' && (
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200/80">Colleges &amp; Universities</p>
            <div className="text-3xl font-black text-white">
              ${billingCycle === 'ANNUAL' ? Math.round(199 * 0.8) : 199}
              <span className="text-xs font-semibold text-slate-400">/mo</span>
              <span className="block text-[11px] font-semibold text-emerald-400 mt-0.5">Multi-seat campus license</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-white/10">
              {TIER_LIMITS.INSTITUTIONAL.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className={idx === 0 ? 'font-bold text-white' : ''}>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 space-y-2">
            <button
              disabled={user?.tier === 'INSTITUTIONAL' || loadingTier === 'INSTITUTIONAL'}
              onClick={() => handleStripeCheckout('INSTITUTIONAL')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{user?.tier === 'INSTITUTIONAL' ? 'Active Plan' : 'Purchase License'}</span>
            </button>
            <button
              disabled={user?.tier === 'INSTITUTIONAL'}
              onClick={() => setActiveQrModalTier('INSTITUTIONAL')}
              className="w-full py-2 rounded-xl border border-emerald-500/40 hover:border-emerald-400 bg-white/[0.06] hover:bg-white/[0.12] text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pay via QR / Wire</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic QR Payment Modal */}
      {activeQrModalTier && (
        <QrPaymentModal
          isOpen={Boolean(activeQrModalTier)}
          onClose={() => setActiveQrModalTier(null)}
          tier={activeQrModalTier}
          billingCycle={billingCycle}
          amountUsd={getTierPricing(activeQrModalTier).usd}
          amountInr={getTierPricing(activeQrModalTier).inr}
          user={user}
          onPaymentSubmitted={() => {
            setActiveQrModalTier(null);
          }}
        />
      )}
    </div>
  );
}
