'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Sparkles,
  Search,
  BookOpen,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileCheck
} from 'lucide-react';

interface ReasoningStep {
  title: string;
  desc: string;
  status: 'completed' | 'processing' | 'pending';
  timestamp?: string;
}

interface PerplexityProps {
  citations?: { label: string; detail: string }[];
  steps?: ReasoningStep[];
  modelUsed?: string;
}

export default function PerplexityReasoningAccordion({
  citations = [
    { label: '[Page 3 - Lecture Notes]', detail: 'Electromagnetic induction derivation and Lenz law statement.' },
    { label: '[Image 12 - Diagram]', detail: 'Handwritten circuit topology with galvanometer deflection.' },
    { label: '[Syllabus Sec 4.2]', detail: 'Core university exam marks weighting: 8 Marks (Long Answer).' }
  ],
  steps = [
    {
      title: 'Vision OCR & Document Ingestion',
      desc: 'Extracted 18 high-resolution student notebook photos & 1 syllabus PDF with 99.4% OCR confidence.',
      status: 'completed',
      timestamp: '142ms'
    },
    {
      title: 'Pedagogical Semantic Chunking',
      desc: 'Clustered 14 core academic formulas, definitions, and high-frequency exam questions.',
      status: 'completed',
      timestamp: '210ms'
    },
    {
      title: 'Curriculum & Exam Rubric Alignment',
      desc: 'Calibrated question difficulty and marks scoring rubric against accredited university standards.',
      status: 'completed',
      timestamp: '380ms'
    },
    {
      title: 'OpenAI gpt-4o Structured Output Generation',
      desc: 'Synthesized verified structured study artifacts with strict JSON pedagogical schemas.',
      status: 'completed',
      timestamp: '1,120ms'
    }
  ],
  modelUsed = 'OpenAI gpt-4o (Structured Outputs)'
}: PerplexityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCitation, setActiveCitation] = useState<string | null>(null);

  return (
    <div className="space-y-3 select-none">
      {/* Perplexity-Style Clickable Neon Citation Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1.5 mr-1">
          <Search className="w-3 h-3 text-cyan-400" /> Grounded In:
        </span>
        {citations.map((cite, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCitation(activeCitation === cite.label ? null : cite.label)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
              activeCitation === cite.label
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/[0.1]'
            }`}
          >
            <span>{cite.label}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>
        ))}
      </div>

      {/* Citation Detail Card */}
      <AnimatePresence>
        {activeCitation && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-100 flex items-start gap-2.5 shadow-lg"
          >
            <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-cyan-300 font-bold">{activeCitation}</strong>
              <p className="text-[11px] text-cyan-100/90 mt-0.5">
                {citations.find((c) => c.label === activeCitation)?.detail}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsible Rainbow-Bordered Reasoning Accordion */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/[0.12] overflow-hidden shadow-lg">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xs">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white flex items-center gap-2">
              View AI Agent Reasoning Steps
              <span className="text-[10px] text-purple-300 font-medium">({steps.length} stages)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-md hidden sm:inline-block">
              {modelUsed}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                isOpen ? 'transform rotate-180 text-white' : ''
              }`}
            />
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/[0.08] px-4 py-3 space-y-3 bg-[#080B16]/60"
            >
              {steps.map((st, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">{st.title}</p>
                      {st.timestamp && <span className="text-[10px] text-slate-500 font-mono">{st.timestamp}</span>}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
