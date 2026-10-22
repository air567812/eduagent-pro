'use client';

import React, { useState } from 'react';
import { ExtendedToolConfig } from '@/lib/tools-config';
import { X, Sparkles, Sliders, AlertCircle } from 'lucide-react';
import { Tier } from '@/types';

interface ToolParameterModalProps {
  tool: ExtendedToolConfig;
  userTier: Tier;
  onClose: () => void;
  onRun: (params: Record<string, any>) => void;
  isRunning: boolean;
}

export default function ToolParameterModal({
  tool,
  userTier,
  onClose,
  onRun,
  isRunning
}: ToolParameterModalProps) {
  const [params, setParams] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    tool.parameters.forEach((p) => {
      initial[p.name] = p.defaultValue;
    });
    return initial;
  });

  const handleChange = (name: string, value: any) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const isProRequired = tool.minTier === 'PRO' && userTier === 'BASIC';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0c1024]/95 border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(124,58,237,0.25)] space-y-5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 text-white">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                AI Tool Configuration
              </span>
              {tool.minTier === 'PRO' && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40">
                  PRO TIER
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mt-1.5">{tool.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300/80 leading-relaxed">{tool.longDesc}</p>

        {isProRequired && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              This advanced tool requires a <strong>Pro Academic</strong> tier. You will be able to preview standard output in the sandbox.
            </span>
          </div>
        )}

        {/* Dynamic Parameter Fields */}
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {tool.parameters.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-white/[0.03] p-3 rounded-xl border border-white/10 text-center">
              This tool automatically calibrates optimal exam parameters from your uploaded materials.
            </p>
          ) : (
            tool.parameters.map((param) => (
              <div key={param.name} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  {param.label}
                </label>
                {param.type === 'select' && (
                  <select
                    value={params[param.name]}
                    onChange={(e) => handleChange(param.name, e.target.value)}
                    className="w-full text-xs rounded-xl border border-white/10 px-3 py-2.5 bg-white/[0.06] text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50"
                  >
                    {param.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#0c1024] text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                {param.type === 'text' && (
                  <input
                    type="text"
                    value={params[param.name]}
                    onChange={(e) => handleChange(param.name, e.target.value)}
                    placeholder="Enter specific focus or concept..."
                    className="w-full text-xs rounded-xl border border-white/10 px-3 py-2.5 bg-white/[0.06] text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50"
                  />
                )}
                {param.type === 'boolean' && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(params[param.name])}
                      onChange={(e) => handleChange(param.name, e.target.checked)}
                      className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs text-slate-300 font-medium">Enable</span>
                  </label>
                )}
              </div>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onRun(params)}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            {isRunning ? 'Synthesizing with AI Agent...' : 'Generate with Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}
