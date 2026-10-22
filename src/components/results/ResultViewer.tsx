'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Check,
  Download,
  Share2,
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
  ChevronRight,
  FolderPlus,
  AlertCircle
} from 'lucide-react';
import { ToolType } from '@/types';
import { formatResultAsMarkdown, triggerBrowserDownload } from '@/lib/export-helpers';

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
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'INTERACTIVE' | 'MARKDOWN' | 'RAW'>('INTERACTIVE');

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // MCQ state: selected answers map: { mcqIndex: selectedOptionIndex }
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

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
    // Generate clean HTML-based formatted document importable by Microsoft Word
    const md = formatResultAsMarkdown(toolType, data);
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${toolTitle} - EduAgent Pro</title>
<style>
body { font-family: Calibri, sans-serif; line-height: 1.6; margin: 40px; }
h1 { color: #026fc7; }
h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
h3 { color: #334155; }
.card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; margin: 15px 0; border-radius: 8px; }
</style>
</head>
<body>
<h1>EduAgent Pro: ${toolTitle}</h1>
<p><em>Generated with ${modelName} | Tokens: ${tokensUsed}</em></p>
<hr/>
<pre style="white-space: pre-wrap; font-family: Calibri, sans-serif;">${md}</pre>
</body>
</html>`;
    triggerBrowserDownload(`eduagent_${toolType.toLowerCase()}_${Date.now()}.doc`, htmlContent, 'application/msword');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Export Toolbar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/tools')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{toolTitle}</h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              {modelName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Completed in {(durationMs / 1000).toFixed(2)}s • {tokensUsed} tokens consumed • Schema validated
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              bookmarked
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Save to Folder"
          >
            {bookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
            <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download Markdown"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">.MD</span>
          </button>

          <button
            onClick={handleDownloadDocx}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export to Word"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">.DOCX</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {quotaWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-4 rounded-2xl flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">OpenAI Account Quota Advisory:</p>
            <p className="text-amber-800 leading-relaxed">{quotaWarning}</p>
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('INTERACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'INTERACTIVE'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Interactive Study Mode
        </button>
        <button
          onClick={() => setActiveTab('MARKDOWN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MARKDOWN'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Formatted Markdown
        </button>
        <button
          onClick={() => setActiveTab('RAW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'RAW'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Raw JSON Schema
        </button>
      </div>

      {/* Main Content Render Area */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[400px]">
        {activeTab === 'RAW' && (
          <pre className="bg-slate-900 text-slate-100 p-5 rounded-xl text-xs font-mono overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}

        {activeTab === 'MARKDOWN' && (
          <div className="prose prose-slate max-w-none text-xs sm:text-sm whitespace-pre-wrap font-sans">
            {formatResultAsMarkdown(toolType, data)}
          </div>
        )}

        {activeTab === 'INTERACTIVE' && (
          <div>
            {/* 1. Flashcard Mode */}
            {toolType === 'FLASHCARD_GENERATOR' && Array.isArray(data?.cards) && (
              <div className="space-y-6 max-w-xl mx-auto py-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>
                    Card {currentCardIndex + 1} of {data.cards.length}
                  </span>
                  <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-extrabold border border-brand-200">
                    {data.cards[currentCardIndex]?.tag || 'General'}
                  </span>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer h-72 rounded-3xl p-8 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 hover:border-brand-500 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between select-none relative group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-[10px] tracking-wider uppercase">
                      {isFlipped ? 'Back (Answer)' : 'Front (Question)'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                      Difficulty: {data.cards[currentCardIndex]?.difficulty}
                    </span>
                  </div>

                  <div className="text-center my-auto">
                    <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                      {isFlipped
                        ? data.cards[currentCardIndex]?.back
                        : data.cards[currentCardIndex]?.front}
                    </p>
                    {!isFlipped && data.cards[currentCardIndex]?.hint && (
                      <p className="text-xs text-brand-600 mt-3 italic">
                        💡 Hint: {data.cards[currentCardIndex]?.hint}
                      </p>
                    )}
                  </div>

                  <p className="text-center text-[11px] text-slate-400 font-medium">
                    Click anywhere to flip card
                  </p>
                </div>

                {/* Flip Navigation Controls */}
                <div className="flex items-center justify-between gap-4">
                  <button
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Flip Card
                  </button>

                  <button
                    disabled={currentCardIndex === data.cards.length - 1}
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex((prev) => Math.min(data.cards.length - 1, prev + 1));
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-sm disabled:opacity-30"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. MCQ Quiz Mode */}
            {toolType === 'MCQ_GENERATOR' && Array.isArray(data?.mcqs) && (
              <div className="space-y-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">
                    {data.testTitle || 'Multiple Choice Questions'} ({data.mcqs.length} Questions)
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    Answered {Object.keys(quizAnswers).length} of {data.mcqs.length}
                  </span>
                </div>

                {data.mcqs.map((mcq: any, qIdx: number) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const selected = quizAnswers[qIdx];
                  const hasAnswered = selected !== undefined;

                  return (
                    <div
                      key={mcq.id || qIdx}
                      className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4"
                    >
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {qIdx + 1}. {mcq.question}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {mcq.options?.map((opt: string, optIdx: number) => {
                          const isCorrect = optIdx === mcq.correctOptionIndex;
                          const isSelected = selected === optIdx;

                          let btnStyle = 'border-slate-200 hover:border-brand-400 bg-slate-50/50 text-slate-800';
                          if (hasAnswered) {
                            if (isCorrect) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                            } else {
                              btnStyle = 'border-slate-200 opacity-50 text-slate-500';
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
                              <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                {letters[optIdx]}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {hasAnswered && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              )}
                              {hasAnswered && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                          <p className="font-bold text-slate-800">Explanation:</p>
                          <p className="text-slate-600 leading-relaxed">{mcq.detailedExplanation}</p>
                          {mcq.distractorRationales && (
                            <div className="pt-2 border-t border-slate-200 mt-2">
                              <p className="text-[11px] font-semibold text-slate-500 mb-1">
                                Why other options are incorrect:
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
            )}

            {/* 3. Important Questions Mode */}
            {toolType === 'IMPORTANT_QUESTIONS' && Array.isArray(data?.questions) && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-900 text-lg">{data.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Exam-oriented questions categorized by marks, expected length, and grading keywords.
                  </p>
                </div>

                <div className="space-y-4">
                  {data.questions.map((q: any, i: number) => (
                    <div
                      key={q.id || i}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">Question #{i + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                            {q.marks} Marks
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {q.type}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              q.syllabusWeightage === 'HIGH'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            Weight: {q.syllabusWeightage}
                          </span>
                        </div>
                      </div>

                      <p className="font-semibold text-slate-800 text-sm leading-snug">{q.question}</p>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Model Answer ({q.expectedLength}):
                        </p>
                        <p className="text-slate-700 leading-relaxed">{q.modelAnswer}</p>

                        {q.keyGradingKeywords && (
                          <div className="pt-2 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Grading Keywords:</span>
                            {q.keyGradingKeywords.map((kw: string, kidx: number) => (
                              <span
                                key={kidx}
                                className="text-[10px] bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.5 rounded"
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

            {/* 4. Feynman Topic Explanation */}
            {toolType === 'EXPLAIN_TOPIC' && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                    The Feynman Technique
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    Demystifying: {data.conceptName}
                  </h3>
                </div>

                {/* ELI5 Callout */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                    🧒 Explain Like I&apos;m 5 Years Old
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed">{data.explainLikeIm5}</p>
                </div>

                {/* Vivid Analogy */}
                {data.vividAnalogy && (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      💡 Everyday Analogy: {data.vividAnalogy.analogyTitle}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {data.vividAnalogy.storyOrComparison}
                    </p>
                  </div>
                )}

                {/* Step by step intuition */}
                {data.stepByStepIntuition && (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm">Step-by-Step Intuition</h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {data.stepByStepIntuition.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-2 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bridges to technical terms */}
                {data.bridgeToTechnicalTerms && (
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                      Connecting Plain Words to Exam Technical Terms
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.bridgeToTechnicalTerms.map((b: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <p className="text-slate-500 font-medium">Intuitive Idea:</p>
                          <p className="font-semibold text-slate-800">&quot;{b.plainWord}&quot;</p>
                          <p className="text-brand-600 font-bold mt-1">Exam Term: {b.technicalTerm}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Generic Structured Renderer for other tools (Summaries, Reports, Practice Tests) */}
            {toolType !== 'FLASHCARD_GENERATOR' &&
              toolType !== 'MCQ_GENERATOR' &&
              toolType !== 'IMPORTANT_QUESTIONS' &&
              toolType !== 'EXPLAIN_TOPIC' && (
                <div className="prose prose-slate max-w-none text-xs sm:text-sm whitespace-pre-wrap font-sans">
                  {formatResultAsMarkdown(toolType, data)}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
