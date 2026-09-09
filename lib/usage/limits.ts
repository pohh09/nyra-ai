export interface UsageLimitConfig {
  aiRequests: number;
  webSearches: number;
  imageRequests: number;
  pdfRequests: number;
}

export const USAGE_LIMITS: {
  free: UsageLimitConfig;
  guest: UsageLimitConfig;
  warningThreshold: number;
} = {
  free: {
    aiRequests: 20,
    webSearches: 10,
    imageRequests: 5,
    pdfRequests: 5,
  },
  guest: {
    aiRequests: 8,
    webSearches: 4,
    imageRequests: 3,
    pdfRequests: 3,
  },
  warningThreshold: 0.8, // 80%
};

export type FeatureType = 'aiRequests' | 'webSearches' | 'imageRequests' | 'pdfRequests';
