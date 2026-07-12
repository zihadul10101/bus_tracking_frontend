// ===============================
// Research Model
// ===============================

export interface Research {
  _id: string;

  paperTitle: string;

  fullName: string;

  authors: string[];

  department: string;

  journalName: string;

  publicationYear: number;

  paperLink: string;

  indexing: string;

  keywords: string[];

  createdAt: string;
}

// ===============================
// Top Researcher
// ===============================

export interface TopResearcher {
  _id: string;

  fullName: string;

  department: string;

  role: string;

  publicationCount: number;

  latestPaperTitle: string;
}

// ===============================
// Department Research
// ===============================

export interface DepartmentResearch {
  department: string;

  count: number;

  papers: {
    _id: string;
    paperTitle: string;
    fullName: string;
    journalName: string;
    publicationYear: number;
    paperLink: string;
    indexing: string;
  }[];
}

// ===============================
// Filters
// ===============================

export interface ResearchFilter {
  department?: string;

  year?: number;

  indexing?: string;

  search?: string;

  page?: number;

  limit?: number;
}

// ===============================
// API Responses
// ===============================

export interface ResearchListResponse {
  success: boolean;

  count: number;

  total: number;

  page: number;

  totalPages: number;

  data: Research[];
}

export interface LatestResearchResponse {
  success: boolean;

  count: number;

  data: Research[];
}

export interface TopResearcherResponse {
  success: boolean;

  count: number;

  data: TopResearcher[];
}

export interface DepartmentResearchResponse {
  success: boolean;

  count: number;

  data: DepartmentResearch[];
}

export interface ResearchDetailResponse {
  success: boolean;

  data: Research;
}
// ==========================================
// Supplementary types for research.service.ts
// ==========================================
// Move these into your existing `types/research.ts` whenever convenient —
// they're split out here only so the service file compiles standalone.

export type ResearchStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "changes_requested";

export interface ResearchSubmitPayload {
  paperTitle: string;
  authors: string[] | string;
  journalName: string;
  publicationYear: number | string;
  paperLink?: string;
  indexing?: string;
  keywords?: string[] | string;
  declaration: boolean;
  isDraft?: boolean;
}

export interface ResearchUpdatePayload {
  paperTitle?: string;
  authors?: string[] | string;
  journalName?: string;
  publicationYear?: number | string;
  paperLink?: string;
  indexing?: string;
  keywords?: string[] | string;
  declaration?: boolean;
  isDraft?: boolean;
}

export interface MySubmissionsFilter {
  status?: ResearchStatus;
}

export interface AdminResearchFilter {
  status?: ResearchStatus;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminActionPayload {
  note?: string;
  reason?: string;
}

export interface SingleResearchResponse {
  success: boolean;
  message?: string;
  data: any; // swap for your `Research` type from types/research.ts
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}