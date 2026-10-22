import { ToolDefinition, ToolType } from '@/types';

export interface ExtendedToolConfig extends ToolDefinition {
  systemPrompt: string;
}

export const EDUCATIONAL_TOOLS: ExtendedToolConfig[] = [
  {
    key: 'IMPORTANT_QUESTIONS',
    title: 'Important Questions for Exams',
    shortDesc: 'Exam-oriented subjective & objective questions with marks and syllabus probability.',
    longDesc: 'Analyzes your uploaded materials, syllabus notes, and past trends to extract high-yield questions categorized by 2-mark, 5-mark, and 10-mark weights with model answers.',
    category: 'EXAM_PREP',
    iconName: 'HelpCircle',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are a Senior University Examiner and Academic Specialist. Given the uploaded study notes and curriculum materials, generate high-yield, exam-oriented questions that frequently appear on university and competitive exams. Categorize each question into Objective (MCQ), Short Answer (2-5 marks), or Long Answer (10+ marks), state its syllabus weightage, and provide a model answer with key marking keywords.`,
    parameters: [
      {
        name: 'questionCount',
        label: 'Number of Questions',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: '5 Questions', value: '5' },
          { label: '10 Questions', value: '10' },
          { label: '15 Questions', value: '15' }
        ]
      },
      {
        name: 'difficulty',
        label: 'Difficulty Level',
        type: 'select',
        defaultValue: 'MODERATE',
        options: [
          { label: 'Foundational', value: 'EASY' },
          { label: 'Standard Exam', value: 'MODERATE' },
          { label: 'Challenging / Competitive', value: 'HARD' }
        ]
      }
    ]
  },
  {
    key: 'SUMMARIZE_TOPIC',
    title: 'Summarize This Topic',
    shortDesc: 'Concise, structured breakdown of core principles, formulas, and pitfalls.',
    longDesc: 'Synthesizes complex topics into intuitive executive summaries, core principles, fundamental formulas, and common exam traps.',
    category: 'SUMMARIES',
    iconName: 'FileText',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are an expert pedagogical summarizer. Extract the core essence of the specified topic from the source materials. Structure the response into an Executive Summary, Core Foundational Principles with concrete examples, Mathematical/Theoretical Formulas (with variable definitions), and Common Traps/Pitfalls students make on exams.`,
    parameters: [
      {
        name: 'targetTopic',
        label: 'Specific Topic (Leave blank for full material)',
        type: 'text',
        defaultValue: ''
      },
      {
        name: 'depth',
        label: 'Summary Depth',
        type: 'select',
        defaultValue: 'COMPREHENSIVE',
        options: [
          { label: 'Quick Executive Summary', value: 'QUICK' },
          { label: 'Comprehensive Topic Breakdown', value: 'COMPREHENSIVE' }
        ]
      }
    ]
  },
  {
    key: 'SUMMARIZE_CHAPTER',
    title: 'Summarize This Chapter',
    shortDesc: 'Section-by-section breakdown with reading time and overall synthesis.',
    longDesc: 'Takes long chapter transcripts or PDF sections and produces an organized section-by-section outline with key takeaways.',
    category: 'SUMMARIES',
    iconName: 'BookOpen',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are a Textbook Editor and Curriculum Master. Deconstruct the uploaded chapter into its natural sections. For each section, provide a clear heading, an easy-to-read narrative summary, and 3-5 bulleted key takeaways. Conclude with an overall synthesis tying all sections together.`,
    parameters: [
      {
        name: 'includeQuotes',
        label: 'Include Key Source Quotes',
        type: 'boolean',
        defaultValue: true
      }
    ]
  },
  {
    key: 'QUICK_SUMMARY',
    title: 'Quick Summary',
    shortDesc: 'Executive overview designed for rapid review in under 3 minutes.',
    longDesc: 'Rapid 3-minute TL;DR synthesis with bulleted takeaways and essential vocabulary.',
    category: 'SUMMARIES',
    iconName: 'Zap',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o-mini',
    systemPrompt: `You are a fast-pace executive learning coach. Produce a high-octane 3-minute review of the uploaded material: a one-paragraph TL;DR, exactly 5-7 punchy bullet points of highest significance, and a glossary of 4-6 essential terms and their 1-sentence meanings.`,
    parameters: []
  },
  {
    key: 'DETAILED_REPORT',
    title: 'Detailed Academic Report',
    shortDesc: 'In-depth research report with abstract, analysis, and citations.',
    longDesc: 'Constructs an exhaustive academic document with background literature, analytical sections, critical evaluations, and formal citations.',
    category: 'WRITING',
    iconName: 'Layers',
    minTier: 'PRO',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are a distinguished Academic Scholar and Research Fellow. Write an exhaustive, rigorous academic report based strictly on the uploaded source materials. Structure with an Academic Abstract, Table of Contents, Detailed Thematic Analysis sections with source citations, Comparative Findings, and Scholarly Conclusions.`,
    parameters: [
      {
        name: 'citationStyle',
        label: 'Citation Style',
        type: 'select',
        defaultValue: 'APA',
        options: [
          { label: 'APA 7th', value: 'APA' },
          { label: 'IEEE', value: 'IEEE' },
          { label: 'Harvard', value: 'HARVARD' }
        ]
      }
    ]
  },
  {
    key: 'IMPORTANT_POINTS_NOTES',
    title: 'Important Points and Notes',
    shortDesc: 'Extracted definitions, laws, formulas, and memory mnemonics.',
    longDesc: 'Isolates high-value academic nuggets: formal definitions, scientific/mathematical laws, equation breakdowns, and clever mnemonic memory aids.',
    category: 'EXAM_PREP',
    iconName: 'CheckSquare',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are a High-Performance Study Coach. Scan the provided materials and isolate every crucial definition, fundamental theorem, equation, and law. For difficult concepts, devise creative and memorable mnemonics to help students retain the information under exam stress.`,
    parameters: []
  },
  {
    key: 'QA_GENERATOR',
    title: 'Question and Answer Generator',
    shortDesc: 'Comprehensive Q&A pairs formatted for study sessions and self-testing.',
    longDesc: 'Generates pairs of insightful academic questions alongside thorough model answers that explain not just the "what" but the "why".',
    category: 'ASSESSMENT',
    iconName: 'MessageSquare',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are an Academic Tutor. Generate a rigorous set of Question and Answer pairs based on the provided material. Ensure answers are pedagogical, comprehensive, point-by-point, and mention key phrases that graders look for.`,
    parameters: [
      {
        name: 'count',
        label: 'Number of Q&A Pairs',
        type: 'select',
        defaultValue: '8',
        options: [
          { label: '5 Pairs', value: '5' },
          { label: '8 Pairs', value: '8' },
          { label: '12 Pairs', value: '12' }
        ]
      }
    ]
  },
  {
    key: 'MCQ_GENERATOR',
    title: 'MCQ Generator with Distractor Analysis',
    shortDesc: 'Multiple-choice questions with answer keys and distractor rationale.',
    longDesc: 'Builds competitive exam-level MCQs where incorrect choices (distractors) represent plausible misconceptions, with complete pedagogical explanations.',
    category: 'ASSESSMENT',
    iconName: 'ListOrdered',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are a Psychometric Assessment Specialist. Construct exam-standard Multiple Choice Questions (MCQs) from the text. For each question provide 4 distinct options (A, B, C, D), identify the correct answer, provide a detailed overall explanation, and provide distractor rationales explaining exactly why each wrong choice is incorrect.`,
    parameters: [
      {
        name: 'questionCount',
        label: 'Number of MCQs',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: '5 Questions', value: '5' },
          { label: '10 Questions', value: '10' },
          { label: '20 Questions', value: '20' }
        ]
      }
    ]
  },
  {
    key: 'SHORT_LONG_ANSWERS',
    title: 'Short and Long Answers (Marks-Calibrated)',
    shortDesc: 'Answers formatted specifically for 2-mark, 5-mark, and 10-mark exam questions.',
    longDesc: 'Calibrates response density, structure, diagrams/points to meet specific exam marking schemes.',
    category: 'EXAM_PREP',
    iconName: 'FileCheck',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are a Senior Board Examination Grader. Given the uploaded subject content, produce calibrated answers tailored for standard exam rubrics: 2-mark questions (precise definition + 2 bullet points), 5-mark questions (conceptual breakdown + diagram description + 4 points), and 10-mark questions (in-depth essay with intro, body subsections, case example, and conclusion).`,
    parameters: []
  },
  {
    key: 'REVISION_NOTES',
    title: 'High-Yield Revision Notes',
    shortDesc: 'Bulleted cheat sheet designed for the night before the exam.',
    longDesc: 'Eliminates fluff and packs maximum yield into compact, memorable bullet points, formula reference cards, and common mistakes.',
    category: 'EXAM_PREP',
    iconName: 'ClipboardList',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are the Author of Top-Scorer Revision Handbooks. Create a high-density, bulleted revision cheat sheet. Focus on high-yield exam topics, common traps where students lose marks, and a rapid formula/definition reference card.`,
    parameters: []
  },
  {
    key: 'TOPIC_WISE_ANALYSIS',
    title: 'Topic-Wise Learning Analysis',
    shortDesc: 'Deconstructs chapters into prerequisite trees and modular units.',
    longDesc: 'Maps out knowledge dependencies, blooms taxonomy levels, and sequential learning units to help students master concepts progressively.',
    category: 'ANALYSIS',
    iconName: 'GitFork',
    minTier: 'PRO',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are an Instructional Designer and Cognitive Learning Architect. Deconstruct the source document into modular, progressive learning units. Identify foundational prerequisites, classify each module by Bloom's Taxonomy cognitive depth (Remember, Understand, Apply, Analyze), and specify clear learning outcomes.`,
    parameters: []
  },
  {
    key: 'EXPLAIN_TOPIC',
    title: 'Explain This Topic (Feynman Technique)',
    shortDesc: 'Simplifies complex concepts using vivid analogies and zero jargon.',
    longDesc: 'Applies Richard Feynman’s famous learning technique: explains the topic as if speaking to a 10-year-old, using intuitive metaphors, everyday analogies, and clear step-by-step logic.',
    category: 'ANALYSIS',
    iconName: 'Smile',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are Richard Feynman himself. Explain the core concept from the uploaded material using the legendary Feynman Technique. Strip away pretension and dense jargon. Use vivid real-world analogies, step-by-step physical intuition, an "Explain Like I'm 5" summary, followed by a bridges-to-technical terminology section.`,
    parameters: [
      {
        name: 'concept',
        label: 'Specific Concept to Demystify',
        type: 'text',
        defaultValue: ''
      }
    ]
  },
  {
    key: 'FLASHCARD_GENERATOR',
    title: 'Flashcard Generator (Interactive & Anki)',
    shortDesc: 'Front/back study cards with hints, difficulty ratings, and tags.',
    longDesc: 'Produces structured digital flashcards ready for interactive digital flipping or export into Anki and Quizlet.',
    category: 'ASSESSMENT',
    iconName: 'CreditCard',
    minTier: 'BASIC',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are an Active Recall and Spaced Repetition Specialist. Create a high-yield deck of digital flashcards from the uploaded document. Each card must have a clear, prompt question on the Front, a concise, accurate answer on the Back, an optional subtle Hint, a Difficulty rating (EASY, MEDIUM, HARD), and a Topic Tag.`,
    parameters: [
      {
        name: 'cardCount',
        label: 'Card Count',
        type: 'select',
        defaultValue: '12',
        options: [
          { label: '8 Cards', value: '8' },
          { label: '12 Cards', value: '12' },
          { label: '20 Cards', value: '20' }
        ]
      }
    ]
  },
  {
    key: 'PRACTICE_TEST_GENERATOR',
    title: 'Practice Test Generator (Timed Mock Exam)',
    shortDesc: 'Mock exam with Sections A, B & C, duration, and scoring rubric.',
    longDesc: 'Generates a complete examination paper simulating formal exam conditions with timed constraints, multiple sections, and an evaluation rubric.',
    category: 'ASSESSMENT',
    iconName: 'Clock',
    minTier: 'PRO',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are a Chief Exam Controller. Create a full-length, formal practice exam based on the uploaded material. Divide the exam into Section A (Objective/Short, 20% marks), Section B (Conceptual & Analytical, 40% marks), and Section C (Application & Problem Solving, 40% marks). Provide total marks, recommended time in minutes, and an official Marking Rubric.`,
    parameters: [
      {
        name: 'durationMinutes',
        label: 'Exam Duration',
        type: 'select',
        defaultValue: '45',
        options: [
          { label: '30 Minutes (Quiz)', value: '30' },
          { label: '45 Minutes (Midterm)', value: '45' },
          { label: '90 Minutes (Final)', value: '90' }
        ]
      }
    ]
  },
  {
    key: 'ASSIGNMENT_ASSISTANT',
    title: 'Assignment and Report Assistant',
    shortDesc: 'Structured academic outlining, thesis development, and draft help.',
    longDesc: 'Guides students and researchers in structuring essays, term papers, and lab reports with thesis framing, paragraph arguments, and literature integration.',
    category: 'WRITING',
    iconName: 'Edit3',
    minTier: 'PRO',
    defaultModel: 'gpt-4o',
    systemPrompt: `You are an Academic Writing Director and Thesis Advisor. Assist the user in constructing a scholarly academic assignment or report based on the uploaded materials. Formulate a strong Thesis Statement, a comprehensive structural outline with talking points per section, suggested empirical evidence, and a sample opening argument draft.`,
    parameters: [
      {
        name: 'assignmentType',
        label: 'Assignment Format',
        type: 'select',
        defaultValue: 'RESEARCH_ESSAY',
        options: [
          { label: 'Research Essay', value: 'RESEARCH_ESSAY' },
          { label: 'Lab / Technical Report', value: 'LAB_REPORT' },
          { label: 'Literature Review', value: 'LIT_REVIEW' }
        ]
      }
    ]
  }
];

export function getToolConfig(key: string): ExtendedToolConfig | undefined {
  return EDUCATIONAL_TOOLS.find((t) => t.key === key);
}
