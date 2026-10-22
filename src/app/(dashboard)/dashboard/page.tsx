'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Wand2,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  ChevronRight,
  ShieldAlert,
  Crown,
  FileText,
  Zap,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { ToolType } from '@/types';
import ChatGptSidebar from '@/components/dashboard/ChatGptSidebar';
import ClaudeArtifactCanvas from '@/components/dashboard/ClaudeArtifactCanvas';
import GeminiBentoUploader, { UploadedItem } from '@/components/dashboard/GeminiBentoUploader';
import PerplexityReasoningAccordion from '@/components/dashboard/PerplexityReasoningAccordion';
import LlamaCommandDock from '@/components/dashboard/LlamaCommandDock';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, warning, error: toastError } = useToast();

  // 1. ChatGPT-style Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 2. Multimodal Bento Files State (Gemini-style)
  const [stagedFiles, setStagedFiles] = useState<UploadedItem[]>([]);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  // 3. Claude-style Artifact Canvas state
  const [activeArtifact, setActiveArtifact] = useState<any | null>(null);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);

  // 4. Generation history & active generation
  const [sessions, setSessions] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load local sessions & generations on mount
  useEffect(() => {
    const sessHist = JSON.parse(localStorage.getItem('eduagent_sessions_hist') || '[]');
    setSessions(sessHist);

    const genHist = JSON.parse(localStorage.getItem('eduagent_results_hist') || '[]');
    if (genHist.length === 0) {
      // Pre-seed high-quality study artifacts so user immediately experiences interactive Claude canvas
      const defaultGenerations = [
        {
          id: 'gen_physics_mcq_1',
          toolType: 'MCQ_GENERATOR',
          toolTitle: 'MCQ Exam Generator (Lenz Law & Induction)',
          createdAt: new Date().toISOString(),
          modelName: 'gpt-4o',
          tokensUsed: 1140,
          artifactType: 'MCQ',
          data: {
            questions: [
              {
                question: 'Which fundamental physical law gives the direction of an induced electromotive force (EMF)?',
                options: ["Coulomb's Law", "Lenz's Law", "Ampere's Circuital Law", "Gauss's Law"],
                correctAnswerIndex: 1,
                explanation: "Lenz's Law states that the direction of the induced current is always such as to oppose the change in magnetic flux that produces it, conforming directly to Conservation of Energy."
              },
              {
                question: 'What happens to the induced current in a coil if the relative motion between the magnet and coil ceases?',
                options: ['It doubles', 'It reverses', 'It drops to zero', 'It oscillates periodically'],
                correctAnswerIndex: 2,
                explanation: 'Faraday’s Law stipulates that induced EMF requires a time rate of change of magnetic flux (dΦ/dt). When relative velocity is zero, dΦ/dt = 0, so current is zero.'
              }
            ]
          }
        },
        {
          id: 'gen_calculus_fc_1',
          toolType: 'FLASHCARD_GENERATOR',
          toolTitle: 'Active Recall Flashcards (Green\'s & Stokes\' Theorem)',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          modelName: 'gpt-4o',
          tokensUsed: 890,
          artifactType: 'FLASHCARDS',
          data: {
            flashcards: [
              {
                question: "State Green's Theorem in the Plane.",
                answer: "∮_C (L dx + M dy) = ∬_D (∂M/∂x - ∂L/∂y) dA. It relates a line integral around a simple closed curve C to a double integral over the plane region D bounded by C."
              },
              {
                question: 'When is a vector field F conservative?',
                answer: 'A vector field F is conservative if curl(F) = ∇ × F = 0 throughout a simply-connected domain, which implies the line integral is path-independent and F = ∇f for some scalar potential f.'
              }
            ]
          }
        }
      ];
      localStorage.setItem('eduagent_results_hist', JSON.stringify(defaultGenerations));
      setGenerations(defaultGenerations);
    } else {
      setGenerations(genHist);
    }

    // Default sample staged images if empty
    if (sessHist.length === 0) {
      const sampleSession = [
        {
          id: 'sess_phys_101',
          title: 'Physics Chapter 4 - Electromagnetic Induction',
          totalFiles: 4,
          totalImages: 3,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('eduagent_sessions_hist', JSON.stringify(sampleSession));
      setSessions(sampleSession);
    }
  }, []);

  // Open generation in Claude-style Split-Pane Artifact Canvas
  const handleOpenArtifact = (gen: any) => {
    setActiveArtifact({
      id: gen.id,
      title: gen.toolTitle || gen.toolType,
      type: gen.artifactType || (gen.toolType === 'FLASHCARD_GENERATOR' ? 'FLASHCARDS' : gen.toolType === 'MCQ_GENERATOR' ? 'MCQ' : 'NOTES'),
      data: gen.data,
      createdAt: gen.createdAt
    });
    setIsArtifactOpen(true);
  };

  // Llama Command Dock Execution
  const handleExecutePrompt = async (toolKey: ToolType, promptText: string, params: any) => {
    setIsGenerating(true);
    setIsProcessingOcr(true);

    try {
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolKey,
          sourceText: promptText,
          parameters: params,
          fileIds: stagedFiles.map((f) => f.id)
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Execution failed');

      const newGen = {
        id: `gen_${Date.now()}`,
        toolType: toolKey,
        toolTitle: json.toolTitle || toolKey,
        createdAt: new Date().toISOString(),
        modelName: json.modelUsed || 'gpt-4o',
        tokensUsed: json.tokensUsed || 920,
        artifactType: toolKey === 'FLASHCARD_GENERATOR' ? 'FLASHCARDS' : toolKey === 'MCQ_GENERATOR' ? 'MCQ' : 'NOTES',
        data: json.data
      };

      const updated = [newGen, ...generations];
      setGenerations(updated);
      localStorage.setItem('eduagent_results_hist', JSON.stringify(updated));

      success('AI Artifact Ready!', `Synthesized ${newGen.toolTitle}. Opening Artifact Canvas...`);
      handleOpenArtifact(newGen);
    } catch (err: any) {
      toastError('Generation Note', err.message || 'Execution completed with pedagogical fallback.');
    } finally {
      setIsGenerating(false);
      setIsProcessingOcr(false);
    }
  };

  const isPrimaryAdmin = user?.email?.toLowerCase() === 'arykothari@gmail.com';
  const isSuperAdmin = isPrimaryAdmin || user?.role === 'SUPER_ADMIN';

  return (
    <div className="relative flex gap-4 min-h-[calc(100vh-8rem)] pb-24">
      {/* 1. ChatGPT-Style Collapsible Left Sidebar */}
      <ChatGptSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        onSelectSession={(sess) => {
          success('Study Space Loaded', `Active materials: ${sess.title}`);
        }}
        onNewSession={() => {
          setStagedFiles([]);
          success('New Session Created', 'Drop new lecture notes to start.');
        }}
        onOpenStudySpace={(space) => {
          success('Folder Selected', `Switched to workspace: ${space}`);
        }}
      />

      {/* Main Central Workspace Canvas */}
      <div className="flex-1 space-y-6 min-w-0">
        
        {/* Welcome Cosmic Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-950/80 border border-white/[0.12] backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-pink-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                5-AI Fusion Workspace
              </span>
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400/20 to-rose-500/20 text-amber-300 text-xs font-black border border-amber-400/30">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  SUPER ADMIN • EDUCATOR
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name || 'Ary Nipesh Kothari'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Upload heterogeneous materials (up to 25 images on free tier) or trigger one of 15 specialized exam agents.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <Link
              href="/upload"
              className="px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 shadow-md transition-all flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4 text-purple-600" />
              Batch Uploader
            </Link>
            <Link
              href="/tools"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-500/25 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <Wand2 className="w-4 h-4" />
              15 Tools Bento
            </Link>
            {isSuperAdmin && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-500/35 transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Console
              </Link>
            )}
          </div>
        </div>

        {/* 2. Gemini Multimodal Bento Uploader */}
        <GeminiBentoUploader
          files={stagedFiles}
          onFilesChange={setStagedFiles}
          maxImages={user?.subscriptionTier === 'EDUCATOR' ? 500 : 25}
          isProcessing={isProcessingOcr}
        />

        {/* 3. Perplexity Reasoning Accordion & Source Citations */}
        <PerplexityReasoningAccordion />

        {/* 4. Recent AI Generations Grid (Clicking opens Claude Split-Pane Canvas) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Recent AI Study Artifacts
              <span className="text-xs text-slate-400 font-medium">({generations.length} available)</span>
            </h2>
            {generations.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem('eduagent_results_hist');
                  setGenerations([]);
                }}
                className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {generations.map((gen) => (
              <motion.div
                key={gen.id}
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => handleOpenArtifact(gen)}
                className="group cursor-pointer p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-purple-400/50 shadow-lg transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 text-cyan-300 flex items-center justify-center flex-shrink-0 group-hover:border-purple-400 transition-colors">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-cyan-300 transition-colors">
                      {gen.toolTitle || gen.toolType}
                    </h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{new Date(gen.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{gen.modelName || 'gpt-4o'}</span>
                      <span>•</span>
                      <span className="text-purple-300 font-semibold">{gen.tokensUsed || 920} tokens</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 bg-white/[0.06] px-2 py-1 rounded-lg group-hover:text-white transition-colors">
                    Open Artifact →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Claude-Style Split-Pane Artifact Canvas */}
      <AnimatePresence>
        {isArtifactOpen && (
          <ClaudeArtifactCanvas
            isOpen={isArtifactOpen}
            onClose={() => setIsArtifactOpen(false)}
            artifact={activeArtifact}
          />
        )}
      </AnimatePresence>

      {/* 6. Llama-Style Floating Command Dock */}
      <LlamaCommandDock
        onExecute={handleExecutePrompt}
        onOpenUploadModal={() => {
          router.push('/upload');
        }}
        stagedFilesCount={stagedFiles.length}
        isGenerating={isGenerating}
      />
    </div>
  );
}
