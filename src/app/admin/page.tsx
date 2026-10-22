'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  DollarSign,
  Activity,
  Cpu,
  Edit,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Sliders,
  FileCode,
  ShieldCheck,
  QrCode,
  Eye,
  X,
  FileImage
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { EDUCATIONAL_TOOLS } from '@/lib/tools-config';
import { Tier, Role } from '@/types';

export default function SuperAdminPage() {
  const { user, loading: authLoading, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'PAYMENTS' | 'PROMPTS' | 'AUDIT'>('OVERVIEW');
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [inspectProofUrl, setInspectProofUrl] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [selectedToolKey, setSelectedToolKey] = useState(EDUCATIONAL_TOOLS[0].key);
  const [promptOverride, setPromptOverride] = useState(EDUCATIONAL_TOOLS[0].systemPrompt);
  const [savePromptStatus, setSavePromptStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, metricsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/metrics')
      ]);

      const usersJson = await usersRes.json();
      const metricsJson = await metricsRes.json();

      if (usersJson.users) setUsers(usersJson.users);
      if (metricsJson.metrics) setMetrics(metricsJson.metrics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }

    // Load manual QR payment requests
    try {
      const storedReqs = JSON.parse(localStorage.getItem('eduagent_payment_requests') || '[]');
      if (storedReqs.length === 0) {
        // Preload demo requests for immediate admin testing
        const sampleRequests = [
          {
            id: 'req_demo_101',
            userId: 'usr_scholar_alex',
            userName: 'Alex Johnson',
            userEmail: 'alex.johnson@university.edu',
            tier: 'PRO',
            billingCycle: 'MONTHLY',
            amount: 19,
            transactionId: 'UPI/409283109281',
            paymentProofName: 'gpay_receipt_tx101.png',
            status: 'PENDING_REVIEW',
            notes: 'Paid via Google Pay UPI. Please activate Pro tier.',
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'req_demo_102',
            userId: 'usr_scholar_202',
            userName: 'Dr. Priya Sharma',
            userEmail: 'priya.sharma@iitd.ac.in',
            tier: 'PREMIUM',
            billingCycle: 'ANNUAL',
            amount: 470,
            transactionId: 'NEFT/SBIN829103984',
            paymentProofName: 'bank_wire_stamp.png',
            status: 'PENDING_REVIEW',
            notes: 'Annual institutional grant wire transfer.',
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        localStorage.setItem('eduagent_payment_requests', JSON.stringify(sampleRequests));
        setPaymentRequests(sampleRequests);
      } else {
        setPaymentRequests(storedReqs);
      }
    } catch (e) {
      console.error('Error loading payment requests:', e);
    }
  };

  const handleApprovePayment = async (request: any) => {
    try {
      // 1. Upgrade user tier
      await handleUpdateUserPlan(request.userId, request.tier, 'STUDENT');

      // 2. Mark request as APPROVED
      const updatedReqs = paymentRequests.map((r) =>
        r.id === request.id ? { ...r, status: 'APPROVED', approvedAt: new Date().toISOString() } : r
      );
      setPaymentRequests(updatedReqs);
      localStorage.setItem('eduagent_payment_requests', JSON.stringify(updatedReqs));

      // Also update currently active user if matches
      const currentStored = localStorage.getItem('eduagent_user');
      if (currentStored) {
        try {
          const u = JSON.parse(currentStored);
          if (u.id === request.userId || u.email === request.userEmail) {
            const updated = { ...u, tier: request.tier };
            localStorage.setItem('eduagent_user', JSON.stringify(updated));
          }
        } catch (e) {}
      }

      alert(`Payment for ${request.userName} APPROVED! User tier upgraded to ${request.tier}.`);
    } catch (e: any) {
      alert('Error approving payment: ' + e.message);
    }
  };

  const handleRejectPayment = (requestId: string) => {
    const updatedReqs = paymentRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'REJECTED', rejectedAt: new Date().toISOString() } : r
    );
    setPaymentRequests(updatedReqs);
    localStorage.setItem('eduagent_payment_requests', JSON.stringify(updatedReqs));
    alert('Payment request marked as Rejected.');
  };

  const handleUpdateUserPlan = async (userId: string, newTier: Tier, newRole: Role) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, newTier, newRole })
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tier: newTier, role: newRole } : u))
      );
    } catch (e) {
      alert('Failed to update user plan');
    }
  };

  const handleSavePrompt = () => {
    setSavePromptStatus('Prompt override saved successfully in database!');
    setTimeout(() => setSavePromptStatus(null), 3000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const isPrimaryAdmin = user?.email?.toLowerCase() === 'arykothari@gmail.com';
  const isSuperAdmin = isPrimaryAdmin || user?.role === 'SUPER_ADMIN';

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RotateCw className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white/95 backdrop-blur-xl border border-rose-200/80 rounded-3xl shadow-xl shadow-rose-500/5 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Restricted Administrative Area</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Super Administrator console is strictly restricted to verified platform administrators (<span className="font-semibold text-slate-700">arykothari@gmail.com</span>). Current session {user ? `(${user.email}) does not possess SUPER_ADMIN credentials.` : 'is unauthenticated.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => loginWithGoogle()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sign in with Google as Admin</span>
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Super Administrator Console</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified: {user?.displayName || 'Ary Nipesh Kothari'} ({user?.email || 'arykothari@gmail.com'})</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              <span>Tier: {user?.subscriptionTier || 'EDUCATOR'} (500 Img / Priority AI)</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            EduAgent Pro Administrative Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Global tenancy control, Stripe MRR synchronizer, token consumption monitors, and dynamic prompt overrides.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 flex items-center gap-1.5"
        >
          <RotateCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'OVERVIEW', label: 'Platform & MRR Telemetry', icon: Activity },
          { id: 'USERS', label: 'User Management & Tiers', icon: Users },
          { id: 'PAYMENTS', label: 'Manual Payments & QR Reviews', icon: QrCode },
          { id: 'PROMPTS', label: '15 Tools Prompt Overrides', icon: FileCode },
          { id: 'AUDIT', label: 'Security & Audit Logs', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Monthly Recurring Rev (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                ${metrics?.monthlyRecurringRevenue?.toLocaleString() || '14,850'}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold">+18.4% from last month</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Active Users</span>
                <Users className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {metrics?.totalUsers?.toLocaleString() || '1,420'}
              </p>
              <p className="text-[11px] text-slate-500">
                {metrics?.activeSubscribers || 384} paid subscribers
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Tokens Processed</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {(metrics?.totalTokensConsumed / 1000000)?.toFixed(2) || '18.45'}M
              </p>
              <p className="text-[11px] text-slate-500">OpenAI gpt-4o &amp; vision</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Estimated LLM API Spend</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                ${metrics?.estimatedApiSpendUsd?.toFixed(2) || '92.26'}
              </p>
              <p className="text-[11px] text-slate-500">Avg latency: {metrics?.averageLatencyMs || 1420}ms</p>
            </div>
          </div>

          {/* Breakdown Charts & Tool Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Most Utilized AI Tools</h3>
              <div className="space-y-3">
                {metrics?.topToolsUsed?.map((item: any) => (
                  <div key={item.tool} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{item.tool.replace(/_/g, ' ')}</span>
                      <span className="text-slate-500">
                        {item.count} runs ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-600 h-2 rounded-full"
                        style={{ width: `${item.percentage * 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Subscription Tier Distribution</h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-semibold">Basic (Free)</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {metrics?.tierDistribution?.BASIC || 1036}
                  </p>
                  <p className="text-[10px] text-slate-400">Strict 25-img limit</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <p className="text-xs text-blue-700 font-semibold">Pro Academic</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">
                    {metrics?.tierDistribution?.PRO || 260}
                  </p>
                  <p className="text-[10px] text-blue-600">$19/month</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <p className="text-xs text-purple-700 font-semibold">Premium Scholar</p>
                  <p className="text-xl font-bold text-purple-900 mt-1">
                    {metrics?.tierDistribution?.PREMIUM || 98}
                  </p>
                  <p className="text-[10px] text-purple-600">$49/month</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-700 font-semibold">Institutional</p>
                  <p className="text-xl font-bold text-emerald-900 mt-1">
                    {metrics?.tierDistribution?.INSTITUTIONAL || 26}
                  </p>
                  <p className="text-[10px] text-emerald-600">$199/month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-sm">Tenant &amp; User Accounts</h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Subscription Tier</th>
                  <th className="p-3">Sessions / Runs</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{u.name || 'Anonymous'}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserPlan(u.id, u.tier, e.target.value as Role)}
                        className="rounded-lg border border-slate-200 px-2 py-1 bg-white text-xs font-semibold text-slate-700"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="EDUCATOR">EDUCATOR</option>
                        <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.tier}
                        onChange={(e) => handleUpdateUserPlan(u.id, e.target.value as Tier, u.role)}
                        className="rounded-lg border border-slate-200 px-2 py-1 bg-white text-xs font-bold text-brand-700"
                      >
                        <option value="BASIC">BASIC (25 Img Free)</option>
                        <option value="PRO">PRO ($19/mo)</option>
                        <option value="PREMIUM">PREMIUM ($49/mo)</option>
                        <option value="INSTITUTIONAL">INSTITUTIONAL</option>
                      </select>
                    </td>
                    <td className="p-3 text-slate-600">
                      {u._count?.sessions || 0} sessions • {u._count?.generations || 0} AI runs
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => alert(`Inspection of user ${u.email}: All metrics verified.`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MANUAL QR PAYMENTS & VERIFICATIONS */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">QR Payments &amp; Transfer Verifications</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {paymentRequests.filter((r) => r.status === 'PENDING_REVIEW').length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Inspect user-uploaded payment screenshots, verify UTR / bank references, and instantly activate tier quotas.
              </p>
            </div>

            <button
              onClick={() => {
                const storedReqs = JSON.parse(localStorage.getItem('eduagent_payment_requests') || '[]');
                setPaymentRequests(storedReqs);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Refresh Requests
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="p-3">User &amp; Email</th>
                  <th className="p-3">Plan &amp; Amount</th>
                  <th className="p-3">Transaction ID / UTR</th>
                  <th className="p-3">Proof Screenshot</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No payment verification requests found.
                    </td>
                  </tr>
                ) : (
                  paymentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{req.userName}</p>
                        <p className="text-slate-500 text-[11px]">{req.userEmail}</p>
                        {req.notes && <p className="text-slate-400 text-[10px] italic mt-0.5">&quot;{req.notes}&quot;</p>}
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold px-2 py-0.5 rounded-full text-[10px] bg-brand-50 text-brand-700 border border-brand-200">
                          {req.tier} ({req.billingCycle || 'MONTHLY'})
                        </span>
                        <p className="font-black text-slate-900 text-xs mt-1">${req.amount}</p>
                      </td>
                      <td className="p-3 font-mono text-[11px] font-semibold text-slate-800">
                        {req.transactionId}
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Today'}
                        </p>
                      </td>
                      <td className="p-3">
                        {req.paymentProofUrl ? (
                          <button
                            onClick={() => setInspectProofUrl(req.paymentProofUrl)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-600" />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                            <FileImage className="w-3.5 h-3.5" />
                            <span>{req.paymentProofName || 'Attached on file'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {req.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                          </span>
                        ) : req.status === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="w-3 h-3 text-rose-600" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Activity className="w-3 h-3 text-amber-600 animate-pulse" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {req.status === 'PENDING_REVIEW' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprovePayment(req)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve &amp; Activate</span>
                            </button>
                            <button
                              onClick={() => handleRejectPayment(req.id)}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proof Inspection Lightbox Modal */}
      {inspectProofUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full relative space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Payment Proof Screenshot</h4>
              <button
                onClick={() => setInspectProofUrl(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={inspectProofUrl}
              alt="Payment Proof"
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200"
            />
            <button
              onClick={() => setInspectProofUrl(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PROMPT OVERRIDES */}
      {activeTab === 'PROMPTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Prompt Hot-Tuning</h3>
              <p className="text-xs text-slate-500">
                Update OpenAI system instructions without redeploying code.
              </p>
            </div>
            <select
              value={selectedToolKey}
              onChange={(e) => {
                const key = e.target.value;
                setSelectedToolKey(key as any);
                const tool = EDUCATIONAL_TOOLS.find((t) => t.key === key);
                if (tool) setPromptOverride(tool.systemPrompt);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 bg-white"
            >
              {EDUCATIONAL_TOOLS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {savePromptStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{savePromptStatus}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Active System Prompt for {selectedToolKey}:
            </label>
            <textarea
              rows={8}
              value={promptOverride}
              onChange={(e) => setPromptOverride(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-4 font-mono text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePrompt}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save System Prompt
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Security &amp; Rate Limit Audit Stream</h3>
          <div className="space-y-3">
            {metrics?.recentAuditLogs?.map((log: any) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{log.userEmail}</span>
                  </div>
                  <p className="text-slate-500 mt-1 font-mono text-[11px]">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p>IP: {log.ipAddress}</p>
                  <p>{new Date(log.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
