'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  UploadCloud,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  BrainCircuit,
  Lock,
  Star
} from 'lucide-react';
import { EDUCATIONAL_TOOLS } from '@/lib/tools-config';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-cyan-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Next-Generation Academic AI Solutions Suite</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200 tracking-tight leading-[1.1]">
          Turn Messy Lecture Notes &amp; Textbooks into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">
            Top Exam Scores
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300/80 max-w-2xl mx-auto leading-relaxed">
          Not a generic chatbot. Upload PDFs, Word documents, and up to{' '}
          <strong className="text-white font-bold">25 images simultaneously on the Free Plan</strong>. Apply
          15+ specialized, exam-calibrated AI agents powered by structured OpenAI models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <UploadCloud className="w-5 h-5" />
            Upload Materials (25 Free Images)
          </Link>
          <Link
            href="/tools"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 shadow-sm flex items-center justify-center gap-2 transition-colors backdrop-blur-md"
          >
            Explore 15+ AI Tools
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>25 Images Batch Limit (Free Forever)</span>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Vision OCR Handwritten Notes</span>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.03] px-3.5 py-1.5 rounded-full border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Zero Hallucinations (Structured Schemas)</span>
          </div>
        </div>
      </section>

      {/* 15 Tools Showcase Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
            Engineered For Higher Education
          </span>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200">
            15+ Specialized Academic Agent Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/80 max-w-xl mx-auto">
            Each tool operates on dedicated pedagogical prompts and strict schema constraints to generate exam-ready materials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EDUCATIONAL_TOOLS.slice(0, 9).map((tool) => (
            <div
              key={tool.key}
              className="bg-white/[0.04] backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-lg hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] transition-all flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                    {tool.category.replace('_', ' ')}
                  </span>
                  {tool.minTier === 'PRO' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40">
                      PRO
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white text-base">{tool.title}</h3>
                <p className="text-xs text-slate-300/80 mt-1.5 line-clamp-2 leading-relaxed">{tool.shortDesc}</p>
              </div>

              <Link
                href={`/tools`}
                className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-purple-300 hover:text-white transition-colors"
              >
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-200 hover:text-white bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border border-purple-500/30 px-6 py-3 rounded-xl hover:border-purple-400 shadow-md transition-all hover:scale-105"
          >
            <span>View All 15 Specialized Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Upload Engine Highlighting the 25-Image Free Tier */}
      <section className="bg-gradient-to-br from-purple-950/40 via-[#0c1024]/90 to-cyan-950/30 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-purple-500/30 relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-300 bg-pink-500/20 px-3 py-1 rounded-full border border-pink-400/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
            Heterogeneous Multi-Material Ingestion
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Up to 25 Lecture Images in a Single Session. Free Forever.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
            Students don&apos;t just read clean PDFs—they take phone photos of whiteboards, lecture slides, and handwritten notes.
            EduAgent Pro lets you drop up to 25 images simultaneously, preview and reorder pages in chronological sequence, and apply OCR seamlessly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-200">
            <span className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-pink-400" /> Client-side thumbnail reordering
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> PDF &amp; Word (.docx) support
            </span>
            <span className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Vision OCR text extraction
            </span>
          </div>

          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
            >
              Start Upload Session
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing / Tiers Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
            Transparent Academic Pricing
          </span>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-200">
            Plans for Independent Scholars &amp; Entire Universities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Basic Tier */}
          <div className="bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-between hover:border-white/20 transition-all hover:-translate-y-1">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Basic Plan</h3>
                <p className="text-xs text-slate-400">Free forever for students</p>
              </div>
              <div className="text-3xl font-black text-white">$0</div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <strong className="text-white">Up to 25 images / session</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  Standard PDF/Word parsing (10 MB)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  Core AI tools &amp; exam questions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  20 AI requests / day
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 w-full py-2.5 rounded-xl border border-white/15 text-slate-200 font-semibold text-xs text-center hover:bg-white/10 block transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="relative bg-gradient-to-b from-purple-950/40 via-[#0c1024]/90 to-pink-950/40 backdrop-blur-2xl rounded-2xl p-6 border-2 border-purple-500/70 shadow-[0_0_35px_rgba(168,85,247,0.3)] flex flex-col justify-between transition-all hover:-translate-y-1.5">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg shadow-purple-500/30 border border-white/20">
              Most Popular
            </span>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Pro Academic</h3>
                <p className="text-xs text-purple-200/80">For ambitious students &amp; TAs</p>
              </div>
              <div className="text-3xl font-black text-white">
                $19<span className="text-xs font-medium text-slate-400">/mo</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <strong className="text-white">Up to 100 images / session</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  50 MB large textbook uploads
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  All 15+ specialized educational tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  PDF, DOCX &amp; Markdown direct export
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  150 AI runs / day
                </li>
              </ul>
            </div>
            <Link
              href="/billing"
              className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xs text-center hover:opacity-95 shadow-lg shadow-purple-500/30 block transition-all"
            >
              Upgrade to Pro
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="relative bg-gradient-to-b from-cyan-950/40 via-[#0c1024]/90 to-blue-950/40 backdrop-blur-2xl rounded-2xl p-6 border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col justify-between transition-all hover:-translate-y-1.5">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Premium Scholar</h3>
                <p className="text-xs text-cyan-200/80">Postgrads &amp; researchers</p>
              </div>
              <div className="text-3xl font-black text-white">
                $49<span className="text-xs font-medium text-slate-400">/mo</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <strong className="text-white">Up to 500 images / session</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  200 MB thesis &amp; manuscript limits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  OpenAI o1 &amp; gpt-4o multi-step agents
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  Unlimited daily AI runs
                </li>
              </ul>
            </div>
            <Link
              href="/billing"
              className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 text-white font-bold text-xs text-center hover:opacity-95 shadow-lg shadow-cyan-500/30 block transition-all"
            >
              Get Premium
            </Link>
          </div>

          {/* Institutional Tier */}
          <div className="relative bg-gradient-to-b from-emerald-950/40 via-[#0c1024]/90 to-teal-950/40 backdrop-blur-2xl rounded-2xl p-6 border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex flex-col justify-between transition-all hover:-translate-y-1.5">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">Institutional</h3>
                <p className="text-xs text-emerald-200/80">Colleges &amp; Universities</p>
              </div>
              <div className="text-3xl font-black text-white">
                $199<span className="text-xs font-medium text-slate-400">/mo</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <strong className="text-white">Unlimited batch uploads</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  50+ student &amp; faculty seats
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  Centralized Super Admin console
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  Organization-wide audit logs
                </li>
              </ul>
            </div>
            <Link
              href="/billing"
              className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs text-center hover:opacity-95 shadow-lg shadow-emerald-500/30 block transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
