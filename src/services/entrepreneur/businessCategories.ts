export const BUSINESS_CATEGORIES = [
  'food',
  'fashion',
  'technology',
  'education',
  'health',
  'beauty',
  'sports',
  'entertainment',
  'services',
  'other',
] as const;

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number];