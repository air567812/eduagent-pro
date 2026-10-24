'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Cpu,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Upload,
  RotateCw,
  Search,
  Sliders,
  CreditCard,
  Sparkles,
  Eye,
  X,
  Check,
  Save,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Tier, Role } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getPaymentConfig, updatePaymentConfig, getAllPayments, adminSetUserTier, PaymentConfig, UtrPaymentRecord } from '@/services/paymentService';
import { useToast } from '@/components/ui/Toast';

export default function SuperAdminPage() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'AI_CONFIG' | 'PAYMENT_QR' | 'UTR_AUDIT' | 'USERS'>('AI_CONFIG');

  // AI Config State
  const [aiProvider, setAiProvider] = useState<string>('POLLINATIONS_FREE');
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });
  const [savingAi, setSavingAi] = useState(false);

  // Payment QR Config State
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ upiId: 'arykothari@upi', payeeName: 'Ary Nipesh Kothari' });
  const [qrBase64Preview, setQrBase64Preview] = useState<string | null>(null);
  const [savingQr, setSavingQr] = useState(false);

  // UTR Payments Audit State
  const [payments, setPayments] = useState<UtrPaymentRecord[]>([]);
  const [inspectScreenshot, setInspectScreenshot] = useState<string | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isPrimaryAdmin = user?.email?.toLowerCase() === 'arykothari@gmail.com';
  const isSuperAdmin = isPrimaryAdmin || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isSuperAdmin) {
      loadAiConfig();
      loadPaymentConfig();
      loadPaymentsData();
      loadUsersData();
    }
  }, [isSuperAdmin]);

  const loadAiConfig = async () => {
    try {
      const docRef = doc(db, 'settings', 'aiConfig');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.provider) setAiProvider(data.provider);
        if (data.geminiKey) setGeminiKey(data.geminiKey);
        if (data.groqKey) setGroqKey(data.groqKey);
        if (data.openAiKey) setOpenAiKey(data.openAiKey);
      }
    } catch (e) {
      console.warn('AI config load notice:', e);
    }
  };

  const saveAiConfig = async () => {
    setSavingAi(true);
    try {
      const docRef = doc(db, 'settings', 'aiConfig');
      await setDoc(docRef, {
        provider: aiProvider,
        geminiKey,
        groqKey,
        openAiKey,
        updatedAt: serverTimestamp()
      }, { merge: true });
      success('AI Engine Saved', 'Free AI provider configuration persisted to Firestore.');
    } catch (e: any) {
      toastError('Save Error', e.message || 'Failed to save AI config.');
    } finally {
      setSavingAi(false);
    }
  };

  const testAiConnection = async () => {
    setTestingAi(true);
    setAiTestResult({ status: 'idle', message: 'Testing endpoint...' });
    try {
      const activeKey = aiProvider === 'GEMINI_FREE' ? geminiKey : aiProvider === 'GROQ_FREE' ? groqKey : openAiKey;
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolKey: 'QUICK_SUMMARY',
          sourceText: 'Newton laws of motion describe the relationship between a body and the forces acting upon it.',
          provider: aiProvider,
          apiKey: activeKey
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiTestResult({
          status: 'success',
          message: '🟢 Live & Operational (' + (data.modelUsed || 'AI Engine') + ' in ' + data.durationMs + 'ms)'
        });
        success('AI Test Passed', 'Engine responded with structured output.');
      } else {
        setAiTestResult({ status: 'error', message: '🔴 Error: ' + (data.error || 'Failed') });
      }
    } catch (e: any) {
      setAiTestResult({ status: 'error', message: '🔴 Network Error: ' + e.message });
    } finally {
      setTestingAi(false);
    }
  };

  const loadPaymentConfig = async () => {
    const cfg = await getPaymentConfig();
    setPaymentConfig(cfg);
    if (cfg.qrCodeBase64) setQrBase64Preview(cfg.qrCodeBase64);
  };

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setQrBase64Preview(base64);
        setPaymentConfig((prev) => ({ ...prev, qrCodeBase64: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const savePaymentSettings = async () => {
    setSavingQr(true);
    try {
      await updatePaymentConfig(paymentConfig);
      success('QR Code Saved', 'Payment settings and QR image stored in Firestore.');
    } catch (e: any) {
      toastError('Save Error', e.message || 'Failed to save payment settings.');
    } finally {
      setSavingQr(false);
    }
  };

  const loadPaymentsData = async () => {
    setLoadingPayments(true);
    try {
      const data = await getAllPayments();
      setPayments(data);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleRevokeOrUpgradePayment = async (payment: UtrPaymentRecord, newTier: Tier) => {
    try {
      await adminSetUserTier(payment.userId, newTier);
      const docRef = doc(db, 'payments', payment.id);
      await updateDoc(docRef, {
        tier: newTier,
        status: newTier === 'BASIC' ? 'REVOKED' : 'VERIFIED_AUTO',
        updatedAt: serverTimestamp()
      });
      setPayments((prev) => prev.map((p) => p.id === payment.id ? { ...p, tier: newTier, status: newTier === 'BASIC' ? 'REVOKED' : 'VERIFIED_AUTO' } : p));
      success('Subscription Updated', ('User plan adjusted to ' + newTier));
    } catch (e: any) {
      toastError('Update Error', e.message);
    }
  };

  const loadUsersData = async () => {
    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        // Demo users if firestore empty
        setUsers([
          { id: 'usr_arykothari', email: 'arykothari@gmail.com', name: 'Ary Nipesh Kothari', role: 'SUPER_ADMIN', tier: 'EDUCATOR', subscriptionTier: 'EDUCATOR', imageLimitPerSession: 999 },
          { id: 'usr_student_demo', email: 'student@eduagent.pro', name: 'Demo Scholar', role: 'STUDENT', tier: 'BASIC', subscriptionTier: 'BASIC', imageLimitPerSession: 25 }
        ]);
      }
    } catch (e) {
      console.warn('Users fetch notice:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserTierChange = async (userId: string, newTier: Tier) => {
    try {
      await adminSetUserTier(userId, newTier);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, tier: newTier, subscriptionTier: newTier } : u));
      success('Tier Updated', ('User tier set to ' + newTier));
    } catch (e: any) {
      toastError('Update Error', e.message);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RotateCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Super Admin Access Only</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This console is reserved for Primary Administrator (<strong className="text-slate-200">arykothari@gmail.com</strong>).
          </p>
        </div>
        <button
          onClick={loginWithGoogle}
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-xs transition-colors shadow-md"
        >
          Sign In as arykothari@gmail.com
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 select-none">
      {/* Admin Header */}
      <div className="bg-[#111827] rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Super Admin Console
            </span>
            <span className="text-xs text-slate-400 font-mono">arykothari@gmail.com</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            EduAgent Pro Executive Control Panel
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            100% Free Stack Manager: Zero-Cost AI Routing, Dynamic QR Payments, and Auto-Upgrades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Tier</div>
            <div className="text-xs font-bold text-emerald-400 font-mono">EDUCATOR / UNLIMITED</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'AI_CONFIG', label: '1. Free AI Engine Config', icon: Cpu },
          { id: 'PAYMENT_QR', label: '2. Payment QR Manager', icon: QrCode },
          { id: 'UTR_AUDIT', label: '3. UTR Payment Audit', icon: CreditCard },
          { id: 'USERS', label: '4. User Quotas & Plans', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={'px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ' + (activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-900')}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FREE AI ENGINE CONFIGURATOR */}
      {activeTab === 'AI_CONFIG' && (
        <div className="bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Free AI Multi-Provider Engine</h3>
            <p className="text-xs text-slate-400 mt-1">
              EduAgent Pro functions 100% free out of the box using Pollinations.ai (zero API key required). You can also configure free-tier keys from Google Gemini or Groq Cloud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'POLLINATIONS_FREE', title: 'Pollinations AI (Default)', desc: '100% Free • No Key • OpenAI GPT-4o Compatible', badge: 'Zero Cost' },
              { id: 'GEMINI_FREE', title: 'Google Gemini Studio', desc: 'Free Tier • High Speed • Multimodal Vision', badge: 'Free Key' },
              { id: 'GROQ_FREE', title: 'Groq Cloud Llama 3.3', desc: 'Free Tier • Ultra Low Latency • 70B Model', badge: 'Free Key' }
            ].map((prov) => (
              <div
                key={prov.id}
                onClick={() => setAiProvider(prov.id)}
                className={'cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between space-y-2 ' + (aiProvider === prov.id ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-sm' : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{prov.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">{prov.badge}</span>
                </div>
                <p className="text-[11px] text-slate-400">{prov.desc}</p>
              </div>
            ))}
          </div>

          {/* Provider Specific Key Inputs */}
          <div className="space-y-4 pt-2">
            {aiProvider === 'GEMINI_FREE' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Google Gemini API Key (AI Studio Free Tier)</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder:text-slate-500 text-base font-mono"
                />
                <p className="text-[11px] text-slate-400">Get your free key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline">aistudio.google.com</a> (No credit card needed).</p>
              </div>
            )}

            {aiProvider === 'GROQ_FREE' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Groq Cloud API Key (Free Tier)</label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder:text-slate-500 text-base font-mono"
                />
                <p className="text-[11px] text-slate-400">Get your free key at <a href="https://console.groq.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline">console.groq.com</a>.</p>
              </div>
            )}
          </div>

          {/* Test Status Banner */}
          {aiTestResult.status !== 'idle' && (
            <div className={'p-3.5 rounded-xl text-xs font-semibold border ' + (aiTestResult.status === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300')}>
              {aiTestResult.message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={testAiConnection}
              disabled={testingAi}
              className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              {testingAi ? <RotateCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={saveAiConfig}
              disabled={savingAi}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
            >
              {savingAi ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save AI Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT QR CODE MANAGER */}
      {activeTab === 'PAYMENT_QR' && (
        <div className="bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Direct QR Code &amp; UPI Configuration</h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload your official payment QR Code image. The image is compressed into Base64 and stored in Firestore (no paid cloud storage required).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Official UPI ID</label>
                <input
                  type="text"
                  value={paymentConfig.upiId}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, upiId: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-base font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Payee Account Name</label>
                <input
                  type="text"
                  value={paymentConfig.payeeName}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, payeeName: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Upload New QR Code Image (.png / .jpg)</label>
                <label className="cursor-pointer flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/60 text-xs text-slate-300 transition-colors">
                  <Upload className="w-4 h-4 text-blue-400" />
                  <span>Click to select QR Code image</span>
                  <input type="file" accept="image/*" onChange={handleQrImageUpload} className="hidden" />
                </label>
              </div>

              <button
                type="button"
                onClick={savePaymentSettings}
                disabled={savingQr}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                {savingQr ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save QR Code &amp; UPI Settings</span>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <span className="text-xs font-bold text-slate-400">Live Active QR Code</span>
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                {qrBase64Preview ? (
                  <img src={qrBase64Preview} alt="Payment QR" className="w-48 h-48 object-contain rounded-xl" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">Default SVG Active</div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">UPI: <span className="text-blue-400 font-mono font-bold">{paymentConfig.upiId}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UTR PAYMENT AUDIT */}
      {activeTab === 'UTR_AUDIT' && (
        <div className="bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">UTR Payment Verification &amp; Auto-Upgrade Audit</h3>
              <p className="text-xs text-slate-400 mt-1">Review student &amp; educator payment transactions. Adjust or revoke fraudulent submissions in 1 click.</p>
            </div>
            <button onClick={loadPaymentsData} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">UTR Reference</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-mono font-bold text-blue-400">{p.utrNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{p.userName}</div>
                      <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{p.tier}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-200">₹{p.amountInr}</td>
                    <td className="py-3 px-3">
                      <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (p.status === 'VERIFIED_AUTO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20')}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {p.screenshotBase64 && (
                        <button
                          onClick={() => setInspectScreenshot(p.screenshotBase64 || null)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                        >
                          Receipt
                        </button>
                      )}
                      <button
                        onClick={() => handleRevokeOrUpgradePayment(p, 'BASIC')}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-semibold border border-rose-500/30"
                      >
                        Revoke
                      </button>
                      <button
                        onClick={() => handleRevokeOrUpgradePayment(p, 'EDUCATOR')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30"
                      >
                        Make Educator
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & PLAN QUOTAS */}
      {activeTab === 'USERS' && (
        <div className="bg-[#111827] rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Registered Users &amp; Subscription Tiers</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage user roles, image quotas, and platform permissions.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Current Plan</th>
                  <th className="py-3 px-3">Image Quota</th>
                  <th className="py-3 px-3 text-right">Adjust Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.filter((u) => u.email?.toLowerCase().includes(searchUser.toLowerCase()) || u.name?.toLowerCase().includes(searchUser.toLowerCase())).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{u.name || u.displayName || "Scholar"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-300">{u.role || "STUDENT"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {u.subscriptionTier || u.tier || 'BASIC'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {u.imageLimitPerSession || (u.tier === 'EDUCATOR' ? 999 : u.tier === 'PREMIUM' ? 150 : u.tier === 'PRO' ? 75 : 25)} images/sess
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {['BASIC', 'PRO', 'PREMIUM', 'EDUCATOR'].map((t) => (
                        <button
                          key={t}
                          onClick={() => handleUserTierChange(u.id, t as Tier)}
                          className={'px-2 py-1 rounded text-[10px] font-bold border transition-colors ' + ((u.subscriptionTier || u.tier) === t ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white')}
                        >
                          {t}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screenshot Inspection Modal */}
      {inspectScreenshot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#111827] rounded-2xl max-w-lg w-full p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Payment Receipt Inspection</h4>
              <button onClick={() => setInspectScreenshot(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-700 bg-black flex items-center justify-center p-2">
              <img src={inspectScreenshot} alt="Receipt" className="max-w-full max-h-full object-contain rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}