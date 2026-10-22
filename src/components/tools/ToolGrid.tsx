'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EDUCATIONAL_TOOLS, ExtendedToolConfig } from '@/lib/tools-config';
import { Tier, ToolType } from '@/types';
import ToolParameterModal from './ToolParameterModal';
import {
  HelpCircle,
  FileText,
  BookOpen,
  Zap,
  Layers,
  CheckSquare,
  MessageSquare,
  ListOrdered,
  FileCheck,
  ClipboardList,
  GitFork,
  Smile,
  CreditCard,
  Clock,
  Edit3,
  Search,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  HelpCircle,
  FileText,
  BookOpen,
  Zap,
  Layers,
  CheckSquare,
  MessageSquare,
  ListOrdered,
  FileCheck,
  ClipboardList,
  GitFork,
  Smile,
  CreditCard,
  Clock,
  Edit3
};

interface ToolGridProps {
  userTier?: Tier;
  activeSessionId?: string;
  sourceText?: string;
}

export default function ToolGrid({
  userTier = 'BASIC',
  activeSessionId,
  sourceText
}: ToolGridProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalTool, setActiveModalTool] = useState<ExtendedToolConfig | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const categories = [
    { id: 'ALL', name: 'All 15 Tools' },
    { id: 'EXAM_SUITE', name: 'Exam & Questions (Violet/Pink)' },
    { id: 'SUMMARY_SUITE', name: 'Summaries (Cyan/Blue)' },
    { id: 'ANALYSIS_SUITE', name: 'Analysis (Emerald/Mint)' },
    { id: 'STUDY_SUITE', name: 'Interactive (Amber/Coral)' }
  ];

  const getToolSuite = (key: ToolType) => {
    switch (key) {
      case 'IMPORTANT_QUESTIONS':
      case 'QA_GENERATOR':
      case 'MCQ_GENERATOR':
      case 'SHORT_LONG_ANSWERS':
      case 'PRACTICE_TEST_GENERATOR':
        return {
          suiteId: 'EXAM_SUITE',
          suiteName: 'Exam & Question Suite',
          cardGradient: 'from-purple-950/45 via-slate-900/80 to-pink-950/40 border-purple-500/30 hover:border-pink-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]',
          iconGradient: 'from-purple-500 via-violet-500 to-pink-500 shadow-purple-500/40',
          textColor: 'text-pink-300',
          badgeStyle: 'bg-purple-500/20 text-purple-200 border-purple-400/40'
        };
      case 'SUMMARIZE_TOPIC':
      case 'SUMMARIZE_CHAPTER':
      case 'QUICK_SUMMARY':
      case 'REVISION_NOTES':
        return {
          suiteId: 'SUMMARY_SUITE',
          suiteName: 'Summarization Suite',
          cardGradient: 'from-cyan-950/45 via-slate-900/80 to-blue-950/40 border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]',
          iconGradient: 'from-cyan-400 via-teal-500 to-blue-500 shadow-cyan-500/40',
          textColor: 'text-cyan-300',
          badgeStyle: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
        };
      case 'DETAILED_REPORT':
      case 'IMPORTANT_POINTS_NOTES':
      case 'TOPIC_WISE_ANALYSIS':
      case 'ASSIGNMENT_ASSISTANT':
        return {
          suiteId: 'ANALYSIS_SUITE',
          suiteName: 'Analysis & Reports Suite',
          cardGradient: 'from-emerald-950/45 via-slate-900/80 to-teal-950/40 border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]',
          iconGradient: 'from-emerald-400 via-teal-500 to-cyan-500 shadow-emerald-500/40',
          textColor: 'text-emerald-300',
          badgeStyle: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
        };
      case 'EXPLAIN_TOPIC':
      case 'FLASHCARD_GENERATOR':
      default:
        return {
          suiteId: 'STUDY_SUITE',
          suiteName: 'Interactive Study Suite',
          cardGradient: 'from-amber-950/45 via-slate-900/80 to-rose-950/40 border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]',
          iconGradient: 'from-amber-400 via-orange-500 to-rose-500 shadow-amber-500/40',
          textColor: 'text-amber-300',
          badgeStyle: 'bg-amber-500/20 text-amber-200 border-amber-400/40'
        };
    }
  };

  const filteredTools = EDUCATIONAL_TOOLS.filter((tool) => {
    const suite = getToolSuite(tool.key);
    const matchesCat = selectedCategory === 'ALL' || suite.suiteId === selectedCategory;
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleToolClick = (tool: ExtendedToolConfig) => {
    setActiveModalTool(tool);
  };

  const handleRunTool = async (params: Record<string, any>) => {
    if (!activeModalTool) return;
    setIsRunning(true);

    try {
      const activeSession = localStorage.getItem('eduagent_active_session');
      let textToUse = sourceText || '';
      if (!textToUse && activeSession) {
        const sess = JSON.parse(activeSession);
        textToUse =
          sess.files?.map((f: any) => f.extractedText || f.fileName).join('\n\n') ||
          'Comprehensive lecture notes on fundamental concepts, theorems, equations, and applications.';
      }

      const customKey = localStorage.getItem('eduagent_openai_key') || '';
      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customKey) {
        reqHeaders['x-openai-api-key'] = customKey;
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          toolKey: activeModalTool.key,
          sourceText: textToUse || 'Syllabus and lecture notes regarding fundamental examination topics.',
          parameters: params,
          apiKey: customKey
        })
      });

      const json = await res.json();
      if (json.success && json.result) {
        // Save result in local session and navigate to results page
        const resultId = `res_${Date.now()}`;
        const record = {
          id: resultId,
          toolType: activeModalTool.key,
          toolTitle: activeModalTool.title,
          parameters: params,
          resultData: json.result.data,
          tokensUsed: json.result.tokensUsed,
          modelName: json.result.modelUsed,
          durationMs: json.result.durationMs,
          quotaWarning: json.result.quotaWarning,
          createdAt: new Date().toISOString()
        };

        const existingResults = JSON.parse(localStorage.getItem('eduagent_results_hist') || '[]');
        localStorage.setItem('eduagent_results_hist', JSON.stringify([record, ...existingResults]));
        localStorage.setItem('eduagent_current_result', JSON.stringify(record));

        setActiveModalTool(null);
        router.push(`/results/${resultId}`);
      } else {
        alert(json.error || 'Failed to generate educational analysis.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Error communicating with AI Agent: ' + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40 ring-1 ring-white/20'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/10 backdrop-blur-md'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 15+ educational tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] rounded-xl border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 shadow-inner backdrop-blur-md"
          />
        </div>
      </div>

      {/* Grid of 15 Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => {
          const IconComponent = ICON_MAP[tool.iconName] || FileText;
          const isPro = tool.minTier === 'PRO';
          const suite = getToolSuite(tool.key);

          return (
            <div
              key={tool.key}
              onClick={() => handleToolClick(tool)}
              className={`group relative cursor-pointer rounded-2xl p-5 bg-gradient-to-br ${suite.cardGradient} backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden`}
            >
              {/* Subtle ambient corner flare */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${suite.iconGradient} text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${suite.badgeStyle}`}>
                      {suite.suiteName.replace(' Suite', '')}
                    </span>
                    {isPro ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                        <Lock className="w-2.5 h-2.5" /> PRO
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                        FREE
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                  {tool.title}
                </h4>
                <p className="text-xs text-slate-300/80 mt-1.5 line-clamp-2 leading-relaxed">
                  {tool.shortDesc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-400" /> ~30s run
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90 group-hover:text-white transition-colors bg-white/5 group-hover:bg-white/15 px-3 py-1.5 rounded-lg border border-white/10 group-hover:border-white/20 shadow-sm">
                  <span>Launch</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parameter Dialog */}
      {activeModalTool && (
        <ToolParameterModal
          tool={activeModalTool}
          userTier={userTier}
          isRunning={isRunning}
          onClose={() => setActiveModalTool(null)}
          onRun={handleRunTool}
        />
      )}
    </div>
  );
}
