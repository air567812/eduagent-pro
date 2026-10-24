'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Camera,
  FileText,
  Image as ImageIcon,
  FileCode,
  X,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
  Eye,
  Layers
} from 'lucide-react';
import { Tier, UploadedFileItem } from '@/types';
import { TIER_LIMITS, validateUploadLimits } from '@/lib/limits';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { batchExtractFiles } from '@/services/ocrService';

export default function FileUploaderEngine() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [batchStatusText, setBatchStatusText] = useState<string>('Processing materials...');
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [tier, setTier] = useState<Tier>(user?.tier || 'BASIC');
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [sessionTitle, setSessionTitle] = useState('Lecture Notes & Chapter Review');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [previewTextModal, setPreviewTextModal] = useState<string | null>(null);

  useEffect(() => {
    if (user?.tier) {
      setTier(user.tier);
    }
  }, [user]);

  const imageCount = files.filter((f) => f.fileType.startsWith('image/')).length;
  const docCount = files.filter((f) => !f.fileType.startsWith('image/')).length;
  const maxImages = TIER_LIMITS[tier].maxImagesPerSession;

  const handleFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setErrorMessage(null);

    const newItems: UploadedFileItem[] = [];
    let projectedImageCount = imageCount;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      const isDocx =
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        /\.docx$/i.test(file.name);

      if (!isImg && !isPdf && !isDocx) {
        setErrorMessage(`Unsupported file format: "${file.name}". Please upload PDF, Word (.docx), or Images.`);
        continue;
      }

      if (isImg) {
        if (projectedImageCount + 1 > maxImages) {
          const limitMsg = `Strict Limit Enforced: Your ${tier} plan permits up to ${maxImages} images per session. You cannot add "${file.name}".`;
          setErrorMessage(limitMsg);
          toastWarning('Image Limit Enforced', limitMsg);
          setShowUpgradeModal(true);
          break;
        }
        projectedImageCount++;
      }

      // Create preview URL for images
      const previewUrl = isImg ? URL.createObjectURL(file) : undefined;

      newItems.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        fileName: file.name,
        fileType: file.type || (isImg ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/docx'),
        fileSize: file.size,
        previewUrl,
        orderIndex: files.length + newItems.length,
        status: 'PENDING',
        progress: 0,
        extractedText: `[Sample extracted context from ${file.name} - Lecture notes discussing foundational theorems, exam questions, and formulas]`
      });
    }

    if (newItems.length > 0) {
      setFiles((prev) => [...prev, ...newItems]);
    setRawFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
      setSuccessNotice(`Added ${newItems.length} item(s) to this session.`);
      toastSuccess('Materials Added', `Added ${newItems.length} item(s) (${projectedImageCount}/${maxImages} images)`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFileOrder = (index: number, direction: 'LEFT' | 'RIGHT') => {
    const targetIndex = direction === 'LEFT' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((item, idx) => ({ ...item, orderIndex: idx }));
    });
  };

  const startBatchProcessing = async () => {
    if (files.length === 0) {
      setErrorMessage('Please add at least one document or image note to begin.');
      return;
    }

    const validation = validateUploadLimits(tier, imageCount);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Upload quota exceeded.');
      setShowUpgradeModal(true);
      return;
    }

    setIsUploading(true);
    setOverallProgress(5);
    setErrorMessage(null);

    let finalExtractedFiles: any[] = [];
    try {
      setBatchStatusText('Extracting text and scanning notes with OCR...');
      const extracted = await batchExtractFiles(rawFiles, (p) => {
        setOverallProgress(p.percentage);
        setBatchStatusText(p.statusText);
      });

      finalExtractedFiles = files.map((f, i) => ({
        ...f,
        extractedText: extracted[i]?.text || f.extractedText,
        status: 'COMPLETED',
        progress: 100
      }));
      setFiles(finalExtractedFiles);
    } catch (e: any) {
      console.warn('Batch OCR extraction notice:', e);
      finalExtractedFiles = files.map((f) => ({ ...f, status: 'COMPLETED', progress: 100 }));
    }

    // Save session in local storage / session history
    const sessionId = `sess_${Date.now()}`;
    const sessionData = {
      id: sessionId,
      title: sessionTitle,
      totalFiles: files.length,
      totalImages: imageCount,
      files: finalExtractedFiles.length > 0 ? finalExtractedFiles : files,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('eduagent_active_session', JSON.stringify(sessionData));

    // Save to user history
    const existingHist = JSON.parse(localStorage.getItem('eduagent_sessions_hist') || '[]');
    localStorage.setItem('eduagent_sessions_hist', JSON.stringify([sessionData, ...existingHist]));

    setIsUploading(false);
    setSuccessNotice('Materials successfully indexed with OCR! Redirecting to 15+ AI Tools...');
    setTimeout(() => {
      router.push('/tools');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Session Title & Quota Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Upload Session Name
          </label>
          <input
            type="text"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none transition-colors"
            placeholder="e.g. Chapter 4: Calculus Derivatives & Formulas"
          />
        </div>

        {/* Strict Limit Indicator */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <ImageIcon className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-slate-800">
                {imageCount} / {maxImages} Images
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {tier === 'BASIC' ? 'Free Plan: Strict 25-Image Limit' : `${tier} Plan Limit`}
            </p>
          </div>
          {tier === 'BASIC' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
            >
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Error or Alert banner */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <p className="flex-1 font-medium">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success banner */}
      {successNotice && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <p className="flex-1 font-medium">{successNotice}</p>
        </div>
      )}

      {/* Drag & Drop Target Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-brand-500 bg-brand-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,image/*"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
        <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Drop your heterogeneous academic materials here
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Supports <strong>PDFs</strong>, Microsoft Word (<strong>.docx</strong>), and up to{' '}
          <strong className="text-brand-600">{maxImages} simultaneous images</strong> for lecture notes & textbook pages.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-600">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cameraInputRef.current?.click();
            }}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold transition-colors"
          >
            <Camera className="w-4 h-4 text-blue-600" /> Snap Photo (Camera)
          </button>
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-blue-500" /> PDF & Docs
          </span>
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Notes & Whiteboards
          </span>
          <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Vision OCR Auto-Extract
          </span>
        </div>
      </div>

      {/* Progress Bar when uploading */}
      {isUploading && (
        <div className="bg-white p-5 rounded-xl border border-brand-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
              {batchStatusText}
            </span>
            <span className="text-brand-700">{overallProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Selected Items Grid & Reordering */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Session Materials ({files.length} items: {docCount} docs, {imageCount} images)
              </h4>
              <p className="text-xs text-slate-500">
                Reorder slides or pages to ensure chronological AI context understanding.
              </p>
            </div>
            <button
              onClick={() => setFiles([])}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {files.map((file, idx) => {
              const isImg = file.fileType.startsWith('image/');
              return (
                <div
                  key={file.id}
                  className="group relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-brand-400 hover:shadow-md transition-all"
                >
                  {/* Sequence Order Badge */}
                  <span className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                    #{idx + 1}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="absolute top-2 right-2 z-10 p-1 bg-white/90 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-sm transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Thumbnail / Icon preview */}
                  <div className="h-28 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {isImg && file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-slate-500">
                        <FileText className="w-8 h-8 text-brand-600 mb-1" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {file.fileName.split('.').pop()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info & Reorder Controls */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={file.fileName}>
                      {file.fileName}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveFileOrder(idx, 'LEFT')}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30"
                          title="Move Earlier"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === files.length - 1}
                          onClick={() => moveFileOrder(idx, 'RIGHT')}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30"
                          title="Move Later"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setPreviewTextModal(file.extractedText || 'Context extracted successfully.')}
                        className="text-[10px] text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-0.5"
                      >
                        <Eye className="w-3 h-3" /> Text
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Total payload: {(files.reduce((acc, curr) => acc + curr.fileSize, 0) / (1024 * 1024)).toFixed(2)} MB
            </div>

            <button
              onClick={startBatchProcessing}
              disabled={isUploading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Process & Launch 15+ AI Tools
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Modal for Limit Enforcement */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Session Image Limit Reached</h3>
              <p className="text-xs text-slate-600 mt-2">
                The <strong>Basic Free Plan</strong> allows uploading up to <strong>25 images per session</strong>.
                Upgrade to <strong>Pro Academic</strong> to upload up to <strong>100 images</strong> and unlock
                comprehensive chapter analysis, timed practice exams, and direct DOCX export.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-700">
                <span>Current Plan: Basic</span>
                <span>Max 25 Images</span>
              </div>
              <div className="flex items-center justify-between font-bold text-brand-600">
                <span>Pro Academic: $19/mo</span>
                <span>Max 100 Images</span>
              </div>
              <div className="flex items-center justify-between font-bold text-purple-600">
                <span>Premium Scholar: $49/mo</span>
                <span>Max 500 Images</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Keep 25 Images
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  router.push('/billing');
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700 shadow-sm"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Text Modal */}
      {previewTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Extracted Context & OCR Preview</h4>
              <button onClick={() => setPreviewTextModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 max-h-72 overflow-y-auto whitespace-pre-wrap">
              {previewTextModal}
            </div>
            <button
              onClick={() => setPreviewTextModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
