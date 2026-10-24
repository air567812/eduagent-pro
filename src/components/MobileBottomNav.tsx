'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wand2,
  UploadCloud,
  LayoutDashboard,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPrimaryAdmin = user?.email?.toLowerCase() === 'arykothari@gmail.com';
  const isSuperAdmin = isPrimaryAdmin || user?.role === 'SUPER_ADMIN';

  // Do not render bottom nav on authentication pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const navItems = [
    {
      name: 'AI Tools',
      href: '/tools',
      icon: Wand2,
      active: pathname === '/tools'
    },
    {
      name: 'Upload',
      href: '/upload',
      icon: UploadCloud,
      active: pathname === '/upload'
    },
    {
      name: 'My Library',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard'
    },
    {
      name: isSuperAdmin ? 'Admin' : 'Plan',
      href: isSuperAdmin ? '/admin' : '/billing',
      icon: isSuperAdmin ? ShieldAlert : CreditCard,
      active: pathname === (isSuperAdmin ? '/admin' : '/billing')
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111827]/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom,8px)]"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex-1 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-1 rounded-xl transition-all select-none ${
                item.active
                  ? 'text-blue-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  item.active ? 'bg-blue-600/15 text-blue-400' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}