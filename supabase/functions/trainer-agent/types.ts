
// Types for the trainer agent
export interface AgentOutfit {
  top?: any;
  bottom?: any;
  shoes?: any;
  coat?: any;
  score?: number;
  description?: string;
  recommendations?: string[];
  occasion?: 'work' | 'casual' | 'weekend' | 'date night' | 'general';
}

export interface AgentResult {
  agent: string;
  output: AgentOutfit;
  timestamp?: string;
}

export interface TrainerAgentResponse {
  success: boolean;
  status: string;
  results: AgentResult[];
  message?: string;
}

// Our agent names
export const AGENT_NAMES = [
  'classic-style-agent',
  'modern-minimalist-agent', 
  'trend-spotter-agent',
  'color-harmony-agent',
  'body-shape-expert-agent'
];
