export type Role = 'STUDENT' | 'EDUCATOR' | 'INSTITUTION_ADMIN' | 'SUPER_ADMIN';

export type Tier = 'BASIC' | 'PRO' | 'PREMIUM' | 'INSTITUTIONAL' | 'EDUCATOR';

export type ToolType =
  | 'IMPORTANT_QUESTIONS'
  | 'SUMMARIZE_TOPIC'
  | 'SUMMARIZE_CHAPTER'
  | 'QUICK_SUMMARY'
  | 'DETAILED_REPORT'
  | 'IMPORTANT_POINTS_NOTES'
  | 'QA_GENERATOR'
  | 'MCQ_GENERATOR'
  | 'SHORT_LONG_ANSWERS'
  | 'REVISION_NOTES'
  | 'TOPIC_WISE_ANALYSIS'
  | 'EXPLAIN_TOPIC'
  | 'FLASHCARD_GENERATOR'
  | 'PRACTICE_TEST_GENERATOR'
  | 'ASSIGNMENT_ASSISTANT';

export interface UserSession {
  id: string; // Firebase UID
  uid?: string;
  name: string | null;
  displayName?: string | null;
  email: string;
  role: Role;
  tier: Tier;
  subscriptionTier?: Tier;
  subscriptionStatus?: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELLED';
  institutionId?: string | null;
}

export interface TierLimitConfig {
  name: string;
  maxImagesPerSession: number;
  maxPdfSizeMb: number;
  dailyAiRequests: number;
  models: string[];
  priorityProcessing: boolean;
  exportFormats: ('MARKDOWN' | 'PDF' | 'DOCX' | 'ANKI')[];
  features: string[];
  priceMonthly: number;
}

export interface ToolDefinition {
  key: ToolType;
  title: string;
  shortDesc: string;
  longDesc: string;
  category: 'EXAM_PREP' | 'SUMMARIES' | 'ANALYSIS' | 'ASSESSMENT' | 'WRITING';
  iconName: string;
  minTier: Tier;
  defaultModel: string;
  parameters: {
    name: string;
    label: string;
    type: 'select' | 'number' | 'text' | 'boolean';
    defaultValue: any;
    options?: { label: string; value: any }[];
  }[];
}

export interface UploadedFileItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl?: string;
  extractedText?: string;
  orderIndex: number;
  status: 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  progress?: number;
}

export interface GenerationRecord {
  id: string;
  toolType: ToolType;
  parameters: any;
  resultData: any;
  tokensUsed: number;
  modelName: string;
  durationMs: number;
  bookmarked: boolean;
  folderId?: string | null;
  createdAt: string;
  sessionId?: string | null;
}
