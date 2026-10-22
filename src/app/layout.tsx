import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import LiquidBackground from '@/components/ui/LiquidBackground';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'EduAgent Pro - AI-Powered Academic Productivity Suite',
  description:
    'Syllabus-aware academic productivity platform for students and educators with 15+ specialized AI exam tools and multi-file OCR ingestion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen bg-[#080B16] text-slate-100 antialiased selection:bg-purple-500 selection:text-white relative font-sans">
        {/* Dynamic Backside Liquid Light Reacting to Mouse */}
        <LiquidBackground />

        {/* Foreground Content Stack */}
        <AuthProvider>
          <ToastProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
              <footer className="border-t border-white/[0.08] bg-[#080B16]/80 backdrop-blur-xl py-6 text-center text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-slate-400">© {new Date().getFullYear()} EduAgent Pro Inc. All rights reserved.</p>
                  <div className="flex items-center gap-4 font-medium text-slate-400">
                    <span className="text-cyan-400/90">FERPA &amp; GDPR Ready</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-purple-400/90">Strict 25-Image Free Batch</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-pink-400/90">Real OpenAI gpt-4o Structured Agents</span>
                  </div>
                </div>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
