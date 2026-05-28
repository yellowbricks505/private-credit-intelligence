export interface Analyst {
  id: string
  name: string
  initials: string
  color: string
  portfolio: string[]
  sectors: string[]
}

export type Relevance = 'high' | 'medium' | 'low'
export type ArticleCategory =
  | 'deals-lbos'
  | 'macro'
  | 'pricing'
  | 'credit'
  | 'infrastructure'
  | 'real-estate'
  | 'funds-lps'
  | 'general'

export interface PortfolioLink {
  borrower: string
  analystId: string
  analystInitials: string
}

export interface Article {
  id: string
  headline: string
  source: string
  sourceType: 'afr' | 'smh' | 'paywalled' | 'free'
  url?: string
  publishedAt?: string
  summary: string
  relevance: Relevance
  category: ArticleCategory
  portfolioLinks: PortfolioLink[]
  isWatch: boolean
  creditRelevanceNote?: string
}

export interface PricingCell {
  label: string
  content: string
  trend?: 'tighter' | 'wider' | 'stable' | 'mixed'
}

export interface MarketFeedData {
  date: string
  overnightBriefing: string
  pricingCells: PricingCell[]
  articles: Article[]
  generatedAt: string
}

export interface PortfolioSentiment {
  borrower: string
  sentiment: 'positive' | 'cautious' | 'negative' | 'neutral'
  hasRecentAlert: boolean
  note?: string
}

export interface AnalystSentiment {
  analystId: string
  items: PortfolioSentiment[]
  generatedAt: string
}

export interface AnalystIntelligenceArticle {
  id: string
  headline: string
  source: string
  summary: string
  relevance: Relevance
  borrowerTag?: string
  creditRelevanceNote: string
  section: 'direct' | 'sector' | 'international'
}

export interface AnalystIntelligenceData {
  analystId: string
  date: string
  briefingSummary: string
  articles: AnalystIntelligenceArticle[]
  generatedAt: string
}

export type FilterTab =
  | 'all'
  | 'portfolio-linked'
  | 'deals-lbos'
  | 'macro'
  | 'pricing'
  | 'credit'
  | 'infrastructure'
  | 'real-estate'
  | 'funds-lps'
