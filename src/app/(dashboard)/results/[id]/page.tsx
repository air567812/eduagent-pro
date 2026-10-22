'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResultViewer from '@/components/results/ResultViewer';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function ResultDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    // 1. Try reading from currently active result or history in localStorage
    const currentStr = localStorage.getItem('eduagent_current_result');
    if (currentStr) {
      try {
        const cur = JSON.parse(currentStr);
        if (cur.id === resultId) {
          setRecord(cur);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    const hist = JSON.parse(localStorage.getItem('eduagent_results_hist') || '[]');
    const match = hist.find((h: any) => h.id === resultId);
    if (match) {
      setRecord(match);
      setLoading(false);
      return;
    }

    // Default sample fallback if visited directly
    setRecord({
      id: resultId,
      toolType: 'IMPORTANT_QUESTIONS',
      toolTitle: 'Important Questions for Exams',
      resultData: {
        title: 'Neural Networks & Gradient Descent Review',
        totalQuestions: 3,
        questions: [
          {
            id: 'q1',
            type: 'SHORT',
            marks: 5,
            question: 'Explain the fundamental mathematical principle underlying backpropagation.',
            syllabusWeightage: 'HIGH',
            expectedLength: '150-200 words',
            modelAnswer: 'The core principle involves minimizing the loss function via partial derivatives of weights using the multivariable chain rule.',
            keyGradingKeywords: ['Gradient descent', 'Chain rule', 'Learning rate']
          }
        ]
      },
      tokensUsed: 850,
      modelName: 'gpt-4o',
      durationMs: 1450
    });
    setLoading(false);
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-xs text-slate-500 font-medium">Retrieving academic report...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-2xl border border-slate-200 space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Result Not Found</h3>
        <p className="text-xs text-slate-500">The requested generation record could not be loaded.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <ResultViewer
      id={record.id}
      toolType={record.toolType}
      toolTitle={record.toolTitle || record.toolType}
      data={record.resultData}
      modelName={record.modelName}
      tokensUsed={record.tokensUsed}
      durationMs={record.durationMs}
      quotaWarning={record.quotaWarning}
    />
  );
}
