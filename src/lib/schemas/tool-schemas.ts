import { z } from 'zod';

// 1. Important Questions Schema
export const ImportantQuestionsSchema = z.object({
  title: z.string().describe('Title or syllabus module name'),
  totalQuestions: z.number(),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['OBJECTIVE', 'SHORT', 'LONG']),
      marks: z.number(),
      question: z.string(),
      syllabusWeightage: z.enum(['HIGH', 'MEDIUM', 'LOW']),
      expectedLength: z.string().describe('e.g. 50 words, 250 words'),
      modelAnswer: z.string(),
      keyGradingKeywords: z.array(z.string())
    })
  )
});

// 2. Summarize Topic Schema
export const SummarizeTopicSchema = z.object({
  topicTitle: z.string(),
  executiveSummary: z.string(),
  coreConcepts: z.array(
    z.object({
      name: z.string(),
      definition: z.string(),
      realWorldExample: z.string()
    })
  ),
  formulasOrTheorems: z.array(
    z.object({
      name: z.string(),
      formula: z.string(),
      variables: z.string(),
      application: z.string()
    })
  ),
  commonExamPitfalls: z.array(z.string())
});

// 3. Summarize Chapter Schema
export const SummarizeChapterSchema = z.object({
  chapterTitle: z.string(),
  estimatedReadingTimeMin: z.number(),
  overallSynthesis: z.string(),
  sections: z.array(
    z.object({
      sectionHeading: z.string(),
      summary: z.string(),
      keyTakeaways: z.array(z.string()),
      notableQuoteOrFact: z.string().optional()
    })
  )
});

// 4. Quick Summary Schema
export const QuickSummarySchema = z.object({
  tldr: z.string(),
  highYieldBullets: z.array(z.string()),
  essentialGlossary: z.array(
    z.object({
      term: z.string(),
      definition: z.string()
    })
  )
});

// 5. Detailed Academic Report Schema
export const DetailedReportSchema = z.object({
  reportTitle: z.string(),
  abstract: z.string(),
  tableOfContents: z.array(z.string()),
  introduction: z.string(),
  thematicAnalysis: z.array(
    z.object({
      sectionTitle: z.string(),
      analysisContent: z.string(),
      citations: z.array(z.string())
    })
  ),
  methodologyOrTheoreticalLens: z.string(),
  criticalEvaluation: z.string(),
  conclusion: z.string(),
  referencesList: z.array(z.string())
});

// 6. Important Points and Notes Schema
export const ImportantPointsNotesSchema = z.object({
  subjectName: z.string(),
  definitions: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
      category: z.string()
    })
  ),
  theoremsAndLaws: z.array(
    z.object({
      name: z.string(),
      statement: z.string(),
      significance: z.string()
    })
  ),
  formulasAndUnits: z.array(
    z.object({
      formula: z.string(),
      units: z.string(),
      context: z.string()
    })
  ),
  memoryMnemonics: z.array(
    z.object({
      mnemonicPhrase: z.string(),
      targetConcept: z.string(),
      howToUse: z.string()
    })
  )
});

// 7. Question and Answer Generator Schema
export const QAGeneratorSchema = z.object({
  title: z.string(),
  qaPairs: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      category: z.string(),
      modelAnswer: z.string(),
      keyPointsForScoring: z.array(z.string())
    })
  )
});

// 8. MCQ Generator Schema
export const MCQGeneratorSchema = z.object({
  testTitle: z.string(),
  totalQuestions: z.number(),
  mcqs: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()).length(4), // A, B, C, D
      correctOptionIndex: z.number().min(0).max(3),
      detailedExplanation: z.string(),
      distractorRationales: z.array(z.string()).describe('Explanation for why incorrect choices are wrong')
    })
  )
});

// 9. Short and Long Answers Schema
export const ShortLongAnswersSchema = z.object({
  subject: z.string(),
  answers: z.array(
    z.object({
      id: z.string(),
      marksTier: z.enum(['2_MARKS', '5_MARKS', '10_MARKS']),
      question: z.string(),
      idealAnswer: z.string(),
      structureBreakdown: z.array(z.string()),
      examinerTip: z.string()
    })
  )
});

// 10. Revision Notes Schema
export const RevisionNotesSchema = z.object({
  subject: z.string(),
  examReadinessRating: z.string(),
  lastMinuteCheatSheet: z.array(z.string()),
  commonMistakesThatCostMarks: z.array(
    z.object({
      mistake: z.string(),
      correction: z.string()
    })
  ),
  speedFormulas: z.array(z.string())
});

// 11. Topic-Wise Analysis Schema
export const TopicWiseAnalysisSchema = z.object({
  chapterName: z.string(),
  prerequisiteConcepts: z.array(z.string()),
  cognitiveComplexityLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  learningModules: z.array(
    z.object({
      moduleNumber: z.number(),
      title: z.string(),
      bloomsTaxonomyLevel: z.string(),
      learningOutcome: z.string(),
      subtopics: z.array(z.string()),
      estimatedStudyHours: z.number()
    })
  )
});

// 12. Explain This Topic (Feynman Technique) Schema
export const ExplainTopicSchema = z.object({
  conceptName: z.string(),
  explainLikeIm5: z.string().describe('Super simple, childlike intuitive explanation with zero jargon'),
  vividAnalogy: z.object({
    analogyTitle: z.string(),
    storyOrComparison: z.string()
  }),
  stepByStepIntuition: z.array(z.string()),
  commonMisconceptions: z.array(z.string()),
  bridgeToTechnicalTerms: z.array(
    z.object({
      plainWord: z.string(),
      technicalTerm: z.string()
    })
  )
});

// 13. Flashcard Generator Schema
export const FlashcardGeneratorSchema = z.object({
  deckTitle: z.string(),
  totalCards: z.number(),
  cards: z.array(
    z.object({
      id: z.string(),
      front: z.string().describe('The prompt or question'),
      back: z.string().describe('The concise answer'),
      hint: z.string().optional(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
      tag: z.string()
    })
  )
});

// 14. Practice Test Generator Schema
export const PracticeTestGeneratorSchema = z.object({
  examTitle: z.string(),
  totalMarks: z.number(),
  durationMinutes: z.number(),
  instructions: z.array(z.string()),
  sections: z.array(
    z.object({
      sectionName: z.string(),
      sectionMarks: z.number(),
      questions: z.array(
        z.object({
          questionNumber: z.number(),
          marks: z.number(),
          prompt: z.string(),
          answerKeyOrCriteria: z.string()
        })
      )
    })
  ),
  markingRubric: z.string()
});

// 15. Assignment Assistant Schema
export const AssignmentAssistantSchema = z.object({
  title: z.string(),
  assignmentType: z.string(),
  thesisStatement: z.string(),
  structuralOutline: z.array(
    z.object({
      sectionHeading: z.string(),
      targetWordCount: z.number(),
      argumentPoints: z.array(z.string()),
      suggestedEvidenceTypes: z.array(z.string())
    })
  ),
  sampleIntroductionDraft: z.string(),
  academicVocabularyList: z.array(z.string())
});

export const SCHEMAS_BY_TOOL: Record<string, z.ZodTypeAny> = {
  IMPORTANT_QUESTIONS: ImportantQuestionsSchema,
  SUMMARIZE_TOPIC: SummarizeTopicSchema,
  SUMMARIZE_CHAPTER: SummarizeChapterSchema,
  QUICK_SUMMARY: QuickSummarySchema,
  DETAILED_REPORT: DetailedReportSchema,
  IMPORTANT_POINTS_NOTES: ImportantPointsNotesSchema,
  QA_GENERATOR: QAGeneratorSchema,
  MCQ_GENERATOR: MCQGeneratorSchema,
  SHORT_LONG_ANSWERS: ShortLongAnswersSchema,
  REVISION_NOTES: RevisionNotesSchema,
  TOPIC_WISE_ANALYSIS: TopicWiseAnalysisSchema,
  EXPLAIN_TOPIC: ExplainTopicSchema,
  FLASHCARD_GENERATOR: FlashcardGeneratorSchema,
  PRACTICE_TEST_GENERATOR: PracticeTestGeneratorSchema,
  ASSIGNMENT_ASSISTANT: AssignmentAssistantSchema
};
