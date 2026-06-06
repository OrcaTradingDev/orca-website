/* src/features/portal/types/portal.ts
   Domain types for the OrcaBot client portal.
*/

export type RiskCategory = 'safe' | 'aggressive';

export type KnowledgeCategory =
  | 'getting-started'
  | 'risk-management'
  | 'advanced-strategies'
  | 'ctrader-guides'
  | 'updates';

export interface KnowledgeItem {
  id:          string;
  title:       string;
  description: string;
  category:    KnowledgeCategory;
  fileType:    'pdf' | 'video' | 'article';
  pages?:      number;
  duration?:   string; // e.g. "12 min"
  updatedAt:   string; // ISO date string
  isNew?:      boolean;
}

export interface CbotSet {
  id:          string;
  name:        string;
  description: string;
  risk:        RiskCategory;
  version:     string;
  fileSize:    string;  // e.g. "2.4 MB"
  updatedAt:   string;
  downloadUrl: string;
  pairs:       string[];   // e.g. ["EUR/USD", "GBP/USD"]
  timeframes:  string[];   // e.g. ["H1", "H4"]
  winRate?:    string;
}

export interface PortalUser {
  id:           string;
  name:         string;
  email:        string;
  picture?:     string | null;
  purchasedAt:  string;
  plan:         'orcabot-standard' | 'orcabot-vip';
  isActive:     boolean;
  discordLinked: boolean;
}
