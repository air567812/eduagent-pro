'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
  Camera,
  FolderOpen
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
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
            'Batch Limit Reached',
            `Batch supports up to ${maxImages} notes photos simultaneously.`
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
      success('Files Added', `${validItems.length} new materials staged for analysis.`);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Multimodal Bento Drop Zone with Enterprise Styling */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl p-5 sm:p-7 cursor-pointer overflow-hidden transition-all duration-200 ${
          isDragOver
            ? 'bg-blue-950/20 border-2 border-dashed border-blue-500 scale-[1.005]'
            : 'bg-[#111827]/70 hover:bg-[#111827]/90 border-2 border-dashed border-slate-700/80 hover:border-blue-500/60 shadow-sm'
        }`}
      >
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse z-20 pointer-events-none" />
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center flex-shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Curriculum Upload & OCR
                </h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Multimodal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Drop syllabus PDFs or up to 25 handwritten notes photos.
              </p>
            </div>
          </div>

          {/* Action Buttons: Camera Snap + Browse Files */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            {/* Mobile Camera Direct Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Take photo of handwritten notes"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>

            {/* Browse Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse</span>
            </button>

            {/* Counter Badge */}
            <div className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>{imageCount}/{maxImages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Gallery Scroll for Mobile, Grid on Desktop */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>Staged Materials ({files.length} items)</span>
            {isProcessing && (
              <span className="text-blue-400 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> High-Resolution OCR Ingestion Active...
              </span>
            )}
          </div>

          {/* Horizontal scroll container on mobile, grid on desktop */}
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none sm:grid sm:grid-cols-4 md:grid-cols-6 sm:overflow-visible">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative flex-shrink-0 w-32 sm:w-auto rounded-xl bg-slate-900/90 border border-slate-800 p-2 group hover:border-blue-500/50 transition-all shadow-sm"
                >
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-slate-900/90 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md"
                    title="Remove item"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Thumbnail */}
                  <div className="w-full h-20 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden">
                    {file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-blue-400">
                        <FileText className="w-6 h-6" />
                        <span className="text-[9px] font-bold uppercase mt-1">PDF</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] font-medium text-slate-300 truncate mt-1.5 px-0.5">
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
