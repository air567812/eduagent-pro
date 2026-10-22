'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Paperclip,
  Send,
  Sparkles,
  Sliders,
  Globe,
  Award,
  BookOpen,
  ChevronUp,
  X
} from 'lucide-react';
import { EDUCATIONAL_TOOLS } from '@/lib/tools-config';
import { ToolType } from '@/types';

interface CommandDockProps {
  onExecute: (toolKey: ToolType, prompt: string, params: any) => void;
  onOpenUploadModal: () => void;
  stagedFilesCount: number;
  isGenerating: boolean;
}

export default function LlamaCommandDock({
  onExecute,
  onOpenUploadModal,
  stagedFilesCount,
  isGenerating
}: CommandDockProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolType>('IMPORTANT_QUESTIONS');
  const [difficulty, setDifficulty] = useState<'STANDARD' | 'RIGOROUS' | 'COMPETITIVE'>('RIGOROUS');
  const [marksFormat, setMarksFormat] = useState<'5_MARKS' | '10_MARKS' | '16_MARKS'>('10_MARKS');
  const [language, setLanguage] = useState<'ENGLISH' | 'HINDI' | 'SPANISH' | 'FRENCH'>('ENGLISH');

  const [showToolPicker, setShowToolPicker] = useState(false);
  const [showParamsPicker, setShowParamsPicker] = useState(false);

  const activeToolObj = EDUCATIONAL_TOOLS.find((t) => t.key === selectedTool) || EDUCATIONAL_TOOLS[0];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;
    onExecute(selectedTool, prompt || 'Synthesize complete exam study materials from my uploaded notes and syllabus.', {
      difficulty,
      marksFormat,
      language
    });
    setPrompt('');
  };

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex flex-col items-center px-4 pointer-events-none select-none">
      {/* Tool Picker Modal Overlay */}
      <AnimatePresence>
        {showToolPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto mb-3 max-w-xl w-full p-4 rounded-3xl bg-[#080B16]/95 backdrop-blur-2xl border border-white/[0.15] shadow-[0_20px_50px_rgba(0,0,0,0.7)] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Select AI Exam Agent (15 Available)</span>
              </div>
              <button
                onClick={() => setShowToolPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
              {EDUCATIONAL_TOOLS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setSelectedTool(t.key);
                    setShowToolPicker(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedTool === t.key
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/50 text-white font-bold shadow-sm'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08] text-slate-300'
                  }`}
                >
                  <p className="truncate font-semibold text-[11px]">{t.title}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parameters Picker Popover */}
      <AnimatePresence>
        {showParamsPicker && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="pointer-events-auto mb-3 max-w-md w-full p-4 rounded-3xl bg-[#080B16]/95 backdrop-blur-2xl border border-white/[0.15] shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Exam Parameters
              </span>
              <button onClick={() => setShowParamsPicker(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full text-[11px] font-bold p-1.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white"
                >
                  <option value="STANDARD">Standard Exam</option>
                  <option value="RIGOROUS">Rigorous (Honors)</option>
                  <option value="COMPETITIVE">Competitive / Olympiad</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Marks Format</label>
                <select
                  value={marksFormat}
                  onChange={(e) => setMarksFormat(e.target.value as any)}
                  className="w-full text-[11px] font-bold p-1.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white"
                >
                  <option value="5_MARKS">5 Marks (Short)</option>
                  <option value="10_MARKS">10 Marks (Medium)</option>
                  <option value="16_MARKS">16 Marks (Long / Essay)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full text-[11px] font-bold p-1.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white"
                >
                  <option value="ENGLISH">English</option>
                  <option value="HINDI">Hindi (हिंदी)</option>
                  <option value="SPANISH">Spanish (Español)</option>
                  <option value="FRENCH">French (Français)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill-Shaped Command Dock */}
      <motion.form
        onSubmit={handleSubmit}
        className="pointer-events-auto max-w-3xl w-full p-2 rounded-full bg-[#080B16]/90 backdrop-blur-2xl border border-white/[0.18] shadow-[0_15px_45px_rgba(0,0,0,0.7)] flex items-center gap-2"
      >
        {/* Tool Selector Pill */}
        <button
          type="button"
          onClick={() => setShowToolPicker(!showToolPicker)}
          className="flex-shrink-0 pl-3 pr-2.5 py-2 rounded-full bg-gradient-to-r from-purple-500/25 via-pink-500/20 to-indigo-500/25 border border-purple-400/40 text-xs font-bold text-white flex items-center gap-1.5 hover:opacity-95 shadow-xs transition-all"
        >
          <Wand2 className="w-3.5 h-3.5 text-pink-400" />
          <span className="max-w-[120px] sm:max-w-[150px] truncate">{activeToolObj.title}</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Paperclip Material Uploader Button */}
        <button
          type="button"
          onClick={onOpenUploadModal}
          className="relative flex-shrink-0 p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white border border-white/[0.1] transition-colors"
          title="Add Materials / Images"
        >
          <Paperclip className="w-4 h-4" />
          {stagedFilesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-xs">
              {stagedFilesCount}
            </span>
          )}
        </button>

        {/* Main Text Input Field */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Instruct ${activeToolObj.title} (e.g. "Focus on Chapter 4 derivations")...`}
          className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none px-2"
        />

        {/* Quick Parameters Filter Pill */}
        <button
          type="button"
          onClick={() => setShowParamsPicker(!showParamsPicker)}
          className="hidden sm:flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-bold text-slate-300 border border-white/[0.08] transition-colors"
        >
          <Sliders className="w-3 h-3 text-cyan-400" />
          <span>{difficulty}</span>
        </button>

        {/* Animated Gradient Send Button */}
        <motion.button
          type="submit"
          disabled={isGenerating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 disabled:opacity-50 transition-all"
        >
          {isGenerating ? (
            <Sparkles className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4 text-white translate-x-0.5" />
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}
