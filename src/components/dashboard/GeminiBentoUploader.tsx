'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export interface UploadedItem {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'pdf' | 'doc';
  previewUrl?: string;
  status: 'ready' | 'processing' | 'done';
}

interface BentoUploaderProps {
  files: UploadedItem[];
  onFilesChange: (files: UploadedItem[]) => void;
  maxImages?: number;
  isProcessing?: boolean;
}

export default function GeminiBentoUploader({
  files,
  onFilesChange,
  maxImages = 25,
  isProcessing = false
}: BentoUploaderProps) {
  const { warning, success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const imageCount = files.filter((f) => f.type === 'image').length;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processIncomingFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processIncomingFiles = (newFiles: File[]) => {
    const validItems: UploadedItem[] = [];
    let currentImgCount = imageCount;

    for (const f of newFiles) {
      const isImg = f.type.startsWith('image/');
      const isPdf = f.type === 'application/pdf' || f.name.endsWith('.pdf');

      if (isImg) {
        if (currentImgCount >= maxImages) {
          warning(
            'Batch Ceiling Reached',
            `Free tier supports up to ${maxImages} images simultaneously. Upgrade to Educator for 500.`
          );
          break;
        }
        currentImgCount++;
        validItems.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: f.name,
          size: f.size,
          type: 'image',
          previewUrl: URL.createObjectURL(f),
          status: 'ready'
        });
      } else if (isPdf) {
        validItems.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: f.name,
          size: f.size,
          type: 'pdf',
          status: 'ready'
        });
      }
    }

    if (validItems.length > 0) {
      onFilesChange([...files, ...validItems]);
      success('Files Added', `${validItems.length} new materials staged for OCR.`);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Multimodal Bento Drop Zone with Animated Gradient Border */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-3xl p-6 sm:p-8 cursor-pointer overflow-hidden transition-all duration-300 ${
          isDragOver
            ? 'bg-purple-950/40 border-2 border-dashed border-cyan-400 scale-[1.01]'
            : 'bg-white/[0.03] hover:bg-white/[0.06] border-2 border-dashed border-white/[0.15] hover:border-purple-400/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Laser-scan animation bar during processing */}
        {isProcessing && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-laser-scan shadow-[0_0_20px_#a855f7] z-20 pointer-events-none" />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-purple-500/25 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white">
                <UploadCloud className="w-7 h-7 text-cyan-300 animate-bounce" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Gemini Multimodal Dropzone
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-xs">
                  Vision OCR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Drop your syllabus PDFs or up to 25 handwritten notebook photos here.
              </p>
            </div>
          </div>

          {/* Live 25-Image Counter Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3.5 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm ${
                imageCount >= maxImages
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20'
                  : 'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white border-white/[0.15]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {imageCount} / {maxImages} Images
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Thumbnail Grid */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Staged Materials ({files.length} items)</span>
            {isProcessing && (
              <span className="text-cyan-400 flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3.5 h-3.5" /> High-Resolution OCR Ingestion Active...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="relative group rounded-2xl bg-white/[0.04] border border-white/[0.10] p-2 hover:border-purple-400/50 hover:bg-white/[0.08] transition-all shadow-md overflow-hidden"
                >
                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Thumbnail / Icon */}
                  <div className="w-full h-20 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden">
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-rose-400">
                        <FileText className="w-7 h-7" />
                        <span className="text-[9px] font-black uppercase mt-1">PDF</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] font-semibold text-slate-300 truncate mt-1.5 px-0.5">
                    {file.name}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
