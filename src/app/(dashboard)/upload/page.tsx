'use client';

import React from 'react';
import FileUploaderEngine from '@/components/upload/FileUploaderEngine';
import { UploadCloud, Sparkles, CheckCircle2 } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <UploadCloud className="w-3.5 h-3.5 text-brand-600" />
          <span>Heterogeneous Document &amp; Vision OCR Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Upload Your Academic Materials
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload multi-page PDFs, lecture presentations, and up to <strong className="text-slate-800">25 images simultaneously on the Free Plan</strong>.
          Reorder thumbnails to align chapters sequentially before running any of the 15+ AI tools.
        </p>
      </div>

      <FileUploaderEngine />
    </div>
  );
}
