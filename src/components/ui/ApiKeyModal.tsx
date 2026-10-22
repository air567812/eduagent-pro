'use client';

import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, X, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (hasKey: boolean) => void;
}

export default function ApiKeyModal({ isOpen, onClose, onKeyUpdated }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/settings/api-key');
      const data = await res.json();
      if (data.configured) {
        setIsConfigured(true);
        setMaskedKey(data.maskedKey);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsConfigured(true);
        setMaskedKey(data.maskedKey);
        localStorage.setItem('eduagent_openai_key', apiKey.trim());
        setStatusMessage({
          type: 'success',
          text: '✅ OpenAI API connection verified! Live gpt-4o models are now active.'
        });
        if (onKeyUpdated) onKeyUpdated(true);
        setApiKey('');
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to verify key with OpenAI.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Network error saving key.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">OpenAI API Key</h3>
              <p className="text-[11px] text-slate-500">Live gpt-4o &amp; vision execution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-slate-700">
              {isConfigured ? 'Live OpenAI Key Active' : 'Sandbox Fallback Active'}
            </span>
          </div>
          {isConfigured && maskedKey && (
            <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              {maskedKey}
            </span>
          )}
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveKey} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enter OpenAI Secret Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-proj-... or sk-..."
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Keys are tested with a live test handshake and encrypted on your server. Get your key from the{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:underline font-semibold inline-flex items-center gap-0.5"
            >
              OpenAI Dashboard <ExternalLink className="w-3 h-3" />
            </a>.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {loading ? 'Testing Key...' : 'Verify & Activate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
