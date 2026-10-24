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
    { id: 'EXAM_SUITE', name: 'Exams & Quizzes' },
    { id: 'SUMMARY_SUITE', name: 'Summaries & Notes' },
    { id: 'ANALYSIS_SUITE', name: 'Analysis & Reports' },
    { id: 'STUDY_SUITE', name: 'Interactive Learning' }
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
          suiteName: 'Exam Suite',
          iconBg: 'bg-blue-600/10 text-blue-400 border border-blue-500/20',
          badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
      case 'SUMMARIZE_TOPIC':
      case 'SUMMARIZE_CHAPTER':
      case 'QUICK_SUMMARY':
      case 'REVISION_NOTES':
        return {
          suiteId: 'SUMMARY_SUITE',
          suiteName: 'Summary Suite',
          iconBg: 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20',
          badgeStyle: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        };
      case 'DETAILED_REPORT':
      case 'IMPORTANT_POINTS_NOTES':
      case 'TOPIC_WISE_ANALYSIS':
      case 'ASSIGNMENT_ASSISTANT':
        return {
          suiteId: 'ANALYSIS_SUITE',
          suiteName: 'Analysis Suite',
          iconBg: 'bg-teal-600/10 text-teal-400 border border-teal-500/20',
          badgeStyle: 'bg-teal-500/10 text-teal-400 border-teal-500/20'
        };
      case 'EXPLAIN_TOPIC':
      case 'FLASHCARD_GENERATOR':
      default:
        return {
          suiteId: 'STUDY_SUITE',
          suiteName: 'Interactive Suite',
          iconBg: 'bg-sky-600/10 text-sky-400 border border-sky-500/20',
          badgeStyle: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
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
        try {
          const sess = JSON.parse(activeSession);
          textToUse =
            sess.files?.map((f: any) => f.extractedText || f.fileName).join('\n\n') || '';
        } catch (_) {}
      }

      if (!textToUse) {
        textToUse = 'Comprehensive lecture notes and core examination curriculum on foundational concepts.';
      }

      const customKey = localStorage.getItem('eduagent_openai_key') || '';
      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customKey) {
        reqHeaders['x-openai-api-key'] = customKey;
      }

      // Execute via /api/tools/execute endpoint
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          toolKey: activeModalTool.key,
          sourceText: textToUse,
          parameters: params,
          apiKey: customKey
        })
      });

      const json = await res.json();
      if (json.success && (json.data || json.result)) {
        const resultId = json.id || `res_${Date.now()}`;
        const resultData = json.data || json.result?.data;
        const record = {
          id: resultId,
          toolType: activeModalTool.key,
          toolTitle: activeModalTool.title,
          parameters: params,
          resultData: resultData,
          tokensUsed: json.tokensUsed || json.result?.tokensUsed || 850,
          modelName: json.modelUsed || json.result?.modelUsed || 'gpt-4o',
          durationMs: json.durationMs || json.result?.durationMs || 1200,
          quotaWarning: json.quotaWarning || json.result?.quotaWarning,
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
      alert('Error running AI Tool: ' + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input (16px on mobile to avoid iOS Safari zoom) */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 15 AI tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-slate-900/60 rounded-xl border border-slate-800 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid: 1-column mobile, 2-column tablet, 3-column desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredTools.map((tool) => {
          const IconComponent = ICON_MAP[tool.iconName] || FileText;
          const isPro = tool.minTier === 'PRO';
          const suite = getToolSuite(tool.key);

          return (
            <div
              key={tool.key}
              onClick={() => handleToolClick(tool)}
              className="group cursor-pointer rounded-2xl p-5 bg-[#111827]/85 backdrop-blur-md border border-slate-800/80 hover:border-blue-500/50 hover:bg-[#111827] transition-all flex flex-col justify-between shadow-sm active:scale-[0.99]"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-xl ${suite.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${suite.badgeStyle}`}>
                      {suite.suiteName}
                    </span>
                    {isPro ? (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> PRO
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        FREE
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                  {tool.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {tool.shortDesc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> ~30s
                </span>
                <div className="min-h-[36px] flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-white transition-colors bg-slate-900 group-hover:bg-blue-600 px-3 py-1.5 rounded-xl border border-slate-800 group-hover:border-blue-500">
                  <span>Launch</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
