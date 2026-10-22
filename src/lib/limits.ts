import { Tier, TierLimitConfig } from '@/types';

export const TIER_LIMITS: Record<Tier, TierLimitConfig> = {
  BASIC: {
    name: 'Basic (Free Forever)',
    maxImagesPerSession: 25, // STRICT REQUIREMENT: up to 25 images per single session
    maxPdfSizeMb: 10,
    dailyAiRequests: 20,
    models: ['gpt-4o-mini', 'gpt-4o'],
    priorityProcessing: false,
    exportFormats: ['MARKDOWN'],
    features: [
      'Upload up to 25 images per session',
      'PDF & Word (.docx) document ingestion',
      'Core AI educational tools & summaries',
      'Standard exam question generator',
      'Fair-use daily limit (20 runs/day)'
    ],
    priceMonthly: 0
  },
  PRO: {
    name: 'Pro Academic',
    maxImagesPerSession: 100,
    maxPdfSizeMb: 50,
    dailyAiRequests: 150,
    models: ['gpt-4o', 'gpt-4o-mini'],
    priorityProcessing: true,
    exportFormats: ['MARKDOWN', 'PDF', 'DOCX'],
    features: [
      'Upload up to 100 images per session',
      '50 MB PDF & textbook processing',
      'All 15+ specialized educational tools',
      'Priority queue & faster AI generation',
      'PDF & Word (.docx) direct exports',
      '150 AI runs / day'
    ],
    priceMonthly: 19
  },
  PREMIUM: {
    name: 'Premium Scholar',
    maxImagesPerSession: 500,
    maxPdfSizeMb: 200,
    dailyAiRequests: 9999,
    models: ['gpt-4o', 'o1-preview', 'o1-mini'],
    priorityProcessing: true,
    exportFormats: ['MARKDOWN', 'PDF', 'DOCX', 'ANKI'],
    features: [
      'Upload up to 500 images per session',
      '200 MB large manuscript & thesis processing',
      'Advanced multi-step agentic reasoning',
      'Anki deck & flashcard exports',
      'Unlimited daily AI requests',
      '3 collaborator seats included'
    ],
    priceMonthly: 49
  },
  INSTITUTIONAL: {
    name: 'Institutional Campus',
    maxImagesPerSession: 1000,
    maxPdfSizeMb: 500,
    dailyAiRequests: 99999,
    models: ['gpt-4o', 'o1-preview'],
    priorityProcessing: true,
    exportFormats: ['MARKDOWN', 'PDF', 'DOCX', 'ANKI'],
    features: [
      'Unlimited image & document batch uploads',
      'Centralized institution admin management',
      'Shared department folders & question banks',
      'Organization-wide analytics & audit logs',
      'Custom LLM prompt fine-tuning & SLA',
      '50+ campus seats with single billing'
    ],
    priceMonthly: 199
  },
  EDUCATOR: {
    name: 'Educator VIP & Super Admin',
    maxImagesPerSession: 500,
    maxPdfSizeMb: 250,
    dailyAiRequests: 99999,
    models: ['gpt-4o', 'o1-preview', 'o1-mini'],
    priorityProcessing: true,
    exportFormats: ['MARKDOWN', 'PDF', 'DOCX', 'ANKI'],
    features: [
      'Super Admin full control & priority processing',
      'Upload up to 500 images per session',
      '250 MB large textbook & manuscript processing',
      'All 15+ specialized educational tools unlocked',
      'Zero quota restrictions & unlimited daily runs',
      'Administrative dashboard and telemetry access'
    ],
    priceMonthly: 0
  }
};

/**
 * Validates whether an upload session conforms to tier limits.
 */
export function validateUploadLimits(
  tier: Tier,
  imageCount: number,
  pdfSizeBytes: number = 0
): { valid: boolean; error?: string } {
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.BASIC;

  if (imageCount > limits.maxImagesPerSession) {
    return {
      valid: false,
      error: `Your current ${limits.name} plan allows up to ${limits.maxImagesPerSession} images per session. You provided ${imageCount} images. Please upgrade to Pro or remove ${imageCount - limits.maxImagesPerSession} images.`
    };
  }

  const maxBytes = limits.maxPdfSizeMb * 1024 * 1024;
  if (pdfSizeBytes > maxBytes) {
    return {
      valid: false,
      error: `Document size exceeds your ${limits.name} limit of ${limits.maxPdfSizeMb}MB.`
    };
  }

  return { valid: true };
}
