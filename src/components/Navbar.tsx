'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  Sparkles,
  LayoutDashboard,
  UploadCloud,
  Wand2,
  CreditCard,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    success('Signed out successfully', 'You have been logged out of EduAgent Pro.');
    window.location.href = '/login';
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Materials', href: '/upload', icon: UploadCloud },
    { name: 'AI Tools (15+)', href: '/tools', icon: Wand2 },
    { name: 'Subscriptions', href: '/billing', icon: CreditCard },
  ];

  if (user?.role === 'SUPER_ADMIN' || user?.email?.toLowerCase() === 'arykothari@gmail.com') {
    navLinks.push({ name: 'Admin Console', href: '/admin', icon: ShieldAlert });
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'EDUCATOR':
        return 'bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-rose-500/25 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold';
      case 'PRO':
        return 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)] font-semibold';
      case 'PREMIUM':
        return 'bg-gradient-to-r from-purple-500/25 to-pink-500/25 text-pink-300 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.2)] font-semibold';
      case 'INSTITUTIONAL':
        return 'bg-gradient-to-r from-cyan-500/25 to-emerald-500/25 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold';
      default:
        return 'bg-white/[0.05] text-slate-300 border-white/[0.12]';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080B16]/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">EduAgent</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-xs">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">AI Academic Productivity Suite</p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white/[0.10] text-white border border-white/[0.18] shadow-sm shadow-purple-500/15'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: User Profile & Tier Badge */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getTierColor(user.subscriptionTier || user.tier)}`}>
                  {user.subscriptionTier || user.tier} TIER
                </span>

                <div className="flex items-center gap-2 pl-2 border-l border-white/[0.12]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-white/[0.2] flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.06] transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02]"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-white/[0.08] bg-[#080B16]/95 backdrop-blur-2xl px-4 pt-2 pb-5 space-y-1.5 shadow-2xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-white/[0.12] text-white border border-white/[0.15]' : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
          {user && (
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-rose-400 bg-rose-500/15 border border-rose-500/30 rounded-xl font-bold hover:bg-rose-500/25 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
