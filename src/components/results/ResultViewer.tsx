'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Check,
  Download,
  Bookmark,
  BookmarkCheck,
  Printer,
  RotateCw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  HelpCircle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  AlertCircle,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Code2,
  GraduationCap
} from 'lucide-react';
import { ToolType } from '@/types';
import { formatResultAsMarkdown, triggerBrowserDownload } from '@/lib/export-helpers';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface ResultViewerProps {
  id: string;
  toolType: ToolType;
  toolTitle: string;
  data: any;
  modelName?: string;
  tokensUsed?: number;
  durationMs?: number;
  quotaWarning?: string;
}

export default function ResultViewer({
  id,
  toolType,
  toolTitle,
  data,
  modelName = 'gpt-4o',
  tokensUsed = 850,
  durationMs = 1200,
  quotaWarning
}: ResultViewerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'INTERACTIVE' | 'MARKDOWN' | 'RAW'>('INTERACTIVE');

  const handleSaveToCloud = async () => {
    try {
      const targetUid = user?.id || user?.uid || 'guest_user';
      await addDoc(collection(db, 'generations'), {
        userId: targetUid,
        userEmail: user?.email || 'guest@eduagent.pro',
        toolType,
        toolTitle,
        data,
        tokensUsed,
        modelName,
        createdAt: serverTimestamp()
      });
      setBookmarked(true);
      toastSuccess('Saved to Cloud Library', `${toolTitle} saved to your Firestore account.`);
    } catch (err: any) {
      console.warn('Firestore cloud save advisory:', err);
      const saved = JSON.parse(localStorage.getItem('eduagent_saved_generations') || '[]');
      saved.unshift({ id: `gen_${Date.now()}`, toolType, toolTitle, data, savedAt: new Date().toISOString() });
      localStorage.setItem('eduagent_saved_generations', JSON.stringify(saved));
      setBookmarked(true);
      toastSuccess('Saved to Library', `${toolTitle} saved to your workspace.`);
    }
  };

  // 1. Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<number, boolean>>({});

  // 2. MCQ state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  // 3. Timed Mock Test state
  const initialDuration = (data?.durationMinutes || 20) * 60;
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [activeTestSection, setActiveTestSection] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // 4. Feynman Topic state
  const [feynmanLevel, setFeynmanLevel] = useState<'ELI5' | 'ANALOGY' | 'TECHNICAL'>('ELI5');

  // Timer countdown hook for Practice Test
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0 && !isTestSubmitted) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTestSubmitted(true);
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, isTestSubmitted]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyMarkdown = () => {
    const md = formatResultAsMarkdown(toolType, data);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = formatResultAsMarkdown(toolType, data);
    triggerBrowserDownload(`eduagent_${toolType.toLowerCase()}_${Date.now()}.md`, md, 'text/markdown');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = () => {
    const md = formatResultAsMarkdown(toolType, data);
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${toolTitle} - EduAgent Pro</title>
<style>
body { font-family: 'Segoe UI', Calibri, sans-serif; line-height: 1.6; margin: 40px; color: #0f172a; }
h1 { color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
h2 { color: #1e293b; margin-top: 24px; }
.card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; margin: 12px 0; border-radius: 8px; }
pre { background: #f1f5f9; padding: 12px; border-radius: 6px; font-family: monospace; }
</style>
</head>
<body>
<h1>EduAgent Pro: ${toolTitle}</h1>
<p><em>Generated by EduAgent Pro AI Engine | Model: ${modelName}</em></p>
<hr/>
<pre style="white-space: pre-wrap; font-family: 'Segoe UI', sans-serif;">${md}</pre>
</body>
</html>`;
    triggerBrowserDownload(`eduagent_${toolType.toLowerCase()}_${Date.now()}.doc`, htmlContent, 'application/msword');
  };

  // MCQ score calculations
  const totalMCQs = Array.isArray(data?.mcqs) ? data.mcqs.length : 0;
  const answeredCount = Object.keys(quizAnswers).length;
  let correctCount = 0;
  if (totalMCQs > 0) {
    data.mcqs.forEach((m: any, idx: number) => {
      if (quizAnswers[idx] === m.correctOptionIndex) correctCount++;
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Export Toolbar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/tools')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{toolTitle}</h2>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
              {modelName}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Completed in {(durationMs / 1000).toFixed(2)}s • {tokensUsed} tokens • Schema Validated
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveToCloud}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              bookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Save to Workspace"
          >
            {bookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
            <span>{bookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download Markdown"
          >
            <Download className="w-4 h-4" />
            <span>.MD</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export to Word Document"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>.DOC</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {quotaWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs p-4 rounded-2xl flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Notice:</p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">{quotaWarning}</p>
          </div>
        </div>
      )}

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('INTERACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'INTERACTIVE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Interactive Study Mode
        </button>
        <button
          onClick={() => setActiveTab('MARKDOWN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'MARKDOWN'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Formatted Markdown
        </button>
        <button
          onClick={() => setActiveTab('RAW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'RAW'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Raw JSON Schema
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[420px]">
        {activeTab === 'RAW' && (
          <pre className="bg-slate-900 text-slate-100 p-5 rounded-xl text-xs font-mono overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}

        {activeTab === 'MARKDOWN' && (
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap font-sans">
            {formatResultAsMarkdown(toolType, data)}
          </div>
        )}

        {activeTab === 'INTERACTIVE' && (
          <div>
            {/* TOOL 1: 3D Flip Flashcards */}
            {toolType === 'FLASHCARD_GENERATOR' && Array.isArray(data?.cards) && (
              <div className="space-y-6 max-w-xl mx-auto py-2">
                {/* Deck progress header */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>
                    Card {currentCardIndex + 1} of {data.cards.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
                      {data.cards[currentCardIndex]?.tag || 'General'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                      {data.cards[currentCardIndex]?.difficulty || 'MEDIUM'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${((currentCardIndex + 1) / data.cards.length) * 100}%` }}
                  />
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer min-h-[260px] sm:h-72 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-md hover:shadow-lg transition-all flex flex-col justify-between select-none relative group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-[10px] tracking-wider uppercase text-blue-600">
                      {isFlipped ? 'Back (Solution & Answer)' : 'Front (Question / Prompt)'}
                    </span>
                    <span className="text-[11px] text-slate-400">Tap to flip ↻</span>
                  </div>

                  <div className="text-center my-auto py-4">
                    <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {isFlipped
                        ? data.cards[currentCardIndex]?.back
                        : data.cards[currentCardIndex]?.front}
                    </p>
                    {!isFlipped && data.cards[currentCardIndex]?.hint && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 italic">
                        💡 Hint: {data.cards[currentCardIndex]?.hint}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    <span>
                      {masteredCards[currentCardIndex] ? '⭐ Mastered' : 'Learning'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMasteredCards((prev) => ({
                          ...prev,
                          [currentCardIndex]: !prev[currentCardIndex]
                        }));
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      {masteredCards[currentCardIndex] ? 'Unmark' : 'Mark as Mastered'}
                    </button>
                  </div>
                </div>

                {/* Flip Navigation Controls */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" /> Prev
                  </button>

                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Flip
                  </button>

                  <button
                    disabled={currentCardIndex === data.cards.length - 1}
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex((prev) => Math.min(data.cards.length - 1, prev + 1));
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-sm disabled:opacity-30 transition-all flex items-center justify-center gap-1.5"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TOOL 2: Playable MCQs with Scoring */}
            {toolType === 'MCQ_GENERATOR' && Array.isArray(data?.mcqs) && (
              <div className="space-y-6">
                {/* Score Summary Banner */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {data.testTitle || 'Multiple Choice Questions'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Completed {answeredCount} of {totalMCQs} questions
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Live Score</div>
                      <div className="text-lg font-black text-blue-600">
                        {correctCount} / {totalMCQs} ({totalMCQs > 0 ? Math.round((correctCount / totalMCQs) * 100) : 0}%)
                      </div>
                    </div>
                    {answeredCount > 0 && (
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setShowExplanation({});
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      >
                        Reset Quiz
                      </button>
                    )}
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {data.mcqs.map((mcq: any, qIdx: number) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const selected = quizAnswers[qIdx];
                    const hasAnswered = selected !== undefined;
                    const isCorrectChoice = selected === mcq.correctOptionIndex;

                    return (
                      <div
                        key={mcq.id || qIdx}
                        className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                            {qIdx + 1}. {mcq.question}
                          </h4>
                          {hasAnswered && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                isCorrectChoice
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {isCorrectChoice ? 'Correct (+1)' : 'Incorrect'}
                            </span>
                          )}
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {mcq.options?.map((opt: string, optIdx: number) => {
                            const isCorrect = optIdx === mcq.correctOptionIndex;
                            const isSelected = selected === optIdx;

                            let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200';
                            if (hasAnswered) {
                              if (isCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                              } else if (isSelected) {
                                btnStyle = 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                              } else {
                                btnStyle = 'border-slate-200 dark:border-slate-800 opacity-40 text-slate-400';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={hasAnswered}
                                onClick={() => {
                                  setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                  setShowExplanation((prev) => ({ ...prev, [qIdx]: true }));
                                }}
                                className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                  {letters[optIdx]}
                                </span>
                                <span className="flex-1 leading-snug">{opt}</span>
                                {hasAnswered && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                )}
                                {hasAnswered && isSelected && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Callout */}
                        {hasAnswered && (
                          <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200">Explanation:</p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{mcq.detailedExplanation}</p>
                            {mcq.distractorRationales && mcq.distractorRationales.length > 0 && (
                              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                                <p className="text-[11px] font-semibold text-slate-500 mb-1">
                                  Why incorrect choices fail:
                                </p>
                                <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
                                  {mcq.distractorRationales.map((r: string, idx: number) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TOOL 3: Timed Practice Mock Test */}
            {toolType === 'PRACTICE_TEST_GENERATOR' && (
              <div className="space-y-6">
                {/* Exam Title & Active Countdown Clock */}
                <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Standard Timed Examination
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold mt-1">{data.examTitle || 'Practice Test'}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Total Marks: {data.totalMarks} • Allocated Duration: {data.durationMinutes} Minutes
                    </p>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
                    <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-blue-400'}`} />
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining</div>
                      <div className={`text-lg font-mono font-bold ${timeLeft < 300 ? 'text-rose-400' : 'text-white'}`}>
                        {formatTimer(timeLeft)}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      disabled={isTestSubmitted}
                      className="ml-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    >
                      {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                {data.instructions && data.instructions.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-xs space-y-1.5">
                    <p className="font-bold text-blue-900 dark:text-blue-300">Examination Guidelines:</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-blue-800 dark:text-blue-400">
                      {data.instructions.map((inst: string, i: number) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section Selector */}
                {Array.isArray(data.sections) && data.sections.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {data.sections.map((sec: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestSection(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                          activeTestSection === idx
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {sec.sectionName} ({sec.sectionMarks} Marks)
                      </button>
                    ))}
                  </div>
                )}

                {/* Section Questions */}
                {Array.isArray(data.sections) && data.sections[activeTestSection] && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm border-b pb-2">
                      {data.sections[activeTestSection].sectionName} (Total: {data.sections[activeTestSection].sectionMarks} Marks)
                    </h4>

                    {data.sections[activeTestSection].questions?.map((q: any, qIdx: number) => {
                      const qKey = `${activeTestSection}_${qIdx}`;
                      const isRevealed = revealedAnswers[qKey];

                      return (
                        <div
                          key={qIdx}
                          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              Question {q.questionNumber || qIdx + 1}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                              {q.marks} Marks
                            </span>
                          </div>

                          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                            {q.prompt}
                          </p>

                          {/* Student Answer Scratchpad */}
                          <textarea
                            rows={3}
                            placeholder="Draft your solution / notes here..."
                            className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />

                          {/* Reveal Answer Key Toggle */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setRevealedAnswers((prev) => ({ ...prev, [qKey]: !prev[qKey] }))}
                              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              {isRevealed ? 'Hide Model Answer & Scoring Rubric' : 'View Model Answer & Scoring Rubric'}
                            </button>

                            {isRevealed && (
                              <div className="mt-2.5 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                                <p className="font-bold">Answer Key / Grading Criteria:</p>
                                <p className="leading-relaxed">{q.answerKeyOrCriteria}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Submit Test Button */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    {isTestSubmitted ? 'Test completed.' : 'Ready to finish?'}
                  </span>
                  <button
                    onClick={() => {
                      setIsTestSubmitted(true);
                      setIsTimerRunning(false);
                      // Reveal all answer keys
                      const all: Record<string, boolean> = {};
                      data.sections?.forEach((sec: any, sIdx: number) => {
                        sec.questions?.forEach((_: any, qIdx: number) => {
                          all[`${sIdx}_${qIdx}`] = true;
                        });
                      });
                      setRevealedAnswers(all);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
                  >
                    Submit Test & Reveal Complete Answer Key
                  </button>
                </div>
              </div>
            )}

            {/* TOOL 4: Feynman Topic Explainer (3 Interactive Levels) */}
            {toolType === 'EXPLAIN_TOPIC' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                    The Feynman Technique
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {data.conceptName}
                  </h3>
                </div>

                {/* 3 Level Switcher */}
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFeynmanLevel('ELI5')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      feynmanLevel === 'ELI5'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    🧒 1. Child Intuition (ELI5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeynmanLevel('ANALOGY')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      feynmanLevel === 'ANALOGY'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    💡 2. Vivid Analogy
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeynmanLevel('TECHNICAL')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      feynmanLevel === 'TECHNICAL'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    🏛️ 3. Exam Technical Bridge
                  </button>
                </div>

                {/* Level 1: ELI5 */}
                {feynmanLevel === 'ELI5' && (
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-200 space-y-3">
                    <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
                      🧒 Simple Intuitive Core (Zero Jargon)
                    </h4>
                    <p className="text-sm leading-relaxed">{data.explainLikeIm5}</p>
                  </div>
                )}

                {/* Level 2: Analogy & Intuition */}
                {feynmanLevel === 'ANALOGY' && (
                  <div className="space-y-4">
                    {data.vividAnalogy && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                        <h4 className="font-bold text-blue-600 text-sm">
                          Everyday Story: {data.vividAnalogy.analogyTitle}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {data.vividAnalogy.storyOrComparison}
                        </p>
                      </div>
                    )}

                    {data.stepByStepIntuition && (
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Step-by-Step Logic Flow</h4>
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          {data.stepByStepIntuition.map((s: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Level 3: Technical Bridge & Misconceptions */}
                {feynmanLevel === 'TECHNICAL' && (
                  <div className="space-y-4">
                    {data.bridgeToTechnicalTerms && (
                      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
                          Connecting Plain Concept to Exam Terminology
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {data.bridgeToTechnicalTerms.map((b: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                              <p className="text-slate-500 font-medium">Plain Meaning:</p>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">&quot;{b.plainWord}&quot;</p>
                              <p className="text-blue-600 font-bold mt-1">Exam Technical Term: {b.technicalTerm}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.commonMisconceptions && data.commonMisconceptions.length > 0 && (
                      <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-2">
                        <h4 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500" /> Common Exam Misconceptions to Avoid:
                        </h4>
                        <ul className="list-disc pl-4 space-y-1 text-rose-800 dark:text-rose-400">
                          {data.commonMisconceptions.map((m: string, i: number) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TOOL 5 & 6: Important Questions / Q&A Generator */}
            {(toolType === 'IMPORTANT_QUESTIONS' || toolType === 'QA_GENERATOR') && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    {data.title || 'Exam-Oriented Questions & Model Answers'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Curated high-yield questions with model solutions and marking schemes.
                  </p>
                </div>

                <div className="space-y-4">
                  {(data.questions || data.qaPairs || []).map((q: any, i: number) => (
                    <div
                      key={q.id || i}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Question #{i + 1}</span>
                        <div className="flex items-center gap-1.5">
                          {q.marks && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                              {q.marks} Marks
                            </span>
                          )}
                          {q.syllabusWeightage && (
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                q.syllabusWeightage === 'HIGH'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                              }`}
                            >
                              Weight: {q.syllabusWeightage}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">{q.question}</p>

                      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Model Answer {q.expectedLength ? `(${q.expectedLength})` : ''}:
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{q.modelAnswer}</p>

                        {(q.keyGradingKeywords || q.keyPointsForScoring) && (
                          <div className="pt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Grading Keys:</span>
                            {(q.keyGradingKeywords || q.keyPointsForScoring).map((kw: string, kidx: number) => (
                              <span
                                key={kidx}
                                className="text-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded font-mono"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOOL 7: Short and Long Answers */}
            {toolType === 'SHORT_LONG_ANSWERS' && Array.isArray(data?.answers) && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    {data.subject || 'Subject'} - Structured Tiered Answers
                  </h3>
                </div>

                <div className="space-y-5">
                  {data.answers.map((ans: any, idx: number) => (
                    <div
                      key={ans.id || idx}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Question #{idx + 1}</span>
                        <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                          {ans.marksTier.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ans.question}</h4>

                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                        <p className="font-bold text-slate-700 dark:text-slate-300">Ideal Answer:</p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{ans.idealAnswer}</p>

                        {ans.structureBreakdown && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                            <p className="font-semibold text-slate-500 mb-1">Answer Structure Breakdown:</p>
                            <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                              {ans.structureBreakdown.map((b: string, bIdx: number) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {ans.examinerTip && (
                          <div className="pt-2 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Examiner Tip: {ans.examinerTip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOOL 8: Revision Notes & Cheat Sheets */}
            {toolType === 'REVISION_NOTES' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{data.subject || 'Rapid Revision'}</h3>
                    <p className="text-xs text-slate-500">Last-Minute Exam Readiness</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                    Readiness: {data.examReadinessRating || 'High'}
                  </span>
                </div>

                {data.lastMinuteCheatSheet && (
                  <div className="p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">⚡ High-Yield Cheat Sheet Points:</h4>
                    <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {data.lastMinuteCheatSheet.map((pt: string, pIdx: number) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.commonMistakesThatCostMarks && (
                  <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-3">
                    <h4 className="font-bold text-rose-900 dark:text-rose-300 text-sm">⚠️ Costly Common Mistakes & Corrections:</h4>
                    <div className="space-y-2">
                      {data.commonMistakesThatCostMarks.map((m: any, mIdx: number) => (
                        <div key={mIdx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-100 dark:border-rose-900/50 text-xs">
                          <p className="text-rose-600 font-semibold">❌ Mistake: {m.mistake}</p>
                          <p className="text-emerald-600 font-semibold mt-1">✓ Correct Approach: {m.correction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other tools fallback to rich markdown viewer */}
            {toolType !== 'FLASHCARD_GENERATOR' &&
              toolType !== 'MCQ_GENERATOR' &&
              toolType !== 'PRACTICE_TEST_GENERATOR' &&
              toolType !== 'EXPLAIN_TOPIC' &&
              toolType !== 'IMPORTANT_QUESTIONS' &&
              toolType !== 'QA_GENERATOR' &&
              toolType !== 'SHORT_LONG_ANSWERS' &&
              toolType !== 'REVISION_NOTES' && (
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-wrap font-sans">
                  {formatResultAsMarkdown(toolType, data)}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
