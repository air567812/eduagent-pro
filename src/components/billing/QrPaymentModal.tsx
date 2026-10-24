'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ImageIcon
} from 'lucide-react';
import { Tier } from '@/types';
import { getPaymentConfig, submitUtrAutoUpgrade, PaymentConfig, DEFAULT_PAYMENT_CONFIG } from '@/services/paymentService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { triggerConfetti } from '@/components/ui/Confetti';
import { useRouter } from 'next/navigation';

interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  amountUsd: number;
  amountInr: number;
  user: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
  onPaymentSubmitted?: () => void;
}

export default function QrPaymentModal({
  isOpen,
  onClose,
  tier,
  billingCycle,
  amountUsd,
  amountInr,
  user,
  onPaymentSubmitted
}: QrPaymentModalProps) {
  const router = useRouter();
  const { updateUserTier } = useAuth();
  const { success, error: toastError } = useToast();

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [utrNumber, setUtrNumber] = useState('');
  const [payerName, setPayerName] = useState(user?.name || '');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getPaymentConfig().then((cfg) => setPaymentConfig(cfg));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const finalAmount = billingCycle === 'ANNUAL' ? Math.round(amountInr * 12 * 0.8) : amountInr;
  const finalUsd = billingCycle === 'ANNUAL' ? Math.round(amountUsd * 12 * 0.8) : amountUsd;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(paymentConfig.upiId);
    setCopiedUpi(true);
    success('UPI ID Copied', 'Paste into GPay, PhonePe, or Paytm.');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastError('Invalid Image', 'Please select a valid image screenshot (.png, .jpg, .webp)');
        return;
      }
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      toastError('Missing UTR', 'Please enter your 12-digit UPI / Bank Reference ID.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitUtrAutoUpgrade({
        userId: user?.id || ('usr_' + Date.now()),
        userEmail: user?.email || 'scholar@university.edu',
        userName: payerName || user?.name || 'Scholar User',
        tier,
        billingCycle,
        amountInr: finalAmount,
        amountUsd: finalUsd,
        utrNumber: cleanUtr,
        screenshotBase64: screenshotBase64 || undefined
      });

      updateUserTier(tier);
      triggerConfetti();
      setIsUpgraded(true);
      success('Instant Auto-Upgrade Activated!', res.message);
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err: any) {
      toastError('Payment Verification Notice', err.message || 'Verification could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#111827] rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-800 shadow-[0_20px_70px_rgba(0,0,0,0.8)] relative p-6 sm:p-8 space-y-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isUpgraded ? (
          <>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero-Fee QR Code &amp; UPI Auto-Upgrade</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Scan to Upgrade to {tier} Tier
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Payable Amount: <strong className="text-white font-bold">₹{finalAmount}</strong> (~${finalUsd} USD) for {billingCycle.toLowerCase()} access.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center space-y-3.5 text-center">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col items-center">
                {paymentConfig.qrCodeBase64 ? (
                  <img
                    src={paymentConfig.qrCodeBase64}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain rounded-xl"
                  />
                ) : (
                  <svg
                    className="w-44 h-44 text-slate-900"
                    viewBox="0 0 200 200"
                    fill="currentColor"
                  >
                    <rect x="10" y="10" width="60" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="12" />
                    <rect x="25" y="25" width="30" height="30" rx="4" fill="currentColor" />
                    <rect x="130" y="10" width="60" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="12" />
                    <rect x="145" y="25" width="30" height="30" rx="4" fill="currentColor" />
                    <rect x="10" y="130" width="60" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="12" />
                    <rect x="25" y="145" width="30" height="30" rx="4" fill="currentColor" />
                    <rect x="85" y="20" width="12" height="12" fill="currentColor" />
                    <rect x="105" y="20" width="12" height="12" fill="currentColor" />
                    <rect x="85" y="45" width="12" height="25" fill="currentColor" />
                    <rect x="105" y="55" width="12" height="15" fill="currentColor" />
                    <rect x="20" y="85" width="25" height="12" fill="currentColor" />
                    <rect x="55" y="85" width="15" height="12" fill="currentColor" />
                    <rect x="85" y="85" width="30" height="30" rx="4" fill="#2563EB" />
                    <rect x="130" y="85" width="20" height="12" fill="currentColor" />
                    <rect x="85" y="130" width="12" height="30" fill="currentColor" />
                    <rect x="105" y="145" width="25" height="12" fill="currentColor" />
                    <rect x="145" y="130" width="45" height="12" fill="currentColor" />
                  </svg>
                )}
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">UPI ID:</span>
                <span className="font-bold text-blue-400 font-mono">{paymentConfig.upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 max-w-sm">
                Payee: <strong className="text-slate-200">{paymentConfig.payeeName}</strong>. Open GPay, PhonePe, Paytm, or your banking app, scan or pay, then copy the 12-digit UTR below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  12-Digit UTR / Transaction Reference ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 409283109281 (from payment receipt)"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500 text-base font-mono transition-colors"
                />
                <p className="text-[11px] text-slate-400">
                  Found in your banking receipt as &quot;UTR&quot;, &quot;UPI Ref ID&quot;, or &quot;Txn ID&quot;.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Ary Kothari"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 placeholder:text-slate-500 text-base transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Optional: Attach Payment Screenshot
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>{screenshotName ? 'Replace Screenshot' : 'Upload Receipt'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                  {screenshotName && (
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                      {screenshotName}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify &amp; Activate {tier} Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Auto-Upgrade Active
              </span>
              <h3 className="text-2xl font-bold text-white">Welcome to {tier} Tier!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your payment reference has been recorded and your account has been immediately upgraded. You now enjoy expanded image quotas and unlocked AI tools.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div>Reference UTR: <span className="font-mono text-slate-200">{utrNumber}</span></div>
              <div>Tier: <span className="font-bold text-blue-400">{tier}</span></div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/tools');
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Launch 15 AI Tools</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}