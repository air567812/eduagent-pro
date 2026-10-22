'use client';

import React, { useState } from 'react';
import {
  X,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building,
  ShieldCheck,
  FileImage,
  ArrowRight
} from 'lucide-react';
import { Tier } from '@/types';
import { submitPaymentRequest } from '@/lib/firebase';
import { useToast } from '@/components/ui/Toast';
import { triggerConfetti } from '@/components/ui/Confetti';

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
  const { success, error: toastError } = useToast();

  const [transactionId, setTransactionId] = useState('');
  const [payerName, setPayerName] = useState(user?.name || '');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const upiId = 'eduagentpro@icici';
  const finalAmount = billingCycle === 'ANNUAL' ? Math.round(amountInr * 12 * 0.8) : amountInr;
  const finalUsd = billingCycle === 'ANNUAL' ? Math.round(amountUsd * 12 * 0.8) : amountUsd;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastError('Invalid file', 'Please upload an image screenshot (.png, .jpg, .webp)');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toastError('Missing Reference', 'Please enter your Transaction ID or UTR number.');
      return;
    }

    setSubmitting(true);
    try {
      await submitPaymentRequest({
        userId: user?.id || `usr_${Date.now()}`,
        userEmail: user?.email || 'scholar@university.edu',
        userName: payerName || user?.name || 'Scholar User',
        tier,
        billingCycle,
        amount: finalUsd,
        transactionId: transactionId.trim(),
        paymentProofUrl: proofPreview || undefined,
        paymentProofName: proofFile?.name || 'payment_proof.png',
        notes: notes.trim()
      });

      setSubmittedSuccess(true);
      triggerConfetti();
      success('Proof Submitted!', `Payment reference for ${tier} tier received. Admin review pending.`);
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err: any) {
      toastError('Submission Error', err.message || 'Failed to submit payment request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#0c1024]/95 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-purple-500/30 shadow-[0_0_60px_rgba(124,58,237,0.3)] relative p-6 sm:p-8 space-y-6 backdrop-blur-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedSuccess ? (
          <>
            {/* Modal Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-cyan-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <QrCode className="w-3.5 h-3.5 text-pink-400" />
                <span>Manual Verification &amp; Direct QR Payment</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200 tracking-tight">
                Scan QR Code to Activate {tier} Plan
              </h2>
              <p className="text-xs text-slate-300/80 mt-1">
                Amount payable:{' '}
                <strong className="text-white font-bold">
                  ₹{finalAmount} / ${finalUsd}
                </strong>{' '}
                ({billingCycle.toLowerCase()} cycle)
              </p>
            </div>

            {/* QR Code Presentation Box */}
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-purple-500/20 flex flex-col items-center justify-center space-y-3.5 text-center">
              {/* Dynamic Styled QR Card with Laser Scan Animation */}
              <div className="p-4 bg-white rounded-2xl border-2 border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center relative group overflow-hidden">
                {/* High-Tech Glowing Laser Scan Beam */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-laser-scan pointer-events-none z-10" />

                {/* SVG Visual QR Graphic */}
                <svg
                  className="w-44 h-44 text-slate-900"
                  viewBox="0 0 200 200"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Frame */}
                  <rect x="10" y="10" width="60" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="12" />
                  <rect x="25" y="25" width="30" height="30" rx="4" fill="currentColor" />
                  <rect x="130" y="10" width="60" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="12" />
                  <rect x="145" y="25" width="30" height="30" rx="4" fill="currentColor" />
                  <rect x="10" y="130" width="60" height="60" rx="10" fill="none" stroke="currentColor" strokeWidth="12" />
                  <rect x="25" y="145" width="30" height="30" rx="4" fill="currentColor" />

                  {/* QR Matrix Bits */}
                  <rect x="85" y="20" width="12" height="12" fill="currentColor" />
                  <rect x="105" y="20" width="12" height="12" fill="currentColor" />
                  <rect x="85" y="45" width="12" height="25" fill="currentColor" />
                  <rect x="105" y="55" width="12" height="15" fill="currentColor" />
                  <rect x="20" y="85" width="25" height="12" fill="currentColor" />
                  <rect x="55" y="85" width="15" height="12" fill="currentColor" />
                  <rect x="85" y="85" width="30" height="30" rx="4" fill="#7C3AED" />
                  <rect x="130" y="85" width="20" height="12" fill="currentColor" />
                  <rect x="165" y="85" width="15" height="12" fill="currentColor" />
                  <rect x="20" y="105" width="15" height="15" fill="currentColor" />
                  <rect x="45" y="105" width="25" height="12" fill="currentColor" />
                  <rect x="130" y="105" width="12" height="25" fill="currentColor" />
                  <rect x="155" y="105" width="25" height="12" fill="currentColor" />
                  <rect x="85" y="130" width="12" height="20" fill="currentColor" />
                  <rect x="105" y="140" width="12" height="35" fill="currentColor" />
                  <rect x="130" y="140" width="25" height="12" fill="currentColor" />
                  <rect x="165" y="130" width="15" height="30" fill="currentColor" />
                  <rect x="140" y="165" width="35" height="15" fill="currentColor" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white font-black text-[11px] flex items-center justify-center shadow-lg">
                    EDU
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-200">Direct Bank &amp; UPI Scan</p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 text-xs text-purple-200 font-mono backdrop-blur-md">
                  <span>{upiId}</span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 hover:text-white text-slate-400 transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Supported Quick UPI App Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  Google Pay
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  PhonePe
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                  Paytm
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  BHIM UPI
                </span>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Transaction Reference / UTR Number <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. UPI/431289123849 or Bank Ref #10928374"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.06] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">Payer Full Name</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Name on bank account"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.06] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Upload Payment Proof / Screenshot
                  </label>
                  <label className="w-full px-3.5 py-2 rounded-xl border border-dashed border-white/20 hover:border-purple-400 bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 flex items-center justify-between cursor-pointer transition-colors">
                    <span className="truncate max-w-[150px]">{proofFile ? proofFile.name : 'Select Screenshot'}</span>
                    <Upload className="w-4 h-4 text-purple-300 flex-shrink-0" />
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Proof Preview Thumbnail */}
              {proofPreview && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.05] border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={proofPreview} alt="Proof" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
                  <div className="text-xs">
                    <p className="font-semibold text-white">{proofFile?.name}</p>
                    <p className="text-[10px] text-emerald-400 font-bold">Screenshot attached ready for review</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">Additional Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid via ICICI net banking"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.06] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                {submitting ? 'Submitting to Super Admin...' : `Submit Payment Proof for ${tier} Tier`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">Payment Request Submitted!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your transaction reference (<span className="font-mono font-bold text-purple-300">{transactionId}</span>)
                has been received. An administrator will verify the payment and activate your{' '}
                <strong className="text-pink-400 font-bold">{tier} Plan</strong> within 1-2 hours.
              </p>
            </div>

            <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/10 text-left text-xs space-y-1.5 max-w-sm mx-auto">
              <p className="font-bold text-white">What happens next?</p>
              <p className="text-slate-300/80 text-[11px] leading-relaxed">
                1. Super Admin verifies the transaction in the console.
                <br />
                2. Your account tier is upgraded automatically.
                <br />
                3. You will receive unrestricted access to all 15 AI agent tools!
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all"
            >
              Back to Billing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
