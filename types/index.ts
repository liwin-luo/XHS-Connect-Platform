// Shared types matching the Chrome extension's src/shared/types.ts
// These are used by both the API routes and the landing page

export interface ScoreWeights {
  engagement: number;
  popularity: number;
  activity: number;
}

export interface BrandProfile {
  name: string;
  category: string;
  website: string;
  description: string;
}

export interface NoteInfo {
  id: string;
  title: string;
  likes: number;
  collects: number;
  comments: number;
  cover: string;
}

export interface ScoreBreakdown {
  engagement: number;
  popularity: number;
  activity: number;
}

export interface KOL {
  id: string;
  name: string;
  avatar: string;
  desc: string;
  url: string;
  followers: number;
  following: number;
  notes_count: number;
  avg_likes: number;
  avg_collects: number;
  avg_comments: number;
  engagement_rate: number;
  category: string;
  score: number;
  score_breakdown: ScoreBreakdown;
  recent_notes: NoteInfo[];
  tags: string[];
  added_at: string;
  updated_at: string;
  notes?: string;
}

export type WishlistStatus =
  | 'pending'
  | 'contacted'
  | 'negotiating'
  | 'confirmed'
  | 'completed'
  | 'archived';

export interface ContactLog {
  timestamp: string;
  type: 'note' | 'message' | 'email' | 'other';
  content: string;
}

export interface WishlistItem {
  id: string;
  kol: KOL;
  status: WishlistStatus;
  notes: string;
  tags: string[];
  estimated_budget: number;
  last_contacted: string;
  contact_history: ContactLog[];
  created_at: string;
  updated_at: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  brandName: string;
  productName: string;
  sellingPoints: string;
  format: string;
  budget: string;
  toneStyle: ToneStyle;
  createdAt: string;
}

export type ToneStyle = 'professional' | 'friendly' | 'casual' | 'concise';

export const TONE_STYLE_LABELS: Record<ToneStyle, string> = {
  professional: '专业正式',
  friendly: '轻松友好',
  casual: '热情种草',
  concise: '简洁高效',
};

export interface OutreachMessage {
  id: string;
  kolId: string;
  kolName: string;
  message: string;
  toneStyle: ToneStyle;
  status: 'draft' | 'approved' | 'sent' | 'followed_up' | 'replied' | 'converted' | 'failed';
  sentAt?: string;
  replyAt?: string;
  replyText?: string;
  aiIntent?: 'interested' | 'not_interested' | 'need_info' | 'busy' | 'unknown';
  followUpAt?: string;
  followUpMessage?: string;
}

export interface PluginSettings {
  brand: BrandProfile | null;
  theme: 'light' | 'dark';
  auto_score: boolean;
  score_weights: ScoreWeights;
}

export interface LLMConfig {
  provider: 'mock' | 'openai' | 'deepseek';
  apiKey: string;
  model: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
